import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando migración de tabla indicators...');
    
    // 1. Agregar columna workpackage_id
    await client.query(`
      ALTER TABLE indicators
      ADD COLUMN IF NOT EXISTS workpackage_id INTEGER
    `);
    console.log('✅ Columna workpackage_id agregada');
    
    // 2. Agregar comentario a la columna
    await client.query(`
      COMMENT ON COLUMN indicators.workpackage_id IS 'ID del Work Package al que pertenece este indicador'
    `);
    console.log('✅ Comentario agregado');
    
    // 3. Agregar Foreign Key constraint (solo si no existe)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'fk_indicators_workpackage'
        ) THEN
          ALTER TABLE indicators
          ADD CONSTRAINT fk_indicators_workpackage
          FOREIGN KEY (workpackage_id) 
          REFERENCES workpackages(workpackage_id)
          ON DELETE SET NULL
          ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✅ Foreign Key constraint agregada');
    
    // 4. Crear índice (solo si no existe)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_indicators_workpackage 
      ON indicators(workpackage_id)
    `);
    console.log('✅ Índice creado');
    
    // 5. Verificar la columna agregada
    const verification = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'indicators' AND column_name = 'workpackage_id'
    `);
    
    // 6. Verificar foreign key
    const fkVerification = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'indicators' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'workpackage_id'
    `);
    
    console.log('🎉 Migración completada exitosamente!');
    
    return NextResponse.json({
      success: true,
      message: 'Columna workpackage_id agregada exitosamente a la tabla indicators',
      verification: {
        column: verification.rows[0],
        foreignKey: fkVerification.rows[0]
      }
    });
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}
