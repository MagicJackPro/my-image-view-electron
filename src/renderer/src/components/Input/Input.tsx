import type { ChangeEvent } from "react";
interface InputFace {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function Input(props: InputFace) {
  const { disabled, value, onChange } = props;

  function handlerChange(event: ChangeEvent<HTMLInputElement>) {
    if (onChange) {
      onChange(event.target.value);
    }
  }

  return <input type="text" value={value} onChange={handlerChange} disabled={disabled} />;
}
