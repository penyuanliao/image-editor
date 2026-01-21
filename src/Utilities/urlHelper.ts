let urlParams: URLSearchParams | null = null;
let lastSearch: string = "";

/**
 * 取得 URL 查詢參數
 * @param name 參數名稱
 */
export const getUrlParam = (name: string): string => {
  let search = window.location.search || "";
  // 因為使用router hash所
  if (search === "" && window.location.hash) {
    search = window.location.hash.split("?")[1] || "";
  }
  if (!urlParams || search !== lastSearch) {
    lastSearch = search;
    urlParams = new URLSearchParams(search);
  }
  return urlParams.get(name) || "";
};