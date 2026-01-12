import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import type { PoolClient } from 'pg';

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
      product_output_id,
      methodology_description,
      product_owner_id,
      country_id,
      
      // Relaciones
      responsibles = [],
      organizations = [],
      indicators = []
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
    if (product_output_id) {
      const outputExists = await validateIdExists(client, 'outputs', 'output_id', product_output_id);
      if (!outputExists) {
        await client.query('ROLLBACK');
        return NextResponse.json({
          success: false,
          message: `Output with ID ${product_output_id} does not exist`
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
        !Array.isArray(indicators)) {
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
        product_output_id,
        methodology_description,
        product_owner_id,
        country_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING product_id;
    `;

    const productResult = await client.query(productQuery, [
      product_name.trim(),
      product_objective?.trim() || null,
      deliverable?.trim() || null,
      delivery_date || null,
      product_output_id || null,
      methodology_description?.trim() || null,
      product_owner_id || null,
      country_id || null
      responsable_id || null
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
