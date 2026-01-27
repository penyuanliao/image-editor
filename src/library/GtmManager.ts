import  { type GtmSupport, useGtm } from "@gtm-support/vue-gtm";

export interface TrackEventParams {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: any;
  [key: string]: any;
}

class GtmManager {
  private static instance: GtmManager;
  private gtm: GtmSupport | undefined = undefined;
  protected debug: boolean = false;

  private constructor() {
    this.gtm = useGtm();
    this.debug = import.meta.env.DEV;
  }

  public static getInstance(): GtmManager {
    if (!GtmManager.instance) {
      GtmManager.instance = new GtmManager();
    }
    return GtmManager.instance;
  }

  /**
   * 設定 GTM 實例 (需在 main.ts 初始化後呼叫)
   * @param gtm
   */
  public setGtm(gtm: GtmSupport) {
    this.gtm = gtm;
  }

  /**
   * 發送自訂事件
   * @param params
   */
  public trackEvent(params: TrackEventParams) {
    if (this.gtm) {
      this.gtm.trackEvent(params);
    } else if (this.debug) {
      console.info(`[GtmManager]: ${ JSON.stringify(params, null, '\t') }`);
    } else {
      console.warn("[GtmManager] GTM instance is not initialized.");
    }
  }
}

export const gtmManager = GtmManager.getInstance();