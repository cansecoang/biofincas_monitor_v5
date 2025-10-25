import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando inserción de usuarios...');
    
    // Lista de usuarios a insertar
    const users = [
      { name: 'Teresa de Jesús Arce Mojica', email: 'teresa.arce@oroverde.org' },
      { name: 'Walter', email: 'walter@oroverde.org' },
      { name: 'Charlotte', email: 'charlotte@oroverde.org' },
      { name: 'Javier', email: 'javier@oroverde.org' },
      { name: 'José', email: 'jose@oroverde.org' },
      { name: 'Hugo Enrique Reyes Aldana', email: 'hugo.reyes@oroverde.org' },
      { name: 'Sarah Jones', email: 'sarah.jones@oroverde.org' },
      { name: 'Fernanda López', email: 'fernanda.lopez@oroverde.org' },
    ];
    
    const results = {
      inserted: [] as string[],
      skipped: [] as string[],
      errors: [] as string[]
    };
    
    for (const user of users) {
      try {
        // Verificar si el usuario ya existe (por nombre)
        const existingUser = await client.query(
          'SELECT user_id, user_name FROM users WHERE user_name = $1',
          [user.name]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⏭️  Usuario "${user.name}" ya existe, saltando...`);
          results.skipped.push(user.name);
          continue;
        }
        
        // Insertar el nuevo usuario
        const insertResult = await client.query(
          'INSERT INTO users (user_name, user_email) VALUES ($1, $2) RETURNING user_id, user_name',
          [user.name, user.email]
        );
        
        console.log(`✅ Usuario "${user.name}" insertado con ID: ${insertResult.rows[0].user_id}`);
        results.inserted.push(user.name);
        
      } catch (error) {
        console.error(`❌ Error insertando usuario "${user.name}":`, error);
        results.errors.push(`${user.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    // Obtener el total de usuarios después de la inserción
    const totalUsers = await client.query('SELECT COUNT(*) as total FROM users');
    
    console.log('🎉 Proceso completado!');
    console.log(`   - Insertados: ${results.inserted.length}`);
    console.log(`   - Saltados: ${results.skipped.length}`);
    console.log(`   - Errores: ${results.errors.length}`);
    console.log(`   - Total de usuarios en BD: ${totalUsers.rows[0].total}`);
    
    return NextResponse.json({
      success: true,
      message: 'Proceso de inserción de usuarios completado',
      results: {
        inserted: results.inserted,
        insertedCount: results.inserted.length,
        skipped: results.skipped,
        skippedCount: results.skipped.length,
        errors: results.errors,
        errorsCount: results.errors.length,
        totalUsersInDB: parseInt(totalUsers.rows[0].total)
      }
    });
    
  } catch (error) {
    console.error('❌ Error en proceso de inserción de usuarios:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      details: error
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}
