import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT user_id, user_name, user_email FROM users ORDER BY user_name'
    );
    
    return NextResponse.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
