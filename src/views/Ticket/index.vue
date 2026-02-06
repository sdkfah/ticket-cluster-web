<template>
  <div class="split-container">
    <div class="left-panel">
      <el-card shadow="never" class="full-height-card">
        <template #header>
          <div style="display: flex; align-items: center; gap: 12px">
            <el-select
              v-model="searchKeyword"
              filterable
              remote
              reserve-keyword
              placeholder="输入演出关键字搜索"
              :remote-method="handleSearchTicket"
              @focus="handleSearchTicket('')"
              :loading="searchLoading"
              style="width: 220px"
              @change="onProjectSelect"
            >
              <el-option
                v-for="item in projectOptions"
                :key="item.item_id"
                :label="item.project_title"
                :value="item.item_id"
              />
            </el-select>

            <el-button
              type="primary"
              link
              @click="toggleAllExpansion"
              :disabled="displayTree.length === 0"
            >
              {{ isAllExpanded ? "全部收起" : "全部展开" }}
              <el-icon class="el-icon--right">
                <component :is="isAllExpanded ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </el-button>
          </div>
        </template>

        <el-table
          ref="ticketTable"
          :data="displayTree"
          row-key="id"
          border
          highlight-current-row
          @current-change="handleRowClick"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
          <el-table-column prop="label" label="日期 / 票档" min-width="150" />
          <el-table-column label="开售时间" width="120" align="center">
            <template #default="{ row }">
              <span v-if="row.sku_id" style="font-size: 12px; color: #606266">
                {{ row.formattedSaleTime || "-" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              <span v-if="row.price" style="color: #f56c6c; font-weight: bold"
                >¥{{ row.price }}</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="状态" width="80" align="center">
            <template #default="{ row }">
              <template v-if="row.sku_id">
                <el-tag
                  :type="
                    row.displayStatus === 1
                      ? 'success'
                      : row.displayStatus === 2
                        ? 'warning'
                        : 'danger'
                  "
                  size="small"
                >
                  {{
                    row.displayStatus === 1
                      ? "有票"
                      : row.displayStatus === 2
                        ? "预售"
                        : "无票"
                  }}
                </el-tag>
              </template>

              <template v-else>
                <el-tag
                  :type="
                    row.hasStock
                      ? 'success'
                      : row.isPresale
                        ? 'warning'
                        : 'danger'
                  "
                  size="small"
                  effect="plain"
                >
                  {{ row.hasStock ? "有票" : row.isPresale ? "预售" : "无票" }}
                </el-tag>
              </template>
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
            <el-tag v-if="selectedPrice.sku_id" type="warning"
              >已选中票档</el-tag
            >
          </div>
        </template>

        <el-form
          :model="taskForm"
          label-width="80px"
          :disabled="!selectedPrice.sku_id"
        >
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

          <el-form-item label="实名人" required>
            <el-input
              v-model="taskForm.customer_info"
              placeholder="姓名+身份证号"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="taskForm.contact_phone" placeholder="手机号" />
          </el-form-item>
          <el-form-item label="红包金额">
            <el-input-number
              v-model="taskForm.bounty"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="submitTask"
              :loading="submitLoading"
              >保存任务</el-button
            >
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <el-empty
          v-if="!selectedPrice.sku_id"
          description="请先在左侧选择具体票价"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
// ✨ 增加 nextTick 导入
import { ref, reactive, nextTick } from "vue";
import { searchProjects, getTicketSkus } from "@/api/ticket";
import { createTask } from "@/api/task";
import { ElMessage } from "element-plus";
// ✨ 增加图标导入
import { ArrowUp, ArrowDown } from "@element-plus/icons-vue";

const searchKeyword = ref("");
const searchLoading = ref(false);
const submitLoading = ref(false);
const projectOptions = ref([]);
const displayTree = ref([]);
const selectedPrice = ref({});
const ticketTable = ref(null);
const isAllExpanded = ref(true); // ✨ 控制展开收起状态

const taskForm = reactive({
  artist: "",
  city: "",
  target_date: "",
  target_price: 0,
  customer_info: "",
  contact_phone: "",
  bounty: 0,
  skuId: "",
  itemId: "",
});

const handleSearchTicket = async (query) => {
  searchLoading.value = true;
  try {
    const res = await searchProjects({ keyword: query || "" });
    projectOptions.value = res.data;
  } catch (error) {
    console.error("搜索失败", error);
  } finally {
    searchLoading.value = false;
  }
};

// ✨ 核心功能：切换所有日期行的展开状态
const toggleAllExpansion = () => {
  isAllExpanded.value = !isAllExpanded.value;
  displayTree.value.forEach((row) => {
    // 调用 el-table 实例方法
    ticketTable.value?.toggleRowExpansion(row, isAllExpanded.value);
  });
};

const onProjectSelect = async (val) => {
  const project = projectOptions.value.find((p) => p.item_id === val);
  if (!project) return;

  displayTree.value = [];
  const now = new Date(); // ✨ 获取当前时间用于对比

  try {
    const res = await getTicketSkus({ item_id: val });
    const rawItems = res.data || [];

    const dateMap = {};
    rawItems.forEach((item) => {
      let formattedTime = "-";
      if (item.sale_start_time) {
        const st = new Date(item.sale_start_time);
        formattedTime = st
          .toLocaleString("zh-CN", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
          .replace(/\//g, "-");
      }

      // 格式化日期展示
      const d = new Date(item.perform_time);
      const dateStr = d
        .toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-");
      const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
        d.getDay()
      ];
      const timeStr = d.toTimeString().substring(0, 5);
      const displayLabel = `${dateStr} ${weekDay} ${timeStr}`;

      // ✨ 判断当前 SKU 状态：1-有票，0-无票，2-预售
      let currentStatus = item.stock_status;
      if (item.sale_start_time && new Date(item.sale_start_time) > now) {
        currentStatus = 2; // 如果开售时间在未来，标记为预售
      }

      if (!dateMap[displayLabel]) {
        dateMap[displayLabel] = {
          id: `p-${item.perform_id}`,
          label: displayLabel,
          children: [],
          hasStock: false,
          isPresale: false,
          formattedSaleTime: formattedTime,
        };
      }

      // 更新父节点汇总状态
      if (currentStatus === 1) dateMap[displayLabel].hasStock = true;
      if (currentStatus === 2) dateMap[displayLabel].isPresale = true;

      dateMap[displayLabel].children.push({
        ...item,
        id: item.sku_id,
        displayStatus: currentStatus, // ✨ 存储计算后的显示状态
        label: `${item.price_name} - ¥${item.price}`,
      });
    });

    displayTree.value = Object.values(dateMap);

    // 默认展开逻辑
    isAllExpanded.value = true;
    await nextTick();
    displayTree.value.forEach((row) => {
      ticketTable.value?.toggleRowExpansion(row, true);
    });
  } catch (error) {
    ElMessage.error("获取票档详情失败");
  }
};

const handleRowClick = (row) => {
  if (!row || !row.sku_id) {
    selectedPrice.value = {};
    return;
  }

  selectedPrice.value = row;
  taskForm.artist = row.project_title;
  taskForm.city = row.venue_name;

  taskForm.skuId = row.sku_id;
  taskForm.itemId = row.item_id;

  if (row.perform_time) {
    const d = new Date(row.perform_time);
    const dateStr = d
      .toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
      d.getDay()
    ];
    const timeStr = d.toTimeString().substring(0, 5);
    taskForm.target_date = `${dateStr} ${weekDay} ${timeStr}`;
  }

  taskForm.target_price = row.price;
};

const submitTask = async () => {
  if (!taskForm.customer_info || !taskForm.customer_info.trim()) {
    ElMessage.warning("请填写实名人信息（姓名+身份证号）");
    return;
  }
  // 校验通过后，再开始加载状态
  submitLoading.value = true;
  try {
    // 此时 taskForm 已经包含了你之前需要的 skuId 和 itemId
    await createTask(taskForm);
    ElMessage.success("抢票任务录入成功");
    resetForm();
  } catch (error) {
    // 建议增加错误捕获，防止接口报错导致 loading 一直转
    console.error("保存失败:", error);
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  selectedPrice.value = {};
  Object.assign(taskForm, {
    artist: "",
    city: "",
    target_date: "",
    target_price: 0,
    customer_info: "",
    contact_phone: "",
    bounty: 0,
    skuId: "",
    itemId: "",
  });

  if (ticketTable.value) {
    ticketTable.value.setCurrentRow(null);
  }
  // 重置时恢复展开文字
  isAllExpanded.value = true;
};
</script>

<style scoped>

:deep(.el-table__row--level-1 .cell) {
  font-size: 12px !important; 
}

/* 父节点（日期行）保持清晰 */
:deep(.el-table__row--level-0 .cell) {
  font-size: 13px;
}
.split-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 100px);
  padding: 20px;
  background: #f5f7fa;
}
.left-panel {
  flex: 4;
  min-width: 400px;
}
.right-panel {
  flex: 3;
  min-width: 350px;
}
.full-height-card {
  height: 100%;
  overflow-y: auto;
}
</style>
