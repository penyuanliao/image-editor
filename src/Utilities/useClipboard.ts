export const clipBoardPaste = async ():Promise<string | HTMLImageElement | null> => {
    let content: ClipboardItems = await navigator.clipboard.read();

    for (let i = 0; i < content.length; i++) {
        let item: ClipboardItem = content[i] as ClipboardItem;
        if (item.types.includes('text/plain')) {
            let blob = await item.getType("text/plain");
            return await blob.text();
        } else if (item.types.includes('image/png')) {
            const pngImage = new Image();
            pngImage.alt = "PNG image from clipboard";
            const blob = await item.getType("image/png");
            pngImage.src = URL.createObjectURL(blob);
            return pngImage;
        }
    }
    return null;
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