<script setup lang="ts">
import { reactive, watch } from "vue";
import type { TextElement } from "../types";

const props = defineProps<{ 
  selectedElement: TextElement | null 
}>();

const emit = defineEmits(['addElement', 'update-element']);

// --- Font Data ---
const availableFonts = [
  'Arial',
  'Verdana',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Microsoft JhengHei', // 微軟正黑體
  'PingFang TC', // 蘋方-繁
  'Noto Sans TC', // 思源黑體
  'KaiTi', // 標楷體
];

// --- Default State Factory ---
const getDefaultTextProps = () => ({
  content: '雙擊編輯文字',
  name: '文字',
  color: '#000000',
  isBold: false,
  fontSize: 32,
  fontFamily: 'Arial',
  lineHeight: 1.2,
  rotation: 0,
});

const getDefaultShadow = () => ({
  enabled: false,
  color: '#000000',
  blur: 5,
  offsetX: 5,
  offsetY: 5
});

const getDefaultStroke = () => ({
  enabled: false,
  color: '#FFFFFF',
  width: 2
});

const getDefaultGradient = () => ({
  enabled: false,
  startColor: '#FF0000',
  endColor: '#0000FF',
  angle: 90
});

// --- Reactive State ---
const textProps = reactive(getDefaultTextProps());
const shadow = reactive(getDefaultShadow());
const stroke = reactive(getDefaultStroke());
const gradient = reactive(getDefaultGradient());

// --- Watchers for State Synchronization ---

// Watch for incoming element changes and update the panel UI
watch(() => props.selectedElement, (newEl) => {
  if (newEl && newEl.type === 'text') {
    // Update text properties
    textProps.content = newEl.content;
    textProps.color = newEl.color;
    textProps.isBold = newEl.fontWeight === 'bold';
    textProps.fontSize = newEl.fontSize;
    textProps.fontFamily = newEl.fontFamily || 'Arial';
    textProps.lineHeight = newEl.lineHeight || 1.2;
    textProps.rotation = newEl.rotation || 0;

    // Update shadow properties
    shadow.enabled = !!newEl.shadowColor;
    if (shadow.enabled) {
      shadow.color = newEl.shadowColor || '#000000';
      shadow.blur = newEl.shadowBlur || 0;
      shadow.offsetX = newEl.shadowOffsetX || 0;
      shadow.offsetY = newEl.shadowOffsetY || 0;
    }

    // Update stroke properties
    stroke.enabled = !!newEl.strokeColor;
    if (stroke.enabled) {
      stroke.color = newEl.strokeColor || '#000000';
      stroke.width = newEl.strokeWidth || 1;
    }

    // Update gradient properties
    gradient.enabled = !!newEl.gradientEnabled;
    if (gradient.enabled) {
      gradient.startColor = newEl.gradientStartColor || '#FF0000';
      gradient.endColor = newEl.gradientEndColor || '#0000FF';
      gradient.angle = newEl.gradientAngle || 90;
    }

  } else {
    // Reset to default if no element is selected
    Object.assign(textProps, getDefaultTextProps());
    Object.assign(shadow, getDefaultShadow());
    Object.assign(stroke, getDefaultStroke());
    Object.assign(gradient, getDefaultGradient());
  }
}, { deep: true });

// Watch for panel UI changes and emit updates to the parent
watch([textProps, shadow, stroke, gradient], () => {
  if (props.selectedElement) {
    const payload: any = {
      ...textProps,
      fontWeight: textProps.isBold ? 'bold' : 'normal',
    };

    if (shadow.enabled) {
      payload.shadowColor = shadow.color;
      payload.shadowBlur = shadow.blur;
      payload.shadowOffsetX = shadow.offsetX;
      payload.shadowOffsetY = shadow.offsetY;
    } else {
      // Explicitly send nulls to remove the effect
      payload.shadowColor = null;
      payload.shadowBlur = null;
      payload.shadowOffsetX = null;
      payload.shadowOffsetY = null;
    }

    if (stroke.enabled) {
      payload.strokeColor = stroke.color;
      payload.strokeWidth = stroke.width;
    } else {
      payload.strokeColor = null;
      payload.strokeWidth = null;
    }

    if (gradient.enabled) {
      payload.gradientEnabled = true;
      payload.gradientStartColor = gradient.startColor;
      payload.gradientEndColor = gradient.endColor;
      payload.gradientAngle = gradient.angle;
    } else {
      payload.gradientEnabled = false;
      payload.gradientStartColor = null;
      payload.gradientEndColor = null;
      payload.gradientAngle = null;
    }
    
    emit('update-element', payload);
  }
}, { deep: true });


// --- Methods ---

