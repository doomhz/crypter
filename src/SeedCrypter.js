const { pbkdf2: deriveKey } = require('pbkdf2');
const crypto = require('crypto');
const { Buffer } = require('buffer/');

const DERIVATION_ROUNDS = 200000;
const PASSWORD_KEY_SIZE = 64;
const SALT_LENGTH = 12;

function pbkdf2(password, salt, rounds, bits) {
  return new Promise((resolve, reject) => {
    deriveKey(password, salt, rounds, bits / 8, 'sha512', (err, key) => {
      if (err) {
        return reject(err);
      }
      return resolve(key);
    });
  });
}

function deriveFromPassword(password, salt) {
  if (!password) {
    return Promise.reject(new Error('Failed deriving key: Password must be provided'));
  }
  if (!salt) {
    return Promise.reject(new Error('Failed deriving key: Salt must be provided'));
  }
  const bits = PASSWORD_KEY_SIZE * 8;
  return pbkdf2(password, salt, DERIVATION_ROUNDS, bits)
    .then((derivedKeyData) => derivedKeyData.toString('hex'))
    .then((derivedKeyHex) => {
      const dkhLength = derivedKeyHex.length;
      const keyBuffer = Buffer.from(derivedKeyHex.substr(0, dkhLength / 2), 'hex');
      return keyBuffer;
    });
}

function generateIV() {
  return Promise.resolve(Buffer.from(crypto.randomBytes(16)));
}

function generateSalt() {
  let output = '';
  while (output.length < SALT_LENGTH) {
    output += crypto.randomBytes(3).toString('base64');
    if (output.length > SALT_LENGTH) {
      output = output.substr(0, SALT_LENGTH);
    }
  }
  return Promise.resolve(output);
}

function packageComponents(encryptedContent, components) {
  return `${Object.keys(components).map((key) => `${key}=${components[key]}`).join(',')}$${encryptedContent}`;
}

function unpackageComponents(payload) {
  const [componentsStr, encryptedContent] = payload.split('$');
  const components = componentsStr.split(',').reduce((output, item) => {
    const [key, value] = item.split('=');
    return Object.assign(output, {
      [key]: value,
    });
  }, {});
  components.encryptedContent = encryptedContent;
  return components;
}

function encrypt(text, password) {
  return generateSalt()
    .then((salt) => Promise.all([
      generateIV(),
      Promise.resolve(salt),
      deriveFromPassword(password, salt),
    ]))
    .then(([iv, salt, derivedKey]) => {
      const ivHex = iv.toString('hex');
      const encryptTool = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
      // Perform encryption
      let encryptedContent = encryptTool.update(text, 'utf8', 'base64');
      encryptedContent += encryptTool.final('base64');
      // Output encrypted components
      const components = {
        i: ivHex,
        s: salt,
      };
      return packageComponents(encryptedContent, components);
    });
}

function decrypt(encryptedString, password) {
  let encryptedComponents;
  return Promise
    .resolve()
    .then(() => {
      encryptedComponents = unpackageComponents(encryptedString);
      // console.log(JSON.stringify(encryptedComponents, undefined, 2));
      return deriveFromPassword(password, encryptedComponents.s);
    })
    .then((derivedKey) => {
      const iv = Buffer.from(encryptedComponents.i, 'hex');
      // Decrypt
      const decryptTool = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
      const decryptedText = decryptTool.update(encryptedComponents.encryptedContent, 'base64', 'utf8');
      return `${decryptedText}${decryptTool.final('utf8')}`;
    });
}

module.exports = {
  encrypt, decrypt,
};
