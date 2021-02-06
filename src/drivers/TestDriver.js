/**
 * A driver which doesn't actually drive any hardware, just returns data from
 * a function, or example dataset.
 */

export default class TestDriver {
  static TEST_FUNCTIONS = {
    // sigma = 1, inverted so that driver produces minimum at alignment
    'gauss-3d': {
      nCoords: 3,
      func: function (x, y, z) {
       return (2 * Math.PI)**(-3/2) * Math.exp(-(x**2 + y**2 + z**2) / 2) * -1
      }
    },
  
    'simple-well': {
      nCoords: 2,
      func: function (x, y) {
        return Math.sin(y) * x  + Math.sin(x) * y  +  x * x +  y *y;
      }
    }
  };

  /**
   * Create a dummy driver which simply evaluates a test function.
   * @param {string} functionName name of test function to use
   * @param {object} opts function-specific options, such as bounds for initial 'position' of driver
   */
  constructor (functionName, opts={}) {
    const testFunction = TestDriver.TEST_FUNCTIONS[functionName];
    this.func = testFunction.func;
    this.nCoords = testFunction.nCoords;
    this.opts = opts;
    this.currentCoords = this.initCoords();
  }

  measureAt (coords) {
    this.currentCoords = coords;
    return this.func(...coords);
  }

  // private
  initCoords () {
    if (this.opts.initialCoords) {
      return this.opts.initialCoords;
    } else {
      return Array.from({length: this.nCoords}, (_, i) => {
        const max = (this.opts.max && this.opts.max[i]) || 1;
        const min = (this.opts.min && this.opts.min[i]) || 0;
        return Math.random() * (max-min) + min;
      });
    }
  }
}
