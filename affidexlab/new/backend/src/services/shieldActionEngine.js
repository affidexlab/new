import pool from '../db/connection.js';
import { sendEnquiryEmail } from '../utils/mailer.js';

const SEVERITY_RANK = { low: 1, medium: 2, high: 3, critical: 4 };

function rank(severity) {
  return SEVERITY_RANK[String(severity || 'medium').toLowerCase()] || 2;
}

export async function evaluateShieldActions(alert) {
  const { rows: rules } = await pool.query(
    `SELECT * FROM shield_action_rules
     WHERE enabled = true
       AND event_type = $1
       AND ($2::text IS NULL OR chain IS NULL OR lower(chain) = lower($2))
       AND ($3::text IS NULL OR address IS NULL OR lower(address) = lower($3))`,
    [alert.alert_type, alert.chain || null, alert.address || null]
  );

  const runs = [];
  for (const rule of rules.filter(r => rank(alert.severity) >= rank(r.min_severity))) {
    let result = { skipped: false };
    if (rule.action_type === 'email') {
      await sendEnquiryEmail({
        type: 'Shield Action',
        to: process.env.SHIELD_ALERT_EMAIL || process.env.NOTIFY_EMAIL || 'decaflowsolutions@gmail.com',
        subject: `[Shield Action] ${rule.name}`,
        fields: {
          Rule: rule.name,
          Severity: alert.severity,
          Type: alert.alert_type,
          Contract: `${alert.chain}:${alert.address}`,
          Message: alert.message,
          'Alert ID': String(alert.id),
        },
      });
      result = { emailed: true };
    }

    const { rows } = await pool.query(
      `INSERT INTO shield_action_runs (rule_id, alert_id, event_type, action_type, result)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [rule.id, alert.id, alert.alert_type, rule.action_type, result]
    );
    runs.push(rows[0]);
  }
  return runs;
}

export async function createShieldAlert({ chain, address, label = null, severity = 'medium', alertType, message, txHash = null, metadata = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO shield_alerts (chain, address, label, severity, alert_type, message, tx_hash, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [chain, address, label, severity, alertType, message, txHash, metadata]
  );
  const alert = rows[0];

  if (rank(severity) >= rank('high')) {
    const playbook = await pool.query(
      `SELECT steps FROM shield_incident_playbooks
       WHERE enabled = true AND alert_type = $1
       ORDER BY CASE WHEN severity = $2 THEN 0 ELSE 1 END, id ASC
       LIMIT 1`,
      [alertType, severity]
    ).catch(() => ({ rows: [] }));
    const nextSteps = playbook.rows[0]?.steps?.length
      ? playbook.rows[0].steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
      : 'Triage alert, confirm authorized activity, and record decision.';
    await pool.query(
      `INSERT INTO shield_incidents (alert_id, title, severity, summary, next_steps)
       VALUES ($1, $2, $3, $4, $5)`,
      [alert.id, `${severity.toUpperCase()} ${alertType.replace(/_/g, ' ')} on ${label || address}`, severity, message, nextSteps]
    );
  }

  const actions = await evaluateShieldActions(alert);
  return { alert, actions };
}
