import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const outputNumber = searchParams.get('output');

    if (!outputNumber) {
      return NextResponse.json(
        { success: false, error: 'Output number is required' },
        { status: 400 }
      );
    }

    // Query para obtener indicadores con su progreso basado en tareas completadas
    // Incluye indicadores sin productos asignados
    const query = `
      WITH all_indicators AS (
        SELECT 
          i.indicator_id,
          i.indicator_code,
          i.indicator_name,
          i.workpackage_id
        FROM indicators i
        WHERE CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $1
      ),
      indicator_stats AS (
        SELECT 
          ai.indicator_id,
          ai.indicator_code,
          ai.indicator_name,
          ai.workpackage_id,
          p.product_id,
          p.product_name,
          COUNT(t.task_id) as total_tasks,
          COUNT(CASE WHEN s.status_name IN ('Completed', 'Finalizado', 'Done') THEN 1 END) as completed_tasks,
          CASE 
            WHEN COUNT(t.task_id) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN s.status_name IN ('Completed', 'Finalizado', 'Done') THEN 1 END)::numeric / COUNT(t.task_id)::numeric) * 100, 0)
          END as product_completion_percentage
        FROM all_indicators ai
        LEFT JOIN product_indicators pi ON ai.indicator_id = pi.indicator_id
        LEFT JOIN products p ON pi.product_id = p.product_id
        LEFT JOIN tasks t ON p.product_id = t.product_id
        LEFT JOIN status s ON t.status_id = s.status_id
        GROUP BY ai.indicator_id, ai.indicator_code, ai.indicator_name, ai.workpackage_id, p.product_id, p.product_name
      ),
      indicator_performance AS (
        SELECT 
          indicator_id,
          indicator_code,
          indicator_name,
          workpackage_id,
          COUNT(DISTINCT product_id) FILTER (WHERE product_id IS NOT NULL) as assigned_products_count,
          COALESCE(ROUND(AVG(product_completion_percentage) FILTER (WHERE product_id IS NOT NULL), 0), 0) as completion_percentage
        FROM indicator_stats
        GROUP BY indicator_id, indicator_code, indicator_name, workpackage_id
      )
      SELECT 
        ip.*,
        wp.workpackage_name,
        wp.workpackage_description
      FROM indicator_performance ip
      LEFT JOIN workpackages wp ON ip.workpackage_id = wp.workpackage_id
      ORDER BY wp.workpackage_name, ip.indicator_code
    `;

    const result = await pool.query(query, [outputNumber]);

    // Agrupar por workpackage
    const workpackages: Record<string, any> = {};
    
    result.rows.forEach((row) => {
      const wpName = row.workpackage_name || 'Unassigned';
      
      if (!workpackages[wpName]) {
        workpackages[wpName] = {
          workpackage_id: row.workpackage_id,
          workpackage_name: wpName,
          workpackage_description: row.workpackage_description,
          indicators: []
        };
      }
      
      workpackages[wpName].indicators.push({
        indicator_id: row.indicator_id,
        indicator_code: row.indicator_code,
        indicator_name: row.indicator_name,
        assigned_products_count: parseInt(row.assigned_products_count),
        completion_percentage: parseFloat(row.completion_percentage)
      });
    });

    // Convertir a array
    const workpackageArray = Object.values(workpackages);

    return NextResponse.json({
      success: true,
      output_number: outputNumber,
      workpackages: workpackageArray,
      total_indicators: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching output workpackage progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

