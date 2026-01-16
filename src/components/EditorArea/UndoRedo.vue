<script setup lang="ts">
import { useEditorStore } from "@/store/editorStore.ts";

const emit = defineEmits(["change"]);

const editorStore = useEditorStore();

const handleUndo = () => {
  emit("change", "undo");
  editorStore.undo();
};

const handleRedo = () => {
  emit("change", "redo");
  editorStore.redo();
};
</script>

<template>
  <div class="undo-redo-warp">
    <el-button class="btn-undo" tip="還原" @pointerup="handleUndo" :disabled="!editorStore.hasUndo">
      <template #default>上一步</template>
      <template #icon>
        <el-icon size="14">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.9514 9.88193C13.9514 9.88193 13.7196 8.04229 11.9653 5.91208C10.2111 3.78186 7.89421 3.55581 7.23205 3.45924C6.56988 3.36223 6.20617 3.36223 6.20617 3.36223V0.586322C6.20617 0.586322 6.25478 0.15308 5.85775 0.0240292C5.46072 -0.105022 5.14697 0.327781 5.14697 0.327781L0.199415 4.98985C0.0810263 5.0952 0 5.26639 0 5.43494C0 5.63027 0.0999325 5.78873 0.243079 5.91779L5.14697 10.561C5.14697 10.561 5.50034 10.9942 5.89737 10.8647C6.13279 10.7884 6.21157 10.6049 6.23678 10.4684V7.51951C6.49111 7.47122 8.2989 7.16703 10.0788 7.94529C11.9986 8.78456 12.826 9.46229 13.223 9.88193C13.6201 10.3016 13.7614 10.5044 13.9514 10.4306C14.0608 10.388 13.9514 9.88193 13.9514 9.88193Z" fill="currentColor"/>
          </svg>
        </el-icon>
      </template>
    </el-button>
    <el-button class="btn-redo" tip="重做" @pointerup="handleRedo" :disabled="!editorStore.hasRedo">
      <template #default>下一步</template>
      <template #icon>
        <el-icon size="14">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.0486174 9.88193C0.0486174 9.88193 0.280442 8.04229 2.03466 5.91208C3.78888 3.78186 6.10579 3.55581 6.76795 3.45924C7.43012 3.36223 7.79383 3.36223 7.79383 3.36223V0.586322C7.79383 0.586322 7.74522 0.15308 8.14225 0.0240292C8.53928 -0.105022 8.85303 0.327781 8.85303 0.327781L13.8006 4.98985C13.919 5.0952 14 5.26639 14 5.43494C14 5.63027 13.9001 5.78873 13.7569 5.91779L8.85303 10.561C8.85303 10.561 8.49966 10.9942 8.10263 10.8647C7.86721 10.7884 7.78843 10.6049 7.76322 10.4684V7.51951C7.50889 7.47122 5.7011 7.16703 3.92123 7.94529C2.00135 8.78456 1.17398 9.46229 0.776954 9.88193C0.379924 10.3016 0.238579 10.5044 0.0486174 10.4306C-0.0607691 10.388 0.0486174 9.88193 0.0486174 9.88193Z" fill="currentColor"/>
          </svg>
        </el-icon>
      </template>
    </el-button>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.undo-redo-warp {
  position: relative;
  display: flex;
  width: fit-content;
  height: 36px;
  //background-color: white;
  //box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 6px 0 rgba(0, 0, 0, 0.19);
  border-radius: 8px;
  z-index: 100;
  padding: 0 6px;
  top: 0;
  left: 0;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
}

.btn-undo,
.btn-redo {
  width: 80px;
  height: 30px;
  border-radius: 50px;
  box-shadow: 0 3px 4px 0 #3F3F401A;
  border-color: transparent;
  &:focus {
    outline: none;
    border-color: transparent;
  }
  &:active {
    border-color: transparent;
  }
  &:hover {
    background-color: white;
    color: #F15624;
  }
  &:disabled {
    color: #a8abb2; // Element Plus 的禁用文字顏色
    cursor: not-allowed; // 明確設定鼠標樣式
    border-color: transparent;
  }
}
</style>
