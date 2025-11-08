import type { ConfigFace } from "@renderer/store/store";
import Validator, { type ValidationSchema } from "fastest-validator";

export function DefaultConfig(): ConfigFace {
  return {
    enableAutoSave: false,
    delayAutoSave: 1,
    categoryButtonGroup: {
      buttons: [
        {
          key: "delete",
          label: "不要了",
          folderName: "待删除",
          aspectRatioClassification: false,
          calculateTheMagnification: false,
          shortcutKey: {
            shortcutKeyCode: 96,
            shortcutKeyAlias: "Num 0"
          }
        },
        {
          key: "auto",
          label: "自动",
          folderName: "自动",
          aspectRatioClassification: true,
          calculateTheMagnification: true,
          shortcutKey: {
            shortcutKeyCode: 97,
            shortcutKeyAlias: "Num 1"
          }
        },
        {
          key: "other",
          label: "其他",
          folderName: "其他",
          aspectRatioClassification: true,
          calculateTheMagnification: true,
          shortcutKey: {
            shortcutKeyCode: 98,
            shortcutKeyAlias: "Num 2"
          }
        }
      ]
    }
  };
}

export function ValidatorConfig(unSafeValue: any): boolean {
  const v = new Validator();

  const schema: ValidationSchema = {
    enableAutoSave: "boolean",
    /** 自动保存时间间隔 */
    delayAutoSave: { type: "number", min: 1, max: 10, integer: true },
    categoryButtonGroup: {
      type: "object",
      props: {
        bottons: {
          type: "array",
          max: 50,
          items: {
            type: "object",
            props: {
              aspectRatioClassification: "boolean",
              calculateTheMagnification: "boolean",
              folderName: "string",
              key: "string",
              label: "string",
              shortcutKey: {
                type: "object",
                props: {
                  shortcutKeyCode: "number",
                  shortcutKeyAlias: "string"
                },
                optional: true
              }
            }
          }
        }
      }
    }
  };

  const check = v.compile(schema);

  if (check(unSafeValue) === true) {
    return true;
  }
  return false;
}
