<template>
  <div class="help-container">
    <div class="navbar">
      <img src="@/assets/icons/logo.png" height="136" alt="Logo" class="logo" />
    </div>
    <main class="help-main-content">
      <FeatureSection number="01" title="BB AI 功能" subtitle="释放您的无限创造力"
                      description="每月 BBIN 为各网站管理者提供单元共用免费 AI 点数，让您的行销与设计素材快速产出，节省时间、提升成效。"
                      description2="透过 BB AI，轻松完成背景换色、物件转换、风格调整，也可直接输入提示詞描述，生成符合您需求的全新素材。同时支援自行上传图片素材并运用 AI 一键移除图片背景，让素材能更灵活套用于各种设计情境，大幅提升制作效率。"
                      imageSrc="/assets-editor/assets/step1.png" :reverse="true" />

      <FeatureSection number="02" title="BB 素材库" subtitle="一站式素材整合加速设计产出"
                      description="BBIN 建构多元视觉层，持续扩充的素材库，涵盖多元设计情境，透过清晰的分类架构或关键字搜寻，填空可快速的找到所需素材。"
                      description2="素材一键加入画布后，即可开始直觉自由调整位置、尺寸等设定，缘您无须学习复杂的设计软体操作，即可轻松完成广宣页面设计。完成编辑后，系统也会将您所获得排版的设计内容自动汇入后台，放置在推荐的广宣版位上，高效率的完成上架。"
                      imageSrc="/assets-editor/assets/step2.png" />

      <FeatureSection number="03" title="文字编辑模组" subtitle="让文案成为视觉的一部分"
                      description="系统提供丰富的文字编辑模組，透过操作直觉的编辑介面，让您快速的完成文字配置，可依需求精准调整样式与层次。"
                      description2="并利用精选适合广宣设计的字体，助您产出高品质，无论搭配字级、色彩、透明、行距与字距等丰富设定功能，讓您脑中的创意文案，一秒化身为广宣设计画面中的主角，让讯息传达更清楚、阅读体验更升级。"
                      imageSrc="/assets-editor/assets/step3.png" :reverse="true" />
      <FAQ class="faq"/>
      <Footer/>
    </main>
    <el-backtop class="back-top" target=".help-main-content" :bottom="171" :right="24">
      <el-icon size="16">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </el-icon>
    </el-backtop>
  </div>
</template>

<script setup lang="ts">
import FeatureSection from "@/components/Help/FeatureSection.vue";
import FAQ from "@/components/Help/FAQ.vue";
import Footer from "@/components/Help/Footer.vue";

defineEmits(['close']);
</script>

<style scoped lang="scss">
@use "@/styles/theme";

.help-container {
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: white;
}
.navbar {
  width: 100%;
  height: 80px;
  min-height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid theme.$border-color-base;
  z-index: 100;
  .logo {
    width: 150px;
    object-fit: contain;
    padding-left: 32px;
    padding-right: 32px;
  }
}
.help-main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
}
.faq {
  position: relative;
}
.back-top {
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  background-color: #FF7300;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;

  @media (min-width: 1001px) {
    right: 3rem;
  }

  &:hover {
    background-color: #E66700;
  }
}

</style>
