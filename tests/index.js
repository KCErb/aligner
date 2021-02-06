import Aligner, {optimizers, drivers} from '../index.js';

Object.keys(drivers.TestDriver.TEST_FUNCTIONS).forEach( (name) => {
  const driver = new drivers.TestDriver(name);
  const optimizer = new optimizers.NelderMead(driver.nCoords, {
    rho: 0.1, // turn down reflection
  });

  const aligner = new Aligner(optimizer, driver);

  aligner.align()
    .then(function () {
      console.log('alignment complete');
      console.log(aligner.stats);
      console.log(driver.currentCoords);
    })
    .catch( function (err) {
      console.error('failed to align');
      console.error(err);
    });
})