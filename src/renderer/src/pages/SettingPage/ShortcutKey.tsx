import { useEffect, useRef, useState } from "react";
import { once } from "lodash";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";

interface AXA {
  /** 快捷键编码 */
  shortcutKeyCode: number;
  /** 快捷键别名 */
  shortcutKeyAlias: string;
}

interface ShortcutKeyFace {
  value?: AXA;
  onChange?: (value: AXA) => void;
  disabled?: boolean;
}

const BASE_CODE = [
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
  "NumpadEnter"
];

const BASE_DATA = {
  8: "Backspace",
  9: "Tab",

  13: "Enter",

  16: "Shift",
  17: "Control",
  18: "Alt",

  20: "CapsLock",

  27: "Escape",

  32: "Space",

  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",

  48: "0",
  49: "1",
  50: "2",
  51: "3",
  52: "4",
  53: "5",
  54: "6",
  55: "7",
  56: "8",
  57: "9",
  65: "A",
  66: "B",
  67: "C",
  68: "D",
  69: "E",
  70: "F",
  71: "G",
  72: "H",
  73: "I",
  74: "J",
  75: "K",
  76: "L",
  77: "M",
  78: "N",
  79: "O",
  80: "P",
  81: "Q",
  82: "R",
  83: "S",
  84: "T",
  85: "U",
  86: "V",
  87: "W",
  88: "X",
  89: "Y",
  90: "Z",
  91: "MetaLeft",
  92: "MetaRight",
  93: "ContextMenu",

  96: "Numpad0",
  97: "Numpad1",
  98: "Numpad2",
  99: "Numpad3",
  100: "Numpad4",
  101: "Numpad5",
  102: "Numpad6",
  103: "Numpad7",
  104: "Numpad8",
  105: "Numpad9",

  106: "NumpadMultiply(*)",
  107: "NumpadAdd(+)",

  109: "NumpadSubtract(-)",
  110: "NumpadDecimal(.)",
  111: "NumpadDivide(/)",

  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",

  144: "NumLock",

  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",

  219: "[",
  220: "\\",
  221: "]",
  222: "'"
};

export default function ShortcutKey(props: ShortcutKeyFace) {
  const {disabled} = props;
  const [visible, setVisible] = useState(false);
  const [stateValue, setStateValue] = useState<AXA | null>(props?.value || null);

  const value = props?.value || stateValue;
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) return;
    function sKey(event: KeyboardEvent) {
      if (event.keyCode === 27) {
        setStateValue(null);
      } else if (BASE_CODE.includes(event.code)) {
        setStateValue({
          shortcutKeyCode: event.keyCode,
          shortcutKeyAlias: event.code
        });
      } else if (BASE_DATA[event.keyCode]) {
        setStateValue({
          shortcutKeyCode: event.keyCode,
          shortcutKeyAlias: BASE_DATA[event.keyCode]
        });
      } else {
        setStateValue(null);
      }

      closeModal();
    }
    const f = once(sKey);

    window.addEventListener("keyup", f);
    return () => {
      window.removeEventListener("keyup", f);
    };
  }, [visible]);

  function openModal() {
    if(disabled) return;
    setVisible(true);
    /** 解除对按钮的聚焦，防止 SPACE 按键意外触发 */
    if (btnRef.current) {
      btnRef.current.blur();
    }
  }

  function closeModal() {
    setVisible(false);
  }

  return (
    <div>
      <div>
        <span>{value?.shortcutKeyAlias || "没有快捷键"}</span>
      </div>
      <Button ref={btnRef} onClick={openModal}>
        设置
      </Button>
      <Modal visible={visible} onCancel={closeModal}>
        <div>
          <div>
            <span>等待按下按键，或者按下 ESC 设置为空。</span>
          </div>
          <div>
            <Button onClick={closeModal}>取消</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
