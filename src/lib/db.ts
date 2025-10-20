import { Pool } from 'pg';

// Debug: mostrar configuración de base de datos
console.log('🔧 DB Configuration:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
  POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
  DB_HOST: process.env.DB_HOST || 'NOT_SET',
  DB_PORT: process.env.DB_PORT || 'NOT_SET',
  DB_NAME: process.env.DB_NAME || 'NOT_SET',
  DB_USER: process.env.DB_USER || 'NOT_SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET'
});

// Configuración flexible con manejo de errores mejorado
let connectionConfig;

try {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('prisma+postgres://')) {
    // Para Prisma Accelerate, usar POSTGRES_URL para conexiones directas
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL not found for Prisma Accelerate configuration');
    }
    connectionConfig = {
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
    };
    console.log('🚀 Using Prisma Accelerate with direct PostgreSQL connection');
  } else if (process.env.DATABASE_URL) {
    // DATABASE_URL estándar
    connectionConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
    console.log('🔗 Using DATABASE_URL connection');
  } else {
    // Variables individuales (fallback)
    connectionConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'BioFincas',
      password: process.env.DB_PASSWORD || '2261',
      port: parseInt(process.env.DB_PORT || '5434'),
      // Para bases de datos en la nube, siempre usar SSL
      ssl: process.env.DB_HOST?.includes('render.com') || 
           process.env.DB_HOST?.includes('postgres') ||
           process.env.DB_HOST?.includes('frankfurt-postgres') ||
           process.env.DB_HOST?.includes('prisma.io')
        ? { rejectUnauthorized: false } 
        : false,
    };
    console.log('⚙️ Using individual environment variables');
  }
} catch (error) {
  console.error('❌ Database configuration error:', error);
  // Fallback a configuración local
  connectionConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'BioFincas',
    password: '2261',
    port: 5434,
    ssl: false,
  };
  console.log('🔄 Using fallback local configuration');
}

const pool = new Pool(connectionConfig);

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export { pool };
