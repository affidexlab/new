import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export const getPool = async () => pool;

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

const runSqlFile = async (relativePath) => {
  const filePath = join(__dirname, relativePath);
  const sql = readFileSync(filePath, 'utf8');
  await query(sql);
};

const hasBaseSchema = async () => {
  try {
    const result = await query("SELECT to_regclass('public.users') as reg");
    return Boolean(result.rows[0]?.reg);
  } catch (error) {
    console.warn('⚠️  Failed to check base schema:', error.message);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    const schemaExists = await hasBaseSchema();
    if (!schemaExists) {
      await runSqlFile('schema.sql');
      console.log('✅ Database schema initialized successfully');
    } else {
      console.log('ℹ️  Base schema already initialized, skipping schema.sql');
    }
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }

  try {
    await runSqlFile('migrations/007_liquidity_tracking.sql');
    console.log('✅ Liquidity tracking migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Liquidity tracking migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Liquidity tracking migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/008_enquiry_tables.sql');
    console.log('✅ Enquiry tables migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Enquiry tables migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Enquiry tables migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/009_shield_tables.sql');
    console.log('✅ Shield tables migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Shield tables migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Shield tables migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  return true;
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
