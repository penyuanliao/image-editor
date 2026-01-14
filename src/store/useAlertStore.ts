import { defineStore } from "pinia";
import { ConfirmMessage, createAlertMessage } from "@/Utilities/AlertMessage.ts";

export const useAlertStore = defineStore("AlertStore", () => {
  // 執行AI失敗
  const alertAIFailed = async () => {
    const title: string = "本次 AI 执行失败";
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">系统在执行过程中发生异常<br/>未能完成本次 AI 内容产出<br/>请稍后再试一次<br/>如持续发生异常，请联系 BBIN 专员协助处理</div>`;
    return await ConfirmMessage({
      message,
      title,
      confirmText: "我知道了",
    });
  }
  // 執行AI點數不足
  const alertAIPointNotEnough = async () => {
    const title: string = "AI点数不足";
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">
您的 AI 点数已用完，暂时无法使用AI功能
<ul>
    <li>AI 点数为您网站的管理者共用</li>
    <li>每月 1 日将自动为您网站补充</li>
</ul>
<br/>
    </div>`;
    return await ConfirmMessage({
      message,
      title,
      cancelText: "我知道了",
      options: {
        cancelButtonClass: "custom-cancel-btn w-330",
      }
    });
  }
  // 登入權限拒絕
  const alertPermissionDenied = async () => {
    const title: string = "无操作权限";
    const content: string[] = ["此功能需从【后台管理】启用功能连结", "无法直接透过网址呼叫使用", "如您依正常流程操作仍无法使用", "请联系 BBIN 专员协助处理"];
    const message: string = createAlertMessage(content);
    return await ConfirmMessage({
      message,
      title,
      confirmText: "我知道了",
    });
  }
  // 無法生成圖片
  const alertUnableGenerateImage = async () => {
    const title: string = "图片套用异常";
    const content: string[] = ["图片在编辑过程中发生异常，未成功套用", "请重新尝试，或下载目前图片后再关闭系统", "", ""];
    const message: string = createAlertMessage(content);
    return await ConfirmMessage({
      message,
      title,
      cancelText: "关闭弹窗",
      confirmText: "下载与关闭系统",
      options: {
        cancelButtonClass: "custom-cancel-btn w-192",
        confirmButtonClass: "custom-confirm-btn w-246",
        customClass: "custom-message-box message-box-w-xl"
      }
    });
  }

  return {
    // Actions
    alertAIFailed,
    alertAIPointNotEnough,
    alertPermissionDenied,
    alertUnableGenerateImage
  };
});