import { join } from "node:path";

export default function getPaths() {
  const softPath = process.cwd();
  const obj = {
    dirPath: "",
    configDirPath: "",
    configPath: "",
    logPath: "",
    cachesDir: "",
  };
  if (import.meta.env.PROD) {
    obj.dirPath = join(softPath, "data");
  } else {
    obj.dirPath = join(softPath, "devData");
  }
  obj.logPath = join(obj.dirPath, "log");
  obj.configDirPath = join(obj.dirPath, "data")
  obj.configPath = join(obj.configDirPath, "config.json");
  obj.cachesDir = join(obj.dirPath, "caches");

  return obj;
}
