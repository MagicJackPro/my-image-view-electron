// import type ChangeEvent  from 'react'
import { useNavigate } from "react-router";
import style from "./startPage.module.css";
import { useStore } from "@renderer/hook/useStores";
import { observer } from "mobx-react-lite";
function StartPage() {
  const store = useStore();
  const navigate = useNavigate();

  async function selectFile() {
    try {
      const newDirPath = await window.electron.ipcRenderer.invoke("fc:selectDir");
      store.setDirPath(newDirPath);
    } catch (error) {}
  }
  function handleDrop(event) {
    console.log("active drop");
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
      console.log(`file.path:${file.path}`);
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
    }
  }
  return (
    <div className={style.base}>
      <div className={style.base}>
        <h1>开始</h1>
        <span>请选择默认文件夹</span>
        <span>文件夹路径：{store.dirpath}</span>
        <div
          className={style["drop-file-div"]}
          onDrop={handleDrop}
          onDragOver={handleDragover}
          onClick={selectFile}
        >
          <span>拖入文件夹或点击选择</span>
        </div>
        <button onClick={next}>下一步</button>
        {/* <input className={style['hidden-input']} type="file" name="file" onChange={selectFile} /> */}
      </div>
    </div>
  );
}

export default observer(StartPage);
