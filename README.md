# Crypto keys encryption tools - Crypter

### Usage

##### Run locally

- Save [dist/index.html](dist/index.html) file to your computer.
- Open the HTML saved file in your browser.
- Encrypt/decrypt your wallet secret seed.

##### Run online

- Open code in [JSFiddle](https://jsfiddle.net/v2Lykewx/) or [JSEditor](https://jseditor.io/?key=419ae2fb715511ecb79fc4377264e2bc)
- Press `Run`
- Encrypt/decrypt your wallet secret seed.

#### OpenSSL compatibility

`Crypter` encrypted strings can be easily decrypted with [OpenSSL lib](https://www.openssl.org/docs/man1.1.1/man1/enc.html) from a CLI.
Each encrypted result has a 16 chars long HEX salt and a 32 chars long vector prepended, used as `openssl enc` params.
Break the encrypted output in 3 parts and use them as CLI params:

`encrypted string = SALT (16 chars) + VECTOR (32 chars) + ENCRYPTED TEXT (rest of chars left as Base64)`

i.e.: `4b7049346438556e + c24f02faba048a44ed81b771562ab01a + U2FsdGVkX19LcEk0ZDhVbg4uYPOo/g0aA2DaNTHQizc=`

Encrypt from CLI:

`echo -n  "my secret text" | openssl enc -e -base64 -A -aes-256-cbc -md sha512 -pbkdf2 -iter 200000 -iv c24f02faba048a44ed81b771562ab01a -S 4b7049346438556e -k mysecretpass`

Decrypt from CLI:

`echo -n "U2FsdGVkX19LcEk0ZDhVbg4uYPOo/g0aA2DaNTHQizc=" | openssl enc -d -base64 -A -aes-256-cbc -md sha512 -pbkdf2 -iter 200000 -iv c24f02faba048a44ed81b771562ab01a -S 4b7049346438556e -k mysecretpass`

Check out [stringEncrypt.sh](stringEncrypt.sh) file for more CLI enc info.
