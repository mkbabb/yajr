function once(func) {
    let result;
    return function (...args) {
        if (func) {
            result = func.apply(this, ...args);
            func = null;
        }
        return result;
    };
}
export { once };
