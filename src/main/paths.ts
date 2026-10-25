import { join } from "node:path";
/**
 * PORTABLE_EXECUTABLE_DIR：这是最常用的变量。它指向便携版 .exe 文件所在的真实目录。你应该使用这个路径来存储用户的配置、日志或数据文件，而不是 app.getPath('userData')（后者在便携版中指向临时解压目录，退出后可能被清理）。
 * PORTABLE_EXECUTABLE_FILE：便携版 .exe 的完整路径。
 * PORTABLE_EXECUTABLE_APP_FILENAME：便携版 .exe 的文件名。
 */
export default function getPaths() {
  const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;
  let softPath: string;
  if (typeof portableDir === "string") {
    softPath = portableDir;
  } else {
    softPath = process.cwd();
  }

  const obj = {
    dirPath: "",
    configDirPath: "",
    configPath: "",
    logPath: "",
    cachesDir: ""
  };
  if (import.meta.env.PROD) {
    obj.dirPath = softPath;
  } else {
    obj.dirPath = join(softPath, "devData");
  }
  obj.logPath = join(obj.dirPath, "log");
  obj.configDirPath = join(obj.dirPath, "config");
  obj.configPath = join(obj.configDirPath, "config.json");
  obj.cachesDir = join(obj.dirPath, "caches");

  return obj;
}
