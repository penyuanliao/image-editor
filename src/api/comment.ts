import {API_ENDPOINTS} from "@/api/endpoints.ts";

export interface CommentResponseResult {
    status: boolean;
    message?: string;
    data: any;
    error?: string;
}
export const apiComment = async (
    message: string,
    options?: { authorization?: string | null }
): Promise<CommentResponseResult> => {
    const response = await fetch(API_ENDPOINTS.COMMENT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ options?.authorization }`
        },
        body: JSON.stringify({ message })
    });
    if (!response.ok) {
        throw new Error("Failed to fetch comment.");
    }
    return response.json();
};