import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT country_id, country_name FROM countries ORDER BY country_name'
    );
    
    return NextResponse.json({
      success: true,
      countries: result.rows
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
