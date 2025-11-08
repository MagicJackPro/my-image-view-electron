import {
  useContext,
  useRef,
  cloneElement,
  createContext,
  useReducer,
  useLayoutEffect,
  useState
} from "react";
import type { ReactNode } from "react";

// type TriggerType = "onChange" | "onBlur";

interface ErrorObject {
  name: string;
  message: string;
}

interface RuleConfig {
  /** string 类型时为字符串长度；number 类型时为确定数字； array 类型时为数组长度 */
  len?: number;
  /** 必须设置 type：string 类型为字符串最大长度；number 类型时为最大值；array 类型时为数组最大长度 */
  max?: number;
  /** 错误信息，不设置时会通过模板自动生成 */
  message?: string;
  /** 	必须设置 type：string 类型为字符串最小长度；number 类型时为最小值；array 类型时为数组最小长度 */
  min?: number;
  /** 正则表达式匹配 */
  pattern?: RegExp;
  /** 是否为必选字段 */
  required?: Boolean;
  type: "string" | "number" | "boolean";
}

interface ItemFace {
  children: React.ReactElement;
  name: string;
  label?: string;
  rules?: RuleConfig[];
}
function Item(props: ItemFace) {
  const { children, label } = props;
  const formInstance = useContext(FormContext);
  const [errorMsg, setErrorMsg] = useState("");
  if (!formInstance) return children;
  const { getFieldValue, setFieldsValue, registerItemEntities } = formInstance;

  // 使用useReducer实现forceUpdate功能
  const [, forceUpdate] = useReducer((x) => !x, false);
  useLayoutEffect(() => {
    const cancleRegistration = registerItemEntities({ props, onStoreChange: forceUpdate });

    return cancleRegistration;
  }, []);

  function getControlled() {
    const name = props.name;
    // const value = getFieldValue(props.name);
    return {
      value: getFieldValue(name),
      onChange(newValue: any) {
        setFieldsValue({ [name]: newValue });
        verifyData(newValue);
      }
    };
  }

  function verifyData(newValue: any) {
    if (!Array.isArray(props?.rules)) return;
    const rules = props.rules;
    const name = props.name;
    let err: ErrorObject | undefined = undefined;
    for (let index = 0; index < rules.length; index++) {
      try {
        const rule = rules[index];
        switch (rules[index].type) {
          case "string":
            err = verifyStringrRule(name, newValue, rule);
            break;
          case "number":
            err = verifyNumberRule(name, newValue, rules[index]);
            break;
          default:
            break;
        }
      } catch (error) {
        err = { message: "rule error.", name: name };
        break;
      }
    }
    if (err) {
      setErrorMsg(err.message);
    } else {
      setErrorMsg("");
    }
  }

  return (
    <div>
      <div>
        <div>
          <span>{label}</span>
        </div>
        {cloneElement(children, getControlled())}
      </div>
      <div>
        <span>{errorMsg}</span>
      </div>
    </div>
  );
}

interface entity {
  props: {
    name: string;
    rules?: RuleConfig[];
  };
  onStoreChange(): void;
}

class FormStore {
  /** 存储表单值的仓库 */
  public store: Record<string, any> = {};
  /** 存储订阅者（表单项）的数组 */
  public itemEntities: entity[] = [];
  constructor() {}

  getFieldsValue = () => {
    return { ...this.store };
  };

  getFieldValue = (name) => {
    return this.store[name];
  };

  setFieldsValue = (newStore) => {
    this.store = {
      ...this.store,
      ...newStore
    };

    const newStoreKeys = Object.keys(newStore);
    this.itemEntities.forEach((entity) => {
      const name = entity.props.name;
      if (newStoreKeys.findIndex((key) => key === name) !== -1) {
        entity.onStoreChange();
      }
    });
  };

  /**
   * 注册订阅更新
   * @param entity
   * @returns {functon} 取消订阅的函数
   */
  registerItemEntities = (entity: entity) => {
    this.itemEntities.push(entity); // 添加订阅者
    return () => {
      // 返回取消订阅的函数
      this.itemEntities = this.itemEntities.filter((item) => item !== entity);
      delete this.store[entity.props.name];
    };
  };

