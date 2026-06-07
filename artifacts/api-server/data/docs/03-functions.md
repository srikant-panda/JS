Functions are the core building block of JavaScript programs. They encapsulate logic, accept inputs (parameters), and return outputs.

## Declaring Functions

There are three ways to create functions in JavaScript:

### Function Declaration

```js
function greet(name) {
  return `Hello, ${name}!`;
}

greet("Alice"); // "Hello, Alice!"
```

Function declarations are **hoisted** — you can call them before they appear in the source code.

### Function Expression

```js
const greet = function(name) {
  return `Hello, ${name}!`;
};
```

Not hoisted — the variable is hoisted but not the function value.

### Arrow Functions

```js
const greet = (name) => `Hello, ${name}!`;

// Multi-line
const add = (a, b) => {
  const sum = a + b;
  return sum;
};
```

Arrow functions are concise and do not have their own `this` binding — crucial for callbacks.

## Parameters and Arguments

```js
function add(a, b) {         // a and b are parameters
  return a + b;
}

add(3, 5);                    // 3 and 5 are arguments
```

### Default Parameters

```js
function greet(name = "stranger") {
  return `Hello, ${name}!`;
}

greet();          // "Hello, stranger!"
greet("Alice");   // "Hello, Alice!"
```

### Rest Parameters

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3, 4); // 10
```

## Return Values

Functions return `undefined` by default if no `return` statement is present.

```js
function doSomething() {
  // no return
}

doSomething(); // undefined
```

## First-Class Functions

In JavaScript, functions are **first-class citizens** — they can be:

- Assigned to variables
- Passed as arguments
- Returned from other functions

```js
// Passed as argument
[1, 2, 3].map(n => n * 2); // [2, 4, 6]

// Returned from function
function multiplier(factor) {
  return (number) => number * factor;
}

const double = multiplier(2);
double(5); // 10
```

## Pure Functions

A pure function:
1. Given the same inputs, always returns the same output
2. Has no side effects (doesn't modify external state)

```js
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
```

Prefer pure functions — they are predictable, testable, and composable.

@@diagram:function-call-stack
