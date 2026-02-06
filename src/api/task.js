import request from '@/utils/request';

// 获取抢票任务列表
export function getTaskList(params) {
  return request({
    url: '/tasks',
    method: 'get',
    params
  });
}

// 启动抢票任务
export function startTask(id) {
  return request({
    url: `/tasks/${id}/start`,
    method: 'post'
  });
}