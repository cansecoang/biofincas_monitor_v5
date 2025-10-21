import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    // Obtener resumen del producto
    const summaryQuery = `
      SELECT 
        p.product_name,
        COUNT(t.task_id) as total_tasks,
        SUM(CASE WHEN s.status_name = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN s.status_name = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN s.status_name NOT IN ('Completed', 'In Progress') THEN 1 ELSE 0 END) as pending_tasks,
        ROUND(
          (SUM(CASE WHEN s.status_name = 'Completed' THEN 1 ELSE 0 END)::numeric / 
           NULLIF(COUNT(t.task_id), 0) * 100), 
          2
        ) as completion_percentage
      FROM products p
      LEFT JOIN tasks t ON p.product_id = t.product_id
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE p.product_id = $1
      GROUP BY p.product_id, p.product_name
    `;

    const summaryResult = await pool.query(summaryQuery, [productId]);

    if (summaryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productSummary = summaryResult.rows[0];

    // Obtener distribución por estado
    const statusQuery = `
      SELECT 
        s.status_name as name,
        COUNT(t.task_id)::text as value,
        ROUND(
          (COUNT(t.task_id)::numeric / 
           (SELECT COUNT(*) FROM tasks WHERE product_id = $1) * 100), 
          2
        )::text as percentage
      FROM tasks t
      JOIN status s ON t.status_id = s.status_id
      WHERE t.product_id = $1
      GROUP BY s.status_name
      ORDER BY COUNT(t.task_id) DESC
    `;

    const statusResult = await pool.query(statusQuery, [productId]);

    return NextResponse.json({
      productSummary,
      statusDistribution: statusResult.rows
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
