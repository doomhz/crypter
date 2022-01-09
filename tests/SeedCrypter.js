const should = require('should');
const SeedCrypter = require('../src/SeedCrypter');

describe('SeedCrypter', () => {
  const crypter = new SeedCrypter();
  const textToEncrypt = 'gaffe reward mask banquet slab mirror identity cart kit organize ambition apathy retain amuse minor grave insert witch spill precede leader hour salmon violation';
  const password = 'myverylongsecretpasswordthatnobodyshouldknowexceptme';
  const salt = '486644334d756735';
  const iv = '0e70dec0885c98fd55d8df6ef4c87744';
  const encryptedContent = 'U2FsdGVkX19IZkQzTXVnNXjb3XpEQRTty7/y73wFxxl18fe373QHs6qIKagg3OwApSTX+S9F4e2B1bhj9kkRv7kBM/ILwe/iJKySVG6YMkBP2Y1xUd/aM8dtkLVQuKx+naao72NMIiYHYi4PVAQK7UW8mRvc9+HvnloDRYwKw+MWW4f3CdLa6r6FouRlb3QDoGCH4tu0pVBwkTfjNDgM2iUfQjsw/yfU8xzio4gGLle6cPdLbQDgSbH63HyiaDXm';

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

  describe('generateSalt', () => {
    it('returns a random salt', async () => {
      const newSalt = await crypter.generateSalt();
      should(newSalt.length).eql(8);
    });
  });
});
