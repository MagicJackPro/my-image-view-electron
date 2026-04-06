import { useEffect, useRef, useState } from "react";
import style from "./FilterFiles.module.css";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";

import type { Record } from "./ModalTable";
interface FilterFilesFace {
  dirPath: string;
  onDone: (files: Record[]) => void;
  onlastPage: () => void;
}

const myFS = window.api.fs;
export default function FilterFiles(params: FilterFilesFace) {
  const { onlastPage } = params;
  const [error, setError] = useState({ isError: false, message: "" });
  const [progress, setProgress] = useState({
    count: 0,
    fail: 0,
    index: 0,
    percentage: 0,
    stepName: "",
    success: 0,
    isDone: false
  });
  const [visible, setVisible] = useState(false);
  const resultArrayRef = useRef<Record[]>([]);
  const readFileFailArrayRef = useRef<{ name: string; description: string }[]>([]);

  useEffect(() => {
    runFilter(params.dirPath);
  }, [params.dirPath]);

  async function runFilter(dirPath: string) {
    try {
      // 读取文件夹目录 失败报无法读取目录
      setProgress({
        count: 1,
        fail: 0,
        index: 1,
        percentage: 0,
        stepName: "读取文件夹",
        success: 0,
        isDone: false
      });
      let originList: string[] = [];
      try {
        originList = await myFS.readdir(dirPath);
      } catch (error: any) {
        setError({ isError: true, message: error?.message });
        return;
      }

      const found = originList.find((fileName) => fileName === "autoSave.db");
      if (found) {
        try {
        } catch (error) {}
        const response = await window.api.dialog.SecondaryConfirmation({
          message: "检测到自动保存进度文件，是否读取？",
          type: "info",
          buttons: ["读取", "取消"]
        });

        if (response.response === 0) {
          const arr = await window.electron.ipcRenderer.invoke("db:selectAll", dirPath);

          resultArrayRef.current = arr.map((record) => {
            const outputDirName = record.outputDirName ? record.outputDirName.split("/") : [];
            return { ...record, outputDirName };
          });
          setProgress({
            count: 1,
            fail: 0,
            index: 1,
            percentage: 100,
            stepName: "结束",
            success: 1,
            isDone: true
          });
          return;
        }
      }

      setProgress({
        count: originList.length,
        fail: 0,
        index: 1,
        percentage: 50,
        stepName: "检查文件类型",
        success: 0,
        isDone: false
      });
      // 筛选支持读取的图片
      const MIMEType = ["image/gif", "image/jpeg", "image/png", "image/webp", "image/avif"];

      const length = originList.length;
      for (let index = 0; index < length; index++) {
        const isDone = index + 1 === length;
        const newPercentage = Math.floor((((index + 1) / length) * 100) / 2);
        try {
          const type = await myFS.readFileType(dirPath + "\\" + originList[index]);
          if (MIMEType.includes(type.mime)) {
            resultArrayRef.current.push({
              id: resultArrayRef.current.length,
              name: originList[index],
              outputDirName: [],
              processingMethod: ""
            });
            setProgress((origin) => {
              return {
                count: length,
                fail: origin.fail,
                index: index + 1,
                percentage: 50 + newPercentage,
                stepName: isDone ? "结束" : origin.stepName,
                success: origin.success + 1,
                isDone
              };
            });
          } else {
            readFileFailArrayRef.current.push({
              name: originList[index],
              description: "不支持的图片类型"
            });
            setProgress((origin) => {
              return {
                count: length,
                fail: origin.fail + 1,
                index: index + 1,
                percentage: 50 + newPercentage,
                stepName: isDone ? "结束" : origin.stepName,
                success: origin.success,
                isDone
              };
            });
          }
        } catch (error) {
          readFileFailArrayRef.current.push({
            name: originList[index],
            description: "不支持文件夹或者损坏的文件"
          });
          setProgress((origin) => {
            return {
              count: length,
              fail: origin.fail + 1,
              index: index + 1,
              percentage: 50 + newPercentage,
              stepName: origin.stepName,
              success: origin.success,
              isDone
            };
          });
        }
      }
    } catch (error) {
      setError({ isError: true, message: "FilterFiles.tsx runFilter unkonw error" });
    }
  }

  function retry() {
    setError({ isError: false, message: "" });
    runFilter(params.dirPath);
  }

  function done() {
    params.onDone(resultArrayRef.current);
  }

  function showDetails() {
    setVisible(true);
  }

  function renderModalContent() {
    if (!visible) {
      return <></>;
    }
    const body = readFileFailArrayRef.current.slice(0, 5).map((object, index) => {
      return (
        <div>
          <span>{index + 1}:</span>
          <span>{object.name}</span>
          <span>{object.description}</span>
        </div>
      );
    });

    return (
      <div>
        <div>
          <span>失败的前五个内容</span>
        </div>
        {body}
      </div>
    );
  }

  //#region 错误界面显示
  if (error.isError) {
    return (
      <div className={style["base"]}>
        <div>
          <span>{error.message}</span>
          <div>
            <Button block onClick={params.onlastPage}>
              回到上一步
            </Button>
            <Button onClick={retry}>重试</Button>
          </div>
        </div>
      </div>
    );
  }
  //#endregion

  const showInformations = Boolean(readFileFailArrayRef.current.length);

  return (
    <div className={style["base"]}>
      <div className={style["body"]}>
        <div className={style["progress-bar"]}>
          <div className={style["progress-inner"]}>
            <div
              className={style["progress-bg"]}
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <span className={style["progress-text"]}>{progress.percentage}%</span>
        </div>
        <div className={style["text-box"]}>
          <div>
            <span>{progress.index}</span>
            <span>/</span>
            <span className={style["success"]}>{progress.success}</span>
            <span>/</span>
            <span className={style["fail"]}>{progress.fail}</span>
            <span>/</span>
            <span>{progress.count}</span>
          </div>
          <div>
            <span>{progress.stepName}</span>
          </div>
        </div>
        <div className={style["button-box"]}>
          <Button onClick={onlastPage}>回到上一步</Button>
          {showInformations && <Button onClick={showDetails}>显示详情</Button>}
          {progress.isDone && <Button onClick={done}>开始分类</Button>}
        </div>
      </div>
      <Modal
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
}
