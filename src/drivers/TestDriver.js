/**
 * A driver which doesn't actually drive any hardware, just returns data from
 * a function, or example dataset.
 * TODO: add other test functions (3D - gaussian for example), way to read from 
 * a function or read in some example data.
 */
export default class TestDriver {
  constructor () {
    this.currentCoords = [1, 1];
    this.func = function loss(x, y) {
      return Math.sin(y) * x  + Math.sin(x) * y  +  x * x +  y *y;
    }
  }

  measureAt (coords) {
    this.currentCoords = coords;
    return this.func(...coords);
  }
}
