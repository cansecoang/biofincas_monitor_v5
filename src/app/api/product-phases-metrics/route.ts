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

    // Obtener métricas por fase con tareas completadas
    const query = `
      SELECT 
        ph.phase_name as name,
        COUNT(t.task_id) as total,
        SUM(CASE WHEN s.status_name = 'Completed' THEN 1 ELSE 0 END) as completadas
      FROM phases ph
      LEFT JOIN tasks t ON ph.phase_id = t.phase_id AND t.product_id = $1
      LEFT JOIN status s ON t.status_id = s.status_id
      WHERE ph.phase_id IN (
        SELECT DISTINCT phase_id 
        FROM tasks 
        WHERE product_id = $1 AND phase_id IS NOT NULL
      )
      GROUP BY ph.phase_id, ph.phase_name
      ORDER BY ph.phase_id
    `;

    const result = await pool.query(query, [productId]);

    return NextResponse.json({
      phaseMetrics: result.rows
    });

  } catch (error) {
    console.error('Error fetching phase metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
