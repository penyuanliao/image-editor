<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import { useImagesStore } from "../store/images.ts";
import { Delete } from "@element-plus/icons-vue";
import { ColorPicker } from "colorpickers";
import {ElementTypesEnum, type ITextConfig} from "../types.ts";
// import { ColorInputWithoutInstance } from "tinycolor2";

const gradientColor = ref("linear-gradient(90deg, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)");
const gradientData = ref({});

const props = defineProps<{ 
  controlEnabled: boolean
}>();

const emit = defineEmits(['addElement', 'update-element']);
const imagesStore = useImagesStore();
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
  content: '編輯文字',
  name: '文字',
  color: '#000000',
  isBold: false,
  isItalic: false,
  fontSize: 32,
  fontFamily: 'Arial',
  lineHeight: 1.2,
  rotation: 0,
  letterSpacing: 0,
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
  stops: [0, '#FF0000', 1, '#0000FF'],
  angle: 90
});

// --- Reactive State ---
const textProps = reactive(getDefaultTextProps());
const shadow = reactive(getDefaultShadow());
const stroke = reactive(getDefaultStroke());
const gradient = reactive(getDefaultGradient());

const selectedElement = computed(() => {
  if (imagesStore.selectedElements.length <= 0) return null;
  if (imagesStore.selectedElements.length > 1) return null;
  return imagesStore.selectedElements[0];
});

// --- Watchers for State Synchronization ---

