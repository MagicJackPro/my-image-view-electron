import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "@renderer/hook/useStores";
import store from "@renderer/store/store";
import Aside from "@renderer/components/Aside/Aside";
import type { AsideFace } from "@renderer/components/Aside/Aside";
import style from "./viewImagePage.module.css";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";

interface PaginationFace {
  /** 总数 */
  count: number;
  /** 页码 */
  pageNumber: number;
  /** 总页数 */
  pageNumberCount: number;
  /** 每页条数 */
  pageSize: number;
}

type ProcessingMethodObjectKey =
  | "avatar"
  | "delete"
  | "HMoblie"
  | "HPC"
  | "Moblie"
  | "other"
  | "PC"
  | "seMoblie"
  | "sePC"
  | "Square"
  | "ThrowPillow";
type ProcessingMethodObjectFace = {
  [key in ProcessingMethodObjectKey]: { label: string; dirName: string };
};

interface Record {
  /** 文件名 */
  name: string;
  /** 处理方式 */
  processingMethod: string;
  /** 输出目录名称 */
  outputDirName: string;
}
type MediaTypeT = "PC" | "Mobile" | "1x1";

const OutHeight = 1080;
const OutWidth = 1920;

const processingMethodObject: ProcessingMethodObjectFace = {
  avatar: { label: "头像", dirName: "头像" },
  delete: { label: "不要了", dirName: "待删除" },
  HMoblie: { label: "H图Moblie", dirName: "H图Moblie" },
  HPC: { label: "H图PC", dirName: "H图PC" },
  Moblie: { label: "Moblie", dirName: "Moblie" },
  other: { label: "其他", dirName: "其他" },
  PC: { label: "PC", dirName: "PC" },
  seMoblie: { label: "色图Moblie", dirName: "色图Moblie" },
  sePC: { label: "色图PC", dirName: "色图PC" },
  Square: { label: "1比1图", dirName: "1x1" },
  ThrowPillow: { label: "抱枕", dirName: "抱枕" }
};

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
  const [imageScle, setImageScle] = useState({ width: "0px", height: "0px", baifenbi: 100 });
  const [pictureIndex, setPictureIndex] = useState(0);
  const [mediaType, setMediaType] = useState<MediaTypeT>("PC");
  const [listV, setListV] = useState(false);
  /** 整理列表 */
  const [listData, setListData] = useState<Record[]>([]);
  const [pagination, setPagination] = useState<PaginationFace>({
    pageNumber: 1,
    pageSize: 4,
    count: 0,
    pageNumberCount: 1
  });

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

  useEffect(() => {
    invoke("fc:ls", Store.dirpath).then((files) => {
      setFiles(files);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (src) {
      URL.revokeObjectURL(src);
      setSRC("");
    }
    if (files.length > 0 && files.length >= pictureIndex + 1) {
      const filePath = store.dirpath + "\\" + files[pictureIndex];
      const fileName = files[pictureIndex];
      invoke("fc:readFile", filePath).then((file) => {
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

        const imageBox = document.getElementById("image-box");

        // 计算MediaType
        const newMediaType: MediaTypeT =
          resolution.width === resolution.height
            ? "1x1"
            : resolution.height > resolution.width
              ? "Mobile"
              : "PC";
        setMediaType(newMediaType);

        if (imageBox) {
          const clientWidth = imageBox.clientWidth;
          const clientHeight = imageBox.clientHeight;
          const widthDifference =
            resolution.width > clientWidth ? resolution.width - clientWidth : 0;
          const heightDifference =
            resolution.height > clientHeight ? resolution.width - clientHeight : 0;
          // console.log(`widthDifference:`, widthDifference);
          // console.log(`heightDifference:`, heightDifference);
          if (widthDifference === 0 && heightDifference === 0) {
            setImageScle({ width: resolution.width, height: resolution.height, baifenbi: 100 });
          } else {
            // 计算比值
            const baifenbi = Math.floor(
              heightDifference > widthDifference
                ? (clientHeight / resolution.height) * 100
                : (clientWidth / resolution.width) * 100
            );
            if (heightDifference > widthDifference) {
            }
            setImageScle({
              width: ((resolution.width * baifenbi) / 100).toFixed(2) + "px",
              height: ((resolution.height * baifenbi) / 100).toFixed(2) + "px",
              baifenbi
            });
          }
        }
      });
      // setSRC('local-resource:' + store.dirpath + '\\' + files[0]);
    }

    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [pictureIndex, files]);

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
    if (pictureIndex > 1) {
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
      window.api.dialog.SecondaryConfirmation({ message: `还差${dValue}张图片没有选择分类。` });
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
    const dirPath = store.dirpath;
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
      <div className={style["base"]}>
        <div>
          <span>加载数据中</span>
        </div>
        <button onClick={lastPage}>回到上一步</button>
      </div>
    );
  }

  function renderList() {
    const start = (pagination.pageNumber - 1) * pagination.pageSize;
    const arr = listData.slice(start, start + 4);
    return arr.map((value, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>暂未开发{value.outputDirName}</td>
          <td>{value.name}</td>
          <td>{value.processingMethod}</td>
        </tr>
      );
    });
  }

  function addListData(processingMethod: ProcessingMethodObjectKey) {
    if (!fileInfo.fileName) {
      window.api.dialog.SecondaryConfirmation({
        message: "function addListData loss fileInfo.fileName"
      });
      return;
    }

    //#region 计算放大
    const resolution = { height: fileInfo.resolution.height, width: fileInfo.resolution.width };
    const targetPC = resolution.width > resolution.height ? true : false;
    const target = targetPC
      ? { height: OutHeight, width: OutWidth }
      : { height: OutWidth, width: OutHeight };
    const widthDifference = target.width > resolution.width ? target.width - resolution.width : 0;
    const heightDifference =
      target.height > resolution.height ? resolution.height - resolution.height : 0;

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

    const outputDirName =
      Magnification === 1
        ? processingMethodObject[processingMethod].dirName
        : processingMethodObject[processingMethod].dirName + "x" + Magnification;

    //#endregion

    const newRecord: Record = {
      name: fileInfo.fileName,
      processingMethod: processingMethodObject[processingMethod].label,
      outputDirName
    };

    const findIndex = listData.findIndex((value) => value.name === newRecord.name);
    const newListData =
      findIndex === -1
        ? listData.concat([newRecord])
        : [...listData.slice(0, findIndex), newRecord, ...listData.slice(findIndex + 1)];
    const newPagination: PaginationFace = {
      count: newListData.length,
      pageNumber: 0,
      pageNumberCount: 0,
      pageSize: pagination.pageSize
    };
    newPagination.pageNumberCount = Math.ceil(newPagination.count / newPagination.pageSize);
    newPagination.pageNumber = newPagination.pageNumberCount;
    setListData(newListData);
    setPagination(newPagination);
    nextPicture();
  }

  function deletePicture() {
    return addListData("delete");
  }

  function otherPicture() {
    return addListData("other");
  }

  function pcPicture() {
    return addListData("PC");
  }

  function mobliePicture() {
    return addListData("Moblie");
  }

  function squarePicture() {
    return addListData("Square");
  }

  function seMobliePicture() {
    return addListData("seMoblie");
  }

  function sePCPicture() {
    return addListData("sePC");
  }

  function hMobliePicture() {
    return addListData("HMoblie");
  }

  function hPCPicture() {
    return addListData("HPC");
  }

  function avatarPicture() {
    return addListData("avatar");
  }

  function throwPillowPicture() {
    return addListData("ThrowPillow");
  }

  function lastTablePage() {
    if (pagination.pageNumber > 1) {
      const newPagination: PaginationFace = {
        count: pagination.count,
        pageNumber: pagination.pageNumber - 1,
        pageNumberCount: pagination.pageNumberCount,
        pageSize: pagination.pageSize
      };
      setPagination(newPagination);
    }
  }
  function nextTablePage() {
    const newPageNumber = pagination.pageNumber + 1;
    if (pagination.pageNumberCount >= newPageNumber) {
      const newPagination: PaginationFace = {
        count: pagination.count,
        pageNumber: newPageNumber,
        pageNumberCount: pagination.pageNumberCount,
        pageSize: pagination.pageSize
      };
      setPagination(newPagination);
    }
  }

  function toPageNumber() {
    const HTMLelement = document.getElementById("tablePageNumber");
    if (HTMLelement && HTMLelement.tagName === "INPUT") {
      const inputNumber = HTMLelement as HTMLInputElement;
      const str = inputNumber.value;
      const unsafeINT = Number.parseInt(str);
      if (
        Number.isSafeInteger(unsafeINT) &&
        unsafeINT > 0 &&
        unsafeINT <= pagination.pageNumberCount
      ) {
        inputNumber.value = "";
        const newPagination: PaginationFace = {
          count: pagination.count,
          pageNumber: unsafeINT,
          pageNumberCount: pagination.pageNumberCount,
          pageSize: pagination.pageSize
        };
        setPagination(newPagination);
      } else {
        window.api.dialog.SecondaryConfirmation({ message: "请输入正确页码" });
      }
    } else {
      window.api.dialog.SecondaryConfirmation({ message: "not found" });
    }
    // const index
  }

  return (
    <div className={[style["base"], style["base-flex"]].join(" ")}>
      <Aside fileInfo={fileInfo} />
      <div className={style["image-box"]} id="image-box">
        {src && <img height={imageScle.height} width={imageScle.width} src={src}></img>}
      </div>

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
            上一张图片
          </Button>
          <Button type="dark" onClick={nextPicture}>
            下一张图片
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
        <div>
          <div>
            <p>特殊</p>
            <div className={style["button-div"]}>
              <Button type="dark" onClick={deletePicture}>
                不要了(0)
              </Button>
              <Button type="dark" onClick={pcPicture}>
                PC(1)
              </Button>
              <Button type="dark" onClick={mobliePicture}>
                Moblie(2)
              </Button>
              <Button type="dark" onClick={squarePicture}>
                1:1图(3)
              </Button>
              <Button type="dark" onClick={seMobliePicture}>
                色图Moblie(4)
              </Button>
              <Button type="dark" onClick={sePCPicture}>
                色图PC(5)
              </Button>
              <Button type="dark" onClick={hMobliePicture}>
                H图Moblie(6)
              </Button>
              <Button type="dark" onClick={hPCPicture}>
                H图PC(7)
              </Button>
              <Button type="dark" onClick={avatarPicture}>
                头像(8)
              </Button>
              <Button type="dark" onClick={throwPillowPicture}>
                抱枕(9)
              </Button>
              <Button type="dark" onClick={otherPicture}>
                其他(+)
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal visible={listV} onCancel={closeList}>
        <div className={style["modal-body"]}>
          <div className={style["modal-title"]}>
            <h1>整理列表</h1>
            <Button onClick={closeList}>关闭</Button>
          </div>
          {/* table head */}
          <table className={style["table"]}>
            <thead className={style["table-thead"]}>
              <tr>
                <td>序号</td>
                <td>缩略图</td>
                <td>文件名</td>
                <td>处理方式</td>
              </tr>
            </thead>
            <tbody>{renderList()}</tbody>
          </table>
          <div>
            <span>{`${pagination.pageNumber}/${pagination.pageNumberCount}`}</span>
            <Button type="dark" onClick={lastTablePage}>
              上一页
            </Button>
            <Button type="dark" onClick={nextTablePage}>
              下一页
            </Button>
            <input
              autoComplete="off"
              className={style["input-number"]}
              id="tablePageNumber"
              max={pagination.pageNumberCount}
              min={1}
              type="number"
            />
            <Button type="dark" onClick={toPageNumber}>
              跳转
            </Button>
          </div>
        </div>
      </Modal>

      <Modal visible={classificationModal.visible} onCancel={closeList}>
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
