import axios from 'axios';
import { ElMessage } from 'element-plus';

// 1. 创建 Axios 实例
const service = axios.create({
  // 根据环境变量自动切换请求地址
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
  timeout: 10000, // 请求超时时间：10秒
});

// 2. 请求拦截器 (Request Interceptor)
service.interceptors.request.use(
  (config) => {
    // 在这里可以统一添加请求头，比如 Token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 3. 响应拦截器 (Response Interceptor)
service.interceptors.response.use(
  (response) => {
    // 直接返回数据部分，过滤掉 axios 的包装（如 status, headers）
    const res = response.data;

    // 根据后端约定的状态码判断
    // 假设后端成功时 code 为 200 或 0
    if (res.code !== 200 && res.code !== 0 && res.code !== undefined) {
      ElMessage.error(res.message || '系统异常');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    // 统一处理 HTTP 错误状态码
    let message = '网络请求失败';
    if (error.response) {
      switch (error.response.status) {
        case 401: message = '未授权，请重新登录'; break;
        case 403: message = '拒绝访问'; break;
        case 404: message = '请求地址不存在'; break;
        case 500: message = '服务器内部错误'; break;
        default: message = error.response.data?.detail || '未知错误';
      }
    }
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default service;