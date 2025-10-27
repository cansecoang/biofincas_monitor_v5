import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requireAuth, logAudit } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { user } = auth;

  try {
    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [user.user_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentHash = result.rows[0].password_hash;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentHash);

    if (!isValidPassword) {
      await logAudit(
        user.user_id,
        'change_password_failed',
        'user',
        user.user_id,
        { reason: 'Invalid current password' },
        request
      );

      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE user_id = $2',
      [newHash, user.user_id]
    );

    // Log successful password change
    await logAudit(
      user.user_id,
      'change_password_success',
      'user',
      user.user_id,
      { message: 'Password changed successfully' },
      request
    );

    console.log(`✅ Password changed for user: ${user.user_email}`);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
