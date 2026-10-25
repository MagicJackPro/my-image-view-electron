import Pino from "pino";
import dayjs from "dayjs";
import path from "node:path";
import { ipcMain } from "electron";
import getPaths from "./paths";

/** 初始化日志模块 */
function init() {
  const IsDev = import.meta.env.DEV;
  const streams: any [] = [
    Pino.destination({contentMode: "utf8"}),
  ];

  const FileName = `log_${dayjs().format("YYYY_MM_DD_HH_mm_ss_ZZ")}.txt`;
  const DirPath = getPaths().logPath;
  const LogPath = path.join(DirPath, FileName);

  streams.push(
    Pino.destination({
      dest: LogPath,
      // minLength: 4096,
      sync: false,
      mkdir: true,
      contentMode: "utf8"
    })
  );

  const Level = IsDev ? "trace" : "warn";

  const Logger = Pino({ level: Level }, Pino.multistream(streams));
  return Logger;
}

// TODO 控制日志大小

const Logger = init();

//#region 写入日志
ipcMain.handle("log:trace", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.trace(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:trace is fail"));
  }
});
ipcMain.handle("log:debug", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.debug(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:debug is fail"));
  }
});
ipcMain.handle("log:info", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.info(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:info is fail"));
  }
});
ipcMain.handle("log:warn", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.warn(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:warn is fail"));
  }
});
ipcMain.handle("log:error", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.error(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:error is fail"));
  }
});
ipcMain.handle("log:fatal", (_IpcMainInvokeEvent, argument: string | object) => {
  try {
    Logger.fatal(argument);
    return;
  } catch (error) {
    return Promise.reject(new Error("log:fatal is fail"));
  }
});
//#endregion

export default Logger;
