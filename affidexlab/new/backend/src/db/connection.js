import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Guardian audit MEDIUM "TLS Certificate Verification Disabled": rejectUnauthorized:
// false meant the backend established TLS but never checked the server's cert was
// actually valid — a MITM on the network path could present any certificate and go
// unnoticed. Now verifies properly by default, using Node's built-in public CA trust
// store (covers Supabase's current certs for most projects). If a specific deployment
// needs a pinned/custom CA (Supabase pooler, self-hosted Postgres, private CA,
// etc.), set DATABASE_CA_CERT to the PEM contents or point DATABASE_CA_CERT_PATH
// at a PEM file rather than disabling verification again.
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
      // Fail closed and loud rather than silently falling back to an unverified
      // connection — a misconfigured path should be fixed, not quietly bypassed.
      throw new Error(`DATABASE_CA_CERT_PATH is set to "${caPath}" but could not be read (${err.message}). Refusing to start with an unverifiable database TLS config.`);
    }
  }
  return { rejectUnauthorized: true };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: buildSslConfig(),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Guardian audit MEDIUM "Database Query Parameter Logging": raw params were logged
// verbatim on any query error, which risked writing sensitive values (API keys,
// personal data — anything a caller might ever pass as a bound parameter) straight to
// stdout. Redact by default: strings collapse to their length, which is normally
// enough to debug a query without leaking the actual value. Numbers/booleans are left
// as-is since they're rarely sensitive on their own (typically IDs/flags) and are
// genuinely useful for debugging.
function redactParams(params) {
  if (!Array.isArray(params)) return params;
  return params.map((p) => {
    if (p === null || p === undefined) return p;
    if (typeof p === 'string') return `[REDACTED string len=${p.length}]`;
    if (typeof p === 'number' || typeof p === 'boolean') return p;
    return '[REDACTED]';
  });
}

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
    console.error('Database query error:', { text, params: redactParams(params), error: error.message });
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

  try {
    await runSqlFile('migrations/010_shield_coingate.sql');
    console.log('✅ Shield CoinGate migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Shield CoinGate migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Shield CoinGate migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/011_shield_balance_history.sql');
    console.log('✅ Shield balance history migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Shield balance history migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Shield balance history migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/012_institutional_tables.sql');
    console.log('✅ Institutional tables migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Institutional tables migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Institutional tables migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/013_compliance_workflows.sql');
    console.log('✅ Compliance workflows migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Compliance workflows migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Compliance workflows migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/014_agents_tables.sql');
    console.log('✅ Agents tables migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Agents tables migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Agents tables migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/015_live_integrations.sql');
    console.log('✅ Live integrations migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Live integrations migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Live integrations migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/016_internal_risk_and_actions.sql');
    console.log('✅ Internal risk/actions migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Internal risk/actions migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Internal risk/actions migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/017_case_review_feedback.sql');
    console.log('✅ Risk case feedback migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Risk case feedback migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Risk case feedback migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/018_admin_keys_and_shield_scanner.sql');
    console.log('✅ Admin keys / Shield scanner migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Admin keys / Shield scanner migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Admin keys / Shield scanner migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/019_organization_auth.sql');
    console.log('✅ Organization auth migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710', '42701'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Organization auth migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Organization auth migration file not found, skipping');
    } else {
      console.warn('⚠️  Migration warning:', migrationError.message);
      throw migrationError;
    }
  }

  try {
    await runSqlFile('migrations/020_product_control.sql');
    console.log('✅ Product control migration applied successfully');
  } catch (migrationError) {
    if (['42P07', '42710', '42701'].includes(migrationError.code) || migrationError.message?.includes('already exists')) {
      console.log('ℹ️  Product control migration already applied');
    } else if (migrationError.code === 'ENOENT') {
      console.log('ℹ️  Product control migration file not found, skipping');
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
