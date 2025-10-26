import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const outputFilter = searchParams.get('output');
    const workPackageFilter = searchParams.get('workPackage');
    const countryFilter = searchParams.get('country');

    console.log('🎯 Output Performance API called with filters:', { outputFilter, workPackageFilter, countryFilter });

    if (!outputFilter) {
      return NextResponse.json({ error: 'Output parameter is required' }, { status: 400 });
    }

    // 🎯 QUERY SIMPLIFICADA: Obtener indicadores con métricas básicas por output
    let paramIndex = 2;
    let indicatorWhereConditions = ''; // Condiciones para filtrar indicadores directamente
    let productWhereConditions = '';   // Condiciones para filtrar productos
    
    // Filtro de workPackage: aplicar a indicadores
    if (workPackageFilter && workPackageFilter !== 'all') {
      indicatorWhereConditions += ` AND i.workpackage_id = $${paramIndex}`;
      paramIndex++;
    }
    
    // Filtro de country: aplicar a productos
    if (countryFilter && countryFilter !== 'all') {
      productWhereConditions += ` AND p.country_id = $${paramIndex}`;
      paramIndex++;
    }

    const baseQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        i.indicator_name,
        COALESCE(i.indicator_description, '') as indicator_description,
        i.output_number,
        i.workpackage_id,
        COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name,
        COUNT(DISTINCT pi.product_id) as assigned_products_count,
        COUNT(t.task_id) as total_tasks,
        COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('Completed', 'Reviewed') THEN 1 END) as overdue_tasks,
        ROUND(
          (COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) * 100.0 / 
           NULLIF(COUNT(t.task_id), 0)), 1
        ) as completion_percentage
      FROM indicators i
      LEFT JOIN workpackages wp ON i.workpackage_id = wp.workpackage_id
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id ${productWhereConditions.replace('AND', 'AND')}
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE i.output_number = $1 ${indicatorWhereConditions}
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description, i.output_number, i.workpackage_id, wp.workpackage_name
      ORDER BY 
        -- Ordenamiento natural: primero por la parte numérica antes del punto
        CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER),
        -- Luego por la parte numérica después del punto
        CAST(SPLIT_PART(i.indicator_code, '.', 2) AS INTEGER)
    `;

    const queryParams: any[] = [outputFilter];
    if (workPackageFilter && workPackageFilter !== 'all') {
      queryParams.push(workPackageFilter);
    }
    if (countryFilter && countryFilter !== 'all') {
      queryParams.push(countryFilter);
    }

    console.log('🔍 Executing main query with params:', queryParams);
    const result = await pool.query(baseQuery, queryParams);
    
    console.log('📊 Main query result:', result.rows);

    // 🎯 Para cada indicador, obtener productos asignados
    const indicators = await Promise.all(result.rows.map(async (row) => {
      // Construir WHERE conditions para sub-queries (solo country, workpackage ya se filtró en indicadores)
      let subParamIndex = 2;
      let subWhereConditions = '';
      
      if (countryFilter && countryFilter !== 'all') {
        subWhereConditions += ` AND p.country_id = $${subParamIndex}`;
        subParamIndex++;
      }

      // Obtener productos asignados a este indicador
      const productsQuery = `
        SELECT 
          p.product_id,
          p.product_name,
          COALESCE(c.country_name, 'Sin país') as country_name,
          COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name
        FROM product_indicators pi
        INNER JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN countries c ON p.country_id = c.country_id
        LEFT JOIN workpackages wp ON p.workpackage_id = wp.workpackage_id
        WHERE pi.indicator_id = $1
        ${subWhereConditions}
        ORDER BY p.product_name
      `;
      
      const productsParams: any[] = [row.indicator_id];
      if (countryFilter && countryFilter !== 'all') {
        productsParams.push(countryFilter);
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
        indicator_name: row.indicator_name,
        indicator_description: row.indicator_description,
        workpackage_name: row.workpackage_name,
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

    // 🎯 Calcular métricas resumen
    const summary = {
      total_indicators: indicators.length,
      avg_completion: indicators.length > 0 ? 
        indicators.reduce((acc, ind) => acc + ind.completion_percentage, 0) / indicators.length : 0,
      total_tasks: indicators.reduce((acc, ind) => acc + ind.total_tasks, 0),
      completed_tasks: indicators.reduce((acc, ind) => acc + ind.completed_tasks, 0),
      overdue_tasks: indicators.reduce((acc, ind) => acc + ind.overdue_tasks, 0),
    };

    const responseData = {
      output_number: outputFilter,
      indicators,
      summary,
      filters: {
        output: outputFilter,
        workPackage: workPackageFilter,
        country: countryFilter
      }
    };

    console.log('✅ Final response data:', responseData);
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Error in output performance API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}