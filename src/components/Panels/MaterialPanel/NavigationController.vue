<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import gsap from "gsap";
import CategoriesGroupView from "@/components/Panels/MaterialPanel/CategoriesGroupView.vue";
import CategoriesView from "@/components/Panels/MaterialPanel/CategoriesView.vue";
import CategoryGalleryView from "@/components/Panels/MaterialPanel/CategoryGalleryView.vue";
import {useMaterialsStore} from "@/store/useMaterialsStore.ts";
import {ElementTypesEnum} from "@/types.ts";
import NSearchButton from "@/components/Basic/NSearchButton.vue";
const materialsStore = useMaterialsStore();

const emit = defineEmits<{ (e: 'add-element', action: any): void }>();
// 目前頁面控制流程
const NAV_CTRL_STEPS = {
  GROUP_VIEW: 0,
  CATEGORY_VIEW: 1,
  GALLERY_VIEW: 2,
}

const contentWrapper = ref<HTMLDivElement | null>(null);

const galleryViewRef = ref<HTMLDivElement>();
// 目前頁面
const currentStep = ref(NAV_CTRL_STEPS.GROUP_VIEW);
// 群組標題
const title = ref<string>('');
// 分類名稱
const categoryName = ref<string>('');
// 搜尋字串
const input = ref<string>('');

const materialCategories = computed(() => materialsStore.materials);

const handleViewClick = (step: number) => {
  currentStep.value = step;
};

const handleMoreClick = ({ index, name }: { index: number, name: string}) => {
  materialsStore.selectedCategoryId = index;
  currentStep.value = NAV_CTRL_STEPS.GALLERY_VIEW;
  categoryName.value = name;
}

const handleCategoriesGroupChange = (value: { id: number, name: string, index: number }) => {
  title.value = value.name;
  currentStep.value = NAV_CTRL_STEPS.CATEGORY_VIEW;
  materialsStore.selectedMaterialGroup.value = value.index;
};

const handleImageChange = (value: { id: number, src: string, name: string, imageGenMode: number }) => {
  emit('add-element', {
    type: ElementTypesEnum.Image,
    config: {
      url: value.src,
      id: value.id,
      x: 0,
      y: 0,
      imageGenMode: value.imageGenMode
    }, name: value.name
  });
}
const handleInputChange = (value: string) => {
  materialsStore.searchValue = value;
};
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
        if (currentStep.value === 0) title.value = "";
        if (currentStep.value === 1) categoryName.value = "";
      }
    });
  }
});
</script>

<template>
  <div class="view-container">
    <div v-if="!materialsStore.searchValue" class="content-wrapper" ref="contentWrapper">
      <section class="view scroll-bar-hidden">
        <div class="content">
          <NSearchButton v-model:input="input" @change="handleInputChange"/>
          <p>請選擇分類</p>
          <CategoriesGroupView @change="handleCategoriesGroupChange"/>
        </div>
      </section>
      <section class="view scroll-bar-hidden">
        <el-page-header class="header" @back="handleViewClick(NAV_CTRL_STEPS.GROUP_VIEW)">
          <template #content>
            <h2>{{ title }}</h2>
          </template>
        </el-page-header>
        <div class="content">
          <NSearchButton v-model:input="input"/>
          <CategoriesView
              v-bind:data="materialCategories"
              @change="handleImageChange"
              @more="handleMoreClick" />
        </div>
      </section>
      <section ref="galleryViewRef" class="view scroll-bar-hidden">
        <el-page-header class="header" @back="handleViewClick(NAV_CTRL_STEPS.CATEGORY_VIEW)">
          <template #content>
            <h2>{{ categoryName }}</h2>
          </template>
        </el-page-header>
        <div class="content">
          <NSearchButton v-model:input="input"/>
          <CategoryGalleryView v-bind:data="materialsStore.categoryImages" @change="handleImageChange"/>
        </div>
      </section>
    </div>
    <div v-else class="filter-wrapper">
      <section class="view content">
        <NSearchButton v-model:input="input" @change="handleInputChange"/>
        <CategoryGalleryView v-bind:data="materialsStore.filtered" @change="handleImageChange"/>
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
}


</style>