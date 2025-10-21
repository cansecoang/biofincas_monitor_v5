import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `SELECT * FROM status ORDER BY status_name`;
      const result = await client.query(query);
      
      return NextResponse.json({
        statuses: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statuses' },
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
        INSERT INTO status (status_name, status_description)
        VALUES ($1, $2)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description]);
      
      return NextResponse.json({
        success: true,
        status: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating status:', error);
    return NextResponse.json(
      { error: 'Failed to create status' },
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
          UPDATE status
          SET status_name = $1, status_description = $2
          WHERE status_id = $3
          RETURNING *
        `;      const result = await client.query(query, [name, description, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        status: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
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
        DELETE FROM status 
        WHERE status_id = $1
        RETURNING status_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Status not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Status deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting status:', error);
    return NextResponse.json(
      { error: 'Failed to delete status' },
      { status: 500 }
    );
  }
}
