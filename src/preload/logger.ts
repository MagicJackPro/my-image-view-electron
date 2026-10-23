import { ipcRenderer } from "electron";

const invoke = ipcRenderer.invoke;

/**
 * 写入“trace”级日志
 * @param {string|object} argument
 * @returns
 */
function trace(argument: string | object): Promise<undefined> {
  return invoke("log:trace", argument);
}
/**
 * 写入“debug”级日志
 * @param {string|object} argument
 * @returns
 */
function debug(argument: string | object): Promise<undefined> {
  return invoke("log:debug", argument);
}
/** 写入“info”级日志
 * @param {string|object} argument
 * @returns {undefined}
 */
function info(argument: string | object): Promise<undefined> {
  return invoke("log:info", argument);
}

/**
 * 写入“warn”级日志
 * @param {string|object} argument
 * @returns
 */
function warn(argument: string | object): Promise<undefined> {
  return invoke("log:warn", argument);
}

/**
 * 写入“error”级日志
 * @param {string|object} argument
 * @returns
 */
function error(argument: string | object): Promise<undefined> {
  return invoke("log:error", argument);
}

/**
 * 写入“fatal”级日志
 * @param {string|object} argument
 * @returns
 */
function fatal(argument: string | object): Promise<undefined> {
  return invoke("log:fatal", argument);
}

interface LogFunction {
    (argument: string | object): Promise<void>
}
export interface LogAPIFace {
    trace: LogFunction,
    debug: LogFunction,
    info: LogFunction,
    warn: LogFunction,
    error: LogFunction,
    fatal: LogFunction,
}
const LogAPI:LogAPIFace = {
  trace,
  debug,
  info,
  warn,
  error,
  fatal
};

// const LogAPI = {
//   trace,
//   debug,
//   info,
//   warn,
//   error,
//   fatal
// };
// export type LogAPIFace = typeof LogAPI;


export default LogAPI;
