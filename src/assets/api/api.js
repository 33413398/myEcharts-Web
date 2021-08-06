import formMiddlePromise from "./config";
import { BASE_URL } from "../config/http.config";
const baseUrl = BASE_URL + "api/"; // 本地

// 接口地址
export { baseUrl };
// 柱形图数据
export const sellerBarList = (params, method) => {
  return formMiddlePromise(baseUrl + "/seller", params, method);
};
