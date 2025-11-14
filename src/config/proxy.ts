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
    '/api': {
        target: `https://news3-test.bbinmkt.com/`,
        secure: false,
        changeOrigin: true,
        headers: {}
    }
};
export default proxyConfig;