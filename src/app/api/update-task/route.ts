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
      checkin_oro_verde,
      checkin_user,
      checkin_communication,
      checkin_gender,
      phase_id,
      status_id,
      responsable_id,
      product_id
    } = body;

    // Validar campos requeridos
    if (!task_name || !phase_id || !status_id || !product_id) {
      return NextResponse.json(
        { error: 'Missing required fields: task_name, phase_id, status_id, product_id' },
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
          checkin_oro_verde = $7,
          checkin_user = $8,
          checkin_communication = $9,
          checkin_gender = $10,
          phase_id = $11,
          status_id = $12,
          responsable_id = $13,
          product_id = $14,
          updated_at = NOW()
        WHERE task_id = $15
        RETURNING *
      `;
      
      const values = [
        task_name,
        task_detail || null,
        start_date_planned && start_date_planned.trim() ? new Date(start_date_planned).toISOString() : null,
        end_date_planned && end_date_planned.trim() ? new Date(end_date_planned).toISOString() : null,
        start_date_actual && start_date_actual.trim() ? new Date(start_date_actual).toISOString() : null,
        end_date_actual && end_date_actual.trim() ? new Date(end_date_actual).toISOString() : null,
        checkin_oro_verde && checkin_oro_verde.trim() ? new Date(checkin_oro_verde).toISOString() : null,
        checkin_user && checkin_user.trim() ? new Date(checkin_user).toISOString() : null,
        checkin_communication && checkin_communication.trim() ? new Date(checkin_communication).toISOString() : null,
        checkin_gender && checkin_gender.trim() ? new Date(checkin_gender).toISOString() : null,
        parseInt(phase_id),
        parseInt(status_id),
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
