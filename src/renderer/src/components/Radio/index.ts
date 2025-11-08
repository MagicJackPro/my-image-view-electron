import Radio from "./Radio";
import RadioButton from "./RadioButton";
import RadioGroup from "./RadioGroup";
import type { CSSProperties } from "react";

export interface RadioFace {
  /** 描述 */
  label?: string;
  /** 指定当前是否选中 默认值:false*/
  checked?: boolean;
  /** 禁用 默认值:false*/
  disabled?: boolean;
  /** 初始是否选中 默认值:false*/
  defaultChecked?: boolean;
  /** 根据 value 进行比较，判断是否选中	 */
  value: string;
  onChange: (value: string) => void;
}

export interface CheckboxOptionType {
  /** 用于作为 Radio 选项展示的文本 */
  label: string;
  /** 关联 Radio 选项的值*/
  value: string;
  /** 应用到 Radio 选项的 style*/
  style?: CSSProperties;
  /**Radio 选项的类名*/
  className?: string;
  /** 指定 Radio 选项是否要禁用 false*/
  disabled?: boolean;
  /**添加 Title 属性值*/
  title?: string;
  /** 当 Radio Group 的值发送改变时触发*/
  onChange?: (e: Event) => void;
  required?: /**指定 Radio 选项是否必填	false*/ boolean;
}

export interface RadioGroupFace {
  /** 默认选中的值 */
  defaultValue?: string;
  /** 禁选所有子单选器 默认值:false*/
  disabled?: boolean;
  /** 以配置形式设置子元素 */
  options: Array<CheckboxOptionType>;
  /** 用于设置 Radio options 类型 默认值:default*/
  optionType?: "default" | "button";
  /** 大小，只对按钮样式生效 默认值:middle*/
  size?: "large" | "middle" | "small";
  /** 用于设置当前选中的值 */
  value?: string;
  /** 将 RadioGroup 宽度调整为其父宽度的选项 默认值:false*/
  block?: boolean;
  /** 选项变化时的回调函数 */
  onChange?: (e: CheckboxOptionType) => void;
}

export { RadioButton, RadioGroup };
export default Radio;
