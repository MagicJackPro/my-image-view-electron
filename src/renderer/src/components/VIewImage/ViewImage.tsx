import { useEffect, useState, useRef } from "react";
import style from "./ViewImage.module.css";
import Button from "../Button/Button";
import {
  FullWindow,
  Reduction,
  Enlargement,
  Reset,
  PictureIsCenter
} from "@renderer/assets/icon/icon";
import Select from "@renderer/components/Select/Select";
import Tooltip from "@renderer/components/Tooltip/Tooltip";
import { debounce } from "lodash";

import type { MouseEvent, TouchEvent, Touch, SyntheticEvent } from "react";

interface OptionFace {
  label: string;
  value: number;
}

interface ViewImageFace {
  src: string;
  resolution: { height: number; width: number };
  onChangeFullWindow: (fullWindowFlag: boolean) => void;
}

function updateImg(
  imgElement: HTMLImageElement | null,
  scale: number,
  translate: { x: number; y: number },
  angle: number
) {
  requestAnimationFrame(() => {
    if (imgElement === null) return;
    imgElement.style.transform =
      ` translate(${translate.x}px, ${translate.y}px)` +
      ` rotate(${angle}deg)` +
      ` scale(${scale / 100})`;
  });
}

const Options: OptionFace[] = [
  { label: "10%", value: 10 },
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
  { label: "125%", value: 125 },
  { label: "150%", value: 150 },
  { label: "175%", value: 175 },
  { label: "200%", value: 200 },
  { label: "300%", value: 300 },
  { label: "400%", value: 400 }
];

