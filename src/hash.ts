import crypto from 'node:crypto';
import { z } from 'zod';

/**
 * enum of algorithms supported by `node:crypto`.
 *
 * @public
 */
export const hashAlgorithms = Object.freeze({
  'RSA-MD5': 'RSA-MD5',
  'RSA-RIPEMD160': 'RSA-RIPEMD160',
  'RSA-SHA1': 'RSA-SHA1',
  'RSA-SHA1-2': 'RSA-SHA1-2',
  'RSA-SHA224': 'RSA-SHA224',
  'RSA-SHA256': 'RSA-SHA256',
  'RSA-SHA3-224': 'RSA-SHA3-224',
  'RSA-SHA3-256': 'RSA-SHA3-256',
  'RSA-SHA3-384': 'RSA-SHA3-384',
  'RSA-SHA3-512': 'RSA-SHA3-512',
  'RSA-SHA384': 'RSA-SHA384',
  'RSA-SHA512': 'RSA-SHA512',
  'RSA-SHA512/224': 'RSA-SHA512/224',
  'RSA-SHA512/256': 'RSA-SHA512/256',
  'RSA-SM3': 'RSA-SM3',
  blake2b512: 'blake2b512',
  blake2s256: 'blake2s256',
  'id-rsassa-pkcs1-v1_5-with-sha3-224': 'id-rsassa-pkcs1-v1_5-with-sha3-224',
  'id-rsassa-pkcs1-v1_5-with-sha3-256': 'id-rsassa-pkcs1-v1_5-with-sha3-256',
  'id-rsassa-pkcs1-v1_5-with-sha3-384': 'id-rsassa-pkcs1-v1_5-with-sha3-384',
  'id-rsassa-pkcs1-v1_5-with-sha3-512': 'id-rsassa-pkcs1-v1_5-with-sha3-512',
  md5: 'md5',
  'md5-sha1': 'md5-sha1',
  md5WithRSAEncryption: 'md5WithRSAEncryption',
  ripemd: 'ripemd',
  ripemd160: 'ripemd160',
  ripemd160WithRSA: 'ripemd160WithRSA',
  rmd160: 'rmd160',
  sha1: 'sha1',
  sha1WithRSAEncryption: 'sha1WithRSAEncryption',
  sha224: 'sha224',
  sha224WithRSAEncryption: 'sha224WithRSAEncryption',
  sha256: 'sha256',
  sha256WithRSAEncryption: 'sha256WithRSAEncryption',
  'sha3-224': 'sha3-224',
  'sha3-256': 'sha3-256',
  'sha3-384': 'sha3-384',
  'sha3-512': 'sha3-512',
  sha384: 'sha384',
  sha384WithRSAEncryption: 'sha384WithRSAEncryption',
  sha512: 'sha512',
  'sha512-224': 'sha512-224',
  'sha512-224WithRSAEncryption': 'sha512-224WithRSAEncryption',
  'sha512-256': 'sha512-256',
  'sha512-256WithRSAEncryption': 'sha512-256WithRSAEncryption',
  sha512WithRSAEncryption: 'sha512WithRSAEncryption',
  shake128: 'shake128',
  shake256: 'shake256',
  sm3: 'sm3',
  sm3WithRSAEncryption: 'sm3WithRSAEncryption',
  'ssl3-md5': 'ssl3-md5',
  'ssl3-sha1': 'ssl3-sha1',
});

/**
 * typeof hashing algorithms supported by `node:crypto`.
 *
 * @public
 */
export type HashAlgorithm = keyof typeof hashAlgorithms;

const HashParamsSchema = z.object({
  algorithm: z
    .nativeEnum(hashAlgorithms)
    .refine(
      (algorithm) => crypto.getHashes().includes(algorithm),
      'hash algorithm used is not supported by `node:crypto`'
    ),
  values: z.array(z.string()).nonempty(),
});

/**
 * hashes a set of string values to a hex code.
 *
 * @param algorithm - hashing algorithm to be used.
 * @param values - set of string values to be hashed into a hex code.
 *
 * @returns hex code that resulted from hashing the given set of string values.
 */
export const hash = (
  algorithm: HashAlgorithm | (string & {}),
  values: [string, ...string[]]
): string => {
  const options = HashParamsSchema.parse({ algorithm, values });

  const hashed = crypto.createHash(options.algorithm);

  for (const value of options.values) hashed.update(value);

  return hashed.digest('hex');
};
