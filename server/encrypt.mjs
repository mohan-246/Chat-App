import crypto from 'crypto';

// Generate key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Export public key
export const publicKeyPEM = publicKey;

// Export encrypt function
export function encryptData(data) {
  return crypto.publicEncrypt(publicKey, Buffer.from(data)).toString('base64');
}

// Export decrypt function
export function decryptData(encryptedData) {
  return crypto.privateDecrypt(privateKey, Buffer.from(encryptedData, 'base64')).toString();
}
