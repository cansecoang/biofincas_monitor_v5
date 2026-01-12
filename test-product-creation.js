const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://02742d9d0b869f1a14dbb99efeed1fedc40ffe9a6ab10ed2b3c7a0aee85d9ae9:sk_OMqwSCOH5Fzw8LsyuLuWB@db.prisma.io:5432/postgres?sslmode=require'
});

async function testProductCreation() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Iniciando prueba de creación de producto...\n');

    await client.query('BEGIN');

    // 1. Crear datos de prueba necesarios
    console.log('1. Creando datos de prueba...');
    
    // Country
    const countryResult = await client.query(`
      INSERT INTO countries (country_name) 
      VALUES ('Test Country') 
      ON CONFLICT (country_name) DO UPDATE SET country_name = EXCLUDED.country_name
      RETURNING country_id
    `);
    const countryId = countryResult.rows[0].country_id;
    console.log(`   ✓ Country creado: ID ${countryId}`);

    // Organization
    const orgResult = await client.query(`
      INSERT INTO organizations (organization_name, organization_type, country_id) 
      VALUES ('Test Organization', 'M', $1) 
      ON CONFLICT (organization_name) DO UPDATE SET organization_name = EXCLUDED.organization_name
      RETURNING organization_id
    `, [countryId]);
    const orgId = orgResult.rows[0].organization_id;
    console.log(`   ✓ Organization creada: ID ${orgId}`);

    // User
    const userResult = await client.query(`
      INSERT INTO users (user_name, user_email, organization_id, country_id) 
      VALUES ('Test User', 'test@example.com', $1, $2) 
      ON CONFLICT (user_email) DO UPDATE SET user_email = EXCLUDED.user_email
      RETURNING user_id
    `, [orgId, countryId]);
    const userId = userResult.rows[0].user_id;
    console.log(`   ✓ User creado: ID ${userId}`);

    // Output
    const outputResult = await client.query(`
      INSERT INTO outputs (output_number, output_name) 
      VALUES ('OUT-001', 'Test Output') 
      ON CONFLICT (output_number) DO UPDATE SET output_number = EXCLUDED.output_number
      RETURNING output_id
    `);
    const outputId = outputResult.rows[0].output_id;
    console.log(`   ✓ Output creado: ID ${outputId}`);

    // Indicator
    const indicatorResult = await client.query(`
      INSERT INTO indicators (indicator_code, indicator_description) 
      VALUES ('IND-001', 'Test Indicator') 
      ON CONFLICT (indicator_code) DO UPDATE SET indicator_code = EXCLUDED.indicator_code
      RETURNING indicator_id
    `);
    const indicatorId = indicatorResult.rows[0].indicator_id;
    console.log(`   ✓ Indicator creado: ID ${indicatorId}\n`);

    // 2. Crear producto de prueba
    console.log('2. Creando producto de prueba...');
    const productResult = await client.query(`
      INSERT INTO products (
        product_name, 
        product_objective,
        deliverable,
        delivery_date,
        product_output_id,
        methodology_description,
        product_owner_id,
        country_id,
        responsable_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING product_id;
    `, [
      'Test Product',
      'This is a test product objective',
      'Test Deliverable',
      '2026-12-31',
      outputId,
      'Test methodology',
      orgId,
      countryId,
      userId
    ]);

    const productId = productResult.rows[0].product_id;
    console.log(`   ✓ Producto creado: ID ${productId}\n`);

    // 3. Agregar relaciones
    console.log('3. Agregando relaciones...');
    
    // Product responsibles
    await client.query(`
      INSERT INTO product_responsibles (product_id, user_id, is_primary, position)
      VALUES ($1, $2, true, 1)
    `, [productId, userId]);
    console.log(`   ✓ Responsible agregado`);

    // Product indicators
    await client.query(`
      INSERT INTO product_indicators (product_id, indicator_id)
      VALUES ($1, $2)
    `, [productId, indicatorId]);
    console.log(`   ✓ Indicator relacionado`);

    // Product organizations
    await client.query(`
      INSERT INTO product_organizations (product_id, organization_id, relation_type, position)
      VALUES ($1, $2, 'collaborator', 1)
    `, [productId, orgId]);
    console.log(`   ✓ Organization relacionada\n`);

    // 4. Verificar el producto creado
    console.log('4. Verificando producto creado...');
    const verifyResult = await client.query(`
      SELECT 
        p.*,
        o.output_name,
        org.organization_name,
        u.user_name,
        c.country_name
      FROM products p
      LEFT JOIN outputs o ON p.product_output_id = o.output_id
      LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
      LEFT JOIN users u ON p.responsable_id = u.user_id
      LEFT JOIN countries c ON p.country_id = c.country_id
      WHERE p.product_id = $1
    `, [productId]);

    console.log('\n📋 Producto creado exitosamente:');
    console.log('   ID:', verifyResult.rows[0].product_id);
    console.log('   Nombre:', verifyResult.rows[0].product_name);
    console.log('   Output:', verifyResult.rows[0].output_name);
    console.log('   Owner:', verifyResult.rows[0].organization_name);
    console.log('   Responsable:', verifyResult.rows[0].user_name);
    console.log('   País:', verifyResult.rows[0].country_name);

    await client.query('COMMIT');
    console.log('\n✅ Prueba completada exitosamente!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error en la prueba:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testProductCreation();
