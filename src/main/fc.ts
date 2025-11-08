import { ipcMain, dialog, app } from "electron";
import { fileTypeFromFile, fileTypeFromBuffer } from "file-type";
import { readdir, copyFile, access, mkdir, open, writeFile, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { imageSize } from "image-size";
import type { BrowserWindow } from "electron";
import Validator from "fastest-validator";

let mainWindow: BrowserWindow | undefined = undefined;

export function updateMainWindow(newMainWindow: BrowserWindow) {
  mainWindow = newMainWindow;
}

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
      return Promise.reject("Failed to read the file type");
    }
    return typeData;
  } catch (error) {
    return Promise.reject(error);
  }
});

ipcMain.handle("fc:readPicture", async (_IpcMainInvokeEvent, path: string) => {
  try {
    const fileHandle = await open(path, "r");
    const fileBuffer = await fileHandle.readFile();
    const type = await fileTypeFromBuffer(fileBuffer);
    const resolution = imageSize(fileBuffer);
    const originStats = await fileHandle.stat({ bigint: false });

    const stats = {
      birthtime: originStats.birthtime,
      ctime: originStats.ctime,
      atime: originStats.atime,
      mtime: originStats.mtime
    };

    Object.entries(originStats).forEach((value) => {
      stats[value[0]] = value[1];
    });

    fileHandle.close();
    return { type, resolution, buffer: fileBuffer, stats };
  } catch (error) {
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
    if (mainWindow) {
      const OpenDialogReturnValue = await dialog.showOpenDialog(mainWindow, config);
      if (OpenDialogReturnValue.filePaths.length > 0) {
        return OpenDialogReturnValue.filePaths[0];
      }
    }
    return "";
  } catch (error) {
    return Promise.reject(error);
  }
});

ipcMain.handle(
  "fc:SecondaryConfirmationDialog",
  async (_IpcMainInvokeEvent, config: Electron.MessageBoxOptions) => {
    if (mainWindow) {
      return await dialog.showMessageBox(mainWindow, config);
    } else {
      return await dialog.showMessageBox(config);
    }
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
      const tempPath = join(dirPath, outputDirName.slice(0, index + 1).join("\\"));

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
    const source = join(dirPath, record.name);
    const target = join(dirPath, record.outputDirName.join("\\"), record.name);
    await copyFile(source, target);
  }
);

ipcMain.handle("fc:getAppPath", (_IpcMainInvokeEvent) => {
  return app.getAppPath();
});

type GetPathParameters = Parameters<typeof app.getPath>[0];

ipcMain.handle("fc:getPath", (_IpcMainInvokeEvent, name: GetPathParameters) => {
  return app.getPath(name);
});

interface CategoryButtonGroupRecord {
  /** 长宽比分类 */
  aspectRatioClassification: boolean;
  /** 计算放大倍率 */
  calculateTheMagnification: boolean;
  /** 目标目录 */
  folderName: string;
  key: string;
  /** 按钮名称 */
  label: string;
  /** 快捷键 */
  shortcutKey?: {
    /** 快捷键编码 */
    shortcutKeyCode: number;
    /** 快捷键别名 */
    shortcutKeyAlias: string;
  };
}

interface ConfigFace {
  /** 是否启用自动保存 */
  enableAutoSave: boolean;
  /** 自动保存时间间隔 */
  delayAutoSave: number;
  /** 分类按钮组 */
  categoryButtonGroup: {
    buttons: CategoryButtonGroupRecord[];
  };
}

function getConfigPath() {
  const dirPath = join(dirname(app.getPath("exe")), "data");

  return {
    dirPath,
    path: join(dirPath, "config.json")
  };
}

ipcMain.handle("fc:readConfig", async () => {
  const paths = getConfigPath();
  //  验证路径,不存在则抛出异常
  try {
    await access(paths.path);
    console.log("Path exists.");
    const originalString = await readFile(paths.path, {
      encoding: "utf-8"
    });
    const unSafeValue = JSON.parse(originalString);
    if (ValidatorConfig(unSafeValue)) {      
      return unSafeValue;
    } else {
      return Promise.reject({ message: "config.json is error" });
    }
  } catch (error) {
    console.error(error)
    console.log("Unable to read configuration file.");

    return Promise.reject({ message: "config.json does not exists" });
  }
});

ipcMain.handle("fc:saveConfig", async (_IpcMainInvokeEvent, config: ConfigFace) => {
  console.log('ipcMain handle run "fc:saveConfig"');

  const paths = getConfigPath();

  // console.log(`paths:`, JSON.stringify(paths));
  // 验证路径,不存在则创建
  try {
    console.log("verification path.");

    await access(paths.dirPath);
    console.log("Path exists.");
  } catch {
    console.log("The path does not exist, create the path.");

    await mkdir(paths.dirPath);
  }
  console.log(`config.enableAutoSave:`, config.enableAutoSave);
  const newData = JSON.stringify(config);
  await writeFile(paths.path, newData);
});

function ValidatorConfig(unSafeValue: any): boolean {
  const v = new Validator();

  const schema = {
    enableAutoSave: "boolean",
    /** 自动保存时间间隔 */
    delayAutoSave: { type: "number", min: 1, max: 10, integer: true },
    categoryButtonGroup: {
      type: "object",
      props: {
        buttons: {
          type: "array",
          empty:true,
          max: 50,
          items: {
            type: "object",
            props: {
              aspectRatioClassification: "boolean",
              calculateTheMagnification: "boolean",
              folderName: "string",
              key: "string",
              label: "string",
              shortcutKey: {
                type: "object",
                props: {
                  shortcutKeyCode: "number",
                  shortcutKeyAlias: "string"
                },
                optional: true
              }
            }
          }
        }
      }
    }
  };

  const check = v.compile(schema);

  const result = check(unSafeValue)
  if (result === true) {
    return true;
  }else{
    console.log(`result:`, result);
  }
  return false;
}
