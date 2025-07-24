import { createRef, useState, type ReactNode } from "react";
import Button from "../Button/Button";
import { CollapseOpen, CollapseClose } from "@renderer/assets/icon/icon";
import style from "./Collapse.module.css";

interface PropsFace {
  contentClassName?: string;
  children?: ReactNode;
}

function joinClassName(arrray: string[]) {
  return arrray.join(" ");
}

export default function Collapse(props: PropsFace) {
  const { contentClassName = "", children } = props;

  const [visible, setVisible] = useState(false)
  
  const contentRef = createRef<HTMLDivElement>();

  const Icon = visible ? CollapseClose : CollapseOpen;

  function changeVisible() {
    setVisible(!visible);
    if (!contentRef.current) return;
    if (!visible) {
      // 关闭中
      contentRef.current.style.height = "auto";
    } else {
      contentRef.current.style.height = "0";
    }
  }

  const className: string[] = [style["collapse-content"], contentClassName];
  return (
    <div>
      <Button type="dark" block icon={<Icon />} onClick={changeVisible} />
      <div ref={contentRef} className={joinClassName(className)}>
        {children}
      </div>
    </div>
  );
}
