/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GLM_API_BASE: string
  readonly VITE_GLM_API_KEY: string
  readonly VITE_GLM_MODEL_NAME: string
  readonly VITE_QWEN_VL_URL: string
  readonly VITE_QWEN_VL_KEY: string
  readonly VITE_SEED_IMAGE_URL: string
  readonly VITE_SEED_IMAGE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
