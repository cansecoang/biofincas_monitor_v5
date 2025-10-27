import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('👥 Creating demo users with roles...');
    
    // Hash the default password for demo users
    const defaultPassword = 'oroverde2025?'; // Updated password for admin
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    const demoUsers = [
      { name: 'Oro Verde Admin', email: 'admin@oroverde.com', role: 'admin' },
      { name: 'Manager User', email: 'manager@oroverde.com', role: 'manager' },
      { name: 'Regular User', email: 'user@oroverde.com', role: 'user' },
      { name: 'Guest User', email: 'viewer@oroverde.com', role: 'viewer' }
    ];
    
    const createdUsers = [];
    
    for (const demoUser of demoUsers) {
      // Get role_id
      const roleResult = await client.query(
        'SELECT role_id FROM roles WHERE role_name = $1',
        [demoUser.role]
      );
      
      if (roleResult.rows.length === 0) {
        console.log(`⚠️ Role ${demoUser.role} not found, skipping user ${demoUser.email}`);
        continue;
      }
      
      const roleId = roleResult.rows[0].role_id;
      
      // Check if user exists
      const existingUser = await client.query(
        'SELECT user_id, user_name, user_email FROM users WHERE user_email = $1',
        [demoUser.email]
      );
      
      if (existingUser.rows.length > 0) {
        // Update existing user's role and password
        await client.query(
          'UPDATE users SET role_id = $1, password_hash = $2 WHERE user_email = $3',
          [roleId, await bcrypt.hash('oroverde2025?', 10), demoUser.email]
        );
        
        console.log(`✅ Updated existing user: ${demoUser.email} -> ${demoUser.role}`);
        createdUsers.push({
          ...existingUser.rows[0],
          role: demoUser.role,
          action: 'updated'
        });
      } else {
        // Insert new user
        const result = await client.query(
          'INSERT INTO users (user_name, user_email, role_id, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, user_name, user_email',
          [demoUser.name, demoUser.email, roleId, passwordHash]
        );
        
        console.log(`✅ Created new user: ${demoUser.email} -> ${demoUser.role}`);
        createdUsers.push({
          ...result.rows[0],
          role: demoUser.role,
          action: 'created'
        });
      }
    }
    
    await client.query('COMMIT');
    
    const totalUsers = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('✅ Demo users setup complete!');
    console.log(`   - Total users in DB: ${totalUsers.rows[0].count}`);
    console.log(`   - Default password: ${defaultPassword}`);
    console.log(`   - IMPORTANT: Change passwords after first login!`);
    
    return NextResponse.json({
      success: true,
      message: 'Demo users created/updated successfully',
      users: createdUsers,
      totalUsersInDB: parseInt(totalUsers.rows[0].count),
      defaultPassword: defaultPassword,
      security: {
        passwordHashing: 'bcrypt (10 rounds)',
        sessionExpiry: '7 days',
        httpOnly: true
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating demo users:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create demo users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
