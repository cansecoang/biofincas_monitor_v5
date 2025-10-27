import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const outputId = searchParams.get('outputId');
  const workpackageId = searchParams.get('workpackageId');
  const countryId = searchParams.get('countryId');

  try {
    console.log('Building matrix for:', { outputId, workpackageId, countryId });

    // Build indicators query - only filter by output if provided
    let indicatorsQuery = `
      SELECT 
        indicator_id as id,
        indicator_code as code,
        indicator_name as name,
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) as "outputNumber"
      FROM indicators
    `;
    
    const indicatorsParams: any[] = [];
    let indicatorParamIndex = 1;
    
    if (outputId) {
      indicatorsQuery += ` WHERE CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) = $${indicatorParamIndex}`;
      indicatorsParams.push(outputId);
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

    // Build countries query with optional filters
    let countriesQuery = `
      SELECT DISTINCT
        c.country_id as id,
        c.country_name as name
      FROM countries c
      INNER JOIN products p ON c.country_id = p.country_id
      INNER JOIN product_indicators pi ON p.product_id = pi.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
    `;
    
    const countriesParams: any[] = [];
    let countryParamIndex = 1;
    const countryConditions: string[] = [];
    
    if (outputId) {
      countryConditions.push(`CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $${countryParamIndex}`);
      countriesParams.push(outputId);
      countryParamIndex++;
    }
    
    if (workpackageId) {
      countryConditions.push(`p.workpackage_id = $${countryParamIndex}`);
      countriesParams.push(workpackageId);
      countryParamIndex++;
    }
    
    if (countryId) {
      countryConditions.push(`c.country_id = $${countryParamIndex}`);
      countriesParams.push(countryId);
      countryParamIndex++;
    }
    
    if (countryConditions.length > 0) {
      countriesQuery += ` WHERE ${countryConditions.join(' AND ')}`;
    }
    
    countriesQuery += ` ORDER BY c.country_name`;
    
    const countriesResult = await pool.query(countriesQuery, countriesParams);
    const countries = countriesResult.rows;
    console.log('Found countries:', countries.length);

    // Build products query with optional filters
    let productsQuery = `
      SELECT 
        p.product_id as id,
        p.product_name as name,
        p.workpackage_id as "workPackageId",
        p.delivery_date as "deliveryDate",
        p.country_id as "countryId",
        pi.indicator_id as "indicatorId",
        CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) as "outputNumber",
        org.organization_name as "productOwnerName"
      FROM products p
      INNER JOIN product_indicators pi ON p.product_id = pi.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
      LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
    `;
    
    const productsParams: any[] = [];
    let productParamIndex = 1;
    const productConditions: string[] = [];
    
    if (outputId) {
      productConditions.push(`CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $${productParamIndex}`);
      productsParams.push(outputId);
      productParamIndex++;
    }
    
    if (workpackageId) {
      productConditions.push(`p.workpackage_id = $${productParamIndex}`);
      productsParams.push(workpackageId);
      productParamIndex++;
    }
    
    if (countryId) {
      productConditions.push(`p.country_id = $${productParamIndex}`);
      productsParams.push(countryId);
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

    const matrix = countries.map(country => {
      const row: any[] = [country];
      
      indicatorsWithProducts.forEach(indicator => {
        const cellProducts = products.filter(
          p => p.countryId === country.id && p.indicatorId === indicator.id
        );
        
        row.push({
          indicator,
          country,
          products: cellProducts
        });
      });
      
      return row;
    });

    // Count unique products (a product can have multiple indicators)
    const uniqueProductIds = new Set(products.map(p => p.id));
    const totalProducts = uniqueProductIds.size;

    console.log('Matrix built:', countries.length, 'x', indicatorsWithProducts.length);
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
