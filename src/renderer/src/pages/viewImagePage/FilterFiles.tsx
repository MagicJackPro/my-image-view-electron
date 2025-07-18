import { useEffect, useRef, useState } from "react";
import style from "./FilterFiles.module.css";
import Button from "@renderer/components/Button/Button";

interface FilterFilesFace {
  dirPath: string;
  onDone: (files: string[]) => void;
  onlastPage: () => void;
}

const myFS = window.api.fs;
export default function FilterFiles(params: FilterFilesFace) {
  const [error, setError] = useState({ isError: false, message: "" });
  const [progress, setProgress] = useState({
    count: 0,
    fail: 0,
    index: 0,
    percentage: 0,
    stepName: "",
    success: 0
  });
  const resultArrayRef = useRef<string[]>([]);

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
        success: 0
      });
      let originList: string[] = [];
      try {
        originList = await myFS.readdir(dirPath);
      } catch (error: any) {
        setError({ isError: true, message: error?.message });
        return;
      }
      // setProgress({
      //   count: 1,
      //   fail: 0,
      //   index: 1,
      //   percentage: 100,
      //   stepName: "读取文件夹",
      //   success: 1
      // });
      setProgress({
        count: originList.length,
        fail: 0,
        index: 1,
        percentage: 0,
        stepName: "检查文件类型",
        success: 0
      });
      // 筛选支持读取的图片
      const MIMEType = ["image/gif", "image/jpeg", "image/png", "image/webp"];
      const resultArray: string[] = [];

      const length = originList.length;
      for (let index = 0; index < length; index++) {
        try {
          const type = await myFS.readFileType(dirPath + "\\" + originList[index]);
          if (MIMEType.includes(type.mime)) {
            resultArray.push(originList[index]);
            setProgress((origin) => {
              return {
                count: length,
                fail: origin.fail,
                index: index + 1,
                percentage: 0,
                stepName: origin.stepName,
                success: origin.success + 1
              };
            });
          } else {
            console.log(`type.mime:`, type.mime);
            setProgress((origin) => {
              return {
                count: length,
                fail: origin.fail + 1,
                index,
                percentage: 0,
                stepName: origin.stepName,
                success: origin.success
              };
            });
          }
        } catch (error) {
          setProgress((origin) => {
            return {
              count: length,
              fail: origin.fail + 1,
              index,
              percentage: 0,
              stepName: origin.stepName,
              success: origin.success
            };
          });
        }
      }
      // 保存临时进度

      resultArrayRef.current = resultArray;
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

  //#region 错误界面显示
  if (error.isError) {
    return (
      <div className={style["base"]}>
        <div>
          <span>{error.message}</span>
          <div>
            <Button type="dark" block onClick={params.onlastPage}>
              回到上一步
            </Button>
            <Button type="dark" onClick={retry}>
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }
  //#endregion

  return (
    <div className={style["base"]}>
      <div className={style["body"]}>
        <div>
          <span>进度条</span>
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
        <div>
          <Button type="dark" onClick={done}>
            开始分类
          </Button>
        </div>
      </div>
    </div>
  );
}
