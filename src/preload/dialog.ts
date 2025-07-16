import { electronAPI } from "@electron-toolkit/preload";

export default {
  SecondaryConfirmation: async (config: Electron.MessageBoxOptions) => {
   return await electronAPI.ipcRenderer.invoke(
      "fc:SecondaryConfirmationDialog",
      config
    );
  }
};
