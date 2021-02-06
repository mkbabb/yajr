import { $, $$ } from "../src/dollar.js";

const q = $<HTMLElement>("test").css({ height: "100px" });

const p = $(document.createElement("div"));
p.setattr({ hi: "99" });
