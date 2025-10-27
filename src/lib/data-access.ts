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
