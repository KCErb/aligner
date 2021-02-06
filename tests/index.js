import Aligner, {optimizers, drivers} from '../index.js';

const optimizer = new optimizers.NelderMead(2);
const driver = new drivers.TestDriver();
const aligner = new Aligner(optimizer, driver);

aligner.align()
  .then(function () {
    console.log('alignment complete');
    console.log(aligner.stats);
  })
  .catch( function (err) {
    console.error('failed to align');
    console.error(err);
  });