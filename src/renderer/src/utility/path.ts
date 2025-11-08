/** 获取路径中的目录名 */
export function enhancedDirname(path: string): string {
  if (typeof path !== "string") {
    throw new TypeError("Path must be a string");
  }

  if (path.length === 0) return ".";

  // 检查是否为根目录
  if (path === "/" || path === "\\") return path;

  // 处理 Windows 驱动器根目录
  if (/^[a-zA-Z]:\\?$/.test(path)) {
    return path.endsWith("\\") ? path : path + "\\";
  }

  // 标准化路径：去除末尾分隔符（除非是根目录）
  let normalizedPath = path;
  const endsWithSeparator = /[\\/]$/.test(normalizedPath);

  if (endsWithSeparator && normalizedPath.length > 1) {
    normalizedPath = normalizedPath.replace(/[\\/]+$/, "");
  }

  // 查找最后一个分隔符
  const lastSlashIndex = Math.max(
    normalizedPath.lastIndexOf("/"),
    normalizedPath.lastIndexOf("\\")
  );

  // 没有找到分隔符
  if (lastSlashIndex === -1) return ".";

  // 根目录情况
  if (lastSlashIndex === 0) {
    return normalizedPath[0] === "/" ? "/" : "\\";
  }

  // Windows 驱动器路径
  if (lastSlashIndex === 2 && /^[a-zA-Z]:[\\/]/.test(normalizedPath)) {
    return normalizedPath.slice(0, 3);
  }

  return normalizedPath.slice(0, lastSlashIndex);
}
