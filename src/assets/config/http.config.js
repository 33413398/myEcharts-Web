/**
 * http基本配置
 */
import { INNER, OUTER, LOCAL, CUR_EVN } from "./evn.config";

// 请求基本url
const BASE_URL_CONFIG = {
  [INNER]: "",
  [OUTER]: "",
  [LOCAL]: "http://127.0.0.1:8888/"
};
export const BASE_URL = BASE_URL_CONFIG[CUR_EVN];

// 图片请求基本url
const IMAGE_BASE_URL_CONFIG = {
  [INNER]: "",
  [OUTER]: "",
  [LOCAL]: ""
};
export const IMAGE_BASE_URL = IMAGE_BASE_URL_CONFIG[CUR_EVN];

// 浏览器下载路径
export const CHROME_DOWNLOAD_URL = IMAGE_BASE_URL + "collect/chrome/chrome.exe";
