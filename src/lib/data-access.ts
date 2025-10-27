import { pool } from './db';

// Interfaces para TypeScript basadas en tu estructura real
export interface WorkPackage {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  workPackageId: string;
  objective?: string;
}

// Función para obtener todos los work packages desde tu tabla real
export const getWorkPackages = async (): Promise<WorkPackage[]> => {
  try {
    const result = await pool.query(`
      SELECT workpackage_id, workpackage_name, workpackage_description 
      FROM workpackages 
      ORDER BY workpackage_name
    `);
    
    console.log('📋 Work packages obtenidos:', result.rows.length);
    
    return result.rows.map((row: { workpackage_id: number; workpackage_name: string; workpackage_description: string }) => ({
      id: row.workpackage_id.toString(),
      name: row.workpackage_name,
      description: row.workpackage_description
    }));
  } catch (error) {
    console.error('Error fetching work packages:', error);
    throw new Error('Failed to fetch work packages');
  }
};

// Función para obtener products por work package desde tu tabla real
export const getProductsByWorkPackage = async (workPackageId: string): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT 
        product_id, 
        product_name, 
        product_objective,
        workpackage_id
      FROM products 
      WHERE workpackage_id = $1 
      ORDER BY product_name
    `, [workPackageId]);
    
    console.log(`📋 Products obtenidos para WP ${workPackageId}:`, result.rows.length);
    
    return result.rows.map((row: { product_id: number; product_name: string; workpackage_id: number; product_objective: string }) => ({
      id: row.product_id.toString(),
      name: row.product_name,
      workPackageId: row.workpackage_id.toString(),
      objective: row.product_objective
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error('Failed to fetch products');
  }
};

// Función SIMPLE para obtener productos por work package y output
export const getProductsByWorkPackageAndOutput = async (workPackageId: string, outputNumber: string): Promise<Product[]> => {
  try {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] NUEVA FUNCIÓN - Buscando productos con WP: ${workPackageId} y Output: ${outputNumber}`);
    
    const result = await pool.query(`
      SELECT 
        product_id, 
        product_name, 
        product_objective,
        workpackage_id,
        product_output
      FROM products p
      WHERE p.workpackage_id = $1 
      AND p.product_output = $2
      ORDER BY p.product_name
    `, [workPackageId, outputNumber]);
    
    console.log(`✅ [${timestamp}] Productos encontrados: ${result.rows.length}`, 
                 result.rows.map(r => `${r.product_name} (WP:${r.workpackage_id}, Output:${r.product_output})`));
    
    return result.rows.map((row: { product_id: number; product_name: string; workpackage_id: number; product_objective: string; product_output: number }) => ({
      id: row.product_id.toString(),
      name: row.product_name,
      workPackageId: row.workpackage_id.toString(),
      outputNumber: row.product_output.toString(), // 🎯 Directamente desde product_output
      objective: row.product_objective
    }));
  } catch (error) {
    console.error('Error fetching products by workpackage and output:', error);
    throw new Error('Failed to fetch products by workpackage and output');
  }
};

// Función para obtener la matriz de productos por output
export const getProductMatrixByOutput = async (outputId: string) => {
  try {
    console.log(`🔍 Fetching product matrix for output: ${outputId}`);
    
    // Get all indicators for this output
    const indicatorsQuery = `
      SELECT 
        indicator_id as id,
        indicator_code as code,
        indicator_name as name,
        output_number as "outputNumber"
      FROM indicators
      WHERE output_number = $1
      ORDER BY indicator_code
    `;
    const indicatorsResult = await pool.query(indicatorsQuery, [outputId]);
    const indicators = indicatorsResult.rows;
    
    console.log(`📊 Found ${indicators.length} indicators for output ${outputId}`);

    // Get all countries that have products in this output
    const countriesQuery = `
      SELECT DISTINCT
        c.country_id as id,
        c.country_name as name
      FROM countries c
      INNER JOIN products p ON c.country_id = p.country_id
      INNER JOIN indicators i ON p.indicator_id = i.indicator_id
      WHERE i.output_number = $1
      ORDER BY c.country_name
    `;
    const countriesResult = await pool.query(countriesQuery, [outputId]);
    const countries = countriesResult.rows;
    
    console.log(`🌍 Found ${countries.length} countries with products in output ${outputId}`);

    // Get all products for this output
    const productsQuery = `
      SELECT 
        p.product_id as id,
        p.product_name as name,
        p.work_package_id as "workPackageId",
        p.delivery_date as "deliveryDate",
        p.country_id as "countryId",
        p.indicator_id as "indicatorId",
        i.output_number as "outputNumber",
        org.organization_name as "productOwnerName"
      FROM products p
      INNER JOIN indicators i ON p.indicator_id = i.indicator_id
      LEFT JOIN organizations org ON p.product_owner_id = org.organization_id
      WHERE i.output_number = $1
      ORDER BY p.product_name
    `;
    const productsResult = await pool.query(productsQuery, [outputId]);
    const products = productsResult.rows;
    
    console.log(`📦 Found ${products.length} total products for output ${outputId}`);

    // Build the matrix
    const matrix = countries.map(country => {
      const row: any[] = [country]; // First cell is the country
      
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
    
    console.log(`✅ Matrix built successfully: ${countries.length} countries × ${indicators.length} indicators = ${totalProducts} products`);

    return {
      indicators,
      matrix,
      totalProducts
    };
  } catch (error) {
    console.error('Error fetching product matrix:', error);
    throw new Error('Failed to fetch product matrix');
  }
};

// Función para obtener todos los products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const result = await pool.query(`
      SELECT 
        product_id, 
        product_name, 
        product_objective,
        workpackage_id
      FROM products 
      ORDER BY product_name
    `);
    
    console.log('📋 Total products obtenidos:', result.rows.length);
    
    return result.rows.map((row: { product_id: number; product_name: string; workpackage_id?: number; product_objective: string }) => ({
      id: row.product_id.toString(),
      name: row.product_name,
      workPackageId: row.workpackage_id?.toString() || '0',
      objective: row.product_objective
    }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw new Error('Failed to fetch products');
  }
};
