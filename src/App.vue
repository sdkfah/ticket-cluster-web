<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <div class="logo">Ticket Cluster</div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>任务看板</span>
        </el-menu-item>
        <el-menu-item index="/ticket-items">
          <el-icon><User /></el-icon>
          <span>票档</span>
        </el-menu-item>
        <el-menu-item index="/account">
          <el-icon><User /></el-icon>
          <span>账号管理</span>
        </el-menu-item>
        <el-menu-item index="/logs">
          <el-icon><Document /></el-icon>
          <span>抢票日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-left">后台管理系统</div>
        <div class="header-right">
          <el-tag type="success">后端已连接</el-tag>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Monitor, User, Document } from "@element-plus/icons-vue";
</script>

<style>
/* 简单的全局样式重置 */
body {
  margin: 0;
  font-family: sans-serif;
}
.layout-container {
  height: 100vh;
}
.el-aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background: #2b2f3a;
}
.el-header {
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
