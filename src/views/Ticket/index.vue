<template>
  <div class="split-container">
    <div class="left-panel">
      <el-card shadow="never" class="full-height-card">
        <template #header>
          <el-select
            v-model="searchKeyword"
            filterable
            remote
            reserve-keyword
            placeholder="输入演出关键字搜索"
            :remote-method="handleSearchTicket"
            :loading="searchLoading"
            style="width: 100%"
            @change="onProjectSelect"
          >
            <el-option
              v-for="item in projectOptions"
              :key="item.item_id"
              :label="item.project_title"
              :value="item.item_id"
            />
          </el-select>
        </template>

        <el-table
          :data="displayTree"
          row-key="id"
          ref="ticketTable"
          border
          highlight-current-row
          @current-change="handleRowClick"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="label" label="日期 / 票档描述" min-width="150" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              <span v-if="row.price" style="color: #f56c6c; font-weight: bold">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.sku_id" :type="row.stock_status === 1 ? 'success' : 'danger'" size="small">
                {{ row.stock_status === 1 ? '有票' : '无票' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="right-panel">
      <el-card shadow="never" class="full-height-card">
        <template #header>
          <div class="card-header">
            <span>录入抢票任务</span>
            <el-tag v-if="selectedPrice.sku_id" type="warning">已选中票档</el-tag>
          </div>
        </template>

        <el-form :model="taskForm" label-width="80px" :disabled="!selectedPrice.sku_id">
          <el-form-item label="演出名称">
            <el-input v-model="taskForm.artist" disabled />
          </el-form-item>
          <el-form-item label="目标日期">
            <el-input v-model="taskForm.target_date" disabled />
          </el-form-item>
          <el-form-item label="票价">
            <el-input v-model="taskForm.target_price" disabled />
          </el-form-item>
          
          <el-divider content-position="left">客户信息</el-divider>

          <el-form-item label="实名人">
            <el-input v-model="taskForm.customer_info" placeholder="姓名+身份证号" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="taskForm.contact_phone" placeholder="手机号" />
          </el-form-item>
          <el-form-item label="红包金额">
            <el-input-number v-model="taskForm.bounty" :min="0" style="width: 100%" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" block @click="submitTask" :loading="submitLoading">保存任务</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-empty v-if="!selectedPrice.sku_id" description="请先在左侧选择具体票价" />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { searchProjects, getTicketSkus } from '@/api/ticket' 
import { createTask } from '@/api/task'
import { ElMessage } from 'element-plus'

const searchKeyword = ref('')
const searchLoading = ref(false)
const submitLoading = ref(false)
const projectOptions = ref([])
const displayTree = ref([])
const selectedPrice = ref({})

const taskForm = reactive({
  artist: '',
  city: '',
  target_date: '',
  target_price: 0,
  customer_info: '',
  contact_phone: '',
  bounty: 0
})

const handleSearchTicket = async (query) => {
  if (query) {
    searchLoading.value = true
    try {
      const res = await searchProjects({ keyword: query }) 
      projectOptions.value = res.data
    } finally {
      searchLoading.value = false
    }
  }
}

// 2. 选择演出后构造树形结构数据
const onProjectSelect = async (val) => {
  const project = projectOptions.value.find(p => p.item_id === val)
  if (!project) return

  // ✨ 切换项目时先清空，防止旧的 DOM 引用导致渲染错误
  displayTree.value = [] 

  try {
    const res = await getTicketSkus({ item_id: val }) 
    const rawItems = res.data || []

    const dateMap = {}
    rawItems.forEach(item => {
      // --- 格式化日期：2026-03-01 周日 19:00 ---
      const d = new Date(item.perform_time)
      const dateStr = d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
      const timeStr = d.toTimeString().substring(0, 5)
      
      const displayLabel = `${dateStr} ${weekDay} ${timeStr}`
      
      if (!dateMap[displayLabel]) {
        dateMap[displayLabel] = { 
          // ✨ 给父节点 ID 加前缀，确保 ID 唯一，解决渲染报错
          id: `p-${item.perform_id}`, 
          label: displayLabel,
          children: [] 
        }
      }
      
      dateMap[displayLabel].children.push({
        ...item,
        id: item.sku_id, 
        label: `${item.price_name} - ¥${item.price}`
      })
    })
    displayTree.value = Object.values(dateMap)
  } catch (error) {
    ElMessage.error('获取票档详情失败')
  }
}

const handleRowClick = (row) => {
  // ✨ 修复点 1：增加对 row 自身的空值判断
  if (!row || !row.sku_id) {
    selectedPrice.value = {}
    return
  }
  
  selectedPrice.value = row
  taskForm.artist = row.project_title
  taskForm.city = row.venue_name
  
  // 建议：使用更健壮的日期处理，防止 perform_time 为空
  if (row.perform_time) {
    const d = new Date(row.perform_time)
    taskForm.target_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${d.toTimeString().substring(0, 5)}`
  }
  
  taskForm.target_price = row.price
}

const submitTask = async () => {
  submitLoading.value = true
  try {
    await createTask(taskForm)
    ElMessage.success('抢票任务录入成功')
    resetForm()
  } finally {
    submitLoading.value = false
  }
}

const ticketTable = ref(null)
const resetForm = () => {
  // 1. 清空选中的票档对象，这会触发右侧表单的 :disabled 状态
  selectedPrice.value = {}
  
  // 2. 彻底重置表单所有字段，包括隐藏的城市、日期和价格
  Object.assign(taskForm, {
    artist: '',
    city: '',
    target_date: '',
    target_price: 0,
    customer_info: '',
    contact_phone: '',
    bounty: 0
  })

  // 3. ✨ 关键点：取消左侧表格的高亮选中状态
  // 假设你的表格引用名为 ticketTable
  if (ticketTable.value) {
    ticketTable.value.setCurrentRow(null) 
  }
}
</script>

<style scoped>
.split-container { display: flex; gap: 20px; height: calc(100vh - 100px); padding: 20px; background: #f5f7fa; }
.left-panel { flex: 4; min-width: 400px; }
.right-panel { flex: 3; min-width: 350px; }
.full-height-card { height: 100%; overflow-y: auto; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>