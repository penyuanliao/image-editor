<template>
  <div class="faq">
    <el-collapse v-model="activeName" class="faq__list">
      <el-collapse-item v-for="(item, index) in items" :key="index" :name="`faq-item-${index + 1}`" class="faq-item" @click="() => handleFAQChange(index + 1)">
        <template #title>
          <div class="faq-item__question-group">
            <span class="faq-item__q-label">Q</span>
            <span class="faq-item__question">{{ item.question }}</span>
            <el-icon size="24" class="faq-item__icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z"
                  stroke="#F15624"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M7 12H12H17"
                  stroke="#F15624"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  class="vertical-line"
                  d="M12 7V17"
                  stroke="#F15624"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </el-icon>
          </div>
        </template>
        <el-divider class="el-divider" />
        <div class="faq-item__answer-panel">
          <span class="faq-item__a-label">A</span>
          <div class="faq-item__answer" v-html="item.answer" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { gtmManager } from "@/library/GtmManager.ts";

const activeName = ref<string[]>(["faq-item-0"]);

const items = [
  {
    question: "如何进入广宣生成器？",
    answer:
      "<p>入口位于后台各广宣上传位置，<span class='highlight'>系统会自动套用需求尺寸</span>，您可立即开始制作符合各版位的图片。<br/>" +
      "注：部分广宣设定系统尚未支援此功能，BBIN 正在批次开发中，敬请耐心等候。</p>"
  },
  {
    question: "AI 点数何时更新？点数不足怎么办？",
    answer:
      "<p>点数每月1日更新预设值。当点数用完时，系统将显示「AI点数不足」暂时无法使用AI功能。<br/>" +
      "注：如当月点数已用完，您可于工作日联络 BB 专员申请调整。<br/>" +
      "（若当月尚有剩余点数可协助补充，但不保证一定可调整）</p>"
  },
  {
    question: "AI 功能执行失败或异常，点数会被扣吗？",
    answer:
      "<p>若 AI 执行失败，可<span class='highlight'>重新选择素材重试</span>。异常情况下，系统将不会扣除点数。<br/>" +
      "注：若持续发生问题，请于工作日联系 BBIN 专员协助。</p>"
  },
  {
    question: "显示「功能权限异常」，是什么原因？",
    answer: "<p>此功能<span class='highlight'>需从后台各广宣设定点击连结才能使用</span>，非从后台直接操作将无法使用。</p>"
  },
  {
    question: "设定完成后，后台看不到图片或显示「图片套用异常」怎么办？",
    answer:
      "<p>储存时需在<span class='highlight'>「完成编辑确认」视窗点选【是】，图片才会同步至后台</span>。<br/>" +
      "若遇异常，可重新送出或先下载图片稍后再操作。<br/>" +
      "注：若持续发生问题，请于工作日联系 BBIN 专员协助</p>"
  },
  {
    question: "档案上传有哪些限制？",
    answer:
      "<p>系统支持上传 <span class='highlight'>JPG、JPEG、PNG</span> 格式图片，文件大小上限为<span class='highlight'>2MB</span>，且文件名请勿包含小数点。<br/>" +
      "若遇异常，可重新送出或先下载图片稍后再操作。<br/>" +
      "(註)若上传文件未符合上述规范，系统将提示上传失败，请调整后重新尝试。</p>"
  }
];

const handleFAQChange = (active: number) => {
  gtmManager.trackEvent( { event: `使用說明網頁_QA_${active}` } );
}

</script>

<style scoped lang="scss">
@use "@/styles/theme";

.faq {
  width: 96%;
  max-width: 1406px; // approx max-w-4xl
  margin: 0 auto;
  padding: 0 0 60px 0;

  :deep(.el-collapse) {
    border: none;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

.faq-item {
  border: 1px solid #dfdfdf;
  border-radius: 20px;
  overflow: hidden;
  background-color: white;
  position: relative;
  box-sizing: border-box;

  :deep(.el-collapse-item__header) {
    height: auto;
    line-height: 1.5;
    background-color: #fff;
    border-bottom: none;
    transition: background-color 0.3s ease;
    font-size: inherit;
    padding: 12px 29px;

    &.is-active {
      background-color: #fff5f2;
    }
  }

  :deep(.el-collapse-item__arrow) {
    display: none;
  }

  :deep(.el-collapse-item__wrap) {
    border-bottom: none;
    background-color: #fff5f2;
  }

  :deep(.el-collapse-item__content) {
    padding: 0;
  }

  &__question-group {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  &__icon {
    margin-left: auto;

    .vertical-line {
      transition: opacity 0.2s;
      transform-origin: center;
    }
  }

  :deep(.el-collapse-item__header.is-active) .vertical-line {
    opacity: 0;
  }

  &__q-label {
    color: #f03a00;
    font-weight: 700;
    font-size: 1.25rem;
  }

  &__question {
    color: black;
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
    letter-spacing: 1.8px;
  }

  &__answer-panel {
    background-color: #fff5f2;
    padding: 0 29px;
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }

  &__a-label {
    color: #f03a00;
    font-weight: 700;
    font-size: 1.25rem;
    padding-top: 16px;
  }

  &__answer {
    color: #606266;
    font-size: 18px;
    line-height: 1.625;
  }
  .faq-item__icon {
    position: absolute;
    right: 29px;
  }
  .el-divider {
    width: calc(100% - 58px);
    margin: 0 auto;
    border-color: #f03a00;
  }
}

@media (max-width: 1000px) {
  .faq {
    padding: 0 0 60px 0;
    max-width: calc(100% - 60px);
    &__list {
      gap: 0.75rem;
    }
  }
  .faq-item {
    &__question-group {
      gap: 1rem;
    }
  }
}
</style>
