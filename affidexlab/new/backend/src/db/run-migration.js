import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

function buildSslConfig() {
  if (process.env.NODE_ENV !== 'production') return false;

  if (process.env.DATABASE_CA_CERT) {
    return { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') };
  }

  const caPath = process.env.DATABASE_CA_CERT_PATH;
  if (caPath) {
    try {
      return { rejectUnauthorized: true, ca: readFileSync(caPath, 'utf8') };
    } catch (err) {
      throw new Error(`DATABASE_CA_CERT_PATH is set to "${caPath}" but could not be read (${err.message}). Refusing to run migrations with an unverifiable database TLS config.`);
    }
  }
  return { rejectUnauthorized: true };
}

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: buildSslConfig(),
  });

  try {
    console.log('🔄 Running liquidity tracking migration...');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const migrationPath = join(__dirname, 'migrations', '007_liquidity_tracking.sql');
    
    const migration = readFileSync(migrationPath, 'utf8');
    
    await pool.query(migration);
    
    console.log('✅ Migration completed successfully!');
    console.log('   - liquidity_positions table created');
    console.log('   - protocol_revenue table created');
    console.log('   - daily_metrics table created');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
