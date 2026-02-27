/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_ENABLE_API_MOCKING: string;
  readonly VITE_APP_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
