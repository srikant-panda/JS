JavaScript is the language of the web — but it is far more than a scripting tool bolted onto HTML. It is a dynamic, interpreted programming language that runs in every browser on earth, and increasingly on servers via Node.js.

## A Brief History

JavaScript was created in 10 days in 1995 by Brendan Eich at Netscape. Despite the name, it has nothing to do with Java — the name was a marketing decision to ride the popularity of Java at the time. It was originally called Mocha, then LiveScript, before becoming JavaScript.

Over time, it became standardized through ECMAScript (ES), maintained by TC39. Modern JavaScript follows ES2015 (ES6) and beyond, which introduced classes, modules, arrow functions, and much more.

## How JavaScript Runs

When you load a webpage, the browser:

1. Parses the HTML
2. Encounters a `<script>` tag
3. Sends the JavaScript to the **JavaScript engine** (V8 in Chrome, SpiderMonkey in Firefox)
4. The engine compiles and executes the code

```js
// Your first JavaScript
console.log("Hello, world!");
```

The engine converts your human-readable code into machine code through a process involving parsing, abstract syntax trees (AST), bytecode generation, and just-in-time (JIT) compilation.

## JavaScript vs Other Languages

| Feature | JavaScript | Python | Java |
|---|---|---|---|
| Typing | Dynamic | Dynamic | Static |
| Compiled | JIT | Interpreted | AOT |
| Runs in browser | Yes | No | No |
| Async model | Event loop | Threads | Threads |

## The ECMAScript Standard

JavaScript is governed by the ECMAScript specification. Each year, TC39 — the standards committee — releases a new version. Key milestones:

- **ES5** (2009) — strict mode, JSON support
- **ES6 / ES2015** — classes, arrow functions, template literals, modules, `let`/`const`
- **ES2017** — `async`/`await`
- **ES2020** — optional chaining `?.`, nullish coalescing `??`
- **ES2022** — top-level `await`, `Array.at()`, class fields

## What Makes JavaScript Unique

Three things set JavaScript apart:

1. **It is single-threaded** — code runs on one thread, using an event loop for concurrency
2. **It is prototype-based** — objects inherit from other objects, not from classes (though class syntax exists as sugar)
3. **It runs everywhere** — browser, server, mobile, desktop, edge

---

Understanding these foundations will make everything else in this course click. In the next chapter, we explore the building blocks: variables, types, and values.

@@diagram:js-engine-flow
