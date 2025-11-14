<script setup lang="ts">
import {computed, ref} from "vue";
import { useAIGenStore } from "@/store/useAIGenStore.ts";
import {useEditorStore} from "@/store/editorStore.ts";
import type {IImageConfig} from "@/types.ts";
import { processBase64, processUrlToBase64} from "@/Utilities/FileProcessor.ts";
import {appearanceDefaults} from "@/config/settings.ts";
import {AlertMessage, PromptMessage} from "@/Utilities/AlertMessage.ts";
import NPanelButton from "@/components/Basic/NPanelButton.vue";
// import {calculateConstrainedSize} from "@/Utilities/useImageEditor.ts";

const aiGenStore = useAIGenStore();
const editorStore = useEditorStore();

const emit = defineEmits(['refresh']);

// const styles = ref([...appearanceDefaults.AIStyles]);

const originalImage = ref<{ image?: HTMLImageElement, base64?: string, id: number, blob?:Blob }|null>(null);
const prompt = ref<string>('');

const styles = computed(() => {
  console.log('styles');
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
const setupOriginalImage = () => {
  if (editorStore.selectedElement) {
    const id = editorStore.selectedElement.id;
    if (id && aiGenStore.hasOriginalImage(id)) {
      originalImage.value = aiGenStore.getOriginalImage(id) || null;
    }
  }
  return null;
}

const onSubmit = async () => {

  if (aiGenStore.remainingTries <= 0) {
    await AlertMessage("已經達到使用次數上限");
    return;
  }

  if (selectedStyle.value === -2) {
    editorStore.replaceSelectedElementImage(originalImage.value?.image as HTMLImageElement);
    emit('refresh');
    return;
  }
  if (selectedStyle.value === -1) {
    await AlertMessage("請選擇風格");
    return;
  }
  if (selectedStyle.value === 0 && !prompt.value) {
    const message = await PromptMessage("請輸入提示詞").catch(() => {
      return { action: "cancel", value: '' };
    });
    if (message.action === "confirm" && message.value.trim().length > 0) prompt.value = message.value;
    else await AlertMessage("必須輸入提示詞");
  }

  const config = editorStore.selectedElement?.config as IImageConfig;
  const id = editorStore.selectedElement?.id || 0;
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

    result = await aiGenStore.fetchGenerate({
      image,
      base64,
      id,
      materialId
    }, {
      choice: selectedStyle.value,
      prompt: prompt.value
    });
    if (result) {
      editorStore.replaceSelectedElementImage(await processBase64(result.image), result.image);
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
        <span class="remaining-tries">{{ aiGenStore.remainingTries}}</span>
      </div>
    </div>
    <div class="ai-select-stylize">
      <span class="label">風格轉換</span>
      
      <div class="stylize" :style="{
        'pointer-events': aiGenStore.isLoading ? 'none' : 'auto'
      }">
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
    </div>
    <NPanelButton :loading="aiGenStore.isLoading" @pointerup="onSubmit">{{ selectedStyle === -2 ? '還原' : '生成' }}</NPanelButton>
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

  .stylize {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    //justify-content: space-between;
    gap: 10px;
  }

  .label {
    flex-shrink: 0;
  }
  .item {
    width: 80px;
    height: auto;
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
.submit-btn {
  width: 100%;
  color: white;
  background-color: theme.$button-text-color;
  border-radius: 30px;
  border-color: theme.$button-text-color;
  &:hover {
    background-color: theme.$primary-color;
    border-color: theme.$button-text-color;
    color: theme.$button-text-color;
  }
}

</style>