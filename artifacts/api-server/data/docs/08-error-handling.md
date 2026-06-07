Errors are inevitable. JavaScript provides `try`/`catch`/`finally` for synchronous code and `.catch()`/`try`/`await` patterns for async operations.

## The Error Object

JavaScript has several built-in error types:

```js
new Error("Something went wrong");        // generic
new TypeError("Expected a string");       // wrong type
new RangeError("Value out of range");     // number outside valid range
new ReferenceError("x is not defined");   // bad variable reference
new SyntaxError("Unexpected token");      // parse error
```

All errors have:
- `name` — the error type name
- `message` — description
- `stack` — stack trace string

## try / catch / finally

```js
function divide(a, b) {
  if (b === 0) throw new Error("Cannot divide by zero");
  return a / b;
}

try {
  const result = divide(10, 0);
  console.log(result); // never reached
} catch (error) {
  console.error(error.message); // "Cannot divide by zero"
} finally {
  console.log("Always runs"); // cleanup goes here
}
```

`finally` runs regardless of success or failure — useful for cleanup like closing connections or resetting state.

## Throwing Custom Errors

Create domain-specific error classes:

```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

class NetworkError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "NetworkError";
    this.statusCode = statusCode;
  }
}

function validateAge(age) {
  if (typeof age !== "number") {
    throw new ValidationError("age", "Age must be a number");
  }
  if (age < 0 || age > 150) {
    throw new ValidationError("age", "Age must be between 0 and 150");
  }
}

try {
  validateAge("thirty");
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation failed on ${error.field}: ${error.message}`);
  } else {
    throw error; // re-throw unexpected errors
  }
}
```

## Async Error Handling

### With Promises

```js
fetch("/api/data")
  .then(res => {
    if (!res.ok) throw new NetworkError(res.status, res.statusText);
    return res.json();
  })
  .then(data => console.log(data))
  .catch(error => {
    if (error instanceof NetworkError) {
      console.error(`HTTP ${error.statusCode}: ${error.message}`);
    } else {
      console.error("Unexpected error:", error);
    }
  });
```

### With async/await

```js
async function loadData() {
  try {
    const res = await fetch("/api/data");
    if (!res.ok) throw new NetworkError(res.status, res.statusText);
    const data = await res.json();
    return data;
  } catch (error) {
    if (error instanceof NetworkError) {
      // handle network errors
      return null;
    }
    throw error; // re-throw unexpected errors
  }
}
```

## Error Boundaries

Never silently swallow errors — always log, re-throw, or handle:

```js
// BAD — swallows the error silently
try {
  doSomething();
} catch (e) {}

// GOOD — log and handle or re-throw
try {
  doSomething();
} catch (e) {
  logger.error(e);
  throw e; // or handle appropriately
}
```

## Unhandled Rejections

Always handle Promise rejections. In Node.js, unhandled rejections crash the process:

```js
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

window.addEventListener("unhandledrejection", event => {
  console.error("Unhandled Rejection:", event.reason);
});
```