export default function ViewImage(params: ViewImageFace) {
  const { src, resolution, onChangeFullWindow } = params;

  const [imageScle, setImageScle] = useState({
    width: 0,
    height: 0,
    Percentage: 100,
    AdaptivePercentage: 100
  });
  const [fullWindowFlag, setFullWindow] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const mouseDown = useRef(false);
  /* 旋转角度 */
  const currentAngle = useRef(0);
  const translateRef = useRef({ x: 0, y: 0 });
  const movingPoint = useRef({ x: 0, y: 0 });
  const resizeRef = useRef<Function>(undefined);
  const Gesture = useRef<IGesture>(getDefaultGesture());
  const test = useRef<number>(NaN);

  useEffect(() => {
    function documentResize(init: boolean) {
      if (!src || !boxRef.current) return;

      const clientWidth = boxRef.current.clientWidth;
      const clientHeight = boxRef.current.clientHeight;
      const widthDifference = resolution.width > clientWidth ? resolution.width - clientWidth : 0;
      const heightDifference =
        resolution.height > clientHeight ? resolution.height - clientHeight : 0;

      let newPercentage = 100;
      if (widthDifference !== 0 || heightDifference !== 0) {
        // 计算比值
        newPercentage = Math.floor(
          heightDifference > widthDifference
            ? (clientHeight / resolution.height) * 100
            : (clientWidth / resolution.width) * 100
        );
      }
      setImageScle((state) => {
        let Temporary = state.Percentage;
        if (init || state.Percentage === state.AdaptivePercentage) {
          Temporary = newPercentage;
          translateRef.current = { x: 0, y: 0 };
          currentAngle.current = 0;

          updateImg(imgRef.current, newPercentage, translateRef.current, currentAngle.current);
        }
        return {
          width: resolution.width,
          height: resolution.height,
          Percentage: Temporary,
          AdaptivePercentage: newPercentage
        };
      });
    }

    documentResize(true);
    const listener = debounce(() => documentResize(false), 500);
    resizeRef.current = listener;
    window.addEventListener("resize", listener);

    return () => {
      resizeRef.current = undefined;
      window.removeEventListener("resize", listener);
    };
  }, [src]);

  function resetSize(value: OptionFace) {
    const newPercentage = value.value;
    setImageScle({
      width: resolution.width,
      height: resolution.height,
      Percentage: newPercentage,
      AdaptivePercentage: imageScle.AdaptivePercentage
    });

    updateImg(imgRef.current, newPercentage, translateRef.current, currentAngle.current);
  }

  //#region 触摸事件
  function handlerTouchStart(event: TouchEvent<HTMLImageElement>) {
    /** 当前激活触点 */
    const Touches = event.touches;
    if (Touches.length > 1) {
      const PointA = Touches[0];
      const PointB = Touches[1];

      const startDis = getDis(PointA, PointB);
      const startDeg = getDeg(PointA, PointB);
      const pagePointX = getMiddlePoint(PointA.pageX, PointB.pageX);
      const pagePointY = getMiddlePoint(PointA.pageY, PointB.pageY);
      Gesture.current = {
        enable: true,
        percentage: imageScle.Percentage,
        roateDeg: 0,
        startDeg,
        startDis,
        pagePoint: { x: pagePointX, y: pagePointY }
      };
      test.current = Math.abs(PointA.clientX - PointB.clientX) + Math.abs(PointA.clientY - PointB.clientY);
    } else {
      const changedTouchesFrist = Touches[0];
      Gesture.current = {
        enable: false,
        percentage: imageScle.Percentage,
        roateDeg: 0,
        startDeg: 0,
        startDis: 0,
        pagePoint: { x: changedTouchesFrist.clientX, y: changedTouchesFrist.clientY }
      };
    }
  }
  function handlerTouchMove(event: TouchEvent<HTMLImageElement>) {
    if (!imgRef.current) {
      return;
    }
    /** 当前激活触点 */
    const Touches = event.touches;
    if (Touches.length > 1) {
      
      const PointA = Touches[0];
      const PointB = Touches[1];
      
      // 缩放
      const { percentage, startDis } = Gesture.current;
      const nowDis = getDis(PointA, PointB);
      const Scale = Math.floor((nowDis / startDis) * percentage);
      // const { percentage} = Gesture.current;
      // const nowLength = Math.abs(PointA.clientX - PointB.clientX) + Math.abs(PointA.clientY - PointB.clientY);
      // const Scale = Math.floor((nowLength / test.current) * percentage);


      // 旋转
      const nowDeg = getDeg(PointA, PointB);

      // 拖动
      const pagePointX = getMiddlePoint(PointA.pageX, PointB.pageX);
      const pagePointY = getMiddlePoint(PointA.pageY, PointB.pageY);

      const PagePoint = Gesture.current.pagePoint;
      const xDifference = pagePointX - PagePoint.x;
      const yDifference = pagePointY - PagePoint.y;

      Gesture.current.pagePoint = { x: pagePointX, y: pagePointY };

      translateRef.current = {
        x: translateRef.current.x + xDifference,
        y: translateRef.current.y + yDifference
      };

      // 旋转处理
      const roateDeg = nowDeg - Gesture.current.startDeg;
      const Rotation = currentAngle.current + roateDeg;
      Gesture.current.roateDeg = roateDeg;

      updateImg(imgRef.current, Scale, translateRef.current, Rotation);

window.performance.mark('myComponent:render:end');
const p =window.performance.measure('myComponent:render:duration','myComponent:render:start','myComponent:render:end')
if(p.duration !== 0){
  console.log(`p: ${p.duration};Scale: ${Scale};`);

}
window.performance.clearMarks();
window.performance.clearMeasures();

      setImageScle((state) => {
        return { ...state, Percentage: Scale };
      });
    } else {
      const changedTouchesFrist = Touches[0];
      const PagePoint = Gesture.current.pagePoint;
      const xDifference = changedTouchesFrist.clientX - PagePoint.x;
      const yDifference = changedTouchesFrist.clientY - PagePoint.y;
      Gesture.current.pagePoint = {
        x: changedTouchesFrist.clientX,
        y: changedTouchesFrist.clientY
      };
      translateRef.current = {
        x: translateRef.current.x + xDifference,
        y: translateRef.current.y + yDifference
      };

      updateImg(imgRef.current, imageScle.Percentage, translateRef.current, currentAngle.current);
    }
  }

  function handlerTouchEnd(event: TouchEvent<HTMLImageElement>) {
    switch (event.touches.length) {
      case 0:
        Gesture.current = getDefaultGesture();
        break;
      case 1:
        currentAngle.current = currentAngle.current + Gesture.current.roateDeg;
        const { clientX, clientY } = event.touches[0];
        const { x, y } = Gesture.current.pagePoint;
        if (x == clientX && y === clientY) {
          break;
        }
        Gesture.current.pagePoint = {
          x: clientX,
          y: clientY
        };
        break;
      default:
    }
  }
  //#endregion

  //#region 鼠标事件
  function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    mouseDown.current = true;
    movingPoint.current = { x: event.clientX, y: event.clientY };
  }

  function handleMouseUp() {
    mouseDown.current = false;
  }

  function handleMouseOut() {
    mouseDown.current = false;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!mouseDown.current) return;
    event.preventDefault();
    const xDifference = event.clientX - movingPoint.current.x;
    const yDifference = event.clientY - movingPoint.current.y;

    movingPoint.current = { x: event.clientX, y: event.clientY };
    translateRef.current = {
      x: translateRef.current.x + xDifference,
      y: translateRef.current.y + yDifference
    };

    updateImg(imgRef.current, imageScle.Percentage, translateRef.current, currentAngle.current);
  }
  //#endregion

  function resetTranslate(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setImageScle((origin) => {
      return {
        ...origin,
        Percentage: origin.AdaptivePercentage
      };
    });
    currentAngle.current = 0;

    translateRef.current = { x: 0, y: 0 };
    updateImg(imgRef.current, imageScle.AdaptivePercentage, { x: 0, y: 0 }, currentAngle.current);
  }

  function thePictureIsCenter(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    translateRef.current = { x: 0, y: 0 };
    updateImg(imgRef.current, imageScle.AdaptivePercentage, { x: 0, y: 0 }, currentAngle.current);
  }

  /** 缩小 */
  function reductionPicture(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (Gesture.current.enable) {
      return;
    }
    const foundIndex = Options.findIndex((option) => option.value === imageScle.Percentage);
    if (foundIndex === -1) {
      const target = imageScle.Percentage;
      let index = 0;

      for (; index < Options.length; index++) {
        const element = Options[index];
        if (element.value > target && index !== 0) {
          return resetSize(Options[index - 1]);
        }
      }
      if (index >= Options.length) {
        return resetSize(Options[Options.length - 1]);
      }
    } else if (foundIndex > 0) {
      resetSize(Options[foundIndex - 1]);
    }
  }

  /** 放大 */
  function enlargementPicture(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (Gesture.current.enable) {
      return;
    }
    const foundIndex = Options.findIndex((option) => option.value === imageScle.Percentage);
    if (foundIndex === -1) {
      const target = imageScle.Percentage;
      for (let index = 0; index < Options.length; index++) {
        const element = Options[index];
        if (element.value > target) {
          return resetSize(Options[index]);
        }
      }
    } else if (foundIndex + 1 < Options.length) {
      resetSize(Options[foundIndex + 1]);
    }
  }

  /** 全屏 */
  function handleFullWindow(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (resizeRef.current) {
      resizeRef.current();
    }

    const newFullWindowFlag = !fullWindowFlag;
    setFullWindow(newFullWindowFlag);
    onChangeFullWindow(newFullWindowFlag);
  }

  const selectValue: OptionFace = {
    label: `${imageScle.Percentage}%`,
    value: imageScle.Percentage
  };

  function imgError(error: SyntheticEvent<HTMLImageElement>) {
    window.api.log.error({ message: { "zh-cn": "img标签加载图片失败" }, error });
  }

  return (
    <div
      ref={boxRef}
      className={style["image-box"]}
      onTouchEnd={handlerTouchEnd}
      onTouchStart={handlerTouchStart}
      onTouchMove={handlerTouchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseOut={handleMouseOut}
      onMouseUp={handleMouseUp}
    >
      {src ? (
        <img
          ref={imgRef}
          className={style["img"]}
          draggable={false}
          src={src}
          width={resolution.width}
          height={resolution.height}
          onError={imgError}
          decoding="async"
        />
      ) : (
        <p>
          <span>loading</span>
        </p>
      )}
      <div className={style["floating-window"]}>
        <Tooltip title="放大">
          <Button icon={<Enlargement />} shape="circle" onClick={enlargementPicture} />
        </Tooltip>
        <Select<OptionFace>
          value={selectValue}
          placement="topRight"
          options={Options}
          onChange={resetSize}
        />
        <Tooltip title="缩小">
          <Button icon={<Reduction />} shape="circle" onClick={reductionPicture} />
        </Tooltip>
        <Tooltip title="重置">
          <Button icon={<Reset />} shape="circle" onClick={resetTranslate} />
        </Tooltip>
        <Tooltip title="居中">
          <Button icon={<PictureIsCenter />} shape="circle" onClick={thePictureIsCenter} />
        </Tooltip>
        <Tooltip title="展开">
          <Button icon={<FullWindow />} shape="circle" onClick={handleFullWindow} />
        </Tooltip>
      </div>
    </div>
  );
}

