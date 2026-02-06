import request from '@/utils/request'

// 获取票档看板数据
export function getTicketItems(params) {
  return request({
    url: '/api/v1/tickets/items',
    method: 'get',
    params
  })
}