Variables are named containers for values. JavaScript has three ways to declare them: `var`, `let`, and `const`. Understanding the differences is essential.

## `var`, `let`, and `const`

```js
var name = "Alice";   // function-scoped, hoisted
let age = 30;         // block-scoped, not hoisted
const PI = 3.14159;   // block-scoped, cannot be reassigned
```

Always prefer `const` by default. Use `let` when you need to reassign. Avoid `var` in modern code.

### Why `var` is problematic

```js
if (true) {
  var x = 10;
}
console.log(x); // 10 — var leaks out of blocks!

if (true) {
  let y = 10;
}
console.log(y); // ReferenceError: y is not defined
```

## JavaScript Types

JavaScript has **8 types**: seven primitives and one compound type.

### Primitives

| Type | Example | Description |
|---|---|---|
| `string` | `"hello"` | Text data |
| `number` | `42`, `3.14` | 64-bit float |
| `bigint` | `9007199254740993n` | Arbitrary precision integers |
| `boolean` | `true`, `false` | Logical values |
| `undefined` | `undefined` | Variable declared but not assigned |
| `null` | `null` | Intentional absence of a value |
| `symbol` | `Symbol("id")` | Unique, immutable identifier |

### Object (non-primitive)

Everything else — arrays, functions, dates, maps — is an **object**. Objects are collections of key-value pairs.

```js
const person = {
  name: "Alice",
  age: 30,
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};
```

## Dynamic Typing

JavaScript is **dynamically typed** — variables do not have fixed types. The same variable can hold any type at any time.

```js
let value = 42;       // number
value = "hello";      // now a string
value = true;         // now a boolean
```

This flexibility is powerful but requires discipline. TypeScript adds static types on top of JavaScript for safety.

## Type Checking with `typeof`

```js
typeof "hello"     // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object" ← famous bug, null is NOT an object
typeof {}          // "object"
typeof []          // "object" ← arrays are objects!
typeof function(){} // "function"
```

Note the famous `typeof null === "object"` quirk — this is a historical bug that cannot be fixed without breaking the web.

## Type Coercion

JavaScript automatically converts types in certain contexts:

```js
"5" + 3       // "53" — number coerced to string for +
"5" - 3       // 2   — string coerced to number for -
true + 1      // 2   — boolean coerced to number
"" == false   // true — loose equality with coercion
"" === false  // false — strict equality, no coercion
```

Always use `===` (strict equality) instead of `==` to avoid unexpected coercion.

@@diagram:type-coercion-flow
