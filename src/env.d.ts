/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_POLL_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
