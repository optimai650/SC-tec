const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_DIR = path.join(__dirname, '..', '.certificate-keys');
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'public.pem');

let privateKey = null;
let publicKey = null;

function initKeys() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    privateKey = crypto.createPrivateKey(fs.readFileSync(PRIVATE_KEY_PATH));
    publicKey = crypto.createPublicKey(fs.readFileSync(PUBLIC_KEY_PATH));
    console.log('🔑 Certificate keys loaded');
  } else {
    const { privateKey: priv, publicKey: pub } = crypto.generateKeyPairSync('ed25519');
    privateKey = priv;
    publicKey = pub;
    fs.writeFileSync(PRIVATE_KEY_PATH, priv.export({ type: 'pkcs8', format: 'pem' }));
    fs.writeFileSync(PUBLIC_KEY_PATH, pub.export({ type: 'spki', format: 'pem' }));
    console.log('🔑 New Ed25519 certificate keys generated');
  }
}

function buildPayload({ inscriptionId, alumnoMatricula, alumnoNombre, projectId, projectTitle, socioFormador, periodo, feria, fairId, createdAt }) {
  return JSON.stringify({
    inscriptionId,
    alumnoMatricula,
    alumnoNombre,
    projectId,
    projectTitle,
    socioFormador,
    periodo,
    feria: feria || null,
    fairId: fairId || null,
    createdAt,
  });
}

function signPayload(payloadStr) {
  if (!privateKey) throw new Error('Certificate keys not initialized');
  const signature = crypto.sign(null, Buffer.from(payloadStr), privateKey).toString('base64');
  const hash = crypto.createHash('sha256').update(payloadStr).digest('hex');
  return { signature, hash, signedAt: new Date() };
}

function verifyWithHash(payloadStr, signatureB64, storedHash) {
  if (!publicKey || !payloadStr || !signatureB64) return false;
  try {
    const valid = crypto.verify(null, Buffer.from(payloadStr), publicKey, Buffer.from(signatureB64, 'base64'));
    if (!valid) return false;
    // Only enforce hash check when a stored hash is present; if missing, signature alone suffices
    if (storedHash) {
      const computedHash = crypto.createHash('sha256').update(payloadStr).digest('hex');
      return computedHash === storedHash;
    }
    return true;
  } catch {
    return false;
  }
}

function getPublicKeyPem() {
  return publicKey ? publicKey.export({ type: 'spki', format: 'pem' }) : null;
}

module.exports = { initKeys, buildPayload, signPayload, verifyWithHash, getPublicKeyPem };
