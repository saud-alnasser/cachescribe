## About ❓

a simple cache that can persist in the file system across different runs of your program. 

## Usage ✨

### Installation

```bash
npm install cachescribe
```

### Initialization

> **note**: when a cache is created it tries to load entries from the snapshot file synchronously then clears all expired entries, if not found it will start as a new empty cache. it also attaches listeners on the process to create a snapshot file automatically on exit.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();
```

you can pass an object to configure these options upon initialization:

`namespace`: unique identifier that will be used for snapshot file name generation to avoid overwrites by other caches (default: `'default'`)

`directory`: the directory where the snapshot file will be written in (default: `'node_modules/.cache/cachescribe'`).

`extension`: file extension to be used for the cache snapshot file (default: `''`)

`algorithm`: hashing algorithm to be used for snapshot filename generation (default: `md5`)

`ttl`: duration in seconds of the standard time to live for entires, if duration set to zero then it's infinite (default: `0`)

`hash`: hashing function that will be used for cache filename generation (default: `node:crypto`)

`snapshot`: should the cache create snapshot files and read from them or not (default: `true`)

`transformer`: a transformer that will serialize and deserialize the cache entries to be written in the snapshot file (default: `superjson`)

### API

#### `set`:

sets a `key` and `value` pair. it is possible to define a `ttl` (in seconds).

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value', 10);
```

#### `mset`:

sets multiple `key` and `value` pairs. it is possible to define a `ttl` (in seconds).

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.mset(
  { key: 'key1', value: 'value1', ttl: 10 },
  { key: 'key2', value: 'value2' },
  { key: 'key3', value: 'value3' },
);
```

#### `get`:

gets a value from the cache. returns `undefined` if not found or expired.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value');

const value = cache.get('key');

if (value) {
  // 'value' 
}
```

#### `mget`:

gets multiple entries at once.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');

cache.set('key2', 'value2');

const values = cache.mget('key1', 'key2');
// { key1: 'value1', key2: 'value2' }

```

#### `take`:

gets a value of an entry then removes it from the cache.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value');

const value = cache.take('key');
// 'value'
```

#### `mtake`:

gets multiple values of entries then removes them from the cache.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');

cache.set('key2', 'value2');

const values = cache.mtake('key1', 'key2');
// { key1: 'value1', key2: 'value2' }
```

#### `has`:

checks whether an entry with the given key exists or not.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value');

const exists = cache.has('key');
// true
```

#### `mhas`:

checks whether a list of entries with the given keys all exists or not.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

cache.mhas('key1', 'key2');
// true
```

#### `del`:

removes any entry from the cache.


```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value');

const deleted = cache.del('key');
// true

cache.has('key');
// false
```

#### `mdel`:

removes entries from the cache.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

cache.mdel('key1', 'key2');
```

#### `ttl`:

changes the time to live for a specific cached entry.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key', 'value', 10);

cache.ttl('key', 3);
```

#### `flush`:

removes all entries in the cache.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

cache.flush();

cache.has('key1');
// false
```
#### `keys`:

returns an iterable iterator of cache entry keys.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

for (const key of cache.keys()) {
  // ...
}
```

#### `values`:

returns an iterable iterator of cache entry values.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

for (const value of cache.values()) {
  // ...
}
```

#### `entries`:

returns an iterable iterator of cache key-value pairs.

```ts
import { cachescribe } from 'cachescribe';

const cache = cachescribe();

cache.set('key1', 'value1');
cache.set('key2', 'value2');

for (const [key, value] of cache.entries()) {
  // ...
}
```

## Contribution 💡

feel free to contribute to this project but please read the [contributing guidelines] before opening an issue or pull request so you understand the branching strategy and local development environment.

[contributing guidelines]: https://github.com/saud-alnasser/cachescribe/blob/main/CONTRIBUTING.md