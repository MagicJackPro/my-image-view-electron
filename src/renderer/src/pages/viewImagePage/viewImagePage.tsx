import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useStore } from "@renderer/hook/useStores";
import store from "@renderer/store/store";
import Aside from "@renderer/components/Aside/Aside";
import type { AsideFace } from "@renderer/components/Aside/Aside";
import style from "./viewImagePage.module.css";

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
  const [imageScle, setImageScle] = useState({ width: "0px", height: "0px", baifenbi: 100 });
  const [pictureIndex, setPictureIndex] = useState(0);
  const [mediaType, setMediaType] = useState<MediaTypeT>("PC");

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
          const shazhiWidth = resolution.width > clientWidth ? resolution.width - clientWidth : 0;
          const shazhiHeight =
            resolution.height > clientHeight ? resolution.width - clientHeight : 0;
          console.log(`shazhiWidth:`, shazhiWidth);
          console.log(`shazhiHeight:`, shazhiHeight);
          if (shazhiWidth === 0 && shazhiHeight === 0) {
            setImageScle({ width: resolution.width, height: resolution.height, baifenbi: 100 });
          } else {
            // 计算比值
            const baifenbi = Math.floor(
              shazhiHeight > shazhiWidth
                ? (clientHeight / resolution.height) * 100
                : (clientWidth / resolution.width) * 100
            );
            if (shazhiHeight > shazhiWidth) {
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

  function lastPage() {
    // TODO 需要弹出再次确认提示框
    if (src) {
      URL.revokeObjectURL(src);
    }
    navigate("/");
  }

  function renderList() {
    const arr: React.JSX.Element[] = [];
    for (let index = 0; index < files.length; index++) {
      arr.push(<span>{files[index]}</span>);
    }
    return arr;
  }

  function lastPicture() {
    if (pictureIndex > 0) {
      setPictureIndex(pictureIndex - 1);
    }
  }
  function nextPicture() {
    if (files.length >= pictureIndex + 1) {
      setPictureIndex(pictureIndex + 1);
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

  return (
    <div className={[style["base"], style["base-flex"]].join(" ")}>
      <Aside fileInfo={fileInfo} />
      {/* <div>{renderList()}</div>
       */}
      <div className={style["image-box"]} id="image-box">
        {src && <img height={imageScle.height} width={imageScle.width} src={src}></img>}
      </div>

      <div className={style["control-panle"]}>
        <button onClick={lastPage}>回到上一步</button>
        <div>
          <span>{`${pictureIndex + 1}/${files.length}`}</span>
          <input type="number" />
        </div>
        <button onClick={lastPicture}>上一张图片</button>
        <button onClick={nextPicture}>下一张图片</button>
        <div>
          <span>tip:未来准备加入快捷键 TODO</span>

          <div>
            <p>特殊</p>
            <div className={style["button-div"]}>
              <button>不要了(0)</button>
              <button>色图Moblie(6)</button>
              <button>色图PC(7)</button>
              <button>H图Moblie(8)</button>
              <button>H图PC(9)</button>
              <button>其他(+)</button>
            </div>
          </div>
          {mediaType === "PC" && (
            <div>
              <p>PC</p>
              <div className={style["button-div"]}>
                <button>pc(1)</button>
                <button>pc_x2(2)</button>
                <button>pc_x3(3)</button>
                <button>pc_x3(4)</button>
              </div>
            </div>
          )}
          {mediaType === "Mobile" && (
            <div>
              <p>Moblie</p>
              <div className={style["button-div"]}>
                <button>Moblie(1)</button>
                <button>Moblie_x2(2)</button>
                <button>Moblie_x3(3)</button>
                <button>Moblie_x4(4)</button>
              </div>
            </div>
          )}
          {mediaType === "1x1" && (
            <div>
              <p>1x1</p>
              <div className={style["button-div"]}>
                <button>1x1(1)</button>
                <button>1x1_x2(2)</button>
                <button>1x1_x3(3)</button>
                <button>1x1_x4(4)</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewImagePage;
