import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useStore } from '@renderer/hook/useStores';
import store from '@renderer/store/store';
import Aside from '@renderer/components/Aside/Aside';
import type { AsideFace } from '@renderer/components/Aside/Aside';
import style from './viewImagePage.module.css';

const invoke = window.electron.ipcRenderer.invoke;
function ViewImagePage() {
  const Store = useStore();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [fileInfo, setFileInfo] = useState<AsideFace>({
    filePath: '',
    fileName: '',
    fileSize: '',
    ceateTime: '',
    resolution: { width: 0, height: 0 }
  });
  const [src, setSRC] = useState('');
  const [imageScle, setImageScle] = useState({ width: '0px', height: '0px', baifenbi: 100 });

  useEffect(() => {
    invoke('fc:ls', Store.dirpath).then((files) => {
      if (files.length > 0) {
        const filePath = store.dirpath + '\\' + files[0];
        const fileName = files[0];
        invoke('fc:readFile', store.dirpath + '\\' + files[0]).then((file) => {
          const fileSize = (file.buffer.length / 1024).toFixed(2).toString() + 'KiB';
          const resolution = { width: file.resolution.width, height: file.resolution.height };
          setFileInfo({
            filePath,
            fileName,
            fileSize,
            ceateTime: '',
            resolution
          });
          setSRC(URL.createObjectURL(new Blob([file.buffer], { type: file.type })));

          const imageBox = document.getElementById('image-box');

          console.log(`imageBox?.clientHeight:`, imageBox?.clientHeight);
          console.log(`imageBox?.clientWidth:`, imageBox?.clientWidth);
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
                width: ((resolution.width * baifenbi) / 100).toFixed(2) + 'px',
                height: ((resolution.height * baifenbi) / 100).toFixed(2) + 'px',
                baifenbi
              });
            }
          }
        });
        // setSRC('local-resource:' + store.dirpath + '\\' + files[0]);
      }
      setFiles(files);
      setLoading(false);
    });
  }, []);

  function lastPage() {
    if (src) {
      URL.revokeObjectURL(src);
    }
    navigate('/');
  }

  function renderList() {
    const arr: React.JSX.Element[] = [];
    for (let index = 0; index < files.length; index++) {
      arr.push(<span>{files[index]}</span>);
    }
    return arr;
  }

  if (isLoading) {
    return (
      <div className={style['base']}>
        <div>
          <span>加载数据中</span>
        </div>
        <button onClick={lastPage}>回到上一步</button>
      </div>
    );
  }
  /** 计算图片大小 */
  return (
    <div className={[style['base'], style['base-flex']].join(' ')}>
      <Aside fileInfo={fileInfo} />
      {/* <div>{renderList()}</div>
       */}
      <div className={style['image-box']} id="image-box">
        {src && <img height={imageScle.height} width={imageScle.width} src={src}></img>}
      </div>

      <div className={style['control-panle']}>
        <button onClick={lastPage}>回到上一步</button>
        <div>
          <span>{`1/${files.length}`}</span>
        </div>
        {/* <button onClick={} */}
      </div>
    </div>
  );
}

export default ViewImagePage;
