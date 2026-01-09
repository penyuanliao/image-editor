<script setup lang="ts">
import { computed, ref, watch, reactive, onMounted } from "vue";
import { type IGenerateSource, useAIGenStore } from "@/store/useAIGenStore.ts";
import { useEditorStore } from "@/store/editorStore.ts";
import { type IImageConfig, ImageGenModeEnum } from "@/types.ts";
import { processBase64, processUrlToBase64 } from "@/Utilities/FileProcessor.ts";
import { appearanceDefaults } from "@/config/settings.ts";
import { AlertMessage } from "@/Utilities/AlertMessage.ts";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
import Symbols from "@/components/Basic/Symbols.vue";
import { ColorPicker } from "colorpickers";
import type { ImageGenerateResult } from "@/api/generate.ts";
// import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";

const aiGenStore = useAIGenStore();

const editorStore = useEditorStore();

const emit = defineEmits(["refresh"]);

const StyleGenTypes = {
  convert: "convert",
  style: "style",
  custom: "custom"
};

// 生成型態
const imageGenMode = computed(() => {
  const config = editorStore.selectedElement?.config as IImageConfig;
  return config.imageGenMode || ImageGenModeEnum.NONE;
});
const originalImage = ref<{
  image?: HTMLImageElement;
  base64?: string;
  id: string;
  blob?: Blob;
} | null>(null);

const styles = computed(() => {
  const list = [];
  if (originalImage.value)
    list.push({
      name: "原始圖片",
      value: -2,
      key: "original",
      url: originalImage.value.image?.src
    });

  return [...list, ...appearanceDefaults.AIStyles];
});

// 套色模組
const genColorConfig = ref({
  color: "#000000"
});
// 風格模組: 物件轉變、風格調整、自訂生成
const genStyleConfig = reactive({
  type: StyleGenTypes.convert,
  style: -1, // 選擇風格類型
  prompt: ""
});
// 設定風格或物件的編號
const selectStyle = (style: number) => {
  genStyleConfig.style = style;
  if (genStyleConfig.style !== 0) {
    genStyleConfig.prompt = "";
  }
};
// 切換AI生成風格檢查
const handleTabsChange = () => {
  if (genStyleConfig.type === StyleGenTypes.custom) {
    genStyleConfig.style = 0;
  }
};
// 初始化風格清單如果有產生過新增原始圖片到清單內
const setupOriginalImage = () => {
  if (editorStore.selectedElement) {
    const id = editorStore.selectedElement.id;
    if (id && aiGenStore.hasOriginalImage(id)) {
      originalImage.value = aiGenStore.getOriginalImage(id) || null;
    } else {
      originalImage.value = null;
    }
  } else {
    originalImage.value = null;
  }
};
// 檢查是否可送出
const isSubmit = () => {
  console.log(`
    imageGenMode: ${imageGenMode.value}
    selectedStyle: ${genStyleConfig.style}
    prompt: ${genStyleConfig.prompt}
  `);
  if (imageGenMode.value === ImageGenModeEnum.COLOR) {
    return genColorConfig.value.color !== "";
  } else if (imageGenMode.value === ImageGenModeEnum.STYLE) {
    if (genStyleConfig.style === -1) return false;
    if (genStyleConfig.style === 0 && !genStyleConfig.prompt) return false;
  } else if (imageGenMode.value === ImageGenModeEnum.CUSTOM) {
    if (genStyleConfig.style !== 0) return false;
  }

  return true;
};
// 產生圖片相關資料
const createSource = async (): Promise<{
  image: HTMLImageElement;
  id: string;
  materialId: number;
  base64: string;
  url?: string;
  color?: string;
} | null> => {
  const elementId = editorStore.selectedElement?.id || "";
  const config = editorStore.selectedElement?.config as IImageConfig;
  if (!config || !elementId) return null;

  const materialId = config.id || -1;
  let image: HTMLImageElement = config.img as HTMLImageElement;
  let base64: string = "";
  if (materialId <= 0) {
    if (!config.img || !config.base64) {
      const load = await processUrlToBase64(config.url || "");
      image = load.image;
      base64 = load.base64;
    } else {
      image = config.img;
      base64 = config.base64;
    }
  }

  return {
    image,
    base64,
    id: elementId,
    materialId,
    url: config.url
  };
};

