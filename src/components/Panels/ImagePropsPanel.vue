<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useEditorStore } from "@/store/editorStore.ts";
import AIPanel from "./AIPanel.vue";
import { type IImageConfig } from "@/types.ts";
import { Delete, Lock, Unlock } from "@element-plus/icons-vue";
import NPanel from "@/components/Basic/NPanel.vue";
import NPosition from "@/components/Basic/NPosition.vue";

const editorStore = useEditorStore();
// Only show and operate on the panel if a sticker is selected

const isRatioLocked = ref(true);

const emit = defineEmits(["alignElement", "refresh"]);

const localX = ref(0);
const localY = ref(0);
const localWidth = ref(100);
const localHeight = ref(100);

const percentWidth = computed({
  get() {
    const config = editorStore.selectedElement?.config as IImageConfig;
    const naturalWidth = config.img?.naturalWidth || 1;
    return Math.floor((config.width / naturalWidth) * 100);
  },
  set(value) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = editorStore.selectedElement?.config as IImageConfig;
      const naturalWidth = config.img?.naturalWidth || 1;
      el.config.width = (naturalWidth * value) / 100;
    }
  }
});

const percentHeight = computed({
  get() {
    const config = editorStore.selectedElement?.config as IImageConfig;
    const naturalHeight = config.img?.naturalHeight || 1;
    return Math.floor((config.height / naturalHeight) * 100);
  },
  set(value) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = editorStore.selectedElement?.config as IImageConfig;
      const naturalHeight = config.img?.naturalHeight || 1;
      el.config.height = (naturalHeight * value) / 100;
    }
  }
});

watch(
  () => editorStore.selectedElement,
  (newEl) => {
    if (newEl) {
      const config = newEl.config as IImageConfig;
      localX.value = config.x ?? 0;
      localY.value = config.y ?? 0;
      localWidth.value = config.width ?? 100;
      localHeight.value = config.height ?? 100;
    }
  },
  { immediate: true }
);

watch(
  () => editorStore.selectedElement?.config,
  (newConfig) => {
    if (newConfig) {
      localX.value = newConfig.x ?? 0;
      localY.value = newConfig.y ?? 0;
      localWidth.value = newConfig.width ?? 100;
      localHeight.value = newConfig.height ?? 100;
    }
  },
  { deep: true }
);

const configWidth = computed({
  get() {
    return (editorStore.selectedElement?.config as IImageConfig)?.width ?? 100;
  },
  set(value: number) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = el.config as IImageConfig;
      if (value <= 0) value = 1;
      // 當比例鎖定，且輸入值大於0，且原始寬度也大於0時，才進行計算
      if (isRatioLocked.value && value > 0 && config.width > 0) {
        const ratio = config.height / config.width;
        config.height = Math.max(1, Math.round(value * ratio)); // 確保高度至少為 1
      }
      config.width = value;
    }
  }
});

const configHeight = computed({
  get() {
    return (editorStore.selectedElement?.config as IImageConfig)?.height ?? 100;
  },
  set(value: number) {
    const el = editorStore.selectedElement;
    if (el?.config) {
      const config = el.config as IImageConfig;
      // 當比例鎖定，且輸入值大於0，且原始高度也大於0時，才進行計算
      if (isRatioLocked.value && value > 0 && config.height > 0) {
        const ratio = config.width / config.height;
        config.width = Math.max(1, Math.round(value * ratio)); // 確保寬度至少為 1
      }
      config.height = value;
    }
  }
});

const opacityInPercentage = computed({
  get() {
    if (
      editorStore.selectedElement &&
      typeof editorStore.selectedElement.config.opacity === "number"
    ) {
      return Math.round(editorStore.selectedElement.config.opacity * 100);
    } else {
      return 100;
    }
  },
  set(percentage: number) {
    if (editorStore.selectedElement) {
      editorStore.selectedElement.config.opacity = percentage / 100;
    }
  }
});

const handleLockAndUnlock = () => {
  if (editorStore.selectedElement?.config) {
    editorStore.selectedElement.config.draggable = !editorStore.selectedElement.config.draggable;
    if (!editorStore.selectedElement?.config.draggable) {
      editorStore.selectedElements = [];
    } else {
      editorStore.selectedElements = [editorStore.selectedElement];
    }
    handleSaveHistory();
  }
};

