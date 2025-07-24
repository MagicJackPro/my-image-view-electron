import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "@renderer/hook/useStores";
import Aside from "@renderer/components/Aside/Aside";
import type { AsideFace } from "@renderer/components/Aside/Aside";
import style from "./viewImagePage.module.css";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";
import ViewImage from "@renderer/components/VIewImage/ViewImage";
import { useMessage } from "@renderer/components/Message/Message";
import Collapse from "@renderer/components/Collapse/Collapse";

import ModalTable from "./ModalTable";
import type { Record } from "./ModalTable";
import FilterFiles from "./FilterFiles";
import ButtonPanle from "./ButtonPanle";
import type { ButtonRecordFace } from "./ButtonPanle";

interface FileFace {
  id: number;
  /** 文件名 */
  name: string;
}

const OutHeight = 1080;
const OutWidth = 1920;

function formatDate(date: Date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${hour > 9 ? hour : "0" + hour}:${minute > 9 ? minute : "0" + minute}:${second > 9 ? second : "0" + second}`;
}

const invoke = window.electron.ipcRenderer.invoke;
function ViewImagePage() {
  const MessageAPI = useMessage();
  const Store = useStore();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileFace[]>([]);
  const [fileInfo, setFileInfo] = useState<AsideFace>({
    filePath: "",
    fileName: "",
    fileSize: "",
    ceateTime: "",
    resolution: { width: 0, height: 0 }
  });
  const [src, setSRC] = useState("");
  const [pictureIndex, setPictureIndex] = useState(0);
  const [listV, setListV] = useState(false);
  /** 整理列表 */
  const [listData, setListData] = useState<Record[]>([]);

  const [classificationModal, setClassificationModal] = useState({
    visible: false,
    index: 0,
    count: 0,
    startTime: 0,
    startTimeText: "",
    endTime: 0,
    endTimeText: "",
    canClose: false
  });

  const disableRef = useRef(true);
  const haveOutputFolders = useRef<boolean[]>([]);

  useEffect(() => {
    if (src) {
      URL.revokeObjectURL(src);
      setSRC("");
    }
    if (files.length > 0 && files.length >= pictureIndex + 1) {
      const fileName = files[pictureIndex].name;
      const filePath = Store.dirpath + "\\" + fileName;
      try {
        window.api.fs.readPicture(filePath).then((file) => {
          const fileSize = (file.buffer.length / 1024).toFixed(2).toString() + "KiB";
          const resolution = { width: file.resolution.width, height: file.resolution.height };
          setFileInfo({
            filePath,
            fileName,
            fileSize,
            ceateTime: formatDate(file.stats.birthtime),
            resolution
          });
          setSRC(URL.createObjectURL(new Blob([file.buffer], { type: file.type.mime })));

          disableRef.current = false;
        });
      } catch (error) {
        const tempFileName = fileName.length > 10 ? fileName.slice(0, 7) + "..." : fileName;
        MessageAPI.error({
          id: "readPicture_error",
          message: `开图片[${tempFileName}]失败`,
          duration: 5000
        });
      }
      // setSRC('local-resource:' + store.dirpath + '\\' + files[0]);
    }

    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [pictureIndex, files]);

  /** 加载完毕 */
  function loaded(files: Record[]) {
    haveOutputFolders.current = [];
    const newFiles: FileFace[] = [];
    const newListData: Record[] = [];
    let newPictureIndex = 0;
    let index = 0;
    const length = files.length;
    for (; index < length; index++) {
      const record = files[index];
      newFiles.push({ name: record.name, id: record.id });
      if (record.outputDirName.length && record.processingMethod) {
        newListData.push(record);
        haveOutputFolders.current.push(true);
      } else {
        newPictureIndex = index;
        haveOutputFolders.current.push(false);
        index++;
        break;
      }
    }

    for (; index < length; index++) {
      const record = files[index];
      newFiles.push({ name: record.name, id: record.id });
      if (record.outputDirName.length && record.processingMethod) {
        newListData.push(record);
        haveOutputFolders.current.push(true);
      } else {
        haveOutputFolders.current.push(false);
      }
    }

    setPictureIndex(newPictureIndex);
    setFiles(newFiles);
    setListData(newListData);
    setLoading(false);
  }

  /** 返回选择文件夹页面 */
  function lastPage() {
    const config: Electron.MessageBoxOptions = {
      message: "是否要返回选择文件夹",
      buttons: ["确认", "取消"],
      defaultId: 1,
      title: "二次确认：返回选择文件夹",
      detail: "此操作会丢失当前进度"
    };

    window.api.dialog.SecondaryConfirmation(config).then((MessageBoxReturnValue) => {
      if (MessageBoxReturnValue.response === 0) {
        navigate("/");
      }
    });
  }

  function lastPicture() {
    if (pictureIndex > 0) {
      setPictureIndex(pictureIndex - 1);
    } else {
      MessageAPI.info({
        message: "当前已经是第一张",
        id: "lastPicture"
      });
    }
  }
  function nextPicture() {
    if (files.length > pictureIndex + 1) {
      setPictureIndex(pictureIndex + 1);
    } else {
      MessageAPI.info({
        message: "当前已经是最后一张",
        id: "nextPicture"
      });
    }
  }

  function showList() {
    setListV(true);
  }

  function closeList() {
    setListV(false);
  }

  function toIndexPicTure() {
    const htmlelement = document.getElementById("toIndex");
    if (htmlelement && htmlelement.tagName === "INPUT") {
      const inputNumber = htmlelement as HTMLInputElement;
      const str = inputNumber.value;
      const unsafeINT = Number.parseInt(str);
      if (Number.isSafeInteger(unsafeINT) && unsafeINT > 0 && unsafeINT <= files.length) {
        inputNumber.value = "";
        setPictureIndex(unsafeINT - 1);
      } else {
        window.api.dialog.SecondaryConfirmation({ message: "请输入正确页码" });
      }
    } else {
      window.api.dialog.SecondaryConfirmation({ message: "not found" });
    }
    // const index
  }

  /** 执行分类 */
  async function Classification() {
    // 检查
    const length = listData.length;
    if (length < files.length) {
      const dValue = files.length - listData.length;
      const length = haveOutputFolders.current.length;
      /** 没有分类的图片编号数组 */
      const arr: number[] = [];
      for (let index = 0; index < length; index++) {
        if (!haveOutputFolders.current[index]) {
          arr.push(index + 1);
        }
        if (arr.length > 4) {
          break;
        }
      }
      window.api.dialog.SecondaryConfirmation({
        message: `还差${dValue}张图片没有选择分类，前${arr.length}个图片编号分别是${arr.join("、")}。`
      });
      return;
    } else if (length !== files.length) {
      MessageAPI.error({
        message: "意外的数据，请反馈问题或等待修复。",
        id: "listData_error"
      });
      return;
    }

    const copyList = [...listData];
    setClassificationModal((origin) => {
      const now = new Date();
      return {
        ...origin,
        visible: true,
        count: length,
        index: 1,
        startTime: now.getTime(),
        startTimeText: formatDate(now)
      };
    });
    const dirPath = Store.dirpath;
    for (let index = 0; index < length; index++) {
      await invoke("fc:classification", dirPath, copyList[index]);
      if (index >= length - 1) {
        setClassificationModal((origin) => {
          const now = new Date();
          return {
            ...origin,
            index,
            endTime: now.getTime(),
            endTimeText: formatDate(now)
          };
        });
      } else {
        setClassificationModal((origin) => {
          return {
            ...origin,
            index
          };
        });
      }
    }
  }

  if (isLoading) {
    return (
      <FilterFiles
        dirPath={Store.dirpath}
        onDone={loaded}
        onlastPage={() => {
          navigate("/");
        }}
      />
    );
  }

  function addListData(buttonInfo: ButtonRecordFace) {
    if (disableRef.current) return;
    disableRef.current = true;
    if (!fileInfo.fileName) {
      window.api.dialog.SecondaryConfirmation({
        message: "function addListData loss fileInfo.fileName"
      });
      return;
    }

    let outputDirName = [buttonInfo.folderName];

    //#region 计算放大
    if (buttonInfo.calculateTheMagnification) {
      const resolution = { height: fileInfo.resolution.height, width: fileInfo.resolution.width };
      const targetPC = resolution.width > resolution.height ? true : false;
      const target = targetPC
        ? { height: OutHeight, width: OutWidth }
        : { height: OutWidth, width: OutHeight };
      const widthDifference = target.width > resolution.width ? target.width - resolution.width : 0;
      const heightDifference =
        target.height > resolution.height ? target.height - resolution.height : 0;
      /** 倍率 */
      let Magnification = 1;
      let lowValue = 0;
      let targetValue = 0;
      if (widthDifference > heightDifference) {
        targetValue = target.width;
        lowValue = resolution.width;
      } else if (heightDifference > widthDifference) {
        targetValue = target.height;
        lowValue = resolution.height;
      }

      if (lowValue !== 0) {
        for (Magnification = 1; Magnification < 4; Magnification++) {
          if (Magnification * lowValue >= targetValue) {
            break;
          }
        }
      }
      outputDirName.push(buttonInfo.folderName + "x" + Magnification);
    }
    //#endregion

    //#region 自动分类
    if (buttonInfo.aspectRatioClassification) {
      const height = fileInfo.resolution.height;
      const width = fileInfo.resolution.width;
      let aspectRatio = "unkown";
      if (width === height) {
        aspectRatio = "1x1";
      } else if (width > height) {
        aspectRatio = "宽屏";
      } else {
        aspectRatio = "竖屏";
      }
      outputDirName.splice(1, 0, aspectRatio);
    }
    //#endregion

    const newRecord: Record = {
      id: pictureIndex,
      name: fileInfo.fileName,
      processingMethod: buttonInfo.label,
      outputDirName
    };

    const length = listData.length;
    let index = 0;
    let haveAdd = true;
    for (index = 0; index < length; index++) {
      if (listData[index].id === pictureIndex) {
        setListData([...listData.slice(0, index), newRecord, ...listData.slice(index + 1)]);
        haveAdd = false;
        break;
      } else if (listData[index].id > pictureIndex) {
        setListData([...listData.slice(0, index), newRecord, ...listData.slice(index)]);
        haveAdd = false;
        break;
      }
    }
    if (haveAdd) {
      setListData(listData.concat([newRecord]));
    }

    haveOutputFolders.current[pictureIndex] = true;
    if (pictureIndex + 1 >= files.length) {
      disableRef.current = false;
    }
    nextPicture();
  }

  /** 手动保存 */
  async function manualSave() {
    try {
      if (disableRef.current) return;
      disableRef.current = true;

      const config: Electron.MessageBoxOptions = {
        message: "是否保存临时进度",
        buttons: ["确认", "取消"],
        defaultId: 1,
        title: "二次确认：保存临时进度",
        detail: "此操作会创建文件在选择的文件目录下"
      };

      const MessageBoxReturnValue = await window.api.dialog.SecondaryConfirmation(config);
      if (MessageBoxReturnValue.response !== 0) {
        disableRef.current = false;
        return;
      }
      if (listData.length === files.length) {
        await invoke("db:create", Store.dirpath);
        await invoke("db:insertInto", Store.dirpath, listData);
      } else {
        const saveData: Record[] = files.map((file) => ({
          id: file.id,
          name: file.name,
          processingMethod: "",
          outputDirName: []
        }));
        listData.forEach((listRecord) => {
          if (saveData[listRecord.id].outputDirName.length === 0) {
            saveData[listRecord.id] = listRecord;
          }
        });
        await invoke("db:create", Store.dirpath);
        await invoke("db:insertInto", Store.dirpath, saveData);
      }
      MessageAPI.success({
        message: "手动保存成功",
        id: "manualSave"
      });
      disableRef.current = false;
    } catch (error) {
      disableRef.current = false;
      MessageAPI.error({
        message: "手动保存失败",
        id: "manualSave"
      });
    }
  }

  return (
    <div className={[style["base"], style["base-flex"]].join(" ")}>
      <Aside fileInfo={fileInfo} />
      <ViewImage src={src} resolution={fileInfo.resolution} />
      <div className={style["control-panle"]}>
        <Button type="dark" block onClick={lastPage}>
          回到上一步
        </Button>
        <div className={style["page-number-box"]}>
          <span>{`${pictureIndex + 1}/${files.length}`}</span>
          <input
            autoComplete="off"
            className={style["input-number"]}
            id="toIndex"
            max={files.length}
            min={1}
            step={1}
            type="number"
          />
          <Button type="dark" onClick={toIndexPicTure}>
            跳转
          </Button>
        </div>
        <div className={style["flex-row-jc-between"]}>
          <Button type="dark" onClick={lastPicture}>
            上一张
          </Button>
          <Button type="dark" onClick={nextPicture}>
            下一张
          </Button>
        </div>
        <Collapse contentClassName={style["collapse-content"]}>
          <div className={style["flex-row-jc-between"]}>
            <Button type="dark" onClick={showList}>
              整理列表
            </Button>

            <Button type="dark" onClick={manualSave}>
              临时保存
            </Button>
          </div>
          <Button type="dark" block onClick={Classification}>
            执行
          </Button>
        </Collapse>
        <ButtonPanle onClick={addListData} />
      </div>
      <ModalTable
        visible={listV}
        onCancel={closeList}
        listData={listData}
        dirPath={Store.dirpath}
      />

      <Modal visible={classificationModal.visible} onCancel={() => {}}>
        <div>
          <p>
            <span>{classificationModal.index + 1}</span>
            <span>/</span>
            <span>{classificationModal.count}</span>
          </p>
          <p>
            <span>{classificationModal.startTimeText}</span>
            <span>/</span>
            <span>{classificationModal.endTimeText}</span>
          </p>
          <Button
            onClick={() => {
              setClassificationModal({
                visible: false,
                index: 0,
                count: 0,
                startTime: 0,
                startTimeText: "",
                endTime: 0,
                endTimeText: "",
                canClose: false
              });
            }}
          >
            关闭
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default ViewImagePage;
