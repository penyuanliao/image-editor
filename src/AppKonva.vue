<script setup lang="ts">
import Konva from "konva";
import {useImage} from "vue-konva";
import {ref, reactive, onMounted, computed, watch} from "vue";
import { useKImgEditorStore } from "./store/kImgEditorStore.ts";
import FileInputComponent from "./components/konva/FileInputComponent.vue";
import Popover from "./components/konva/Popover.vue";

const store = useKImgEditorStore();

const container = ref<HTMLDivElement | null>(null);
const stageRef = ref();
const transformerRef = ref();
const backgroundRectRef = ref(); // 1. 為背景矩形新增 ref
const selectionRectRef = ref(); // 用於框選的矩形
const stageConfig = reactive({
  width: 800,
  height: 600,
} as Konva.StageConfig);

// 裁切功能相關狀態
const isCropping = ref(false); // 是否處於裁切模式
const cropRectRef = ref(); // 裁切框的 ref
const cropRect = reactive({
  x: 0,
  y: 0,
  width: stageConfig.width,
  height: stageConfig.height,
});

const toggleCropMode = () => {
  isCropping.value = !isCropping.value;
};

const [ image ] = useImage('https://konvajs.org/assets/darth-vader.jpg', 'Anonymous');

// 1. 建立一個 elements 陣列來管理所有物件
store.addElement({
  id: 'text1',
  type: 'text',
  config: {
    // 輸入文字
    text: '這是中文字',
    // 選擇字體
    fontFamily: 'Arial',
    x: 400,
    y: 150,
    fontSize: 24,
    // 1. 告訴 Konva 優先使用線性漸層
    fillPriority: 'linear-gradient',
    fillLinearGradientStartPoint: {
      x: -97, // 讓漸層從文字左側開始
      y: 0
    },
    fillLinearGradientEndPoint: {
      x: 97, // 漸層長度為 100px
      y: 0   // y=0 使其成為水平漸層
    },
    fillLinearGradientColorStops: [0, 'red', 1, 'yellow'],

    shadowEnabled: true,
    shadowColor: 'black',
    shadowBlur: 5,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowOpacity: 0.5,

    draggable: true,
    name: 'selectable-object'
  }
});
watch(image, (newImage) => {
  store.addElement({
    id: 'image2',
    type: 'image',
    config: {
      image: newImage,
      x: 300,
      y: 300,
      width: newImage?.width,
      height: newImage?.height,
      draggable: true,
      name: 'selectable-object',
    }
  })
  store.addElement({
    id: 'image1',
    type: 'image',
    config: {
      image: newImage,
      x: 80,
      y: 100,
      width: newImage?.width,
      height: newImage?.height,
      draggable: true,
      name: 'selectable-object',
    }
  })
})

const boundBoxFunc = (oldBox: any, newBox: any) => {
  if (Math.abs(newBox.width) < 1 || Math.abs(newBox.height) < 1) {
    return oldBox;
  }
  return newBox;
};

// 3. 修改 handleTransform，使其能處理任何物件
const handleTransformEnd = (e: Konva.KonvaEventObject<any>, element: any) => {
  const node = e.target;
  const scaleX = node.scaleX();
  const scaleY = node.scaleY();

  node.scaleX(1);
  node.scaleY(1);
  element.config.width = Math.max(5, node.width() * scaleX);
  element.config.height = Math.max(5, node.height() * scaleY);
};



const selection = reactive({
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  visible: false,
});

const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = e.target.getStage();
  if (!stage || !selection.visible) return;

  const pos = stage.getPointerPosition();
  if (!pos) return;
  selection.x2 = pos.x;
  selection.y2 = pos.y;
};

const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
  const stage = e.target.getStage();
  if (!stage) return;

  // 移除事件監聽
  stage.off('mousemove', handleStageMouseMove);
  stage.off('mouseup', handleStageMouseUp);

  if (!selection.visible) return;
  selection.visible = false;

  const transformerNode = transformerRef.value?.getNode() as Konva.Transformer;
  if (!transformerNode) return;

  const box = selectionRectRef.value.getNode().getClientRect();
  const selectedNodes = stage.find('.selectable-object').filter((shape: any) =>
      Konva.Util.haveIntersection(box, shape.getClientRect())
  );

  transformerNode.nodes(selectedNodes);
};
// 拖拉框
const selectionRectConfig = computed(() => ({
  x: Math.min(selection.x1, selection.x2),
  y: Math.min(selection.y1, selection.y2),
  width: Math.abs(selection.x2 - selection.x1),
  height: Math.abs(selection.y2 - selection.y1),
  fill: 'rgba(0, 161, 255, 0.3)',
  visible: selection.visible,
}));

