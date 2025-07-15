import { ipcMain } from 'electron';
import { fileTypeFromFile, fileTypeFromBuffer } from 'file-type';
import { readdir, open, readFile } from 'node:fs/promises';
import { imageSize } from 'image-size';

ipcMain.handle('fc:ls', async (_IpcMainInvokeEvent, path: string) => {
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

ipcMain.handle('fc:readFileType', async (_IpcMainInvokeEvent, path: string) => {
  try {
    const typeData = await fileTypeFromFile(path);
    if (typeData) {
      console.log(`typeData:`, typeData);
      return typeData;
    }
    return '';
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
});

ipcMain.handle('fc:readFile', async (_IpcMainInvokeEvent, path: string) => {
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
