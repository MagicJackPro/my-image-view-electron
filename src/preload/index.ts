import { contextBridge ,webUtils} from "electron";
import DialogAPI from "./dialog";
import FSAPI from "./fs";
import sqlite from "./sqlite";
import FcAPI from "./fc"
import LogAPI from "./logger";

// Custom APIs for renderer
const api = {
  sqlite,
  dialog: DialogAPI,
  fs: FSAPI,
  fc: FcAPI,
  log: LogAPI,
  webUtils: {
    getPathForFile: (file:File):string => webUtils.getPathForFile(file)
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error("contextBridge.exposeInMainWorld error")
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api;
}
