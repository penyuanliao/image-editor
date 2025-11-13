// Convert radians to degrees and round to nearest integer
export const degrees = (rotation: number) => {
    return Math.round((rotation * 180) / Math.PI);
}
// Convert degrees to radians
export const radians = (degrees: number) => {
    return (degrees * Math.PI) / 180;
}