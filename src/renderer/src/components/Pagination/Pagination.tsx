import ClassNames from "./Pagination.module.css";
import { useState } from "react";
import type { CSSProperties } from "react";
import Button from "@renderer/components/Button/Button";

export interface PaginationFace {
  /** 总数 */
  total: number;
  /** 页码 */
  pageNumber: number;
  /** 总页数 */
  pageNumberTotal: number;
  /** 每页条数 */
  pageSize: number;
}

interface IPrameters {
  /** 当前页数 */
  current?: number;
  /** 数据总数 */
  total: number;
  /** 每页条数 */
  pageSize?: number;
  /** TODO 只有一页时是否隐藏分页器 */
  hideOnSinglePage?: boolean;
  className?: string;
  style?: CSSProperties;
  onChange?: (PaginationData: PaginationFace) => void;
}

function VerificationNumber(unSafeVariable: any, safeInteger: number): number {
  if (Number.isSafeInteger(unSafeVariable)) {
    return unSafeVariable as number;
  } else {
    return safeInteger;
  }
}

export default function Pagination(parameters: IPrameters) {
  const {
    current,
    pageSize,
    total,
    hideOnSinglePage = false,
    className,
    style,
    onChange
  } = parameters;
  const [pagination, setPagination] = useState<PaginationFace>({
    pageNumber: 1,
    pageSize: 4,
    total: 0,
    pageNumberTotal: 1
  });

  const finalPagination: PaginationFace = {
    pageNumber: VerificationNumber(current, pagination.pageNumber),
    pageSize: VerificationNumber(pageSize, pagination.pageSize),
    total: VerificationNumber(total, pagination.total),
    pageNumberTotal: 0
  };
  finalPagination.pageNumberTotal =
    finalPagination.total === 0 || finalPagination.pageSize === 0
      ? 1
      : Math.ceil(finalPagination.total / finalPagination.pageSize);

  function handleChange(pagination: PaginationFace) {
    setPagination(pagination);
    if (onChange) {
      onChange(pagination);
    }
  }

  function lastTablePage() {
    const newPageNumber = finalPagination.pageNumber - 1;
    if (finalPagination.pageNumber > 1) {
      const newPagination: PaginationFace = {
        total: finalPagination.total,
        pageNumber: newPageNumber,
        pageNumberTotal: finalPagination.pageNumberTotal,
        pageSize: finalPagination.pageSize
      };
      handleChange(newPagination);
    }
  }
  function nextTablePage() {
    const newPageNumber = finalPagination.pageNumber + 1;
    if (finalPagination.pageNumberTotal >= newPageNumber) {
      const newPagination: PaginationFace = {
        total: finalPagination.total,
        pageNumber: newPageNumber,
        pageNumberTotal: finalPagination.pageNumberTotal,
        pageSize: finalPagination.pageSize
      };
      handleChange(newPagination);
    }
  }

  if (hideOnSinglePage && finalPagination.pageNumberTotal === 1) {
    return null;
  }
  const finalClassName =
    ClassNames["pagination-base"] + " " + (typeof className === "string" ? className : "");
  return (
    <div className={finalClassName} style={style}>
      <Button onClick={lastTablePage}>上一页</Button>
      <span>{`${finalPagination.pageNumber}/${finalPagination.pageNumberTotal}`}</span>
      <Button onClick={nextTablePage}>下一页</Button>
    </div>
  );
}
