import { defineStore } from "pinia";
import { ConfirmMessage, createAlertMessage } from "@/Utilities/AlertMessage.ts";
import { gtmManager } from "@/library/GtmManager.ts";
import { formatBytesToString } from "@/Utilities/Utility.ts";

export const useAlertStore = defineStore("AlertStore", () => {
  // 執行AI失敗
  const alertAIFailed = async () => {
    const title: string = "本次 AI 执行失败";
    const content: string[] = ["系统在执行过程中发生异常", "未能完成本次 AI 内容产出", "请稍后再试一次", "如持续发生异常，请联系 BBIN 专员协助处理", ""];
    const message: string = createAlertMessage(content);

    gtmManager.trackEvent({ event: "彈跳視窗_本次 AI 执行失败" });

    return await ConfirmMessage({
      message,
      title,
      cancelText: "我知道了",
      options: {
        cancelButtonClass: "custom-cancel-btn w-330",
      }
    });
  };
  // 執行AI點數不足
  const alertAIPointNotEnough = async () => {
    const title: string = "AI点数不足";
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">
您的 AI 点数已用完，暂时无法使用AI功能
<ul style="alert-ul">
    <li>AI 点数为您网站的管理者共用</li>
    <li>每月 1 日将自动为您网站补充</li>
</ul>
<br/>
    </div>`;

    gtmManager.trackEvent({ event: "彈跳視窗_AI 点数不足" });

    return await ConfirmMessage({
      message,
      title,
      cancelText: "我知道了",
      options: {
        cancelButtonClass: "custom-cancel-btn w-330",
      }
    });
  };
  // 登入權限拒絕
  const alertPermissionDenied = async () => {
    const title: string = "无操作权限";
    const content: string[] = ["此功能需从【后台管理】启用功能连结", "无法直接透过网址呼叫使用", "如您依正常流程操作仍无法使用", "请联系 BBIN 专员协助处理"];
    const message: string = createAlertMessage(content);

    gtmManager.trackEvent({ event: "彈跳視窗_功能权限异常" });

    return await ConfirmMessage({
      message,
      title,
      cancelText: "我知道了",
      options: {
        cancelButtonClass: "custom-cancel-btn w-330",
      }
    });
  };
  // 無法生成圖片
  const alertUnableGenerateImage = async (errorCode: string) => {
    const title: string = "图片输出异常";
    const content: string[] = [`${errorCode}:无法生成图片`, "", ""];
    const message: string = createAlertMessage(content);
    return await ConfirmMessage({
      message,
      title,
      cancelText: "关闭弹窗",
      options: {
        cancelButtonClass: "custom-cancel-btn w-192",
        confirmButtonClass: "custom-confirm-btn w-246",
        customClass: "custom-message-box message-box-w-xl"
      }
    });
  };
  // 上傳流程失敗
  const alertUploadFailed = async () => {
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
  };
  // PD上傳圖片確認關閉
  const alertConfirmUpload = async () => {
    return await ConfirmMessage({
      message:
        '<div style="text-align: center; user-select: none; font-size: 16px;">您是否已完成编辑？<br/>点击「是」将会把图片传送至后台<br/>并关闭广宣生成器<br/></div>',
      title: "完成编辑确认",
      confirmText: "是",
      cancelText: "否",
    });
  };
  // PD上傳圖片+下載確認關閉
  const alertConfirmUploadAndDownload = async () => {
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">您是否要下載圖片？<br/>點擊「是」將會把圖片下載至本地<br/>並關閉管宣生成器</div>`;
    const title: string = "下載圖片關閉確認";
    return await ConfirmMessage({
      message,
      title,
      confirmText: "是",
      cancelText: "否",
    });
  };
  // 圖片檔案大小限制 max單位KB
  const alertImageSizeNotAllowed = async (max: number = 2097152 ) => {
    const title: string = "图片无法上传";
    const message: string = `<div style="text-align: center; user-select: none; font-size: 16px;">
请确认图片格式与大小符合规范
<ul style="alert-ul">
    <li>图片格式需为 JPG、JPEG、PNG</li>
    <li>档案大小上限为${ formatBytesToString(max) }</li>
    <li>档名不可包含小数点</li>
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

  return {
    // Actions
    alertAIFailed,
    alertAIPointNotEnough,
    alertPermissionDenied,
    alertUnableGenerateImage,
    alertConfirmUpload,
    alertConfirmUploadAndDownload,
    alertUploadFailed,
    alertImageSizeNotAllowed
  };
});