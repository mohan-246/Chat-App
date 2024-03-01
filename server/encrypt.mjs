import crypto from 'crypto';

function generateRandomKeyPair(){
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });
  console.log(publicKey.toString('base64') ,'\n', privateKey.toString('base64'))
  return [publicKey , privateKey]
  }


  function generateSymmetricKey() {
    return crypto.randomBytes(32).toString('base64');
  }
   
  function encryptDataWithSymmetricKey(data, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'base64'), iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return {
      iv: iv.toString('base64'),
      encryptedData: encrypted
    };
  }
  
  function decryptDataWithSymmetricKey(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'base64'), Buffer.from(iv, 'base64'));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  const key = generateSymmetricKey()
  const word = 'it is what it iss'
  const encrypted = encryptDataWithSymmetricKey(word , key)
  const decrypted = decryptDataWithSymmetricKey(encrypted.encryptedData , key ,encrypted.iv)
  console.log(key ,'\n', encrypted ,'\n', decrypted)