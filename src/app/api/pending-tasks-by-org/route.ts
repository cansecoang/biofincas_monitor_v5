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

    // Calcular total de tareas pendientes primero
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      JOIN status s ON t.status_id = s.status_id
      WHERE t.product_id = $1
        AND s.status_name NOT IN ('Completed', 'Cancelled')
    `;
    const totalResult = await pool.query(totalQuery, [productId]);
    const totalPendingTasks = parseInt(totalResult.rows[0].total || '0');

    // Si no hay tareas pendientes, retornar vacío
    if (totalPendingTasks === 0) {
      return NextResponse.json({
        pendingTasksByOrg: [],
        totalPendingTasks: 0
      });
    }

    // Obtener tareas pendientes agrupadas por organización
    const query = `
      SELECT 
        COALESCE(o.organization_name, 'Sin asignar') as organization,
        COUNT(t.task_id)::integer as pending_count,
        ROUND((COUNT(t.task_id)::numeric / $2 * 100), 2) as percentage
      FROM tasks t
      JOIN status s ON t.status_id = s.status_id
      LEFT JOIN organizations o ON t.responsable_id = o.organization_id
      WHERE t.product_id = $1
        AND s.status_name NOT IN ('Completed', 'Cancelled')
      GROUP BY o.organization_name
      ORDER BY pending_count DESC
    `;

    const result = await pool.query(query, [productId, totalPendingTasks]);

    return NextResponse.json({
      pendingTasksByOrg: result.rows,
      totalPendingTasks
    });

  } catch (error) {
    console.error('Error fetching pending tasks by organization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
