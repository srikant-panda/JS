export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  code?: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testSuite: string;
}

export const quizzes: QuizQuestion[] = [
  {
    id: "closure-counter",
    topic: "Closures",
    question: "What will the following code output when executed?",
    code: `function createCounter() {
  let count = 0;
  return () => ++count;
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1());
console.log(counter1());
console.log(counter2());`,
    options: [
      "1, 2, 3",
      "1, 2, 1",
      "1, 1, 1",
      "undefined, undefined, undefined"
    ],
    answerIndex: 1,
    explanation: "Each invocation of createCounter() creates a new lexical environment with its own isolated 'count' variable. Therefore, counter1 increments its own count (returning 1 then 2), while counter2 starts from 0 in its own closed-over environment (returning 1)."
  },
  {
    id: "event-loop-logs",
    topic: "Event Loop",
    question: "What is the correct order of the logged outputs?",
    code: `console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise");
});

console.log("End");`,
    options: [
      "Start, Timeout, Promise, End",
      "Start, End, Timeout, Promise",
      "Start, End, Promise, Timeout",
      "Start, Promise, Timeout, End"
    ],
    answerIndex: 2,
    explanation: "Synchronous code execution runs first (Start, End). The promise resolve handler runs next as a Microtask. The setTimeout callback is queued as a Macrotask (Task) and runs last, once the microtask queue is empty."
  },
  {
    id: "this-arrow",
    topic: "this Keyword",
    question: "What will be printed to the console?",
    code: `const obj = {
  name: "Alice",
  greetNormal: function() {
    console.log(this.name);
  },
  greetArrow: () => {
    console.log(this.name);
  }
};

obj.greetNormal();
obj.greetArrow();`,
    options: [
      "Alice, undefined (or empty/global name)",
      "Alice, Alice",
      "undefined, undefined",
      "TypeError"
    ],
    answerIndex: 0,
    explanation: "Normal functions bind 'this' dynamically based on how they are called (obj.greetNormal() binds 'this' to obj). Arrow functions bind 'this' lexically, inheriting the 'this' value from their surrounding outer scope (in this case, the global scope or undefined in strict modules)."
  },
  {
    id: "prototype-link",
    topic: "Prototypes",
    question: "What will this expression evaluate to?",
    code: `const parent = { name: "Bob" };
const child = Object.create(parent);

child.name = "Alice";
delete child.name;

console.log(child.name);`,
    options: [
      "undefined",
      "Alice",
      "Bob",
      "null"
    ],
    answerIndex: 2,
    explanation: "Object.create(parent) creates a new object with 'parent' as its prototype. Setting child.name overrides it locally. Deleting child.name removes the local property, so the prototype lookup walks up the chain and finds parent.name which is 'Bob'."
  }
];

export const codingChallenges: CodingChallenge[] = [
  {
    id: "custom-map",
    title: "Implement Array.prototype.myMap",
    description: "Write a function `myMap(arr, fn)` that acts exactly like `Array.prototype.map()`. Do not use the native `.map()` method.",
    starterCode: `function myMap(arr, fn) {
  // Your code here
  
}`,
    testSuite: `(function() {
  const test1 = myMap([1, 2, 3], x => x * 2);
  if (!Array.isArray(test1)) throw new Error("Result should be an array");
  if (JSON.stringify(test1) !== "[2,4,6]") throw new Error("Expected [2,4,6] but got " + JSON.stringify(test1));

  const test2 = myMap(["a", "b"], x => x.toUpperCase());
  if (JSON.stringify(test2) !== '["A","B"]') throw new Error("Expected ['A','B'] but got " + JSON.stringify(test2));

  const test3 = myMap([10], (x, i) => x + i);
  if (JSON.stringify(test3) !== "[10]") throw new Error("Expected [10] but got " + JSON.stringify(test3));

  return true;
})()`
  },
  {
    id: "flatten-array",
    title: "Flatten a Nested Array",
    description: "Write a function `flatten(arr)` that flattens a deeply nested array of any depth. Example: `flatten([1, [2, [3, 4]]])` should return `[1, 2, 3, 4]`.",
    starterCode: `function flatten(arr) {
  // Your code here
  
}`,
    testSuite: `(function() {
  const test1 = flatten([1, [2, [3, [4]]]]);
  if (JSON.stringify(test1) !== "[1,2,3,4]") throw new Error("Expected [1,2,3,4] but got " + JSON.stringify(test1));

  const test2 = flatten([]);
  if (JSON.stringify(test2) !== "[]") throw new Error("Expected [] but got " + JSON.stringify(test2));

  const test3 = flatten([1, 2, 3]);
  if (JSON.stringify(test3) !== "[1,2,3]") throw new Error("Expected [1,2,3] but got " + JSON.stringify(test3));

  const test4 = flatten([[[1]]]);
  if (JSON.stringify(test4) !== "[1]") throw new Error("Expected [1] but got " + JSON.stringify(test4));

  return true;
})()`
  },
  {
    id: "deep-equal",
    title: "Deep Equality Check",
    description: "Write a function `deepEqual(a, b)` that performs a deep comparison between two values (objects, arrays, primitives) to check if they are identical in structure and content.",
    starterCode: `function deepEqual(a, b) {
  // Your code here
  
}`,
    testSuite: `(function() {
  if (!deepEqual(1, 1)) throw new Error("1 should equal 1");
  if (deepEqual(1, "1")) throw new Error("1 should not deepEqual '1'");
  if (!deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })) throw new Error("Objects with identical structures should equal");
  if (deepEqual({ a: 1 }, { a: 2 })) throw new Error("Objects with different values should not equal");
  if (!deepEqual([1, [2, 3]], [1, [2, 3]])) throw new Error("Arrays should equal deeply");
  if (deepEqual([1, 2], [1, 3])) throw new Error("Arrays with different elements should not equal");
  if (deepEqual(null, {})) throw new Error("null should not equal empty object");

  return true;
})()`
  }
];
