import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Get user with password hash
    const userQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.user_email,
        u.password_hash,
        r.role_name as role
      FROM users u
      LEFT JOIN roles r ON r.role_id = u.role_id
      WHERE LOWER(u.user_email) = LOWER($1)
    `;
    
    const result = await pool.query(userQuery, [email]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    // Verify password
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Account not configured. Please contact administrator.' },
        { status: 401 }
      );
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    // Create session
    try {
      await pool.query(
        `INSERT INTO user_sessions (user_id, session_token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.user_id, sessionToken, expiresAt]
      );
    } catch (sessionError) {
      console.error('Session creation error:', sessionError);
      throw sessionError;
    }
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_email: user.user_email,
        role: user.role || 'viewer'
      }
    });
    
    // Set session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });
    
    console.log(`✅ User logged in: ${user.user_email} (${user.role})`);
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
