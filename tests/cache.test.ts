import { describe, it, expect } from 'vitest';
import { cachescribe } from '../src/cache';

const sleep = async (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

describe(
  'cache',
  () => {
    describe('operations', () => {
      it('should set and get an entry', () => {
        const cache = cachescribe({ snapshot: false });

        cache.set('key', 'value');

        expect(cache.get('key')).toEqual('value');
      });

      it('should set and get multiple entries', () => {
        const cache = cachescribe({ snapshot: false });

        cache.mset(
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' }
        );

        const values = cache.mget('key1', 'key2', 'key3');

        expect(values).toEqual({
          key1: 'value1',
          key2: 'value2',
          key3: 'value3',
        });
      });

      it('should take an entry and take multiple entries', () => {
        const cache = cachescribe({ snapshot: false });
        cache.set('key', 'value');
        cache.set('anotherKey', 'anotherValue');

        const value = cache.take('key');
        expect(value).toEqual('value');
        expect(cache.get('key')).toBeUndefined();

        const values = cache.mtake('key', 'anotherKey');
        expect(values).toEqual({ anotherKey: 'anotherValue' });
        expect(cache.get('anotherKey')).toBeUndefined();
      });

      it('should delete an entry and delete multiple entries', () => {
        const cache = cachescribe({ snapshot: false });

        cache.set('key', 'value');
        expect(cache.del('key')).toBe(true);
        expect(cache.get('key')).toBeUndefined();

        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');

        cache.mdel('key1', 'key3');
        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toEqual('value2');
        expect(cache.get('key3')).toBeUndefined();
      });

      it('should check for an entry and check for multiple entries', () => {
        const cache = cachescribe({ snapshot: false });

        cache.set('key', 'value');
        expect(cache.has('key')).toBe(true);
        expect(cache.has('nonExistentKey')).toBe(false);

        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        expect(cache.mhas('key1', 'key2')).toBe(true);
        expect(cache.mhas('key1', 'nonExistentKey')).toBe(false);
      });

      it('should flush all entries', () => {
        const cache = cachescribe({ snapshot: false });
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');

        cache.flush();

        expect(cache.get('key1')).toBeUndefined();
        expect(cache.get('key2')).toBeUndefined();
      });

      it('should get iterable of keys, values, and entries', () => {
        const cache = cachescribe({ snapshot: false });
        cache.set('key1', 'value1');
        cache.set('key2', 'value2');
        cache.set('key3', 'value3');

        const keys = Array.from(cache.keys());
        expect(keys).toEqual(['key1', 'key2', 'key3']);

        const values = Array.from(cache.values());
        expect(values).toEqual(['value1', 'value2', 'value3']);

        const entries = Array.from(cache.entries());
        expect(entries).toEqual([
          ['key1', 'value1'],
          ['key2', 'value2'],
          ['key3', 'value3'],
        ]);
      });
    });

    describe('time to live (ttl)', () => {
      describe('standard ttl', () => {
        it('should delete cache entry if it is expired', async () => {
          const cache = cachescribe({ snapshot: false, ttl: 1 });

          cache.set('key', 'value');

          await sleep(1000);

          expect(cache.get('key')).toBeUndefined();
        });

        it('should return cache entry if it is not expired', async () => {
          const cache = cachescribe({ snapshot: false, ttl: 1 });

          cache.set('key', 'value');

          expect(cache.get('key')).toEqual('value');
        });
      });
      describe('specific ttl', () => {
        it('should delete cache entry if it is expired', async () => {
          const cache = cachescribe({ snapshot: false, ttl: 3 });

          cache.set('key', 'value', 1);

          await sleep(1000);

          expect(cache.get('key')).toBeUndefined();
        });

        it('should return cache entry if it is not expired', async () => {
          const cache = cachescribe({ snapshot: false, ttl: 1 });

          cache.set('key', 'value', 3);

          await sleep(1000);

          expect(cache.get('key')).toEqual('value');
        });

        it('should handle changing ttl correctly', async () => {
          const cache = cachescribe({ snapshot: false, ttl: 0 });

          cache.set('key', 'value', 1);

          cache.ttl('key', 3);

          await sleep(1000);

          expect(cache.get('key')).toEqual('value');
        });
      });
    });
  },
  { timeout: 10000 }
);
