<template>
  <div class="feature-section" :class="{ 'feature-section--reverse': reverse }">
    <div class="feature-section__content">
      <div class="feature-section-header">
        <div class="feature-section__number">{{ number }}</div>
        <h2 class="feature-section__title">{{ title }}</h2>
      </div>

      <h3 class="feature-section__subtitle">{{ subtitle }}</h3>
      <div class="feature-section__description-group">
        <p class="feature-section__description">{{ description }}</p>
        <p v-if="description2" class="feature-section__description">{{ description2 }}</p>
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
  description: string
  description2?: string
  imageSrc: string
  reverse?: boolean
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
  max-width: 1152px;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  display: flex;
  flex-direction: row; // 桌面預設橫排
  align-items: center;
  justify-content: space-between;
  gap: 5rem;

  &--reverse { flex-direction: row-reverse; }

  &__content { width: 50%; }

  .feature-section-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: row;
    gap: 19px;
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
    color:  #F15624;
    font-size: 32px;
    font-style: normal;
    font-family: theme.$font-family;
    font-weight: 700;
    line-height: 36px;
    letter-spacing: 3.2px;
  }

  &__subtitle {
    font-family: theme.$font-family;
    font-size: 48px;
    font-weight: 700;
    color: #F15624;
    margin: 0 0;
  }

  &__description {
    color: #606266;
    line-height: 1.625;
    font-size: 1.125rem;
    margin-top: 50px;
  }

  &__image-wrapper {
    width: 50%;
    img {
      width: 100%;
      border-radius: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
      width: 100%;
      order: 2; // 文字放下面
    }

    &__image-wrapper {
      width: 100%;
      order: 1; // 圖片放上面
    }

    &__number {
      font-size: 82px;
      text-align: left; // 手機端建議靠左
    }

    &__title { font-size: 1.25rem; }
    &__subtitle { font-size: 1.875rem; }
    &__description { font-size: 1rem; }
  }
}
</style>
