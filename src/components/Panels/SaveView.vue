<script setup lang="ts">
import { computed, ref } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import { generalDefaults } from "@/config/settings.ts";

const store = useEditorStore();

const props = defineProps({
  visible: Boolean,
  preview: String
});
const emit = defineEmits(["update:visible"]);

const size = computed(() => {
  if (props.preview) {
    const group = props.preview?.split(",");
    return Math.ceil(group?.length > 1 ? (group[1] || "").length / 1024 : 0);
  } else {
    return 0;
  }
});
const fileFormatType = ref("image/png");

const visible = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit("update:visible", value);
  }
});

const save = () => {
  const href = props.preview;
  if (href) {
    // 4. 將暫時畫布的內容轉換為圖片的 data URL 並觸發下載
    const link = document.createElement("a");
    link.href = href;
    link.download = store.pageName ? `${store.pageName}.png` : `edited-image-${Date.now()}.png`; // 加上時間戳避免檔名重複
    document.body.appendChild(link); // Firefox 需要將 link 加入 DOM
    link.click();
    document.body.removeChild(link); // 清理 DOM
  }
};
</script>

<template>
  <el-dialog v-model="visible" width="800">
    <div class="editor-save">
      <div class="preview">
        <img :src="props.preview" />
      </div>
      <div class="export-container">
        <span>檔名</span>
        <el-input v-model="store.pageName"></el-input>
        <div class="format-type">
          <span>文件格式</span>
          <el-radio-group v-model="fileFormatType">
            <template v-for="mineType in generalDefaults.allowedExtensions">
              <el-radio-button :label="mineType.split('/')[1]" :value="mineType" />
            </template>
          </el-radio-group>
        </div>
        <div class="quality">
          <span>質量</span>
          <span>文件預計: {{ size }}KB</span>
        </div>
        <el-button @click="save" type="primary">下載</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.editor-save {
  width: 100%;
  height: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: row;
}
.preview {
  width: 50%;
  height: 100%;
  min-width: 330px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  //background-color: #535bf2;
  pointer-events: none;
}
.export-container {
  width: 50%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.format-type {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  span {
    flex-shrink: 0;
  }
}
.quality {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
