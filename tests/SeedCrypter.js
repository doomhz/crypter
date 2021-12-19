const should = require('should');
const SeedCrypter = require('../src/SeedCrypter');

describe('SeedCrypter', () => {
  const crypter = new SeedCrypter();
  const textToEncrypt = 'gaffe reward mask banquet slab mirror identity cart kit organize ambition apathy retain amuse minor grave insert witch spill precede leader hour salmon violation';
  const password = 'myverylongsecretpasswordthatnobodyshouldknowexceptme';
  const salt = 'NnPEmbI4Dv6v';
  const iv = 'a1f35b76e2d006884e4906311648b699';
  const encryptedContent = 'mwWaYyH3y2dq590LUkTcL0lKVPF09nezUb0sXT4dt8zv4fKFhJ/KPl31jrjLkb5gvSazHu41Ml8IEsVGlfc80uA+EQA6G0ZqQaE5o35qGnGINjI+ySET7v8s2/dPB0An3+xF4Bals2PTktzAtgZvhT0h6IKb2khOmgyWA+skfuXUd8iJ0ZxzuletrgQEErETSUeszIUXbvMQMkHQziOBjBJZdC7jNIVT+o37yOY8leY=';

  describe('encrypt', () => {
    it('returns an encrypted string with the given password', async () => {
      const result = await crypter.encrypt(textToEncrypt, password);
      const components = crypter.unpackageComponents(result);
      should(result).eql(`${components.salt}${components.iv}${components.encryptedContent}`);
    });
  });

  describe('decrypt', () => {
    it('returns decrypted payload', async () => {
      const payload = `${salt}${iv}${encryptedContent}`;
      const result = await crypter.decrypt(payload, password);
      should(result).eql(textToEncrypt);
    });
  });

  describe('packageComponents', () => {
    it('returns a string from merged encryption properties', () => {
      const payload = `${salt}${iv}${encryptedContent}`;
      const components = { salt, iv, encryptedContent };
      should(crypter.packageComponents(components)).containEql(payload);
    });
  });

  describe('unpackageComponents', () => {
    it('returns parsed encryption properties from given string', () => {
      const payload = `${salt}${iv}${encryptedContent}`;
      should(crypter.unpackageComponents(payload)).containEql({
        salt, iv, encryptedContent,
      });
    });
  });
});
