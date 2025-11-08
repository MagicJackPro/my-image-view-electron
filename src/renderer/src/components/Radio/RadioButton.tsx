// import style from "./RadioButton.css";
import "./RadioButton.css";
import { ThemeContext } from "@renderer/components/ConfigProvider/ConfigProvider";
import { useContext, useMemo, type JSX, type CSSProperties } from "react";
import type { RadioFace } from "./index";

export default function RadioButton(props: RadioFace): JSX.Element {
  const { label, value, onChange, checked, disabled = false } = props;

  //#region Theme
  const Theme = useContext(ThemeContext);

  const ThemeRadioStyle = useMemo((): CSSProperties => {
    if (!Theme?.radio) {
      return {};
    }
    const ThemeRadio = Theme.radio;
    if (disabled) {
      return ThemeRadio.disabled || {};
    } else if (checked) {
      return ThemeRadio.checked || {};
    }
    console.log(`ThemeRadio.default?.backgroundColor:`, ThemeRadio.default?.backgroundColor);
    return ThemeRadio.default || {};
  }, [Theme, disabled, checked]);
  //#endregion

  const className = [
    "radio-button",
    checked && "radio-button-checked",
    disabled && "radio-button-disabled"
  ]
    .filter((v) => v)
    .join(" ");

  function handlerClick() {
    if (disabled) return;

    onChange(value);
  }

  return (
    // <div
    <button
      key={value}
      className={className}
      style={ThemeRadioStyle}
      onClick={disabled ? undefined : handlerClick}
    >
      <span>{label || value}</span>
      {/* </div> */}
    </button>
  );
}
