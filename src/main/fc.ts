import { ipcMain, dialog } from "electron";
import { fileTypeFromFile, fileTypeFromBuffer } from "file-type";
import { readdir, readFile, copyFile, access, mkdir, appendFile } from "node:fs/promises";
import { imageSize } from "image-size";

ipcMain.handle("fc:readdir", (_IpcMainInvokeEvent, folderPath: string) => {
  try {
    return readdir(folderPath);
  } catch (error) {
    return Promise.reject(new Error("Failed to read the folder"));
  }
});

ipcMain.handle("fc:readFileType", async (_IpcMainInvokeEvent, filePath: string) => {
  try {
    const typeData = await fileTypeFromFile(filePath);
    if (typeData === undefined) {
      throw new Error("Failed to read the file type");
    }
    return typeData;
  } catch (error) {
    // console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:readPicture", async (_IpcMainInvokeEvent, path: string) => {
  try {
    const fileBuffer = await readFile(path);
    const type = await fileTypeFromBuffer(fileBuffer);
    const resolution = imageSize(fileBuffer);
    return { type, resolution, buffer: fileBuffer };
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:selectDir", async () => {
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
    return "";
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
  outputDirName: string[];
}

ipcMain.handle(
  "fc:classification",
  async (_IpcMainInvokeEvent, dirPath: string, record: Record) => {
    // 检查输出目录是否存在，没有创建
    const needMakeDir: string[] = [];
    const outputDirName = record.outputDirName;
    for (let index = 0; index < outputDirName.length; index++) {
      const tempPath = dirPath + "\\" + outputDirName.slice(0, index + 1).join("\\");
      try {
        await access(tempPath);
      } catch (error) {
        needMakeDir.push(tempPath);
      }
    }

    if (needMakeDir.length) {
      for (let index = 0; index < needMakeDir.length; index++) {
        await mkdir(needMakeDir[index]);
      }
    }
    const source = `${dirPath}\\${record.name}`;
    const target = `${dirPath}\\${record.outputDirName.join("\\")}\\${record.name}`;
    await copyFile(source, target);
  }
);

/** 生成JSON文件 */
ipcMain.handle("fc:saveJSON", (_IpcMainInvokeEvent, savePath: string, data: string) => {
  return appendFile(savePath, data, { encoding: "utf-8" });
});

/** 读取JSON */
ipcMain.handle("fc:readJSON", (_IpcMainInvokeEvent, jsonPath: string) => {
  return readFile(jsonPath, { encoding: "utf-8" });
});
