<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useAIGenStore} from "@/store/useAIGenStore.ts";
import {useEditorStore} from "@/store/editorStore.ts";
import type {IImageConfig} from "@/types.ts";
import {processBase64, processUrlToBase64} from "@/Utilities/FileProcessor.ts";
import {appearanceDefaults} from "@/config/settings.ts";
import { AlertMessage } from "@/Utilities/AlertMessage.ts";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
import Symbols from "@/components/Basic/Symbols.vue";
// import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";

const aiGenStore = useAIGenStore();
const editorStore = useEditorStore();

const emit = defineEmits(['refresh']);

const originalImage = ref<{ image?: HTMLImageElement, base64?: string, id: string, blob?: Blob } | null>(null);
const prompt = ref<string>('');
const activeName = ref('mod1');

const styles = computed(() => {
  const list = [];
  if (originalImage.value) list.push({
    name: '原始圖片',
    value: -2,
    key: 'original',
    url: originalImage.value.image?.src
  });

  return [...list, ...appearanceDefaults.AIStyles];
})

const selectedStyle = ref<number>(-1);

const selectStyle = (style: number) => {
  selectedStyle.value = style;
  if (selectedStyle.value !== 0) {
    prompt.value = '';
  }
};

const tabsChangeHandle = () => {
  if (activeName.value === 'mod3') {
    selectedStyle.value = 0;
  }
}

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
}
watch(() => editorStore.selectedElement, () => {
  setupOriginalImage();
})

const onSubmit = async () => {

  if (!editorStore.selectedElement) return;

  const elementId = editorStore.selectedElement?.id;
  if (aiGenStore.remainingTries <= 0) {
    await AlertMessage("已經達到使用次數上限");
    return;
  }

  if (selectedStyle.value === -2) {
    editorStore.replaceSelectedElementImage(elementId, originalImage.value?.image as HTMLImageElement);
    emit('refresh');
    return;
  }
  if (selectedStyle.value === -1) {
    await AlertMessage("請選擇風格");
    return;
  }
  if (selectedStyle.value === 0 && !prompt.value) {
    // const message = await PromptMessage("請輸入提示詞").catch(() => {
    //   return {action: "cancel", value: ''};
    // });
    // if (message.action === "confirm" && message.value.trim().length > 0) prompt.value = message.value;
    if (prompt.value.length === 0) {
      await AlertMessage("必須輸入提示詞");
      return;
    }
  }

  const config = editorStore.selectedElement?.config as IImageConfig;
  const url = config.url;
  if (config) {
    const materialId = config.id || -1;
    let image: HTMLImageElement = config.img as HTMLImageElement;
    let base64: string = '';
    let result;
    if (materialId <= 0) {
      if ((!config.img || !config.base64)) {
        const load = await processUrlToBase64(config.url || '');
        image = load.image;
        base64 = load.base64;
      } else {
        image = config.img;
        base64 = config.base64;
      }
    }
    const source = {
      image,
      base64,
      id: elementId,
      materialId,
      url
    };
    result = await aiGenStore.fetchGenerate(source, {
      choice: selectedStyle.value,
      prompt: prompt.value
    });
    if (result) {
      const genImage = await processBase64(result.image);
      editorStore.addImage({
        imageUrl: genImage.src,
        image: genImage, // 儲存圖片物件
        name: 'AI生成圖片',
        base64: result.image
      });
      const newId = editorStore.replaceSelectedElementImage(elementId, genImage, result.image);
      if (newId) aiGenStore.setOriginalImage(newId, source);
      console.log(newId);
      emit('refresh');
      setupOriginalImage();
    } else {
      await AlertMessage(aiGenStore.error || 'AI生成');
    }
  }
}
</script>

<template>
  <div class="images-gallery-container">
    <div class="heading">
      <h2>AI生成</h2>
      <div class="description">
        <span class="text">您今日AI换图剩余次数: </span>
        <span class="remaining-tries">{{ aiGenStore.remainingTries }}</span>
      </div>
    </div>
    <div class="ai-select-stylize">
      <el-tabs v-model="activeName" @tab-change="tabsChangeHandle">
        <el-tab-pane label="物件转变" name="mod1">
          <div class="stylize" :style="{ 'pointer-events': aiGenStore.isLoading ? 'none' : 'auto' }">
            <div
                v-for="style in styles"
                :key="style.key"
                class="item"
                @click="selectStyle(style.value)"
            >
              <div
                  class="image"
                  :class="{ selected: selectedStyle === style.value }"
              >
                <img :src="style.url" alt=""/>
              </div>
              <span>{{ style.name }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="风格调整" name="mod2">
          <div class="style-adjustment">
            <span>即將推出</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="自订生成" name="mod3">
          <div class="prompt-content">
            <textarea
                class="prompt-textarea"
                type="textarea"
                :rows="14"
                placeholder="请输入您想产生的图片主题或描述(例如: 金色龙、轮盘、3D吉祥物...)"
                v-model="prompt"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <NPanelButton :loading="aiGenStore.isLoading"
                  :disabled="selectedStyle === -1 || selectedStyle === 0 && prompt.trim().length === 0"
                  @click="onSubmit">
      <template #default>
        {{ selectedStyle === -2 ? '還原' : '生成' }}
      </template>
      <template #icon>
        <el-icon size="22" :style="{ 'padding-right': '10px' }">
          <Symbols name="magic"/>
        </el-icon>
      </template>
    </NPanelButton>
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
      content: '';
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
</style>