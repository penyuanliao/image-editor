<script setup lang="ts">
import { computed } from "vue";
import NPanelButton from "@/components/Basic/NPanelButton.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: "GUEST"
  },
  visible: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["update:visible"]);

const dialogFormVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

const handleCommentSubmit = () => {
  console.log("handleCommentSubmit");
  dialogFormVisible.value = false;
}

</script>

<template>
  <el-dialog class="dialog-comment" v-model="dialogFormVisible" center>
    <template #header="{ titleId }">
      <div class="comment-header">
        <div :id="titleId">建議回饋</div>
      </div>
    </template>
    <p class="description">敬愛的 {{ name }} <br>歡迎您提供寶貴的建議與回饋<br>BBIN 將持續聆聽您的聲音<br>作為優化服務與體驗的重要依據</p>
    <div>
      <textarea class="content" placeholder="歡迎分享您的使用感受、問題或任何想法、建議您的意見對我們非常重要，請放心填寫"></textarea>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <NPanelButton @click="handleCommentSubmit">提交回馈建议</NPanelButton>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/styles/theme";

.comment-header {
  font-size: 30px;
  color: theme.$text-color;
  font-weight: bold;
}
.description {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 20px;

}
.content {
  width: 100%;
  height: 300px;
  font-size: 20px;
  &::placeholder {
    font-size: 20px;
  }
  &:focus {
    outline: none;
    border-color: #78efb2;
  }
}
</style>