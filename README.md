# Aligner

A little tool for aligning things! This is a demo of tool that could be used to perform physical search space problems
where some set of coordinates describe the current alignment of the system and try to find a better alignment given
some kind of measure of the goodness of the current alignment.

This demo comes with a Nelder–Mead "optimizer" to get things rolling in the direction of this kind of alignment problem: 
https://ieeexplore.ieee.org/abstract/document/4026448 but any algorithm can be used.

Note: Since alignment/positioning problems can be pretty domain specific, it's probably better to use the `Aligner`
here as a parent and have your subclass implement introspective logic to match the domain. For example, the 'laser' alignment 
demo in this readme, may in real life, need to wait a certain dwell time between measurements to allow transient vibrations 
to damp out sufficiently. This may depend on the step size as well. In that case, a `class LaserAligner < Aligner {}` would
be a great place to overwrite the `align` method and add those parameters.

## Use

A complex system may have many things that need to be aligned. For each one we can make an instance of the `Aligner` class
by choosing the optimization algorithm we'd like to use and the driver.

```javascript
import { myDriver } from '@my-company/drivers';
import Aligner, { optimizers } from '@kcerb/aligner';

const nelderMead = new optimizers.NelderMead(myDriver.nCoords, {minTolerance: 1e-9, maxIterations: 100});
const laser1Aligner = new Aligner(nelderMead, myDriver);

laser1Aligner.align().then( () => console.log(laser1Aligner.stats));
```

As long as the driver and optimizer implement the right interfaces, the `align` call will
give the driver a new set of coordinates to try and feed the resultant measurement to the 
optimizer which will then feed the driver with a new set of coordinates in a loop until the 
stop condition is reached.

## Interfaces

To implement an optimizer or a driver be sure to include the following properties and methods. If this grows
in complexity we may want to add a base-class module that provides these as parents to override, or migrate
to typescript to get real interfaces.

### Optimizer

**methods**
- `generator` - returns a function generator which gives coordinates of next measurement based on current measurement. Default `Aligner` will provide two arguments to initialize this generator with: first measurement (`number`) and first coordinates (`number[]`).

### Driver

**properties**
- `currentCoords` - returns the current position of the driver as an array of numbers.

**methods**
- `measureAt` (async) - performs a measurement and returns the value of the measurement which can be fed directly into the optimizer.

## Testing

Since drivers are independent, we provide a test driver which can be used to test the performance on sample data of a given algorithm.

```javascript
import Aligner, { optimizers, drivers } from '@kcerb/aligner';
// test driver will select initial position at random within bounds given by min and max
const testDriver = new drivers.TestDriver('guass-3d', {
    min: [-1, -1, -1],
    max: [1, 1, 1]
});
const nelderMead = new optimizers.NelderMead(testDriver.nCoords, {minTolerance: 1e-9, maxIterations: 100});
const laser1Aligner = new Aligner(nelderMead, testDriver);

laser1Aligner.align().then( () => console.log(laser1Aligner.stats));
```

## ToDo

Next steps:

1. Add more support for real drivers such as minimum/maximum step-size.
2. Bloat dependencies a bit for real development (code coverage, linter/style, fancier test suite, actual publication process to npm).
3. Add visual and other debug tools to help user explore different optimizers effectiveness in aligning a given system.