import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function POST() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🔐 Setting up RBAC schema...');
    
    // 1. Create roles table
    console.log('1. Creating roles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) UNIQUE NOT NULL,
        role_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Insert default roles
    console.log('2. Inserting default roles...');
    await client.query(`
      INSERT INTO roles (role_name, role_description) VALUES
        ('admin', 'Full system access with all permissions'),
        ('manager', 'Can manage products, tasks, and view analytics'),
        ('user', 'Can update assigned products and manage own tasks'),
        ('viewer', 'Read-only access to system')
      ON CONFLICT (role_name) DO NOTHING
    `);
    
    // 3. Add role_id and password to users table
    console.log('3. Adding role_id and password to users table...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(role_id) DEFAULT 4
    `);
    
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);
    
    // 4. Create user_sessions table (using SERIAL instead of UUID)
    console.log('4. Creating user_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 5. Create indexes for user_sessions
    console.log('5. Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)');
    
    // 6. Create audit_logs table
    console.log('6. Creating audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id INTEGER,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 7. Create indexes for audit_logs
    console.log('7. Creating audit_logs indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at)');
    
    console.log('✅ All tables and indexes created successfully!');
    
    // Verify setup
    const rolesCount = await client.query('SELECT COUNT(*) FROM roles');
    const usersWithRoles = await client.query('SELECT COUNT(*) FROM users WHERE role_id IS NOT NULL');
    
    await client.query('COMMIT');
    
    console.log('✅ RBAC schema setup complete!');
    console.log(`   - Roles created: ${rolesCount.rows[0].count}`);
    console.log(`   - Users with roles: ${usersWithRoles.rows[0].count}`);
    
    return NextResponse.json({
      success: true,
      message: 'RBAC schema setup successfully',
      data: {
        rolesCount: parseInt(rolesCount.rows[0].count),
        usersWithRoles: parseInt(usersWithRoles.rows[0].count)
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error setting up RBAC schema:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup RBAC schema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
