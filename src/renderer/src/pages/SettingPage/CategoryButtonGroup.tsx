import { useReducer, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Button from "@renderer/components/Button/Button";
import style from "./CategoryButtonGroup.module.css";
import Modal from "@renderer/components/Modal/Modal";
import Form from "@renderer/components/Form/Form";
import Switch from "@renderer/components/Switch/Switch";
import Input from "@renderer/components/Input/Input";
import ShortcutKey from "./ShortcutKey";
import Tooltip from "@renderer/components/Tooltip/Tooltip";
import { Arrow, Add, Delete, InfoOutlined, Edit } from "@renderer/assets/icon/icon";
import type { CategoryButtonGroupRecord } from "@renderer/store/store";
import Pagination, { type PaginationFace } from "@renderer/components/Pagination/Pagination";
import useMessage from "@renderer/hook/useMessage";

interface PropsFace {
  defaultValue?: CategoryButtonGroupRecord[];
  value?: CategoryButtonGroupRecord[];
  onChange?: (newValue: CategoryButtonGroupRecord[]) => void;
}
type ActionType = "add" | "modify" | "preview" | "close";

interface ModuleConfigFace {
  mode: null | "add" | "modify" | "preview";
  visible: boolean;
}
function reducer(_state: any, action: ActionType): ModuleConfigFace {
  switch (action) {
    case "add":
      return { visible: true, mode: "add" };
    case "modify":
      return { visible: true, mode: "modify" };
    case "preview":
      return { visible: true, mode: "preview" };
    default:
      return { visible: false, mode: null };
  }
}

function createNewBtn(): CategoryButtonGroupRecord {
  return {
    aspectRatioClassification: false,
    calculateTheMagnification: false,
    IsClassified: true,
    folderName: "",
    key: "",
    label: ""
  };
}

export default function CategoryButtonGroup(props: PropsFace) {
  const [btns, setBtns] = useState<CategoryButtonGroupRecord[]>(props.defaultValue || []);
  const [moduleConfig, dispatch] = useReducer<ModuleConfigFace, [action: ActionType]>(reducer, {
    visible: false,
    mode: null
  });
  const [paginationConfig, setPaginationConfig] = useState({
    pageSize: 0,
    current: 1,
    total: btns.length
  });

  const MessageAPI = useMessage();
  const FormInstance = Form.useForm();

  const buttons = props.value || btns;

  async function addBtn() {
    // 检查信息
    try {
      const result = await FormInstance.validateFields();
      function generateKey() {
        for (let index = 0; index < 4; index++) {
          const key = uuidv4();
          if (buttons.findIndex((element) => element.key === key) === -1) {
            return key;
          }
        }
        throw new Error("The generation of a unique identifier failed.");
      }
      const newBtn = createNewBtn();
      //生成uuid 查重
      newBtn.key = generateKey();
      newBtn.label = result.label;
      newBtn.folderName = result.folderName;
      newBtn.aspectRatioClassification = result.aspectRatioClassification;
      newBtn.calculateTheMagnification = result.calculateTheMagnification;
      //TODO 快捷键查重
      // 添加
      const newBtns: CategoryButtonGroupRecord[] = buttons.concat([newBtn]);
      if (props.onChange) {
        props.onChange(newBtns);
      } else {
        setBtns(newBtns);
      }
      closeModal();
    } catch (error) {}
  }

  async function modifyBtn() {
    // 检查信息
    try {
      const result = await FormInstance.validateFields();
      const newBtn = createNewBtn();
      const key = FormInstance.getFieldValue("key");
      newBtn.key = key;
      newBtn.label = result.label;
      newBtn.folderName = result.folderName;
      newBtn.aspectRatioClassification = result.aspectRatioClassification;
      newBtn.calculateTheMagnification = result.calculateTheMagnification;
      newBtn.IsClassified = result.IsClassified;
      //TODO快捷键查重

      const FindexIndex = buttons.findIndex((item) => item.key === key);
      if (FindexIndex === -1) {
        window.api.log.error({
          message: { "zh-cn": "查找按钮修改位置失败" },
          path: "src/renderer/src/pages/SettingPage/CategoryButtonGroup.tsx",
          function: "CategoryButtonGroup>,modifyBtn",
          data: { key, buttons: JSON.stringify(buttons) }
        });
        MessageAPI.error({
          message: "修改按钮配置失败！",
          id: "CategoryButtonGroup>modifyBtn>findIndex"
        });
        closeModal();
        return;
      }
      const newBtns: CategoryButtonGroupRecord[] = Array.from(buttons);

      newBtns.splice(FindexIndex, 1, newBtn);
      if (props.onChange) {
        props.onChange(newBtns);
      } else {
        setBtns(newBtns);
      }

      MessageAPI.success({ message: "修改按钮配置成功！", id: "CategoryButtonGroup/modifyBtn" });
      closeModal();
    } catch (error) {}
  }

  function moveBtn(index: number, action: "add" | "subtract") {
    const isAdd = action === "add";
    if (index === 0 && !isAdd) return;
    if (index + 1 >= buttons.length && isAdd) return;
    const newMoveBtns: CategoryButtonGroupRecord[] = [];
    const endIndex = isAdd ? index : index - 1;
    const startIndex = isAdd ? index + 2 : index + 1;
    for (let x = 0; x < endIndex; x++) {
      newMoveBtns.push(buttons[x]);
    }
    if (isAdd) {
      newMoveBtns.push(buttons[index + 1]);
      newMoveBtns.push(buttons[index]);
    } else {
      newMoveBtns.push(buttons[index]);
      newMoveBtns.push(buttons[index - 1]);
    }
    for (let x = startIndex; x < buttons.length; x++) {
      newMoveBtns.push(buttons[x]);
    }

    if (props.onChange) {
      props.onChange(newMoveBtns);
    } else {
      setBtns(newMoveBtns);
    }
  }

  function deleteBtn(index: number) {
    const newBtns = buttons.filter((_value, x) => {
      return x !== index;
    });
    if (props.onChange) {
      props.onChange(newBtns);
    } else {
      setBtns(newBtns);
    }
  }

  function renderListItem() {
    return buttons.map((btn, index) => {
      const infoClick = () => {
        FormInstance.setFieldsValue(btn);
        dispatch("preview");
      };
      function modifyClick() {
        FormInstance.setFieldsValue(btn);
        dispatch("modify");
      }
      return (
        <div key={btn.key}>
          <div>
            <span>{index + 1}.&nbsp;</span>
            <span>{btn.label}</span>
          </div>
          <div>
            <span>{btn.folderName}</span>
          </div>
          <div className={style["edit-block-btns"]}>
            {Boolean(index) && (
              <Tooltip title="上移">
                <Button
                  shape="circle"
                  icon={<Arrow style={{ transform: "rotate(180deg)", color: "#fff" }} />}
                  onClick={() => moveBtn(index, "subtract")}
                />
              </Tooltip>
            )}
            {index + 1 !== buttons.length && (
              <Tooltip title="下移">
                <Button
                  shape="circle"
                  icon={<Arrow style={{ color: "#fff" }} />}
                  onClick={() => moveBtn(index, "add")}
                />
              </Tooltip>
            )}
            <Tooltip title="添加">
              <Button shape="circle" icon={<Add />} />
            </Tooltip>
            <Tooltip title="删除">
              <Button
                shape="circle"
                icon={<Delete style={{ fill: "red" }} />}
                danger
                onClick={() => {
                  deleteBtn(index);
                }}
              />
            </Tooltip>
            <Tooltip title="编辑">
              <Button shape="circle" icon={<Edit />} onClick={modifyClick} />
            </Tooltip>
            <Tooltip title="详细信息">
              <Button shape="circle" icon={<InfoOutlined />} onClick={infoClick} />
            </Tooltip>
          </div>
        </div>
      );
    });
  }

  function renderBtns() {
    return buttons.map((btn) => {
      return (
        <Button key={btn.key}>
          <span>{btn.label}</span>
          <span>{btn.shortcutKey?.shortcutKeyAlias}</span>
        </Button>
      );
    });
  }

  function openAddModal() {
    FormInstance.setFieldsValue(createNewBtn());
    dispatch("add");
  }

  function closeModal() {
    dispatch("close");
  }

  function PaginationChange(paginationData: PaginationFace) {
    const newPaginationConfig = Object.assign({}, paginationConfig, {
      current: paginationData.pageNumber
    });
    setPaginationConfig(newPaginationConfig);
  }

  const disenabled = moduleConfig.mode === "preview";

  return (
    <div className={style["base"]}>
      <div className={style["cgb-main"]}>{renderListItem()}</div>
      <div className={style["cgb-aside"]}>
        <Button onClick={openAddModal}>添加按钮</Button>
      </div>
      <div className={style["preview"]}>
        <div className={style["preview-head"]}>
          <span>预览界面</span>
        </div>
        <div className={style["preview-body"]}>{renderBtns()}</div>
        <Pagination
          className={style["pagination"]}
          total={paginationConfig.total}
          pageSize={paginationConfig.pageSize}
          current={paginationConfig.current}
          onChange={PaginationChange}
        />
      </div>
      <Modal visible={moduleConfig.visible}>
        <Form form={FormInstance}>
          <Form.Item
            name="label"
            label="名称"
            rules={[
              {
                type: "string",
                required: true
              }
            ]}
          >
            <Input disabled={disenabled} />
          </Form.Item>

          <Form.Item
            name="folderName"
            label="目标目录"
            rules={[
              {
                type: "string",
                required: true
              }
            ]}
          >
            <Input disabled={disenabled} />
          </Form.Item>

          <Form.Item name="aspectRatioClassification" label="长宽比分类">
            <Switch label="启用" disabled={disenabled} />
          </Form.Item>

          <Form.Item name="IsClassified" label="是否分类">
            <Switch label="启用" disabled={disenabled} />
          </Form.Item>

          <Form.Item name="calculateTheMagnification" label="计算放大倍率">
            <Switch label="启用" disabled={disenabled} />
          </Form.Item>

          <Form.Item name="shortcutKey" label="快捷键">
            <ShortcutKey disabled={disenabled} />
          </Form.Item>
          <div>
            <Button children="关闭" onClick={closeModal} />
            {moduleConfig.mode === "add" && <Button onClick={addBtn}>添加</Button>}
            {moduleConfig.mode === "modify" && <Button onClick={modifyBtn}>修改</Button>}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
