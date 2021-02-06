function once(func: (...args: any) => any) {
    let result: any;
    return function (...args: any) {
        if (func) {
            result = func.apply(this, ...args);
            func = null;
        }
        return result;
    };
}

export { once };
