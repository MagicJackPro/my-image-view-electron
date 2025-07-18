import { ElectronAPI } from "@electron-toolkit/preload";
import type DialogAPI from "./dialog";
import type {FSAPIFace} from "./fs";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      dialog: DialogAPI;
      fs: FSAPIFace;
    };
  }
}
