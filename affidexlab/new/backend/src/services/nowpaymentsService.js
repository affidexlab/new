import crypto from 'crypto';
import { safeCompare } from '../utils/security.js';

export function sortObjectKeys(obj) {
  return Object.keys(obj || {}).sort().reduce((result, key) => {
    result[key] = (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) ? sortObjectKeys(obj[key]) : obj[key];
    return result;
  }, {});
}

export function verifyNowPaymentsSignature(body, signature) {
  if (!process.env.NOWPAYMENTS_IPN_SECRET) return false;
  const expected = crypto.createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET).update(JSON.stringify(sortObjectKeys(body))).digest('hex');
  return Boolean(signature && safeCompare(String(signature), expected));
}

export async function createNowPaymentsInvoice({ priceUsd, orderId, description, successPath, cancelPath, callbackPath }) {
  if (!process.env.NOWPAYMENTS_API_KEY) throw new Error('NOWPayments is not configured.');
  const apiBase = process.env.NOWPAYMENTS_ENV === 'sandbox' ? 'https://api-sandbox.nowpayments.io' : 'https://api.nowpayments.io';
  const frontendUrl = process.env.FRONTEND_URL || 'https://decaflow.xyz';
  const backendUrl = process.env.BACKEND_URL || 'https://decaflow-backend.onrender.com';
  const res = await fetch(`${apiBase}/v1/invoice`, {
    method: 'POST',
    headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price_amount: priceUsd,
      price_currency: 'usd',
      order_id: orderId,
      order_description: description,
      ipn_callback_url: `${backendUrl}${callbackPath}`,
      success_url: `${frontendUrl}${successPath}`,
      cancel_url: `${frontendUrl}${cancelPath}`,
    })
  });
  const data = await res.json().catch(() => ({}));
  const invoiceUrl = data.invoice_url || data.url;
  if (!res.ok || !invoiceUrl) {
    const detail = data?.message || data?.error || `NOWPayments returned ${res.status}`;
    throw new Error(detail);
  }
  return { invoiceUrl, raw: data };
}
