<script setup lang="ts">
import { htmlTheme } from "@/styles/stageTheme.ts";
import Symbols from "@/components/Basic/Symbols.vue";
import NMarqueeText from "@/components/Basic/NMarqueeText.vue";
import { useMainStore } from "@/store/useMainStore.ts";

const mainStore = useMainStore();

const props = defineProps({
  progressValue: {
    type: Number,
    default: 0
  },
  marqueeText: {
    type: String,
    default: ""
  }
});
const emit = defineEmits(["update:progressValue"]);

const handleCommentClick = () => {
  mainStore.showComment(true);
}

</script>

<template>
  <div class="navbar">
    <el-progress
      v-if="props.progressValue !== 0"
      class="progress"
      v-model:percentage="props.progressValue"
      :show-text="false"
      :stroke-width="1"
      :color="htmlTheme.progressBarColor"
    />
    <img src="@/assets/icons/logo.png" height="136" alt="Logo" class="logo" />
    <div class="navbar-action">
      <div class="layers-btn" @pointerup="mainStore.showLayers = !mainStore.layersVisible">
        <el-icon class="icon" size="24">
          <Symbols name="layer-btn" />
        </el-icon>
        <span class="text">图层</span>
      </div>
      <div class="comment-btn" @pointerup="handleCommentClick">
        <el-icon size="24">
          <svg fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.8977 2H6.03719C4.49339 2 3.24194 3.22953 3.24194 4.7463V17.3247C3.24194 18.8414 4.49339 20.071 6.03719 20.071H12.9424L16.0373 22.5448C16.0373 22.5448 16.6311 23.2342 17.3321 22.9162C18.0338 22.5981 17.9259 21.962 17.9259 21.962L17.9566 20.0716H19.8983C21.4421 20.0716 22.6936 18.842 22.6936 17.3253V4.7463C22.6936 3.22953 21.4421 2 19.8983 2H19.8977ZM20.6844 17.3247C20.6844 17.7505 20.3317 18.097 19.8983 18.097H17.34C17.34 18.097 16.4828 18.0602 16.1934 18.4115C15.9619 18.6934 16.0029 19.3146 16.0029 19.3146L16.0373 20.0526L14.0408 18.4091C14.0408 18.4091 13.7586 18.091 12.4222 18.091H10.6957V18.097H6.03719C5.60377 18.097 5.25112 17.7505 5.25112 17.3247V4.7463C5.25112 4.32047 5.60377 3.97399 6.03719 3.97399H19.8977C20.3311 3.97399 20.6838 4.32047 20.6838 4.7463V17.3247H20.6844Z" fill="#F15624"/>
            <path d="M17.1893 7.69547H8.34822C7.71459 7.69547 7.20093 8.19634 7.20093 8.8142C7.20093 9.43207 7.71459 9.93294 8.34822 9.93294H17.1893C17.8229 9.93294 18.3366 9.43207 18.3366 8.8142C18.3366 8.19634 17.8229 7.69547 17.1893 7.69547Z" fill="#F15624"/>
            <path d="M17.1893 12.5936H11.1983C10.5647 12.5936 10.051 13.0944 10.051 13.7123C10.051 14.3302 10.5647 14.831 11.1983 14.831H17.1893C17.8229 14.831 18.3366 14.3302 18.3366 13.7123C18.3366 13.0944 17.8229 12.5936 17.1893 12.5936Z" fill="#F15624"/>
          </svg>
        </el-icon>
        <span class="text">意见回馈</span>
      </div>
      <NMarqueeText :duration="20" :visible="props.marqueeText?.length > 0">
        {{ props.marqueeText }}
      </NMarqueeText>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.navbar {
  width: 100%;
  height: 80px;
  min-height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  //grid-template-columns: 1fr 330px;
  background-color: white;
  border-bottom: 1px solid theme.$border-color-base;
  z-index: 100;
  .logo {
    width: 150px;
    object-fit: contain;
    padding-left: 32px;
    padding-right: 32px;
  }
}
.navbar-action {
  position: absolute;
  display: flex;
  flex-direction: row-reverse;
  width: calc(100% - 150px - 64px );
  min-width: 110px;
  min-height: 56px;
  max-height: 56px;
  top: 50%;
  transform: translateY(-50%);
  /*right: calc(340px + 14px);*/
  right: 16px;
  align-items: center;
}
.layers-btn {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 93px;
  min-width: 93px;
  min-height: 56px;
  max-height: 56px;
  border-radius: 999px;
  border: theme.$border-color-base solid 1px;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  gap: 10px;
  pointer-events: none;
  background-color: theme.$navbar-btn-bg-color;
  .icon {
    width: 24px;
    height: 24px;
    color: black;
  }
  .text {
    font-weight: 400;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0;
    text-align: center;
    color: theme.$text-color;
  }
  &:hover {
    .text,
    .icon {
      color: theme.$text-color-active;
    }
  }
  &:active {
    scale: 0.95;
  }
}
.comment-btn {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 134px;
  min-width: 134px;
  min-height: 56px;
  max-height: 56px;
  text-align: center;
  justify-content: center;
  cursor: pointer;
  gap: 10px;
  background: #FFFFFF;
  /* icon_漸層 */
  box-shadow: 0 3px 4px rgba(63, 63, 64, 0.1);
  border-radius: 40px;
  margin: 10px 10px;

  .icon {
    width: 24px;
    height: 24px;
    color: black;

  }
  .text {
    font-weight: 400;
    font-size: 18px;
    line-height: 22px;
    letter-spacing: 0;
    text-align: center;
    color: theme.$text-color-info;
    font-style: normal;
  }
  &:hover {
    .text,
    .icon {
      color: theme.$text-color-active;
    }
  }
}

.progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
