const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';

// Deriva exactamente 32 bytes desde la variable de entorno
const getKey = () => {
  const secret = process.env.AES_SECRET;
  if (!secret) throw new Error('AES_SECRET no está definido en .env');
  return crypto.createHash('sha256').update(secret).digest();
};

// Cifra el ID del ticket. Devuelve string: iv:authTag:ciphertext (todo en hex)
const cifrarQR = (ticketId) => {
  const key = getKey();
  const iv = crypto.randomBytes(12); // 96 bits recomendado para GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const payload = JSON.stringify({ id: ticketId, iss: 'eventmaster' });
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

// Descifra el contenido del QR. Lanza error si el token es inválido o fue alterado.
const descifrarQR = (token) => {
  const parts = token.split(':');
  if (parts.length !== 3) throw new Error('Formato de token inválido');

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const payload = JSON.parse(decrypted.toString('utf8'));

  if (payload.iss !== 'eventmaster') throw new Error('Emisor inválido');

  return payload.id;
};

module.exports = { cifrarQR, descifrarQR };
