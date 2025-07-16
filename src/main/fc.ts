import { ipcMain, dialog } from "electron";
import { fileTypeFromFile, fileTypeFromBuffer } from "file-type";
import { readdir, readFile, copyFile, access, mkdir } from "node:fs/promises";
import { imageSize } from "image-size";

ipcMain.handle("fc:ls", async (_IpcMainInvokeEvent, path: string) => {
  try {
    const files = await readdir(path);
    // console.log(`files.length:`, files.length);
    return files;
    // for (const file of files) {
    //   console.log(`file:`, file);
    // }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:readFileType", async (_IpcMainInvokeEvent, path: string) => {
  try {
    const typeData = await fileTypeFromFile(path);
    if (typeData) {
      console.log(`typeData:`, typeData);
      return typeData;
    }
    return "";
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:readFile", async (_IpcMainInvokeEvent, path: string) => {
  try {
    // const fileHandle = await open(path,"r")
    const fileBuffer = await readFile(path);
    const type = await fileTypeFromBuffer(fileBuffer);
    const resolution = imageSize(fileBuffer);
    return { type, resolution, buffer: fileBuffer };
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:selectDir", async (_IpcMainInvokeEvent) => {
  try {
    const config: Electron.OpenDialogOptions = {
      properties: ["openDirectory", "dontAddToRecent"],
      title: "请选择要处理的图片文件夹",
      message: "message "
    };
    const OpenDialogReturnValue = await dialog.showOpenDialog(config);
    if (OpenDialogReturnValue.filePaths.length > 0) {
      return OpenDialogReturnValue.filePaths[0];
    }
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle(
  "fc:SecondaryConfirmationDialog",
  async (_IpcMainInvokeEvent, config: Electron.MessageBoxOptions) => {
    const MessageBoxReturnValue = await dialog.showMessageBox(config);
    return MessageBoxReturnValue;
  }
);

interface Record {
  /** 文件名 */
  name: string;
  /** 处理方式 */
  processingMethod: string;
  /** 输出目录名称 */
  outputDirName: string;
}

ipcMain.handle(
  "fc:classification",
  async (_IpcMainInvokeEvent, dirPath: string, record: Record) => {
    const source = `${dirPath}\\${record.name}`;
    const target = `${dirPath}\\${record.outputDirName}\\${record.name}`;
    {
      const outputDir = `${dirPath}\\${record.outputDirName}`;
      try {
        await access(outputDir);
      } catch (error) {
        await mkdir(outputDir);
      }
    }
    await copyFile(source, target);
  }
);
