import type { ReactNode, MouseEvent } from "react";
import style from "./Modal.module.css";

interface ModalFace {
  children?: ReactNode;
  onCancel?: () => void;
  /** 对话框是否可见 */
  visible: boolean;
}
export default function Modal(params: ModalFace) {
  const { visible, children, onCancel } = params;
  function clickMask() {
    if (onCancel) onCancel();
  }

  function clickModal(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation()
  }

  return (
    visible && (
      <div className={style["mask"]} onClick={clickMask}>
        <div className={style["modal"]} onClick={clickModal}>
          {children}
        </div>
      </div>
    )
  );
}
