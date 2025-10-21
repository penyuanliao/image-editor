<script setup lang="ts">
import Konva from "konva";
import {useImage} from "vue-konva";
import {ref, reactive, onMounted, computed} from "vue";
const container = ref<HTMLDivElement | null>(null);
const stageRef = ref();
const transformerRef = ref();
const backgroundRectRef = ref(); // 1. 為背景矩形新增 ref
const selectionRectRef = ref(); // 用於框選的矩形
const stageConfig = reactive({
  width: 800,
  height: 600,
} as Konva.StageConfig);

const [ image ] = useImage('https://konvajs.org/assets/darth-vader.jpg', 'Anonymous');

interface KonvaConfig {
  draggable: boolean; // 是否可以拖拉
  name: string; // 收尋檢查用名稱
}

interface KonvaTextProps {
  text: string;
  fontFamily: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontStyle: 'normal' | 'italic' | 'bold' | string;
  // 旋轉角度 (radians)
  rotation: number;
}
interface KonvaTextShadowProps {
  shadowEnabled: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}
interface KonvaTextStrokeProps {
  enabled: boolean;
  strokeColor?: string;
  strokeWidth?: number;
}
interface KonvaTextGradientProps {
  fillPriority: 'linear-gradient' | string;
  fillLinearGradientStartPoint: {
    x: number;
    y: number;
  };
  fillLinearGradientEndPoint: {
    x: number;
    y: number;
  };
  fillLinearGradientColorStops: [number, string, number, string];
}


// 1. 建立一個 elements 陣列來管理所有物件
const elements = ref([
  {
    id: 'image1',
    type: 'image',
    config: {
      image: image,
      x: 80,
      y: 100,
      width: 300,
      height: 100,
      draggable: true,
      name: 'selectable-object',
    }
  },
  {
    id: 'image2',
    type: 'image',
    config: {
      image: image,
      x: 300,
      y: 300,
      width: 150,
      height: 150,
      draggable: true,
      name: 'selectable-object',
    }
  },
  {
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
  }
]);

function getCrop(image: any, size: any, clipPosition = 'center-middle') {
  const width = size.width;
  const height = size.height;
  const aspectRatio = width / height;

  let newWidth;
  let newHeight;
  if (!image) return {
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
  };

  const imageRatio = image.width / image.height;
  if (aspectRatio >= imageRatio) {
    newWidth = image.width;
    newHeight = image.width / aspectRatio;
  } else {
    newWidth = image.height * aspectRatio;
    newHeight = image.height;
  }

  let x: number = 0;
  let y: number = 0;
  if (clipPosition === 'left-top') {
    x = 0;
    y = 0;
  } else if (clipPosition === 'left-middle') {
    x = 0;
    y = (image.height - newHeight) / 2;
  } else if (clipPosition === 'left-bottom') {
    x = 0;
    y = image.height - newHeight;
  } else if (clipPosition === 'center-top') {
    x = (image.width - newWidth) / 2;
    y = 0;
  } else if (clipPosition === 'center-middle') {
    x = (image.width - newWidth) / 2;
    y = (image.height - newHeight) / 2;
  } else if (clipPosition === 'center-bottom') {
    x = (image.width - newWidth) / 2;
    y = image.height - newHeight;
  } else if (clipPosition === 'right-top') {
    x = image.width - newWidth;
    y = 0;
  } else if (clipPosition === 'right-middle') {
    x = image.width - newWidth;
    y = (image.height - newHeight) / 2;
  } else if (clipPosition === 'right-bottom') {
    x = image.width - newWidth;
    y = image.height - newHeight;
  }

  return {
    cropX: x,
    cropY: y,
    cropWidth: newWidth,
    cropHeight: newHeight,
  };
}

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

  // 2. 在匯出前，隱藏背景矩形
  backgroundNode.visible(false);

  // 確保 Transformer 也被隱藏，這樣匯出的圖片才不會有藍色的框線
  const transformerNode = transformerRef.value?.getNode() as Konva.Transformer;
  transformerNode.nodes([]); // 清空選取來隱藏它

  const dataURL = stage.toDataURL({ pixelRatio: 2 });

  // 3. 匯出後，立刻將背景矩形顯示回來
  backgroundNode.visible(true);

  // 建立臨時連結並觸發下載
  const link = document.createElement('a');
  link.download = 'canvas-image-transparent.png'; // 修改檔名以茲區別
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

</script>

<template>
  <div class="main-container" ref="container">
    <div class="controls">
      寬度: <el-input-number v-model="stageConfig.width" :min="100" size="small"></el-input-number>
      高度: <el-input-number v-model="stageConfig.height" :min="100" size="small"></el-input-number>
      <el-button type="primary" @click="handleExport">匯出圖片 (透明背景)</el-button>
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
      </v-layer>
      <!-- 互動層 -->
      <v-layer name="content-layer">
        <!-- 2. 使用 v-for 迴圈來渲染所有物件 -->
        <template v-for="element in elements" :key="element.id">
          <v-image
              v-if="element.type === 'image'"
              :config="{ ...element.config, ...getCrop(element.config.image, element.config) }"
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
    padding: 10px;
    background-color: #fafafa;
    border-bottom: 1px solid #eee;
  }
  .main-container {
    width: 100%;
    height: 100%;
  }
  .stage {
    /* background-color: white; */ /* 建議移除或註解掉，改用 v-rect 控制 */
  }
</style>
