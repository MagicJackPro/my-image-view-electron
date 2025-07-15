import style from './Aside.module.css';
import FileSvg from '@renderer/assets/file.svg';
import CalendarSvg from '@renderer/assets/calendar.svg'
import PictureSvg from '@renderer/assets/picture.svg'
import ResolutionSvg from '@renderer/assets/resolution.svg'
import PathSvg from '@renderer/assets/path.svg'

export interface AsideFace {
  /** 文件名 */
  fileName: string;
  /** 创建时间 */
  ceateTime: string;
  /** 文件大小 */
  fileSize: string;
  /** 分辨率 */
  resolution: { width: number; height: number };
  /** 文件路径 */
  filePath: string;
}

const labelObject = {
  /** 文件名 */
  fileName: { label: '文件名', icon: PictureSvg },
  /** 创建时间 */
  ceateTime: { label: '创建时间', icon: CalendarSvg },
  /** 文件大小 */
  fileSize: { label: '文件大小', icon: FileSvg },
  /** 分辨率 */
  resolution: { label: '分辨率', icon: ResolutionSvg },
  /** 文件路径 */
  filePath: { label: '文件路径', icon: PathSvg }
};

function Record(params: { label: string; value: string; icon: string }) {
  return (
    <div className={style['record']}>
      <div className={style['record-icon']}>
        <img src={params.icon} className={style['record-icon-svg']} />
      </div>
      <div className={style['record-text-box']}>
        <div className={style['record-label']}>{params.label}</div>
        <div className={style['record-value']}>{params.value}</div>
      </div>
    </div>
  );
}

function Aside(params: { fileInfo: AsideFace }) {
  function renderList() {
    const fileInfo = params.fileInfo;
    const keys = Object.keys(labelObject);
    return keys.map((key) => {
      if (typeof fileInfo[key] === 'string') {
        return <Record key={key} label={labelObject[key].label} icon={labelObject[key].icon} value={fileInfo[key]}/>;
      } else {
        const Resolution = fileInfo[key];
        const value = `${Resolution.width}X${Resolution.height}`;
        return <Record key={key} label={labelObject[key].label} icon={labelObject[key].icon} value={value} />;
      }
    });
  }

  return <div className={style['base']}>{renderList()}</div>;
}

export default Aside;
