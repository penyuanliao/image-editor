<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import gsap from "gsap";
import CategoriesGroupView from "@/components/Panels/MaterialPanel/CategoriesGroupView.vue";
import CategoryGalleryView from "@/components/Panels/MaterialPanel/CategoryGalleryView.vue";
import { useMaterialsStore } from "@/store/useMaterialsStore.ts";
import { ElementTypesEnum, type IUploadedImage } from "@/types.ts";
import NSearchButton from "@/components/Basic/NSearchButton.vue";
import NCarouselView from "@/components/Panels/MaterialPanel/NCarouselView.vue";
const materialsStore = useMaterialsStore();

const emit = defineEmits<{
  (e: "add-element", action: any): void,
  (e: "add-recently-image", action: IUploadedImage): void
}>();
// 目前頁面控制流程
const NAV_CTRL_STEPS = {
  GROUP_VIEW: 0, // 分類頁面
  GALLERY_VIEW: 1, // 分類圖庫頁面
  SEARCH_VIEW: 2 // 搜尋頁面
};

const contentWrapper = ref<HTMLDivElement | null>(null);

const galleryViewRef = ref<HTMLDivElement>();
// 目前頁面
const currentStep = ref(NAV_CTRL_STEPS.GROUP_VIEW);
// 分類名稱
const categoryName = ref<string>("");
// 搜尋字串
const input = ref<string>("");

const handleViewClick = (step: number) => {
  currentStep.value = step;
  input.value = "";
  materialsStore.searchValue = "";
};

const handleCategoriesGroupChange = (value: {
  categoryIndex: number;
  category: string;
  groupIndex: number;
}) => {
  categoryName.value = value.category;
  materialsStore.selectedMaterialGroup.value = value.groupIndex;
  materialsStore.selectedCategoryIndex = value.categoryIndex;
  currentStep.value = NAV_CTRL_STEPS.GALLERY_VIEW;
};
const handleRecentlyImageChange = (value: IUploadedImage) => {
  console.log(value);
  emit("add-recently-image", value);
};
const handleImageChange = (value: {
  id: number;
  src: string;
  name: string;
  imageGenMode: number;
}) => {
  emit("add-element", {
    type: ElementTypesEnum.Image,
    config: {
      url: value.src,
      id: value.id,
      x: 0,
      y: 0,
      imageGenMode: value.imageGenMode
    },
    name: value.name
  });
};
// 資料搜尋
const handleInputChange = (value: string) => {
  console.log(value);
  if (value) {
    materialsStore.searchValue = value;
    currentStep.value = NAV_CTRL_STEPS.SEARCH_VIEW;
  }
};
// 清除搜尋
const handleInputClear = () => {
  materialsStore.searchValue = "";
  currentStep.value = NAV_CTRL_STEPS.GROUP_VIEW;
}

onMounted(async () => {
  await materialsStore.getMaterials();

  if (galleryViewRef.value) {
    galleryViewRef.value.addEventListener("scrollend", () => {
      // TODO: 未來分頁模式從這邊檢查
    });
    galleryViewRef.value.addEventListener("scroll", () => {
      // TODO: 未來分頁模式從這邊檢查
    });
  }
});

watch(currentStep, (newIndex) => {
  if (contentWrapper.value) {
    const viewWidth = contentWrapper.value.children[0]?.clientWidth || 0;
    gsap.to(contentWrapper.value, {
      x: -newIndex * viewWidth,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        if (currentStep.value === 0) categoryName.value = "";
      }
    });
  }
});
</script>

<template>
  <div class="view-container">
    <div class="content-wrapper" ref="contentWrapper">
      <section class="view scroll-bar-hidden">
        <div class="content">
          <NSearchButton v-model:input="input" @change="handleInputChange"/>
          <p>最近使用過的素材</p>
          <div class="recently-used">
            <NCarouselView @change="handleRecentlyImageChange"/>
          </div>
          <CategoriesGroupView
            v-bind:data="materialsStore.groupThumbnails"
            @change="handleCategoriesGroupChange"
          />
        </div>
      </section>
      <section ref="galleryViewRef" class="view scroll-bar-hidden">
        <el-page-header class="header" @back="handleViewClick(NAV_CTRL_STEPS.GROUP_VIEW)">
          <template #content>
            <h2>{{ categoryName }}</h2>
          </template>
        </el-page-header>
        <div class="content">
          <NSearchButton v-model:input="input" @change="handleInputChange"/>
          <CategoryGalleryView
            v-bind:data="materialsStore.categoryImages"
            @change="handleImageChange"
          />
        </div>
      </section>
      <section class="view filter-wrapper">
        <el-page-header class="header" @back="handleViewClick(NAV_CTRL_STEPS.GROUP_VIEW)">
          <template #content>
            <h2>素材分類</h2>
          </template>
        </el-page-header>
        <div class="view content">
          <p>搜尋結果</p>
          <NSearchButton v-model:input="input" @change="handleInputChange" @clear="handleInputClear"/>
          <CategoryGalleryView v-bind:data="materialsStore.filtered" @change="handleImageChange" />
        </div>
      </section>
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
.filter-wrapper {
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
  .recently-used {
    display: flex;
    align-items: center;
    gap: 20px;
    .image-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .image-item {
      border-radius: 4px;
      height: 80px;
      width: 80px;
      background-color: theme.$navbar-btn-bg-color;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      box-sizing: border-box;
      border: 2px solid transparent;
      overflow: hidden;
      flex-shrink: 0;
      &:active {
        background-color: rgba(80, 80, 80, 0.6);
      }
      &:hover {
        background-color: rgba(80, 80, 80, 0.6);
      }
    }
  }
}
</style>
