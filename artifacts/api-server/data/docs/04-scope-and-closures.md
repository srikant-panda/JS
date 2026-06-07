Scope defines where variables are accessible. Closures are one of JavaScript's most powerful — and most misunderstood — features.

## Lexical Scope

JavaScript uses **lexical (static) scope**: a variable's scope is determined by where it is written in the source code, not where the function is called.

```js
const x = 10; // global scope

function outer() {
  const y = 20; // outer function scope

  function inner() {
    const z = 30; // inner function scope
    console.log(x, y, z); // can access all three
  }

  inner();
}

outer();
// inner() can see x, y, z
// outer() can see x, y — but NOT z
// global can see only x
```

Inner functions have access to variables in their outer scopes. This chain of scopes is called the **scope chain**.

## Block Scope

`let` and `const` are **block-scoped** — confined to the nearest enclosing `{}`.

```js
{
  let blockVar = "only here";
  const alsoBlock = 42;
}

console.log(blockVar);  // ReferenceError
```

`var` ignores block boundaries and is function-scoped:

```js
for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — leaked out!

for (let j = 0; j < 3; j++) {}
console.log(j); // ReferenceError
```

## Closures

A **closure** is a function that remembers the variables from the scope where it was created — even after that scope has finished executing.

```js
function makeCounter() {
  let count = 0;          // private to makeCounter

  return function() {
    count++;              // accesses count from outer scope
    return count;
  };
}

const counter = makeCounter();
counter(); // 1
counter(); // 2
counter(); // 3

const other = makeCounter(); // independent counter
other(); // 1
```

`count` is not accessible from outside, but the returned function keeps a live reference to it. This is a closure.

### Closures for Private State

Closures are the classic way to create private variables in JavaScript:

```js
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
account.withdraw(30);   // 120
account.balance;        // undefined — private!
```

## The Classic Loop Bug

A common mistake with closures in loops:

```js
// Bug: all callbacks reference the same `i`
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// prints: 3, 3, 3

// Fix 1: use let (creates new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// prints: 0, 1, 2

// Fix 2: IIFE to capture current value
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
// prints: 0, 1, 2
```

@@diagram:scope-chain
