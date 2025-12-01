// Convert radians to degrees and round to nearest integer
export const degrees = (rotation: number) => {
    return Math.round((rotation * 180) / Math.PI);
}
// Convert degrees to radians
export const radians = (degrees: number) => {
    return (degrees * Math.PI) / 180;
}

export const calculateConstrainedSize = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number, scale: number, originalWidth: number, originalHeight: number } => {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;

    // 取較小的縮放比例，以確保寬和高都不會超過限制
    const scale = Math.floor((Math.min(widthRatio, heightRatio) * 10000)) / 10000;

    // 如果原始尺寸已經在限制內，則不需要縮放，直接回傳原始尺寸
    if (scale >= 1) {
        return { width: originalWidth, height: originalHeight, scale: 1, originalWidth, originalHeight };
    }

    // 使用較小的比例計算新的寬高
    const newWidth = Math.round(originalWidth * scale);
    const newHeight = Math.round(originalHeight * scale);

    return { width: newWidth, height: newHeight, scale, originalWidth, originalHeight };
}