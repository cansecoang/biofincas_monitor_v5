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

// Helper function to get working group table name
async function getWorkingGroupTableName(client: any): Promise<string> {
  const possibleNames = ['workinggroups', 'working_groups', 'workinggroup'];
  
  for (const tableName of possibleNames) {
    try {
      const result = await client.query(
        `SELECT table_name FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_name = $1`,
        [tableName]
      );
      if (result.rows.length > 0) {
        console.log(`✓ Found working group table: ${tableName}`);
        return tableName;
      }
    } catch (error) {
      continue;
    }
  }
  
  throw new Error('Working group table not found');
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
      gender_specific_actions,
      next_steps,
      product_output,
      workpackage_id,
      workinggroup_id,
      product_owner_id,
      country_id,
      responsibles = [],
      organizations = [],
      indicators = [],
      distributor_orgs = [],
      distributor_others = []
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
    if (workpackage_id) {
      const wpExists = await validateIdExists(client, 'workpackages', 'workpackage_id', workpackage_id);
      if (!wpExists) {
        return NextResponse.json(
          { error: `Workpackage with ID ${workpackage_id} does not exist` },
          { status: 400 }
        );
      }
    }

    if (workinggroup_id) {
      const wgTableName = await getWorkingGroupTableName(client);
      const wgExists = await validateIdExists(client, wgTableName, 'workinggroup_id', workinggroup_id);
      if (!wgExists) {
        return NextResponse.json(
          { error: `Working group with ID ${workinggroup_id} does not exist` },
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
        gender_specific_actions = $6,
        next_steps = $7,
        product_output = $8,
        workpackage_id = $9,
        workinggroup_id = $10,
        product_owner_id = $11,
        country_id = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $13
      RETURNING product_id
    `;

    const productResult = await client.query(updateProductQuery, [
      product_name,
      product_objective || null,
      deliverable || null,
      delivery_date || null,
      methodology_description || null,
      gender_specific_actions || null,
      next_steps || null,
      product_output || null,
      workpackage_id || null,
      workinggroup_id || null,
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

    // 5. Eliminar y recrear distributor organizations
    await client.query('DELETE FROM product_distributor_orgs WHERE product_id = $1', [product_id]);
    
    if (distributor_orgs && distributor_orgs.length > 0) {
      for (let i = 0; i < distributor_orgs.length; i++) {
        const orgId = distributor_orgs[i];
        
        // Validar que sea un número
        if (typeof orgId !== 'number') {
          throw new Error('Each distributor organization must be a valid number');
        }

        // Validar que la organización existe
        const orgExists = await validateIdExists(client, 'organizations', 'organization_id', orgId);
        if (!orgExists) {
          throw new Error(`Distributor organization with ID ${orgId} does not exist`);
        }

        await client.query(
          `INSERT INTO product_distributor_orgs (product_id, organization_id, position)
           VALUES ($1, $2, $3)`,
          [product_id, orgId, i + 1]
        );
      }
      console.log(`   ✓ Updated ${distributor_orgs.length} distributor organizations`);
    }

    // 6. Eliminar y recrear distributor others
    await client.query('DELETE FROM product_distributor_others WHERE product_id = $1', [product_id]);
    
    if (distributor_others && distributor_others.length > 0) {
      for (let i = 0; i < distributor_others.length; i++) {
        const other = distributor_others[i];
        
        // Validar estructura del objeto
        if (!other.display_name || typeof other.display_name !== 'string' || other.display_name.trim().length === 0) {
          throw new Error('Each distributor other must have a valid display_name');
        }

        await client.query(
          `INSERT INTO product_distributor_others (product_id, display_name, contact, position)
           VALUES ($1, $2, $3, $4)`,
          [
            product_id, 
            other.display_name.trim(), 
            other.contact?.trim() || null, 
            i + 1
          ]
        );
      }
      console.log(`   ✓ Updated ${distributor_others.length} other distributors`);
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
