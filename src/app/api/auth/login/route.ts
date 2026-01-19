import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Rate limiting: almacenar intentos de login por IP
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining?: number; resetAt?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Resetear si pasó el tiempo de lockout
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      resetAt: attempts.lastAttempt + LOCKOUT_TIME
    };
  }

  attempts.count++;
  attempts.lastAttempt = now;
  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.count };
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Verificar rate limiting
  const rateLimitCheck = checkRateLimit(clientIP);
  if (!rateLimitCheck.allowed) {
    const resetIn = Math.ceil(((rateLimitCheck.resetAt || 0) - Date.now()) / 1000 / 60);
    return NextResponse.json(
      {
        error: 'Too many login attempts',
        message: `Demasiados intentos de login. Intenta de nuevo en ${resetIn} minutos.`,
        resetAt: rateLimitCheck.resetAt
      },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();
    
    console.log('🔐 Login attempt:', { email, timestamp: new Date().toISOString() });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
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
        u.password_hash
      FROM users u
      WHERE LOWER(u.user_email) = LOWER($1)
    `;
    
    const result = await pool.query(userQuery, [email]);
    
    console.log('👤 User lookup result:', { found: result.rows.length > 0, email });
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0];
    
    console.log('✅ User found:', { user_id: user.user_id, email: user.user_email, has_password: !!user.password_hash });
    
    // Verify password
    if (!user.password_hash) {
      console.log('❌ No password hash for user');
      return NextResponse.json(
        { error: 'Account not configured. Please contact administrator.' },
        { status: 401 }
      );
    }
    
    console.log('🔑 Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    console.log('🔑 Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      // No resetear rate limit en password incorrecto
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('✅ Password valid, creating session...');

    // Login exitoso - resetear intentos fallidos
    resetRateLimit(clientIP);
    
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
        role: 'user' // Rol por defecto sin RBAC
      }
    });
    
    // Set session cookie con máxima seguridad
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true, // Previene acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict', // Protección CSRF más fuerte
      expires: expiresAt,
      path: '/',
      priority: 'high'
    });

    // Agregar headers de seguridad
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    console.log(`✅ User logged in: ${user.user_email}`);
    
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