const addText = () => {
  const element: any = {
    type: 'text',
    ...textProps,
    fontWeight: textProps.isBold ? 'bold' : 'normal',
  };

  if (shadow.enabled) {
    element.shadowColor = shadow.color;
    element.shadowBlur = shadow.blur;
    element.shadowOffsetX = shadow.offsetX;
    element.shadowOffsetY = shadow.offsetY;
  }

  if (stroke.enabled) {
    element.strokeColor = stroke.color;
    element.strokeWidth = stroke.width;
  }

  if (gradient.enabled) {
    element.gradientEnabled = true;
    element.gradientStartColor = gradient.startColor;
    element.gradientEndColor = gradient.endColor;
    element.gradientAngle = gradient.angle;
  }

  emit('addElement', element);
};

const fontSizeOption = [
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '24', value: 24 },
  { label: '28', value: 28 },
  { label: '32', value: 32 },
  { label: '48', value: 48 },
  { label: '64', value: 64 },
  { label: '72', value: 72 },
]

</script>

<template>
  <div class="text-panel-container">
    <div class="categories">
      <el-button @click="addText" :disabled="!!selectedElement">+ 添加文字</el-button>
      
      <div class="ctrl">
        <span>文字：</span>
        <el-input v-model="textProps.content" />
      </div>

      <div class="ctrl">
        <span style="flex-shrink: 0;">字體：</span>
        <el-select v-model="textProps.fontFamily" placeholder="Select" style="width: 100%;">
          <el-option
              v-for="font in availableFonts"
              :key="font"
              :label="font"
              :value="font"
          />
        </el-select>
      </div>
      
      <div class="ctrl">
        <span>顏色：</span>
        <el-color-picker v-model="textProps.color" :disabled="gradient.enabled" />
      </div>

      <div class="ctrl">
        <span>漸層：</span>
        <el-switch v-model="gradient.enabled" />
      </div>
      <div v-if="gradient.enabled" class="sub-controls">
        <div>
          <span>開始顏色：</span>
          <el-color-picker v-model="gradient.startColor" />
        </div>
        <div>
          <span>結束顏色：</span>
          <el-color-picker v-model="gradient.endColor" />
        </div>
        <div>
          <span>角度：</span>
          <el-slider v-model="gradient.angle" :min="0" :max="360" style="width: 140px;" />
        </div>
      </div>
      
      <div class="ctrl">
        <span>粗體：</span>
        <el-switch v-model="textProps.isBold" />
      </div>
      
      <div class="ctrl">
        <span style="flex-shrink: 0;">大小：</span>
        <el-select v-model="textProps.fontSize" placeholder="Select" style="width: 100%;">
          <el-option
              v-for="option in fontSizeOption"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
      </div>
      
      <div class="ctrl">
        <span style="flex-shrink: 0;">行距：</span>
        <el-slider v-model="textProps.lineHeight" :min="0.5" :max="3" :step="0.1" style="width: 100%;"/>
      </div>
      
      <div class="ctrl">
        <span style="flex-shrink: 0;">旋轉角度：</span>
        <el-slider v-model="textProps.rotation" :min="0" :max="360" style="width: 100%;"/>
      </div>

      <div class="ctrl">
        <span>陰影：</span>
        <el-switch v-model="shadow.enabled" />
      </div>
      <div v-if="shadow.enabled" class="sub-controls">
        <div>
          <span>陰影顏色：</span>
          <el-color-picker v-model="shadow.color" />
        </div>
        <div>
          <span>模糊：</span>
          <el-slider v-model="shadow.blur" :min="0" :max="50" style="width: 140px;" />
        </div>
        <div>
          <span>X位移：</span>
          <el-slider v-model="shadow.offsetX" :min="-50" :max="50" style="width: 140px;" />
        </div>
        <div>
          <span>Y位移：</span>
          <el-slider v-model="shadow.offsetY" :min="-50" :max="50" style="width: 140px;" />
        </div>
      </div>
      
      <div class="ctrl">
        <span>外框：</span>
        <el-switch v-model="stroke.enabled" />
      </div>
      <div v-if="stroke.enabled" class="sub-controls">
        <div>
          <span>外框顏色：</span>
          <el-color-picker v-model="stroke.color" />
        </div>
        <div>
          <span>粗細：</span>
          <el-slider v-model="stroke.width" :min="1" :max="20" style="width: 140px;" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-panel-container {
  display: flex;
  width: 280px;
  height: 100vh;
  justify-content: flex-start;
  flex-direction: column;
  background-color: #303030;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}
.categories {
  padding-top: 10px;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #ffffff;
  span {
    flex-shrink: 0;
    width: 80px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 260px;
  }
  .sub-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #444;
    border-radius: 4px;
    width: 260px;
    padding: 10px;
    box-sizing: border-box;
    div {
      display: flex;
      align-items: center;
    }
  }
}


</style>