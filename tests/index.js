import Aligner, {optimizers, drivers} from '../index.js';

const driver = new drivers.TestDriver('gauss-3d');
const optimizer = new optimizers.NelderMead(driver.nCoords);

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