import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    const result = await query(
      `SELECT 
        t.task_id,
        t.task_name,
        t.task_detail,
        t.start_date_planned,
        t.end_date_planned,
        t.start_date_actual,
        t.end_date_actual,
        t.product_id,
        s.status_name,
        p.phase_name
      FROM tasks t
      LEFT JOIN status s ON t.status_id = s.status_id
      LEFT JOIN phases p ON t.phase_id = p.phase_id
      WHERE t.product_id = $1
      ORDER BY t.start_date_planned NULLS LAST, t.task_id`,
      [productId]
    );

    return NextResponse.json({
      success: true,
      tasks: result.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
