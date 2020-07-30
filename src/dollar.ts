type NestedAttribute = { [s: string]: string } | string;
interface Attributes {
    [s: string]: NestedAttribute;
    style?: { [s: string]: string };
    html?: string;
}

interface AttributeSpec<T> {
    contextType: (context: any) => boolean;
    attrs: Map<RegExp, (key: string, value: NestedAttribute, context: T) => void>;
}

interface IDollarElement extends Element {
    on: (name: string, func: (event: Event) => void) => IDollarElement;
    off: (name: string, func: (event: Event) => void) => IDollarElement;
    setattr: (attrs: Attributes) => IDollarElement;
    css: (attrs: NestedAttribute) => IDollarElement;
    html: (attrs: NestedAttribute) => IDollarElement;
}

const on = function (
    names: string,
    func: (event: Event) => void,
    context: EventTarget
) {
    names.split(" ").forEach((event) => {
        context.addEventListener(event, func);
    });
    return context;
};

const off = function (
    names: string,
    func: (event: Event) => void,
    context: EventTarget
) {
    names.split(" ").forEach((event) => {
        context.removeEventListener(event, func);
    });
    return context;
};

const htmlElementSpec: AttributeSpec<HTMLElement> = {
    contextType: (context) => context instanceof HTMLElement,
    attrs: new Map([
        [
            RegExp("html"),
            (key, value, context) => {
                if (typeof value === "string") {
                    context.innerHTML = value;
                }
            }
        ],
        [
            RegExp("styles?"),
            (key, value, context) => {
                if (typeof value === "object") {
                    Object.entries(value).forEach(([subkey, subvalue]) => {
                        context.style.setProperty(subkey, subvalue);
                    });
                }
            }
        ]
    ])
};

const elementSpec: AttributeSpec<Element> = {
    contextType: (context) => context instanceof Element,
    attrs: new Map([
        [
            RegExp(".*"),
            (key, value, context) => {
                if (value == null) {
                    context.removeAttribute(key);
                } else if (typeof value === "string") {
                    context.setAttribute(key, value);
                }
            }
        ]
    ])
};

/**
 * Sets the attributes of a context element based on the `attrs` Attribute object.
 *
 * Important to note is the func callback, which is used from attribute key specialization.
 * HTML Elements have a hard-coded set of reserved keys, such `html`: if the input key is `html`
 * and the input context is of type HTMLElement, the keyword is specialized, and the context
 * element's `innerHTML` attribute is modified.
 *
 * @param attrs input attributes.
 * @param context context Element.
 * @param func function to execute at each [key, value] call.
 */
const setAttributes = function <T>(
    attrs: Attributes,
    context,
    specs?: Array<AttributeSpec<T>>
) {
    Object.entries(attrs).forEach(([key, value]) => {
        specs.forEach((spec) => {
            const isOfType = spec.contextType(context);

            if (isOfType) {
                spec.attrs.forEach((specFunc, specKey) => {
                    if (specKey.test(key)) {
                        specFunc(key, value, context);
                    }
                });
            }
        });
    });

    return context;
};

const createDollarFunctions = function <T>(spec?: AttributeSpec<T | Element>) {
    const setattr = function (attrs: Attributes, context) {
        return setAttributes(attrs, context, [spec, htmlElementSpec, elementSpec]);
    };

    return {
        on: function (name: string, func: (event: Event) => void) {
            return on(name, func, this);
        },
        off: function (name: string, func: (event: Event) => void) {
            return off(name, func, this);
        },

        setattr: function (attrs: Attributes) {
            return setattr(attrs, this);
        },

        css: function (styles: NestedAttribute) {
            return setattr(
                {
                    styles
                },
                this
            );
        },

        html: function (s: string) {
            return setattr(
                {
                    html: s
                },
                this
            );
        }
    };
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
 * Like `$`, `$$` is essentially a wrapper for .querySelectorAll, which notoriously returns
 * a NodeList object.
 *
 * In the case of an Array or NodeListOf<Element>, we simply pipe the nodes to
 * Array.from and preserve there attributes. In the case of a string, we call
 * `context.querySelectorAll(query)` and do the same.
 *
 * After completion, we add the set of IDollarElement prototype functions to the resultant object,
 * but with the special functionality of looping over each element, and then executing
 * the function call (hence dollarFoldedFunctions; they're folded over the array).
 *
 * @param query query element[s] or a query string.
 * @param context context element or document.
 */
// function $$<T>(
//     query: NodeListOf<Element> | Array<T | Element> | string,
//     context: Document | Element = document,
//     spec?: AttributeSpec
// ) {
//     const nodes =
//         query instanceof NodeList || query instanceof Array
//             ? query
//             : typeof query === "string"
//                 ? context.querySelectorAll(query)
//                 : [query];

//     if (nodes == null) {
//         return undefined;
//     } else {
//         const arr = Array.from(nodes).map((el) =>
//             Object.assign(el, createDollarFunctions(spec))
//         );
//         return Object.assign(arr, foldFunctions(createDollarFunctions(spec)));
//     }
// }

// Function decelerations to aid in proper type hinting.
// function $<T = string>(
//     query: string,
//     context?: Document | Element,
//     spec?: AttributeSpec
// ): Element;
// function $<T>(query: T, context?: Document | Element, spec?: AttributeSpec);

/**
 * The dollar 💲in dollar.ts. Wrapper around .querySelector in the case of an input
 * query string, and a simple pipe in the case of anything else (usually of type Element).
 *
 * The resultant object is an intersection of T & IDollarElement. So if the input object is
 * of type HTMLElement, that type is preserved and &'d with IDollarElement.
 *
 * @param query input query string or element.
 * @param context context element or document.
 */
function $<T>(query: T, context = document, spec?: AttributeSpec): T & IDollarElement {
    const node = typeof query === "string" ? context.querySelector(query) : query;

    if (node == null) {
        return undefined;
    } else {
        return Object.assign(node, createDollarFunctions(spec));
    }
}

export { $ };
