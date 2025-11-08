import { useImperativeHandle, useState, useRef, useEffect } from "react";

import style from "./AutoSave.module.css";
import type { Record } from "./ModalTable";
import { useMessage } from "@renderer/components/Message/Message";
import { getDateFullString } from "@renderer/utility/date";
import dayjs from "dayjs";

interface FileFace {
  id: number;
  /** 文件名 */
  name: string;
}

enum State {
  AutoSave,
  AutoSaving,
  ManualSaving,
  DisableAutoSave
}

export interface RefFace {
  /** 手动保存 */
  manualSave(listData: Record[], files: FileFace[]): Promise<void>;
  /** 自动保存 */
  autoSave(listData: Record[], files: FileFace[]): void;
  dataRequiringUpdating(): void;
}

interface ParametersFace {
  dirpath: string;
  haveSaveData: boolean;
  ref: React.Ref<RefFace>;
  enableAutoSave: boolean;
  delayAutoSave: number;
  onAutoSaving(): void;
  onAutoSaveCompleted(): void;
}

function AutoSaveComponemt(params: ParametersFace): React.JSX.Element {
  const { ref, dirpath, enableAutoSave, delayAutoSave, onAutoSaving, onAutoSaveCompleted } = params;
  const MessageAPI = useMessage();

  function initState() {
    if (enableAutoSave) {
      return State.AutoSave;
    } else {
      return State.DisableAutoSave;
    }
  }

  const [time, setTime] = useState("");
  const [needsUpdaing, setNeedsUpdaing] = useState(false);
  const [state, setState] = useState(initState);

  const autoSaveConfig = useRef<{
    // enable: false;
    timer: undefined | number;
    // delay: number;
    creatTime: undefined | string;
    endTime: undefined | string;
  }>({
    // enable: false,
    timer: undefined,
    // delay: 0,
    creatTime: undefined,
    endTime: undefined
  });

  useEffect(() => {
    return () => {
      if (autoSaveConfig.current.timer) {
        window.clearTimeout(autoSaveConfig.current.timer);
        autoSaveConfig.current.timer = undefined;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    /** 手动保存 */
    manualSave: async (listData, files) => {
      const config: Electron.MessageBoxOptions = {
        message: "是否保存临时进度",
        buttons: ["确认", "取消"],
        defaultId: 1,
        title: "二次确认：保存临时进度",
        detail: "此操作会创建文件在选择的文件目录下"
      };
      setState(State.ManualSaving);
      const MessageBoxReturnValue = await window.api.dialog.SecondaryConfirmation(config);
      if (MessageBoxReturnValue.response !== 0) {
        return;
      }
      try {
        // 清除自动保存
        if (autoSaveConfig.current.timer) {
          window.clearTimeout(autoSaveConfig.current.timer);
          autoSaveConfig.current = { timer: undefined, creatTime: undefined, endTime: undefined };
        }
        await saveData(listData, files, dirpath);
        setTime(getDateFullString());
        setNeedsUpdaing(false);
        MessageAPI.success({
          message: "手动保存成功",
          id: "manualSave"
        });
      } catch (error) {
        MessageAPI.error({
          message: "手动保存失败",
          id: "manualSave"
        });
      }

      setState(initState);
    },
    autoSave: (listData, files) => {
      // 没有启用autoSave直接空返回结束
      if (!enableAutoSave) return;

      // 检查creatTime是否存在

      // 检查定时器是否存在
      // 存在定时器则计算剩余剩余时间
      // 创建新定时器

      if (autoSaveConfig.current.timer) {
        console.log("清楚定时器 2");
        window.clearTimeout(autoSaveConfig.current.timer);
        autoSaveConfig.current.timer = undefined;
      }
      let timeout = 60000;
      if (autoSaveConfig.current.endTime) {
        timeout = dayjs(autoSaveConfig.current.endTime).diff(dayjs());
      } else {
        const now = dayjs();
        autoSaveConfig.current.creatTime = now.toISOString();
        timeout = delayAutoSave * 60000;
        autoSaveConfig.current.endTime = now.add(timeout, "milliseconds").toISOString();
      }

      autoSaveConfig.current.timer = window.setTimeout(() => {
        onAutoSaving();
        setState(State.AutoSaving);
        saveData(listData, files, dirpath)
          .then(() => {
            setTime(getDateFullString());
            setNeedsUpdaing(false);
            MessageAPI.success({
              message: "自动保存成功",
              id: "autoSave"
            });
          })
          .catch(() => {
            MessageAPI.error({
              message: "自动保存失败",
              id: "autoSave"
            });
          })
          .finally(() => {
            // 结束后重置定时器配置
            autoSaveConfig.current.timer = undefined;
            autoSaveConfig.current.creatTime = undefined;
            autoSaveConfig.current.endTime = undefined;

            setState(initState);
            onAutoSaveCompleted();
          });
      }, timeout);
    },
    /** 需要更新的数据 */
    dataRequiringUpdating() {
      setNeedsUpdaing(true);
    }
  }));

  function stateLable() {
    switch (state) {
      case State.AutoSaving:
        return "自动保存中";
      case State.AutoSave:
        return "自动保存已启用";
      case State.ManualSaving:
        return "手动保存中";

      default:
        return "自动保存未启用";
    }
  }

  function timeText() {
    if (time) return time;
    return "尚未保存过";
  }

  return (
    <div className={style.AutoSaveComponemt}>
      {/* 状态 */}
      <div>
        <span>{stateLable()}</span>
      </div>
      {/* 时间 */}
      <div>
        <span>上次保存的时间：</span>
      </div>
      <div>
        <span>{timeText()}</span>
      </div>
      {/* 提示有未保存的数据 */}
      <div>
        <span>{needsUpdaing ? "有未保存的数据" : ""}</span>
      </div>
    </div>
  );
}

export default AutoSaveComponemt;

async function saveData(listData: Record[], files: FileFace[], dirpath: string) {
  const invoke = window.electron.ipcRenderer.invoke;
  if (listData.length === files.length) {
    await invoke("db:create", dirpath);
    await invoke("db:insertInto", dirpath, listData);
  } else {
    const datas: Record[] = files.map((file) => ({
      id: file.id,
      name: file.name,
      processingMethod: "",
      outputDirName: []
    }));
    listData.forEach((listRecord) => {
      if (datas[listRecord.id].outputDirName.length === 0) {
        datas[listRecord.id] = listRecord;
      }
    });
    await invoke("db:create", dirpath);
    await invoke("db:insertInto", dirpath, datas);
  }
}
