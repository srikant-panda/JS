export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Diagram = {
  id: string;
  type: "flowchart" | "scope" | "callstack" | "memory" | "event-loop" | "prototype-chain";
  title: string;
  data: string;
};

export type Chapter = {
  slug: string;
  title: string;
  description: string;
  order: number;
  category: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  content: string;
  diagrams: Diagram[];
};

const CHAPTERS: Chapter[] = [
  {
    slug: "what-is-javascript",
    title: "What is JavaScript?",
    description:
      "A tour of JavaScript's history, execution model, and what makes it uniquely powerful among programming languages.",
    order: 1,
    category: "Foundations",
    difficulty: "beginner",
    estimatedMinutes: 8,
    diagrams: [
      {
        id: "js-engine-flow",
        type: "flowchart",
        title: "How the JavaScript Engine Works",
        data: `flowchart TD
  A[Source Code] --> B[Parser]
  B --> C[Abstract Syntax Tree]
  C --> D[Bytecode Generator]
  D --> E[Interpreter]
  E -->|hot code| F[JIT Compiler]
  F --> G[Optimized Machine Code]
  E --> H[Output / Side Effects]
  G --> H`,
      },
    ],
    content: `JavaScript is the language of the web — but it is far more than a scripting tool bolted onto HTML. It is a dynamic, interpreted programming language that runs in every browser on earth, and increasingly on servers via Node.js.

## A Brief History

JavaScript was created in 10 days in 1995 by Brendan Eich at Netscape. Despite the name, it has nothing to do with Java — the name was a marketing decision to ride the popularity of Java at the time. It was originally called Mocha, then LiveScript, before becoming JavaScript.

Over time, it became standardized through ECMAScript (ES), maintained by TC39. Modern JavaScript follows ES2015 (ES6) and beyond, which introduced classes, modules, arrow functions, and much more.

## How JavaScript Runs

When you load a webpage, the browser:

1. Parses the HTML
2. Encounters a \`<script>\` tag
3. Sends the JavaScript to the **JavaScript engine** (V8 in Chrome, SpiderMonkey in Firefox)
4. The engine compiles and executes the code

\`\`\`js
// Your first JavaScript
console.log("Hello, world!");
\`\`\`

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
- **ES6 / ES2015** — classes, arrow functions, template literals, modules, \`let\`/\`const\`
- **ES2017** — \`async\`/\`await\`
- **ES2020** — optional chaining \`?.\`, nullish coalescing \`??\`
- **ES2022** — top-level \`await\`, \`Array.at()\`, class fields

## What Makes JavaScript Unique

Three things set JavaScript apart:

1. **It is single-threaded** — code runs on one thread, using an event loop for concurrency
2. **It is prototype-based** — objects inherit from other objects, not from classes (though class syntax exists as sugar)
3. **It runs everywhere** — browser, server, mobile, desktop, edge

---

Understanding these foundations will make everything else in this course click. In the next chapter, we explore the building blocks: variables, types, and values.

@@diagram:js-engine-flow`,
  },
  {
    slug: "variables-and-types",
    title: "Variables and Types",
    description:
      "Learn var, let, and const; explore JavaScript's eight types; understand dynamic typing and type coercion.",
    order: 2,
    category: "Foundations",
    difficulty: "beginner",
    estimatedMinutes: 10,
    diagrams: [
      {
        id: "type-coercion-flow",
        type: "flowchart",
        title: "Type Coercion Rules",
        data: `flowchart LR
  A[Value A] --> C{Operator}
  B[Value B] --> C
  C -->|+| D{Is either a string?}
  D -->|Yes| E[String concatenation]
  D -->|No| F[Numeric addition]
  C -->|-, *, /| G[Convert both to numbers]
  G --> H[Numeric operation]`,
      },
    ],
    content: `Variables are named containers for values. JavaScript has three ways to declare them: \`var\`, \`let\`, and \`const\`. Understanding the differences is essential.

## \`var\`, \`let\`, and \`const\`

\`\`\`js
var name = "Alice";   // function-scoped, hoisted
let age = 30;         // block-scoped, not hoisted
const PI = 3.14159;   // block-scoped, cannot be reassigned
\`\`\`

Always prefer \`const\` by default. Use \`let\` when you need to reassign. Avoid \`var\` in modern code.

### Why \`var\` is problematic

\`\`\`js
if (true) {
  var x = 10;
}
console.log(x); // 10 — var leaks out of blocks!

if (true) {
  let y = 10;
}
console.log(y); // ReferenceError: y is not defined
\`\`\`

## JavaScript Types

JavaScript has **8 types**: seven primitives and one compound type.

### Primitives

| Type | Example | Description |
|---|---|---|
| \`string\` | \`"hello"\` | Text data |
| \`number\` | \`42\`, \`3.14\` | 64-bit float |
| \`bigint\` | \`9007199254740993n\` | Arbitrary precision integers |
| \`boolean\` | \`true\`, \`false\` | Logical values |
| \`undefined\` | \`undefined\` | Variable declared but not assigned |
| \`null\` | \`null\` | Intentional absence of a value |
| \`symbol\` | \`Symbol("id")\` | Unique, immutable identifier |

### Object (non-primitive)

Everything else — arrays, functions, dates, maps — is an **object**. Objects are collections of key-value pairs.

\`\`\`js
const person = {
  name: "Alice",
  age: 30,
  greet() {
    return \`Hi, I'm \${this.name}\`;
  }
};
\`\`\`

## Dynamic Typing

JavaScript is **dynamically typed** — variables do not have fixed types. The same variable can hold any type at any time.

\`\`\`js
let value = 42;       // number
value = "hello";      // now a string
value = true;         // now a boolean
\`\`\`

## Type Checking with \`typeof\`

\`\`\`js
typeof "hello"      // "string"
typeof 42           // "number"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" ← famous bug, null is NOT an object
typeof {}           // "object"
typeof []           // "object" ← arrays are objects!
typeof function(){} // "function"
\`\`\`

## Type Coercion

JavaScript automatically converts types in certain contexts:

\`\`\`js
"5" + 3       // "53" — number coerced to string for +
"5" - 3       // 2   — string coerced to number for -
true + 1      // 2   — boolean coerced to number
"" == false   // true — loose equality with coercion
"" === false  // false — strict equality, no coercion
\`\`\`

Always use \`===\` (strict equality) instead of \`==\` to avoid unexpected coercion.

@@diagram:type-coercion-flow`,
  },
  {
    slug: "functions",
    title: "Functions",
    description:
      "Master function declarations, expressions, arrow functions, parameters, rest/spread, and the concept of first-class functions.",
    order: 3,
    category: "Foundations",
    difficulty: "beginner",
    estimatedMinutes: 12,
    diagrams: [
      {
        id: "function-call-stack",
        type: "callstack",
        title: "The Call Stack",
        data: `sequenceDiagram
  participant Global
  participant outer
  participant inner
  Global->>outer: call outer()
  outer->>inner: call inner()
  inner-->>outer: return value
  outer-->>Global: return value`,
      },
    ],
    content: `Functions are the core building block of JavaScript programs. They encapsulate logic, accept inputs (parameters), and return outputs.

## Declaring Functions

There are three ways to create functions in JavaScript:

### Function Declaration

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}

greet("Alice"); // "Hello, Alice!"
\`\`\`

Function declarations are **hoisted** — you can call them before they appear in the source code.

### Function Expression

\`\`\`js
const greet = function(name) {
  return \`Hello, \${name}!\`;
};
\`\`\`

Not hoisted — the variable is hoisted but not the function value.

### Arrow Functions

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;

// Multi-line
const add = (a, b) => {
  const sum = a + b;
  return sum;
};
\`\`\`

Arrow functions are concise and do not have their own \`this\` binding — crucial for callbacks.

## Parameters and Arguments

\`\`\`js
function add(a, b) {         // a and b are parameters
  return a + b;
}

add(3, 5);                   // 3 and 5 are arguments
\`\`\`

### Default Parameters

\`\`\`js
function greet(name = "stranger") {
  return \`Hello, \${name}!\`;
}

greet();          // "Hello, stranger!"
greet("Alice");   // "Hello, Alice!"
\`\`\`

### Rest Parameters

\`\`\`js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10
\`\`\`

## Return Values

Functions return \`undefined\` by default if no \`return\` statement is present.

## First-Class Functions

In JavaScript, functions are **first-class citizens** — they can be:

- Assigned to variables
- Passed as arguments
- Returned from other functions

\`\`\`js
// Passed as argument
[1, 2, 3].map(n => n * 2); // [2, 4, 6]

// Returned from function
function multiplier(factor) {
  return (number) => number * factor;
}

const double = multiplier(2);
double(5); // 10
\`\`\`

## Pure Functions

A pure function:
1. Given the same inputs, always returns the same output
2. Has no side effects (doesn't modify external state)

\`\`\`js
// Pure
function add(a, b) {
  return a + b;
}

// Impure — depends on external state
let count = 0;
function increment() {
  count++;        // side effect
  return count;
}
\`\`\`

@@diagram:function-call-stack`,
  },
  {
    slug: "scope-and-closures",
    title: "Scope and Closures",
    description:
      "Understand lexical scope, block scope, and the closure mechanism that gives JavaScript so much of its power.",
    order: 4,
    category: "Core Concepts",
    difficulty: "intermediate",
    estimatedMinutes: 15,
    diagrams: [
      {
        id: "scope-chain",
        type: "scope",
        title: "The Scope Chain",
        data: `flowchart TB
  subgraph GlobalScope [Global Scope]
    x["x = 10"]
    subgraph OuterScope [Outer Function Scope]
      y["y = 20"]
      subgraph InnerScope [Inner Function Scope]
        z["z = 30"]
        lookup["Access x, y, z"]
      end
    end
  end
  lookup -->|found locally| z
  lookup -->|walk up| y
  lookup -->|walk up| x`,
      },
    ],
    content: `Scope defines where variables are accessible. Closures are one of JavaScript's most powerful — and most misunderstood — features.

## Lexical Scope

JavaScript uses **lexical (static) scope**: a variable's scope is determined by where it is written in the source code, not where the function is called.

\`\`\`js
const x = 10; // global scope

function outer() {
  const y = 20; // outer function scope

  function inner() {
    const z = 30; // inner function scope
    console.log(x, y, z); // can access all three
  }

  inner();
}
\`\`\`

## Block Scope

\`let\` and \`const\` are **block-scoped** — confined to the nearest enclosing \`{}\`.

\`\`\`js
{
  let blockVar = "only here";
}

console.log(blockVar);  // ReferenceError
\`\`\`

## Closures

A **closure** is a function that remembers the variables from the scope where it was created — even after that scope has finished executing.

\`\`\`js
function makeCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3
\`\`\`

### Closures for Private State

\`\`\`js
function createBankAccount(initialBalance) {
  let balance = initialBalance;  // private

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);    // 150
account.balance;        // undefined — private!
\`\`\`

## The Classic Loop Bug

\`\`\`js
// Bug: all callbacks reference the same \`i\`
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// prints: 3, 3, 3

// Fix: use let (creates new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// prints: 0, 1, 2
\`\`\`

@@diagram:scope-chain`,
  },
  {
    slug: "async-javascript",
    title: "Async JavaScript",
    description:
      "From callbacks to Promises to async/await — learn how JavaScript handles time-consuming operations without blocking.",
    order: 5,
    category: "Core Concepts",
    difficulty: "intermediate",
    estimatedMinutes: 18,
    diagrams: [
      {
        id: "event-loop",
        type: "event-loop",
        title: "The Event Loop",
        data: `flowchart LR
  subgraph JSThread [JS Thread]
    CallStack["Call Stack (LIFO)"]
  end
  subgraph BrowserNode [Browser or Node]
    WebAPIs["Web APIs: setTimeout, fetch, DOM"]
  end
  subgraph TaskQueues [Queues]
    Microtask["Microtask Queue: Promises"]
    MacroTask["Task Queue: setTimeout, setInterval"]
  end
  CallStack -->|async call| WebAPIs
  WebAPIs -->|callback| MacroTask
  WebAPIs -->|promise resolved| Microtask
  Microtask -->|stack empty, runs first| CallStack
  MacroTask -->|stack and microtasks empty| CallStack`,
      },
    ],
    content: `JavaScript is single-threaded, yet it handles thousands of concurrent operations. The secret is the **event loop** — a masterpiece of asynchronous engineering.

## Callbacks

The original async solution: pass a function to be called when the operation completes.

\`\`\`js
function getData(url, callback) {
  setTimeout(() => {
    callback(null, { id: 1, name: "Alice" });
  }, 1000);
}

getData("https://api.example.com", (error, data) => {
  if (error) { console.error("Failed:", error); return; }
  console.log(data);
});
\`\`\`

Nested callbacks become deeply indented — this is "callback hell."

## Promises

Promises provide a cleaner model:

\`\`\`js
fetch("/api/data")
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => console.error("Failed:", error))
  .finally(() => console.log("Done"));
\`\`\`

Promises have three states: **Pending**, **Fulfilled**, **Rejected**.

## async / await

\`async\`/\`await\` is syntactic sugar over Promises:

\`\`\`js
async function loadUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed:", error);
  }
}
\`\`\`

### Parallel Operations

\`\`\`js
// Sequential — slow
const user = await getUser(id);
const settings = await getSettings(id);

// Parallel — fast
const [user, settings] = await Promise.all([
  getUser(id),
  getSettings(id)
]);
\`\`\`

## The Event Loop

JavaScript uses an event loop to handle async code on a single thread:

1. **Call Stack** — where your code runs (LIFO)
2. **Web APIs** — browser async capabilities (setTimeout, fetch)
3. **Microtask Queue** — Promise callbacks (higher priority)
4. **Task Queue** — setTimeout/setInterval callbacks

\`\`\`js
console.log("1");
setTimeout(() => console.log("2"), 0);   // macrotask
Promise.resolve().then(() => console.log("3")); // microtask
console.log("4");
// Output: 1, 4, 3, 2
\`\`\`

@@diagram:event-loop`,
  },
  {
    slug: "prototypes-and-classes",
    title: "Prototypes and Classes",
    description:
      "Explore JavaScript's prototype-based inheritance model, ES6 classes, private fields, and the prototype chain.",
    order: 6,
    category: "Core Concepts",
    difficulty: "intermediate",
    estimatedMinutes: 16,
    diagrams: [
      {
        id: "prototype-chain",
        type: "prototype-chain",
        title: "The Prototype Chain",
        data: `flowchart BT
  Obj["dog instance: bark()"] -->|__proto__| Animal["Animal.prototype: breathe()"]
  Animal -->|__proto__| ObjProto["Object.prototype: toString, hasOwnProperty"]
  ObjProto -->|__proto__| Null[null]`,
      },
    ],
    content: `JavaScript is a prototype-based language. Every object has a hidden link to another object — its **prototype** — from which it can inherit properties and methods.

## The Prototype Chain

\`\`\`js
const animal = {
  breathe() { return "breathing"; }
};

const dog = {
  bark() { return "woof"; }
};

Object.setPrototypeOf(dog, animal);

dog.bark();    // "woof" — found on dog
dog.breathe(); // "breathing" — found on animal (prototype)
\`\`\`

## ES6 Classes

Classes are syntactic sugar over prototype-based inheritance:

\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return \`\${this.name} makes a sound.\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks.\`;
  }
}

const d = new Dog("Rex");
d.speak();          // "Rex barks."
d instanceof Dog;   // true
d instanceof Animal; // true
\`\`\`

### Static Methods and Fields

\`\`\`js
class MathUtils {
  static PI = 3.14159;

  static circle(r) {
    return MathUtils.PI * r * r;
  }
}

MathUtils.circle(5); // 78.53975
\`\`\`

### Private Fields

\`\`\`js
class BankAccount {
  #balance = 0;

  deposit(amount) { this.#balance += amount; }
  get balance() { return this.#balance; }
}

const acc = new BankAccount();
acc.deposit(100);
acc.balance;    // 100
acc.#balance;   // SyntaxError — truly private
\`\`\`

## Checking the Chain

\`\`\`js
dog instanceof Animal;                               // true
Object.getPrototypeOf(dog) === Animal.prototype;     // true
dog.hasOwnProperty("bark");                          // true
dog.hasOwnProperty("breathe");                       // false — inherited
\`\`\`

@@diagram:prototype-chain`,
  },
  {
    slug: "arrays-and-iteration",
    title: "Arrays and Iteration",
    description:
      "Master array creation, transformation with map/filter/reduce, destructuring, spread, and iteration patterns.",
    order: 7,
    category: "Core Concepts",
    difficulty: "beginner",
    estimatedMinutes: 14,
    diagrams: [],
    content: `Arrays are ordered, list-like objects. JavaScript arrays are dynamic — they can grow and shrink, and hold mixed types.

## Creating Arrays

\`\`\`js
const nums = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null];
const filled = new Array(3).fill(0); // [0, 0, 0]
\`\`\`

## Transforming

\`\`\`js
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);          // [2, 4, 6, 8, 10]
nums.filter(n => n % 2 === 0); // [2, 4]
nums.reduce((sum, n) => sum + n, 0); // 15
\`\`\`

## Searching

\`\`\`js
const fruits = ["apple", "banana", "cherry"];

fruits.find(f => f.startsWith("b"));    // "banana"
fruits.includes("banana");              // true
fruits.some(f => f.length > 5);        // true
fruits.every(f => f.length > 3);       // true
\`\`\`

## Sorting

\`\`\`js
const nums = [3, 1, 4, 1, 5, 9];
nums.sort((a, b) => a - b); // numeric ascending
nums.sort((a, b) => b - a); // numeric descending
\`\`\`

## Destructuring

\`\`\`js
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]
\`\`\`

## Spread Operator

\`\`\`js
const a = [1, 2, 3];
const b = [4, 5, 6];
const merged = [...a, ...b]; // [1, 2, 3, 4, 5, 6]
\`\`\`

## Iterating

\`\`\`js
const nums = [10, 20, 30];

for (const n of nums) {
  console.log(n);
}

nums.forEach((n, i) => console.log(i, n));
\`\`\`

## Array from Iterables

\`\`\`js
Array.from("hello");                        // ["h", "e", "l", "l", "o"]
Array.from({ length: 5 }, (_, i) => i);    // [0, 1, 2, 3, 4]
Array.from(new Set([1, 2, 2, 3]));         // [1, 2, 3]
\`\`\``,
  },
  {
    slug: "error-handling",
    title: "Error Handling",
    description:
      "Learn try/catch/finally, custom error classes, async error patterns, and how to never silently swallow exceptions.",
    order: 8,
    category: "Best Practices",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    diagrams: [],
    content: `Errors are inevitable. JavaScript provides \`try\`/\`catch\`/\`finally\` for synchronous code and \`.catch()\`/\`try\`/\`await\` patterns for async operations.

## try / catch / finally

\`\`\`js
function divide(a, b) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}

try {
  const result = divide(10, 0);
} catch (error) {
  console.error(error.message); // "Cannot divide by zero"
} finally {
  console.log("Always runs");
}
\`\`\`

\`finally\` runs regardless of success or failure — useful for cleanup.

## Custom Error Classes

\`\`\`js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("age", "Age must be a number");
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(\`\${error.field}: \${error.message}\`);
  } else {
    throw error; // re-throw unexpected errors
  }
}
\`\`\`

## Async Error Handling

\`\`\`js
async function loadData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (error) {
    console.error("Failed:", error);
    return null;
  }
}
\`\`\`

## Never Swallow Errors

\`\`\`js
// BAD — silent failure
try {
  doSomething();
} catch (e) {}

// GOOD — log and handle or re-throw
try {
  doSomething();
} catch (e) {
  console.error(e);
  throw e;
}
\`\`\`

## Unhandled Rejections

\`\`\`js
window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled Rejection:", event.reason);
});
\`\`\``,
  },
];

export function getChapters(): Chapter[] {
  return CHAPTERS;
}

export function getChapter(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function getChapterWithNav(slug: string): (Chapter & { prevSlug: string | null; nextSlug: string | null }) | undefined {
  const idx = CHAPTERS.findIndex((c) => c.slug === slug);
  if (idx === -1) return undefined;
  return {
    ...CHAPTERS[idx],
    prevSlug: idx > 0 ? CHAPTERS[idx - 1].slug : null,
    nextSlug: idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1].slug : null,
  };
}
