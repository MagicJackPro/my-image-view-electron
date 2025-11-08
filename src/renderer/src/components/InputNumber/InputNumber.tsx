import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import lodash from "lodash";

interface InputNumberFace {
  value?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  name?: string;
  defaultValue?: number;
  max?: number;
  len?: number;
  min?: number;
  /** 小数数值精度 max:4,min:0*/
  precision?: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}
export default function InputNumber(parameters: InputNumberFace) {
  const { inputRef, name, onChange, precision } = parameters;

  const [value, setValue] = useState(parameters?.defaultValue || "");
  const precisionRef = useRef(4);
  const RegExpNumberRef = useRef(/^\d{1,10}(\.\d{1,4})?/);

  useEffect(() => {
    // console.log("precision:", precision);
    if (
      typeof precision === "number" &&
      Number.isInteger(precision) &&
      (precision >= 0 || precision < 5)
    ) {
      precisionRef.current = precision;

      if (precision > 0) {
        RegExpNumberRef.current = new RegExp(`^\\d{1,10}(\\.\\d{1,${precision}})?`);
      } else {
        RegExpNumberRef.current = new RegExp(`^\\d{1,10}`);
      }
      // console.log(`RegExpNumberRef.current:`, RegExpNumberRef.current);
    } else {
      precisionRef.current = 4;
    }
  }, [precision]);

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const temporaryValue = event.target.value;
    const a = RegExpNumberRef.current.exec(temporaryValue);
    if (Array.isArray(a) && a.length) {
      // event.target.value = a[0];
      const execValue = a[0];
      // 检查MAX
      const max = Number(parameters?.max);
      const min = Number(parameters?.min);
      const valueNumber = Number(execValue);
      let modifyValue: string | undefined = undefined;
      if (!Number.isNaN(max) && lodash.lt(max, valueNumber)) {
        modifyValue = max.toString();
      } else if (!Number.isNaN(min) && lodash.lt(valueNumber, min)) {
        modifyValue = min.toString();
      } else if (execValue !== temporaryValue) {
        modifyValue = execValue;
      }
      if (modifyValue) {
        if (onChange) {
          onChange(Object.assign({}, event, { target: { value: modifyValue } }));
        } else {
          setValue(modifyValue);
        }
      }
      // if (parameters?.onBlur) {
      //   parameters.onBlur(event);
      // }
    } else {
      setValue("");
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange(event);
    } else {
      setValue(value);
    }
  }

  return (
    <input
      ref={inputRef}
      name={name}
      value={parameters?.value || value}
      // defaultValue={parameters?.defaultValue}
      type="text"
      onChange={handleChange}
      // onFocus={}
      onBlur={handleBlur}
    />
  );
}
