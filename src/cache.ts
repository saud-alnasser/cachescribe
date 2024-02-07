import fs from 'fs-extra';
import { join } from 'node:path';
import slash from 'slash';
import superjson from 'superjson';
import { z } from 'zod';
import { hash, hashAlgorithms } from './hash';

const CacheOptionsSchema = z.object({
  /**
   * unique identifier that will be used in snapshot filename generation to avoid overwrite by other caches.
   *
   * @remarks each namespace corresponds to a file.
   *
   * @default
   * 'default'
   */
  namespace: z.string().min(1).optional(),

  /**
   * directory that the snapshot file will be written in.
   *
   * @default node_modules/.cache/cachescribe
   */
  directory: z.string().min(1).optional(),

  /**
   * file extension to be used for the cache snapshot file.
   *
   * @remarks make sure you don't include the `.` in the extension.
   *
   * @default ''
   */
  extension: z.string().optional(),

  /**
   * hashing algorithm to be used for snapshot filename generation.
   *
   * @default md5
   */
  algorithm: z
    .union([z.nativeEnum(hashAlgorithms), z.string().and(z.object({}))])
    .optional(),

  /**
   * duration in seconds of the standard time to live for entries.
   *
   * @remarks any entry that is inserted will be deleted form the cache after this duration.
   * if duration set to zero, then it's infinite.
   *
   * @default 0
   */
  ttl: z.number().nonnegative().optional(),

  /**
   * hashing function that will be used for cache filename generation.
   *
   * @default node:crypto
   */
  hash: z
    .function()
    .args(
      z.union([z.nativeEnum(hashAlgorithms), z.string().and(z.object({}))]),
      z.array(z.string()).nonempty()
    )
    .returns(z.string())
    .optional(),

  /**
   * should the cache create snapshot files and load from them or not.
   *
   * @remarks if true then it's just a memory cache.
   *
   * @default true
   */
  snapshot: z.boolean().optional(),

  /**
   * transformer that will serialize and deserialize the cache entries to be written in the snapshot file.
   *
   * @remarks if you want to use a different transformer make sure that it can serialize and deserialize
   * objects, arrays, primitives and any type you wish to store in the cache.
   *
   * @default superjson
   */
  transformer: z
    .object({
      serialize: z.function().args(z.unknown()).returns(z.string()),
      deserialize: z.function().args(z.string()).returns(z.unknown()),
    })
    .optional(),
});

const CacheEntrySchema = z.object({
  /**
   * metadata for the cache entry.
   */
  meta: z.object({
    /**
     * key of the entry.
     */
    key: z.string().min(1),

    /**
     * duration in seconds for the time to live for the entry.
     *
     * @remarks if set to zero, then it's infinite.
     *
     * @default 0
     */
    ttl: z.number().nonnegative(),

    /**
     * creation date of the entry.
     */
    timestamp: z.date(),
  }),

  /**
   * value of the entry.
   */
  value: z.unknown(),
});

const CacheSnapshotSchema = z.object({
  /**
   * metadata for the snapshot file.
   */
  meta: z.object({
    /**
     * id of the snapshot file.
     */
    id: z.string().min(1),
  }),

  /**
   * entries stored in the snapshot file.
   */
  entries: z.array(z.tuple([z.string(), CacheEntrySchema])),
});

const CacheEntryParamsSchema = z
  .object({
    key: z.string().nonempty().optional(),
    keys: z.array(z.string()).nonempty().optional(),
    entries: z
      .array(
        z
          .object({
            key: z.string().min(1),
            value: z.unknown(),
          })
          .merge(CacheOptionsSchema.pick({ ttl: true }))
      )
      .nonempty()
      .optional(),
  })
  .merge(CacheOptionsSchema.pick({ ttl: true }));

/**
 * cache entry that is added by the user.
 *
 * @public
 */
export type CacheEntry = z.infer<typeof CacheEntrySchema>;

/**
 * cache snapshot file.
 *
 * @public
 */
export type CacheSnapshot = z.infer<typeof CacheSnapshotSchema>;

/**
 * configuration options for the creation of the cache.
 *
 * @public
 */
export type CacheOptions = z.infer<typeof CacheOptionsSchema>;

/**
 * a cache that can persist in the file system.
 *
 * @public
 */
export class Cache {
  #serialize;
  #deserialize;
  #cache;

  /**
   * options used for the creation of this cache.
   */
  options;

  /**
   * path to the snapshot file.
   */
  path;

