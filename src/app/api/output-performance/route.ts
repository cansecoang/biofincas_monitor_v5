import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');
    const organizationFilter = searchParams.get('organization');

    console.log('🎯 Output Performance API called with filters:', { outputFilter, organizationFilter });

    if (!outputFilter) {
      return NextResponse.json({ error: 'Output parameter is required' }, { status: 400 });
    }

    // 🎯 QUERY SIMPLIFICADA: Obtener indicadores con métricas básicas por output
    let paramIndex = 2;
    let productWhereConditions = '';   // Condiciones para filtrar productos
    
    // Filtro de organization: aplicar a productos
    if (organizationFilter && organizationFilter !== 'all') {
      productWhereConditions += ` AND p.product_owner_id = $${paramIndex}`;
      paramIndex++;
    }

    const baseQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        COALESCE(i.indicator_description, '') as indicator_description,
        i.output_number,
        COALESCE(o.output_name, 'Sin Output') as output_name,
        COUNT(DISTINCT pi.product_id) as assigned_products_count,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('Completed', 'Reviewed') THEN 1 END) as overdue_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) * 100.0 / 
           NULLIF(COUNT(t.task_id), 0)), 1
        ) as completion_percentage
      FROM indicators i
      LEFT JOIN outputs o ON i.output_number = o.output_number
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id ${productWhereConditions.replace('AND', 'AND')}
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE i.output_number = $1
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_description, i.output_number, o.output_name
      ORDER BY 
        -- Ordenamiento natural: primero por la parte numérica antes del punto
        CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER),
        -- Luego por la parte numérica después del punto
        CAST(SPLIT_PART(i.indicator_code, '.', 2) AS INTEGER)
    `;

    const queryParams: any[] = [outputFilter];
    if (organizationFilter && organizationFilter !== 'all') {
      queryParams.push(organizationFilter);
    }

    console.log('🔍 Executing main query with params:', queryParams);
    const result = await pool.query(baseQuery, queryParams);
    
    console.log('📊 Main query result:', result.rows);

    // 🎯 Para cada indicador, obtener productos asignados
    const indicators = await Promise.all(result.rows.map(async (row) => {
      // Construir WHERE conditions para sub-queries
      let subParamIndex = 2;
      let subWhereConditions = '';
      
      if (organizationFilter && organizationFilter !== 'all') {
        subWhereConditions += ` AND p.product_owner_id = $${subParamIndex}`;
        subParamIndex++;
      }

      // Obtener productos asignados a este indicador
      const productsQuery = `
        SELECT 
          p.product_id,
          p.product_name,
          COALESCE(org.organization_name, 'Sin organización') as organization_name
        FROM product_indicators pi
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
        WHERE pi.indicator_id = $1
        ${subWhereConditions}
        ORDER BY p.product_name
      `;
      
      const productsParams: any[] = [row.indicator_id];
      if (organizationFilter && organizationFilter !== 'all') {
        productsParams.push(organizationFilter);
      }
      
      const productsResult = await pool.query(productsQuery, productsParams);

      // Obtener distribución de estados para este indicador
      const statusQuery = `
        SELECT 
          s.status_name,
          COUNT(t.task_id) as count,
          ROUND(
            (COUNT(t.task_id) * 100.0 / 
             NULLIF(SUM(COUNT(t.task_id)) OVER (), 0)), 1
          ) as percentage
        FROM product_indicators pi
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE pi.indicator_id = $1
        ${subWhereConditions}
        AND s.status_name IS NOT NULL
        GROUP BY s.status_name
        ORDER BY count DESC
      `;
      
      const statusResult = await pool.query(statusQuery, productsParams);

      return {
        indicator_id: row.indicator_id,
        indicator_code: row.indicator_code,
        indicator_description: row.indicator_description,
        output_number: parseInt(row.output_number) || 0,
        output_name: row.output_name || 'Sin Output',
        assigned_products_count: parseInt(row.assigned_products_count) || 0,
        assigned_products: productsResult.rows,
        total_tasks: parseInt(row.total_tasks) || 0,
        completed_tasks: parseInt(row.completed_tasks) || 0,
        completion_percentage: parseFloat(row.completion_percentage) || 0,
        overdue_tasks: parseInt(row.overdue_tasks) || 0,
        status_distribution: statusResult.rows,
        trend: parseFloat(row.completion_percentage) >= 75 ? 'up' : 
               parseFloat(row.completion_percentage) >= 50 ? 'stable' : 'down',
        performance_rating: parseFloat(row.completion_percentage) >= 90 ? 'excellent' :
                           parseFloat(row.completion_percentage) >= 75 ? 'good' :
                           parseFloat(row.completion_percentage) >= 50 ? 'warning' : 'critical'
      };
    }));

    // 🎯 Calcular métricas de productos
    console.log('🔍 Starting product metrics calculation...');
    const allProducts = new Set<number>();
    const productsWithAllTasksCompleted = new Set<number>();
    const productsWithOverdueTasks = new Set<number>();
    
    // Mapas para almacenar información detallada de productos
    const allProductsDetails: any[] = [];
    const completedProductsDetails: any[] = [];
    const inProgressProductsDetails: any[] = [];
    const overdueProductsDetails: any[] = [];
    
    indicators.forEach(ind => {
      ind.assigned_products.forEach(product => {
        allProducts.add(product.product_id);
      });
    });

    console.log('📊 Total unique products found:', allProducts.size);

    // Obtener productos con todas las tareas completadas y con tareas vencidas
    if (allProducts.size > 0) {
      const productIds = Array.from(allProducts);
      console.log('🔍 Product IDs to query:', productIds);
      
      // Query para obtener información detallada de productos con métricas de tareas
      const productDetailsQuery = `
        SELECT 
          p.product_id,
          p.product_name,
          p.delivery_date,
          COALESCE(org.organization_name, 'Sin asignar') as product_owner,
          COALESCE(org.organization_name, 'Sin organización') as organization_name,
          COUNT(t.task_id) as total_tasks,
          COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('Completed', 'Reviewed') THEN 1 END) as overdue_tasks
        FROM products p
        LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        WHERE p.product_id = ANY($1)
        GROUP BY p.product_id, p.product_name, p.delivery_date, org.organization_name
        ORDER BY p.product_name
      `;
      
      console.log('🚀 Executing product details query...');
      const productDetailsResult = await pool.query(productDetailsQuery, [productIds]);
      console.log('✅ Query executed successfully. Rows returned:', productDetailsResult.rows.length);
      
      if (productDetailsResult.rows.length > 0) {
        console.log('📋 Sample row:', productDetailsResult.rows[0]);
      }
      
      productDetailsResult.rows.forEach(row => {
        const totalTasks = parseInt(row.total_tasks) || 0;
        const completedTasks = parseInt(row.completed_tasks) || 0;
        const overdueTasks = parseInt(row.overdue_tasks) || 0;
        
        const productDetail = {
          product_id: row.product_id,
          product_name: row.product_name,
          product_owner: row.product_owner,
          organization_name: row.organization_name,
          delivery_date: row.delivery_date
        };
        
        // Todos los productos
        allProductsDetails.push(productDetail);
        
        // Productos completados (tienen tareas y todas están completadas)
        if (totalTasks > 0 && completedTasks === totalTasks) {
          productsWithAllTasksCompleted.add(row.product_id);
          completedProductsDetails.push(productDetail);
        } 
        // Productos en progreso (tienen tareas pero no todas completadas)
        else if (totalTasks > 0) {
          inProgressProductsDetails.push(productDetail);
        }
        
        // Productos con retrasos
        if (overdueTasks > 0) {
          productsWithOverdueTasks.add(row.product_id);
          overdueProductsDetails.push(productDetail);
        }
      });
      
      console.log('📊 Product metrics calculated:');
      console.log('  - All products:', allProductsDetails.length);
      console.log('  - Completed:', completedProductsDetails.length);
      console.log('  - In progress:', inProgressProductsDetails.length);
      console.log('  - With overdue:', overdueProductsDetails.length);
    }

    // 🎯 Calcular métricas resumen
    const summary = {
      total_indicators: indicators.length,
      avg_completion: indicators.length > 0 ? 
        indicators.reduce((acc, ind) => acc + ind.completion_percentage, 0) / indicators.length : 0,
      total_tasks: indicators.reduce((acc, ind) => acc + ind.total_tasks, 0),
      completed_tasks: indicators.reduce((acc, ind) => acc + ind.completed_tasks, 0),
      overdue_tasks: indicators.reduce((acc, ind) => acc + ind.overdue_tasks, 0),
      // Métricas de productos
      total_products: allProducts.size,
      products_completed: productsWithAllTasksCompleted.size,
      products_in_progress: allProducts.size - productsWithAllTasksCompleted.size,
      products_with_overdue: productsWithOverdueTasks.size,
      // Detalles de productos para los modales
      all_products_details: allProductsDetails,
      completed_products_details: completedProductsDetails,
      in_progress_products_details: inProgressProductsDetails,
      overdue_products_details: overdueProductsDetails,
    };

    const responseData = {
      output_number: outputFilter,
      indicators,
      summary,
      filters: {
        output: outputFilter,
        organization: organizationFilter
      }
    };

    console.log('✅ Final response data summary:', {
      output: responseData.output_number,
      indicators_count: responseData.indicators.length,
      summary_counts: {
        total_products: responseData.summary.total_products,
        products_completed: responseData.summary.products_completed,
        products_in_progress: responseData.summary.products_in_progress,
        products_with_overdue: responseData.summary.products_with_overdue,
      },
      product_details_arrays: {
        all_products_details: responseData.summary.all_products_details.length,
        completed_products_details: responseData.summary.completed_products_details.length,
        in_progress_products_details: responseData.summary.in_progress_products_details.length,
        overdue_products_details: responseData.summary.overdue_products_details.length,
      }
    });
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error in output performance API:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}