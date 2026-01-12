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
      const query = `
        INSERT INTO tasks (
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
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
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
