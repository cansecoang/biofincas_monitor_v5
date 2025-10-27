import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT i.indicator_id, i.indicator_code, i.indicator_name, i.indicator_description, COALESCE(wp.workpackage_name, 'Sin WP') as workpackage_name
       FROM indicators i
       LEFT JOIN workpackages wp ON i.workpackage_id = wp.workpackage_id
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
