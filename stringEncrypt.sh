#!/bin/bash

# bash encrypt with OpenSSL lib:

# openssl enc -base64 -e -aes-256-cbc -md sha512 -pbkdf2 -iter 100000 -salt -in seed_ldg_d1.txt -out seed_ldg_d1_enc.txt
# openssl enc -base64 -d -aes-256-cbc -md sha512 -pbkdf2 -iter 100000 -salt -in seed_ldg_d1_enc.txt -out seed_ldg_d1_dec.txt

# echo "mysupersecretlooooongpassssssssssss" | openssl enc -base64 -e -aes-256-cbc -md sha512 -pbkdf2 -iter 100000 -salt
# echo "U2FsdGVkX1818f7dBByG5hBkAALP+XeSvmiRmmPMZX35ev8leqhsuCBgQtoZD/1D\nJQ3sgOM4wpEbcDWm8Evu8A==" | openssl enc -base64 -d -aes-256-cbc -md sha512 -pbkdf2 -iter 100000 -salt
