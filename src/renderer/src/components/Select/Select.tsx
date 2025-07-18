import style from "./Select.module.css";
import { useState, useEffect } from "react";

import { Arrow } from "@renderer/assets/icon/icon";

type PlacementType = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface OptionFace {
  label: string;
  value: string|number;
}

interface SelectFace<T> {
  options: (T & OptionFace)[];
  defaultValue?: string | number;
  onChange?: (option:T) => void;
  placement?: PlacementType;
  value?: string | number;
}
export default function Select<T = OptionFace>(params: SelectFace<T>) {
  const { defaultValue, value, options, placement = "bottomLeft", onChange } = params;

  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState<OptionFace| undefined>();

  useEffect(() => {
    const tmpVal = value ? value : defaultValue;
    const found = options.find((option) => option.value === tmpVal);
    if (found) {
      setInternalValue(found);
    } else {
      setInternalValue(undefined);
    }
  }, [value, defaultValue]);

  function renderOptions() {
    const baseClassName = style["select-option"];
    return options.map((option) => {
      const className = [
        option.value === internalValue?.value ? style["select-option-active"] : "",
        baseClassName
      ].join(" ");
      function optionClick() {
        if (!value) {
          setInternalValue(option);
        }
        closeOptions();
        if (onChange) onChange(option);
      }
      return (
        <div key={option.value} className={className} onClick={optionClick}>
          <span>{option.label}</span>
        </div>
      );
    });
  }

  function showOptions() {
    setVisible(true);
  }

  function closeOptions() {
    setVisible(false);
  }

  let optionsPlacement = "";
  switch (placement) {
    case "bottomRight":
      optionsPlacement = style["bottom-right"];
      break;
    case "bottomLeft":
      optionsPlacement = style["bottom-left"];
      break;
    case "topRight":
      optionsPlacement = style["top-right"];
      break;
    case "topLeft":
      optionsPlacement = style["top-left"];
      break;
    default:
      optionsPlacement = style["bottom-right"];
      break;
  }
  return (
    <div className={style["select"]}>
      <div className={style["select-selector"]} onClick={showOptions}>
        <span className={style["seleclt-selector-label"]}>
          <span>{internalValue?.label}</span>
        </span>
        <span className={style["select-selector-icon"]}>
          <Arrow />
        </span>
      </div>
      {visible && (
        <div className={[style["select-options"], optionsPlacement].join(" ")}>
          {renderOptions()}
        </div>
      )}
    </div>
  );
}
