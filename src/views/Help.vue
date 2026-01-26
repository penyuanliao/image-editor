<template>
  <div class="help-container">
    <main class="help-main-content" ref="mainContentRef" :style="helpMainContentStyle">
      <div class="navbar">
        <img src="@/assets/icons/logo.png" height="136" alt="Logo" class="logo" />
      </div>
      <OnboardingFlow class="onboarding" :iconSize="36"/>
      <FeatureSection
        v-for="(feature, index) in features"
        :key="index"
        :number="feature.step"
        :title="feature.title"
        :subtitle="feature.subtitle"
        :desc="feature.desc"
        :imageSrc="feature.imageSrc"
        :reverse="feature.reverse"
        :options="feature.options"
      />
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import OnboardingFlow from "@/components/Onboarding/OnboardingFlow.vue";
import FeatureSection from "@/components/Help/FeatureSection.vue";
import FAQ from "@/components/Help/FAQ.vue";
import Footer from "@/components/Help/Footer.vue";

defineEmits(['close']);

interface IFeatures {
  step: string;
  title: string;
  subtitle: string;
  desc: string[];
  imageSrc: string;
  reverse: boolean;
  options?: {
    descLetterSpacing?: string
  };
}

const features = ref<IFeatures[]>([
  {
    step: "01",
    title: "BB AI 功能",
    subtitle: "释放您的无限创造力",
    desc: [
      "每月 BBIN 为各网站管理者提供<span style='color: #F15624'>单站共用免费 AI 点数<span>",
      "让您的行销与设计素材快速产出，节省时间、提升成效",
      "<br/>",
      "透过 BB AI，轻松完成<span style='color: #F15624'>背景换色、物件转换、风格调整<span>",
      "也可直接输入提示词描述，生成符合您需求的全新素材",
      "<br/>",
      "同时支援自行上传图片素材并运用AI一键移除图片背景",
      "让素材能灵活套用于各种设计情境，大幅提升制作效率",
    ],
    imageSrc: "/assets-editor/assets/step1.png",
    reverse: true
  },
  {
    step: "02",
    title: "BB 素材库",
    subtitle: "一站式素材整合加速设计产出",
    desc: [
      "BBIN 建构多元且完整、持续扩充的<span style='color: #F15624'>素材库</span>，涵盖多元设计情境",
      "透过清晰的分类架构或关键字搜寻，讓您可快速的找到所需素材",
      "<br/>",
      "素材一键加入画布后，即可开始直觉<span style='color: #F15624'>自由调整位置</span>、尺寸等设定",
      "讓您無須學習複雜的軟體操作，即可轻松完成廣宣版面需求设计",
      "<br/>",
      "完成编辑后，系统也會将您所见即所得的設計內容<span style='color: #F15624'>自动汇入后台</span>",
      "助您在推廣的廣宣產出上，能高效的完成上架",
    ],
    imageSrc: "/assets-editor/assets/step2.png",
    reverse: false
  },
  {
    step: "03",
    title: "文字编辑模组",
    subtitle: "让文案成为视觉的一部分",
    desc: [
      "系统提供丰富的文字编辑模组，透过操作<span style='color: #F15624'>直觉的编辑介面</span>",
      "让您快速的完成文字配置，可依需求精准调整样式与层次",
      "<br/>",
      "并利用<span style='color: #F15624'>精选适合广宣设计的优质字体</span>，助您产出高级质感",
      "最后搭配字级、色彩、透明、行距与字距等丰富设定功能",
      "让您脑中的创意文案，一秒化身为广宣设计画面中的主角",
      "让<span style='color: #F15624'>讯息传递更清楚</span>、阅读体验更升级",
    ],
    imageSrc: "/assets-editor/assets/step3.png",
    reverse: true,
    options: {
      descLetterSpacing: "2.1px"
    }
  }
]);

const mainContentRef = ref<HTMLElement | null>(null);
const containerWidth = ref(0);

const updateContainerWidth = () => {
  if (mainContentRef.value) {
    containerWidth.value = mainContentRef.value.clientWidth;
  }
};

onMounted(() => {
  updateContainerWidth();
  window.addEventListener("resize", updateContainerWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateContainerWidth);
});

const helpMainContentStyle = computed(() => {
  const imgWidth: number = 1920;
  const imgHeight: number = 1080;
  const ratio = imgWidth / imgHeight;
  const calculatedHeight = containerWidth.value > 0 ? containerWidth.value / ratio : 720; // 初始或寬度為0時的備用高度
  return {
    "--dialog-onboarding-width": "100%",
    "--dialog-onboarding-height": `${calculatedHeight}px`,
  }
})

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
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
  border-bottom: 1px solid theme.$border-color-base;
  background: white;
  z-index: 100;
  .logo {
    width: 150px;
    object-fit: contain;
    padding-left: 32px;
    padding-right: 32px;
  }
}
.onboarding {
  width: 100%;
  height: var(--dialog-onboarding-height);
}
.help-main-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
