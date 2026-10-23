import { ipcMain } from "electron";
import { join } from "node:path";
import Database from "better-sqlite3";
import Logger from "./logger";

ipcMain.handle("db:create", (_IpcMainInvokeEvent, folderPath: string) => {
  const db = new Database(join(folderPath, "autoSave.db"), {});
  const create = db.prepare(`
      CREATE TABLE IF NOT EXISTS filter_list
        (
          id INTEGER,
          name varchar(255) NOT NULL,
          processingMethod varchar(255),
          outputDirName varchar(255),
          IsClassified INTEGER
        );`);
  const task = db.transaction(() => {
    create.run();
  });

  try {
    task();
  } catch (error) {}
  if (!db.inTransaction) {
    db.close();
  }
});

ipcMain.handle(
  "db:insertInto",
  async (_IpcMainInvokeEvent, folderPath: string, array: NSqlite.Record[]) => {
    let isROLLBACK = false;
    function checkRollBack(message: unknown) {
      if (message === "ROLLBACK") {
        isROLLBACK = true;
      }
    }
    const db = new Database(join(folderPath, "autoSave.db"), {
      fileMustExist: true,
      verbose: checkRollBack
    });
    db.pragma("journal_mode = WAL");
    const insert = db.prepare(`
      INSERT INTO filter_list (id, name, processingMethod, outputDirName, IsClassified)
      VALUES (@id, @name, @processingMethod, @outputDirName, @IsClassified);`);

    const task = db.transaction((array: NSqlite.Record[]) => {
      db.prepare("DELETE FROM filter_list;").run();
      for (const record of array) {
        insert.run({
          ...record,
          IsClassified: record.IsClassified? 1:0,
          outputDirName: record.outputDirName.join("/")
        });
      }
    });

    try {
      task(array);

      if (!db.inTransaction) {
        db.close();
      }
      if (isROLLBACK) {
        
        return false;
      }
      return true;
    } catch (error) {
      if (!db.inTransaction) {
        db.close();
      }
      Logger.error({message:{"zh-cn":"临时保存“db:insertInto”插入数据出错","en-us":"\"db:insertInto\" is fail"},error})
      return false;
    }
  }
);

ipcMain.handle("db:selectAll", (_IpcMainInvokeEvent, folderPath: string) => {
  const db = new Database(join(folderPath, "autoSave.db"));
  db.pragma("journal_mode = WAL");
  const select = db.prepare("SELECT * FROM filter_list;");

  try {
    const result = select.all();
    db.close();
    return result;
  } catch (error) {}
  if (!db.inTransaction) {
    db.close();
  }
  return [];
});
