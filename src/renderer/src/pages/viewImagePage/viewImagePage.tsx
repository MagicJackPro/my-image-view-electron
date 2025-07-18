import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "@renderer/hook/useStores";
import Aside from "@renderer/components/Aside/Aside";
import type { AsideFace } from "@renderer/components/Aside/Aside";
import style from "./viewImagePage.module.css";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";
import ViewImage from "@renderer/components/VIewImage/ViewImage";

import ModalTable from "./ModalTable";
import type { Record } from "./ModalTable";
import FilterFiles from "./FilterFiles";
import ButtonPanle from "./ButtonPanle";
import type { ButtonRecordFace } from "./ButtonPanle";

type MediaTypeT = "PC" | "Mobile" | "1x1";

const OutHeight = 1080;
const OutWidth = 1920;

const invoke = window.electron.ipcRenderer.invoke;
function ViewImagePage() {
  const Store = useStore();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [fileInfo, setFileInfo] = useState<AsideFace>({
    filePath: "",
    fileName: "",
    fileSize: "",
    ceateTime: "",
    resolution: { width: 0, height: 0 }
  });
  const [src, setSRC] = useState("");
  const [pictureIndex, setPictureIndex] = useState(0);
  const [mediaType, setMediaType] = useState<MediaTypeT>("PC");
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
      const filePath = Store.dirpath + "\\" + files[pictureIndex];
      const fileName = files[pictureIndex];
      invoke("fc:readPicture", filePath).then((file) => {
        const fileSize = (file.buffer.length / 1024).toFixed(2).toString() + "KiB";
        const resolution = { width: file.resolution.width, height: file.resolution.height };
        setFileInfo({
          filePath,
          fileName,
          fileSize,
          ceateTime: "",
          resolution
        });
        setSRC(URL.createObjectURL(new Blob([file.buffer], { type: file.type })));

        // 计算MediaType
        const newMediaType: MediaTypeT =
          resolution.width === resolution.height
            ? "1x1"
            : resolution.height > resolution.width
              ? "Mobile"
              : "PC";
        setMediaType(newMediaType);
        disableRef.current = false;
      });
      // setSRC('local-resource:' + store.dirpath + '\\' + files[0]);
    }

    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [pictureIndex, files]);

  /** 加载完毕 */
  function loaded(files: string[]) {
    haveOutputFolders.current = files.map(() => false);
    setLoading(false);
    setFiles(files);
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
    }
  }
  function nextPicture() {
    if (files.length > pictureIndex + 1) {
      setPictureIndex(pictureIndex + 1);
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
      console.error("listData 意外的数据");
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
        startTimeText: now.toUTCString()
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
            endTimeText: now.toUTCString()
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
        // onDone={(files) => {
        //   setLoading(false);
        //   setFiles(files);
        // }}
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
      // console.log("计算放大");
      const resolution = { height: fileInfo.resolution.height, width: fileInfo.resolution.width };
      const targetPC = resolution.width > resolution.height ? true : false;
      const target = targetPC
        ? { height: OutHeight, width: OutWidth }
        : { height: OutWidth, width: OutHeight };
      const widthDifference = target.width > resolution.width ? target.width - resolution.width : 0;
      const heightDifference =
        target.height > resolution.height ? target.height - resolution.height : 0;
      // console.log(`widthDifference:`, widthDifference);
      // console.log(`heightDifference:`, heightDifference);
      /** 倍率 */
      let Magnification = 1;
      let lowValue = 0;
      let targetValue = 0;
      if (widthDifference > heightDifference) {
        // console.log("select width");

        targetValue = target.width;
        lowValue = resolution.width;
      } else if (heightDifference > widthDifference) {
        // console.log("select height");
        targetValue = target.height;
        lowValue = resolution.height;
      }

      // console.log(`resolution:${resolution.width}x${resolution.height}`);

      // console.log(`Magnification:`, Magnification);
      // console.log(`lowValue:`, lowValue);
      // console.log(`targetValue:`, targetValue);
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
      name: fileInfo.fileName,
      processingMethod: buttonInfo.label,
      outputDirName
    };

    const findIndex = listData.findIndex((value) => value.name === newRecord.name);
    const newListData =
      findIndex === -1
        ? listData.concat([newRecord])
        : [...listData.slice(0, findIndex), newRecord, ...listData.slice(findIndex + 1)];
    setListData(newListData);
    haveOutputFolders.current[pictureIndex] = true;
    nextPicture();
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
        <div>
          <Button type="dark" onClick={lastPicture}>
            上一张
          </Button>
          <Button type="dark" onClick={nextPicture}>
            下一张
          </Button>
        </div>
        <div>
          <span>tip:未来准备加入快捷键 TODO {mediaType}</span>
          <Button type="dark" onClick={showList}>
            整理列表
          </Button>

          <Button type="dark" onClick={Classification}>
            执行
          </Button>
        </div>
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
