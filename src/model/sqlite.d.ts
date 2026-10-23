namespace NSqlite {
  interface RawRecord {
    id: number;
    /** 文件名 */
    name: string;
    /** 处理方式 */
    processingMethod: string;
    /** 输出目录名称 */
    outputDirName: string;
    /** 是否分类 */
    IsClassified: boolean;
  }

  interface Record extends RawRecord {
    outputDirName: string[];
  }

  interface insertIntoRecord {
    id: number;
    /** 文件名 */
    name: string;
    /** 处理方式 */
    processingMethod: string;
    /** 输出目录名称 */
    outputDirName: string[];
  }
}