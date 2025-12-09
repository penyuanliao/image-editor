<script setup lang="ts">
import { ref, watch } from "vue";
import gsap from "gsap";
import CategoriesGroupView from "@/components/Panels/MaterialPanel/CategoriesGroupView.vue";
import CategoriesView from "@/components/Panels/MaterialPanel/CategoriesView.vue";
import CategoryGalleryView from "@/components/Panels/MaterialPanel/CategoryGalleryView.vue";
import {Back, Close, Search} from "@element-plus/icons-vue";
import {useMaterialsStore} from "@/store/useMaterialsStore.ts";
import {ElementTypesEnum} from "@/types.ts";
import NSearchButton from "@/components/Basic/NSearchButton.vue";
const materialsStore = useMaterialsStore();

const emit = defineEmits<{ (e: 'add-element', action: any): void }>();
const selectedIndex = ref(0);
const contentWrapper = ref<HTMLDivElement | null>(null);
const title = ref<string>('');
const subTitle = ref<string>('');
const input = ref<string>('');

const handleViewClick = (index: number) => {
  // 當返回時，清空對應層級的標題
  if (index < 2) {
    subTitle.value = '';
  }
  if (index < 1) {
    title.value = '';
  }
  selectedIndex.value = index;
};

const handleMoreClick = (name: string) => {
  selectedIndex.value = 2;
  subTitle.value = name;
}

const handleCategoriesGroupChange = (value: { id: number, name: string, index: number }) => {
  console.log('handleCategoriesGroupChange', value);
  title.value = value.name;
  selectedIndex.value = 1;
  materialsStore.selectedMaterialGroup.value = value.index;
};

const handleImageChange = (value: { id: number, src: string, name: string }) => {
  emit('add-element', {
    type: ElementTypesEnum.Image,
    config: {
      url: value.src,
      id: value.id,
      x: 0,
      y: 0,
    }, name: value.name
  });
}

watch(selectedIndex, (newIndex) => {
  if (contentWrapper.value) {
    const viewWidth = contentWrapper.value.children[0]?.clientWidth || 0;
    gsap.to(contentWrapper.value, {
      x: -newIndex * viewWidth,
      duration: 0.4,
      ease: "power2.inOut",
    });
  }
});
</script>

<template>
  <div class="view-container">
    <div class="content-wrapper" ref="contentWrapper">
      <div class="view scroll-bar-hidden">
        <div class="content">
          <NSearchButton v-bind:input="input"/>
          <p>請選擇分類</p>
          <CategoriesGroupView @change="handleCategoriesGroupChange"/>
        </div>
      </div>
      <div class="view scroll-bar-hidden">
        <div class="header">
          <el-button class="back" @click="handleViewClick(0)">
            <template #icon>
              <el-icon size="24"><Back /></el-icon>
            </template>
          </el-button>
          <h2>{{ title }}</h2>
        </div>
        <div class="content">
          <NSearchButton v-bind:input="input"/>
          <CategoriesView
              @change="handleImageChange"
              @more="handleMoreClick" />
        </div>
      </div>
      <div class="view scroll-bar-hidden">
        <div class="header">
          <el-button class="back" @click="handleViewClick(1)">
            <template #icon>
              <el-icon size="24"><Back /></el-icon>
            </template>
          </el-button>
          <h2>{{ subTitle }}</h2>
        </div>
        <div class="content">
          <NSearchButton v-bind:input="input"/>
          <CategoryGalleryView @change="handleImageChange"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.view-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  color: theme.$text-color;
}

.content-wrapper {
  display: flex;
  position: relative;
  height: 100%;
}
.view {
  display: flex;
  flex-direction: column;
  width: 100%; /* 寬度由父層 sidebar-content 決定 */
  flex-shrink: 0; /* 防止 flex item 被壓縮 */
  padding: 0 22px 120px 20px;
  box-sizing: border-box;
  min-height: 400px; /* 保持最小高度 */
  overflow: auto;
  .header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 30px;
    padding: 40px 0 5px 0;
    gap: 5px;
  }
  .content {
    flex: 1;
    //display: flex;
  }
  .back {
    border: none;
    background-color: transparent;
    &:hover {
      border-color: theme.$border-color-base;
      background-color: theme.$border-color-base;
      color: theme.$button-text-color;
    }
  }
}


</style>