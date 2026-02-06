import request from '@/utils/request'

/**
 * 1. 搜索演出项目 (去重后的项目列表)
 * 用于左侧顶部的下拉搜索框
 * @param {Object} params - { keyword: '演出名称关键字' }
 */
export function searchProjects(params) {
  return request({
    url: '/api/v1/ticket/search',
    method: 'get',
    params
  })
}

/**
 * 2. 获取选中演出的所有具体票档 (SKU)
 * 用于渲染左侧树形表格 (日期 > 票价)
 * @param {Object} params - { item_id: '项目ID' }
 */
export function getTicketSkus(params) {
  return request({
    url: '/api/v1/ticket/skus',
    method: 'get',
    params
  })
}

/**
 * 3. 获取所有票档原始列表
 * (可选) 用于全局监控或基础列表展示
 */
export function getTicketItems() {
  return request({
    url: '/api/v1/ticket/list',
    method: 'get'
  })
}