<script setup lang="ts">
import { ref } from "vue";
import {useEditorStore} from "@/store/editorStore.ts";


const store = useEditorStore();

const props = defineProps({
  visible: Boolean,
  preview: HTMLImageElement,
});
const emit = defineEmits(["update:visible"]);

const size = ref(24);
const fileFormatType = ref('image/png');

</script>

<template>
  <el-dialog v-model="props.visible" width="800">
    <div class="editor-save">
      <div class="preview">
        <img :src="props.preview?.src"/>
      </div>
      <div class="export-container">
        <span>檔名</span>
        <el-input v-model="store.pageName"></el-input>
        <div class="format-type">
          <span>文件格式</span>
          <el-radio-group v-model="fileFormatType">
            <el-radio-button label="JPEG" value="image/jpeg"/>
            <el-radio-button label="PNG" value="image/png"/>
          </el-radio-group>
        </div>
        <div class="quality">
          <span>質量</span>
          <span>文件預計: {{ size }}KB</span>
        </div>
        <el-button>下載</el-button>
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