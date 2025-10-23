import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const client = await pool.connect();
  
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table') || 'products';
    
    // Query to get table structure
    const query = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(query, [tableName]);
    
    return NextResponse.json({
      success: true,
      table: tableName,
      columns: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching table structure:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching table structure',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    client.release();
  }
}
