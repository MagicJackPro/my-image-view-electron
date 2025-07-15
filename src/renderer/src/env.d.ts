/// <reference types="vite/client" />
interface ObjectConstructor {
  keys<T>(o: T): (keyof T)[]; // 覆盖 Object.keys 的类型
}