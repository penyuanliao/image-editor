export const randomDelay = async (min: number, max: number) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, Math.random() * (max - min) + min);
    })
}