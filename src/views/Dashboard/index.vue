<template>
  <div class="dashboard-container">
    <div class="header-actions">
      <el-button type="primary" @click="handleCreate">新建任务</el-button>
      <el-button @click="loadData">刷新数据</el-button>
    </div>

    <el-table :data="taskList" border stripe style="width: 100%; margin-top: 20px" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="艺人/演出" min-width="120">
        <template #default="{ row }">
          <b style="color: #409EFF">{{ row.artist }}</b>
        </template>
      </el-table-column>
      <el-table-column prop="city" label="城市" width="80" />
      <el-table-column prop="target_date" label="目标日期" width="120" />
      <el-table-column prop="target_price" label="价格" width="100" />
      <el-table-column prop="customer_info" label="客户信息" show-overflow-tooltip />
      <el-table-column prop="bounty" label="赏金" width="90">
        <template #default="{ row }">
          <span style="color: #F56C6C; font-weight: bold">¥{{ row.bounty }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type || 'info'">
            {{ statusMap[row.status]?.label || '未知' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-popconfirm
            confirm-button-text="确定"
            cancel-button-text="取消"
            title="确定要删除这条抢票任务吗？"
            @confirm="handleDelete(row)"
          >
            <template #reference>
              <el-button size="small" type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.page_size"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <el-dialog v-model="dialogVisible" title="新建任务" width="500px">
      <p>表单内容开发中...</p>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getTaskList, deleteTask } from '@/api/task'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const taskList = ref([])
const total = ref(0)

const queryParams = reactive({
  page: 1,
  page_size: 10
})

const statusMap = {
  0: { label: '待处理', type: 'info' },
  1: { label: '已抢到', type: 'success' },
  2: { label: '已撤单', type: 'warning' }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTaskList(queryParams)
    taskList.value = res.data
    total.value = res.total || res.data.length 
  } finally {
    loading.value = false
  }
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await deleteTask(row.id)
    ElMessage.success('任务已成功删除')
    loadData() // 重新刷新列表
  } catch (err) {
    // 错误信息由拦截器弹出
  }
}

const handleCreate = () => {
  dialogVisible.value = true
}

onMounted(loadData)
</script>

<style scoped>
.dashboard-container { padding: 15px; }
.header-actions { display: flex; gap: 10px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>