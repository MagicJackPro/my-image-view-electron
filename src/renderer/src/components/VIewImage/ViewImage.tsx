import { useEffect, useState, useMemo, useRef } from "react";
import type { MouseEvent, TouchEvent } from "react";
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

interface OptionFace {
  label: string;
  value: number;
}

interface ViewImageFace {
  src: string;
  resolution: { height: number; width: number };
  onChangeFullWindow: (fullWindowFlag: boolean) => void;
}

function translateImageStyle(
  scale: number,
  translate: { x: number; y: number },
  grab: boolean,
  resolution: { width: number; height: number }
) {
  const finalResolution = { width: "0", height: "0" };
  if (scale === 100) {
    finalResolution.width = resolution.width.toString();
    finalResolution.height = resolution.height.toString();
  } else {
    finalResolution.width = ((resolution.width * scale) / 100).toFixed(2);
    finalResolution.height = ((resolution.height * scale) / 100).toFixed(2);
  }

  return (
    (grab ? "cursor: grab;" : "") +
    `transform: translate(${translate.x}px, ${translate.y}px);` +
    `width: ${finalResolution.width}px;height: ${finalResolution.height}px;`
  );
}

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
  const canMove = useRef(false);
  const lastMouseMovePoint = useRef({ x: 0, y: 0 });
  const translateRef = useRef({ x: 0, y: 0 });

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
          if (imgRef.current) {
            translateRef.current = { x: 0, y: 0 };
            canMove.current = false;
            imgRef.current.style = translateImageStyle(
              newPercentage,
              translateRef.current,
              false,
              resolution
            );
          }
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

    window.addEventListener("resize", listener);

    return () => {
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

    if (imgRef.current) {
      canMove.current = newPercentage > imageScle.AdaptivePercentage;
      if (!canMove.current) {
        translateRef.current = { x: 0, y: 0 };
      }
      imgRef.current.style = translateImageStyle(
        newPercentage,
        translateRef.current,
        canMove.current,
        resolution
      );
    }
  }

  function handlerTouchStart(event: TouchEvent<HTMLImageElement>) {
    const changedTouchesFrist = event.changedTouches[0];
    mouseDown.current = true;
    lastMouseMovePoint.current = { x: changedTouchesFrist.clientX, y: changedTouchesFrist.clientY };
  }

  function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    mouseDown.current = true;
    lastMouseMovePoint.current = { x: event.clientX, y: event.clientY };
  }

  function handlerTouchEnd() {
    mouseDown.current = false;
  }

  function handleMouseUp() {
    mouseDown.current = false;
  }

  function handleMouseOut() {
    mouseDown.current = false;
  }

  function handlerTouchMove(event: TouchEvent<HTMLImageElement>) {
    const changedTouchesFrist = event.changedTouches[0];
    if (mouseDown.current && canMove.current && imgRef.current) {
      const xDifference = changedTouchesFrist.clientX - lastMouseMovePoint.current.x;
      const yDifference = changedTouchesFrist.clientY - lastMouseMovePoint.current.y;
      lastMouseMovePoint.current = {
        x: changedTouchesFrist.clientX,
        y: changedTouchesFrist.clientY
      };
      translateRef.current = {
        x: translateRef.current.x + xDifference,
        y: translateRef.current.y + yDifference
      };
      canMove.current = imageScle.Percentage > imageScle.AdaptivePercentage;
      imgRef.current.style = translateImageStyle(
        imageScle.Percentage,
        translateRef.current,
        canMove.current,
        resolution
      );
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (mouseDown.current && canMove.current && imgRef.current) {
      const xDifference = event.clientX - lastMouseMovePoint.current.x;
      const yDifference = event.clientY - lastMouseMovePoint.current.y;
      lastMouseMovePoint.current = { x: event.clientX, y: event.clientY };
      translateRef.current = {
        x: translateRef.current.x + xDifference,
        y: translateRef.current.y + yDifference
      };
      canMove.current = imageScle.Percentage > imageScle.AdaptivePercentage;
      imgRef.current.style = translateImageStyle(
        imageScle.Percentage,
        translateRef.current,
        canMove.current,
        resolution
      );
    }
  }

  function resetTranslate() {
    setImageScle((origin) => {
      return {
        ...origin,
        Percentage: origin.AdaptivePercentage
      };
    });

    if (imgRef.current) {
      translateRef.current = { x: 0, y: 0 };
      imgRef.current.style = translateImageStyle(
        imageScle.AdaptivePercentage,
        { x: 0, y: 0 },
        canMove.current,
        resolution
      );
    }
  }

  function thePictureIsCenter() {
    if (imgRef.current) {
      translateRef.current = { x: 0, y: 0 };
      imgRef.current.style = translateImageStyle(
        imageScle.Percentage,
        { x: 0, y: 0 },
        canMove.current,
        resolution
      );
    }
  }

  const Options: OptionFace[] = useMemo(() => {
    const defaultOptions: OptionFace[] = [
      { label: "10%", value: 10 },
      { label: "25%", value: 25 },
      { label: "50%", value: 50 },
      { label: "75%", value: 75 },
      { label: "100%", value: 100 },
      { label: "125%", value: 125 },
      { label: "175%", value: 175 },
      { label: "200%", value: 200 },
      { label: "300%", value: 300 },
      { label: "400%", value: 400 }
    ];
    const tempValue = imageScle.AdaptivePercentage;

    let isNeedInserted = true;
    let index = 0;
    for (; index < defaultOptions.length; index++) {
      if (defaultOptions[index].value === tempValue) {
        isNeedInserted = false;
        break;
      }
      if (defaultOptions[index].value > tempValue) {
        break;
      }
    }

    if (isNeedInserted) {
      defaultOptions.splice(index, 0, {
        label: `${imageScle.AdaptivePercentage}%`,
        value: imageScle.AdaptivePercentage
      });
    }
    return defaultOptions;
  }, [imageScle.AdaptivePercentage]);

  /** 缩小 */
  function reductionPicture() {
    const foundIndex = Options.findIndex((option) => option.value === imageScle.Percentage);
    if (foundIndex > 0) {
      resetSize(Options[foundIndex - 1]);
    }
  }

  /** 放大 */
  function enlargementPicture() {
    const foundIndex = Options.findIndex((option) => option.value === imageScle.Percentage);
    if (foundIndex === -1 || foundIndex + 1 === Options.length) return;
    const tempVal = Options[foundIndex].value;
    for (let index = foundIndex + 1; index < Options.length; index++) {
      if (tempVal < Options[index].value) {
        resetSize(Options[index]);
        break;
      }
    }
  }

  /** 全屏 */
  function handleFullWindow() {
    // window.api.dialog.SecondaryConfirmation({ message: "开发中" });
    const newFullWindowFlag = !fullWindowFlag;
    setFullWindow(newFullWindowFlag);
    onChangeFullWindow(newFullWindowFlag);
  }

  return (
    <div ref={boxRef} className={style["image-box"]}>
      {src ? (
        <img
          ref={imgRef}
          className={style["img"]}
          draggable={false}
          onTouchEnd={handlerTouchEnd}
          onTouchStart={handlerTouchStart}
          onTouchMove={handlerTouchMove}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
          onMouseUp={handleMouseUp}
          src={src}
          // onLoad={()=>{console.log("<img> onload");}}
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
          value={imageScle.Percentage}
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
