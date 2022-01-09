const { pbkdf2: deriveKey } = require('pbkdf2');
const crypto = require('crypto');
const { Buffer } = require('buffer/');

const DERIVATION_ROUNDS = 200000;
// Match the same secret lengths as OpenSSL lib does
const PASSWORD_KEY_SIZE_BYTES = 32;
const SALT_LENGTH_HEX = 16;
const IV_LENGTH_HEX = 32;

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
        const saltHex = Buffer.from(salt).toString('hex');
        const derivedKeyHex = Buffer.from(derivedKey).toString('hex');

        // 1. Encrypt text with derived key
        // 2. Attache OpenSSL Salted prefix to encrypted text
        //    ref: http://justsolve.archiveteam.org/wiki/OpenSSL_salted_format
        // 3. Concat Salted prefix and encrypted text
        // 4. Convert to Base64
        const encryptTool = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
        const chunks = [Buffer.from('Salted__', 'utf8'), Buffer.from(salt, 'utf8')];
        chunks.push(encryptTool.update(Buffer.from(textToEncrypt, 'utf8')));
        chunks.push(encryptTool.final());
        const encryptedContentBase64 = Buffer.concat(chunks).toString('base64');

        // Output encryption components to Hex as OpenSSL command params are expected to be.
        // Render final result to Base64.
        const components = {
          iv: ivHex,
          salt: saltHex,
          key: derivedKeyHex,
          encryptedContent: encryptedContentBase64,
        };

        return this.packageComponents(components);
      });
  }

  decrypt(encryptedString, password) {
    let encryptedComponents;
    let saltUTF;
    return Promise
      .resolve()
      .then(() => {
        encryptedComponents = this.unpackageComponents(encryptedString);
        saltUTF = Buffer.from(encryptedComponents.salt, 'hex').toString('utf8');
        return this.deriveFromPassword(password, saltUTF);
      })
      .then((derivedKey) => {
        // 1. Convert encrypted content from Base64 to Hex
        const iv = Buffer.from(encryptedComponents.iv, 'hex');
        const encryptedContentHex = Buffer.from(encryptedComponents.encryptedContent, 'base64')
          .toString('hex');
        // 2. Convert OpenSSL Salted prefix from UTF-8 to Hex
        const saltedPrefixHex = Buffer.from(`Salted__${saltUTF}`, 'utf8').toString('hex');
        // 3. Remove OpenSSL Salted prefix Hex from encrypted content Hex
        const encryptedContentWithoutSaltPrefix = encryptedContentHex.substr(saltedPrefixHex.length);
        // 4. Decrypt Hex encrypted content with derived key
        const decryptTool = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
        let decryptedText = decryptTool.update(
          encryptedContentWithoutSaltPrefix, 'hex', 'utf8',
        );
        // 5. Convert decrypted content from Hex to UTF-8
        decryptedText += decryptTool.final('utf8');

        return decryptedText;
      });
  }

  // Secret key derivation algo, based on a random salt and encryption rounds.
  // Ref: https://en.wikipedia.org/wiki/PBKDF2
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
    const bits = PASSWORD_KEY_SIZE_BYTES * 8;
    return this.pbkdf2(password, salt, DERIVATION_ROUNDS, bits);
  }

  generateIV() {
    return Promise.resolve(Buffer.from(crypto.randomBytes(IV_LENGTH_HEX / 2)));
  }

  generateSalt() {
    const saltLengthBytes = SALT_LENGTH_HEX / 2;
    let output = '';
    while (output.length < saltLengthBytes) {
      output += crypto.randomBytes(3).toString('base64');
      if (output.length > saltLengthBytes) {
        output = output.substr(0, saltLengthBytes);
      }
    }
    return Promise.resolve(output);
  }

  packageComponents(components) {
    // HEX + HEX + Base64
    return `${components.salt}${components.iv}${components.encryptedContent}`;
  }

  unpackageComponents(payload) {
    return {
      salt: payload.substr(0, SALT_LENGTH_HEX), // HEX
      iv: payload.substr(SALT_LENGTH_HEX, IV_LENGTH_HEX), // HEX
      encryptedContent: payload.substr(SALT_LENGTH_HEX + IV_LENGTH_HEX), // Base64
    };
  }
}

module.exports = SeedCrypter;
