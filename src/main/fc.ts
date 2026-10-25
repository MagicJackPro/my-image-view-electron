import { ipcMain, dialog, app } from "electron";
import { fileTypeFromFile, fileTypeFromBuffer } from "file-type";
import { readdir, copyFile, access, mkdir, open, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { imageSize } from "image-size";
import Validator from "fastest-validator";
import Logger from "./logger";
import getPaths from "./paths";

import type { BrowserWindow } from "electron";

let mainWindow: BrowserWindow | undefined = undefined;

export function updateMainWindow(newMainWindow: BrowserWindow) {
  mainWindow = newMainWindow;
}

ipcMain.handle("fc:readdir", (_IpcMainInvokeEvent, folderPath: string) => {
  try {
    return readdir(folderPath);
  } catch (error) {
    return Promise.reject("Failed to read the folder");
  }
});

ipcMain.handle("fc:readFileType", async (_IpcMainInvokeEvent, filePathArray: string[]) => {
  try {
    const typeData = await fileTypeFromFile(join(...filePathArray));
    if (typeData === undefined) {
      return Promise.reject("Failed to read the file type");
    }
    return typeData;
  } catch (error) {
    return Promise.reject(error);
  }
});

ipcMain.handle(
  "fc:readPicture",
  async (_IpcMainInvokeEvent, pathArray: string[]): Promise<NFileSystem.ReadPictureResolveFace> => {
    try {
      const filePath = join(...pathArray);
      const fileHandle = await open(join(filePath), "r");
      const fileBuffer = await fileHandle.readFile();
      const originStats = await fileHandle.stat({ bigint: false });
      fileHandle.close();

      const type = await fileTypeFromBuffer(fileBuffer);
      const resolution = imageSize(fileBuffer);

      const stats = {
        birthtime: originStats.birthtime,
        ctime: originStats.ctime,
        atime: originStats.atime,
        mtime: originStats.mtime
      };

      return { type, resolution, buffer: Buffer.from(fileBuffer), stats, path: filePath };
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

ipcMain.handle("fc:selectDir", async (_IpcMainInvokeEvent,defaultPath ?:string) => {
  try {
    const config: Electron.OpenDialogOptions = {
      defaultPath,
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

ipcMain.handle(
  "fc:classification",
  async (_IpcMainInvokeEvent, dirPath: string, record: NSqlite.Record) => {
    // 检查输出目录是否存在，没有创建
    const needMakeDir: string[] = [];
    const outputDirName = record.outputDirName;
    for (let index = 0; index < outputDirName.length; index++) {
      const tempPath = join(dirPath, ...outputDirName.slice(0, index + 1));

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
    const target = join(dirPath, ...record.outputDirName, record.name);
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

ipcMain.handle(
  "fc:readConfig",
  async (): Promise<{ data?: ConfigFace; error?: { type: string; message: string } }> => {
    const configPath = getPaths().configPath;
    try {
      await access(configPath);
    } catch (error) {
      Logger.warn({ message: { "en-us": "config.json does not exists" },path: configPath });
      return { error: { type: "exist", message: "config.json does not exists" } };
    }
    const originalString = await readFile(configPath, {
      encoding: "utf-8"
    });
    const unSafeValue: unknown = JSON.parse(originalString);
    const result = ValidatorConfig(unSafeValue);
    if (result === true) {
      return { data: unSafeValue as ConfigFace };
    } else {
      Logger.error({ message: { "zh-cn": "读取配置文件错误" }, result });

      return {
        error: {
          type: "content-format-is-incorrect",
          message: "The content format is incorrect"
        }
      };
    }
  }
);

ipcMain.handle("fc:saveConfig", async (_IpcMainInvokeEvent, config: ConfigFace) => {
  const paths = getPaths();

  // 验证路径,不存在则创建
  try {
    await access(paths.configDirPath);
  } catch {
    Logger.info({ message: { "en-us": "The path does not exist, create the path. Run mkdir." } });
    await mkdir(paths.configDirPath);
  }
  const newData = JSON.stringify(config);
  await writeFile(paths.configPath, newData);
  Logger.info({ message: { "en-us": "Save config completed." } });
});

function ValidatorConfig(unSafeValue: any) {
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
          empty: true,
          max: 50,
          items: {
            type: "object",
            props: {
              aspectRatioClassification: "boolean",
              calculateTheMagnification: "boolean",
              IsClassified: "boolean",
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

  return check(unSafeValue);
}
