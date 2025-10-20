import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Intentar una consulta simple para verificar la conexión
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      data: {
        timestamp: result.rows[0].current_time,
        database_version: result.rows[0].db_version
      }
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error al conectar con la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
