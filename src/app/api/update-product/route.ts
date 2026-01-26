import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper function to validate ID exists in a table
async function validateIdExists(
  client: any,
  tableName: string,
  columnName: string,
  id: number
): Promise<boolean> {
  const result = await client.query(
    `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = $1`,
    [id]
  );
  return result.rows.length > 0;
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    console.log('📝 Received update request:', JSON.stringify(body, null, 2));

    const {
      product_id,
      product_name,
      product_objective,
      deliverable,
      delivery_date,
      methodology_description,
      product_output_id,
      product_owner_id,
      country_id,
      responsibles = [],
      organizations = [],
      indicators = []
    } = body;

    // Validación: product_id es requerido
    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required for update' },
        { status: 400 }
      );
    }

    // Validación: product_name es requerido
    if (!product_name || product_name.trim() === '') {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Verificar que el producto existe
    const productCheck = await client.query(
      'SELECT product_id FROM products WHERE product_id = $1',
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validaciones de foreign keys
    if (product_output_id) {
      const outputExists = await validateIdExists(client, 'outputs', 'output_id', product_output_id);
      if (!outputExists) {
        return NextResponse.json(
          { error: `Output with ID ${product_output_id} does not exist` },
          { status: 400 }
        );
      }
    }

    if (product_owner_id) {
      const ownerExists = await validateIdExists(client, 'organizations', 'organization_id', product_owner_id);
      if (!ownerExists) {
        return NextResponse.json(
          { error: `Product owner organization with ID ${product_owner_id} does not exist` },
          { status: 400 }
        );
      }
    }

    if (country_id) {
      const countryExists = await validateIdExists(client, 'countries', 'country_id', country_id);
      if (!countryExists) {
        return NextResponse.json(
          { error: `Country with ID ${country_id} does not exist` },
          { status: 400 }
        );
      }
    }

    console.log(`🔄 Starting update of product ${product_id}...`);

    // Iniciar transacción
    await client.query('BEGIN');

    // 1. Actualizar el producto principal
    const updateProductQuery = `
      UPDATE products 
      SET 
        product_name = $1,
        product_objective = $2,
        deliverable = $3,
        delivery_date = $4,
        methodology_description = $5,
        product_output_id = $6,
        product_owner_id = $7,
        country_id = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $9
      RETURNING product_id
    `;

    const productResult = await client.query(updateProductQuery, [
      product_name,
      product_objective || null,
      deliverable || null,
      delivery_date || null,
      methodology_description || null,
      product_output_id || null,
      product_owner_id || null,
      country_id || null,
      product_id
    ]);

    console.log(`   ✓ Product ${product_id} updated`);

    // 2. Eliminar y recrear responsibles
    await client.query('DELETE FROM product_responsibles WHERE product_id = $1', [product_id]);
    
    if (responsibles && responsibles.length > 0) {
      for (const responsible of responsibles) {
        // Validar estructura del objeto
        if (!responsible.user_id || typeof responsible.user_id !== 'number') {
          throw new Error('Each responsible must have a valid user_id');
        }

        // Validar que el usuario existe
        const userExists = await validateIdExists(client, 'users', 'user_id', responsible.user_id);
        if (!userExists) {
          throw new Error(`User with ID ${responsible.user_id} does not exist`);
        }

        await client.query(
          `INSERT INTO product_responsibles (product_id, user_id, role_label, is_primary, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            product_id, 
            responsible.user_id, 
            responsible.role_label?.trim() || null, 
            responsible.is_primary || false, 
            responsible.position || null
          ]
        );
      }
      console.log(`   ✓ Updated ${responsibles.length} responsibles`);
    }

    // 3. Eliminar y recrear organizations
    await client.query('DELETE FROM product_organizations WHERE product_id = $1', [product_id]);
    
    if (organizations && organizations.length > 0) {
      for (const org of organizations) {
        // Validar estructura del objeto
        if (!org.organization_id || typeof org.organization_id !== 'number') {
          throw new Error('Each organization must have a valid organization_id');
        }

        // Validar que la organización existe
        const orgExists = await validateIdExists(client, 'organizations', 'organization_id', org.organization_id);
        if (!orgExists) {
          throw new Error(`Organization with ID ${org.organization_id} does not exist`);
        }

        await client.query(
          `INSERT INTO product_organizations (product_id, organization_id, relation_type, position)
           VALUES ($1, $2, $3, $4)`,
          [
            product_id, 
            org.organization_id, 
            org.relation_type?.trim() || null, 
            org.position || null
          ]
        );
      }
      console.log(`   ✓ Updated ${organizations.length} organizations`);
    }

    // 4. Eliminar y recrear indicators
    await client.query('DELETE FROM product_indicators WHERE product_id = $1', [product_id]);
    
    if (indicators && indicators.length > 0) {
      for (const indicatorId of indicators) {
        // Validar que sea un número
        if (typeof indicatorId !== 'number') {
          throw new Error('Each indicator must be a valid number');
        }

        // Validar que el indicador existe
        const indicatorExists = await validateIdExists(client, 'indicators', 'indicator_id', indicatorId);
        if (!indicatorExists) {
          throw new Error(`Indicator with ID ${indicatorId} does not exist`);
        }

        await client.query(
          `INSERT INTO product_indicators (product_id, indicator_id)
           VALUES ($1, $2)`,
          [product_id, indicatorId]
        );
      }
      console.log(`   ✓ Updated ${indicators.length} indicators`);
    }

    // Commit de la transacción
    await client.query('COMMIT');

    console.log(`✅ Product ${product_id} updated successfully`);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      productId: product_id
    });

  } catch (error) {
    // Rollback en caso de error
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('❌ Error during rollback:', rollbackError);
    }
    
    console.error('❌ Error updating product:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
