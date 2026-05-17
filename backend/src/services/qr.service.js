const crypto = require('crypto');
const QRCode = require('qrcode');

const ALGORITHM = 'aes-256-cbc';

function getSecretKey() {
  const rawSecret = process.env.QR_SECRET_KEY || '';

  if (!/^[a-fA-F0-9]{64}$/.test(rawSecret)) {
    throw new Error('QR_SECRET_KEY debe ser hex de 64 caracteres.');
  }

  return Buffer.from(rawSecret, 'hex');
}

function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Guardamos iv:encrypted para poder desencriptar después
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptData(encryptedStr) {
  const [ivHex, encrypted] = encryptedStr.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

async function generateTicketQR(ticketData) {
  const uuid = crypto.randomUUID();
  const payload = { uuid, ...ticketData };
  const encrypted = encryptData(payload);
  // Genera el QR como base64 (Data URL) para mandarlo directo al frontend
  const qrDataUrl = await QRCode.toDataURL(encrypted);
  return { uuid, qrDataUrl, encrypted };
}

module.exports = { generateTicketQR, decryptData };
