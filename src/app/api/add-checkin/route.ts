import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      checkin_with_id,
      checkin_date,
      checkin_description,
      task_id
    } = body;

    // Validar campos requeridos
    if (!checkin_with_id || !checkin_date) {
      return NextResponse.json(
        { error: 'Missing required fields: checkin_with_id, checkin_date' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO checkins (
          checkin_with_id,
          checkin_date,
          checkin_description,
          task_id
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *
      `;
      
      const values = [
        parseInt(checkin_with_id),
        checkin_date,
        checkin_description || null,
        task_id ? parseInt(task_id) : null
      ];
      
      const result = await client.query(query, values);
      
      return NextResponse.json({
        success: true,
        checkin: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating checkin:', error);
    return NextResponse.json(
      { error: 'Failed to create checkin', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
