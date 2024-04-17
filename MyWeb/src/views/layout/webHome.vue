<script setup>
import webHeader from './webHeader.vue'
</script>

<template>
  <el-container class="home">
    <el-header class="elHeader">
      <webHeader />
    </el-header>
    <el-container class="center">
      <div ref="codeEdit" class="codeEdit"></div>
      <el-main class="mainReion">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  overflow: hidden;

  .elHeader {
    padding: 0;
  }
  .center {
    overflow: hidden;
  }
  .mainReion {
    padding: 0;
  }
}
</style>
