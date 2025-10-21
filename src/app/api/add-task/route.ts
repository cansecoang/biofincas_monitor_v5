import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Configuración de la base de datos


export async function POST(request: NextRequest) {
  try {
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
      const query = `
        INSERT INTO tasks (
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
          product_id,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
        ) RETURNING *
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
        parseInt(product_id)
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
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
