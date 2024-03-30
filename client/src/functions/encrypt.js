import CryptoJS from "crypto-js";

function derToArrayBuffer(der) {
  const binaryString = atob(der);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
export async function generateSymmetricKey() { 
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto API not supported in this browser");
  }
  const keyBuffer = await window.crypto.subtle.generateKey(
    {
      name: "AES-CBC",
      length: 256
    },
    true, 
    ["encrypt", "decrypt"] 
  );
  const exportedKey = await window.crypto.subtle.exportKey(
    "raw",
    keyBuffer
  );
  const base64Key = arrayBufferToBase64(exportedKey);

  return base64Key;
}

function arrayBufferToBase64(buffer) {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary);
}

export async function decryptMessage(encryptedBase64, privateKey) {
  const encryptedBinaryString = atob(encryptedBase64);

  const encryptedData = new Uint8Array(encryptedBinaryString.length);
  for (let i = 0; i < encryptedBinaryString.length; i++) {
    encryptedData[i] = encryptedBinaryString.charCodeAt(i);
  }
  const privateKeyBuffer = derToArrayBuffer(privateKey);
  const importedPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    true,
    ["decrypt"]
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    importedPrivateKey,
    encryptedData
  );

  const decryptedMessage = new TextDecoder().decode(decryptedData);

  return decryptedMessage;
}

export function decryptDataWithSymmetricKey(encryptedData, key, iv) {
  const keyBytes = CryptoJS.enc.Base64.parse(key);
  const ivBytes = CryptoJS.enc.Base64.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext: CryptoJS.enc.Base64.parse(encryptedData),
    },
    keyBytes,
    {
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

  return decryptedText;
}
export async function encryptMessage(message, publicKeyDER) {
    
  const publicKeyArrayBuffer = derToArrayBuffer(publicKeyDER);
  const publicKey = await crypto.subtle.importKey(
    'spki',
    publicKeyArrayBuffer,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    true,
    ['encrypt']
  );
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );

  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));

  return encryptedBase64;
}
export async function encryptDataWithSymmetricKey(data, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const keyBuffer = Uint8Array.from(atob(key), c => c.charCodeAt(0)).buffer;
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const dataBuffer = new TextEncoder().encode(data);
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv: iv,
    },
    importedKey,
    dataBuffer
  );
  
  const encryptedDataArray = new Uint8Array(encryptedData);
  const encryptedDataBase64 = btoa(String.fromCharCode(...encryptedDataArray));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return {
    iv: ivBase64,
    encryptedData: encryptedDataBase64
  };
}