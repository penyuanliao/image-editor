import {API_ENDPOINTS} from "@/api/endpoints.ts";

export interface CommentResponseResult {
    status: boolean;
    error?: string;
}
export const apiComment = async (
    content: string,
    options?: { authorization?: string | null }
): Promise<CommentResponseResult> => {
    const response = await fetch(API_ENDPOINTS.COMMENT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ options?.authorization }`
        },
        body: JSON.stringify({ content })
    });
    if (!response.ok) {
        throw new Error("Failed to fetch comment.");
    }
    return response.json();
};