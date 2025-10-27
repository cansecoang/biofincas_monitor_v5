import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { Role, Permission, hasPermission, UserWithRole } from '@/lib/rbac';

export interface AuthContext {
  user: UserWithRole;
  hasPermission: (permission: Permission) => boolean;
}

/**
 * Middleware to verify user authentication and authorization
 * Usage in API routes:
 * 
 * const authResult = await requireAuth(request, [Permission.CREATE_PRODUCT]);
 * if (authResult instanceof NextResponse) return authResult;
 * const { user } = authResult;
 */
export async function requireAuth(
  request: NextRequest,
  requiredPermissions: Permission[] = []
): Promise<AuthContext | NextResponse> {
  try {
    // Get session token from cookie or header
    const sessionToken = request.cookies.get('session_token')?.value ||
                        request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'No session token provided' },
        { status: 401 }
      );
    }
    
    // Verify session and get user with role
    const sessionQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.user_email,
        r.role_name as role,
        s.expires_at
      FROM user_sessions s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN roles r ON r.role_id = u.role_id
      WHERE s.session_token = $1
        AND s.expires_at > CURRENT_TIMESTAMP
    `;
    
    const result = await pool.query(sessionQuery, [sessionToken]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired session' },
        { status: 401 }
      );
    }
    
    const user = result.rows[0] as UserWithRole;
    
    // Update last accessed time
    await pool.query(
      'UPDATE user_sessions SET last_accessed_at = CURRENT_TIMESTAMP WHERE session_token = $1',
      [sessionToken]
    );
    
    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        hasPermission(user.role as Role, permission)
      );
      
      if (!hasAllPermissions) {
        return NextResponse.json(
          { 
            error: 'Forbidden', 
            message: 'Insufficient permissions',
            required: requiredPermissions,
            userRole: user.role
          },
          { status: 403 }
        );
      }
    }
    
    // Return auth context
    return {
      user,
      hasPermission: (permission: Permission) => hasPermission(user.role as Role, permission)
    };
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

/**
 * Optional auth - doesn't require authentication but provides user context if available
 */
export async function optionalAuth(request: NextRequest): Promise<AuthContext | null> {
  const sessionToken = request.cookies.get('session_token')?.value ||
                      request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!sessionToken) return null;
  
  try {
    const sessionQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.user_email,
        r.role_name as role
      FROM user_sessions s
      JOIN users u ON u.user_id = s.user_id
      LEFT JOIN roles r ON r.role_id = u.role_id
      WHERE s.session_token = $1
        AND s.expires_at > CURRENT_TIMESTAMP
    `;
    
    const result = await pool.query(sessionQuery, [sessionToken]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0] as UserWithRole;
    
    return {
      user,
      hasPermission: (permission: Permission) => hasPermission(user.role as Role, permission)
    };
  } catch (error) {
    console.error('Optional auth error:', error);
    return null;
  }
}

/**
 * Log user action to audit trail
 */
export async function logAudit(
  userId: number,
  action: string,
  resourceType: string,
  resourceId?: number,
  details?: any,
  request?: NextRequest
) {
  try {
    const ipAddress = request?.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request?.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';
    
    await pool.query(
      `INSERT INTO audit_logs 
       (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit failures shouldn't break the main operation
  }
}
