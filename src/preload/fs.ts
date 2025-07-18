import { electronAPI } from "@electron-toolkit/preload";
import type { FileTypeResult } from "file-type";

/**
 * 读取文件夹
 * @param {string} folderPath
 * @returns
 */
function readdir(folderPath: string) {
  return electronAPI.ipcRenderer.invoke("fc:readdir", folderPath);
}
/**
 * 读取文件类型
 * @param filePath 文件路径
 * @returns 文件类型
 * @throws 返回读取文件类型失败
 */
function readFileType(filePath: string) {
  return electronAPI.ipcRenderer.invoke("fc:readFileType", filePath) as Promise<FileTypeResult>;
}
/**
 * 保存JSON文件，编码"UTF-8"
 * @param {string} savePath 保存路径
 * @param {string} data JSON文件内容
 * @returns {void}
 */
async function saveJSON(savePath: string, data: string) {
  return await electronAPI.ipcRenderer.invoke("fc:saveJSON", savePath, data);
}
/**
 * 读取JSON文件，编码"UTF-8"
 * @param {string} jsonPath 读取路径
 * @returns {string}
 */
async function readJSON(jsonPath: string) {
  return (await electronAPI.ipcRenderer.invoke("fc:readJSON", jsonPath)) as string;
}

export interface FSAPIFace {
  readdir: (folderPath:string) => Promise<string[]>
  readFileType: (filePath: string) => Promise<FileTypeResult>;
  saveJSON: (savePath: string, data: string) => Promise<void>;
  readJSON: (jsonPath: string) => Promise<string>;
}
const FSAPI:FSAPIFace = { readJSON, readdir, readFileType, saveJSON };
export default FSAPI;