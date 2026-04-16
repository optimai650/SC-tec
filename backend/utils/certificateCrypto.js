const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_DIR = path.join(__dirname, '..', '.certificate-keys');
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'ed25519-private.pem');
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'ed25519-public.pem');

function ensureKeyPair() {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true });
  }

  const privateKeyExists = fs.existsSync(PRIVATE_KEY_PATH);
  const publicKeyExists = fs.existsSync(PUBLIC_KEY_PATH);

  if (privateKeyExists && publicKeyExists) {
    return {
      privateKey: fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'),
      publicKey: fs.readFileSync(PUBLIC_KEY_PATH, 'utf8'),
    };
  }

  const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519', {
    privateKeyEncoding: {
      format: 'pem',
      type: 'pkcs8',
    },
    publicKeyEncoding: {
      format: 'pem',
      type: 'spki',
    },
  });

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, 'utf8');
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey, 'utf8');

  return { privateKey, publicKey };
}

function createCertificatePayload({ inscription, alumno, project }) {
  return {
    version: 1,
    inscriptionId: inscription.id,
    alumnoId: alumno.id,
    matricula: alumno.matricula,
    projectId: project.id,
    projectTitle: project.title,
    socioFormadorId: project.socioFormadorId,
    socioFormadorName: project.socioFormador?.name || null,
    periodId: project.periodId,
    periodName: project.period?.name || null,
    status: inscription.status,
    createdAt: inscription.createdAt.toISOString(),
  };
}

function stringifyCertificatePayload(payload) {
  return JSON.stringify(payload);
}

function hashCertificatePayload(payloadString) {
  return crypto.createHash('sha256').update(payloadString).digest('hex');
}

function signCertificatePayload(payloadString) {
  const { privateKey } = ensureKeyPair();
  const signature = crypto.sign(null, Buffer.from(payloadString), privateKey);
  return signature.toString('base64');
}

function verifyCertificateSignature(payloadString, signatureBase64) {
  if (!payloadString || !signatureBase64) return false;
  const { publicKey } = ensureKeyPair();
  return crypto.verify(
    null,
    Buffer.from(payloadString),
    publicKey,
    Buffer.from(signatureBase64, 'base64')
  );
}

module.exports = {
  ensureKeyPair,
  createCertificatePayload,
  stringifyCertificatePayload,
  hashCertificatePayload,
  signCertificatePayload,
  verifyCertificateSignature,
};
