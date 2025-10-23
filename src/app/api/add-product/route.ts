import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import type { PoolClient } from 'pg';

// Función helper para obtener el nombre correcto de la tabla working groups
type TableRow = { table_name: string };

async function getWorkingGroupTableName(client: PoolClient): Promise<string> {
  const tableCheck = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_name IN ('workinggroup', 'working_groups', 'workinggroups')
  `);
  
  if (tableCheck.rows.length === 0) {
    throw new Error('No se encontró tabla workinggroup, working_groups ni workinggroups');
  }
  
  // Prioridad: workinggroups > working_groups > workinggroup
  if (tableCheck.rows.some((row: TableRow) => row.table_name === 'workinggroups')) {
    return 'workinggroups';
  }
  if (tableCheck.rows.some((row: TableRow) => row.table_name === 'working_groups')) {
    return 'working_groups';
  }
  return 'workinggroup';
}

// Función helper para validar que un ID existe en una tabla
async function validateIdExists(client: any, table: string, idColumn: string, id: number): Promise<boolean> {
  try {
    console.log(`Validating: SELECT 1 FROM ${table} WHERE ${idColumn} = ${id}`);
    const result = await client.query(`SELECT 1 FROM ${table} WHERE ${idColumn} = $1`, [id]);
    console.log(`Validation result: ${result.rows.length} rows found`);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error validating ${table}.${idColumn}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Parse y validación inicial del body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON in request body'
      }, { status: 400 });
    }

    const {
      // Datos básicos del producto
      product_name,
      product_objective,
      deliverable,
      delivery_date,
      product_output,
      methodology_description,
      gender_specific_actions,
      next_steps,
      workpackage_id,
      workinggroup_id,
      product_owner_id,
      country_id,
      
      // Relaciones
      responsibles = [],
      organizations = [],
      indicators = [],
      distributor_orgs = [],
      distributor_users = [],
      distributor_others = []
    } = body;

    // ✅ VALIDACIÓN DE CAMPOS REQUERIDOS
    if (!product_name || typeof product_name !== 'string' || product_name.trim().length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'Product name is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (product_name.length > 255) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'Product name must not exceed 255 characters'
      }, { status: 400 });
    }

    // ✅ VALIDACIÓN DE IDs FORÁNEOS (verificar que existan)
    if (workpackage_id) {
      const wpExists = await validateIdExists(client, 'workpackages', 'workpackage_id', workpackage_id);
      if (!wpExists) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Workpackage with ID ${workpackage_id} does not exist`
        }, { status: 400 });
      }
    }

    if (workinggroup_id) {
      try {
        const wgTableName = await getWorkingGroupTableName(client);
        console.log('Working group table name:', wgTableName);
        console.log('Working group ID to validate:', workinggroup_id);
        
        const wgExists = await validateIdExists(client, wgTableName, 'workinggroup_id', workinggroup_id);
        console.log('Working group exists:', wgExists);
        
        if (!wgExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `Working group with ID ${workinggroup_id} does not exist in table ${wgTableName}`
          }, { status: 400 });
        }
      } catch (error) {
        console.error('Error validating working group:', error);
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Error validating working group: ${error instanceof Error ? error.message : 'Unknown error'}`
        }, { status: 400 });
      }
    }

    if (product_owner_id) {
      const ownerExists = await validateIdExists(client, 'organizations', 'organization_id', product_owner_id);
      if (!ownerExists) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Product owner organization with ID ${product_owner_id} does not exist`
        }, { status: 400 });
      }
    }

    if (country_id) {
      const countryExists = await validateIdExists(client, 'countries', 'country_id', country_id);
      if (!countryExists) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Country with ID ${country_id} does not exist`
        }, { status: 400 });
      }
    }

    // ✅ VALIDACIÓN DE FECHAS
    if (delivery_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(delivery_date)) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: 'Delivery date must be in YYYY-MM-DD format'
        }, { status: 400 });
      }
    }

    // ✅ VALIDACIÓN DE ARRAYS
    if (!Array.isArray(responsibles) || !Array.isArray(organizations) || 
        !Array.isArray(indicators) || !Array.isArray(distributor_orgs) || 
        !Array.isArray(distributor_users) || !Array.isArray(distributor_others)) {
      await client.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        message: 'All relation fields must be arrays'
      }, { status: 400 });
    }

    // 1. Insertar el producto principal
    const productQuery = `
      INSERT INTO products (
        product_name, 
        product_objective,
        deliverable,
        delivery_date,
        product_output,
        methodology_description,
        gender_specific_actions,
        next_steps,
        workpackage_id,
        workinggroup_id,
        product_owner_id,
        country_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING product_id;
    `;

    const productResult = await client.query(productQuery, [
      product_name.trim(),
      product_objective?.trim() || null,
      deliverable?.trim() || null,
      delivery_date || null,
      product_output?.trim() || null,
      methodology_description?.trim() || null,
      gender_specific_actions?.trim() || null,
      next_steps?.trim() || null,
      workpackage_id || null,
      workinggroup_id || null,
      product_owner_id || null,
      country_id || null
    ]);

    const productId = productResult.rows[0].product_id;

    // 2. Insertar responsables (con validación)
    if (responsibles && responsibles.length > 0) {
      for (const responsible of responsibles) {
        // Validar estructura del objeto
        if (!responsible.user_id || typeof responsible.user_id !== 'number') {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each responsible must have a valid user_id'
          }, { status: 400 });
        }

        // Validar que el usuario existe
        const userExists = await validateIdExists(client, 'users', 'user_id', responsible.user_id);
        if (!userExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `User with ID ${responsible.user_id} does not exist`
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_responsibles (product_id, user_id, role_label, is_primary, position)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            productId, 
            responsible.user_id, 
            responsible.role_label?.trim() || null, 
            responsible.is_primary || false, 
            responsible.position || null
          ]
        );
      }
    }

    // 3. Insertar organizaciones involucradas (con validación)
    if (organizations && organizations.length > 0) {
      for (const org of organizations) {
        // Validar estructura del objeto
        if (!org.organization_id || typeof org.organization_id !== 'number') {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each organization must have a valid organization_id'
          }, { status: 400 });
        }

        // Validar que la organización existe
        const orgExists = await validateIdExists(client, 'organizations', 'organization_id', org.organization_id);
        if (!orgExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `Organization with ID ${org.organization_id} does not exist`
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_organizations (product_id, organization_id, relation_type, position)
           VALUES ($1, $2, $3, $4)`,
          [
            productId, 
            org.organization_id, 
            org.relation_type?.trim() || null, 
            org.position || null
          ]
        );
      }
    }

    // 4. Insertar indicadores relacionados (con validación)
    if (indicators && indicators.length > 0) {
      for (const indicatorId of indicators) {
        // Validar que sea un número
        if (typeof indicatorId !== 'number') {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each indicator must be a valid number'
          }, { status: 400 });
        }

        // Validar que el indicador existe
        const indicatorExists = await validateIdExists(client, 'indicators', 'indicator_id', indicatorId);
        if (!indicatorExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `Indicator with ID ${indicatorId} does not exist`
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_indicators (product_id, indicator_id)
           VALUES ($1, $2)`,
          [productId, indicatorId]
        );
      }
    }

    // 5. Insertar distribuidores organizaciones (con validación)
    if (distributor_orgs && distributor_orgs.length > 0) {
      for (let i = 0; i < distributor_orgs.length; i++) {
        const orgId = distributor_orgs[i];
        
        // Validar que sea un número
        if (typeof orgId !== 'number') {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each distributor organization must be a valid number'
          }, { status: 400 });
        }

        // Validar que la organización existe
        const orgExists = await validateIdExists(client, 'organizations', 'organization_id', orgId);
        if (!orgExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `Distributor organization with ID ${orgId} does not exist`
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_distributor_orgs (product_id, organization_id, position)
           VALUES ($1, $2, $3)`,
          [productId, orgId, i + 1]
        );
      }
    }

    // 6. Insertar distribuidores usuarios (con validación)
    if (distributor_users && distributor_users.length > 0) {
      for (let i = 0; i < distributor_users.length; i++) {
        const userId = distributor_users[i];
        
        // Validar que sea un número
        if (typeof userId !== 'number') {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each distributor user must be a valid number'
          }, { status: 400 });
        }

        // Validar que el usuario existe
        const userExists = await validateIdExists(client, 'users', 'user_id', userId);
        if (!userExists) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: `Distributor user with ID ${userId} does not exist`
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_distributor_users (product_id, user_id, position)
           VALUES ($1, $2, $3)`,
          [productId, userId, i + 1]
        );
      }
    }

    // 7. Insertar otros distribuidores (con validación)
    if (distributor_others && distributor_others.length > 0) {
      for (let i = 0; i < distributor_others.length; i++) {
        const other = distributor_others[i];
        
        // Validar estructura del objeto
        if (!other.display_name || typeof other.display_name !== 'string' || other.display_name.trim().length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({
            success: false,
            message: 'Each distributor other must have a valid display_name'
          }, { status: 400 });
        }

        await client.query(
          `INSERT INTO product_distributor_others (product_id, display_name, contact, position)
           VALUES ($1, $2, $3, $4)`,
          [
            productId, 
            other.display_name.trim(), 
            other.contact?.trim() || null, 
            i + 1
          ]
        );
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      productId: productId
    }, { status: 201 });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    
    // No exponer detalles internos en producción
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json({
      success: false,
      message: isProduction 
        ? 'An error occurred while creating the product' 
        : 'Error creating product',
      ...(isProduction ? {} : { error: error instanceof Error ? error.message : 'Unknown error' })
    }, { status: 500 });

  } finally {
    client.release();
  }
}
