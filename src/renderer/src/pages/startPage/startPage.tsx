import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import style from "./startPage.module.css";
import { useStore } from "@renderer/hook/useStores";
import { observer } from "mobx-react-lite";
import useMessage from "@renderer/hook/useMessage";
import Button from "@renderer/components/Button/Button";
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
      selectDirRef.current = window.api.fc.selectDir(store.dirpath);
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
        path: window.api.webUtils.getPathForFile(files[0]),
        name: files[0].name,
        type: files[0].type,
        size: files[0].size
      };
      let newDirPath = "";
      if (file.type === "") {
        newDirPath = file.path;
      } else {
        newDirPath = enhancedDirname(file.path);
      }
      store.setDirPath(newDirPath);
    }
  }
  function handleDragover(event) {
    event.preventDefault();
  }

  function next() {
    if (store.dirpath) {
      window.api.log.info({ msg: { "zh-cn": "已选择文件夹开始处理" }, path: store.dirpath });
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
  useEffect(() => {
    store.readConfig().catch((error) => {
      console.dir(error);
      
      if (error?.type === "content-format-is-incorrect") {
        MessageAPI.error({ message: "配置文件格式不正确！", id: "content-format-is-incorrect" });
      } else if (error?.type === "exist") {
        MessageAPI.info({ message: "使用默认配置文件", id: "config.json-is-exist" });
      } else {
        MessageAPI.error({
          message: "读取配置文件发生错误，请检查并查看日志！",
          id: "content-format-is-incorrect"
        });
      }
    });
  }, []);

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
      <Button onClick={next}>下一步</Button>
    </div>
  );
}

export default observer(StartPage);
