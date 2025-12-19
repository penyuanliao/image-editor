<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { Search, Close } from "@element-plus/icons-vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { ElementTypesEnum } from "@/types.ts";
import NCarousel from "../Basic/NCarousel.vue";
import { type IGallery, useMaterialsStore } from "@/store/useMaterialsStore.ts";

const editorStore = useEditorStore();
const materialsStore = useMaterialsStore();

const emit = defineEmits<{ (e: "add-element", action: any): void }>();
const placeholderImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const input = ref<string>("");
const selectTag = ref("全部");
// 用來過濾資料的 computed
const filteredGallery = computed<IGallery[]>(() => {
  const searchValue: string = input.value || "";
  let result: IGallery[];
  if (selectTag.value === "全部") {
    result = materialsStore.materials;
    materialsStore.materials.forEach((group) => {
      group.visible = true;
      group.items.forEach((item) => {
        item.visible = true;
      });
    });
  } else {
    materialsStore.materials.forEach((group) => {
      group.visible = group.category === selectTag.value && group.items.length > 0;
    });
    result = materialsStore.materials;
  }
  if (searchValue !== "") {
    materialsStore.materials.forEach((group) => {
      group.items.forEach((item) => {
        item.visible = item.name.toLowerCase().includes(searchValue.toLowerCase());
      });
      group.visible = group.category === selectTag.value && group.items.length > 0;
    });
    result = materialsStore.materials;
  }
  return result;
});
// 上傳的圖片
const customizedGallery = computed(() => {
  const list: { src: string; name: string; id: number }[] = [];
  editorStore.imageList.forEach(({ image }) => {
    list.push({
      src: image.src,
      id: -1,
      name: image.src.split("/").pop() || ""
    });
  });
  return list;
});

const tagOptions = computed(() => {
  const options: string[] = ["全部"];
  for (const group of materialsStore.materials) {
    options.push(group.category);
  }
  return options;
});

const imageRefs = ref<Record<number, any>>([]);
const observer = new IntersectionObserver((entries) => {
  entries.forEach(
    (entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target as HTMLImageElement;
      const src = el.dataset.src;

      if (src) {
        // 載入圖片
        const tempImg = new Image();
        tempImg.src = src;

        tempImg.onload = () => {
          el.src = src;
          el.removeAttribute("data-src");
          // 圖片載入成功後，移除父元素的 skeleton class
          el.parentElement?.classList.remove("skeleton");
          // 不再觀察這個元素
          observer.unobserve(el);
        };
      }
    },
    { threshold: 0.5 }
  );
});

onMounted(async () => {
  await materialsStore.getMaterials();
  for (let key in imageRefs.value) {
    if (imageRefs.value[key]) {
      observer.observe(imageRefs.value[key]);
    }
  }
});
onUnmounted(() => {
  // Disconnect the observer when the component is destroyed to prevent memory leaks
  if (observer) {
    observer.disconnect();
  }
});

watch(
  () => filteredGallery,
  (data) => {
    nextTick(() => {
      data.value.forEach((item) => {
        if (imageRefs.value[item.id]) observer.observe(imageRefs.value[item.id]);
      });
    });
  },
  { deep: true }
);

const onStickerClick = (item: { id: number; src: string; name: string }) => {
  emit("add-element", {
    type: ElementTypesEnum.Image,
    config: {
      url: item.src,
      id: item.id,
      x: 0,
      y: 0
    },
    name: item.name
  });
};
const onSearchIconClick = () => {
  console.log("onSearchIconClick", input.value);
};
</script>

<template>
  <div class="images-gallery-container">
    <h2 class="heading">选择素材</h2>
    <el-input
      v-model="input"
      class="source-search-input"
      placeholder="搜尋素材"
      :clear-icon="Close"
      clearable
    >
      <template v-slot:suffix>
        <div class="submit-btn" @click="onSearchIconClick">
          <el-icon size="20">
            <Search />
          </el-icon>
        </div>
      </template>
    </el-input>
    <div class="categories">
      <NCarousel v-model:options="tagOptions" v-model:selected="selectTag" />
      <span class="label">自訂素材</span>
      <div v-if="customizedGallery.length > 0" class="category-items">
        <div
          v-for="item in customizedGallery"
          :key="item.id"
          class="image"
          @click="onStickerClick(item)"
        >
          <img :src="item.src" alt="" />
        </div>
      </div>
      <template v-for="group in filteredGallery">
        <span class="label">{{ group.category }}</span>
        <div class="category-items" :style="{ display: group.visible ? 'flex' : 'none' }">
          <div
            v-for="(item, index) in group.items"
            :key="index"
            class="image skeleton"
            :style="{ display: item.visible ? 'flex' : 'none' }"
            @click="onStickerClick(item)"
          >
            <img
              :src="placeholderImage"
              :ref="(el) => (imageRefs[item.id] = el)"
              :data-src="item.src"
              :alt="item.name"
              :title="item.name"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../../styles/theme";
.images-gallery-container {
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: flex-start;
  flex-direction: column;
  background-color: theme.$primary-color;
  flex-wrap: nowrap;
  align-items: center;
  overflow: auto;
  color: theme.$text-color;
  &::-webkit-scrollbar {
    display: none;
  }
  padding-left: 32px;
  padding-right: 35px;
}
.heading {
  width: 100%;
  padding-top: 30px;
}
.search-btn {
  position: relative;
  width: 262px;
  height: 54px;
  min-height: 54px;
  border-radius: 999px;
  border: 1px solid theme.$border-color-base;
  pointer-events: none;
}

.source-search-input {
  width: 262px;
  font-size: medium;

  // 使用 :deep() 來選取 el-input 內部的 wrapper 元素
  :deep(.el-input__wrapper) {
    height: 54px;
    border: 1px solid theme.$border-color-base;
    border-radius: 999px;
    box-shadow: none; // 移除 focus 時的預設陰影
  }

  // 使用 :deep() 來選取 el-input 內部的 input 元素
  :deep(.el-input__inner) {
    padding-left: 5px; // 讓 placeholder 和輸入文字內縮
  }
  // 調整 clearable 與 suffix-icon 的順序
  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
  }

  :deep(.el-input__clear) {
    order: -1; // 將 clearable 圖示排在最前面 (order 值越小越靠前)
    margin-right: 8px; // 增加與右側搜尋圖示的間距
  }
  .submit-btn {
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: theme.$secondary-color;
    border-radius: 999px;
    color: white;
    transform: translateX(5px);
  }
}
.categories {
  width: 100%;
  display: flex;
  position: relative;
  flex-direction: column;
  .label {
    flex-shrink: 0;
    display: none;
  }
  .skeleton {
    position: relative;
    overflow: hidden; // 隱藏偽元素超出容器的部分
    background-color: rgba(80, 80, 80, 0.3); // 骨架屏的底色

    // 使用偽元素創建掃光效果
    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.1) 20%,
        rgba(255, 255, 255, 0.3) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 2s infinite;
    }
  }
  .image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center;
    &:active {
      background-color: rgba(80, 80, 80, 0.6);
    }
    &:hover {
      background-color: rgba(80, 80, 80, 0.6);
    }
    img {
      width: 90%;
      height: 90%;
      object-fit: contain;
    }
  }
  .category-items {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;
    padding-bottom: 10px;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
