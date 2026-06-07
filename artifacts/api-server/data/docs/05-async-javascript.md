JavaScript is single-threaded, yet it handles thousands of concurrent operations. The secret is the **event loop** — a masterpiece of asynchronous engineering.

## The Problem with Synchronous Code

Imagine fetching data from a server synchronously:

```js
// Hypothetical blocking call — JavaScript doesn't work this way
const data = fetchFromServer("https://api.example.com/data"); // blocks for 2 seconds
console.log(data); // runs 2 seconds later
console.log("This waits too"); // also delayed
```

Everything stops. The UI freezes. This is why JavaScript is asynchronous.

## Callbacks

The original solution: pass a function to be called when the operation completes.

```js
function getData(url, callback) {
  // simulate async
  setTimeout(() => {
    callback(null, { id: 1, name: "Alice" });
  }, 1000);
}

getData("https://api.example.com", (error, data) => {
  if (error) {
    console.error("Failed:", error);
    return;
  }
  console.log(data);
});
```

### Callback Hell

Nested callbacks become deeply indented and hard to reason about:

```js
getUser(id, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return handleError(err);
      // now we have what we need...
    });
  });
});
```

## Promises

Promises provide a cleaner model for async operations:

```js
function getData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ id: 1, name: "Alice" });
    }, 1000);
  });
}

getData("https://api.example.com")
  .then(data => {
    console.log(data);
    return data.id;
  })
  .then(id => console.log("User ID:", id))
  .catch(error => console.error("Failed:", error))
  .finally(() => console.log("Done"));
```

Promises have three states:
- **Pending** — initial state
- **Fulfilled** — resolved with a value
- **Rejected** — rejected with an error

## async / await

`async`/`await` is syntactic sugar over Promises — it makes async code look synchronous:

```js
async function loadUser(id) {
  try {
    const user = await fetch(`/api/users/${id}`);
    const data = await user.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Failed to load user:", error);
  }
}

loadUser(1);
```

### Parallel Async Operations

Avoid sequential `await` when operations are independent:

```js
// Sequential — slow (waits for each)
const user = await getUser(id);
const settings = await getSettings(id);

// Parallel — fast (runs simultaneously)
const [user, settings] = await Promise.all([
  getUser(id),
  getSettings(id)
]);
```

## The Event Loop

JavaScript uses an event loop to handle async code on a single thread:

1. **Call Stack** — where your code runs (LIFO stack of function calls)
2. **Web APIs** — browser-provided async capabilities (setTimeout, fetch, DOM events)
3. **Callback Queue** (Task Queue) — completed callbacks waiting to run
4. **Microtask Queue** — Promise callbacks (higher priority than the callback queue)
5. **Event Loop** — constantly checks if the call stack is empty, then moves tasks in

```js
console.log("1");

setTimeout(() => console.log("2"), 0);  // macrotask

Promise.resolve().then(() => console.log("3")); // microtask

console.log("4");

// Output: 1, 4, 3, 2
// Microtasks (Promises) run before macrotasks (setTimeout)
```

@@diagram:event-loop
