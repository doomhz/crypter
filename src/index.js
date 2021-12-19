const SeedCrypter = require('./SeedCrypter');

const crypter = new SeedCrypter();

window.encryptSeedWithPass = function encryptSeedWithPass() {
  const seed = document.getElementById('encrypt-seed').value;
  const pass = document.getElementById('encrypt-pass').value;

  crypter.encrypt(seed, pass)
    .then((out) => {
      document.getElementById('encrypt-out').innerText = out;
    })
    .catch((err) => {
      window.alert(err);
    });
};

window.decryptSeedWithPass = function decryptSeedWithPass() {
  const seed = document.getElementById('decrypt-seed').value;
  const pass = document.getElementById('decrypt-pass').value;

  crypter.decrypt(seed, pass)
    .then((out) => {
      document.getElementById('decrypt-out').innerText = out;
    })
    .catch((err) => {
      window.alert(err);
    });
};
