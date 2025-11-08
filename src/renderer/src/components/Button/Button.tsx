import "./button.css";
import type { ReactNode, Ref, MouseEvent } from "react";

interface buttonFace {
  block?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  ghost?: boolean;
  htmlType?: "button" | "reset" | "submit";
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  shape?: "circle";
  // type?: "default" | "primary" | "dashed" | "text" | "link";
  type?: "default" | "primary";
  ref?: Ref<HTMLButtonElement>;
}
export default function Button(params: buttonFace) {
  const {
    children,
    onClick,
    htmlType = "button",
    icon,
    block = false,
    shape,
    ref,
    danger,
    disabled
  } = params;

  // const childrenIsString = typeof children === "string";
  const { type = "default" } = params;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (onClick) onClick(event);
  }

  const className = [
    "button-base",
    `button-${type}`,
    danger && "button-danger",
    block && "button-block",
    shape === "circle" && "button-circle"
  ].filter(x => Boolean(x)).join(" ");

  // onTouchEnd={handleClick}
  return (
    <button ref={ref} type={htmlType} className={className} onClick={handleClick} disabled={disabled}>
      {icon}
      {children}
    </button>
  );
}