const handleXChange = (value: number) => {
  if (editorStore.selectedElement?.config) {
    (editorStore.selectedElement.config as IImageConfig).x = value;
    handleSaveHistory();
  }
};
const handleYChange = (value: number) => {
  if (editorStore.selectedElement?.config) {
    (editorStore.selectedElement.config as IImageConfig).y = value;
    handleSaveHistory();
  }
};
const handleWidthChange = (value: number) => {
  // 使用現有的 configWidth setter 邏輯
  configWidth.value = value;
  handleSaveHistory();
};
const handleHeightChange = (value: number) => {
  // 使用現有的 configHeight setter 邏輯
  configHeight.value = value;
  handleSaveHistory();
};
const handleResetSize = () => {
  if (editorStore.selectedElement?.config) {
    const config = editorStore.selectedElement.config as IImageConfig;
    config.width = config.img?.naturalWidth || 1;
    config.height = config.img?.naturalHeight || 1;
    handleSaveHistory();
  }
};
/**
 * 改變圖片位置
 * @param value
 */
const handlePositionChange = (value: string) => {
  if (value === "flip-horizontal") {
    editorStore.flipHorizontal();
  } else if (value === "flip-vertical") {
    editorStore.flipVertical();
  } else {
    const horizontally: string[] = ["left", "center", "right"];
    const vertically: string[] = ["top", "middle", "bottom"];
    let horizontal = null;
    let vertical = null;
    if (horizontally.includes(value)) {
      horizontal = value;
    }
    if (vertically.includes(value)) {
      vertical = value;
    }
    if (horizontal || vertical) {
      emit("alignElement", horizontal, vertical);
    }
  }
  editorStore.saveHistory();
};
const handleDeleted = () => {
  const id = editorStore.selectedElement?.id;
  if (id) {
    editorStore.removeElements([id]);
  }
};
const handleSaveHistory = () => {
  editorStore.saveHistory();
};
</script>

