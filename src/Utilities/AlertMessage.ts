import { ElMessage, ElMessageBox } from "element-plus";
import { nextTick } from "vue";

export const ErrorMessage = (message: string) => {
  ElMessage({
    message,
    type: "error",
    plain: true
  });
};
export const AlertMessage = (message: string, title: string = "警告") => {
  return ElMessageBox.alert(message, title);
};
export const PromptMessage = async (message: string, title: string = "提示") => {
  // 用一個旗標來追蹤是否正在使用輸入法
  let isComposing = false;

  const promise = ElMessageBox.prompt(message, title, {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    showCancelButton: true,
    // 在 MessageBox 關閉前進行攔截
    beforeClose: (action, _, done) => {
      // 如果是確認操作，且使用者正在使用輸入法，則不關閉
      if (action === "confirm" && isComposing) {
        return;
      }
      // 否則，正常關閉
      done();
    }
  });

  // 在下一個 DOM 更新週期，找到輸入框並附加事件
  await nextTick(() => {
    const inputEl = document.querySelector(
      ".el-message-box__input .el-input__inner"
    ) as HTMLInputElement;
    if (inputEl) {
      // 輸入法開始
      inputEl.addEventListener("compositionstart", () => {
        isComposing = true;
      });
      // 輸入法結束
      inputEl.addEventListener("compositionend", () => {
        isComposing = false;
      });
    }
  });

  return promise;
};