interface IGesture {
  enable: boolean;
  /** 起始缩放数值 */
  percentage: number;
  /** 起始线段长度 */
  startDis: number;
  /** 起始角度 */
  startDeg: number;
  /** 旋转中角度 */
  roateDeg: number;
  /** 触摸中心点 */
  pagePoint: { x: number; y: number };
}

function getDefaultGesture(): IGesture {
  return {
    enable: false,
    percentage: 0,
    startDis: 0,
    startDeg: 0,
    roateDeg: 0,
    pagePoint: { x: 0, y: 0 }
  };
}

/** 求两点线段长度
 * 使用勾股定理
 */
function getDis(point: Touch, point2: Touch) {
  const x = point2.pageX - point.pageX;
  const y = point2.pageY - point.pageY;
  return Math.sqrt(x * x + y * y);
}
function getDeg(point: Touch, point2: Touch) {
  const x = point2.pageX - point.pageX;
  const y = point2.pageY - point.pageY;
  return Math.atan2(y, x) * (180 / Math.PI);
}

function getMiddlePoint(numberA, numberB) {
  let Max = 0;
  let Min = 0;
  if (numberA === numberB) {
    return numberA;
  } else if (numberA > numberB) {
    Max = numberA;
    Min = numberB;
  } else {
    Max = numberB;
    Min = numberA;
  }
  return (Max - Min) / 2 + Min;
}
