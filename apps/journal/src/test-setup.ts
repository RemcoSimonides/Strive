import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { TextDecoder, TextEncoder } from 'node:util';

// jsdom does not implement fetch, but firebase/auth requires it at module load.
// The Node globals must be set before undici loads, hence require() instead of import.
Object.assign(globalThis, { TextDecoder, TextEncoder });
/* eslint-disable @typescript-eslint/no-require-imports */
const { ReadableStream, WritableStream, TransformStream } = require('node:stream/web');
const { Blob, File } = require('node:buffer');
const { MessageChannel, MessagePort } = require('node:worker_threads');
Object.assign(globalThis, { ReadableStream, WritableStream, TransformStream, Blob, File, MessageChannel, MessagePort });
const { fetch, Headers, Request, Response, FormData } = require('undici');
/* eslint-enable @typescript-eslint/no-require-imports */
Object.assign(globalThis, { fetch, Headers, Request, Response, FormData });

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// jsdom does not implement matchMedia, which Ionic uses for theme detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});
