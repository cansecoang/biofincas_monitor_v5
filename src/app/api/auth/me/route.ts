import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 200 }
    );
  }
  
  const { user } = authResult;
  
  return NextResponse.json({
    authenticated: true,
    user: {
      user_id: user.user_id,
      user_name: user.user_name,
      user_email: user.user_email,
      role: user.role
    }
  });
}