// Watch for incoming element changes and update the panel UI
watch(() => selectedElement.value, (newEl) => {
  if (newEl && newEl.type === ElementTypesEnum.Text) {

    const newConfig = newEl.config as ITextConfig;
    // Update text properties
    textProps.content = newConfig.content;
    textProps.color = newConfig.color;
    textProps.isBold = newConfig.fontWeight === 'bold';
    textProps.isItalic = newConfig.fontItalic || false;
    textProps.fontSize = newConfig.fontSize || 12;
    textProps.fontFamily = newConfig.fontFamily || 'Arial';
    textProps.lineHeight = newConfig.lineHeight || 1.2;
    textProps.rotation = newConfig.rotation || 0;
    console.log(newEl.config, textProps.content);

    // Update shadow properties
    shadow.enabled = !!newConfig.shadowColor;
    if (shadow.enabled) {
      shadow.color = newConfig.shadowColor || '#000000';
      shadow.blur = newConfig.shadowBlur || 0;
      shadow.offsetX = newConfig.shadowOffsetX || 0;
      shadow.offsetY = newConfig.shadowOffsetY || 0;
    }

    // Update stroke properties
    stroke.enabled = !!newConfig.strokeColor;
    if (stroke.enabled) {
      stroke.color = newConfig.strokeColor || '#000000';
      stroke.width = newConfig.strokeWidth || 1;
    }

    // Update gradient properties
    gradient.enabled = !!newConfig.gradientEnabled;
    if (gradient.enabled) {
      gradient.startColor = newConfig.gradientStartColor || '#FF0000';
      gradient.endColor = newConfig.gradientEndColor || '#0000FF';
      gradient.angle = newConfig.gradientAngle || 90;
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
  if (selectedElement.value && selectedElement.value.type === ElementTypesEnum.Text) {
    const payload: any = {
      ...textProps,
      fontWeight: textProps.isBold ? 'bold' : 'normal',
      fontItalic: !!textProps.isItalic
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

  imagesStore.selectedElements = [];

  const element: any = {
    type: ElementTypesEnum.Text,
    name: '新文字',
    config: {
      ...textProps,
      fontWeight: textProps.isBold ? 'bold' : 'normal',
      fontItalic: textProps.isItalic
    }
  };

  if (shadow.enabled) {
    element.config.shadowColor = shadow.color;
    element.config.shadowBlur = shadow.blur;
    element.config.shadowOffsetX = shadow.offsetX;
    element.config.shadowOffsetY = shadow.offsetY;
  }

  if (stroke.enabled) {
    element.config.strokeColor = stroke.color;
    element.config.strokeWidth = stroke.width;
  }

  if (gradient.enabled) {
    element.config.gradientEnabled = true;
    element.config.gradientStartColor = gradient.startColor;
    element.config.gradientEndColor = gradient.endColor;
    element.config.gradientAngle = gradient.angle;
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
const rotationInDegrees = computed({
  get() {
    if (textProps && textProps.rotation) {
      // Convert radians to degrees and round to nearest integer
      return Math.round((textProps.rotation * 180) / Math.PI);
    }
    return 0;
  },
  set(degrees: number) {
    if (textProps) {
      // Convert degrees to radians
      textProps.rotation = (degrees * Math.PI) / 180;
    }
  },
});

const handleRemoveTextElement = () => {
  imagesStore.removeElements([imagesStore.selectedElements[0]!.id]);
  imagesStore.selectedElements = [];
}

interface ParsedGradient {
  type: string;
  angle: number;
  stops: (string | number)[];
}

/**
 * 將 linear-gradient 字串轉換為包含角度和顏色停止點的物件
 * @param gradientString - 例如 "linear-gradient(90deg, rgba(0,0,0,1) 0%, #fff 100%)"
 * @returns - 例如 { type: 'linear', angle: 90, stops: [0, 'rgba(0,0,0,1)', 1, '#fff'] }
 */
const parseGradientString = (gradientString: string): ParsedGradient | null => {
  // 1. 匹配漸層類型和內容
  const gradientMatch = gradientString.match(/(linear|radial)-gradient\((.*)\)/);
  if (!gradientMatch) return null;

  const type = gradientMatch[1]; // 'linear' 或 'radial'
  const inner = gradientMatch[2] || '';

  // 2. 分割出角度和顏色停止點
  const parts = inner.split(/,(?![^\(]*\))/); // 用逗號分割，但忽略括號內的逗號

  // 3. 提取並解析角度
  const angleString = (parts[0] || '').trim();
  let angle = 180; // CSS 預設 'to bottom' 是 180deg
  let stopsString = inner; // 預設整個 inner 都是 stops

  if (!type) return null;

  if (type === 'linear') {
    const angleMatch = angleString.match(/^(-?\d*\.?\d+)deg$/);
    if (angleMatch) {
      // 如果第一部分是角度，則解析它
      angle = parseFloat(angleMatch[1] || '180');
      stopsString = parts.slice(1).join(','); // 剩下的部分是顏色停止點
    }
  }

  // 4. 匹配所有顏色停止點 (例如 "rgba(...) 50%")
  const stopRegex = /(rgba?\(.+?\)|#[\da-fA-F]{3,8})\s*(\d*\.?\d+)%/g;
  const stops: { position: number; color: string }[] = [];
  let match;
  
  while ((match = stopRegex.exec(stopsString || '')) !== null) {
    stops.push({
      color: match[1] || '0',
      position: parseFloat(match[2] || '0') / 100, // 將 "100%" 轉為 1，並處理小數
    });
  }

  // 5. 根據位置排序
  stops.sort((a, b) => a.position - b.position);

  // 6. 扁平化為 [position, color, position, color, ...] 的格式
  const flatStops = stops.flatMap(stop => [stop.position, stop.color]);

  return {
    type,
    angle,
    stops: flatStops,
  };
};

const gradientColorChange = (value: string) => {
  const parsedResult = parseGradientString(value);
  console.log('gradientColorChange (raw):', gradientData.value);
  console.log('gradientColorChange (parsed):', parsedResult);
  if (parsedResult) {
    gradient.angle = parsedResult.angle;
    gradient.stops = parsedResult.stops;
  }
  if (selectedElement.value) {
    const config = selectedElement.value.config as ITextConfig;
    config.gradientAngle = gradient.angle;
    config.gradientType = parsedResult?.type || 'linear';
    config.gradientStops = gradient.stops;
  }
}

</script>

<template>
  <div class="text-panel-container">
    <div class="categories" v-if="!props.controlEnabled">
      <el-button @click="addText">+ 添加文字</el-button>
    </div>
    <div class="categories" v-if="props.controlEnabled">
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
<!--        <el-color-picker v-model="textProps.color" :disabled="gradient.enabled" />-->
        <ColorPicker use-type="pure" format="hex" v-model:pureColor="textProps.color"/>
      </div>

      <div class="ctrl">
        <span>漸層：</span>
        <el-switch v-model="gradient.enabled" />
      </div>
      <div v-if="gradient.enabled" class="sub-controls">
        <div>
          <span>顏色：</span>
          <ColorPicker
              use-type="gradient"
              v-model:gradientColor="gradientColor"
              @gradientColorChange="gradientColorChange"
          />
        </div>
      </div>
      
      <div class="ctrl">
        <span>粗體：</span>
        <el-switch v-model="textProps.isBold" />
      </div>
      <div>
        <span>斜體：</span>
        <el-switch v-model="textProps.isItalic"/>
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
        <span style="flex-shrink: 0;">字距：</span>
        <el-input-number v-model="textProps.letterSpacing" :controls="true" style="width: 100%;"/>
      </div>
      
      <div class="ctrl">
        <span style="flex-shrink: 0;">旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="true" style="width: 100%;"/>
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

      <div class="ctrl center">
        <el-tooltip content="刪除" placement="top" effect="dark">
          <el-button type="danger" :icon="Delete" circle @click="handleRemoveTextElement" />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-panel-container {
  display: flex;
  width: 280px;
  height: 100%;
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
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}


</style>