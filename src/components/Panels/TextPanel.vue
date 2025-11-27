<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import { useEditorStore } from "../../store/editorStore.ts";
import {Delete, Lock, Unlock} from "@element-plus/icons-vue";
import { ColorPicker } from "colorpickers";
import {ElementTypesEnum, type ICanvasElement, type ITextConfig} from "../../types.ts";
import NPanel from "../Basic/NPanel.vue";
import { availableFonts } from '@/config/fonts.ts';
import NPanelButton from "@/components/Basic/NPanelButton.vue";

// import { ColorInputWithoutInstance } from "tinycolor2";

const gradientColor = ref("linear-gradient(90deg, rgba(255, 0, 0, 1) 0%, rgba(0, 0, 255, 1) 100%)");
const gradientData = ref({});

const props = defineProps<{
  controlEnabled: boolean
}>();

const emit = defineEmits(['addElement', 'update-element']);
const editorStore = useEditorStore();

// --- Default State Factory ---
const getDefaultTextProps = () => ({
  content: '新增内文文本',
  name: '文字',
  color: '#000000',
  isBold: false,
  isItalic: false,
  fontSize: 32,
  fontFamily: 'Arial',
  lineHeight: 1.2,
  rotation: 0,
  opacity: 1,
  letterSpacing: 0,
  textAlign: 'center',
  x: 0,
  y: 0
});
// const getDefaultMutiColorTextProps = () => ({
//   segments: [
//     {
//       text: '新增内文',
//       color: '#FF0000',
//     },
//     {
//       text: '文本',
//       color: '#FF0000',
//     }
//   ],
//   ...getDefaultTextProps()
// });

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

const fontFamily = ref<string>(textProps.fontFamily);
const fontSelectRef = ref();

const selectedElement = computed(() => {
  if (editorStore.selectedElements.length <= 0) return null;
  if (editorStore.selectedElements.length > 1) return null;
  return editorStore.selectedElements[0];
});

/**
 * 根據傳入的 element 更新整個控制面板的 UI 狀態
 * @param element
 */
const updatePanelFromElement = (element: ICanvasElement | null) => {
  if (element && element.type === ElementTypesEnum.Text) {
    const config = element.config as ITextConfig;
    // Update text properties
    textProps.content = config.content;
    textProps.color = config.color;
    textProps.isBold = config.fontWeight === 'bold';
    textProps.isItalic = config.fontItalic || false;
    textProps.fontSize = config.fontSize || 12;
    textProps.fontFamily = config.fontFamily || 'Arial';
    textProps.lineHeight = config.lineHeight || 1.2;
    textProps.rotation = config.rotation || 0;
    textProps.opacity = typeof config.opacity === "number" ? config.opacity : 1;
    textProps.letterSpacing = config.letterSpacing || 0;
    textProps.x = config.x || 0;
    textProps.y = config.y || 0;
    textProps.textAlign = config.textAlign || 'center';

    // Update shadow properties
    shadow.enabled = !!config.shadowColor;
    if (shadow.enabled) {
      shadow.color = config.shadowColor || '#000000';
      shadow.blur = config.shadowBlur || 0;
      shadow.offsetX = config.shadowOffsetX || 0;
      shadow.offsetY = config.shadowOffsetY || 0;
    }

    // Update stroke properties
    stroke.enabled = !!config.strokeColor;
    if (stroke.enabled) {
      stroke.color = config.strokeColor || '#000000';
      stroke.width = config.strokeWidth || 1;
    }

    // Update gradient properties
    gradient.enabled = !!config.gradientEnabled;
    if (gradient.enabled) {
      gradient.startColor = config.gradientStartColor || '#FF0000';
      gradient.endColor = config.gradientEndColor || '#0000FF';
      gradient.angle = config.gradientAngle || 90;
    }
  } else {
    // Reset to default if no element is selected
    Object.assign(textProps, getDefaultTextProps());
    Object.assign(shadow, getDefaultShadow());
    Object.assign(stroke, getDefaultStroke());
    Object.assign(gradient, getDefaultGradient());
  }
}

// --- Watchers for State Synchronization ---

// Watch for incoming element changes and update the panel UI
watch(() => selectedElement.value, (newEl) => {
  updatePanelFromElement(newEl as ICanvasElement);
}, { deep: true });

