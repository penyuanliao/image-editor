export const storageManager = (() => {

    const get = (key: string) => {
        return JSON.parse(localStorage.getItem(key) || '{}');
    };

    const set = (key:string, value: string | object) => {
        if (typeof value === 'string') {
            localStorage.setItem(key, value);
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
    const remove = (key: string) => localStorage.removeItem(key);

    const clear = () => localStorage.clear();

    return {
        get,
        set,
        remove,
        clear
    };
})();