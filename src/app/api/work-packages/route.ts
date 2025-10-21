import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT workpackage_id, workpackage_name, workpackage_description FROM workpackages ORDER BY workpackage_name'
    );
    
    return NextResponse.json({
      success: true,
      workpackages: result.rows
    });
  } catch (error) {
    console.error('Error fetching work packages:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    

    const result = await query(
      'INSERT INTO workpackages (workpackage_name, workpackage_description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    
    return NextResponse.json({
      success: true,
      workpackage: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating work package:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description } = await request.json();
    
    const result = await query(
      'UPDATE workpackages SET workpackage_name = $1, workpackage_description = $2 WHERE workpackage_id = $3 RETURNING *',
      [name, description, id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Work package not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      workpackage: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating work package:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    const result = await query(
      'DELETE FROM workpackages WHERE workpackage_id = $1 RETURNING workpackage_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Work package not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Work package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting work package:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
