import type { JSX } from "react";
import type { RadioFace } from "./index";

export default function Radio(props: RadioFace): JSX.Element {
  const { checked, defaultChecked, disabled, value} = props;
  return (
    <input
      type="radio"
      defaultChecked={defaultChecked}
      value={value}
      checked={checked}
      disabled={disabled}
    />
  );
}
