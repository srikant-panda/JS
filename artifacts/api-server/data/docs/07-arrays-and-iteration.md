Arrays are ordered, list-like objects. JavaScript arrays are dynamic — they can grow and shrink, and hold mixed types.

## Creating Arrays

```js
const nums = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, null, { name: "Alice" }];
const empty = [];
const filled = new Array(3).fill(0); // [0, 0, 0]
```

## Common Array Methods

### Adding and Removing

```js
const fruits = ["apple", "banana"];

// End
fruits.push("cherry");   // ["apple", "banana", "cherry"]
fruits.pop();            // "cherry" — removes last

// Start
fruits.unshift("mango"); // ["mango", "apple", "banana"]
fruits.shift();          // "mango" — removes first

// Splice (remove or insert at index)
fruits.splice(1, 1);           // remove 1 at index 1
fruits.splice(1, 0, "kiwi");   // insert "kiwi" at index 1
```

### Transforming

```js
const nums = [1, 2, 3, 4, 5];

// map — transform each element
nums.map(n => n * 2);        // [2, 4, 6, 8, 10]

// filter — keep matching elements
nums.filter(n => n % 2 === 0); // [2, 4]

// reduce — aggregate into single value
nums.reduce((sum, n) => sum + n, 0); // 15

// flatMap — map then flatten one level
[[1, 2], [3, 4]].flatMap(x => x);   // [1, 2, 3, 4]
```

### Searching

```js
const fruits = ["apple", "banana", "cherry"];

fruits.find(f => f.startsWith("b"));    // "banana"
fruits.findIndex(f => f === "cherry");  // 2
fruits.includes("banana");              // true
fruits.indexOf("apple");                // 0
fruits.some(f => f.length > 5);        // true
fruits.every(f => f.length > 3);       // true
```

### Sorting

```js
const nums = [3, 1, 4, 1, 5, 9];

nums.sort();          // [1, 1, 3, 4, 5, 9] — lexicographic by default!
nums.sort((a, b) => a - b); // numeric ascending
nums.sort((a, b) => b - a); // numeric descending

const people = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];
people.sort((a, b) => a.name.localeCompare(b.name));
// [Alice, Bob, Charlie]
```

## Destructuring

```js
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Skip elements
const [, , third] = [10, 20, 30];
// third = 30

// Default values
const [a = 0, b = 0] = [1];
// a = 1, b = 0
```

## Spread Operator

```js
const a = [1, 2, 3];
const b = [4, 5, 6];

const merged = [...a, ...b];         // [1, 2, 3, 4, 5, 6]
const copy = [...a];                 // shallow copy
const withExtra = [...a, 99];        // [1, 2, 3, 99]
```

## Iterating

```js
const nums = [10, 20, 30];

// for...of (preferred for arrays)
for (const n of nums) {
  console.log(n);
}

// forEach — side effects only (no return value)
nums.forEach((n, i) => console.log(i, n));

// for loop — when you need the index or early exit
for (let i = 0; i < nums.length; i++) {
  if (nums[i] === 20) break;
}
```

## Array from Iterables

```js
Array.from("hello");          // ["h", "e", "l", "l", "o"]
Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
Array.from(new Set([1, 2, 2, 3]));      // [1, 2, 3]
```
