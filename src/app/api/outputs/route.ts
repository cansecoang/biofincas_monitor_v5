import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT output_id, output_number, output_name FROM outputs ORDER BY output_number'
    );
    
    return NextResponse.json({
      success: true,
      outputs: result.rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
