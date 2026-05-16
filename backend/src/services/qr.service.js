const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const ALGORITHM = 'aes-256-cbc';
// Clave de 32 bytes desde .env
const SECRET_KEY = Buffer.from(process.env.QR_SECRET_KEY, 'hex'); // 64 chars hex = 32 bytes

function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Guardamos iv:encrypted para poder desencriptar después
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptData(encryptedStr) {
  const [ivHex, encrypted] = encryptedStr.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

async function generateTicketQR(ticketData) {
  const uuid = uuidv4();
  const payload = { uuid, ...ticketData };
  const encrypted = encryptData(payload);
  // Genera el QR como base64 (Data URL) para mandarlo directo al frontend
  const qrDataUrl = await QRCode.toDataURL(encrypted);
  return { uuid, qrDataUrl, encrypted };
}

module.exports = { generateTicketQR, decryptData };