const handleStageMouseDown = (e: Konva.KonvaEventObject<PointerEvent>) => {
  const stage = e.target.getStage();
  if (!stage) return;

  // 如果在裁切模式下，點擊任何地方都不觸發物件選取
  if (isCropping.value) {
    transformerRef.value?.getNode().nodes([]); // 清空選取
    return;
  }

  // 1. 點擊到舞台空白處 -> 開始框選
  if (e.target === stage) {
    const pos = stage.getPointerPosition();
    if (!pos) return;
    selection.x1 = pos.x;
    selection.y1 = pos.y;
    selection.x2 = pos.x;
    selection.y2 = pos.y;
    selection.visible = true;
    stage.on('mousemove', handleStageMouseMove);
    stage.on('mouseup', handleStageMouseUp);
    return;
  }

  const transformerNode = transformerRef.value?.getNode() as Konva.Transformer;
  if (!transformerNode) return;

  // 2. 點擊到 Transformer 控制點，不做任何事
  const clickedOnTransformer = e.target.getParent()?.className === 'Transformer'
  if (clickedOnTransformer) {
    return;
  }

  // 3. 點擊到可選取的物件
  const targetNode = e.target;
  if (targetNode.hasName('selectable-object')) {
    const isSelected = transformerNode.nodes().indexOf(targetNode) >= 0;
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    console.log(`targetNode ${targetNode.getPosition().x}, ${targetNode.getPosition().y}`);
    if (!metaPressed && !isSelected) {
      // 單選：如果沒有按住 shift/ctrl/meta 且物件未被選中，則只選取此物件
      transformerNode.nodes([targetNode]);
    } else if (metaPressed && isSelected) {
      // 多選移除：如果按住 shift/ctrl/meta 且物件已被選中，則從選取中移除
      const nodes = transformerNode.nodes().slice(); // 複製陣列
      nodes.splice(nodes.indexOf(targetNode), 1);
      transformerNode.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      // 多選加入：如果按住 shift/ctrl/meta 且物件未被選中，則加入到選取中
      const nodes = transformerNode.nodes().concat([targetNode]);
      transformerNode.nodes(nodes);
    }
  }
};

onMounted(() => {
  const greenLine = new Konva.Line({
    points: [0, 0, 100, 100],
    stroke: 'green',
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
    dash: [33, 10]
  });
  greenLine.y(50);
  // 我們可以將非互動元素直接加到 stage 的 layer 中
  stageRef.value?.getNode().findOne('.background-layer').add(greenLine);
})

const handleExport = () => {
  const stage = stageRef.value?.getNode();
  const backgroundNode = backgroundRectRef.value?.getNode();
  if (!stage || !backgroundNode) return;

  // 確保 Transformer 也被隱藏，這樣匯出的圖片才不會有藍色的框線
  const transformerNode = transformerRef.value?.getNode() as Konva.Transformer;
  transformerNode.nodes([]); // 清空選取來隱藏它

  // 準備匯出設定 (讓 TypeScript 自動推斷類型)
  const exportConfig = { pixelRatio: 2 } as Konva.NodeConfig;

  // 在匯出前，隱藏不必要的元素
  backgroundNode.visible(false); // 隱藏灰色背景
  if (isCropping.value) {
    // 如果在裁切模式，設定匯出區域並隱藏裁切框
    exportConfig.x = cropRect.x;
    exportConfig.y = cropRect.y;
    exportConfig.width = cropRect.width;
    exportConfig.height = cropRect.height;
    cropRectRef.value?.getNode().visible(false);
  }

  // 執行匯出
  const dataURL = stage.toDataURL(exportConfig);

  // 匯出後，立刻將隱藏的元素顯示回來，恢復畫布狀態
  backgroundNode.visible(true);
  if (isCropping.value) {
    cropRectRef.value?.getNode().visible(true);
  }

  // 建立檔名
  const fileName = isCropping.value ? 'canvas-image-cropped.png' : 'canvas-image-transparent.png';

  // 建立臨時連結並觸發下載
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const handleFileInputChange = (list: HTMLImageElement[]) => {
  store.backgroundImage = list[0] as HTMLImageElement | null;
}

// 當裁切框被拖曳結束時，更新其位置
const handleCropDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
  cropRect.x = e.target.x();
  cropRect.y = e.target.y();
};

