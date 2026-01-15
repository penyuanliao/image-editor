<script setup lang="ts">
import { computed } from "vue";
import { useCommentStore } from "@/store/useCommentStore.ts";

const commentStore = useCommentStore();

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: "GUEST"
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:visible"]);

const dialogFormVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

const handleCommentSubmit = async () => {
  console.log("handleCommentSubmit", commentStore.comments.content);
  const status = await commentStore.addComment(commentStore.comments.content);
  if (status) {
    dialogFormVisible.value = false;
  }
  dialogFormVisible.value = false;
};
</script>

<template>
  <el-dialog
    class="dialog-comment"
    width="561px"
    :show-close="false"
    v-model="dialogFormVisible"
    center
  >
    <template #header="{ titleId }">
      <div class="comment-header">
        <div :id="titleId" class="title">意见回馈</div>
        <!-- 自訂的關閉按鈕 -->
        <div class="custom-close-btn" @click="dialogFormVisible = false">
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="17" cy="17" r="16.5" fill="currentColor" stroke="#FFC3B0" />
            <path
              d="M22 22L12 12M22 12L12 22"
              stroke="white"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </template>
    <div>
      <p class="description">
        敬爱的 <span class="name">{{ name }}</span> <br />欢迎您提供宝贵的建议与回馈<br />BBIN
        将持续聆听您的声音<br />作为优化服务与体验的重要依据
      </p>
    </div>
    <div>
      <textarea
        class="comment-content"
        v-model="commentStore.comments.content"
        placeholder="欢迎分享您的使用感受、问题或任何想法、建议&#10;您的意见对我们非常重要，请放心填写"
      ></textarea>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <div class="comment-submit-btn" @click="handleCommentSubmit">
          提交回馈建议<span style="margin-top: 4px; margin-left: 5px;">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.88507 1.22601L5.21394 1.93771C4.92372 2.24227 4.92976 2.73918 5.22603 3.03733L10.037 8L5.22603 12.9627C4.93279 13.2608 4.92674 13.7577 5.21394 14.0623L5.88507 14.774C6.16622 15.0753 6.62574 15.0753 6.90991 14.774L12.7869 8.54179C13.071 8.24365 13.071 7.75635 12.7869 7.455L6.90991 1.22601C6.62876 0.924662 6.16925 0.924662 5.88507 1.22601Z"
                fill="currentColor"
              />
            </svg>
          </span>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@use "@/styles/theme";
.dialog-comment {
  --el-dialog-border-radius: 50px;
  min-height: 606px;
  max-width: 561px;
}
.comment-header {
  font-size: 30px;
  color: theme.$text-color;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;

  .title {
    padding-top: 40px;
    font-weight: 700;
    font-size: 26px;
    line-height: 100%;
    text-align: center;
  }
}
.description {
  position: relative;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15px;
  margin-top: 0;
  margin-bottom: 22px;
  .name {
    color: #f15624;
  }
}
.comment-content {
  width: calc(100% - 30px); /* 扣除左右 margin (31px * 2) */
  height: 300px;
  font-size: 15px;
  border-color: #dfdfdf;
  border-radius: 5px;
  overflow: hidden;
  resize: none;
  padding: 15px 15px;
  margin: 0 15px;
  box-sizing: border-box;
  overflow-y: scroll;
  scrollbar-color: #D9D9D9 transparent;
  &::placeholder {
    font-size: 15px;
  }
  &:focus {
    outline: none;
    border-color: #78efb2;
  }
}
//
.custom-close-btn {
  position: absolute;
  right: 0;
  top: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f48b6a; // 預設顏色
  &:active {
    scale: 0.95;
  }
  &:hover {
    color: #f15624;
  }
}
.comment-submit-btn {
  position: relative;
  display: flex;
  height: 50px;
  border-radius: 40px;
  background-color: #ffc3b0;
  color: #f15624;
  text-align: center;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 15px;
  &:hover {
    background-color: #f15624;
    color: theme.$primary-color;
  }
}
</style>
