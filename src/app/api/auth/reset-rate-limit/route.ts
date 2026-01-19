import { NextResponse } from 'next/server';

// Este endpoint solo funciona en desarrollo
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  // El rate limit se resetea automáticamente al reiniciar el servidor
  return NextResponse.json({
    success: true,
    message: 'Rate limit will be reset on next server restart. You can also wait 15 minutes.',
    tip: 'Restart the dev server to reset rate limits immediately'
  });
}