</script>

<template>
  <div class="main-container" ref="container">
    <div class="controls">
      <div>
        畫布寬度: <el-input-number v-model="stageConfig.width" :min="100" size="small"></el-input-number>
        畫布高度: <el-input-number v-model="stageConfig.height" :min="100" size="small"></el-input-number>
      </div>
      <div class="crop-controls">
        <el-button @click="toggleCropMode" :type="isCropping ? 'success' : ''">{{ isCropping ? '停用裁切' : '啟用裁切' }}</el-button>
        <span v-if="isCropping">裁切寬度: <el-input-number v-model="cropRect.width" :min="10" size="small"></el-input-number></span>
        <span v-if="isCropping">裁切高度: <el-input-number v-model="cropRect.height" :min="10" size="small"></el-input-number></span>
      </div>
      <FileInputComponent v-model:images="store.imageList" @change="handleFileInputChange"/>
      <el-button type="primary" @click="handleExport">匯出圖片 (透明背景)</el-button>
      <Popover/>
    </div>
    <v-stage :config="stageConfig" ref="stageRef" class="stage" @mousedown="handleStageMouseDown">
      <!-- 背景層 -->
      <v-layer name="background-layer">
        <v-rect ref="backgroundRectRef" :config="{
          x: 0,
          y: 0,
          width: stageConfig.width,
          height: stageConfig.height,
          fill: '#f0f0f0', // 在這裡設定你想要的背景顏色
          listening: false, // 讓背景不回應滑鼠事件，很重要！
        }" />
        <v-image
            :config="{
              x: 0,
              y: 0,
              width: stageConfig.width,
              height: stageConfig.height,
              image: store.backgroundImage,
              listening: false, // 讓背景不回應滑鼠事件，很重要！
            }"
        />
      </v-layer>
      <!-- 互動層 -->
      <v-layer name="content-layer">
        <!-- 2. 使用 v-for 迴圈來渲染所有物件 -->
        <template v-for="element in store.elements" :key="element.id">
          <v-image
              v-if="element.type === 'image'"
              :config="{ ...element.config }"
              @transformend="(e: any) => handleTransformEnd(e, element)"
          />
          <v-text
              v-if="element.type === 'text'"
              :config="element.config"
              @transformend="(e: any) => handleTransformEnd(e, element)"
          />
        </template>

        <!-- 用於框選的矩形 -->
        <v-rect
            ref="selectionRectRef"
            :config="selectionRectConfig" />
        <!-- 用於編輯框選的 Transformer -->
        <!-- 裁切功能群組 -->
        <v-group v-if="isCropping">
          <!-- 1. 灰色半透明遮罩 (反向) -->
          <v-shape
              :config="{
                listening: false, // 這個遮罩不回應滑鼠事件
                sceneFunc: (context: CanvasRenderingContext2D) => {
                  // 先畫一個覆蓋整個畫布的半透明灰色矩形
                  context.beginPath();
                  context.rect(0, 0, stageConfig.width || 0, stageConfig.height || 0);
                  context.fillStyle = 'rgba(0, 0, 0, 0.5)';

                  // 接著定義內矩形 (裁切區)
                  context.rect(cropRect.x, cropRect.y, cropRect.width || 0, cropRect.height || 0);

                  // 使用 evenodd 填充規則來產生挖洞效果
                  context.fill('evenodd');
                }
              }"
          />
          <!-- 2. 可拖曳的裁切框 (只有邊框，中間透明) -->
          <v-rect
              ref="cropRectRef"
              :config="{
                ...cropRect,
                fill: 'transparent', // 中間必須是透明的，才能看到下面的內容
                stroke: 'white',
                strokeWidth: 2,
                draggable: true
              }" @dragend="handleCropDragEnd" />
        </v-group>
        <v-transformer
            ref="transformerRef"
            :config="{
              rotateAnchorOffset: 25,
              boundBoxFunc: boundBoxFunc
            }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<style scoped>
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    padding: 10px;
    background-color: #fafafa;
    border-bottom: 1px solid #eee;
  }
  .crop-controls {
    display: flex;
    gap: 10px;
  }
  .main-container {
    width: 100%;
    height: 100%;
  }
  .stage {
    /* background-color: white; */ /* 建議移除或註解掉，改用 v-rect 控制 */
  }
</style>
