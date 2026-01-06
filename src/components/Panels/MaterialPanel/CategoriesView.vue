<script setup lang="ts">
import { type IGallery, type IGalleryItem } from "@/store/useMaterialsStore.ts";
import { type PropType } from "vue";
import NImage from "@/components/Basic/NImage.vue";
import { ArrowRight } from "@element-plus/icons-vue";

const props = defineProps({
  data: {
    type: Array as PropType<IGallery[]>,
    required: true,
    default: () => {
      return [];
    }
  }
});
const emit = defineEmits(["more", "change"]);

const handleMoreButton = (index: number, name: string) => {
  emit("more", { index, name });
};
const handleChange = (group: IGalleryItem) => {
  emit("change", group);
};
</script>

<template>
  <section class="categories-view">
    <template v-for="(row, rowIndex) in props.data" :key="`${row.id}`">
      <el-row class="label" :gutter="10">
        <el-col :span="16">
          <span class="title">{{ row.category }}</span>
        </el-col>
        <el-col :span="8">
          <div class="more" @click="handleMoreButton(rowIndex, row.category)">
            更多
            <el-icon>
              <ArrowRight/>
            </el-icon>
          </div>
        </el-col>
      </el-row>

      <el-row class="row" :gutter="28">
        <el-col v-for="item in row.items.slice(0, 3)" :span="8">
          <div class="image-item" @click="handleChange(item)">
            <NImage :src="item.src" fit="contain"/>
          </div>
        </el-col>
      </el-row>
    </template>
  </section>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.categories-view {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.row {
  margin-top: 0;
  margin-bottom: 10px;
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

  &:active {
    background-color: rgba(80, 80, 80, 0.6);
  }

  &:hover {
    background-color: rgba(80, 80, 80, 0.6);
  }
}

.title {
  border-radius: 4px;
  min-height: 24px;
}

.label {
  height: 24px;
  position: relative;
  display: flex;

  .el-col,
  .el-row {
    margin-bottom: 0;
  }
}

.more {
  display: flex;
  justify-content: flex-end;
  //padding-top: 10px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
  align-items: center;
  height: 24px;

  &:hover {
    color: theme.$button-text-color;
  }
}
</style>
