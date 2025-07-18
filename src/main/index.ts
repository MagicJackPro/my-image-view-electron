import { app, shell, BrowserWindow, ipcMain, nativeTheme, Notification, protocol } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { readFile } from "node:fs/promises";
import "./fc";

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 760,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    },
    title: "my-image-view-electron",
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "#181818",
            symbolColor: "#ffffff",
            height: 40
          }
        }
      : {})
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: "local-resource",
    privileges: {
      secure: true, // 让 Electron 信任这个方式就像信任网站的 HTTPS 一样
      supportFetchAPI: true, // 允许我们像在网页上那样请求资源
      standard: true, // 让这种方式的网址看起来像普通的网址
      bypassCSP: true, // 允许我们绕过一些安全限制
      stream: true // 允许我们以流的形式读取文件，这对于大文件很有用
    }
  }
]);

ipcMain.handle("dark-mode:toggle", () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = "light";
  } else {
    nativeTheme.themeSource = "dark";
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle("dark-mode:system", () => {
  nativeTheme.themeSource = "system";
});

ipcMain.handle("notification:test", () => {
  new Notification({ title: "test title", body: "test body" }).show();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("com.electron");

  function convertPath(originalPath) {
    const match = originalPath.match(/^([a-zA-Z])\/(.*)$/);

    if (match) {
      // 为 Windows 系统转换路径格式
      return `${match[1]}:/${match[2]}`;
    } else {
      return originalPath; // 其他系统直接使用原始路径
    }
  }

  // 告诉 Electron 如何响应你的特殊方式的请求
  protocol.handle("local-resource", async (request) => {
    const decodedUrl = decodeURIComponent(
      request.url.replace(new RegExp(`^local-resource://`, "i"), "")
    );

    const fullPath = process.platform === "win32" ? convertPath(decodedUrl) : decodedUrl;
    const data = await readFile(fullPath); // 异步读取文件内容
    return new Response(data); // 将文件内容作为响应返回
  });

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
