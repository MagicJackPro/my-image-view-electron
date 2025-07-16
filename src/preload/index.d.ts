import { ElectronAPI } from "@electron-toolkit/preload";
import type  DialogAPI  from "./dialog";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      dialog: DialogAPI;
    };
  }
}
