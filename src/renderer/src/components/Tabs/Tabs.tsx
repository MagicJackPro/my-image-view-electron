import { useState, type ReactNode } from "react";
import { RadioGroup, type CheckboxOptionType } from "../Radio/index";
type TabItemType = {
  /** 禁用某一项 默认：false */
  disabled?: boolean;
  key: string;
  label: string;
  children: ReactNode;
};
interface TabsFace {
  /** 指定当前激活 tab 面板的 key */
  activeKey?: string;
  /** 初始化选中面板的 key，如果没有设置 activeKey 默认:第一个面板的 key */
  defaultActiveKey?: string;
  items: TabItemType[];
  /**	切换面板的回调 */
  onChange?: (activeKey: string) => void;
  /** tab 被点击的回调 */
  onTabClick?: (key: string, event: MouseEvent) => void;
}
export default function Tabs(props: TabsFace) {
  const { defaultActiveKey, items } = props;
  const [activeKeyState, setActiveKeyState] = useState(
    defaultActiveKey || (items.length && items[0].key) || ""
  );
  const activeKey = props?.activeKey || activeKeyState;
  const renderTabItme = items.find((item) => item.key === activeKey);

  function handlerChange(event:CheckboxOptionType) {
    if(!props?.activeKey){
      setActiveKeyState(event.value);
    }
    if(props?.onChange){
      props.onChange(event.value);
    }
  }


  function renderTab() {
    if (items.length === 0) return false;
    const options = items.map((value) => {
      return {
        disabled: value?.disabled || false,
        key: value.key,
        value: value.key,
        label: value.label
      };
    });
    return <RadioGroup optionType="button" options={options} value={activeKey} onChange={handlerChange} />;
  }

  return (
    <div>
      {renderTab()}
      {renderTabItme && renderTabItme.children}
    </div>
  );
}
