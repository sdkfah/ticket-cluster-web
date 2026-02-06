import request from '@/utils/request'

// 1. 获取所有任务列表
export function getTaskList() {
  return request({
    url: '/api/v1/tasks/list', // 对应 GET 接口
    method: 'get'
  })
}


// 2. 创建任务
export function createOrderTask(data) {
  return request({
    url: '/api/v1/tasks/create', // 对应 POST create 接口
    method: 'post',
    data
  })
}

export function deleteTask(id) {
  return request({
    url: `/api/v1/tasks/${id}`,
    method: 'delete'
  })
}

// 批量删除任务
export function batchDeleteTasks(ids) {
  return request({
    url: '/api/v1/tasks/batch-delete',
    method: 'post',
    data: { ids } // 传 ID 数组
  })
}