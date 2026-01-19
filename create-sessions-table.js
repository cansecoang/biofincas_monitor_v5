#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');

// Load environment variables
function loadEnv() {
  try {
    const envLocal = fs.readFileSync('.env.local', 'utf8');
    envLocal.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    });
  } catch (err) {
    try {
      const env = fs.readFileSync('.env', 'utf8');
      env.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      });
    } catch (err) {
      console.log('No .env file found');
    }
  }
}

loadEnv();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function createSessionsTable() {
  try {
    log('\n🔧 Creating user_sessions table...', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename = 'user_sessions'
    `);
    
    if (tableCheck.rows.length > 0) {
      log('\n✅ Table user_sessions already exists', 'green');
      
      // Show table structure
      const columns = await pool.query(`
        SELECT column_name, data_type, character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'user_sessions'
        ORDER BY ordinal_position
      `);
      
      log('\n📋 Table structure:', 'blue');
      columns.rows.forEach(col => {
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        log(`  - ${col.column_name}: ${col.data_type}${length}`);
      });
      
      return;
    }
    
    log('\n⚠️  Table user_sessions does not exist, creating...', 'yellow');
    
    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    log('✅ Extension pgcrypto enabled', 'green');
    
    // Create table
    await pool.query(`
      CREATE TABLE user_sessions (
        session_id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('✅ Table user_sessions created', 'green');
    
    // Create indexes
    await pool.query('CREATE INDEX idx_user_sessions_token ON user_sessions(session_token)');
    await pool.query('CREATE INDEX idx_user_sessions_user ON user_sessions(user_id)');
    await pool.query('CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at)');
    log('✅ Indexes created', 'green');
    
    // Add comment
    await pool.query("COMMENT ON TABLE user_sessions IS 'Active user sessions for authentication'");
    
    // Show table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'user_sessions'
      ORDER BY ordinal_position
    `);
    
    log('\n📋 Table structure:', 'blue');
    columns.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      log(`  - ${col.column_name}: ${col.data_type}${length}`);
    });
    
    log('\n✅ user_sessions table created successfully!', 'green');
    log('\n🔐 You can now use the login system', 'cyan');
    
  } catch (error) {
    log('\n❌ Error:', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createSessionsTable();
