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

    // Obtener distribución de tareas por fase
    const query = `
      SELECT 
        ph.phase_name,
        COUNT(t.task_id) as task_count
      FROM phases ph
      LEFT JOIN tasks t ON ph.phase_id = t.phase_id AND t.product_id = $1
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
      phases: result.rows
    });

  } catch (error) {
    console.error('Error fetching product phases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
