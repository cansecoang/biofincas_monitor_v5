import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper function to get the correct table name
type TableRow = { table_name: string };

import type { PoolClient } from 'pg';

async function getTableName(client: PoolClient) {
  const tableCheck = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name IN ('workinggroup', 'working_groups', 'workinggroups')
  `);
  
  if (tableCheck.rows.length === 0) {
    throw new Error('No se encontró tabla workinggroup, working_groups ni workinggroups');
  }
  
  // Prioridad: workinggroups > working_groups > workinggroup
  if (tableCheck.rows.some((row: TableRow) => row.table_name === 'workinggroups')) {
    return 'workinggroups';
  }
  if (tableCheck.rows.some((row: TableRow) => row.table_name === 'working_groups')) {
    return 'working_groups';
  }
  return 'workinggroup';
}

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const tableName = await getTableName(client);
      
      const query = `
        SELECT 
          * 
        FROM ${tableName} 
        ORDER BY 1
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        workingGroups: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching working groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch working groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const client = await pool.connect();
    
    try {
      const tableName = await getTableName(client);
      
      const query = `
        INSERT INTO ${tableName} (workinggroup_name, workinggroup_description)
        VALUES ($1, $2)
        RETURNING workinggroup_id, workinggroup_name, workinggroup_description
      `;
      
      const result = await client.query(query, [name, description]);
      
      return NextResponse.json({
        success: true,
        workingGroup: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating working group:', error);
    return NextResponse.json(
      { error: 'Failed to create working group' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description } = await request.json();
    const client = await pool.connect();
    
    try {
      const tableName = await getTableName(client);
      
      const query = `
        UPDATE ${tableName} 
        SET workinggroup_name = $1, workinggroup_description = $2
        WHERE workinggroup_id = $3
        RETURNING workinggroup_id, workinggroup_name, workinggroup_description
      `;
      
      const result = await client.query(query, [name, description, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Working group not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        workingGroup: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating working group:', error);
    return NextResponse.json(
      { error: 'Failed to update working group' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await pool.connect();
    
    try {
      const tableName = await getTableName(client);
      
      const query = `
        DELETE FROM ${tableName} 
        WHERE workinggroup_id = $1
        RETURNING workinggroup_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Working group not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Working group deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting working group:', error);
    return NextResponse.json(
      { error: 'Failed to delete working group' },
      { status: 500 }
    );
  }
}
