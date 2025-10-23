import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT indicator_id, indicator_code, indicator_description FROM indicators ORDER BY indicator_code'
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
