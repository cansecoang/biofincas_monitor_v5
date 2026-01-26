import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const outputNumber = searchParams.get('outputId'); // Recibe output_number (mantener nombre del parámetro por compatibilidad)
  const organizationId = searchParams.get('organizationId');

  try {
    console.log('Building matrix for:', { outputNumber, organizationId });

    // Build indicators query - only filter by output if provided
    let indicatorsQuery = `
      SELECT 
        indicator_id as id,
        indicator_code as code,
        indicator_description as name,
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) as "outputNumber"
      FROM indicators
    `;
    
    const indicatorsParams: any[] = [];
    let indicatorParamIndex = 1;
    
    if (outputNumber) {
      indicatorsQuery += ` WHERE CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) = $${indicatorParamIndex}`;
      indicatorsParams.push(outputNumber);
      indicatorParamIndex++;
    }
    
    indicatorsQuery += ` 
      ORDER BY 
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER),
        CAST(SPLIT_PART(indicator_code, '.', 2) AS INTEGER)
    `;
    
    const indicatorsResult = await pool.query(indicatorsQuery, indicatorsParams);
    const indicators = indicatorsResult.rows;
    console.log('Found indicators:', indicators.length);

    // Build organizations query with optional filters
    // Use product_owner_id instead of product_organizations for getting organizations
    let organizationsQuery = `
      SELECT DISTINCT
        o.organization_id as id,
        o.organization_name as name
      FROM organizations o
      WHERE EXISTS (
        SELECT 1 FROM products p
        WHERE p.product_owner_id = o.organization_id
        ${outputNumber ? `AND EXISTS (
          SELECT 1 FROM product_indicators pi
          INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
          WHERE pi.product_id = p.product_id
          AND CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $1
        )` : ''}
      )
    `;
    
    const organizationsParams: any[] = [];
    if (outputNumber) {
      organizationsParams.push(outputNumber);
    }
    
    if (organizationId) {
      organizationsQuery += ` AND o.organization_id = $${organizationsParams.length + 1}`;
      organizationsParams.push(organizationId);
    }
    
    organizationsQuery += ` ORDER BY o.organization_name`;
    
    const organizationsResult = await pool.query(organizationsQuery, organizationsParams);
    const organizations = organizationsResult.rows;
    console.log('Found organizations:', organizations.length);

    // Build products query with optional filters
    // Use product_owner_id as the organization reference (not product_organizations)
    let productsQuery = `
      SELECT 
        p.product_id as id,
        p.product_name as name,
        p.delivery_date as "deliveryDate",
        p.product_owner_id as "organizationId",
        pi.indicator_id as "indicatorId",
        CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) as "outputNumber",
        org.organization_name as "productOwnerName"
      FROM products p
      LEFT JOIN product_indicators pi ON p.product_id = pi.product_id
      LEFT JOIN indicators i ON pi.indicator_id = i.indicator_id
      LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
    `;
    
    const productsParams: any[] = [];
    let productParamIndex = 1;
    const productConditions: string[] = [];
    
    if (outputNumber) {
      productConditions.push(`CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $${productParamIndex}`);
      productsParams.push(outputNumber);
      productParamIndex++;
    }
    
    if (organizationId) {
      productConditions.push(`p.product_owner_id = $${productParamIndex}`);
      productsParams.push(organizationId);
      productParamIndex++;
    }
    
    if (productConditions.length > 0) {
      productsQuery += ` WHERE ${productConditions.join(' AND ')}`;
    }
    
    productsQuery += ` ORDER BY p.product_name`;
    
    const productsResult = await pool.query(productsQuery, productsParams);
    const products = productsResult.rows;
    console.log('Found products:', products.length);

    // Filter indicators to only include those with products
    const indicatorsWithProducts = indicators.filter(indicator => 
      products.some(p => p.indicatorId === indicator.id)
    );
    console.log('Indicators with products:', indicatorsWithProducts.length, 'out of', indicators.length);

    const matrix = organizations.map(organization => {
      const row: any[] = [organization];
      
      indicatorsWithProducts.forEach(indicator => {
        const cellProducts = products.filter(
          p => p.organizationId === organization.id && p.indicatorId === indicator.id
        );
        
        row.push({
          indicator,
          organization,
          products: cellProducts
        });
      });
      
      return row;
    });

    // Count unique products (a product can have multiple indicators)
    const uniqueProductIds = new Set(products.map(p => p.id));
    const totalProducts = uniqueProductIds.size;

    console.log('Matrix built:', organizations.length, 'x', indicatorsWithProducts.length);
    console.log('Total product-indicator relations:', products.length);
    console.log('Unique products:', totalProducts);

    return NextResponse.json({
      indicators: indicatorsWithProducts,
      matrix,
      totalProducts
    });

  } catch (error) {
    console.error('Error fetching product matrix:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch product matrix data',
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}
