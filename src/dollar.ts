type DollarElement = IDollarElement & Element;

interface IDollarElement extends Element {
    on: (name: string, func: (event: Event) => void) => DollarElement;
    off: (name: string, func: (event: Event) => void) => DollarElement;
    setattr: (attrs: object) => DollarElement;
    css: (attrs: object) => DollarElement;
    html: (attrs: object) => DollarElement;
}

const on = function (
    names: string,
    func: (event: Event) => void,
    context: EventTarget
): EventTarget {
    names.split(" ").forEach((event) => {
        context.addEventListener(event, func);
    });
    return this;
};

const off = function (
    names: string,
    func: (event: Event) => void,
    context: EventTarget
): EventTarget {
    names.split(" ").forEach((event) => {
        context.removeEventListener(event, func);
    });
    return this;
};

const htmlElementSpecializations = function (
    key: string,
    value: any,
    context: Element
) {
    if (context instanceof HTMLElement) {
        if ((key === "styles" || key === "style") && typeof value === "object") {
            for (const prop in value) {
                context.style.setProperty(prop, value[prop]);
            }
        } else if (key === "html") {
            context.innerHTML = value;
        }
        return true;
    } else {
        return false;
    }
};

const setAttributes = function (attrs: object, context: Element) {
    for (const [key, value] of Object.entries(attrs)) {
        if (value === null) {
            context.removeAttribute(key);
        } else {
            context.setAttribute(key, value);
        }
        htmlElementSpecializations(key, value, context);
    }
    return this;
};

const dollarFunctions = {
    on: function (name: string, func: (event: Event) => void) {
        return on(name, func, this);
    },
    off: function (name: string, func: (event: Event) => void) {
        return off(name, func, this);
    },
    setattr: function (attrs: Object) {
        return setAttributes(attrs, this);
    },
    css: function (attrs: Object) {
        return setAttributes(
            {
                styles: attrs
            },
            this
        );
    },
    html: function (s: string) {
        return setAttributes(
            {
                html: s
            },
            this
        );
    }
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

const dollarFoldedFunctions = foldFunctions(dollarFunctions);

function $$(
    query: NodeListOf<Element> | Array<Element> | string,
    context: Document | Element = document
) {
    const nodes =
        query instanceof NodeList || query instanceof Array
            ? query
            : typeof query === "string"
            ? context.querySelectorAll(query)
            : [query];

    if (nodes == null) {
        return undefined;
    } else {
        const arr = Array.from(nodes).map((el) => Object.assign(el, dollarFunctions));
        return Object.assign(arr, dollarFoldedFunctions);
    }
}

function $(query: string, context?: Document | Element): IDollarElement & Element;
function $<T>(query: T, context?: Document | Element): IDollarElement & T;

function $<T>(query: T, context = document) {
    const node = typeof query === "string" ? context.querySelector(query) : query;

    if (node == null) {
        return undefined;
    } else {
        return Object.assign(node, dollarFunctions);
    }
}

export { $, $$ };

export { IDollarElement };
