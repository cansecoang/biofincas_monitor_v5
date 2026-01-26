import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    // Get detailed product information with primary organization
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        p.product_objective,
        p.deliverable,
        TO_CHAR(p.delivery_date, 'YYYY-MM-DD') AS delivery_date,
        p.product_output_id,
        p.methodology_description,
        p.product_owner_id,
        o.organization_name AS primary_organization,
        o.organization_description AS primary_org_description,
        out.output_number,
        out.output_name
      FROM products p
      LEFT JOIN organizations o ON o.organization_id = p.product_owner_id
      LEFT JOIN outputs out ON out.output_id = p.product_output_id
      WHERE p.product_id = $1
    `;

    // Get responsible users through product_responsibles table
    const responsiblesQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.user_last_name,
        u.user_email,
        pr.role_label,
        COALESCE(pr.is_primary, false) AS is_primary,
        pr.position
      FROM product_responsibles pr
      JOIN users u ON u.user_id = pr.user_id
      WHERE pr.product_id = $1
      ORDER BY COALESCE(pr.position, 32767), u.user_name
    `;

    // Get related indicators through product_indicators table
    const indicatorsQuery = `
      SELECT 
        i.indicator_id,
        i.indicator_code,
        i.output_number,
        i.indicator_description
      FROM product_indicators pi
      JOIN indicators i ON i.indicator_id = pi.indicator_id
      WHERE pi.product_id = $1
      ORDER BY i.indicator_id
    `;

    // Get all organizations involved through product_organizations table
    const organizationsQuery = `
      SELECT 
        o.organization_id,
        o.organization_name,
        o.organization_description,
        po.relation_type,
        po.position
      FROM product_organizations po
      JOIN organizations o ON o.organization_id = po.organization_id
      WHERE po.product_id = $1
      ORDER BY COALESCE(po.position, 32767), o.organization_name
    `;

    // Execute queries
    const productResult = await pool.query(productQuery, [productId]);
    
    let responsiblesResult = { rows: [] };
    let indicatorsResult = { rows: [] };
    let organizationsResult = { rows: [] };
    
    try {
      responsiblesResult = await pool.query(responsiblesQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch responsibles:', error);
    }
    
    try {
      indicatorsResult = await pool.query(indicatorsQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch indicators:', error);
    }

    try {
      organizationsResult = await pool.query(organizationsQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch organizations:', error);
    }

    const product = productResult.rows[0];
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({
      product: {
        id: product.product_id,
        name: product.product_name,
        objective: product.product_objective,
        deliverable: product.deliverable,
        deliveryDate: product.delivery_date,
        outputId: product.product_output_id,
        outputNumber: product.output_number,
        outputName: product.output_name,
        methodologyDescription: product.methodology_description,
        primaryOrganizationId: product.product_owner_id,
        primaryOrganization: product.primary_organization
      },
      // Primary organization (from product owner)
      primaryOrganization: product.primary_organization ? {
        organization_name: product.primary_organization,
        organization_description: product.primary_org_description
      } : null,
      // All organizations involved (from product_organizations table)
      organizations: organizationsResult.rows,
      // Responsible users
      responsibles: responsiblesResult.rows,
      // Related indicators
      indicators: indicatorsResult.rows,
      // Distributors section - keeping empty arrays for backward compatibility
      distributors: {
        organizations: [],
        users: [],
        others: []
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ 
      error: 'Failed to fetch product details',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
