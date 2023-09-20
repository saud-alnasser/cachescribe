import { describe, it, expect } from 'vitest';
import { hash, hashAlgorithms } from '../src/hash';
import crypto from 'node:crypto';

describe('hash', () => {
  describe('enum', () => {
    it('should include all algorithms supported by node:crypto', () => {
      expect(Object.values(hashAlgorithms)).toEqual(crypto.getHashes());
    });

    it("should have every key same as to it's corresponding value", () => {
      expect(Object.keys(hashAlgorithms)).toEqual(
        Object.values(hashAlgorithms)
      );
    });
  });

  describe('function', () => {
    it('should throw error if unsupported algorithm provided', () => {
      expect(() => hash('unknown', ['value'])).toThrow();
    });

    it('should provide correct hex using the provided algorithm', () => {
      expect(hash('md5', ['value'])).toEqual(
        '2063c1608d6e0baf80249c42e2be5804'
      );

      expect(hash('sha1', ['value'])).toEqual(
        'f32b67c7e26342af42efabc674d441dca0a281c5'
      );
    });
  });
});
