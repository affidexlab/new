import nodemailer from 'nodemailer';

let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'decaflowsolutions@gmail.com',
      pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
  return _transporter;
};

const accentFor = (type) => {
  const map = {
    'Compliance': '#3B82F6', 'Compliance Confirmation': '#3B82F6',
    'Security Audit': '#ef4444', 'Audit Confirmation': '#ef4444',
    'Verify API': '#8b5cf6', 'Verify API Key': '#8b5cf6', 'Verify API Confirmation': '#8b5cf6',
  };
  return map[type] || '#3B82F6';
};

const buildHtml = (type, fields, isConfirmation, isApiKey) => {
  const accent = accentFor(type);
  const headerBg = isApiKey ? '#8b5cf6' : accent;
  const headerText = isApiKey ? '🔑 Your API Key is Ready' : isConfirmation ? '✅ Request Received' : `📋 New ${type} Enquiry`;
  const rows = Object.entries(fields).map(([k, v]) => {
    const isKey = k === 'Your API Key';
    return `<tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:10px 16px;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;width:180px;font-size:13px">${k}</td>
      <td style="padding:10px 16px;color:${isKey ? '#8b5cf6' : '#111827'};font-size:${isKey ? '15px' : '13px'};font-family:${isKey ? 'monospace' : 'inherit'};font-weight:${isKey ? '700' : '400'};word-break:break-all">${v}</td>
    </tr>`;
  }).join('');
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px"><tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
    <tr><td style="background:${headerBg};padding:28px 32px">
      <div style="font-size:22px;font-weight:800;color:#fff">DecaFlow</div>
      <div style="font-size:16px;color:rgba(255,255,255,0.9);margin-top:6px">${headerText}</div>
    </td></tr>
    <tr><td style="padding:24px 32px 8px">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">${rows}</table>
    </td></tr>
    <tr><td style="padding:24px 32px 32px">
      <div style="font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;line-height:1.6">
        DecaFlow Solutions Limited · decaflow.xyz<br>
        <a href="mailto:decaflowsolutions@gmail.com" style="color:${accent}">decaflowsolutions@gmail.com</a>
      </div>
    </td></tr>
  </table></td></tr></table></body></html>`;
};

const buildText = (type, fields) => {
  const lines = [`DecaFlow — ${type}\n${'─'.repeat(40)}`];
  Object.entries(fields).forEach(([k, v]) => lines.push(`${k}: ${v}`));
  lines.push('\nDecaFlow Solutions Limited · decaflowsolutions@gmail.com');
  return lines.join('\n');
};

export const sendEnquiryEmail = async ({ type, to, subject, fields, isConfirmation = false, isApiKey = false }) => {
  if (!process.env.SMTP_PASS) {
    console.warn(`⚠️  SMTP_PASS not set — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    const from = `"DecaFlow" <${process.env.SMTP_USER || 'decaflowsolutions@gmail.com'}>`;
    await getTransporter().sendMail({
      from, to, subject,
      text: buildText(type, fields),
      html: buildHtml(type, fields, isConfirmation, isApiKey),
    });
    console.log(`✅ Email sent: "${subject}" → ${to}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
  }
};
