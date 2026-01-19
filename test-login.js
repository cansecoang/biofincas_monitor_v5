#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
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

async function testLogin() {
  try {
    const email = 'admin@oroverde.com';
    const password = 'oroverde2025?';
    
    console.log('\n🔍 Testing login for:', email);
    console.log('Password:', password);
    console.log('═'.repeat(60));
    
    // Get user
    const result = await pool.query(
      'SELECT user_id, user_name, user_email, password_hash FROM users WHERE LOWER(user_email) = LOWER($1)',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return;
    }
    
    const user = result.rows[0];
    console.log('\n✅ User found:');
    console.log('  ID:', user.user_id);
    console.log('  Name:', user.user_name);
    console.log('  Email:', user.user_email);
    console.log('  Has password hash:', user.password_hash ? 'YES' : 'NO');
    
    if (!user.password_hash) {
      console.log('\n❌ User has no password set!');
      return;
    }
    
    console.log('\n🔐 Testing password comparison...');
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (isValid) {
      console.log('✅ Password is VALID! Login should work.');
    } else {
      console.log('❌ Password is INVALID!');
      console.log('\nHash in DB (first 50 chars):', user.password_hash.substring(0, 50));
      
      // Try to create a new hash with the same password
      console.log('\n🔧 Creating new hash with same password...');
      const newHash = await bcrypt.hash(password, 10);
      console.log('New hash (first 50 chars):', newHash.substring(0, 50));
      
      const testCompare = await bcrypt.compare(password, newHash);
      console.log('New hash comparison:', testCompare ? 'WORKS' : 'FAILS');
    }
    
    // Show all users
    console.log('\n📋 All users in database:');
    const allUsers = await pool.query('SELECT user_id, user_email, user_name, password_hash FROM users ORDER BY user_id');
    allUsers.rows.forEach(u => {
      console.log(`  ${u.user_id}. ${u.user_email} (${u.user_name}) - Password: ${u.password_hash ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testLogin();
