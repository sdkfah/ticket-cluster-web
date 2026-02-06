<template>
  <div class="ticket-container">
    <div class="header-card">
      <div class="header-left">
        <span class="title">演出票档看板</span>
        <el-tag type="success" effect="dark" style="margin-left: 15px">实时监控中</el-tag>
      </div>
      <div class="header-right">
        <el-input
          v-model="queryParams.keyword"
          placeholder="搜索演出或场馆"
          style="width: 250px; margin-right: 15px"
          clearable
          @clear="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button icon="Refresh" circle @click="loadData" :loading="loading" />
      </div>
    </div>

    <el-card class="table-card" body-style="padding: 0">
      <el-table :data="ticketList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="item_id" label="项目ID" width="100" align="center" />
        
        <el-table-column label="演出名称" min-width="200">
          <template #default="{ row }">
            <div class="project-info">
              <div class="project-title">{{ row.project_title }}</div>
              <div class="venue-name"><el-icon><Location /></el-icon> {{ row.venue_name }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="场次时间" width="160">
          <template #default="{ row }">
            <div class="time-info">
              <span>{{ formatDate(row.perform_time) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="票档/价格" width="150">
          <template #default="{ row }">
            <div class="price-info">
              <span class="price-desc">{{ row.price_name }}</span>
              <span class="price-val">¥{{ row.price }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.stock_status === 1 ? 'success' : 'danger'" effect="dark">
              {{ row.stock_status === 1 ? '有票' : '无票' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="开抢时间" width="160">
          <template #default="{ row }">
            <span :class="{'sale-start': true, 'is-ready': isSaleSoon(row.sale_start_time)}">
              {{ formatDate(row.sale_start_time) }}
            </template>
        </el-table-column>

        <el-table-column prop="limit_quantity" label="限购" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.limit_quantity }}张/单</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="最后更新" width="160" />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getTicketItems } from '@/api/ticket'
import dayjs from 'dayjs' // 建议安装 dayjs 处理时间

const loading = ref(false)
const ticketList = ref([])
const total = ref(0)
const queryParams = reactive({
  page: 1,
  page_size: 20,
  keyword: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getTicketItems(queryParams)
    ticketList.value = res.data
    total.value = res.total || res.data.length
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
}

// 判断是否是 1 小时内开抢
const isSaleSoon = (startTime) => {
  if (!startTime) return false
  const now = dayjs()
  const start = dayjs(startTime)
  return start.isAfter(now) && start.diff(now, 'hour') < 1
}

onMounted(loadData)
</script>

<style scoped>
.ticket-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 50px);
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.table-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
}

.project-title {
  font-weight: bold;
  color: #409EFF;
}

.venue-name {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-val {
  color: #f56c6c;
  font-weight: bold;
}

.sale-start.is-ready {
  color: #e6a23c;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0.5; }
}

.pagination-wrapper {
  padding: 15px;
  display: flex;
  justify-content: flex-end;
}
</style>