const validate = async () => {
  if (aiGenStore.remainingTries <= 0) {
    await AlertMessage("已經達到使用次數上限");
    return false;
  }
  return true;
};
// 設定AI生成圖片至畫布
const setupAddElement = async (result: ImageGenerateResult) => {
  const genImage = await processBase64(result.image);
  editorStore.addImage({
    imageUrl: genImage.src,
    image: genImage, // 儲存圖片物件
    name: "AI生成圖片",
    base64: result.image
  });
  return genImage;
};
// 設定生成圖片至畫布並更新原始圖片至快取
const setupChangeImage = async (
  elementId: string,
  source: IGenerateSource,
  result?: ImageGenerateResult
) => {
  if (result) {
    // 產生HTMLImageElement並加入最近使用清單
    const genImage = await setupAddElement(result);
    // 紀錄原始圖片
    const newId = editorStore.replaceSelectedElementImage(elementId, genImage, result.image);
    if (newId) aiGenStore.setOriginalImage(newId, source);
    // 刷新畫布
    emit("refresh");
    // 更新原始圖片
    setupOriginalImage();
  } else {
    await AlertMessage(aiGenStore.error || "AI生成失敗了!求求你再給他一次機會");
  }
};
// 送出風格轉換生成
const onSubmitStyle = async () => {
  if (!editorStore.selectedElement) return false;
  if (!(await validate())) return;

  const elementId = editorStore.selectedElement?.id;

  if (genStyleConfig.style === -2) {
    editorStore.replaceSelectedElementImage(
      elementId,
      originalImage.value?.image as HTMLImageElement
    );
    emit("refresh");
    return;
  }
  if (genStyleConfig.style === -1) {
    await AlertMessage("請選擇風格");
    return;
  }
  if (genStyleConfig.style === 0 && !genStyleConfig.prompt) {
    if (genStyleConfig.prompt.length === 0) {
      await AlertMessage("必須輸入提示詞");
      return;
    }
  }
  // 設定參數
  const source = await createSource();
  if (!source) return;
  const result = await aiGenStore.fetchGenerate(source, {
    choice: genStyleConfig.style,
    prompt: genStyleConfig.prompt
  });
  if (result) {
    await setupChangeImage(elementId, source, result);
  } else {
    await AlertMessage(aiGenStore.error || "AI生成失敗了!求求你再給他一次機會");
  }
};
// 送出顏色置換生成
const onSubmitColor = async () => {
  if (!editorStore.selectedElement) return false;
  if (!(await validate())) return;
  const elementId = editorStore.selectedElement?.id;

  const source = await createSource();
  if (!source) return;
  const result = await aiGenStore.fetchGenerate(source, {
    color: genColorConfig.value.color
  });
  if (result) {
    await setupChangeImage(elementId, source, result);
  } else {
    await AlertMessage(aiGenStore.error || "AI生成失敗了!求求你再給他一次機會");
  }
};
// 送出移除背景生成
const onSubmitMask = async () => {
  if (!editorStore.selectedElement) return false;
  if (!(await validate())) return;
  const elementId = editorStore.selectedElement?.id;
  const source = await createSource();
  if (!source) return;
  const result = await aiGenStore.fetchGenerate(source, {
    mask: true
  });
  if (result) {
    await setupChangeImage(elementId, source, result);
  } else {
    await AlertMessage(aiGenStore.error || "AI生成失敗了!求求你再給他一次機會");
  }
};
// 送出生成模式選擇
const onSubmit = async () => {
  if (imageGenMode.value === ImageGenModeEnum.COLOR) {
    await onSubmitColor();
  } else {
    await onSubmitStyle();
  }
};

watch(
  () => editorStore.selectedElement,
  () => {
    setupOriginalImage();
  }
);

onMounted(() => {
  setupOriginalImage();
});
</script>

