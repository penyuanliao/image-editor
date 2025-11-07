import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
// singleton
export const gateway: AxiosInstance = axios.create({
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
        "If-Modified-Since": "0",
        "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
});

gateway.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        console.log("Request:", config);
        return config;
    },
    (error: AxiosError) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    },
);
gateway.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log("Response:", response.data);
        return response;
    },
    (error: AxiosError) => {
        console.error("Response Error:", error);
        return Promise.reject(error);
    },
);

export const service = (() => {
    return {
        get: (url: string, config?: AxiosRequestConfig) => {
            return new Promise((resolve, reject) => {
                axios
                    .get(url, config)
                    .then((response) => resolve(response.data))
                    .catch((error) => reject(error));
            });
        },
        post: (url: string, config: AxiosRequestConfig) => {
            if (config.params && !config.data) {
                config.data = new URLSearchParams(config.params).toString();
                config.params = null;
            }

            return new Promise((resolve, reject) => {
                axios(url, {
                    method: "POST",
                    ...config,
                })
                    .then((response) => resolve(response.data))
                    .catch((error) => reject(error));
            });
        },
    };
})();
