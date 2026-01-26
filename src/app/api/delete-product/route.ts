import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const productCheck = await client.query(
      'SELECT product_id FROM products WHERE product_id = $1',
      [productIdNum]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Starting deletion of product ${productIdNum} and all related records...`);

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Borrar tareas del producto (si existen)
    const tasksResult = await client.query(
      'DELETE FROM tasks WHERE product_id = $1',
      [productIdNum]
    );
    console.log(`   ✓ Deleted ${tasksResult.rowCount} tasks`);

    // 2. Borrar responsables del producto
    const responsiblesResult = await client.query(
      'DELETE FROM product_responsibles WHERE product_id = $1',
      [productIdNum]
    );
    console.log(`   ✓ Deleted ${responsiblesResult.rowCount} product_responsibles`);

    // 3. Borrar organizaciones relacionadas
    const orgsResult = await client.query(
      'DELETE FROM product_organizations WHERE product_id = $1',
      [productIdNum]
    );
    console.log(`   ✓ Deleted ${orgsResult.rowCount} product_organizations`);

    // 4. Borrar indicadores del producto
    const indicatorsResult = await client.query(
      'DELETE FROM product_indicators WHERE product_id = $1',
      [productIdNum]
    );
    console.log(`   ✓ Deleted ${indicatorsResult.rowCount} product_indicators`);

    // 5. Finalmente, borrar el producto
    const productResult = await client.query(
      'DELETE FROM products WHERE product_id = $1',
      [productIdNum]
    );
    console.log(`   ✓ Deleted product ${productIdNum}`);

    // Commit de la transacción
    await client.query('COMMIT');

    console.log(`✅ Product ${productIdNum} and all related records deleted successfully`);

    return NextResponse.json({
      success: true,
      message: 'Product and all related records deleted successfully',
      deletedCounts: {
        tasks: tasksResult.rowCount,
        responsibles: responsiblesResult.rowCount,
        organizations: orgsResult.rowCount,
        indicators: indicatorsResult.rowCount,
        product: productResult.rowCount
      }
    });

  } catch (error) {
    // Rollback en caso de error
    await client.query('ROLLBACK');
    console.error('❌ Error deleting product:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
