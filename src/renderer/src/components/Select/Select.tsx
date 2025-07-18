import style from "./Select.module.css";
import { useState, useEffect } from "react";

import { Arrow } from "@renderer/assets/icon/icon";

type PlacementType = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface OptionFace {
  label: string;
  value: string | number;
}

interface SelectFace {
  options: OptionFace[];
  defaultValue?: string | number;
  onChange?: (option: OptionFace) => void;
  placement?: PlacementType;
}

export default function Select(params: SelectFace) {
  const { defaultValue, options, placement = "bottomLeft", onChange } = params;

  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState<OptionFace | undefined>();

  useEffect(() => {
    if (defaultValue) {
      const found = options.find((option) => option.value === defaultValue);
      if (found) {
        setValue(found);
      }
    }
  }, [defaultValue]);

  function renderOptions() {
    const baseClassName = style["select-option"];
    return options.map((option) => {
      const className = [
        option.value === value?.value ? style["select-option-active"] : "",
        baseClassName
      ].join(" ");
      function optionClick() {
        setValue(option);
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
          <span>{value?.label}</span>
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
