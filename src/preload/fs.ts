import { electronAPI } from "@electron-toolkit/preload";
import type { FileTypeResult } from "file-type";
import type { Stats } from "node:fs";
import type { app } from "electron";

const invoke = electronAPI.ipcRenderer.invoke;

/**
 * 读取文件夹
 * @param {string} folderPath
 * @returns
 */
function readdir(folderPath: string) {
  return invoke("fc:readdir", folderPath);
}
/**
 * 读取文件类型
 * @param filePath 文件路径
 * @returns 文件类型
 * @throws 返回读取文件类型失败
 */
function readFileType(filePath: string) {
  return invoke("fc:readFileType", filePath) as Promise<FileTypeResult>;
}

interface ReadPictureResolveFace {
  buffer: Buffer<ArrayBuffer>;
  resolution: { height: number; width: number; type: string };
  type: { ext: string; mime: string };
  stats: Stats;
}

function readPicture(path: string): Promise<ReadPictureResolveFace> {
  return invoke("fc:readPicture", path);
}

function getAppPath(): Promise<string> {
  return invoke("fc:getAppPath");
}
/** 您可以通过名称请求路径
 * @return {string} 与 name 关联的目录或文件的路径。 失败会抛出一个Error。
 */
function getPath(name: Parameters<typeof app.getPath>[0]): Promise<string> {
  return invoke("fc:getPath", name);
}

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
function readConfig(): Promise<ConfigFace> {
  return invoke("fc:readConfig");
}

function saveConfig(config: ConfigFace): Promise<void> {
  return invoke("fc:saveConfig", config);
}

export interface FSAPIFace {
  readdir: (folderPath: string) => Promise<string[]>;
  readFileType: (filePath: string) => Promise<FileTypeResult>;
  readPicture: (path: string) => Promise<ReadPictureResolveFace>;
  getAppPath: typeof getAppPath;
  getPath: typeof getPath;
  readConfig: typeof readConfig;
  saveConfig: typeof saveConfig;
}

const FSAPI: FSAPIFace = {
  readdir,
  readFileType,
  readPicture,
  getAppPath,
  getPath,
  readConfig,
  saveConfig
};
export default FSAPI;
