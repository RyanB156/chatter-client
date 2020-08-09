
import { Crypt, RSA } from 'hybrid-crypto-js';
import { Message } from 'src/app/message/message.component';
const entropy = crypto.getRandomValues(new Uint8Array(256)).toString();

export interface RSAKeyPair {
  privateKey: string;
  publicKey: string;
}

export class KeyManager {

  static crypt = new Crypt({ entropy: entropy, rsaStandard: 'RSA-OAEP', });
  static rsa = new RSA({ entropy: entropy });

  constructor() {
    

    // Select AES or RSA standard
    
    // Default AES standard is AES-CBC. Options are:
    // AES-ECB, AES-CBC, AES-CFB, AES-OFB, AES-CTR, AES-GCM, 3DES-ECB, 3DES-CBC, DES-ECB, DES-CBC
    // -> aesStandard: 'AES-CBC', 
    // Default RSA standard is RSA-OAEP. Options are:
    // RSA-OAEP, RSAES-PKCS1-V1_5
        
    
  }


  static async generateKeys() {
    // Generate 1024 bit RSA key pair
    let publicKey;
    let privateKey;
    await KeyManager.rsa.generateKeyPairAsync().then((keyPair) => {
      console.log(keyPair);
      // Callback function receives new 1024 bit key pair as a first argument
      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;
    
    }, 1024); // Key size
    
    return {publicKey: publicKey, privateKey: privateKey};
    
  }

  static encrypt(plaintext, publicKey) {
    let ciphertext = KeyManager.crypt.encrypt(publicKey, plaintext);
    console.log(`ciphertext: ${JSON.stringify(ciphertext)}`);
    return ciphertext;
  }

  static decrypt(ciphertext, privateKey) {
    let plaintext = KeyManager.crypt.decrypt(privateKey, ciphertext);
    console.log(`plaintext: ${JSON.stringify(plaintext)}`);
    return plaintext;
  }
   
  static arrayBufferToBase64(buffer): string {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  static async hash(message): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    console.log(crypto.subtle);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    return this.arrayBufferToBase64(hash);
  }
  

  static decryptMessage(ciphertext, privateKey): string {
    return ciphertext
  }

}