[![Continuous Integration](https://github.com/kaiosilveira/replace-query-with-parameter-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-query-with-parameter-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace Query with Parameter

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
targetTemperature(aPlan);

function targetTemperature(aPlan) {
  currentTemperature = thermostat.currentTemperature;
  // rest of the function
```

</td>

<td>

```javascript
targetTemperature(aPlan, thermostat.currentTemperature);

function targetTemperature(aPlan, currentTemperature) {
  // rest of the function
```

</td>
</tr>
</tbody>
</table>

**Inverse of: [Replace Parameter with Query](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring)**

External dependencies are easy to use, highly available with minimal overhead, and often require no initialization, but their downsides often outweight all these positive attributes: global shared states can become complicated to manage as the codebase grows, it's harder to track side effects throughout the system, and testing the code that depend on them can become a nightmare. This refactoring sheds some light on how to move away of these cases.

## Working example

Our working example is a program that manages the temperature of a `thermostat`, given a `HeatingPlan`. The `TemperatureManager` itself can be seen as the following set of functions:

```javascript
export function setToHeat() {
  thermostat.mode = 'heat';
}

export function setToCool() {
  thermostat.mode = 'cool';
}

export function setOff() {
  thermostat.mode = 'off';
}

export function handleThermostatReading(thePlan, thermostat) {
  if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
  else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
  else setOff();
}
```

And the `HeatingPlan` looks like this:

```javascript
export class HeatingPlan {
  constructor({ min, max }) {
    this._min = min;
    this._max = max;
  }

  get targetTemperature() {
    if (thermostat.selectedTemperature > this._max) return this._max;
    else if (thermostat.selectedTemperature < this._min) return this._min;
    else return thermostat.selectedTemperature;
  }
}
```

And both of the above modules depend on a global thermostat object:

```javascript
export let thermostat = {
  currentTemperature: 70,
  selectedTemperature: 72,
};
```

We know for enough time now that depending on globals is a bad idea, so our plan here is to remove the dependency `HeatingPlan` has on `thermostat`.

### Test suite

`HeatingPlan`'s test suite covers returning the minimum or maximum target temperature within its predefined range if the underlying thermostat temperature is outside of the boundaries, and also returning the thermostat's temperature itself if it is within the range.
`TemperatureManager`'s test suite covers updating the thermostat mode to either `heat`, `cool`, or `off`, depending on the circumstances.

The implementation of these tests is extensive, so they'll not be shown here. You can always go ahead and check [`heating-plan/index.test.js`](./src/heating-plan/index.test.js) and [`temperature-manager/index.test.js`](./src/temperature-manager/index.test.js) for details.

### Steps

As stated above, we want to get rid of the dependency `HeatingPlan` has on the global `thermostat` object. To do so, we need to receive its values as arguments, instead of directly referencing them. The strategy, then, is to turn the `targetTemperature` getter into a function, so we can receive these arguments and be free. To do so, we first need to limit the spread of `thermostat` inside `targetTemperature`. We start by [extracting](https://github.com/kaiosilveira/extract-variable-refactoring) a `selectedTemperature` variable:

```diff
diff --git HeatingPlan
   get targetTemperature() {
-    if (thermostat.selectedTemperature > this._max) return this._max;
-    else if (thermostat.selectedTemperature < this._min) return this._min;
-    else return thermostat.selectedTemperature;
+    const selectedTemperature = thermostat.selectedTemperature;
+    if (selectedTemperature > this._max) return this._max;
+    else if (selectedTemperature < this._min) return this._min;
+    else return selectedTemperature;
   }
```

Then, we can move forward with introducing our envisioned function, naming it with an easily searcheable prefix:

```diff
diff --git HeatingPlan
+  xxNEWtargetTemperature(selectedTemperature) {
+    if (selectedTemperature > this._max) return this._max;
+    else if (selectedTemperature < this._min) return this._min;
+    else return selectedTemperature;
+  }
```

We can then start using `xxNEWtargetTemperature` in the body of the `targetTemperature` getter:

```diff
diff --git HeatingPlan
   get targetTemperature() {
     const selectedTemperature = thermostat.selectedTemperature;
-    if (selectedTemperature > this._max) return this._max;
-    else if (selectedTemperature < this._min) return this._min;
-    else return selectedTemperature;
+    return this.xxNEWtargetTemperature(selectedTemperature);
   }
```

Since almost all the code has now been moved to a separate function, we don't need the `selectedTemperature` temp anymore, so we [inline it](https://github.com/kaiosilveira/inline-variable-refactoring):

```diff
diff --git HeatingPlan
   get targetTemperature() {
-    const selectedTemperature = thermostat.selectedTemperature;
-    return this.xxNEWtargetTemperature(selectedTemperature);
+    return this.xxNEWtargetTemperature(thermostat.selectedTemperature);
   }
```

And now that `targetTemperature` is simple enough, we can just [inline it](https://github.com/kaiosilveira/inline-function-refactoring) in the calling code:

```diff
diff --git TemperatureManager
 export function handleThermostatReading(thePlan, thermostat) {
-  if (thePlan.targetTemperature > thermostat.currentTemperature) setToHeat();
-  else if (thePlan.targetTemperature < thermostat.currentTemperature) setToCool();
+  if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
+  else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
   else setOff();
 }
```

With this move, the `targetTemperature` getter is now unused, so we can [remove it](https://github.com/kaiosilveira/remove-dead-code-refactoring) from `HeatingPlan`:

```diff
diff --git HeatingPlan
-  get targetTemperature() {
-    return this.xxNEWtargetTemperature(thermostat.selectedTemperature);
-  }
```

And now we can reach our goal: `HeatingPlan` does not depend on `thermostat` any longer:

```diff
diff --git HeatingPlan
-import { thermostat } from '../thermostat.js';
-
 export class HeatingPlan {
   constructor({ min, max }) {
     this._min = min;
```

Last, but not least, we can rename `xxNEWtargetTemperature` to `targetTemperature`:

```diff
diff --git HeatingPlan
-  xxNEWtargetTemperature(selectedTemperature) {
+  targetTemperature(selectedTemperature) {

diff --git TemperatureManager
 export function handleThermostatReading(thePlan, thermostat) {
-  if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
-  else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
+  if (thePlan.targetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
+  else if (thePlan.targetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
   else setOff();
 }
```

And that finishes off our work.

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                          | Message                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [4d39669](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/4d3966925ce840f7d98bb81c7d15a41bbea2a981) | extract `selectedTemperature` variable at `HeatingPlan.targetTemperature` |
| [02b5f18](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/02b5f18ea615ad331f03105c2663ba6884275fb8) | introduce `xxNEWtargetTemperature` at `HeatingPlan`                       |
| [cf7ca0e](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/cf7ca0e3dc7482cd228c1a98838bfb4e301a7e13) | use `xxNEWtargetTemperature` at `HeatingPlan.targetTemperature`           |
| [df7fa43](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/df7fa4390cc87ceb0a4fdee488f8c6bb2066ed61) | inline `selectedTemperature` at `HeatingPlan.targetTemperature`           |
| [7720516](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/7720516c9633e199dcd0384a62093a433bc6ce88) | inline `targetTemperature` function at `handleThermostatReading`          |
| [5c253c3](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/5c253c3dc974eef466df7836e45deec46c256a33) | remove unused `targetTemperature` getter at `HeatingPlan`                 |
| [900bba3](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/900bba35b615e22ec26280e172a28105c41a3470) | remove `thermostat` import at `HeatingPlan`                               |
| [11fc72f](https://github.com/kaiosilveira/replace-parameter-with-query-refactoring/commit/11fc72f57a5ff4e02b9e60fce619c735b9376269) | rename `xxNEWtargetTemperature` to `targetTemperature` at `HeatingPlan`   |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-query-with-parameter-refactoring/commits/main).
