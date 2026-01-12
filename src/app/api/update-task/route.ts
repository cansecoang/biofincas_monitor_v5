import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      task_name,
      task_detail,
      start_date_planned,
      end_date_planned,
      start_date_actual,
      end_date_actual,
      phase_id,
      status_id,
      responsable_id,
      product_id
    } = body;

    // Validar campos requeridos
    if (!task_name || !product_id) {
      return NextResponse.json(
        { error: 'Missing required fields: task_name, product_id' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Verificar que la tarea existe
      const checkQuery = 'SELECT task_id FROM tasks WHERE task_id = $1';
      const checkResult = await client.query(checkQuery, [parseInt(taskId)]);
      
      if (checkResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        );
      }

      const query = `
        UPDATE tasks SET
          task_name = $1,
          task_detail = $2,
          start_date_planned = $3,
          end_date_planned = $4,
          start_date_actual = $5,
          end_date_actual = $6,
          phase_id = $7,
          status_id = $8,
          responsable_id = $9,
          product_id = $10
        WHERE task_id = $11
        RETURNING *
      `;
      
      const values = [
        task_name,
        task_detail || null,
        start_date_planned && start_date_planned.trim() ? start_date_planned : null,
        end_date_planned && end_date_planned.trim() ? end_date_planned : null,
        start_date_actual && start_date_actual.trim() ? start_date_actual : null,
        end_date_actual && end_date_actual.trim() ? end_date_actual : null,
        phase_id ? parseInt(phase_id) : null,
        status_id ? parseInt(status_id) : null,
        responsable_id ? parseInt(responsable_id) : null,
        parseInt(product_id),
        parseInt(taskId)
      ];
      
      const result = await client.query(query, values);
      
      return NextResponse.json({
        success: true,
        task: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
