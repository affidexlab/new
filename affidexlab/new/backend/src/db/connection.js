import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn('Slow query detected:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text, params, error: error.message });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export const initializeDatabase = async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    await query(schema);
    console.log('✅ Database schema initialized successfully');
    
    const migrationPath = join(__dirname, 'migrations', '007_liquidity_tracking.sql');
    try {
      const migration = readFileSync(migrationPath, 'utf8');
      await query(migration);
      console.log('✅ Liquidity tracking migration applied successfully');
    } catch (migrationError) {
      if (migrationError.code === 'ENOENT') {
        console.log('ℹ️  No liquidity tracking migration file found (may already be applied)');
      } else if (migrationError.message?.includes('already exists')) {
        console.log('ℹ️  Liquidity tracking tables already exist');
      } else {
        console.warn('⚠️  Migration warning:', migrationError.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    await query('SELECT 1');
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export default pool;
