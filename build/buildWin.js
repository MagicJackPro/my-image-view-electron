const { spawn, execFile } = require("child_process");
const process = require("node:process");
const Path = require("node:path");
const { existsSync } = require("node:fs");
const dayjs = require("dayjs");
const iconv = require("iconv-lite");

// const SingleLineLog = require("./singleLineLog.js").stdout;
const build = spawn(
  "npm run build && electron-builder --win --config config/electron-builder.json",
  { shell: true }
);

build.stdout.on("data", (data) => {
  if (typeof data === "string") {
    const buf = Buffer.from(data);

    console.log(iconv.decode(buf, "gbk"));
  } else if (Buffer.isBuffer(data)) {
    console.log(iconv.decode(data, "gbk"));
  } else {
    console.log(data);
  }
});

build.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

build.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
  if (code === 0) {
    return compressedFile();
  }
});
function compressedFile() {
  console.log("准备压缩");
  const targetPath = Path.join(process.cwd(), "/dist/win-unpacked");
  const checkTarget = existsSync(targetPath);
  if (!checkTarget) {
    console.log("Error: win-unpacked not exist!");
    console.log("错误: windows 免安装文件路径不存在！");
    return;
  }
  const outputPath = Path.join(process.cwd(), "/dist");
  const zipName = `MIVE${dayjs().format("YYYY年MM月DD日HH时mm分")}`;
  const args = ["a", Path.join(outputPath, zipName), `${targetPath}/*`, "-bsp1"];
  // const args = ["a", Path.join(outputPath ,zipName), `${targetPath}/*`];
  // TODO需要7-zip路径从硬编码改为ENV变量
  const softPath = "D:/Program Files/7-Zip/7z.exe";
  console.log("执行压缩");

  const compress = execFile(softPath, args);
  compress.stdout.on("data", (data) => {
    if (typeof data === "string") {
      const buf = Buffer.from(data);
      const str = iconv.decode(buf, "gbk");
      console.log(str);
    } else {
      console.log(iconv.decode(Buffer.concat(data), "gbk"));
    }
  });

  compress.stderr.on("data", (data) => {
    console.error(`stderr:`);
    if (typeof data === "string") {
      const buf = Buffer.from(data);

      console.log(iconv.decode(buf, "gbk"));
    } else {
      console.log(iconv.decode(Buffer.concat(data), "gbk"));
    }
    process.exit(1);
  });

  compress.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
