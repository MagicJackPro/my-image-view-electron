import { ipcRenderer } from "electron"

export default {
  SecondaryConfirmation: async (config: Electron.MessageBoxOptions) => {
   return await ipcRenderer.invoke(
      "fc:SecondaryConfirmationDialog",
      config
    );
  }
};
