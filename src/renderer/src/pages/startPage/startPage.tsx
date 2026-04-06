import { useNavigate } from "react-router";
import style from "./startPage.module.css";
import { useStore } from "@renderer/hook/useStores";
import { observer } from "mobx-react-lite";
import { useMessage } from "@renderer/components/Message/Message";
import Button from "@renderer/components/Button/Button";
import { useRef } from "react";
import { Setting } from "@renderer/assets/icon/icon";
import { enhancedDirname } from "@renderer/utility/path";

function StartPage() {
  const store = useStore();
  const navigate = useNavigate();
  const MessageAPI = useMessage();
  const selectDirRef = useRef<Promise<string>>(undefined);

  async function selectFile() {
    try {
      if (selectDirRef.current) return;
      selectDirRef.current = window.electron.ipcRenderer.invoke("fc:selectDir");
      const newDirPath = await selectDirRef.current;
      selectDirRef.current = undefined;
      store.setDirPath(newDirPath);
    } catch (error) {}
  }
  function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = {
        path: window.electron.webUtils.getPathForFile(files[0]),
        name: files[0].name,
        type: files[0].type,
        size: files[0].size
      };
      let newDirPath = "";
      if (file.type === "") {
        newDirPath = file.path;
      } else {
        newDirPath = enhancedDirname(file.path)
      }
      store.setDirPath(newDirPath);
    }
  }
  function handleDragover(event) {
    event.preventDefault();
  }

  function next() {
    if (store.dirpath) {
      navigate("/viewIamge");
    } else {
      MessageAPI.info({
        message: "请选择文件夹",
        id: "StartPage_next"
      });
    }
  }

  function jumpToSettingPage() {
    navigate("/setting");
  }

  return (
    <div className={style.base}>
      <div className={style.Header}>
        <div>
          <h1>开始</h1>
          <span>请选择需要筛选文件夹</span>
        </div>
        <div>
          <Button icon={<Setting />} onClick={jumpToSettingPage}>
            设置
          </Button>
        </div>
      </div>
      <div
        className={style["drop-file-div"]}
        onDrop={handleDrop}
        onDragOver={handleDragover}
        onClick={selectFile}
      >
        <span>{store.dirpath || "拖入文件夹或点击选择"}</span>
      </div>
      <Button onClick={next}>
        下一步
      </Button>
    </div>
  );
}

export default observer(StartPage);