  public constructor(options: CacheOptions) {
    this.options = {
      namespace: 'default',
      directory: join('node_modules', '.cache', 'cachescribe'),
      extension: '',
      algorithm: 'md5',
      ttl: 0,
      hash: hash,
      snapshot: true,
      transformer: {
        serialize: superjson.stringify,
        deserialize: superjson.parse,
      },
      ...CacheOptionsSchema.parse(options),
    } satisfies CacheOptions;

    this.path = (() => {
      const hashed = this.options.hash(this.options.algorithm, [
        this.options.namespace,
      ]);

      const name = this.options.extension
        ? `${hashed}.${this.options.extension}`
        : hashed;

      return slash(join(this.options.directory, name));
    })();

    this.#serialize = z
      .function()
      .args(CacheSnapshotSchema)
      .returns(z.string())
      .implement((cache) => {
        return this.options.transformer.serialize(cache);
      });

    this.#deserialize = z
      .function()
      .args(z.string())
      .returns(CacheSnapshotSchema)
      .implement((value) => {
        return this.options.transformer.deserialize(value) as CacheSnapshot;
      });

    if (this.options.snapshot) {
      this.#cache = this.#load();

      process.setMaxListeners(process.getMaxListeners() + 5);

      process.on('SIGINT', () => process.exit(0));
      process.on('SIGTERM', () => process.exit(0));
      process.on('SIGQUIT', () => process.exit(0));
      process.on('uncaughtException', () => process.exit(1));

      process.on('exit', () => this.#snapshot());
    } else {
      this.#cache = new Map<string, CacheEntry>();
    }
  }

  #load(): Map<string, CacheEntry> {
    try {
      fs.ensureDirSync(this.options.directory);

      const snapshot = this.#deserialize(
        fs.readFileSync(this.path).toString('utf-8')
      );

      const cache = new Map(snapshot.entries);

      for (const [key, entry] of this.#cache.entries()) {
        if (this.#isExpired(entry.meta.timestamp, entry.meta.ttl)) {
          cache.delete(key);
        }
      }

      return cache;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return new Map([]);
      } else {
        throw new Error(
          `failed to read cache snapshot (namespace: ${this.options.namespace}, path: ${this.path}, message: ${error.message})`
        );
      }
    }
  }

  #snapshot(): void {
    try {
      fs.outputFileSync(
        this.path,
        this.#serialize(
          CacheSnapshotSchema.parse({
            meta: {
              id: this.options.namespace,
            },
            entries: Array.from(this.#cache),
          })
        )
      );
    } catch (error: any) {
      throw new Error(
        `failed to write cache snapshot (namespace: ${this.options.namespace}, path: ${this.path}, message: ${error.message})`
      );
    }
  }

  #isExpired(timestamp: Date, ttl: number) {
    if (ttl <= 0) return false;

    const elapsed =
      (new Date().getTime() - new Date(timestamp).getTime()) / 1000;

    return elapsed > ttl;
  }

  /**
   * adds a new entry to the cache.
   *
   * @remarks if an entry with the same key already exists, the entry's value will be `updated`.
   *
   * @param key - key of the entry.
   * @param value - value of the entry.
   * @param ttl - an overwrite of the standard ttl for this specific entry.
   */
  set(key: string, value: unknown, ttl?: number): void {
    CacheEntryParamsSchema.parse({ key, ttl });

    this.#cache.set(
      key,
      CacheEntrySchema.parse({
        meta: {
          key: key,
          ttl: ttl ?? this.options.ttl,
          timestamp: new Date(),
        },
        value: value,
      })
    );
  }

  /**
   * adds multiple new entries.
   *
   * @param entries - entries to set.
   */
  mset(
    ...entries: [
      { key: string; value: unknown; ttl?: number },
      { key: string; value: unknown; ttl?: number },
      ...{ key: string; value: unknown; ttl?: number }[],
    ]
  ): void {
    CacheEntryParamsSchema.parse({ entries });

    for (const { key, value, ttl } of entries) {
      this.set(key, value, ttl);
    }
  }

  /**
   * gets a value of an entry based on it's given key.
   *
   * @remarks if the entry's value is an object, then you will get a reference to that object
   * and any change made to that object will be modified inside the cache.
   *
   * @param key - key of the entry to get.
   * @returns value of the entry, or undefined if doesn't exits or expired.
   */
  get<TValue = unknown>(key: string): TValue | undefined {
    CacheEntryParamsSchema.parse({ key });

    const entry = this.#cache.get(key);
    if (!entry) return undefined;

    if (this.#isExpired(entry.meta.timestamp, entry.meta.ttl)) {
      this.#cache.delete(key);

      return undefined;
    }

    return entry.value as TValue;
  }

  /**
   * gets multiple entries at once.
   *
   * @param keys - keys of the entries to get.
   * @returns object of key-value pair of found entries.
   */
  mget(...keys: [string, string, ...string[]]): Record<string, unknown> {
    CacheEntryParamsSchema.parse({ keys });

    const entries: Record<string, unknown> = {};

    for (const key of keys) {
      const value = this.get(key);
      if (value) entries[key] = value;
    }

    return entries;
  }

  /**
   * gets a value of an entry then removes it form the cache.
   *
   * @param key - key of the entry to take.
   * @returns value of the entry, or undefined if doesn't exits or expired.
   */
  take<TValue>(key: string): TValue | undefined {
    CacheEntryParamsSchema.parse({ key });

    const value = this.get<TValue>(key);
    if (!value) return undefined;

    const deleted = this.del(key);
    if (!deleted) return undefined;

    return value;
  }

  /**
   * gets multiple values of entries then removes them form the cache.
   *
   * @param keys - key of the entries to take.
   * @returns object of key-value pair of found entries.
   */
  mtake(...keys: [string, string, ...string[]]): Record<string, unknown> {
    CacheEntryParamsSchema.parse({ keys });

    const entries: Record<string, unknown> = {};

    for (const key of keys) {
      const value = this.take(key);
      if (value) entries[key] = value;
    }

    return entries;
  }

  /**
   * checks whether an entry with the given key exists or not.
   *
   * @param key - key for an entry to check for it's existence.
   * @returns boolean indicating whether an entry with the given key exists or not.
   */
  has(key: string): boolean {
    CacheEntryParamsSchema.parse({ key });

    return this.#cache.has(key);
  }

  /**
   * checks whether a list of entry all exists or not.
   *
   * @param keys - keys of entries to check for their existence.
   * @returns boolean indicating whether all specified entries exist or not.
   */
  mhas(...keys: [string, string, ...string[]]) {
    CacheEntryParamsSchema.parse({ keys });

    for (const key of keys) {
      if (this.has(key)) continue;

      return false;
    }

    return true;
  }

  /**
   * removes an entry from the cache.
   *
   * @param key - key of the entry.
   * @returns boolean indicating whether the entry was found and removed or not.
   */
  del(key: string): boolean {
    CacheEntryParamsSchema.parse({ key });

    return this.#cache.delete(key);
  }

  /**
   * removes entries from the cache.
   *
   * @param keys - keys of the entries to remove.
   */
  mdel(...keys: [string, string, ...string[]]): void {
    CacheEntryParamsSchema.parse({ keys });

    for (const key of keys) {
      this.del(key);
    }
  }

  /**
   * changes the time to live for a specific cached entry.
   *
   * @param key - key of the entry.
   * @param ttl - time to live in seconds.
   * @returns boolean indicating whether entry was found and the ttl was changed or not.
   */
  ttl(key: string, ttl: number): boolean {
    CacheEntryParamsSchema.parse({ key, ttl });

    const entry = this.#cache.get(key);
    if (!entry) return false;

    entry.meta.ttl = ttl;

    return true;
  }

  /**
   * removes all entries in the cache.
   */
  flush(): void {
    this.#cache.clear();
  }

  /**
   * returns array of cache entry keys.
   *
   * @returns cache entry keys array.
   */
  keys(): IterableIterator<string> {
    return this.#cache.keys();
  }

  /**
   * returns array of cache entry values.
   *
   * @returns cache entry values array.
   */
  values(): IterableIterator<unknown> {
    return Array.from(this.#cache.values())
      .map((entry) => entry.value)
      [Symbol.iterator]();
  }

  /**
   * returns key-value paris of entries of the cache.
   *
   * @returns key-value paris of cache entries.
   */
  entries(): IterableIterator<[key: string, value: unknown]> {
    return Array.from(this.#cache.entries())
      .map(([key, entry]) => [key, entry.value])
      [Symbol.iterator]() as IterableIterator<[key: string, value: unknown]>;
  }
}

/**
 * creates a new cache that can persist in the file system.
 *
 * @param options - configuration options.
 * @returns a new cache that can persist in the file system.
 *
 * @public
 */
export const cachescribe = (options: CacheOptions = {}): Cache => {
  return new Cache(options);
};