<template>
  <div v-if="imageGenMode != ImageGenModeEnum.NONE" class="images-gallery-container">
    <div class="heading">
      <h2>AI生成</h2>
      <div class="description">
        <span class="text">您今日AI换图剩余次数: </span>
        <span class="remaining-tries">{{ aiGenStore.remainingTries }}</span>
      </div>
    </div>
    <div class="content">
      <div
        v-if="imageGenMode === ImageGenModeEnum.STYLE || imageGenMode === ImageGenModeEnum.CUSTOM"
        class="ai-select-stylize"
      >
        <el-tabs v-model="genStyleConfig.type" @tab-change="handleTabsChange">
          <el-tab-pane label="物件转变" :name="StyleGenTypes.convert">
            <div
              class="stylize"
              :style="{ 'pointer-events': aiGenStore.isLoading ? 'none' : 'auto' }"
            >
              <div
                v-for="style in styles"
                :key="style.key"
                class="item"
                @click="selectStyle(style.value)"
              >
                <div class="image" :class="{ selected: genStyleConfig.style === style.value }">
                  <img :src="style.url" alt="" />
                </div>
                <span>{{ style.name }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="风格调整" :name="StyleGenTypes.style">
            <div class="style-adjustment">
              <span>即將推出</span>
            </div>
          </el-tab-pane>
          <el-tab-pane label="自订生成" :name="StyleGenTypes.custom">
            <div class="prompt-content">
              <textarea
                class="prompt-textarea"
                type="textarea"
                :rows="14"
                placeholder="请输入您想产生的图片主题或描述(例如: 金色龙、轮盘、3D吉祥物...)"
                v-model="genStyleConfig.prompt"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-if="imageGenMode === ImageGenModeEnum.COLOR" class="ai-select-color">
        <ColorPicker
          v-model:pureColor="genColorConfig.color"
          v-bind="{ isWidget: true, disableAlpha: true, disableHistory: true }"
          style="box-shadow: none"
        />
      </div>
      <div class="footer">
        <NPanelButton :loading="aiGenStore.isLoading" :disabled="!isSubmit()" @click="onSubmit">
          <template #default>
            {{ genStyleConfig.style === -2 ? "還原" : "生成" }}
          </template>
          <template #icon>
            <el-icon size="22" :style="{ 'padding-right': '10px' }">
              <Symbols name="magic" />
            </el-icon>
          </template>
        </NPanelButton>
        <NPanelButton
          :loading="aiGenStore.isLoading"
          v-if="imageGenMode === ImageGenModeEnum.CUSTOM"
          @click="onSubmitMask()"
        >
          <template #default> 移除影像背景 </template>
          <template #icon>
            <el-icon size="22" :style="{ 'padding-right': '10px' }">
              <Symbols name="magic" />
            </el-icon>
          </template>
        </NPanelButton>
      </div>
      <div class="mask" v-if="aiGenStore.isLoading">正在執行BB AI素材生成...</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.images-gallery-container {
  display: flex;
  width: 100%;
  justify-content: flex-start;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  overflow-y: hidden;
  padding-bottom: 24px;

  &::-webkit-scrollbar {
    display: none;
  }
}

.heading {
  display: flex;
  position: relative;
  width: 100%;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-between;

  h2 {
    font-size: 21px;
    font-weight: 400;
  }

  .description {
    min-width: 0;
  }

  .text {
    font-size: 15px;
    font-weight: 400;
    color: theme.$text-color;
  }

  .remaining-tries {
    font-size: 15px;
    font-weight: 400;
    color: theme.$button-text-color;
  }
}

.content {
  width: 100%;
  height: 100%;
  position: relative;
}
.mask {
  background-color: rgba(0, 0, 0, 0.75);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 10px;
  z-index: 100;
}

.ai-select-stylize {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  min-height: 302px;

  .stylize {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    //justify-content: space-between;
    gap: 10px;
    width: 100%;
    position: relative;
    align-content: flex-start;
  }

  .label {
    flex-shrink: 0;
  }

  .item {
    width: 80px;
    height: fit-content;
    display: flex;
    position: relative;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: center;
    cursor: pointer;
  }

  .image {
    position: relative;
    display: flex;
    width: 80px;
    height: 80px;
    max-height: 80px;
    max-width: 80px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 4px;
    margin-top: 5px;
    margin-bottom: 5px;
    box-sizing: border-box;
    overflow: hidden;

    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }

    &:hover {
      background-color: rgba(80, 80, 80, 0.6);

      &:after {
        border: 2px solid #f15624;
      }
    }

    &.selected:after {
      border: 2px solid #f15624;
    }

    &:after {
      content: "";
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      box-sizing: border-box;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.ai-select-color {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: 16px;
  min-height: 302px;
  z-index: 0;
}
:deep(.vc-colorpicker) {
  box-shadow: none;
}

.style-adjustment {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.prompt-content {
  position: relative;
  height: 100%;
}
.prompt-textarea {
  min-height: 200px;
  width: 100%;
  position: relative;
  border: 1px solid theme.$border-color-base;
  border-radius: 10px;
  margin: 0;
  outline: none;
  box-sizing: border-box;
  z-index: 10;
  overflow: hidden;
  resize: none;
  padding: 10px 10px;
  font-size: 16px;
}

:deep(.el-tabs__item.is-active) {
  color: #f15624;
}

:deep(.el-tabs__active-bar) {
  background-color: #f15624;
}
:deep(.el-tabs__item) {
  font-size: 16px; /* 在這裡調整你想要的字體大小 */
  font-weight: 500;
}
.footer {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.el-button + .el-button {
  margin-left: 0;
  margin-top: 10px;
}
</style>
