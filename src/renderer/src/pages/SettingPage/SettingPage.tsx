import Button from "@renderer/components/Button/Button";
import style from "./Setting.module.css";
import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { useStore } from "@renderer/hook/useStores";
import useMessage from "@renderer/hook/useMessage";
// import FormItemString from "@renderer/components/Form/FormItemString";
import Form from "@renderer/components/Form/Form";
import InputNumber from "@renderer/components/InputNumber/InputNumber";
import CategoryButtonGroup from "./CategoryButtonGroup";

import Switch from "@renderer/components/Switch/Switch";

import type { ConfigFace } from "@renderer/store/store";

const FormItem = Form.Item;

function List(): React.JSX.Element {
  return (
    <div className={style.list}>
      <div>
        <span>自动保存</span>
      </div>
      <div>
        <span>按钮组</span>
      </div>
    </div>
  );
}

export default function SetingPage(): React.JSX.Element {
  const MessageAPI = useMessage();
  const navigate = useNavigate();
  const Store = useStore();

  const FormInstance = Form.useForm();
  const working = useRef(false);

  useEffect(() => {
    const StoreConfig = Store.config;
    FormInstance.setFieldsValue({
      delayAutoSave: StoreConfig.delayAutoSave,
      enableAutoSave: StoreConfig.enableAutoSave,
      "categoryButtonGroup.buttons": StoreConfig.categoryButtonGroup.buttons,
    });
  }, []);

  function handleBackPage() {
    if (working.current) return;
    working.current = true;
    backPage();
  }

  function backPage() {
    navigate(-1);
  }

  function saveConfig() {
    if (working.current) return;
    working.current = true;
    try {
      FormInstance.validateFields()
        .then((values) => {
          const newConfig: ConfigFace = {
            enableAutoSave: values.enableAutoSave,
            delayAutoSave: values.delayAutoSave,
            categoryButtonGroup: {
              buttons: values["categoryButtonGroup.buttons"]
            }
          };
          window.api.fs
            .saveConfig(newConfig)
            .then(() => {
              MessageAPI.success({ id: "saveConfig", message: "保存配置文件成功" });
              Store.setConfig(newConfig);
              backPage();
            })
            .catch(() => {
              MessageAPI.error({ id: "saveConfig", message: "保存配置文件失败" });
              working.current = false;
            });
        })
        .catch((errorInfo) => {
          console.log(`errorInfo:`, errorInfo);
        });
      // 将数据放入Mobx仓库
      // 尝试保存本地配置文件
    } catch (error) {}
  }

  return (
    <div className={style.base}>
      <div className={style.header}>
        <div>
          <h1>设置</h1>
        </div>
        <div>
          <Button onClick={handleBackPage} children="返回" />
          <Button type="primary" onClick={saveConfig} children="保存并返回" />
        </div>
      </div>
      <div className={style.body}>
        <List />
        <div className={style.main}>
          <Form form={FormInstance}>
            <div className={style.record}>
              <span className={style["record-title"]}>自动保存</span>
            </div>

            <div className={style.record}>
              <div className={style["record-label"]}>
                <span>自动保存</span>
              </div>
              <div className={style["record-description"]}>
                <span>是否延时进行自动保存</span>
              </div>
              <div>
                <FormItem name="enableAutoSave">
                  <Switch />
                </FormItem>
              </div>
            </div>
            <div className={style.record}>
              <div className={style["record-label"]}>
                <span>自动保存时间间隔</span>
              </div>
              <div className={style["record-description"]}>
                <span>
                  分类操作后，一定时间后自动保存(单位分钟{"\uff0c"}整数{"\uff1b"}最大为10
                  {"\uff0c"}最小为1)
                </span>
              </div>
              <div>
                <FormItem
                  name="delayAutoSave"
                  rules={[
                    {
                      type: "number",
                      required: true,
                      max: 10,
                      min: 1,
                      message: "需要范围1-10的数值。"
                    }
                  ]}
                >
                  <InputNumber precision={0} max={10} min={1} />
                </FormItem>
              </div>
            </div>

            <div className={style.record}>
              <span className={style["record-title"]}>按钮组</span>
            </div>

            <div className={style.record}>
              <div className={style["record-label"]}>
                <span>categoryButtonGroup:</span> <span>bottons</span>
              </div>
              <div className={style["record-description"]}>
                <span>按钮组</span>
              </div>
              <FormItem name="categoryButtonGroup.buttons">
                <CategoryButtonGroup />
              </FormItem>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
