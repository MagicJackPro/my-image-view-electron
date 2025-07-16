import style from "./button.module.css";
import type { ReactNode } from "react";

interface buttonFace {
  type?: "default" | "primary" | "dashed" | "text" | "link" | "dark";
  block?: boolean;
  children?: ReactNode;
  ghost?: boolean;
  danger?: boolean;
  htmlType?: "button" | "reset" | "submit";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export default function Button(params: buttonFace) {
  const { children, onClick, htmlType = "button", block = false } = params;

  // const childrenIsString = typeof children === "string";
  const { type = "default" } = params;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (onClick) onClick(event);
  }

  const className = [style["base"], style[type], block ? style["block"] : ""].join(" ");

  // onTouchEnd={handleClick}
  return (
    <button type={htmlType} className={className}  onClick={handleClick}>
      {children}
      {/* {childrenIsString ? children : childrenIsString} */}
    </button>
  );
}
