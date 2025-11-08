import { makeAutoObservable, toJS } from "mobx";
import { createContext } from "react";

import { DefaultConfig } from "@renderer/utility/store";

export interface CategoryButtonGroupRecord {
  /** 长宽比分类 */
  aspectRatioClassification: boolean;
  /** 计算放大倍率 */
  calculateTheMagnification: boolean;
  /** 目标目录 */
  folderName: string;
  key: string;
  /** 按钮名称 */
  label: string;
  /** 快捷键 */
  shortcutKey?: {
    /** 快捷键编码 */
    shortcutKeyCode: number;
    /** 快捷键别名 */
    shortcutKeyAlias: string;
  };
}

export interface ConfigFace {
  /** 是否启用自动保存 */
  enableAutoSave: boolean;
  /** 自动保存时间间隔 */
  delayAutoSave: number;
  /** 分类按钮组 */
  categoryButtonGroup: {
    buttons: CategoryButtonGroupRecord[];
  };
}

export class Store {
  constructor() {
    makeAutoObservable(this);
    // 尝试读取配置
    window.api.fs.readConfig().then((config) => {
      // console.log(`Store.ts config:`, config);
      // if (ValidatorConfig(config)) {
        // console.log("Store.ts alidatorConfig(config) return true");
        this._config = config;
      // }
    });
  }

  private _dirpath: string = "";
  public get dirpath(): string {
    return this._dirpath;
  }

  private _config: ConfigFace = DefaultConfig();

  public get config() {
    return toJS(this._config);
  }

  public setDirPath(newPath: string) {
    this._dirpath = newPath;
  }

  public setConfig(newConfig: ConfigFace) {
    this._config = newConfig;
  }
}

const store = new Store();

export default store;

export const StoreContext = createContext<Store>(store);
