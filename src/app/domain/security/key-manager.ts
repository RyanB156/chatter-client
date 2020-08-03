
import { Crypt, RSA } from 'hybrid-crypto-js';
const entropy = crypto.getRandomValues(new Uint8Array(256)).toString();

export interface RSAKeyPair {
  privateKey: string;
  publicKey: string;
}

export class KeyManager {

  privateKey;
  publicKey;
  crypt;
  rsa;

  constructor() {
    this.crypt = new Crypt({ entropy: entropy, rsaStandard: 'RSA-OAEP', });
    this.rsa = new RSA({ entropy: entropy });

    // Select AES or RSA standard
    
    // Default AES standard is AES-CBC. Options are:
    // AES-ECB, AES-CBC, AES-CFB, AES-OFB, AES-CTR, AES-GCM, 3DES-ECB, 3DES-CBC, DES-ECB, DES-CBC
    // -> aesStandard: 'AES-CBC', 
    // Default RSA standard is RSA-OAEP. Options are:
    // RSA-OAEP, RSAES-PKCS1-V1_5
        
    
  }


  async generateKeys() {
    // Generate 1024 bit RSA key pair
    let publicKey;
    let privateKey;
    await this.rsa.generateKeyPairAsync().then((keyPair) => {
      console.log(keyPair);
      // Callback function receives new 1024 bit key pair as a first argument
      publicKey = keyPair.publicKey;
      privateKey = keyPair.privateKey;
    
    }, 1024); // Key size
    
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    
  }

  encrypt(publicKey, message) {
    let ciphertext = this.crypt.encrypt(publicKey, message);
    console.log(`ciphertext: ${JSON.stringify(ciphertext)}`);
    return ciphertext;
  }

  decrypt(privateKey, ciphertext) {
    let plaintext = this.crypt.decrypt(privateKey, ciphertext);
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
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    return this.arrayBufferToBase64(hash);
  }
  

}