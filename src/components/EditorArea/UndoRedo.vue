<script setup lang="ts">
import NButton from "@/components/Basic/NButton.vue";
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
    <NButton class="btn-undo" tip="還原" @pointerup="handleUndo" :disabled="!editorStore.hasUndo">
      <template #icon>
        <el-icon size="22">
          <svg
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 0.72 0.72"
            xml:space="preserve"
          >
            <path
              d="M.45.21H.132L.25.092.208.05l-.19.19.191.191.042-.042L.132.27H.45c.099 0 .18.081.18.18S.549.63.45.63H.33v.06h.12C.582.69.69.582.69.45S.582.21.45.21"
            />
          </svg>
        </el-icon>
      </template>
    </NButton>
    <NButton class="btn-redo" tip="重做" @pointerup="handleRedo" :disabled="!editorStore.hasRedo">
      <template #icon>
        <el-icon size="22">
          <svg
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 0.72 0.72"
            xml:space="preserve"
          >
            <path
              d="M.511.049.469.091.588.21H.27C.138.21.03.318.03.45s.108.24.24.24h.12V.63H.27C.171.63.09.549.09.45S.171.27.27.27h.318L.47.388.512.43l.19-.19z"
            />
          </svg>
        </el-icon>
      </template>
    </NButton>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.undo-redo-warp {
  position: relative;
  display: flex;
  width: fit-content;
  height: 36px;
  background-color: white;
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
  width: 32px;
  height: 32px;
}
</style>
