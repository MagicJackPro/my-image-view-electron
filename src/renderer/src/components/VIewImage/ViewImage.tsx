import { useEffect, createRef, useState, useMemo, useRef } from "react";
import type { MouseEvent } from "react";
import style from "./ViewImage.module.css";
import Button from "../Button/Button";
import { FullWindow, Reduction, Enlargement, Reset } from "@renderer/assets/icon/icon";
import Select from "@renderer/components/Select/Select";
import type { OptionFace } from "@renderer/components/Select/Select";

interface ViewImageFace {
  src: string;
  resolution: { height: number; width: number };
}

function translateImageStyle(scale: number, translate: { x: number; y: number }, grab: boolean) {
  return (
    (grab ? "cursor: grab;" : "") +
    `transform: scale(${scale / 100}) translate(${translate.x}px, ${translate.y}px);`
  );
}

export default function ViewImage(params: ViewImageFace) {
  const { src, resolution } = params;

  const [imageScle, setImageScle] = useState({
    width: 0,
    height: 0,
    Percentage: 100,
    AdaptivePercentage: 100
  });

  const boxRef = createRef<HTMLDivElement>();
  const imgRef = createRef<HTMLImageElement>();
  const mouseDown = useRef(false);
  const canMove = useRef(false);
  const lastMouseMovePoint = useRef({ x: 0, y: 0 });
  const translateRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (src && boxRef.current) {
      const clientWidth = boxRef.current.clientWidth;
      const clientHeight = boxRef.current.clientHeight;
      const widthDifference = resolution.width > clientWidth ? resolution.width - clientWidth : 0;
      const heightDifference =
        resolution.height > clientHeight ? resolution.height - clientHeight : 0;

      if (widthDifference === 0 && heightDifference === 0) {
        setImageScle({
          width: resolution.width,
          height: resolution.height,
          Percentage: 100,
          AdaptivePercentage: 100
        });
      } else {
        // 计算比值
        const Percentage = Math.floor(
          heightDifference > widthDifference
            ? (clientHeight / resolution.height) * 100
            : (clientWidth / resolution.width) * 100
        );
        if (heightDifference > widthDifference) {
        }
        setImageScle({
          // width: (resolution.width * Percentage) / 100,
          // height: (resolution.height * Percentage) / 100,
          width: resolution.width,
          height: resolution.height,
          Percentage: Percentage,
          AdaptivePercentage: Percentage
        });

        if (imgRef.current) {
          translateRef.current = { x: 0, y: 0 };
          canMove.current = false;
          imgRef.current.style = translateImageStyle(Percentage, translateRef.current, false);
        }
      }
    }
  }, [src]);

  function resetSize(value: OptionFace) {
    const newPercentage = value.value as number;
    setImageScle({
      // width: (resolution.width * newPercentage) / 100,
      // height: (resolution.height * newPercentage) / 100,
      width: resolution.width,
      height: resolution.height,
      Percentage: newPercentage,
      AdaptivePercentage: imageScle.AdaptivePercentage
    });

    if (imgRef.current) {
      translateRef.current = { x: 0, y: 0 };
      canMove.current = newPercentage > imageScle.AdaptivePercentage;
      imgRef.current.style = translateImageStyle(
        newPercentage,
        translateRef.current,
        canMove.current
      );
    }
  }

  function handleMouseDown(event: MouseEvent) {
    event.preventDefault();
    mouseDown.current = true;
    lastMouseMovePoint.current = { x: event.clientX, y: event.clientY };
  }

  function handleMouseUp() {
    mouseDown.current = false;
  }

  function handleMouseOut() {
    mouseDown.current = false;
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
        canMove.current
      );
    }
  }

  function resetTranslate() {
     if (imgRef.current) {
          translateRef.current = { x: 0, y: 0 };
          imgRef.current.style = translateImageStyle(imageScle.Percentage, {x:0,y:0}, canMove.current);
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

    if (defaultOptions.findIndex((option) => option.value === tempValue) === -1) {
      return (
        [
          { label: `${imageScle.AdaptivePercentage}%`, value: imageScle.AdaptivePercentage }
        ] as OptionFace[]
      ).concat(defaultOptions);
    }
    return defaultOptions;
  }, [imageScle.AdaptivePercentage]);

  if (src) {
    return (
      <div ref={boxRef} className={style["image-box"]}>
        <img
          ref={imgRef}
          className={style["img"]}
          draggable={false}
          height={imageScle.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseOut={handleMouseOut}
          onMouseUp={handleMouseUp}
          src={src}
          width={imageScle.width}
        />
        <div className={style["floating-window"]}>
          <Button type="dark" icon={<Enlargement />} shape="circle" />
          <Select
            defaultValue={imageScle.AdaptivePercentage}
            placement="topRight"
            options={Options}
            onChange={resetSize}
          />
          <Button type="dark" icon={<Reduction />} shape="circle" />

          <Button type="dark" icon={<Reset />} shape="circle" onClick={resetTranslate} />

          <Button type="dark" icon={<FullWindow />} shape="circle" />
        </div>
      </div>
    );
  }
  return (
    <div ref={boxRef} className={style["image-box"]}>
      <p>loading</p>
    </div>
  );
}
