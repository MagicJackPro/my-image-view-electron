import { useReducer, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Button from "@renderer/components/Button/Button";
import style from "./CategoryButtonGroup.module.css";
import Modal from "@renderer/components/Modal/Modal";
import Form from "@renderer/components/Form/Form";
import { RadioGroup } from "@renderer/components/Radio";
import Switch from "@renderer/components/Switch/Switch";
import Input from "@renderer/components/Input/Input";
import ShortcutKey from "./ShortcutKey";
import { Arrow, Add, Delete, InfoOutlined } from "@renderer/assets/icon/icon";

import type { CheckboxOptionType } from "@renderer/components/Radio";
import type { CategoryButtonGroupRecord } from "@renderer/store/store";

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
      //快捷键查重
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
      return (
        <div key={btn.key}>
          <div>
            <span>{index + 1}:</span>
            <span>{btn.label}</span>
          </div>
          <div>
            <span>{btn.folderName}</span>
          </div>
          <div>
            {Boolean(index) && (
              <Button
                shape="circle"
                icon={<Arrow style={{ transform: "rotate(180deg)", color: "#fff" }} />}
                onClick={() => moveBtn(index, "subtract")}
              />
            )}
            {index + 1 !== buttons.length && (
              <Button
                shape="circle"
                icon={<Arrow style={{ color: "#fff" }} />}
                onClick={() => moveBtn(index, "add")}
              />
            )}
            <Button shape="circle" icon={<Add />} />
            <Button
              shape="circle"
              icon={<Delete />}
              danger
              onClick={() => {
                deleteBtn(index);
              }}
            />
            <Button shape="circle" icon={<InfoOutlined />} onClick={infoClick} />
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

  const RadioOptions: CheckboxOptionType[] = [
    { label: "主要", value: "Mainly" },
    { label: "次要", value: "Secondary" }
  ];
  const disenabled = moduleConfig.mode === "preview";
  return (
    <div className={style["base"]}>
      <div className={style["cgb-main"]}>{renderListItem()}</div>
      <div className={style["cgb-aside"]}>
        <Button onClick={openAddModal}>添加按钮</Button>
        <Button>编辑按钮</Button>
      </div>
      <div className={style["preview"]}>
        <div className={style["preview-head"]}>
          <span>预览界面</span>
        </div>
        <RadioGroup optionType="button" block options={RadioOptions} />
        <div className={style["preview-body"]}>{renderBtns()}</div>
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

          <Form.Item name="calculateTheMagnification" label="计算放大倍率">
            <Switch label="启用" disabled={disenabled} />
          </Form.Item>

          <Form.Item name="shortcutKey" label="快捷键">
            <ShortcutKey disabled={disenabled} />
          </Form.Item>
          <div>
            <Button children="关闭" onClick={closeModal} />
            {moduleConfig.mode === "add" && <Button onClick={addBtn}>添加</Button>}
          </div>
        </Form>
      </Modal>
    </div>
  );
}
