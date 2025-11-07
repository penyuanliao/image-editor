<script setup lang="ts">

</script>

<template>
  <el-row>
    <el-menu class="context-menu">
      <el-menu-item>
        <div class="btn">
          <span>複製</span>
        </div>
      </el-menu-item>
      <el-menu-item>
        <span>貼上</span>
      </el-menu-item>
      <el-menu-item>
        <span>刪除</span>
      </el-menu-item>
      <el-divider/>
      <el-menu-item>
        <span>移至前方</span>
      </el-menu-item>
      <el-menu-item>
        <span>前移</span>
      </el-menu-item>
      <el-menu-item>
        <span>後移</span>
      </el-menu-item>
      <el-menu-item>
        <span>移至後方</span>
      </el-menu-item>
      <el-divider/>
      <el-menu-item>
        <span>鎖定</span>
      </el-menu-item>
    </el-menu>
  </el-row>
</template>

<style scoped lang="scss">
.btn {
  width: 180px;
}
// 調整 el-divider 的上下間距
.context-menu :deep(.el-divider) {
  margin: 4px 0;
}
</style>