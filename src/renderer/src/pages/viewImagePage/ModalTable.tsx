import { useState, useEffect } from "react";

import style from "./ModalTable.module.css";
import Button from "@renderer/components/Button/Button";
import Modal from "@renderer/components/Modal/Modal";

export interface Record {
  id: number;
  /** 文件名 */
  name: string;
  /** 处理方式 */
  processingMethod: string;
  /** 输出目录名称 */
  outputDirName: string[];
}

interface CurrentRecord extends Record {
  src: string;
}

interface PaginationFace {
  /** 总数 */
  count: number;
  /** 页码 */
  pageNumber: number;
  /** 总页数 */
  pageNumberCount: number;
  /** 每页条数 */
  pageSize: number;
}

interface ModalTableFace {
  visible: boolean;
  onCancel: () => void;
  listData: Record[];
  dirPath: string;
}

export default function ModalTable(params: ModalTableFace) {
  const { visible, onCancel, listData, dirPath } = params;

  const [pagination, setPagination] = useState<PaginationFace>({
    pageNumber: 1,
    pageSize: 4,
    count: 0,
    pageNumberCount: 1
  });

  const [currentList, setCurrentList] = useState<CurrentRecord[]>([]);

  useEffect(() => {
    const newPagination: PaginationFace = {
      count: listData.length,
      pageNumber: 0,
      pageNumberCount: 0,
      pageSize: pagination.pageSize
    };
    newPagination.pageNumberCount = Math.ceil(newPagination.count / newPagination.pageSize);
    newPagination.pageNumber = newPagination.pageNumberCount;
    setPagination(newPagination);
  }, [listData]);

  useEffect(() => {
    const start = (pagination.pageNumber - 1) * pagination.pageSize;

    const arr = listData.slice(start, start + 4).map((record) => {
      window.api.fs.readPicture(`${dirPath}\\${record.name}`).then((result) => {
        setCurrentList((origin) => {
          const targetName = record.name;
          const foundIndex = origin.findIndex((val) => val.name === targetName);
          if (foundIndex === -1) return origin;
          const newRecord = {
            ...record,
            src: URL.createObjectURL(new Blob([result.buffer], { type: result.type.mime }))
          };
          return [...origin.slice(0, foundIndex), newRecord, ...origin.slice(foundIndex + 1)];
        });
      });

      return { ...record, src: "" };
    });
    setCurrentList(arr);

    return () => {
      currentList.forEach((record) => {
        if (record.src) {
          URL.revokeObjectURL(record.src);
        }
      });
    };
  }, [pagination, listData]);

  function renderList() {
    // 创建异步读取图片渲染缩略图
    return currentList.map((value, index) => {
      return (
        <tr key={index}>
          <td>{value.id + 1}</td>
          <td>
            {value.src ? (
              <img className={style["img"]} draggable={false} src={value.src} />
            ) : (
              <span>加载中</span>
            )}
          </td>
          <td>
            <p>{value.name}</p>
          </td>
          <td>
            <p>{value.processingMethod}</p>
            <p>{value.outputDirName.join("\\")}</p>
          </td>
        </tr>
      );
    });
  }

  function lastTablePage() {
    if (pagination.pageNumber > 1) {
      const newPagination: PaginationFace = {
        count: pagination.count,
        pageNumber: pagination.pageNumber - 1,
        pageNumberCount: pagination.pageNumberCount,
        pageSize: pagination.pageSize
      };
      setPagination(newPagination);
    }
  }
  function nextTablePage() {
    const newPageNumber = pagination.pageNumber + 1;
    if (pagination.pageNumberCount >= newPageNumber) {
      const newPagination: PaginationFace = {
        count: pagination.count,
        pageNumber: newPageNumber,
        pageNumberCount: pagination.pageNumberCount,
        pageSize: pagination.pageSize
      };
      setPagination(newPagination);
    }
  }

  function toPageNumber() {
    const HTMLelement = document.getElementById("tablePageNumber");
    if (HTMLelement && HTMLelement.tagName === "INPUT") {
      const inputNumber = HTMLelement as HTMLInputElement;
      const str = inputNumber.value;
      const unsafeINT = Number.parseInt(str);
      if (
        Number.isSafeInteger(unsafeINT) &&
        unsafeINT > 0 &&
        unsafeINT <= pagination.pageNumberCount
      ) {
        inputNumber.value = "";
        const newPagination: PaginationFace = {
          count: pagination.count,
          pageNumber: unsafeINT,
          pageNumberCount: pagination.pageNumberCount,
          pageSize: pagination.pageSize
        };
        setPagination(newPagination);
      } else {
        window.api.dialog.SecondaryConfirmation({ message: "请输入正确页码" });
      }
    } else {
      window.api.dialog.SecondaryConfirmation({ message: "not found" });
    }
  }
  return (
    <Modal visible={visible} onCancel={onCancel}>
      <div className={style["modal-body"]}>
        <div className={style["modal-title"]}>
          <h1>整理列表</h1>
          <Button onClick={onCancel}>关闭</Button>
        </div>
        {/* table head */}
        <table className={style["table"]}>
          <thead className={style["table-thead"]}>
            <tr>
              <th>
                <span>序号</span>
              </th>
              <th>
                <span>缩略图</span>
              </th>
              <th>
                <span>文件名</span>
              </th>
              <th>
                <span>处理方式</span>
              </th>
            </tr>
          </thead>
          <tbody>{renderList()}</tbody>
        </table>
        <div className={style["pagination"]}>
          <span>{`${pagination.pageNumber}/${pagination.pageNumberCount}`}</span>
          <Button onClick={lastTablePage}>上一页</Button>
          <Button onClick={nextTablePage}>下一页</Button>
          <input
            autoComplete="off"
            className={style["input-number"]}
            id="tablePageNumber"
            max={pagination.pageNumberCount}
            min={1}
            type="number"
          />
          <Button onClick={toPageNumber}>跳转</Button>
        </div>
      </div>
    </Modal>
  );
}
