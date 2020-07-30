# YAJR: `yet another jQuery replacement`

## Quick Example

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
$(".class").setattr({
    html: "hi mom!",
    styles: {
        transform: "translateX(100px)",
        color: "red"
    },
    msg: "hi dad!"
});
```

**WHAT** more lines?! Yep. Oh, and notice the omission of a type hint for the latter. kool 🧊.

## Introit

The rather verbose syntax of

    document.querySelector[All]

caused a recent project of mine to become cluttered and downright unintelligible in places. Additionally, the common operation of modifying CSS attributes was a major pain:

```ts
el.style.$prop = `${value}`;
// or dynamically, as
el.style.setProperty(prop, value[prop]);
```

Inspired, I spent a few hours creating yet another jQuery replacement, `YAJR`, with its one and only library file [dollar.ts](src/dollar.ts).The goal of this was to turn something like this:

```ts
Array.from(document.querySelectorAll(".class")).forEach((el) => {
    el.style.height = "100px";
});
```

into this:

```ts
$$(".class").css({ height: "100px" });
```

_The double dollar `$$` syntax will be explained later._

While also providing the type safety and code completion the former offers through standard TypeScript. The end product does just that, but comes with a few caveats:

##### Return Type Specialization

The element type returned by `$(".class")` is of type `IDollarElement & Element`. In short, if you want to specialize the type returned by a `$` call, you must `&` it with the type `IDollarElement`. An example ensuring type safety when dealing with an `HTMLCanvas` element:

```ts
const canvasEl: HTMLCanvasElement & IDollarElement = $("canvas");
...
```

To note, this isn't entirely necessary. But if you, like me, want type hinting and safety, it must be done.

## What You Get

-   💲 Terse query selector syntax of `$("...")` to receive one node, or `$$("...")` to receive multiple.

-   💵 `DollarElement`s contains the following function prototypes:

    -   `on`: suped-up version of `addEventListener` that handles multiple events (separated by a space).
    -   `off`: `removeEventListener` variant of the above.
    -   `setattr`: shorthand for setting multiple attributes with an `Attribute` typed object. Smarter in the sense that it can detect specialized `Element` types and set their attributes accordingly.
    -   `css`: shorthand for `$.setattr({style: {...}})`
    -   `html`: shorthand for `$.setattr({html: ...})`

-   😄 An easy way to confound and confuse people into thinking you're using jQuery. But of course you're not, it's `current_year`! (satire 🙄)

## Examples

### Set the color of an element with the class of `money`:

```ts
$(".money").css({ color: "red" });
```

### Set the height of all elements with the class of `dollar` to `50%` and add event listeners:

```ts
$$(".dollar").css({ height: "50%" }).on("click mousedown", (ev) => {...});
```

### Add an event listener to the window object for mobile and desktop mouse events:

_why this is normally so complicated is beyond me_

```ts
$(window).on("click touchstart", (ev) => {...})
```

### Using the `setattr` specialization functionality to set the height of an `HTMLCanvasElement`.

First we create a specialized version of `$`:

```ts
const canvasSpec = {
    height: (context, value) => {
        // type checking here is not 100% necessary, but this is TypeScript...
        if (context instanceof HTMLCanvasElement && typeof value === "string") {
            context.height = parseFloat(value);
        }
    }
};

const $canvas = (query, context?) => {
    return $<HTMLCanvasElement>(query, context, canvasSpec);
};
```

Notice the type hint we gave in the return statement. The output object will now inherit all types from `HTMLCanvasElement`. neat.

We can then call it like so:

```ts
$canvas("canvas").setattr({ height: "100" });
```

And the correct attribute will be set!
