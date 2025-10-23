import { pool } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return Response.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    // Get detailed product information with primary organization and country
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        p.product_objective,
        p.deliverable,
        TO_CHAR(p.delivery_date, 'YYYY-MM-DD') AS delivery_date,
        p.product_output,
        p.methodology_description,
        p.gender_specific_actions,
        p.next_steps,
        p.workpackage_id,
        p.workinggroup_id,
        p.product_owner_id,
        p.country_id,
        w.workpackage_name,
        wg.workinggroup_name,
        o.organization_name AS primary_organization,
        o.organization_description AS primary_org_description,
        c.country_name
      FROM products p
      LEFT JOIN workpackages w ON w.workpackage_id = p.workpackage_id
      LEFT JOIN workinggroup wg ON wg.workinggroup_id = p.workinggroup_id
      LEFT JOIN organizations o ON o.organization_id = p.product_owner_id
      LEFT JOIN countries c ON c.country_id = p.country_id
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
        i.indicator_name,
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

    // Get distributor organizations
    const distributorOrgsQuery = `
      SELECT 
        o.organization_id,
        o.organization_name,
        o.organization_description,
        d.position
      FROM product_distributor_orgs d
      JOIN organizations o ON o.organization_id = d.organization_id
      WHERE d.product_id = $1
      ORDER BY COALESCE(d.position, 32767), o.organization_name
    `;

    // Get distributor users
    const distributorUsersQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        u.user_last_name,
        u.user_email,
        d.position
      FROM product_distributor_users d
      JOIN users u ON u.user_id = d.user_id
      WHERE d.product_id = $1
      ORDER BY COALESCE(d.position, 32767), u.user_name
    `;

    // Get other distributors
    const distributorOthersQuery = `
      SELECT 
        display_name,
        contact,
        position
      FROM product_distributor_others
      WHERE product_id = $1
      ORDER BY COALESCE(position, 32767), display_name
    `;

    // Execute queries - handle them separately to avoid all failing if one fails
    const productResult = await pool.query(productQuery, [productId]);
    
    let responsiblesResult = { rows: [] };
    let indicatorsResult = { rows: [] };
    let organizationsResult = { rows: [] };
    let distributorOrgsResult = { rows: [] };
    let distributorUsersResult = { rows: [] };
    let distributorOthersResult = { rows: [] };
    
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

    try {
      distributorOrgsResult = await pool.query(distributorOrgsQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch distributor orgs:', error);
    }

    try {
      distributorUsersResult = await pool.query(distributorUsersQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch distributor users:', error);
    }

    try {
      distributorOthersResult = await pool.query(distributorOthersQuery, [productId]);
    } catch (error) {
      console.warn('Could not fetch distributor others:', error);
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
        outputNumber: product.product_output,
        methodologyDescription: product.methodology_description,
        genderSpecificActions: product.gender_specific_actions,
        nextSteps: product.next_steps,
        workPackageId: product.workpackage_id,
        workPackageName: product.workpackage_name,
        workingGroupId: product.workinggroup_id,
        workingGroupName: product.workinggroup_name,
        primaryOrganizationId: product.product_owner_id,
        primaryOrganization: product.primary_organization,
        countryId: product.country_id,
        country: product.country_name
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
      // Distributors section
      distributors: {
        organizations: distributorOrgsResult.rows,
        users: distributorUsersResult.rows,
        others: distributorOthersResult.rows
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