  async validateFields() {
    try {
      const errorFields: { name: string; message: string }[] = [];
      const values: Record<string, any> = {};
      this.itemEntities.forEach((entity) => {
        const { name, rules } = entity.props;

        const value = this.getFieldValue(name);
        values[name] = value;

        if (!Array.isArray(rules)) return;
        for (let index = 0; index < rules.length; index++) {
          try {
            let result: ErrorObject | undefined = undefined;
            const rule = rules[index];
            switch (rules[index].type) {
              case "string":
                result = verifyStringrRule(name, value, rule);
                break;
              case "number":
                result = verifyNumberRule(name, value, rules[index]);
                break;
              default:
                break;
            }
            if (result) {
              errorFields.push(result);
              break;
            }
          } catch (error) {
            errorFields.push({ message: "rule error.", name: name });
            break;
          }
        }
      });

      if (errorFields.length) {
        return Promise.reject({
          errorFields,
          values
        });
      } else {
        return values;
      }
    } catch (error) {
      return Promise.reject({
        message: "validateFields error.",
        name: ""
      });
    }
  }

  getForm = () => {
    return {
      getFieldsValue: this.getFieldsValue.bind(this),
      getFieldValue: this.getFieldValue.bind(this),
      setFieldsValue: this.setFieldsValue.bind(this),
      registerItemEntities: this.registerItemEntities.bind(this),
      validateFields: this.validateFields.bind(this)
    };
  };
}

interface UseFormReturn {
  getFieldsValue(): FormStore["store"];
  getFieldValue(name: string): any;
  setFieldsValue(newStore): void;
  registerItemEntities(entity: any): () => void;
  validateFields(): Promise<Record<string, any>>;
}
export function useForm(form?: UseFormReturn) {
  const formRef = useRef<UseFormReturn>(undefined);
  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore = new FormStore();
      formRef.current = formStore.getForm();
    }
  }
  return formRef.current;
}

const FormContext = createContext<UseFormReturn | undefined>(undefined);

function verifyNumberRule(name: string, value: any, rule: RuleConfig): ErrorObject | undefined {
  const targetValue = Number(value);

  if (rule?.required && Number.isNaN(targetValue)) {
    return { name, message: rule?.message || `"${name}" is empty.` };
  }
  const errorObject = { name, message: rule?.message || `"${name}" is invalid.` };

  const len = Number(rule?.len);
  if (!Number.isNaN(len) && len !== targetValue) {
    return errorObject;
  } else {
    const max = Number(rule?.max);
    if (!Number.isNaN(max) && max < targetValue) {
      return errorObject;
    }
    const min = Number(rule?.min);
    if (!Number.isNaN(min) && min > targetValue) {
      return errorObject;
    }
  }
  // if (rule?.pattern && !rule.pattern.test(value)) {
  //   return errorObject;
  // }

  return void 0;
}
function verifyStringrRule(name: string, value: any, rule: RuleConfig): ErrorObject | undefined {
  const errorObject = { name, message: rule?.message || `"${name}" is invalid.` };

  if (typeof value !== "string") {
    return errorObject;
  }

  if (rule?.required && value.length === 0) {
    return { name, message: rule?.message || `"${name}" is empty.` };
  }
  const len = Number(rule?.len);
  if (!Number.isNaN(len) && len !== value.length) {
    return errorObject;
  } else {
    const max = Number(rule?.max);
    if (!Number.isNaN(max) && max < value.length) {
      return errorObject;
    }
    const min = Number(rule?.min);
    if (!Number.isNaN(min) && min > value.length) {
      return errorObject;
    }
  }
  // if (rule?.pattern && !rule.pattern.test(value)) {
  //   return errorObject;
  // }

  return void 0;
}

export interface RefFace {
  validateFields(): Promise<Record<string, any>>;
}
interface FormFace {
  form?: UseFormReturn;
  children?: ReactNode;
  onFinish?: (values: Record<string, any>) => void;
  onFinishFailed?: (errorFields: ErrorObject[]) => void;
}

function Form(props: FormFace) {
  const { children, form } = props;
  const formInstance = useForm(form);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    formInstance.validateFields().then((values) => {
      console.log(`handleSubmit values:`, values);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormContext.Provider value={formInstance}>{children}</FormContext.Provider>
    </form>
  );
}

Form.useForm = useForm;
Form.Item = Item;

export default Form;
