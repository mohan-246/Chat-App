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

export async function decryptMessage(encryptedBase64, privateKey) { 
    const encryptedBinaryString = atob(encryptedBase64);
     
    const encryptedData = new Uint8Array(encryptedBinaryString.length);
    for (let i = 0; i < encryptedBinaryString.length; i++) {
      encryptedData[i] = encryptedBinaryString.charCodeAt(i);
    }
    const privateKeyBuffer = derToArrayBuffer(privateKey);
    const importedPrivateKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
      true,
      ['decrypt']
    );
   
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      importedPrivateKey,
      encryptedData
    );
   
    const decryptedMessage = new TextDecoder().decode(decryptedData);
    
    return decryptedMessage;
  }
  
   
  const encryptedData = 'khq1ecgEufM7XanXVd0TAkwrF+9949CmFicCe46/XrGxkNJBzMiYvf3kLz15hRggUxIjiaZ9pQxu0/8Ll8ktSSOIDhkFo7KBUyI0AwiJu0rmTLAsr/anHMBzzYtkWYyzRlC9YXa9K11m7VY4s6/hX1+kcR3oqZOUcBxey0+MFiLlBszNU9xD8amzXd51Jl5SXDQKlokGGujYnWGwVcFF3FbcKs5Kp1sx8ZwiGcRzyQdGE3FEp9+nw0pJAGOkYXXQvaqoQHheeTh9hKLwDQ43q88EqE/tynSEbrGBsL4whP2RH40KjIt6eQD6lsv7TCTV2s1mLDRKoU3Hk8mxTqpZiQ==';
  const privateKeyPem = 'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDraA3VRWz5xzR4jyOixaR0aud5IMe+76L7f8XJUZ+edvTwm+y28INrdZNjtt62C4/2plGfdwmaC+iL+U3UXsyKLTjA/mrK2rFNytSU7PTV/2XAyeV8Yv4DdkUPKJo/C7O7HkYh29b8PYMr0S8F5ofGgb0cTfK2zF/jXdKJklKVeswd7daKvFnJ/pRCx32aLxkfPqV75m2kSi1aTwV0gHMfQ1KlnGMXQq1UKsKCjHqgqcGPLQUITRm7v3rAx1o2diqiW+GSuj9CEClzvOzvkiasfgcGBVLYsIAaKS4vqy1PkNcrvxx+PItpKRjCZSXmANs8Oa5Anx0+4gLQ+2TXTH8xAgMBAAECggEAOBwsN+p9aCfwPNA5eUHMyib1F20Vz1AFNBcniK3Y8wd9qKAx0wUO/h0fTYQ4H4IwBWVtTSotcrdl7X816unRrRnMTkwWHlX0LwuqkfjM/vkKQuKcvYJG84JMQam24lIiu/YiV020N5ld26LXp3tkX49rCQUXVjTuoh4p4bqrzo7qX5LVOmi4tcxeLQuXQN7RWWx2KJfz3tqeeM2PKybNJe9l5qP1wFs0uqHOls3IQY14VBm/j9bDksIrMK83zs8SR/wTTBQnT1atwUT3ngZQvzf6d64yo0gDx197vLecNIgRaRcOSbmrFkqXhKuK9koq39guyzdDvVwftWr1M52WtQKBgQD+hkRwlTRbolw9ItIi3zSNSbWBbdX9Nes31Im+6gINMrIgr3HZ3ObrE0IL96RSoQTnU4Gk+taS/tNITE6H74ACxDHpsbk3ZEL3yfD/YHsTfG7kHWvjDr4zGtOMW2rfAQHF/JfRRPeYBFeiC3cF2IBZxhEjBbZWVzgsrsX0gfeKpwKBgQDsxWoHQ58uHVMexoP1qCXCH89jMp/cbrk0GiYY9CpSYJYuC08oQPre0iHne/A3349zkW13VKGvomT2aTkUYwD0PnzngSzDsyjeNyY6kTSPoYTkBCt3d5GX0c3FruWVBQVCfmH9e1CB7DCiEs0oftMATlWJD3Jjrjmb5cIWqgNaZwKBgAmWu1tWc6uEGV+AQVRo/kzYWwsuPSKV9m+bBTl5DWy73TQYB/0CMnzms9VJlho60Ll6TucNQCo3iXQu08KRRkxUYeEA/g5VK6S0Ke0lEF3ykSbs6NScCJRaTV/7TbJrEksIMhwDMiS6/SYwsmI4/tTi/mBIZc8o6Afe6bxFbTL/AoGAR5zWGuhbBumbsF0+oFiBQxu38DrpmxRqM9YM29NN0aihA8Ar6vLsbeSEmK0l1OBrVPsRbtxMIwEtJFJjD0V6jmUwBh1N2ssfe0aW63Prv92MgiK4uuORR6gPYtEpY08nbhsnrDFWAlXbx8mD/9GMJDWNLW1cncWeawatE4nMhdUCgYBogOi/GZdVl1fiJytqwxDLYNBMlMEIwxcVyD0tEYFgT5JeF8o7f8rGPkVOnpMoJ2Pk6jde8H/2o6HVE2drtSnEUweGiOWZ19us+2JP1MgkuiAcIhWZCxKkVjvQIPIjsrEWD+CUQH2Dfi9FM83xhtkcE11iiKQxKUNcmJqBET6V5g==';
  decryptMessage(encryptedData, privateKeyPem)
  .then(decryptedData => {
    console.log('Decrypted data:', decryptedData);
  })
  .catch(error => {
    console.error('Error:', error);
  });