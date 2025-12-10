# Cron Job Setup for Points System

This guide explains how to set up automated tasks for the DecaFlow Points & Rewards System.

## Required Cron Jobs

### 1. Weekly Points Reset
Resets weekly points every Monday at 00:00 UTC

```bash
0 0 * * 1 cd /path/to/backend && node src/scripts/weekly-reset.js >> /var/log/decaflow-weekly-reset.log 2>&1
```

### 2. Monthly Points Reset
Resets monthly points on the 1st of each month at 00:00 UTC

```bash
0 0 1 * * cd /path/to/backend && node src/scripts/monthly-reset.js >> /var/log/decaflow-monthly-reset.log 2>&1
```

### 3. Leaderboard Cache Refresh
Refreshes leaderboard cache every 5 minutes

```bash
*/5 * * * * cd /path/to/backend && node src/scripts/refresh-leaderboard.js >> /var/log/decaflow-leaderboard.log 2>&1
```

## Setup Instructions

### Linux/Unix

1. Open crontab editor:
```bash
crontab -e
```

2. Add the cron jobs (replace `/path/to/backend` with actual path):
```cron
# DecaFlow Points System Automation

# Weekly reset - Every Monday at 00:00 UTC
0 0 * * 1 cd /path/to/affidexlab/new/backend && node src/scripts/weekly-reset.js >> /var/log/decaflow-weekly-reset.log 2>&1

# Monthly reset - 1st of each month at 00:00 UTC
0 0 1 * * cd /path/to/affidexlab/new/backend && node src/scripts/monthly-reset.js >> /var/log/decaflow-monthly-reset.log 2>&1

# Leaderboard refresh - Every 5 minutes
*/5 * * * * cd /path/to/affidexlab/new/backend && node src/scripts/refresh-leaderboard.js >> /var/log/decaflow-leaderboard.log 2>&1
```

3. Save and exit (usually `Ctrl+X`, then `Y`, then `Enter`)

4. Verify cron jobs are installed:
```bash
crontab -l
```

### Alternative: Using systemd timers

Create service files in `/etc/systemd/system/`:

**decaflow-weekly-reset.service**
```ini
[Unit]
Description=DecaFlow Weekly Points Reset

[Service]
Type=oneshot
WorkingDirectory=/path/to/affidexlab/new/backend
ExecStart=/usr/bin/node src/scripts/weekly-reset.js
User=www-data
Environment="NODE_ENV=production"
```

**decaflow-weekly-reset.timer**
```ini
[Unit]
Description=Run DecaFlow weekly reset every Monday

[Timer]
OnCalendar=Mon *-*-* 00:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable decaflow-weekly-reset.timer
sudo systemctl start decaflow-weekly-reset.timer
```

### Cloud Services

#### Render.com
Add cron jobs in `render.yaml`:

```yaml
services:
  - type: cron
    name: weekly-reset
    env: docker
    schedule: "0 0 * * 1"
    dockerCommand: node src/scripts/weekly-reset.js

  - type: cron
    name: monthly-reset
    env: docker
    schedule: "0 0 1 * *"
    dockerCommand: node src/scripts/monthly-reset.js

  - type: cron
    name: leaderboard-refresh
    env: docker
    schedule: "*/5 * * * *"
    dockerCommand: node src/scripts/refresh-leaderboard.js
```

#### Vercel
Use Vercel Cron (add to `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reset",
      "schedule": "0 0 * * 1"
    },
    {
      "path": "/api/cron/monthly-reset",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/leaderboard-refresh",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Create API endpoints:
- `/api/cron/weekly-reset.js`
- `/api/cron/monthly-reset.js`
- `/api/cron/leaderboard-refresh.js`

#### Railway
Add cron jobs in `railway.json`:

```json
{
  "deploy": {
    "crons": [
      {
        "command": "node src/scripts/weekly-reset.js",
        "schedule": "0 0 * * 1"
      },
      {
        "command": "node src/scripts/monthly-reset.js",
        "schedule": "0 0 1 * *"
      },
      {
        "command": "node src/scripts/refresh-leaderboard.js",
        "schedule": "*/5 * * * *"
      }
    ]
  }
}
```

#### AWS (CloudWatch Events + Lambda)
1. Create Lambda functions for each script
2. Set up CloudWatch Events rules:
   - Weekly: `cron(0 0 ? * 2 *)`  (Mondays at 00:00 UTC)
   - Monthly: `cron(0 0 1 * ? *)`  (1st of month at 00:00 UTC)
   - Leaderboard: `rate(5 minutes)`

#### Google Cloud Platform (Cloud Scheduler)
```bash
# Weekly reset
gcloud scheduler jobs create http weekly-reset \
  --schedule="0 0 * * 1" \
  --uri="https://api.decaflow.xyz/cron/weekly-reset" \
  --http-method=POST

# Monthly reset
gcloud scheduler jobs create http monthly-reset \
  --schedule="0 0 1 * *" \
  --uri="https://api.decaflow.xyz/cron/monthly-reset" \
  --http-method=POST

# Leaderboard refresh
gcloud scheduler jobs create http leaderboard-refresh \
  --schedule="*/5 * * * *" \
  --uri="https://api.decaflow.xyz/cron/leaderboard-refresh" \
  --http-method=POST
```

## Manual Execution

You can manually run these scripts anytime:

```bash
cd /path/to/affidexlab/new/backend

# Weekly reset
node src/scripts/weekly-reset.js

# Monthly reset
node src/scripts/monthly-reset.js

# Leaderboard refresh
node src/scripts/refresh-leaderboard.js
```

## Monitoring

### Check Logs
```bash
# View recent logs
tail -f /var/log/decaflow-weekly-reset.log
tail -f /var/log/decaflow-monthly-reset.log
tail -f /var/log/decaflow-leaderboard.log

# View specific date
grep "2025-12-10" /var/log/decaflow-weekly-reset.log
```

### Health Checks
Set up monitoring alerts for:
- Script execution failures
- Database connection issues
- Unexpected point totals
- Missing cron executions

### Alerting
Consider using services like:
- **Better Stack** (formerly Logtail)
- **Sentry** for error tracking
- **PagerDuty** for critical alerts
- **Discord/Slack webhooks** for notifications

Example Discord webhook in scripts:

```javascript
const sendAlert = async (message) => {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message })
  });
};

// After successful reset
await sendAlert('✅ Weekly points reset completed successfully');
```

## Troubleshooting

### Cron not running
1. Check cron service status:
```bash
sudo systemctl status cron
```

2. Check cron logs:
```bash
grep CRON /var/log/syslog
```

3. Verify script permissions:
```bash
chmod +x src/scripts/*.js
```

### Database connection issues
1. Verify DATABASE_URL is set
2. Check database connectivity
3. Ensure PostgreSQL is running
4. Verify credentials

### Time zone issues
Cron uses server time zone by default. For UTC:
```bash
TZ=UTC crontab -e
```

Or set in cron job:
```cron
0 0 * * 1 TZ=UTC cd /path/to/backend && node src/scripts/weekly-reset.js
```

## Security Best Practices

1. **Restrict cron access**: Only authorized users should edit crontab
2. **Secure log files**: Limit read permissions on log files
3. **Environment variables**: Never hardcode credentials
4. **Audit trail**: Keep logs for compliance
5. **Backup before resets**: Snapshot data before major operations

---

**Last Updated**: December 2025  
**Maintainer**: DecaFlow Team
