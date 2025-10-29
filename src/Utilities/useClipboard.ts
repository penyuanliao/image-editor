export interface ClipboardList {
    type: string,
    value: string | HTMLImageElement | null
}

export const clipboardPaste = async ():Promise<{
    texts: string[],
    images: HTMLImageElement[]
}> => {
    const content: ClipboardItems = await navigator.clipboard.read();
    const texts: string[] = [];
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < content.length; i++) {
        let item: ClipboardItem = content[i] as ClipboardItem;
        if (item.types.includes('text/plain')) {
            let blob = await item.getType("text/plain");
            texts.push( await blob.text());
        } else if (item.types.includes('image/png')) {
            const blob = await item.getType("image/png");
            const img = await loadImage(blob);
            if (img) images.push(img);
        }
    }
    return { texts, images };
}
export const pasteImage = async ():Promise<HTMLImageElement | null> => {
    let content: ClipboardItems = await navigator.clipboard.read();
    for (let i = 0; i < content.length; i++) {
        let item: ClipboardItem = content[i] as ClipboardItem;
        if (item.types.includes('image/png')) {
            const blob = await item.getType("image/png");
            return await loadImage(blob);
        }
    }
    return null;
}
export const loadImage = async (blob: Blob):Promise<HTMLImageElement | null> => {
    return new Promise(async (resolve) => {
        const pngImage = new Image();
        pngImage.alt = "PNG image from clipboard";
        pngImage.onload = () => {
            resolve(pngImage);
        };
        pngImage.src = URL.createObjectURL(blob);
    })
}
export const validationPermissions = async () => {
    try {
        // 檢查剪貼簿讀取權限
        const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
        if (permission.state === 'denied') {
            console.error('剪貼簿讀取權限已被拒絕。');
            alert('您已拒絕剪貼簿讀取權限，請至瀏覽器設定中重新開啟。');
            return false;
        }
        return true;

    } catch (e) {
        console.error('讀取剪貼簿時發生錯誤:', e);
        return false;
    }
};
