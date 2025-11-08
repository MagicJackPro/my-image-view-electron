import { createRef, useImperativeHandle, useState } from "react";
interface StringRuleConfig {
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
}
interface FormItemStringFace {
  label?: string;
  name: string;
  rule?: Array<StringRuleConfig>;
  /** 设置防抖，延迟毫秒数后进行校验 */
  validateDebounce?: number;
  ref?: React.Ref<{
    validateField(): Promise<string>;
  }>;
}

export default function FormItemString(parameters: FormItemStringFace) {
  const { ref } = parameters;
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = createRef<HTMLInputElement>();

  useImperativeHandle(ref, () => ({
    validateField() {
      return _validateField();
    }
  }));

  function _validateField() {
    return new Promise(
      (
        resolve: (value: string) => void,
        reject: (reason?: { name: string; message: string }) => void
      ) => {
        const value = inputRef.current?.value || "";
        console.log(`value:`, value);
        if (!Array.isArray(parameters.rule)) {
          return value;
        }
        const lenth = parameters.rule.length;
        if (lenth === 0) return value;
        const rules = parameters.rule;
        for (let index = 0; index < rules.length; index++) {
          try {
            const result = verifyRule(value, rules[index]);
            if (result) {
              console.log(`result:`, result);
              setErrorMsg(result.message);
              return reject(result);
            }
          } catch (error) {
            const catchMessage = "error rule.";
            setErrorMsg(catchMessage);
            return reject({ name: parameters.name, message: catchMessage });
          }
        }

        setErrorMsg("");
        return resolve(value);
      }
    );
  }

  function verifyRule(
    value: string,
    rule: StringRuleConfig
  ): { name: string; message: string } | undefined {
    console.log(`verifyRule value:`, value);
    console.log(`verifyRule rule:`, JSON.stringify(rule));
    function verifySafeInteger(any): number {
      if (Number.isSafeInteger(any) && any > 0) {
        return any as number;
      }
      return -1;
    }
    const name = parameters.name;
    const errorObject = { name, message: rule?.message || `"${name}" is invalid.` };

    if (rule?.required && value.length === 0) {
      return { name, message: rule?.message || `"${name}" is empty.` };
    }

    const len = verifySafeInteger(rule?.len);
    if (len !== -1 && len !== value.length) {
      return errorObject;
    } else {
      const max = verifySafeInteger(rule?.max);
      if (max !== -1 && max < value.length) {
        return errorObject;
      }
      const min = verifySafeInteger(rule?.min);
      if (min !== -1 && min > value.length) {
        return errorObject;
      }
    }
    if (rule?.pattern && !rule.pattern.test(value)) {
      return errorObject;
    }

    return void 0;
  }
  return (
    <div>
      <input
        ref={inputRef}
        name={parameters.name}
        defaultValue={""}
        type="text"
        onChange={_validateField}
      />
      <p>
        <span>{errorMsg}</span>
      </p>
    </div>
  );
}
