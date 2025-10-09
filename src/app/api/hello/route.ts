import { NextRequest, NextResponse } from 'next/server';

// Este endpoint es compatible con Vercel Edge Functions
export const runtime = 'edge'; // Opcional: usa 'nodejs' si necesitas Node.js runtime

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Hello from API Route!',
    timestamp: new Date().toISOString(),
    path: request.nextUrl.pathname,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Data received successfully',
      data: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}
