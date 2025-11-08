import { useState } from "react";
import Radio from "./Radio";
import RadioButton from "./RadioButton";
import style from "./RadioGroup.module.css";

import type { JSX } from "react";
import type { RadioGroupFace, CheckboxOptionType } from "./index";

export default function RadioGroup(props: RadioGroupFace): JSX.Element {
  const { optionType = "default", options, block, onChange, defaultValue } = props;
  const [value, setValue] = useState<string | null>(defaultValue || null);
  const finallyValue = props?.value || value;

  function handlerChange(element: CheckboxOptionType) {
    setValue(element.value);
    if (onChange) {
      onChange(element);
    }
  }

  const isRadioButton = optionType === "button";
  function renderRadios(): JSX.Element[] {
    const ChoiseRadio = isRadioButton ? RadioButton : Radio;
    return options.map((element) => {
      const checked = finallyValue === element.value;
      const disabled = props.disabled || element.disabled;
      function elementChange() {
        handlerChange(element);
      }
      return (
        <ChoiseRadio
          key={element.value}
          label={element.label}
          value={element.value}
          checked={checked}
          disabled={disabled}
          onChange={elementChange}
        />
      );
    });
  }
  const className = [
    style["radio-group"],
    isRadioButton && style["radio-group-button"],
    block && style["radio-group-block"]
  ]
    .filter((x) => x)
    .join(" ");
  return <div className={className}>{renderRadios()}</div>;
}
