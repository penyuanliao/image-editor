let urlParams: URLSearchParams | null = null;
let lastSearch: string = "";

/**
 * 取得 URL 查詢參數
 * @param name 參數名稱
 */
export const getUrlParam = (name: string): string => {
  const search = window.location.search;
  if (!urlParams || search !== lastSearch) {
    lastSearch = search;
    urlParams = new URLSearchParams(search);
  }
  return urlParams.get(name) || "";
};