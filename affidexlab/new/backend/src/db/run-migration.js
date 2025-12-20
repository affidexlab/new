import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
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
