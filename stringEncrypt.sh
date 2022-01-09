#!/bin/bash

# Bash encrypt with OpenSSL lib
# Ref: https://wiki.openssl.org/index.php/Enc

# Encrypt text from console
echo -n  "my secret text" | openssl enc -e -base64 -A -aes-256-cbc -md sha512 -pbkdf2 -iter 200000 -iv c24f02faba048a44ed81b771562ab01a -S 4b7049346438556e -k mysecretpass

# Decrypt text from console
echo -n "U2FsdGVkX19LcEk0ZDhVbg4uYPOo/g0aA2DaNTHQizc=" | openssl enc -d -base64 -A -aes-256-cbc -md sha512 -pbkdf2 -iter 200000 -iv c24f02faba048a44ed81b771562ab01a -S 4b7049346438556e -k mysecretpass
