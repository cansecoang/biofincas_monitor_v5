import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const outputId = searchParams.get('outputId');

  if (!outputId) {
    return NextResponse.json(
      { error: 'outputId is required' },
      { status: 400 }
    );
  }

  try {
    console.log('Building matrix for output:', outputId);

    const indicatorsQuery = `
      SELECT 
        indicator_id as id,
        indicator_code as code,
        indicator_name as name,
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) as "outputNumber"
      FROM indicators
      WHERE CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER) = $1
      ORDER BY 
        CAST(SPLIT_PART(indicator_code, '.', 1) AS INTEGER),
        CAST(SPLIT_PART(indicator_code, '.', 2) AS INTEGER)
    `;
    const indicatorsResult = await pool.query(indicatorsQuery, [outputId]);
    const indicators = indicatorsResult.rows;
    console.log('Found indicators:', indicators.length);

    const countriesQuery = `
      SELECT DISTINCT
        c.country_id as id,
        c.country_name as name
      FROM countries c
      INNER JOIN products p ON c.country_id = p.country_id
      INNER JOIN product_indicators pi ON p.product_id = pi.product_id
      INNER JOIN indicators i ON pi.indicator_id = i.indicator_id
      WHERE CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $1
      ORDER BY c.country_name
    `;
    const countriesResult = await pool.query(countriesQuery, [outputId]);
    const countries = countriesResult.rows;
    console.log('Found countries:', countries.length);

    const productsQuery = `
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
      WHERE CAST(SPLIT_PART(i.indicator_code, '.', 1) AS INTEGER) = $1
      ORDER BY p.product_name
    `;
    const productsResult = await pool.query(productsQuery, [outputId]);
    const products = productsResult.rows;
    console.log('Found products:', products.length);

    const matrix = countries.map(country => {
      const row: any[] = [country];
      
      indicators.forEach(indicator => {
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

    const totalProducts = products.length;

    console.log('Matrix built:', countries.length, 'x', indicators.length);

    return NextResponse.json({
      indicators,
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
