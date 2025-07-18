import style from "./ButtonPanle.module.css";
import Button from "@renderer/components/Button/Button";

export interface ButtonRecordFace {
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
  shortcutKey: string;
}
const buttonList: ButtonRecordFace[] = [
  {
    key: "delete",
    label: "不要了",
    folderName: "待删除",
    aspectRatioClassification: false,
    calculateTheMagnification: false,
    shortcutKey: "Num 0"
  },
  {
    key: "auto",
    label: "自动",
    folderName: "自动",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num 1"
  },
  {
    key: "PC",
    label: "PC",
    folderName: "PC",
    aspectRatioClassification: false,
    calculateTheMagnification: true,
    shortcutKey: "Num 2"
  },
  {
    key: "Moblie",
    label: "Moblie",
    folderName: "Moblie",
    aspectRatioClassification: false,
    calculateTheMagnification: true,
    shortcutKey: "Num 3"
  },
  {
    key: "1x1",
    label: "1:1",
    folderName: "1x1",
    aspectRatioClassification: false,
    calculateTheMagnification: true,
    shortcutKey: "Num 4"
  },
  {
    key: "nfsw",
    label: "色图",
    folderName: "色图",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num 5"
  },
  {
    key: "H",
    label: "H图",
    folderName: "H图",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num 6"
  },
  {
    key: "collect",
    label: "收集",
    folderName: "收集",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num 7"
  },
  {
    key: "3",
    label: "三次元",
    folderName: "3",
    aspectRatioClassification: false,
    calculateTheMagnification: false,
    shortcutKey: "Num 8"
  },
  {
    key: "LingMeng",
    label: "博丽灵梦",
    folderName: "博丽灵梦",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num 9"
  },
  {
    key: "avatar",
    label: "头像",
    folderName: "头像",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num +"
  },
  {
    key: "other",
    label: "其他",
    folderName: "其他",
    aspectRatioClassification: true,
    calculateTheMagnification: true,
    shortcutKey: "Num -"
  }
];

interface ButtonPanleFace {
  onClick: (buttonInfo: ButtonRecordFace) =>void;
}

export default function ButtonPanle(params: ButtonPanleFace) {
  const { onClick} = params;
  function renderButtons() {
    return buttonList.map((button) => {
      function handleClick(){
        onClick(button);
      }
      return (
        <Button key={button.key} type="dark" onClick={handleClick}>
            <span>{button.label}</span>
            <span>{button.shortcutKey}</span>
        </Button>
      );
    });
  }
  return (
    <div>
      <p>分类选项</p>
      <div className={style["button-div"]}>{renderButtons()}</div>
    </div>
  );
}
