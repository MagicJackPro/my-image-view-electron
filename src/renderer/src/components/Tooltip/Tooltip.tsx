import Style from "./Tooltip.module.css";

import type { ReactNode } from "react";
import { useState } from "react";

interface IPrameters {
  title: ReactNode | (() => ReactNode);
  backgroundColor?: string;
  color?: string;
  children: ReactNode | (() => ReactNode);
}

export default function Tooltip(parameters: IPrameters) {
  const { title, children } = parameters;
  const [visible, setVisible] = useState(false);

  const childrenContainer = typeof children === "function" ? children() : children;
  function renderTitleContainer() {
    const styleC = visible ? { display: "block" } : {};
    if (typeof title === "string") {
      return (
        <div className={Style["tooltip-pop-up-window"]} style={styleC}>
          <div className={Style["tooltip-pop-up-arrow"]} />
          <div className={Style["tooltip-pop-up-window-content"]}>
            <span className={Style["tooltip-pop-up-window-span"]}>{title}</span>
          </div>
        </div>
      );
    } else if (typeof title === "function") {
      return (
        <div className={Style["tooltip-pop-up-window"]} style={styleC}>
          {title()}
        </div>
      );
    } else {
      return (
        <div className={Style["tooltip-pop-up-window"]} style={styleC}>
          {title}
        </div>
      );
    }
  }

  function handlerMouseOver() {
    if (!visible) {
      setVisible(true);
    }
  }

  function hanlderMouseLeave() {
    setVisible(false);
  }

  return (
    <div className={Style["tooltip-base"]}>
      <div onMouseOver={handlerMouseOver} onMouseLeave={hanlderMouseLeave}>
        {childrenContainer}
      </div>
      {renderTitleContainer()}
    </div>
  );
}
