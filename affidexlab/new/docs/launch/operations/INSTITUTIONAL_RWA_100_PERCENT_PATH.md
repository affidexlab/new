# Institutional/RWA 100% readiness path

DecaFlow now owns the Institutional/RWA operating stack in code: identity attestations, investor eligibility checks, contract template catalog, operator runbooks, Safe/multisig admin records, issuer onboarding gates, evidence retention, regulatory report records, and deployment records.

The production readiness proof endpoint is `GET /v1/institutional/ops/readiness` with an admin key or an organization key scoped for `institutional:check`. It returns gate-by-gate status for identity registry data, compliance rules, risk oracle, operator runbooks, Safe admin, issuer onboarding, evidence retention, investor checks, reporting, and live deployments.

A 100% public securities/RWA launch still requires real production entries in those tables: verified Safe threshold and owners, approved issuer onboarding with counsel/KYC/operator/deployment evidence hashes, live deployment addresses, investor checks, retained evidence, and at least one generated report. DecaFlow can own and manage that infrastructure; legal opinions and regulated KYC/accreditation evidence remain external inputs that DecaFlow records, hashes, and operationalizes.
