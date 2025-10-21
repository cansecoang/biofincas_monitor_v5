import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          o.organization_id,
          o.organization_name,
          o.organization_description,
          o.organization_type,
          c.country_name as organization_country
        FROM organizations o
        LEFT JOIN countries c ON o.country_id = c.country_id
        ORDER BY o.organization_name
      `;
      const result = await client.query(query);
      
      return NextResponse.json({
        organizations: result.rows
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, type, country } = await request.json();
    const client = await pool.connect();
    
    try {
      // Find country_id based on country name
      let countryId = null;
      if (country) {
        const countryQuery = `SELECT country_id FROM countries WHERE country_name = $1`;
        const countryResult = await client.query(countryQuery, [country]);
        if (countryResult.rows.length > 0) {
          countryId = countryResult.rows[0].country_id;
        }
      }

      const query = `
        INSERT INTO organizations (organization_name, organization_description, organization_type, country_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, type, countryId]);
      
      return NextResponse.json({
        success: true,
        organization: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, description, type, country } = await request.json();
    const client = await pool.connect();
    
    try {
      // Find country_id based on country name
      let countryId = null;
      if (country) {
        const countryQuery = `SELECT country_id FROM countries WHERE country_name = $1`;
        const countryResult = await client.query(countryQuery, [country]);
        if (countryResult.rows.length > 0) {
          countryId = countryResult.rows[0].country_id;
        }
      }

      const query = `
        UPDATE organizations 
        SET organization_name = $1, organization_description = $2, organization_type = $3, country_id = $4
        WHERE organization_id = $5
        RETURNING *
      `;
      
      const result = await client.query(query, [name, description, type, countryId, id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        organization: result.rows[0]
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const client = await pool.connect();
    
    try {
      const query = `
        DELETE FROM organizations 
        WHERE organization_id = $1
        RETURNING organization_id
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Organization deleted successfully'
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
