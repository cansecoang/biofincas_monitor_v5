import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const indicatorCode = searchParams.get('indicator_code');
    if (!indicatorCode) {
      return NextResponse.json({ error: 'indicator_code is required' }, { status: 400 });
    }

    // DEBUG: Primero consultar solo la tabla indicators
    const debugQuery = `SELECT * FROM indicators WHERE indicator_code = $1`;
    const debugResult = await pool.query(debugQuery, [indicatorCode]);
    console.log('🔍 DEBUG - Indicator raw data:', debugResult.rows[0]);

    // Buscar el indicador por indicator_code
    const indicatorQuery = `
      SELECT i.indicator_id, i.indicator_code, i.indicator_name, COALESCE(i.indicator_description, '') as indicator_description,
             i.workpackage_id, COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name,
             i.output_number, COALESCE(o.output_name, 'Sin Output') as output_name,
             COUNT(DISTINCT pi.product_id) as assigned_products_count,
             COUNT(t.task_id) as total_tasks,
             COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) as completed_tasks,
             COUNT(CASE WHEN t.end_date_planned < CURRENT_DATE AND s.status_name NOT IN ('Completed', 'Reviewed') THEN 1 END) as overdue_tasks,
             ROUND((COUNT(CASE WHEN s.status_name IN ('Completed', 'Reviewed') THEN 1 END) * 100.0 / NULLIF(COUNT(t.task_id), 0)), 1) as completion_percentage
      FROM indicators i
      LEFT JOIN workpackages wp ON i.workpackage_id = wp.workpackage_id
      LEFT JOIN outputs o ON i.output_number = o.output_id
      LEFT JOIN product_indicators pi ON i.indicator_id = pi.indicator_id
      LEFT JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE i.indicator_code = $1
      GROUP BY i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description, i.workpackage_id, wp.workpackage_name, i.output_number, o.output_name
      LIMIT 1
    `;
    const indicatorResult = await pool.query(indicatorQuery, [indicatorCode]);
    console.log('🔍 DEBUG - Query result:', indicatorResult.rows[0]);
    if (indicatorResult.rows.length === 0) {
      return NextResponse.json({ error: 'Indicator not found' }, { status: 404 });
    }
    const row = indicatorResult.rows[0];

    // Obtener productos asignados
    const productsQuery = `
      SELECT p.product_id, p.product_name, COALESCE(c.country_name, 'Sin país') as country_name, COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name
      FROM product_indicators pi
      INNER JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      LEFT JOIN workpackages wp ON p.workpackage_id = wp.workpackage_id
      WHERE pi.indicator_id = $1
      ORDER BY p.product_name
    `;
    const productsResult = await pool.query(productsQuery, [row.indicator_id]);

    // Obtener distribución de estados
    const statusQuery = `
      SELECT s.status_name, COUNT(t.task_id) as count,
        ROUND((COUNT(t.task_id) * 100.0 / NULLIF(SUM(COUNT(t.task_id)) OVER (), 0)), 1) as percentage
      FROM product_indicators pi
      INNER JOIN products p ON pi.product_id = p.product_id
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE pi.indicator_id = $1 AND s.status_name IS NOT NULL
      GROUP BY s.status_name
      ORDER BY count DESC
    `;
    const statusResult = await pool.query(statusQuery, [row.indicator_id]);

    // Construir objeto IndicatorPerformance
    const indicator: any = {
      indicator_id: row.indicator_id,
      indicator_code: row.indicator_code,
      indicator_name: row.indicator_name,
      indicator_description: row.indicator_description,
      workpackage_id: row.workpackage_id,
      workpackage_name: row.workpackage_name,
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
    
    console.log('📦 Final indicator object:', indicator);

    return NextResponse.json({ success: true, indicator });
  } catch (error) {
    console.error('❌ Error in indicator-detail API:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
