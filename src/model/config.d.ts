namespace NConfig {
  interface CategoryButtonGroupRecord {
    /** 长宽比分类 */
    aspectRatioClassification: boolean;
    /** 计算放大倍率 */
    calculateTheMagnification: boolean;
    /** 目标目录 */
    folderName: string;
    key: string;
    /** 按钮名称 */
    label: string;
    /** 是否分类 */
    IsClassified: boolean;
    /** 快捷键 */
    shortcutKey?: {
      /** 快捷键编码 */
      shortcutKeyCode: number;
      /** 快捷键别名 */
      shortcutKeyAlias: string;
    };
  }
  interface ConfigFace {
    /** 是否启用自动保存 */
    enableAutoSave: boolean;
    /** 自动保存时间间隔 */
    delayAutoSave: number;
    /** 分类按钮组 */
    categoryButtonGroup: {
      buttons: CategoryButtonGroupRecord[];
    };
  }
}
