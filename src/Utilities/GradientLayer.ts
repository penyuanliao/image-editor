
export interface IPoint {
    x: number;
    y: number;
}
export interface IGradientLayer {
    startPoint: IPoint;
    endPoint: IPoint;
}

export const gradientStartAndEndPoints = (angle: number, width: number, height: number): IGradientLayer => {
    // 三角函數角度轉換弧度
    // x = Math.cos(弧度) * 半徑, y = Math.sin(弧度) * 半徑
    const mathAngleRad = ((angle || 90) - 90) * Math.PI / 180;
    const halfW = width / 2;
    const halfH = height / 2;
    const c = Math.cos(mathAngleRad); // 計算 cos 值
    const s = Math.sin(mathAngleRad); // 計算 sin 值
    const len = Math.abs(halfW * c) + Math.abs(halfH * s); // 漸層最大距離
    const x0 = -len * c;
    const y0 = -len * s;
    const x1 = len * c;
    const y1 = len * s;
    return {
        startPoint: {
            x: x0,
            y: y0
        },
        endPoint: {
            x: x1,
            y: y1
        }
    }
}
// 建構Konva的線性漸層
export const createGradientLiner = (angle: number, width: number, height: number, colors: string[]) => {
    const { startPoint, endPoint } = gradientStartAndEndPoints(angle, width, height);
    const colorStops: any = [];
    for (let i = 0; i < colors.length; i++) {
        colorStops.push(i);
        colorStops.push(colors[i]);
    }
    return {
        fillPriority: 'linear-gradient',
        fillLinearGradientStartPoint: startPoint,
        fillLinearGradientEndPoint: endPoint,
        fillLinearGradientColorStops: colorStops
    }
}