interface ProxyOptions {
  target: string;
  secure: boolean;
  changeOrigin: boolean;
  headers: Record<string, string>;
}

interface ProxyConfig {
  [key: string]: ProxyOptions;
}

export const proxyConfig: ProxyConfig = {
  "/api": {
    target: `https://news3-test.bbinmkt.com/`,
    secure: false,
    changeOrigin: true,
    headers: {}
  },
  "/offer": {
    target: 'https://cdn.vir999.net',
    secure: false,
    changeOrigin: true,
    headers: {
      Referer: 'https://admin.vir777.net/' // 這裡才能成功偽造 Referer
    }
  }
};
export default proxyConfig;
