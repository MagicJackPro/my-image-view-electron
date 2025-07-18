import style from "./button.module.css";
import type { ReactNode } from "react";

interface buttonFace {
  block?: boolean;
  children?: ReactNode;
  danger?: boolean;
  ghost?: boolean;
  htmlType?: "button" | "reset" | "submit";
  icon?: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  shape?: "circle";
  type?: "default" | "primary" | "dashed" | "text" | "link" | "dark";
}
export default function Button(params: buttonFace) {
  const { children, onClick, htmlType = "button", icon, block = false, shape } = params;

  // const childrenIsString = typeof children === "string";
  const { type = "default" } = params;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) onClick(event);
  }

  const className = [
    style["base"],
    style[type],
    block ? style["block"] : "",
    shape === "circle" ? style["button-circle"] : ""
  ].join(" ");

  // onTouchEnd={handleClick}
  return (
    <button type={htmlType} className={className} onClick={handleClick}>
      {icon}
      {/* {childrenIsString ? children : childrenIsString} */}
      {children}
    </button>
  );
}
