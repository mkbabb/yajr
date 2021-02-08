const on = function (names, func, context) {
    names.split(" ").forEach((event) => {
        context.addEventListener(event, func);
    });
    return context;
};
const off = function (names, func, context) {
    names.split(" ").forEach((event) => {
        context.removeEventListener(event, func);
    });
    return context;
};
/**
 * Sets the attributes of a context element based on the `attrs` Attribute object.
 *
 * Important to note is the attribute key specialization.
 * HTML Elements have a hard-coded set of reserved keys, such `html`: if the input key is `html`
 * and the input context is of type HTMLElement, the keyword is specialized, and the context
 * element's `innerHTML` attribute is modified.
 *
 * @param attrs input attributes.
 * @param context context element.
 * @param func function to execute at each [key, value] call.
 */
const setAttributes = function (attrs, context) {
    Object.entries(attrs).forEach(([key, value]) => {
        if (context instanceof HTMLElement) {
            if (key === "html") {
                context.innerHTML = JSON.stringify(value);
            }
            else if (key === "styles" && typeof value === "object") {
                Object.entries(value).forEach(([styleKey, styleValue]) => {
                    context.style.setProperty(styleKey, styleValue);
                });
            }
        }
        if (context instanceof Element) {
            if (value == null) {
                context.removeAttribute(key);
            }
            else if (typeof value === "string") {
                context.setAttribute(key, value);
            }
        }
    });
    return context;
};
const eventTargetFuncs = {
    on: function (name, func) {
        on(name, func, this);
        return this;
    },
    off: function (name, func) {
        off(name, func, this);
        return this;
    }
};
const elementFuncs = {
    setattr: function (attrs) {
        setAttributes(attrs, this);
        return this;
    }
};
const htmlElementFuncs = {
    css: function (styles) {
        setAttributes({
            styles
        }, this);
        return this;
    },
    html: function (s) {
        setAttributes({
            html: s
        }, this);
        return this;
    }
};
const dollarFuncs = {
    ...eventTargetFuncs,
    ...elementFuncs,
    ...htmlElementFuncs
};
const foldFunctions = function (funcs) {
    const folded = {};
    Object.keys(funcs).forEach((key) => {
        folded[key] = function (...args) {
            return this.forEach((el) => {
                el[key](...args);
            });
        };
    });
    return folded;
};
/**
 * The dollar 💲in dollar.ts. Wrapper around .querySelector in the case of an input
 * query string, and a simple pipe in the case of anything else (usually of type Element).
 *
 * The resultant object is an intersection of T & DollarElement. So if the input object is
 * of type HTMLElement, that type is preserved and &'d with DollarElement.
 *
 * @param query input query string or element.
 * @param context context element or document.
 */
function $(query, context = document) {
    const node = typeof query === "string" ? context.querySelector(query) : query;
    if (node == null) {
        return undefined;
    }
    else {
        return Object.assign(node, dollarFuncs);
    }
}
/**
 * Like `$`, `$$` is essentially a wrapper for .querySelectorAll, which notoriously returns
 * a NodeList object.
 *
 * In the case of an Array or NodeListOf<Element>, we simply pipe the nodes to
 * Array.from and preserve there attributes. In the case of a string, we call
 * `context.querySelectorAll(query)` and do the same.
 *
 * After completion, we add the set of DollarElement prototype functions to the resultant object,
 * but with the special functionality of looping over each element, and then executing
 * the function call (hence dollarFoldedFunctions; they're folded over the array).
 *
 * @param query query element[s] or a query string.
 * @param context context element or document.
 */
function $$(query, context = document) {
    const nodes = query instanceof NodeList || query instanceof Array
        ? query
        : typeof query === "string"
            ? context.querySelectorAll(query)
            : [query];
    if (nodes == null) {
        return undefined;
    }
    else {
        const arr = Array.from(nodes).map((el) => Object.assign(el, dollarFuncs));
        return Object.assign(arr, foldFunctions(dollarFuncs));
    }
}
export { $, $$ };
