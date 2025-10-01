import { ElMessage } from "element-plus";

export const ErrorMessage = (message: string) => {
    ElMessage({
        message,
        type: 'error',
        plain: true,
    });
}