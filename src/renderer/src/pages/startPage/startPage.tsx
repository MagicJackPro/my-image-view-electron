// import type ChangeEvent  from 'react'
import { useNavigate } from "react-router";
import style from "./startPage.module.css";
import { useStore } from "@renderer/hook/useStores";
import { observer } from "mobx-react-lite";
import { useMessage } from "@renderer/components/Message/Message";
import Button from "@renderer/components/Button/Button";

function StartPage() {
  const store = useStore();
  const navigate = useNavigate();
  const MessageAPI = useMessage();

  async function selectFile() {
    try {
      const newDirPath = await window.electron.ipcRenderer.invoke("fc:selectDir");
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
        newDirPath = file.path.replace(/\\[^\\]+$/, "");
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
        id: "StartPage_next",
      });
    }
  }
  return (
    <div className={style.base}>
        <h1>开始</h1>
        <span>请选择默认文件夹</span>
        <div
          className={style["drop-file-div"]}
          onDrop={handleDrop}
          onDragOver={handleDragover}
          onClick={selectFile}
        >
          <span>{store.dirpath ||"拖入文件夹或点击选择"}</span>
        </div>
        <Button type="dark" onClick={next}>下一步</Button>
        {/* <input className={style['hidden-input']} type="file" name="file" onChange={selectFile} /> */}
     
    </div>
  );
}

export default observer(StartPage);
