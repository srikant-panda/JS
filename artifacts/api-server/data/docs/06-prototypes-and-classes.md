JavaScript is a prototype-based language. Every object has a hidden link to another object — its **prototype** — from which it can inherit properties and methods.

## The Prototype Chain

When you access a property on an object, JavaScript looks up the **prototype chain** until it finds it:

```js
const animal = {
  breathe() {
    return "breathing";
  }
};

const dog = {
  bark() {
    return "woof";
  }
};

// Set dog's prototype to animal
Object.setPrototypeOf(dog, animal);

dog.bark();    // "woof" — found on dog
dog.breathe(); // "breathing" — found on animal (prototype)
dog.toString(); // found on Object.prototype (top of chain)
```

Every plain object inherits from `Object.prototype`, which is the root of the prototype chain.

## Constructor Functions

Before ES6 classes, objects were created with constructor functions:

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person("Alice", 30);
alice.greet(); // "Hi, I'm Alice"
```

The `new` keyword:
1. Creates a new empty object
2. Sets `this` to that object in the constructor
3. Sets the object's prototype to `Person.prototype`
4. Returns the object

## ES6 Classes

Classes are syntactic sugar over prototype-based inheritance:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name); // call parent constructor
  }

  speak() {
    return `${this.name} barks.`;
  }
}

const d = new Dog("Rex");
d.speak();     // "Rex barks."
d instanceof Dog;    // true
d instanceof Animal; // true
```

### Static Methods and Fields

```js
class MathUtils {
  static PI = 3.14159;

  static circle(r) {
    return MathUtils.PI * r * r;
  }
}

MathUtils.circle(5); // 78.53975
MathUtils.PI;        // 3.14159
```

### Private Fields

ES2022 introduced genuine private fields with `#`:

```js
class BankAccount {
  #balance = 0;  // private

  deposit(amount) {
    this.#balance += amount;
  }

  get balance() {
    return this.#balance;
  }
}

const acc = new BankAccount();
acc.deposit(100);
acc.balance;    // 100
acc.#balance;   // SyntaxError — truly private
```

## Object.create

Create objects with explicit prototype links:

```js
const personProto = {
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};

const alice = Object.create(personProto);
alice.name = "Alice";
alice.greet(); // "Hi, I'm Alice"
```

## Checking the Chain

```js
alice instanceof Person; // true
Object.getPrototypeOf(alice) === Person.prototype; // true
alice.hasOwnProperty("name"); // true — own property
alice.hasOwnProperty("greet"); // false — inherited
```

@@diagram:prototype-chain
