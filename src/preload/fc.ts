import { ipcRenderer } from "electron";

const invoke = ipcRenderer.invoke;

function selectDir(defaultPath?:string) : Promise<string>{
  return invoke("fc:selectDir", defaultPath);
}

export interface FcFace {
  selectDir: typeof selectDir;
}

export default {
  selectDir
};
