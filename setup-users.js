#!/usr/bin/env node

/**
 * Setup Script - Database User Management
 * Verifies and creates users with hashed passwords
 * Run: node setup-users.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
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
      console.log('No .env file found, using environment variables');
    }
  }
}

loadEnv();

// Database connection
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

async function checkPasswordColumn() {
  log('\n📋 Step 1: Checking if password_hash column exists...', 'cyan');
  
  const result = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND column_name = 'password_hash'
  `);
  
  if (result.rows.length > 0) {
    log('✅ Column password_hash already exists', 'green');
    return true;
  } else {
    log('⚠️  Column password_hash does NOT exist', 'yellow');
    return false;
  }
}

async function addPasswordColumn() {
  log('\n🔧 Step 2: Adding password_hash column...', 'cyan');
  
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
    `);
    log('✅ Column password_hash added successfully', 'green');
    return true;
  } catch (error) {
    log(`❌ Error adding column: ${error.message}`, 'red');
    return false;
  }
}

async function getCurrentUsers() {
  log('\n👥 Step 3: Checking existing users...', 'cyan');
  
  // Check if role_id column exists
  const roleColumnCheck = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
      AND column_name = 'role_id'
  `);
  
  const hasRoleColumn = roleColumnCheck.rows.length > 0;
  
  let query;
  if (hasRoleColumn) {
    query = `
      SELECT 
        user_id,
        user_name,
        user_email,
        password_hash,
        role_id
      FROM users
      ORDER BY user_id
    `;
  } else {
    log('⚠️  Column role_id does not exist yet (will be added by RBAC setup)', 'yellow');
    query = `
      SELECT 
        user_id,
        user_name,
        user_email,
        password_hash
      FROM users
      ORDER BY user_id
    `;
  }
  
  const result = await pool.query(query);
  
  log(`Found ${result.rows.length} users in database:`, 'blue');
  
  result.rows.forEach(user => {
    const hasPassword = user.password_hash ? '✅' : '❌';
    log(`  ${hasPassword} ID: ${user.user_id} | ${user.user_email} | ${user.user_name}`);
  });
  
  return { users: result.rows, hasRoleColumn };
}

async function createDemoUsers(hasRoleColumn) {
  log('\n🚀 Step 4: Creating/Updating demo users with hashed passwords...', 'cyan');
  
  const defaultPassword = 'oroverde2025?';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  
  const demoUsers = [
    { name: 'Admin User', email: 'admin@oroverde.com' },
    { name: 'Test User', email: 'test@oroverde.com' }
  ];
  
  const results = {
    created: [],
    updated: [],
    errors: []
  };
  
  for (const user of demoUsers) {
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT user_id FROM users WHERE user_email = $1',
        [user.email]
      );
      
      if (existingUser.rows.length > 0) {
        // Update existing user
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE user_email = $2',
          [passwordHash, user.email]
        );
        log(`  ✅ Updated: ${user.email}`, 'green');
        results.updated.push(user.email);
      } else {
        // Insert new user (sin role_id)
        const insertResult = await pool.query(
          `INSERT INTO users (user_name, user_email, password_hash) 
           VALUES ($1, $2, $3) 
           RETURNING user_id`,
          [user.name, user.email, passwordHash]
        );
        log(`  ✅ Created: ${user.email} - ID: ${insertResult.rows[0].user_id}`, 'green');
        results.created.push(user.email);
      }
    } catch (error) {
      log(`  ❌ Error with ${user.email}: ${error.message}`, 'red');
      results.errors.push(`${user.email}: ${error.message}`);
    }
  }
  
  return { results, defaultPassword };
}

async function updateExistingUsersPasswords() {
  log('\n🔑 Step 5: Setting passwords for users without one...', 'cyan');
  
  const usersWithoutPassword = await pool.query(`
    SELECT user_id, user_email, user_name
    FROM users
    WHERE password_hash IS NULL
    ORDER BY user_id
  `);
  
  if (usersWithoutPassword.rows.length === 0) {
    log('✅ All users already have passwords', 'green');
    return [];
  }
  
  log(`Found ${usersWithoutPassword.rows.length} users without passwords`, 'yellow');
  
  const defaultPassword = 'oroverde2025?';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  
  const updated = [];
  
  for (const user of usersWithoutPassword.rows) {
    try {
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE user_id = $2',
        [passwordHash, user.user_id]
      );
      log(`  ✅ Set password for: ${user.user_email}`, 'green');
      updated.push(user.user_email);
    } catch (error) {
      log(`  ❌ Error updating ${user.user_email}: ${error.message}`, 'red');
    }
  }
  
  return updated;
}

async function showFinalSummary() {
  log('\n📊 Final Summary', 'cyan');
  log('═'.repeat(60), 'cyan');
  
  const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users');
  const usersWithPasswords = await pool.query(`
    SELECT COUNT(*) as count FROM users WHERE password_hash IS NOT NULL
  `);
  const usersWithoutPasswords = await pool.query(`
    SELECT COUNT(*) as count FROM users WHERE password_hash IS NULL
  `);
  
  log(`Total users in database: ${totalUsers.rows[0].count}`, 'blue');
  log(`Users with passwords: ${usersWithPasswords.rows[0].count} ✅`, 'green');
  log(`Users without passwords: ${usersWithoutPasswords.rows[0].count} ${usersWithoutPasswords.rows[0].count > 0 ? '⚠️' : '✅'}`, 
      usersWithoutPasswords.rows[0].count > 0 ? 'yellow' : 'green');
  
  log('\n🔐 Default Password for Demo Users:', 'cyan');
  log('   oroverde2025?', 'yellow');
  log('\n⚠️  IMPORTANT: Change passwords after first login in production!', 'red');
}

async function main() {
  try {
    log('\n🚀 Starting User Setup Process', 'cyan');
    log('═'.repeat(60), 'cyan');
    
    // Step 1: Check if password column exists
    const hasColumn = await checkPasswordColumn();
    
    // Step 2: Add column if needed
    if (!hasColumn) {
      await addPasswordColumn();
    }
    
    // Step 3: Show current users
    const { users, hasRoleColumn } = await getCurrentUsers();
    
    // Step 4: Create/Update demo users
    const { results, defaultPassword } = await createDemoUsers(hasRoleColumn);
    
    log('\n📈 Demo Users Results:', 'cyan');
    log(`  Created: ${results.created.length}`, 'green');
    log(`  Updated: ${results.updated.length}`, 'yellow');
    log(`  Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
    
    // Step 5: Update existing users without passwords
    const updatedExisting = await updateExistingUsersPasswords();
    if (updatedExisting.length > 0) {
      log(`\n  Updated ${updatedExisting.length} existing users with default password`, 'green');
    }
    
    // Final summary
    await showFinalSummary();
    
    log('\n✅ Setup completed successfully!', 'green');
    log('\nYou can now login with:', 'cyan');
    log('  Email: admin@oroverde.com', 'blue');
    log('  Password: oroverde2025?', 'yellow');
    
  } catch (error) {
    log('\n❌ Fatal error:', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main();
