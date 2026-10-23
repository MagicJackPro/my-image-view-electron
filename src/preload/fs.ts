import { ipcRenderer } from "electron";
import type { FileTypeResult } from "file-type";
import type { app } from "electron";

const invoke = ipcRenderer.invoke;

/**
 * 读取文件夹
 * @param {string} folderPath
 * @returns
 */
function readdir(folderPath: string): Promise<string[]> {
  return invoke("fc:readdir", folderPath);
}
/**
 * 读取文件类型
 * @param filePath 文件路径
 * @returns 文件类型
 * @throws 返回读取文件类型失败
 */
function readFileType(filePathArray: string[]): Promise<FileTypeResult>{
  return invoke("fc:readFileType", filePathArray);
}

function readPicture(pathArray: string[]): Promise<NFileSystem.ReadPictureResolveFace> {
  return invoke("fc:readPicture", pathArray);
}

function getAppPath(): Promise<string> {
  return invoke("fc:getAppPath");
}
/** 可以通过名称请求路径
 * @return {string} 与 name 关联的目录或文件的路径。 失败会抛出一个Error。
 */
function getPath(name: Parameters<typeof app.getPath>[0]): Promise<string> {
  return invoke("fc:getPath", name);
}

function getClassification(dirPath: string, record: NSqlite.Record): Promise<void> {
  return invoke("fc:classification", dirPath, record);
}

//TODO 修改名称
interface TongYongFace<T>{
  data: T,
  error?: {message:string, type: string}
}
type TongYongType<T> = Promise<TongYongFace<T>>
function readConfig(): TongYongType<NConfig.ConfigFace> {
  return invoke("fc:readConfig").then(result=>{
    if(result?.error){
      return Promise.reject(result.error);
    }
    return result.data;
  });
}

function saveConfig(config: NConfig.ConfigFace): Promise<void> {
  return invoke("fc:saveConfig", config);
}

export interface FSAPIFace {
  readdir: typeof readdir;
  readFileType: typeof readFileType;
  readPicture: typeof readPicture;
  getAppPath: typeof getAppPath;
  getPath: typeof getPath;
  readConfig: typeof readConfig;
  saveConfig: typeof saveConfig;
  getClassification: typeof getClassification;
}

const FSAPI: FSAPIFace = {
  readdir,
  readFileType,
  readPicture,
  getAppPath,
  getPath,
  readConfig,
  saveConfig,
  getClassification
};
export default FSAPI;
