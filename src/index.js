const SeedCrypter = require('./SeedCrypter');

// Example:
// const seed = 'gaffe reward mask banquet slab mirror identity cart kit organize ambition apathy retain amuse minor grave insert witch spill precede leader hour salmon violation';
// const pass = 'myverylongsecretpasswordthatnobodyshouldknowexceptme';

window.encryptSeedWithPass = function encryptSeedWithPass() {
  const seed = document.getElementById('encrypt-seed').value;
  const pass = document.getElementById('encrypt-pass').value;

  SeedCrypter.encrypt(seed, pass)
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

  SeedCrypter.decrypt(seed, pass)
    .then((out) => {
      document.getElementById('decrypt-out').innerText = out;
    })
    .catch((err) => {
      window.alert(err);
    });
};
