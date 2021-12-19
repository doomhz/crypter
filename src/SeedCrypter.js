const { pbkdf2: deriveKey } = require('pbkdf2');
const crypto = require('crypto');
const { Buffer } = require('buffer/');

const DERIVATION_ROUNDS = 200000;
const PASSWORD_KEY_SIZE = 64;
const SALT_LENGTH = 12;
const IV_LENGTH = 32;

class SeedCrypter {
  encrypt(textToEncrypt, password) {
    return this.generateSalt()
      .then((salt) => Promise.all([
        this.generateIV(),
        Promise.resolve(salt),
        this.deriveFromPassword(password, salt),
      ]))
      .then(([iv, salt, derivedKey]) => {
        const ivHex = iv.toString('hex');
        const encryptTool = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
        // Perform encryption
        let encryptedContent = encryptTool.update(textToEncrypt, 'utf8', 'base64');
        encryptedContent += encryptTool.final('base64');
        // Output encrypted components
        const components = {
          iv: ivHex,
          salt,
          encryptedContent,
        };
        return this.packageComponents(components);
      });
  }

  decrypt(encryptedString, password) {
    let encryptedComponents;
    return Promise
      .resolve()
      .then(() => {
        encryptedComponents = this.unpackageComponents(encryptedString);
        // console.log(JSON.stringify(encryptedComponents, undefined, 2));
        return this.deriveFromPassword(password, encryptedComponents.salt);
      })
      .then((derivedKey) => {
        const iv = Buffer.from(encryptedComponents.iv, 'hex');
        // Decrypt
        const decryptTool = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
        const decryptedText = decryptTool.update(encryptedComponents.encryptedContent, 'base64', 'utf8');
        return `${decryptedText}${decryptTool.final('utf8')}`;
      });
  }

  pbkdf2(password, salt, rounds, bits) {
    return new Promise((resolve, reject) => {
      deriveKey(password, salt, rounds, bits / 8, 'sha512', (err, key) => {
        if (err) {
          return reject(err);
        }
        return resolve(key);
      });
    });
  }

  deriveFromPassword(password, salt) {
    if (!password) {
      return Promise.reject(new Error('Failed deriving key: Password must be provided'));
    }
    if (!salt) {
      return Promise.reject(new Error('Failed deriving key: Salt must be provided'));
    }
    const bits = PASSWORD_KEY_SIZE * 8;
    return this.pbkdf2(password, salt, DERIVATION_ROUNDS, bits)
      .then((derivedKeyData) => derivedKeyData.toString('hex'))
      .then((derivedKeyHex) => {
        const dkhLength = derivedKeyHex.length;
        const keyBuffer = Buffer.from(derivedKeyHex.substr(0, dkhLength / 2), 'hex');
        return keyBuffer;
      });
  }

  generateIV() {
    return Promise.resolve(Buffer.from(crypto.randomBytes(IV_LENGTH / 2)));
  }

  generateSalt() {
    let output = '';
    while (output.length < SALT_LENGTH) {
      output += crypto.randomBytes(3).toString('base64');
      if (output.length > SALT_LENGTH) {
        output = output.substr(0, SALT_LENGTH);
      }
    }
    return Promise.resolve(output);
  }

  packageComponents(components) {
    return `${components.salt}${components.iv}${components.encryptedContent}`;
  }

  unpackageComponents(payload) {
    return {
      salt: payload.substr(0, SALT_LENGTH),
      iv: payload.substr(SALT_LENGTH, IV_LENGTH),
      encryptedContent: payload.substr(SALT_LENGTH + IV_LENGTH),
    };
  }
}

module.exports = SeedCrypter;
