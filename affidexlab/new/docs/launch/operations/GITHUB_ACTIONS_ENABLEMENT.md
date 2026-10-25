# DecaFlow GitHub Actions enablement

1. Open GitHub → `affidexlab/new` → Settings → Actions → General.
2. Set Actions permissions to **Allow all actions and reusable workflows**.
3. Set Workflow permissions to **Read and write permissions**.
4. Save, then open Actions and manually run `Production Risk Ingestion` with `job=all` and `Shield Monitor`.
5. Add these repository secrets before running production jobs: `DATABASE_URL`, `DATABASE_CA_CERT`, `ALCHEMY_API_KEY`, `RPC_ETHEREUM`, `RPC_ARBITRUM`, `RPC_BASE`, `RPC_POLYGON`, `RPC_AVALANCHE`, `RPC_OPTIMISM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL`, `SHIELD_ALERT_EMAIL`.
6. After both jobs pass, capture the run URLs and query `/v1/risk/coverage` plus `/v1/shield/proof` with an admin key. Those two responses are the production proof package.
