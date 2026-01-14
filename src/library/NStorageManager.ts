export const NStorageManager = (() => {
  // 取得快取資料
  const get = (key: string) => {
    return JSON.parse(localStorage.getItem(key) || "{}");
  };
  // 設定快取資料
  const set = (key: string, value: string | object) => {
    if (typeof value === "string") {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
  // 移除快取資料
  const remove = (key: string) => localStorage.removeItem(key);
  // 清除
  const clear = () => localStorage.clear();

  return {
    get,
    set,
    remove,
    clear
  };
})();
