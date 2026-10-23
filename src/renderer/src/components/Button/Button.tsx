import { useMemo, useRef } from "react";
import "./Button.css";
import type { ReactNode, Ref, MouseEvent } from "react";

/** 按钮防抖 */
interface DebouncedFace {
  /** 延迟时间，单位毫秒(ms) */
  time: number;
}

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
  debounced?: DebouncedFace;
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

  const Config = useMemo(() => {
    const defaultConfig = {
      debounced: {
        time: 0
      }
    };
    try {
      if (params.debounced) {
        defaultConfig.debounced.time = params.debounced.time;
      }
    } catch (error) {
      console.log("button config is wrong");
    }
    return defaultConfig;
  }, [params]);

  const debouncedCache = useRef(0);

  // const childrenIsString = typeof children === "string";
  const { type = "default" } = params;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (Config.debounced.time > 0) {
      const lastTime = debouncedCache.current;
      if (lastTime === 0) {
        debouncedCache.current = Date.now();
      } else {
        const vTime = Date.now() - lastTime;
        if (vTime > Config.debounced.time) {
          debouncedCache.current = Date.now();
        } else {
          return;
        }
      }
    }

    if (onClick) onClick(event);
  }

  const className = [
    "button-base",
    `button-${type}`,
    danger && "button-danger",
    block && "button-block",
    shape === "circle" && "button-circle"
  ]
    .filter((x) => Boolean(x))
    .join(" ");

  // onTouchEnd={handleClick}
  return (
    <button
      ref={ref}
      type={htmlType}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon}
      {children}
    </button>
  );
}
