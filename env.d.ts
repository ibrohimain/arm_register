/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_API_KEY: string
  // boshqa env o'zgaruvchilar bo'lsa shu yerga yozing
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
