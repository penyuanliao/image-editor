<template>
  <div class="feature-section" :class="{ 'feature-section--reverse': reverse }">
    <div class="feature-section__content">
      <div class="feature-section-header">
        <div class="feature-section__number">{{ number }}</div>
        <h2 class="feature-section__title">{{ title }}</h2>
      </div>
      <h3 class="feature-section__subtitle">{{ subtitle }}</h3>
      <div class="feature-section__description-group">
        <p
          v-for="(line, index) in desc"
          :key="index" class="feature-section__description"
          :style="{
            'letter-spacing': options?.descLetterSpacing || '0'
          }"
          v-html="line"
        />
      </div>
    </div>
    <div class="feature-section__image-wrapper">
      <img :src="imageSrc" alt="Feature Image" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string
  title: string
  subtitle: string
  desc: string[]
  imageSrc: string
  reverse?: boolean
  options?: {
    descLetterSpacing?: string
  }
}>()
</script>

<style scoped lang="scss">
@use "@/styles/theme";

@font-face {
  font-family: "Microsoft";
  src: url("@/assets/fonts/Montserrat-Bold.ttf") format("truetype");
}

/* --- 1. 桌面版 / 共用基礎樣式 --- */
.feature-section {
  width: 100%;
  max-width: 1406px;
  margin: 0 auto;
  padding: 60px 1.5rem 60px 1.5rem;
  display: flex;
  flex-direction: row; // 桌面預設橫排
  align-items: center;
  justify-content: space-between;
  gap: 3.4vw;
  box-sizing: border-box;

  &--reverse { flex-direction: row-reverse; }

  &__content { width: 50%; }

  .feature-section-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: row;
    gap: 19px;
    margin-bottom: -19px;
  }

  &__number {
    color: #FFC3B0;
    text-align: right;
    font-family: "Microsoft", serif;
    font-size: 82px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  &__title {
    font-size: 32px;
    font-style: normal;
    font-family: theme.$font-family;
    font-weight: 700;
    color:  #F15624;
    letter-spacing: 3.2px;
  }

  &__subtitle {
    //font-size: 48px;
    font-size: clamp(32px, 3.2vw, 48px);
    font-style: normal;
    font-family: theme.$font-family;
    font-weight: 700;
    color: #F15624;
    letter-spacing: 4.8px;
    margin: 0 0 45px 0;
    white-space: nowrap;
  }
  &__description-group {
    margin: 0 0;
  }
  &__description {
    font-family: theme.$font-family;
    color: #606266;
    line-height: 36px;
    font-size: clamp(14px, 1.6vw, 21px);
    //font-size: 21px;
    //margin-block-start: 8px;
    //margin-block-end: 16px;
    margin-block-start: 0;
    margin-block-end: 0;
  }
  &__description:first-child {
    margin-block-start: 8px;
  }
  &__description:last-child {
    margin-block-end: 8px;
  }

  &__image-wrapper {
    width: 50%;
    img {
      width: 100%;
      border-radius: 30px;
    }
  }
}

/* --- 2. 集中處理手機版 (1000px 以下) --- */
@media (max-width: 1000px) {
  .feature-section {
    flex-direction: column; // 轉為垂直
    padding: 3rem 1.5rem;
    gap: 2rem;

    &--reverse { flex-direction: column; } // 強制取消反轉

    &__content {
      width: 68%;
      order: 2; // 文字放下面
    }

    &__image-wrapper {
      width: 68%;
      order: 1; // 圖片放上面
    }

    &__number {
      text-align: left; // 手機端建議靠左
    }
  }
}
</style>
