import type { ReactNode } from "react";
import { createContext, useMemo, useReducer } from "react";
import { Success, Info, Error, Warning } from "@renderer/assets/icon/icon";
import style from "./Message.module.css";

type MessageType = "info" | "success" | "error" | "warning";

interface MessageListFace {
  id: string;
  message: string;
  onClose: Function | null;
  /** 显示时长 ms */
  duration: number;
  type: MessageType;
  showCloseButton: boolean;
}

type ConfigType = Partial<Omit<MessageListFace, "type">> & Pick<MessageListFace, "message" | "id">;

const MsgList: MessageListFace[] = [];

function reducer(
  state: MessageListFace[],
  action: { type: "add" | "remove"; payload: MessageListFace }
) {
  switch (action.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      const findIndex = state.findIndex((value) => value.id === action.payload.id);
      if (findIndex === -1) return state;
      return state.slice(0, findIndex).concat(state.slice(findIndex + 1));
    default:
      return state;
  }
}

export interface ContextFace {
  info: (config: ConfigType) => void;
  error: (config: ConfigType) => void;
  success: (config: ConfigType) => void;
  warning: (config: ConfigType) => void;
}

export const MessageContext = createContext<ContextFace>({
  info() {},
  warning() {},
  error() {},
  success() {}
});

export default function Message(params: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, MsgList);

  function closeMessage(delValue: MessageListFace) {
    dispatch({ type: "remove", payload: delValue });
  }

  const renderMessage = useMemo(() => {
    function renderIcon(type: MessageType) {
      switch (type) {
        case "success":
          return <Success />;
        case "error":
          return <Error />;
        case "warning":
          return <Warning />;
        default:
          return <Info />;
      }
    }
    
    return state.map((value) => {
      const showProgress = value.duration !== 0;
      return (
        <div key={value.id} className={style["message"]}>
          {showProgress && (
            <div className={style["progress"]}>
              <div
                className={style["progress-l"]}
                style={{backgroundColor:progressColor(value.type), animationDuration: `${value.duration}ms` }}
              />
            </div>
          )}
            {renderIcon(value.type)}
            <span>{value.message}</span>
            {value.showCloseButton && (
              <button onClick={() => closeMessage(value)}>X</button>
            )}
        </div>
      );
    });
  }, [state]);

  function addMessage(config: ConfigType, type: MessageType) {
    const newId = config.id;
    if (state.findIndex((value) => value.id === newId) !== -1) return;
    const defaultConfig = {
      id: "defaultID",
      message: "",
      onClose: null,
      duration: 3000,
      type: "info",
      showCloseButton: false
    };
    const finalConfig: MessageListFace = { ...defaultConfig, ...config, type };
    dispatch({ type: "add", payload: finalConfig });
    if (finalConfig.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: "remove", payload: finalConfig });
        if (config.onClose) config.onClose();
      }, finalConfig.duration);
    }
  }

  const fn = {
    info: (config: ConfigType) => addMessage(config, "info"),
    success: (config: ConfigType) => addMessage(config, "success"),
    error: (config: ConfigType) => addMessage(config, "error"),
    warning: (config: ConfigType) => addMessage(config, "warning")
  };
  return (
    <>
      <div className={style["base"]} id="message-base">
        {renderMessage}
      </div>
      <MessageContext.Provider value={fn}>{params.children}</MessageContext.Provider>
    </>
  );
}
function progressColor (type: MessageType){
  switch (type) {
    case "success":
      return "#52C41A"
    case "error": return "#ff4d4f";
    case "warning": return "#FAAD14";

    case "info":
    default:
      return "#1677ff";
  }
    }