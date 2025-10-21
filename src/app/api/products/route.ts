import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workpackageId = searchParams.get('workpackageId');
    const outputId = searchParams.get('outputId');

    let queryText = `
      SELECT 
        p.product_id,
        p.product_name,
        p.product_objective,
        p.product_output,
        p.deliverable,
        p.delivery_date,
        p.workpackage_id,
        w.workpackage_name
      FROM products p
      LEFT JOIN workpackages w ON p.workpackage_id = w.workpackage_id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;

    if (workpackageId) {
      queryText += ` AND p.workpackage_id = $${paramCount}`;
      params.push(parseInt(workpackageId));
      paramCount++;
    }

    if (outputId) {
      queryText += ` AND p.product_output = $${paramCount}`;
      params.push(parseInt(outputId));
      paramCount++;
    }

    queryText += ' ORDER BY p.product_id';

    const result = await query(queryText, params);
    
    return NextResponse.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
