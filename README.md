# YAJR: `yet another jQuery replacement`

`dollar.ts`💲 takes this:

```ts
const el: HTMLElement = document.querySelector(".class");
el.innerHTML = "hi mom!";
el.style.transform = "translateX(100px)";
el.style.color = "red";
el.setAttribute("msg", "hi dad!");
```

and transforms it to this:

```ts
$<HTMLElement>(".class").setattr({
    html: "hi mom!",
    styles: {
        transform: "translateX(100px)",
        color: "red"
    },
    msg: "hi dad!"
});
```

**WHAT** more lines?! Yep.

## Introit

The rather verbose syntax of

    document.querySelector[All]

caused a recent project to become cluttered and downright unintelligible in places. Additionally, the common operation of modifying CSS attributes was a major pain:

```ts
el.style.$prop = `${$value}`;
// or dynamically, as
el.style.setProperty($prop, $value);
// and this is just for one attribute!
```

Inspired, I spent a few hours creating yet another jQuery replacement... with its one and only library file [dollar.ts](src/dollar.ts). The goal of this was to turn something like this:

```ts
Array.from(document.querySelectorAll(".class")).forEach((el) => {
    el.style.height = "100px";
});
```

into this:

```ts
$$<HTMLElement>(".class").css({ height: "100px" });
```

_Where the double dollar `$$` syntax selects all nodes of that query._

While also providing the type safety and code completion the former offers through standard TypeScript. The end product does just that, but comes with a few caveats:

#### Input Values of `$[$]`

The input object to a call of `$` must be, at the minimum, derived from the `EventTarget` base class.

To enhance the typing functionality, you can manually specify the input node type like so (an example with an `HTMLCanvas` element):

```ts
const canvasEl = $<HTMLCanvasElement>("canvas");
...
```

Which will net you all of the standard `HTMLCanvasElement` information + a few specializations `DollarHTMLElement` provides (explained, too, below).

## What You Get

-   💲 Terse query selector syntax of `$("...")` to select one node, or `$$("...")` to select multiple.

-   💵 `DollarHTMLElement`s contains the following function prototypes:

    -   `on`: suped-up version of `addEventListener` that handles multiple events (separated by a space).
    -   `off`: `removeEventListener` variant of the above.
    -   `setattr`: shorthand for setting multiple attributes with an `Attribute` typed object. Smarter in the sense that it can detect specialized `Element` types and set their attributes accordingly.
    -   `css`: shorthand for `$.setattr({style: {...}})`; sets the `style` attribute of an `HTMLElement`.
    -   `html`: shorthand for `$.setattr({html: ...})`; sets the `innerHTML` attribute of an `HTMLElement`.

-   🐭 Code size: the entire library is ~200 lines, with the majority of that being dedicated to the typing functionality. Yes, there are other libraries that are far more generalized and robust, but that's not our goal here.

-   😄 An easy way to confound and confuse people into thinking you're using jQuery. But of course you're not, it's `$current_year`! (satire 🙄)

## Input Type Specialization

If the input type `T` is of a small subset of types, we define a few specialization functions; they are as follows:

-   if `T` is a child of `EventTarget`, we provide the following methods:
    -   `on`
    -   `off`
-   if `T` is a child of `Element`, we provide the following methods:
    -   `setattr`
-   if `T` is a child of `HTMLElement`, we provide the following methods:
    -   `css`
    -   a `setattr` which further specializes the keywords:
        -   `html`
        -   `styles`

Notice the usage of the `if` and not `else if` qualifier: for example, as `HTMLElement` is a child of all of the above, it, too, gains access to all of the above functionality.

## Examples

### Set the color of an element with the class of `money`:

```ts
$<HTMLElement>(".money").css({ color: "red" });
```

### Set the height of all elements with the class of `dollar` to `50%` and add event listeners:

```ts
$$<HTMLElement>(".dollar").css({ height: "50%" }).on("click mousedown", (ev) => {...});
```

### Add an event listener to the window object for mobile and desktop mouse events:

_why this is normally so complicated is beyond me_

```ts
$(window).on("click touchstart", (ev) => {...})
```
