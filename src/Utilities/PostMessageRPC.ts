import { nanoid } from "nanoid";

export interface RPCMessage {
    jsonrpc: "2.0";
    id?: string;
    method?: string;
    params?: any;
    result?: any;
    error?: { code: number; message: string };
}

export class PostMessageRPC {
    private target: Window;
    private readonly origin: string;
    private handlers: Map<string, (params: any) => Promise<any> | any> = new Map();
    private pending: Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }> = new Map();
    private readonly _listener: (event: MessageEvent) => void;

    constructor(target: Window, origin: string = "*") {
        this.target = target;
        this.origin = origin;

        this._listener = (event: MessageEvent) => this.handleMessage(event);
        window.addEventListener("message", this._listener);
    }

    public destroy() {
        window.removeEventListener("message", this._listener);
        this.pending.forEach(p => p.reject(new Error("RPC destroyed")));
        this.pending.clear();
    }

    /**
     * 註冊一個可以被遠端呼叫的方法
     * @param method 方法名稱
     * @param handler 處理函式，可以是非同步
     */
    public on(method: string, handler: (params: any) => any) {
        this.handlers.set(method, handler);
    }

    /**
     * 呼叫遠端的方法
     * @param method 方法名稱
     * @param params 參數
     * @param timeout 超時時間 (毫秒)
     */
    public call<T = any>(method: string, params?: any, timeout: number = 5000): Promise<T> {
        const id = nanoid();
        const message: RPCMessage = {
            jsonrpc: "2.0",
            id,
            method,
            params
        };

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error(`RPC call ${method} timed out`));
                }
            }, timeout);

            this.pending.set(id, {
                resolve: (val) => {
                    clearTimeout(timer);
                    resolve(val);
                },
                reject: (err) => {
                    clearTimeout(timer);
                    reject(err);
                }
            });

            this.target.postMessage(message, this.origin);
        });
    }

    private async handleMessage(event: MessageEvent) {
        // 如果有指定 origin 且不符，則忽略 (安全性考量)
        if (this.origin !== "*" && event.origin !== this.origin) return;

        const data = event.data as RPCMessage;
        // 簡單檢查是否為 JSON-RPC 格式
        if (!data || typeof data !== "object" || data.jsonrpc !== "2.0") {
            return;
        }

        // 1. 處理接收到的回應 (Response) - 我們是呼叫方
        if (data.id && (data.result !== undefined || data.error !== undefined)) {
            const p = this.pending.get(data.id);
            if (p) {
                if (data.error) {
                    p.reject(new Error(data.error.message));
                } else {
                    p.resolve(data.result);
                }
                this.pending.delete(data.id);
            }
            return;
        }

        // 2. 處理接收到的請求 (Request) - 我們是接收方
        if (data.id && data.method) {
            const handler = this.handlers.get(data.method);
            if (handler) {
                try {
                    const result = await handler(data.params);
                    const response: RPCMessage = {
                        jsonrpc: "2.0",
                        id: data.id,
                        result
                    };
                    // 回傳給來源視窗
                    (event.source as Window)?.postMessage(response, event.origin);
                } catch (err: any) {
                    const response: RPCMessage = {
                        jsonrpc: "2.0",
                        id: data.id,
                        error: { code: 500, message: err.message || "Internal Error" }
                    };
                    (event.source as Window)?.postMessage(response, event.origin);
                }
            } else {
                // 找不到方法
                const response: RPCMessage = {
                    jsonrpc: "2.0",
                    id: data.id,
                    error: { code: 404, message: `Method ${data.method} not found` }
                };
                (event.source as Window)?.postMessage(response, event.origin);
            }
        }
    }
}