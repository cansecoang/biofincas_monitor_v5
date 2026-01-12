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
          i.indicator_description
        FROM indicators i
        WHERE CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $1
      ),
      indicator_stats AS (
        SELECT 
          ai.indicator_id,
          ai.indicator_code,
          ai.indicator_description,
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
        GROUP BY ai.indicator_id, ai.indicator_code, ai.indicator_description, p.product_id, p.product_name
      ),
      indicator_performance AS (
        SELECT 
          indicator_id,
          indicator_code,
          indicator_description,
          COUNT(DISTINCT product_id) FILTER (WHERE product_id IS NOT NULL) as assigned_products_count,
          COALESCE(ROUND(AVG(product_completion_percentage) FILTER (WHERE product_id IS NOT NULL), 0), 0) as completion_percentage
        FROM indicator_stats
        GROUP BY indicator_id, indicator_code, indicator_description
      )
      SELECT 
        ip.*
      FROM indicator_performance ip
      ORDER BY 
        CAST(SPLIT_PART(ip.indicator_code, '.', 1) AS INTEGER),
        CAST(SPLIT_PART(ip.indicator_code, '.', 2) AS INTEGER)
    `;

    const result = await pool.query(query, [outputNumber]);

    // Convertir a array de indicadores
    const indicators = result.rows.map((row) => ({
      indicator_id: row.indicator_id,
      indicator_code: row.indicator_code,
      indicator_description: row.indicator_description,
      assigned_products_count: parseInt(row.assigned_products_count),
      completion_percentage: parseFloat(row.completion_percentage)
    }));

    return NextResponse.json({
      success: true,
      output_number: outputNumber,
      indicators: indicators,
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

