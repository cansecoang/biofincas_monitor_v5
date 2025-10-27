import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT 
        indicator_id,
        indicator_code,
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) as output_num
      FROM indicators
      WHERE indicator_code IS NOT NULL AND indicator_code != ''
      LIMIT 10
    `;
    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Test query error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
