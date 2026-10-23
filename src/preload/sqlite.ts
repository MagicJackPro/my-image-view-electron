import { ipcRenderer } from "electron";

const invoke = ipcRenderer.invoke;

function selectAll(folderPath: string): Promise<NSqlite.RawRecord[]> {
  return invoke("db:selectAll", folderPath);
}

function create(folderPath: string): Promise<void> {
  return invoke("db:create", folderPath);
}

function insertInto(folderPath: string, array:NSqlite.insertIntoRecord[]): Promise<boolean> {
  return invoke("db:insertInto",folderPath, array)
}

export interface SqliteFace {
  create: typeof create;
  selectAll: typeof selectAll;
  insertInto: typeof insertInto;
}

const SqliteAPI: SqliteFace = {
  create,
  selectAll,
  insertInto
};

export default SqliteAPI;