// Watch for panel UI changes and emit updates to the parent
watch([textProps, shadow, stroke, gradient], () => {
  if (selectedElement.value && selectedElement.value.type === ElementTypesEnum.Text) {
    const payload: any = {
      ...textProps,
      fontWeight: textProps.isBold ? 'bold' : 'normal',
      fontItalic: textProps.isItalic
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

  editorStore.selectedElements = [];

  const element: any = {
    type: ElementTypesEnum.Text,
    name: '新文字',
    config: {
      ...getDefaultTextProps(),
      fontWeight: textProps.isBold ? 'bold' : 'normal',
      fontItalic: textProps.isItalic
    }
  };

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
const opacityInPercentage = computed({
  get() {
    return Math.round(textProps.opacity * 100);
  },
  set(percentage: number) {
    textProps.opacity = percentage / 100;
  }
});

const handleRemoveTextElement = () => {
  editorStore.removeElements([editorStore.selectedElements[0]!.id]);
  editorStore.selectedElements = [];
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
  const parts = inner.split(/,(?![^(]*\))/); // 用逗號分割，但忽略括號內的逗號

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
    handleSaveHistory();
  }
}

/**
 * 處理 el-select 下拉選單中的鍵盤事件。
 * 當按下向上或向下箭頭時，更新當前預覽的字體。
 * @param event - 鍵盤事件對象
 */
const handleFontSelectKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    const fontSelect = fontSelectRef.value;
    if (!fontSelect) return;
    const font = fontSelect.popperRef.querySelector(".is-hovering > span").textContent;
    if (font) {
      textProps.fontFamily = font;
    }
  }
};
/**
 * 處理 el-select 下拉選單的開啟和關閉。
 * @param visible
 */
const handleFontSelectVisibleChange = (visible: boolean) => {
  if (visible) {
    const inputEl = fontSelectRef.value;
    if (inputEl) {
      inputEl.focus();
      inputEl.$el.querySelector('input')
        ?.addEventListener('keydown', handleFontSelectKeyDown);
    }
  } else {
    const inputEl = fontSelectRef.value;
    if (inputEl) {
      inputEl.$el.querySelector('input')
        ?.removeEventListener('keydown', handleFontSelectKeyDown);
    }
    if (fontFamily.value !== textProps.fontFamily) {
      textProps.fontFamily = fontFamily.value;
      handleSaveHistory();
    }
  }
};
/**
 * 處理 el-select 下拉選單中的值改變。
 * @param value
 */
const handleFontSelectChange = (value: string) => {
  fontFamily.value = value;
};

onMounted(() => {
  updatePanelFromElement(selectedElement.value as ICanvasElement);
});

const handleLockAndUnlock = () => {
  if (editorStore.selectedElement?.config) {
    editorStore.selectedElement.config.draggable = !editorStore.selectedElement.config.draggable;
    if (!editorStore.selectedElement?.config.draggable) {
      editorStore.selectedElements = [];
    } else {
      editorStore.selectedElements = [editorStore.selectedElement];
    }
    editorStore.saveHistory();
  }

}
const handleSaveHistory = () => {
  console.log('handleSaveHistory');
  editorStore.saveHistory();
}
</script>

<template>
  <NPanel :searchEnabled="false" title="文字編輯" :padding="`${controlEnabled ? `30px 16px 0 16px` : `30px 35px 0 32px`}`">
    <div class="categories" v-if="!props.controlEnabled">
      <NPanelButton @click="addText">+ 添加文字</NPanelButton>
    </div>
    <div class="categories" v-if="props.controlEnabled">
      <div class="ctrl">
        <textarea class="text" v-model="textProps.content" :style="`text-align: ${textProps.textAlign}`" @change="handleSaveHistory" />
      </div>
      <div class="horizontal-line">
        <div class="ctrl">
          <span>X：</span>
          <el-input-number class="el-input" v-model="textProps.x" :controls="false" style="width: 100%" @change="handleSaveHistory" />
        </div>
        <div class="ctrl">
          <span>Y：</span>
          <el-input-number class="el-input" v-model="textProps.y" :controls="false" style="width: 100%" @change="handleSaveHistory"/>
        </div>
      </div>
      <div class="ctrl color-picker-rectangle">
        <el-select id="font-select"
                   v-model="fontFamily"
                   ref="fontSelectRef"
                   placeholder="Select"
                   @visible-change="handleFontSelectVisibleChange"
                   @change="handleFontSelectChange"
                   style="width: 70%;">
          <el-option
              v-for="font in availableFonts"
              :key="font"
              :label="font"
              :value="font"
              @mouseenter="() => textProps.fontFamily = font"
          />
        </el-select>
        <ColorPicker use-type="pure" format="hex" v-model:pureColor="textProps.color" @pureColorChange="handleSaveHistory"/>
      </div>
      <div class="ctrl">
        <el-select v-model="textProps.fontSize" placeholder="Select" style="width: 30%;" @change="handleSaveHistory">
          <el-option
              v-for="option in fontSizeOption"
              :key="option.value"
              :label="option.label"
              :value="option.value"
          />
        </el-select>
        <div>
          <el-tooltip
              content="粗體"
              placement="top">
            <el-checkbox-button class="el-checkbox-btn" v-model="textProps.isBold" @change="handleSaveHistory">
              <el-icon size="18">
                <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg"><path d="M5.114 3.471A1.319 1.319 0 0 0 4.2 1.2H1.92a.24.24 0 0 0-.24.24V6a.24.24 0 0 0 .24.24h2.64a1.44 1.44 0 0 0 .554-2.769M2.16 1.68H4.2a.84.84 0 0 1 0 1.68H2.16Zm2.4 4.08h-2.4V3.84h2.4a.96.96 0 0 1 0 1.92"/></svg>
              </el-icon>
            </el-checkbox-button>
          </el-tooltip>
          <el-tooltip
              content="斜體"
              placement="top">
            <el-checkbox-button class="el-checkbox-btn" v-model="textProps.isItalic" @change="handleSaveHistory">
              <el-icon size="18">
                <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg"><path d="M6 1.68a.24.24 0 0 1-.24.24H4.733l-1.28 3.84h.867a.24.24 0 0 1 0 .48h-2.4a.24.24 0 0 1 0-.48h1.027l1.28-3.84H3.36a.24.24 0 0 1 0-.48h2.4a.24.24 0 0 1 .24.24"/></svg>
              </el-icon>
            </el-checkbox-button>
          </el-tooltip>
        </div>
        <el-radio-group class="el-radio-group" v-model="textProps.textAlign" fill="#F15624" @change="handleSaveHistory">
          <el-tooltip
              content="靠左對齊"
              placement="top">
            <el-radio-button value="left">
              <el-icon size="24">
                <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg"><path d="M1.08 2.04a.12.12 0 0 1 .12-.12h5.28a.12.12 0 0 1 0 .24H1.2a.12.12 0 0 1-.12-.12m.12 1.32h3.84a.12.12 0 0 0 0-.24H1.2a.12.12 0 0 0 0 .24m5.28.96H1.2a.12.12 0 1 0 0 .24h5.28a.12.12 0 0 0 0-.24m-1.44 1.2H1.2a.12.12 0 1 0 0 .24h3.84a.12.12 0 0 0 0-.24"/></svg>
              </el-icon>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
              content="置中對齊"
              placement="top">
            <el-radio-button value="center">
              <el-icon size="24">
                <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg"><path d="M1.08 2.04a.12.12 0 0 1 .12-.12h5.28a.12.12 0 0 1 0 .24H1.2a.12.12 0 0 1-.12-.12m.84 1.08a.12.12 0 0 0 0 .24h3.84a.12.12 0 0 0 0-.24Zm4.56 1.2H1.2a.12.12 0 1 0 0 .24h5.28a.12.12 0 0 0 0-.24m-.72 1.2H1.92a.12.12 0 0 0 0 .24h3.84a.12.12 0 0 0 0-.24"/></svg>
              </el-icon>
            </el-radio-button>
          </el-tooltip>
          <el-tooltip
              content="靠右對齊"
              placement="top">
            <el-radio-button value="right">
              <el-icon size="24">
                <svg width="24" height="24" viewBox="0 0 7.68 7.68" xmlns="http://www.w3.org/2000/svg"><path d="M1.08 2.04a.12.12 0 0 1 .12-.12h5.28a.12.12 0 0 1 0 .24H1.2a.12.12 0 0 1-.12-.12m5.4 1.08H2.64a.12.12 0 0 0 0 .24h3.84a.12.12 0 0 0 0-.24m0 1.2H1.2a.12.12 0 1 0 0 .24h5.28a.12.12 0 0 0 0-.24m0 1.2H2.64a.12.12 0 1 0 0 .24h3.84a.12.12 0 0 0 0-.24"/></svg>
              </el-icon>
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </div>
      <div class="ctrl slider-with-input">
        <span>透明度：</span>
        <el-slider
            v-model="opacityInPercentage"
            :show-input-controls="false"
            style="width: 100%"
            show-input
            size="small"
            :format-tooltip="(value: number) => value + '%'"
            :format-value-text="(value: number) => value + '%'"
            @change="handleSaveHistory"
        />
      </div>
      <div class="ctrl">
        <span>漸層：</span>
        <el-switch v-model="gradient.enabled" @change="handleSaveHistory"/>
      </div>
      <div v-if="gradient.enabled" class="sub-controls">
        <div class="color-picker-rectangle">
          <span>顏色：</span>
          <ColorPicker
              use-type="gradient"
              v-model:gradientColor="gradientColor"
              @gradientColorChange="gradientColorChange"
          />
        </div>
      </div>
      <div class="ctrl slider-with-input">
        <span style="flex-shrink: 0;">行距：</span>
        <el-slider
            v-model="textProps.lineHeight"
            :show-input-controls="false"
            show-input
            :min="0.5"
            :max="2.5"
            :step="0.01"
            style="width: 100%;"
            @change="handleSaveHistory"
        />
      </div>
      <div class="ctrl slider-with-input">
        <span style="flex-shrink: 0;">字距：</span>
        <el-slider
            v-model="textProps.letterSpacing"
            :show-input-controls="false"
            show-input
            :min="0"
            :max="800"
            :step="1"
            style="width: 100%;"
            @change="handleSaveHistory"
        />
      </div>
      <div class="ctrl">
        <span style="flex-shrink: 0;">旋轉角度：</span>
        <el-input-number v-model="rotationInDegrees" :controls="true" style="width: 100%;" @change="handleSaveHistory"/>
      </div>
      <div class="ctrl">
        <span>陰影：</span>
        <el-switch v-model="shadow.enabled" @change="handleSaveHistory"/>
      </div>
      <div v-if="shadow.enabled" class="sub-controls">
        <div class="color-picker-square">
          <span>陰影顏色：</span>
          <ColorPicker use-type="pure" format="hex" v-model:pureColor="shadow.color" @pureColorChange="handleSaveHistory"/>
        </div>
        <div>
          <span>模糊：</span>
          <el-slider v-model="shadow.blur" :min="0" :max="50" style="width: 140px;" @change="handleSaveHistory"/>
        </div>
        <div>
          <span>X位移：</span>
          <el-slider v-model="shadow.offsetX" :min="-50" :max="50" style="width: 140px;" @change="handleSaveHistory"/>
        </div>
        <div>
          <span>Y位移：</span>
          <el-slider v-model="shadow.offsetY" :min="-50" :max="50" style="width: 140px;" @change="handleSaveHistory"/>
        </div>
      </div>

      <div class="ctrl">
        <span>外框：</span>
        <el-switch v-model="stroke.enabled" @change="handleSaveHistory"/>
      </div>
      <div v-if="stroke.enabled" class="sub-controls">
        <div class="color-picker-square">
          <span>外框顏色：</span>
          <ColorPicker use-type="pure" format="hex" v-model:pureColor="stroke.color" @pureColorChange="handleSaveHistory"/>
        </div>
        <div>
          <span>粗細：</span>
          <el-slider v-model="stroke.width" :min="1" :max="20" style="width: 140px;" @change="handleSaveHistory"/>
        </div>
      </div>
      <div class="ctrl center">
        <div class="lockAndUnlock">
          <el-tooltip :content="`${editorStore.selectedElement?.config.draggable ? '鎖定' : '解鎖'}`" placement="top" :auto-close="500">
            <el-button text @click="handleLockAndUnlock" style="width: 32px;">
              <template #icon>
                <el-icon>
                  <Unlock v-if="editorStore.selectedElement?.config.draggable"/>
                  <Lock v-else/>
                </el-icon>
              </template>
            </el-button>
          </el-tooltip>
        </div>
        <el-tooltip content="刪除" placement="top" effect="dark">
          <el-button type="danger" :icon="Delete" circle @click="handleRemoveTextElement" />
        </el-tooltip>
      </div>
    </div>
  </NPanel>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.categories {
  padding-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: black;
  span {
    flex-shrink: 0;
    width: 80px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
    span {
      flex-shrink: 0;
      width: 30%;
    }
    .text {
      position: relative;
      width: 100%;
      min-height: 80px;
    }
  }
  .ctrl textarea {
    position: relative;
    width: 100%;
    min-height: 80px;
    background-color: white;
    border: 1px solid theme.$border-color-base;
    margin: 0 0;
    padding: 10px 10px;
    text-align: center;
    outline: none;
    box-sizing: border-box;
    z-index: 10;
    white-space: nowrap;
  }
  .sub-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid theme.$border-color-base;
    border-radius: 4px;
    width: 100%;
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
.horizontal-line {
  display: flex;
  position: relative;
  width: 100%;
  min-height: 0;
  flex-direction: row;
  gap: 10px;
  }
.el-radio-group :deep(.el-radio-button__inner) {
  padding: 4px;
  &:hover {
    color: black;
  }
}
.ctrl :deep(.el-checkbox-button__inner) {
  padding: 8px 10px;
  border-left: 1px solid var(--el-border-color);
}

.el-checkbox-btn.is-checked :deep(.el-checkbox-button__inner) {
  background-color: #F15624;
  color: white;
  border-color: #f15624;
  box-shadow: 0 0 0 1px white;
}
.el-checkbox-btn :deep(.el-checkbox-button__inner) {
  border-color: theme.$border-color-base;
}
</style>