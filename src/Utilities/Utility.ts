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
};
export const formatBytesToString = (bytes: number) => {
  if (bytes === 0) return "0.00 MB";
  const kb: number = bytes / 1024;
  const mb: number = kb / 1024;
  if (kb < 1024) return kb.toFixed(2) + "KB";
  return mb.toFixed(2) + "MB";
}
