import { useEffect, useRef, createRef, useState } from "react";
import style from "./ButtonPanle.module.css";
import Button from "@renderer/components/Button/Button";
import { useStore } from "@renderer/hook/useStores";
import Pagination, { type PaginationFace } from "@renderer/components/Pagination/Pagination";

import type { CategoryButtonGroupRecord } from "@renderer/store/store";
// import type { CheckboxOptionType } from "@renderer/components/Radio";

interface ButtonPanleFace {
  onClick: (buttonInfo: CategoryButtonGroupRecord) => void;
}

export default function ButtonPanle(params: ButtonPanleFace) {
  const { onClick } = params;

  const throttleID = useRef<number>(undefined);
  const buttonDivRef = createRef<HTMLDivElement>();
  const Store = useStore();
  const buttonList = Store.config.categoryButtonGroup.buttons;
  const [paginationConfig, setPaginationConfig] = useState({
    pageSize: 0,
    current: 1,
    total: buttonList.length
  });

  useEffect(() => {
    function keyup(event: KeyboardEvent) {
      const keyCode = event.keyCode;

      const found = buttonList.find((btn) => btn.shortcutKey?.shortcutKeyCode === keyCode);
      if (found && !throttleID.current) {
        throttleID.current = window.setTimeout(() => {
          try {
            throttleID.current = undefined;
          } catch {}
        }, 500);
        onClick(found);
      }
    }
    document.body.addEventListener("keyup", keyup);
    return () => {
      document.body.removeEventListener("keyup", keyup);
    };
  }, [buttonList]);
  function renderButtons() {
    const startIndex = (paginationConfig.current - 1) * paginationConfig.pageSize;
    const endIndex = startIndex + paginationConfig.pageSize;
    const array = buttonList.slice(startIndex, endIndex);

    return array.map((button) => {
      function handleClick() {
        if (throttleID.current) return;
        throttleID.current = window.setTimeout(() => {
          try {
            throttleID.current = undefined;
          } catch {}
        }, 500);
        onClick(button);
      }
      return (
        <Button key={button.key} onClick={handleClick}>
          <span>{button.label}</span>
          <span>{button.shortcutKey?.shortcutKeyAlias}</span>
        </Button>
      );
    });
  }

  useEffect(() => {
    if (buttonDivRef.current) {
      const clientHeight = buttonDivRef.current.clientHeight;
      const pageSize = Math.floor((clientHeight + 20) / 70) * 2;
      setPaginationConfig({
        current: 1,
        pageSize,
        total: buttonList.length
      });
    }
  }, [buttonDivRef.current]);

  function PaginationChange(paginationData: PaginationFace) {
    const newPaginationConfig = Object.assign({}, paginationConfig, {
      current: paginationData.pageNumber
    });
    setPaginationConfig(newPaginationConfig);
  }

  return (
    <div className={style["base"]}>
      <div ref={buttonDivRef} className={style["button-div"]}>
        {renderButtons()}
      </div>
      <Pagination
        total={paginationConfig.total}
        pageSize={paginationConfig.pageSize}
        current={paginationConfig.current}
        onChange={PaginationChange}
      />
    </div>
  );
}
