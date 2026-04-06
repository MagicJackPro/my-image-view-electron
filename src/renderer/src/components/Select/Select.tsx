import style from "./Select.module.css";
import { useState, useEffect, createRef } from "react";

import { Arrow } from "@renderer/assets/icon/icon";
import type { MouseEvent } from "react";

type PlacementType = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

export interface OptionFace {
  label: string;
  value: string | number;
}

interface SelectFace<T> {
  options: (T & OptionFace)[];
  defaultValue?: OptionFace["value"] | OptionFace;
  onChange?: (option: T) => void;
  placement?: PlacementType;
  value?: OptionFace["value"] | OptionFace;
}
export default function Select<T = OptionFace>(params: SelectFace<T>) {
  const { defaultValue, value, options, placement = "bottomLeft", onChange } = params;

  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState<OptionFace | undefined>();

  const boxRef = createRef<HTMLDivElement>();

  useEffect(() => {
    const tmpVal = value ? value : defaultValue;
    if (!tmpVal) {
      return;
    }

    if(typeof tmpVal === "object"){
      const newValue = {
        label: tmpVal.label,
        value:tmpVal.value
      }
      return setInternalValue(newValue);
    }

    const found = options.find((option) => option.value === tmpVal);
    if (found) {
      setInternalValue(found);
    } else {
      const newValue: OptionFace = { label: tmpVal?.toString(), value: tmpVal };
      setInternalValue(newValue);
    }
  }, [value, defaultValue]);

  useEffect(() => {
    if (visible && boxRef.current) {
      const index = options.findIndex((option) => option.value === internalValue?.value);
      if (index === -1) return;
      const clientHeight = boxRef.current.clientHeight;
      const scrollTop = index * 34;
      const PADDING_TOP = 4;
      if (scrollTop + PADDING_TOP >= clientHeight) {
        boxRef.current.scrollTop = scrollTop;
      }
    }
  }, [visible]);

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

  function changeOptions(event: MouseEvent<HTMLDivElement>) {
    event.target;
    setVisible((v) => !v);
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

  function handlerBlur() {
    closeOptions();
    return;
  }

  return (
    <div className={style["select"]} tabIndex={-1} onBlur={handlerBlur}>
      <div className={style["select-selector"]} onClick={changeOptions}>
        <span className={style["seleclt-selector-label"]}>
          <span>{internalValue?.label}</span>
        </span>
        <div className={style["select-selector-icon"]}>
          <Arrow className={style["select-selector-svg"]} />
        </div>
      </div>
      {visible && (
        <div ref={boxRef} className={[style["select-options"], optionsPlacement].join(" ")}>
          {renderOptions()}
        </div>
      )}
    </div>
  );
}
