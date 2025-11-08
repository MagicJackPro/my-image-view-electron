import { ipcMain } from "electron";
import { join } from "node:path";
import Database from "better-sqlite3";

ipcMain.handle("db:create", (_IpcMainInvokeEvent, folderPath: string) => {
  const db = new Database(join(folderPath, "autoSave.db"), {});
  const create = db.prepare(`
      CREATE TABLE IF NOT EXISTS filter_list
        (
          id INTEGER,
          name varchar(255) NOT NULL,
          processingMethod varchar(255),
          outputDirName varchar(255)
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

interface Record {
  id: number;
  /** 文件名 */
  name: string;
  /** 处理方式 */
  processingMethod: string;
  /** 输出目录名称 */
  outputDirName: string[];
}

ipcMain.handle(
  "db:insertInto",
  async (_IpcMainInvokeEvent, folderPath: string, array: Record[]) => {
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
    // VALUES (@name, @processingMethod, @outputDirName)
    const insert = db.prepare(`
      INSERT INTO filter_list (id, name, processingMethod, outputDirName)
      VALUES (@id, @name, @processingMethod, @outputDirName);`);

    const task = db.transaction((array: Record[]) => {
      db.prepare("DELETE FROM filter_list;").run();
      for (const record of array) {
        insert.run({
          ...record,
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
      return Promise.resolve();
    } catch (error) {
      if (!db.inTransaction) {
        db.close();
      }
      return Promise.reject();
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
