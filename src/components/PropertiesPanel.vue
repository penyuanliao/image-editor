<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { CanvasElement } from './ImageUploader.vue';

const props = defineProps({
  element: {
    type: Object as PropType<CanvasElement | null>,
    default: null,
  },
});

const isBold = computed({
  get() {
    return props.element?.fontWeight === 'bold';
  },
  set(value: boolean) {
    if (props.element) {
      props.element.fontWeight = value ? 'bold' : 'normal';
    }
  },
});

const fontFamilies = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", Times, serif', label: 'Times New Roman' },
  { value: '"Courier New", Courier, monospace', label: 'Courier New' },
  { value: '標楷體, BiauKai', label: '標楷體' },
  { value: '"Microsoft JhengHei", "微軟正黑體", sans-serif', label: '微軟正黑體' },
  { value: 'PMingLiU, "新細明體", serif', label: '新細明體' },
];

</script>

<template>
  <div class="properties-panel-wrapper">
    <div v-if="element && element.type === 'text'" class="properties-panel">
      <h3 class="panel-title">文字屬性</h3>
      <el-form label-position="top" label-width="80px" class="properties-form">
        <!-- 1. 輸入文字 -->
        <el-form-item label="內容">
          <el-input v-model="element.content" type="textarea" :rows="2" />
        </el-form-item>

        <!-- 2. 選擇字體 & 大小 -->
        <el-row :gutter="12">
          <el-col :span="16">
            <el-form-item label="字體">
              <el-select v-model="element.fontFamily" placeholder="選擇字體" style="width: 100%;">
                <el-option v-for="font in fontFamilies" :key="font.value" :label="font.label" :value="font.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="大小">
              <el-input-number v-model="element.fontSize" :min="8" :max="200" controls-position="right" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 3. 粗體 & 4. 顏色 -->
        <el-form-item label="樣式與顏色">
          <div class="style-group">
            <el-checkbox v-model="isBold" size="large" border class="bold-checkbox"><b>B</b></el-checkbox>
            <el-color-picker v-model="element.color" />
          </div>
        </el-form-item>

        <!-- 5. 位置 -->
        <el-form-item label="位置">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-input-number v-model="element.x" controls-position="right" style="width: 100%;">
                <template #prepend>X</template>
              </el-input-number>
            </el-col>
            <el-col :span="12">
              <el-input-number v-model="element.y" controls-position="right" style="width: 100%;">
                <template #prepend>Y</template>
              </el-input-number>
            </el-col>
          </el-row>
        </el-form-item>

        <!-- 6. 陰影 -->
        <div class="property-group">
          <div class="group-header">
            <label>陰影</label>
            <el-switch v-model="element.shadow.enabled" />
          </div>
          <div v-if="element.shadow.enabled" class="group-content">
            <el-form-item label="顏色">
              <el-color-picker v-model="element.shadow.color" show-alpha />
            </el-form-item>
            <el-form-item label="模糊">
              <el-slider v-model="element.shadow.blur" :min="0" :max="50" />
            </el-form-item>
            <el-form-item label="水平偏移">
              <el-slider v-model="element.shadow.offsetX" :min="-50" :max="50" />
            </el-form-item>
            <el-form-item label="垂直偏移">
              <el-slider v-model="element.shadow.offsetY" :min="-50" :max="50" />
            </el-form-item>
          </div>
        </div>

        <!-- 7. 外框 -->
        <div class="property-group">
          <div class="group-header">
            <label>外框</label>
            <el-switch v-model="element.stroke.enabled" />
          </div>
          <div v-if="element.stroke.enabled" class="group-content">
            <el-form-item label="顏色">
              <el-color-picker v-model="element.stroke.color" />
            </el-form-item>
            <el-form-item label="寬度">
              <el-slider v-model="element.stroke.width" :min="1" :max="20" />
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>
    <div v-else class="properties-panel-placeholder">
      <p>點擊畫布上的元件以編輯屬性</p>
    </div>
  </div>
</template>

<style scoped>
.properties-panel-wrapper {
  width: 320px;
  flex-shrink: 0;
}
.properties-panel {
  padding: 1rem;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  height: 100%;
}
.panel-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 18px;
}
.properties-form .el-form-item {
  margin-bottom: 18px;
}
.style-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.bold-checkbox {
  margin-right: 1rem;
}
.property-group {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem 1rem 1rem 1rem;
  margin-top: 1.5rem;
}
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.group-header label {
  font-weight: bold;
  color: #555;
}
.group-content .el-form-item {
  margin-bottom: 8px;
}
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
.properties-panel-placeholder {
  width: 320px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  color: #999;
  text-align: center;
  padding: 2rem;
  flex-shrink: 0;
}
</style>