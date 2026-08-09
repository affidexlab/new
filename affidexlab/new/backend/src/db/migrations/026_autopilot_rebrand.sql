UPDATE product_control_settings
SET product_name = 'Autopilot (Agentic Compliance)',
    public_message = 'Autopilot turns risk checks into accountable compliance workflows with human-approved automation.',
    updated_at = NOW()
WHERE product_key = 'agents';
