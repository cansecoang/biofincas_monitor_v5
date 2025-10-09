import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    id,
    name: `Product ${id}`,
    description: 'Sample product description',
    price: 99.99,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  return NextResponse.json({
    message: 'Product updated',
    id,
    data: body,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json({
    message: 'Product deleted',
    id,
    timestamp: new Date().toISOString(),
  });
}
