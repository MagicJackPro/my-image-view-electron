/// <reference types="vite/client" />

interface ObjectConstructor {
  keys<T>(o: T): (keyof T)[]; // 覆盖 Object.keys 的类型
}
interface ImportMetaEnv {
  // 更多环境变量...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
