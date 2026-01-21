export const randomDelay = async (min: number, max: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(
      () => {
        resolve();
      },
      Math.random() * (max - min) + min
    );
  });
};
export const dealy = async (sec: number = 1) => {
  return new Promise<void>((resolve) => {
    setTimeout(
      () => {
        resolve();
      },
      1000 * sec
    );
  });
}
