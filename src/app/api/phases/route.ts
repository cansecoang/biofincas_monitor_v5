import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `SELECT * FROM phases ORDER BY phase_name`;
      const result = await client.query(query);

      return NextResponse.json({
        phases: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO phases (phase_name, phase_description)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description]);
      
      return NextResponse.json({
        success: true,
        phase: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating phase:', error);
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        UPDATE phases 
        SET phase_name = $1, phase_description = $2
        WHERE phase_id = $3
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Phase not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        phase: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating phase:', error);
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM phases 
        WHERE phase_id = $1
        RETURNING phase_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Phase not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Phase deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting phase:', error);
    return NextResponse.json(
      { error: 'Failed to delete phase' },
      { status: 500 }
    );
  }
}