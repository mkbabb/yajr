# YAJR: `yet another (kind of) jQuery replacement`

## Quick Example

`dollar.ts`💲 takes this:

```js
const el: HTMLElement = document.querySelector(".class");
el.innerHTML = "hi mom!";
el.style.transform = "translateX(100px)";
el.style.color = "red";
el.setAttribute("msg", "hi dad!");
```

and transforms it to this:

```js
$(".class").setattr({
    html: "hi mom!",
    styles: {
        transform: "translateX(100px)",
        color: "red"
    },
    msg: "hi dad!"
});
```

**WHAT** more lines?! Yep 🤑

## Introit

The rather verbose syntax of `document.querySelector[All]` caused a recent js project of mine to become cluttered and downright unintelligible in places. Additionally, to modifying CSS attributes was a major pain:

```js
el.style.$prop = `${value}`;
// or dynamically, as
el.style.setProperty(prop, value[prop]);
```

Inspired, I spent a few hours creating yet another jQuery replacement, `YAJR`, with its one and only library file [dollar.ts](src/dollar.ts). Why a few hours? The goal of this was to turn something like this:

```js
Array.from(document.querySelectorAll(".class")).forEach((el) => {
    el.style.height = "100px";
});
```

into this:

```js
$$(".class").css({ height: "100px" });
```

The double dollar `$$` syntax will be explained later.

While also providing the type safety and code completion the former offers through standard TypeScript. The end product does just that, but comes with a few caveats:

##### Return Type Specialization

The element type returned by `$(".class")` is of type `IDollarElement & DomElement`, where `DomElement` is a union between a few other common DOM element types. In short, if you want to specialize the type returned by a `$` call, you must `&` it with the type `IDollarElement`.

An example ensuring type safety when dealing with an `HTMLCanvas` element:

```js
const canvasEl: HTMLCanvasElement & IDollarElement = $("canvas");
...
```

To note, this isn't entirely necessary. But if you, like me, want type hinting and safety, it (_for now_) must be done.

## What You Get

-   💲 Terse query selector syntax of `$("...")` to receive one node, or `$$("...")` to receive multiple.

-   💵 `DollarElement`s contains the following function prototypes:

    -   `on`: suped-up version of `addEventListener` that handles multiple events (separated by a space).
    -   `off`: `removeEventListener` variant of the above.
    -   `setattr`: shorthand for setting multiple attributes with an `Attribute` typed object.
    -   `css`: shorthand for `$.setattr({style: {...}})`
    -   `html`: shorthand for `$.setattr({html: ...})`

-   😄 An easy way to confound and confuse people into thinking you're using jQuery.
