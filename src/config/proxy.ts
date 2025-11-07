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
    '/api/*': {
        target: `http://localhost:3000`,
        secure: false,
        changeOrigin: true,
        headers: {}
    }
};
export default proxyConfig;