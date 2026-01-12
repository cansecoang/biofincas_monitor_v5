import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        i.indicator_id, 
        i.indicator_code, 
        i.indicator_description,
        i.output_number
       FROM indicators i
       ORDER BY i.indicator_code`
    );
    return NextResponse.json({
      success: true,
      indicators: result.rows
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