<template>
  <NPanel padding="30px 25px 0 25px" :searchEnabled="false">
    <div v-if="editorStore.selectedElement" class="properties">
      <div class="view">
        <img :src="(editorStore.selectedElement?.config as IImageConfig)?.url" alt="" />
      </div>
      <div class="ctrl" style="gap: 4px">
        <span class="label">X</span>
        <el-input-number
          class="el-input"
          v-model="localX"
          @change="handleXChange"
          :controls="false"
          style="width: 80px"
        />
        <span class="label">Y</span>
        <el-input-number
          class="el-input"
          v-model="localY"
          @change="handleYChange"
          :controls="false"
          style="width: 80px"
        />
        <div class="lockAndUnlock">
          <el-tooltip
            :content="`${editorStore.selectedElement?.config.draggable ? '鎖定' : '解鎖'}`"
            placement="top"
            :auto-close="500"
          >
            <el-button text @click="handleLockAndUnlock" style="width: 32px">
              <template #icon>
                <el-icon>
                  <Unlock v-if="editorStore.selectedElement?.config.draggable" />
                  <Lock v-else />
                </el-icon>
              </template>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="ctrl"></div>
      <div class="ctrl" style="gap: 4px">
        <span class="label">W</span>
        <el-input-number
          class="el-input"
          v-model="localWidth"
          @change="handleWidthChange"
          :controls="false"
          style="width: 80px"
        >
          <template #suffix>px</template>
        </el-input-number>
        <span class="label">H</span>
        <el-input-number
          class="el-input"
          v-model="localHeight"
          @change="handleHeightChange"
          :controls="false"
          style="width: 80px"
        >
          <template #suffix>px</template>
        </el-input-number>

        <div class="ratio-lock">
          <el-tooltip
            :content="isRatioLocked ? '解鎖長寬比' : '鎖定長寬比'"
            placement="top"
            :auto-close="500"
          >
            <el-button text @click="isRatioLocked = !isRatioLocked" style="width: 32px">
              <template #icon>
                <el-icon v-if="!isRatioLocked">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 1.56 1.56"
                    xml:space="preserve"
                  >
                    <path
                      d="M.543 1.107.825.822.846.801l.252-.252.111-.111.123-.123c.021-.018.024-.045.009-.06L1.287.201C1.275.189 1.254.189 1.236.198L.201 1.227v.003c-.018.018-.021.045-.009.06l.054.054c.015.015.042.012.06-.009l.12-.12c0 .003.117-.108.117-.108M.552.693c-.015 0-.024.012-.03.024Q.518.744.519.771q0 .018.003.036L.636.693z"
                    />
                    <path
                      d="m.249 1.08.12-.12A.2.2 0 0 1 .213.786.194.194 0 0 1 .408.579h.273q.032 0 .063.012L.861.474C.834.459.807.444.78.438A.4.4 0 0 0 .684.423H.423a.35.35 0 0 0-.366.333.34.34 0 0 0 .192.324M1.293.459l-.12.12a.195.195 0 0 1 .162.177.194.194 0 0 1-.195.207H.87A.3.3 0 0 1 .801.951l-.117.117q.04.026.084.039a.3.3 0 0 0 .096.015h.276a.348.348 0 0 0 .153-.663"
                    />
                    <path
                      d="M.903.849h.09c.015 0 .024-.012.03-.024q.004-.027.003-.054 0-.021-.003-.042z"
                    />
                  </svg>
                </el-icon>
                <el-icon v-else>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 1.56 1.56"
                    xml:space="preserve"
                  >
                    <path
                      d="m.519 1.083-.033-.042S.465 1.011.459.993A.03.03 0 0 0 .432.978H.414a.197.197 0 0 1-.201-.18.194.194 0 0 1 .195-.207h.273c.036 0 .069.012.096.024a.2.2 0 0 1 .081.093.2.2 0 0 1 .015.078q0 .021-.006.042c-.006.021.009.039.03.036h.102c.015 0 .024-.012.03-.024q.004-.027.003-.054a.37.37 0 0 0-.06-.195.35.35 0 0 0-.288-.156H.42a.354.354 0 0 0-.357.336.35.35 0 0 0 .348.363h.09c.021-.003.033-.033.018-.051m.978-.315A.35.35 0 0 0 1.14.432L1.059.429c-.024 0-.039.03-.024.048a.5.5 0 0 1 .06.09.03.03 0 0 0 .027.015h.018c.105 0 .195.078.201.18a.194.194 0 0 1-.195.207H.873A.24.24 0 0 1 .777.945.2.2 0 0 1 .696.852.2.2 0 0 1 .681.774q0-.021.006-.042C.693.711.678.693.657.696H.555C.54.696.531.708.525.72Q.521.747.522.774a.346.346 0 0 0 .252.333c.03.009.066.015.096.015h.273a.34.34 0 0 0 .354-.354"
                    />
                  </svg>
                </el-icon>
              </template>
            </el-button>
          </el-tooltip>
        </div>

        <div class="reset-size">
          <el-tooltip content="還原預設大小" placement="top" :auto-close="500">
            <el-button text style="width: 32px" @click="handleResetSize">
              <template #icon>
                <el-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 1.56 1.56"
                    xml:space="preserve"
                  >
                    <path
                      d="M1.395.12h-.09a.046.046 0 0 0-.045.045v.21c0 .027-.015.039-.036.021a.2.2 0 0 0-.03-.03.63.63 0 0 0-.576-.171.6.6 0 0 0-.21.087.64.64 0 0 0-.291.525.62.62 0 0 0 .174.441.62.62 0 0 0 .456.195.64.64 0 0 0 .411-.15.045.045 0 0 0 .003-.066l-.063-.063a.046.046 0 0 0-.06-.003.455.455 0 0 1-.516.042A.455.455 0 0 1 .753.36a.45.45 0 0 1 .354.174c.009.024-.012.036-.039.036h-.21a.046.046 0 0 0-.045.045v.093c0 .024.018.042.042.042h.549a.04.04 0 0 0 .039-.039V.165C1.44.141 1.419.12 1.395.12"
                    />
                  </svg>
                </el-icon>
              </template>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="ctrl" style="gap: 4px">
        <span class="label">W</span>
        <el-input-number
          class="percent-el-input"
          v-model="percentWidth"
          :controls="false"
          :min="0.01"
          size="default"
          align="left"
          @change="handleSaveHistory"
        >
          <template #suffix>%</template>
        </el-input-number>
        <span class="label">H</span>
        <el-input-number
          class="percent-el-input"
          v-model="percentHeight"
          :controls="false"
          :min="0.01"
          size="default"
          align="left"
          @change="handleSaveHistory"
        >
          <template #suffix>%</template>
        </el-input-number>
      </div>

      <div class="ctrl">
        <span>旋轉角度：</span>
        <el-input-number
          v-model="editorStore.rotationInDegrees"
          @change="handleSaveHistory"
          :controls="true"
          controls-position="right"
          align="right"
          style="width: 100%"
        >
          <template #suffix><div>°</div></template>
        </el-input-number>
      </div>
      <div class="ctrl slider-with-input">
        <span>透明度：</span>
        <el-slider
          v-model="opacityInPercentage"
          :show-input-controls="false"
          style="width: 100%"
          show-input
          size="small"
          :format-tooltip="(value: number) => value + '%'"
          :format-value-text="(value: number) => value + '%'"
          @change="handleSaveHistory"
        />
      </div>
      <div class="ctrl">
        <NPosition @change="handlePositionChange" style="padding-right: 10px" />
        <el-tooltip content="左右滿版" placement="top" :auto-close="500">
          <el-button class="full-stage-btn" @click="editorStore.fitToWidth">
            <template #icon>
              <el-icon size="24">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.58 11.25H8.42l.89-1.002a.75.75 0 0 0-1.12-.996l-2 2.25a.75.75 0 0 0 0 .996l2 2.25a.75.75 0 1 0 1.12-.996l-.89-1.002h7.16l-.89 1.002a.75.75 0 1 0 1.12.996l2-2.25.011-.012a.75.75 0 0 0-.013-.987l-1.997-2.247a.75.75 0 0 0-1.121.996z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.75 3A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75V6.25A3.25 3.25 0 0 1 6.25 3zm1.75 3.25a1.75 1.75 0 0 0-1.75-1.75h-.25v5.147l-.942-1.06A1.7 1.7 0 0 0 16 8.168V4.5H8v3.668a1.7 1.7 0 0 0-.558.42L6.5 9.647V4.5h-.25A1.75 1.75 0 0 0 4.5 6.25v11.5c0 .966.784 1.75 1.75 1.75h.25v-5.147l.942 1.06c.161.181.352.32.558.419V19.5h8v-3.668c.206-.098.397-.238.558-.42l.942-1.06V19.5h.25a1.75 1.75 0 0 0 1.75-1.75z"
                    fill="#212121"
                  />
                </svg>
              </el-icon>
            </template>
          </el-button>
        </el-tooltip>
        <el-tooltip content="上下滿版" placement="top" :auto-close="500">
          <el-button class="full-stage-btn" @click="editorStore.fitToHeight">
            <template #icon>
              <el-icon size="24">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.75 15.58V8.42l1.002.89a.75.75 0 0 0 .996-1.12l-2.25-2a.75.75 0 0 0-.996 0l-2.25 2a.75.75 0 1 0 .996 1.12l1.002-.89v7.16l-1.002-.89a.75.75 0 1 0-.996 1.12l2.25 2 .012.011a.75.75 0 0 0 .987-.013l2.247-1.997a.75.75 0 0 0-.996-1.121z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.75 21A3.25 3.25 0 0 0 21 17.75V6.25A3.25 3.25 0 0 0 17.75 3H6.25A3.25 3.25 0 0 0 3 6.25v11.5A3.25 3.25 0 0 0 6.25 21zm1.75-3.25a1.75 1.75 0 0 1-1.75 1.75H6.25a1.75 1.75 0 0 1-1.75-1.75v-.25h5.147l-1.06-.942A1.8 1.8 0 0 1 8.168 16H4.5V8h3.668c.098-.206.238-.397.42-.558l1.06-.942H4.5v-.25c0-.966.784-1.75 1.75-1.75h11.5c.966 0 1.75.784 1.75 1.75v.25h-5.147l1.06.942c.181.161.32.352.419.558H19.5v8h-3.668a1.8 1.8 0 0 1-.42.558l-1.06.942H19.5z"
                    fill="#212121"
                  />
                </svg>
              </el-icon>
            </template>
          </el-button>
        </el-tooltip>
      </div>
      <div class="prop-item center">
        <el-tooltip content="刪除" placement="top" :auto-close="500">
          <el-button type="danger" :icon="Delete" @pointerup="handleDeleted">刪除</el-button>
        </el-tooltip>
      </div>
    </div>
    <el-divider border-style="solid" />
    <div class="additional">
      <AIPanel
        v-if="(editorStore.selectedElement?.config as IImageConfig)?.imageGenMode"
        @refresh="emit('refresh')"
      />
    </div>
  </NPanel>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.additional {
  position: relative;
  display: flex;
  width: 100%;
  gap: 10px;
}
.properties {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  align-items: center;
  span {
    flex-shrink: 0;
    font-size: 15px;
  }
  .ratio-lock {
    justify-self: center;
    width: 30px;
  }
  .reset-size {
    width: 30px;
  }
  .ctrl {
    display: flex;
    align-items: center;
    width: 100%;
    flex-direction: row;
  }
  .view {
    width: 100%;
    height: 100px;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
.label {
  width: 20px;
}
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.percent-el-input {
  width: 80px;
  flex-shrink: 0;
  // 覆寫 Element Plus 的內部樣式，預設移除輸入框的邊框效果
  &:deep(.el-input__wrapper) {
    box-shadow: none;
    // 滑鼠移入時才顯示邊框
    &:focus,
    &:hover {
      box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
    }
  }
}

.full-stage-btn {
  min-height: 36px;
}
</style>
