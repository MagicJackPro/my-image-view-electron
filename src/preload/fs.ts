import { electronAPI } from "@electron-toolkit/preload";
import type { FileTypeResult } from "file-type";
import type { Stats } from "node:fs";

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
  buffer: Uint8Array;
  resolution: { height: number; width: number; type: string };
  type: { ext: string; mime: string };
  stats: Stats;
}

function readPicture(path: string): Promise<ReadPictureResolveFace> {
  return invoke("fc:readPicture", path);
}

export interface FSAPIFace {
  readdir: (folderPath: string) => Promise<string[]>;
  readFileType: (filePath: string) => Promise<FileTypeResult>;
  readPicture: (path:string) => Promise<ReadPictureResolveFace>
}
const FSAPI: FSAPIFace = { readdir, readFileType ,readPicture};
export default FSAPI;
