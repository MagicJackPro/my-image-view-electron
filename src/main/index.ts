import { app, BrowserWindow } from "electron";
import { join, dirname } from "path";
import { optimizer, is } from "@electron-toolkit/utils";
import { accessSync, constants, mkdirSync } from "node:fs";
import icon from "../../resources/icon.png?asset";
import { updateMainWindow } from "./fc";
import "./db";
import Logger from "./logger";

Logger.info("process is started");

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js")
    },
    title: __APP_NAME__,
    icon,
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "#181818",
            symbolColor: "#ffffff",
            height: 39
          }
        }
      : {})
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
    updateMainWindow(mainWindow);
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// #region 防止多开
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  Logger.warn({ message: {"zh-cn": "重复启动, 程序退出！"} });
  app.quit();
}
// #endregion

//#region 设置userData
const appPath = app.getPath("exe");
const userDataPath = join(dirname(appPath), "userData");

try {
  accessSync(userDataPath, constants.F_OK);
  app.setPath("userData", userDataPath);
} catch (error) {
  try {
    mkdirSync(userDataPath);
    app.setPath("userData", userDataPath);
  } catch (error) {}
}
//#endregion

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
