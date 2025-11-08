import { useState } from "react";

import style from "./Switch.module.css";

interface SwitchFace {
  label?: string;
  value?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Switch(props: SwitchFace) {
  const { value, onChange, disabled } = props;
  const [checked, setCheck] = useState(value || false);

  function handleClick() {
    if (disabled) return;
    if (onChange) {
      if (typeof value === "boolean") {
        onChange(!value);
        return;
      } else {
        onChange(!checked);
      }
    }
    setCheck(!checked);
  }

  const checkedComputed = typeof props.value === "boolean" ? props.value : checked;

  const classname = [
    style["simple-switch"],
    checkedComputed && style["active"],
    disabled && style["disabled"]
  ]
    .filter((classString) => Boolean(classString))
    .join(" ");
  return (
    <div className={classname} onClick={disabled ? undefined : handleClick}>
      <span className={style["switch-handler"]}></span>
    </div>
  );
}
