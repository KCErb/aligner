/**
 * Based largely on the `nelderMead` function from the `fmin` package: https://github.com/benfred/fmin/.
 */
export default class NelderMead {
  constructor(nDim, parameters={}) {
    this.nDim = nDim;
    this.initParams(parameters);
    this.finished = false;
  }

  /**
   * Initialize simplex and other params using first value
   * @param {number} measurement0 value of function at coords0
   * @param {number[]} coords0 initial coordinates
   */
  init (measurement0, coords0) {
    this.simplex = new Array(this.nDim + 1);
    this.simplex[0] = coords0;
    this.simplex[0].fx = measurement0;
    this.simplex[0].id = 0;
    this.centroid = coords0.slice();
    this.reflected = coords0.slice();
    this.contracted = coords0.slice();
    this.expanded = coords0.slice();
  }

  /**
   * Function generator which steps through the Nelder-Mead algorithm
   */
  *generator (measurement0, coords0) {
    this.init(measurement0, coords0);

    // get first delta point
    for (let i = 0; i < this.nDim; ++i) {
      let point = coords0.slice();
      point[i] = point[i] * this.nonZeroDelta;
      this.simplex[i+1] = point;
      this.simplex[i+1].fx = yield point;
      this.simplex[i+1].id = i+1;
    }

    // loop
    for (let iteration = 0; iteration < this.maxIterations; ++iteration) {
      this.sortSimplex();

      let maxDiff = 0;
      for (let i = 0; i < this.nDim; ++i) {
        maxDiff = Math.max(maxDiff, Math.abs(this.simplex[0][i] - this.simplex[1][i]));
      }

      if ((Math.abs(this.simplex[0].fx - this.simplex[this.nDim].fx) < this.minErrorDelta) &&
        (maxDiff < this.minTolerance)) {
        break;
      }

      // compute the centroid of all but the worst point in the simplex
      for (let i = 0; i < this.nDim; ++i) {
        this.centroid[i] = 0;
        for (let j = 0; j < this.nDim; ++j) {
          this.centroid[i] += this.simplex[j][i];
        }
        this.centroid[i] /= this.nDim;
      }

      // reflect the worst point past the centroid  and compute loss at reflected
      // point
      let worst = this.simplex[this.nDim];
      this.weightedSum(this.reflected, 1+this.rho, this.centroid, -this.rho, worst);
      this.reflected.fx = yield this.reflected;

      // if the reflected point is the best seen, then possibly expand
      if (this.reflected.fx < this.simplex[0].fx) {
        this.weightedSum(this.expanded, 1+this.chi, this.centroid, -this.chi, worst);
        this.expanded.fx = yield this.expanded;
        if (this.expanded.fx < this.reflected.fx) {
          this.updateSimplex(this.expanded);
        }  else {
          this.updateSimplex(this.reflected);
        }
      }

      // if the reflected point is worse than the second worst, we need to
      // contract
      else if (this.reflected.fx >= this.simplex[this.nDim-1].fx) {
        let shouldReduce = false;

        if (this.reflected.fx > worst.fx) {
          // do an inside contraction
          this.weightedSum(this.contracted, 1+this.psi, this.centroid, -this.psi, worst);
          this.contracted.fx = yield this.contracted;
          if (this.contracted.fx < worst.fx) {
            this.updateSimplex(this.contracted);
          } else {
            shouldReduce = true;
          }
        } else {
          // do an outside contraction
          this.weightedSum(this.contracted, 1-this.psi * this.rho, this.centroid, this.psi*this.rho, worst);
          this.contracted.fx = yield this.contracted;
          if (this.contracted.fx < this.reflected.fx) {
            this.updateSimplex(this.contracted);
          } else {
            shouldReduce = true;
          }
        }

        if (shouldReduce) {
          // if we don't contract here, we're done
          if (this.sigma >= 1) break;

          // do a reduction
          for (i = 1; i < this.simplex.length; ++i) {
            this.weightedSum(this.simplex[i], 1 - this.sigma, this.simplex[0], this.sigma, this.simplex[i]);
            this.simplex[i].fx = yield this.simplex[i];
          }
        }
      } else {
        this.updateSimplex(this.reflected);
      }
      // end main loop
    }
    this.sortSimplex();
    return {fx : this.simplex[0].fx, x : this.simplex[0]};
  }

  // private
  initParams (parameters) {
    this.maxIterations = parameters.maxIterations || this.nDim * 200;
    this.nonZeroDelta = parameters.nonZeroDelta || 1.05;
    this.zeroDelta = parameters.zeroDelta || 0.001;
    this.minErrorDelta = parameters.minErrorDelta || 1e-6;
    this.minTolerance = parameters.minErrorDelta || 1e-5;
    this.rho = (parameters.rho !== undefined) ? parameters.rho : 1;
    this.chi = (parameters.chi !== undefined) ? parameters.chi : 2;
    this.psi = (parameters.psi !== undefined) ? parameters.psi : -0.5;
    this.sigma = (parameters.sigma !== undefined) ? parameters.sigma : 0.5;
  }
  
  sortSimplex () {
    this.simplex.sort(function (a, b) {
      return a.fx - b.fx; 
    });
  }

  updateSimplex (value) {
    for (let i = 0; i < value.length; i++) {
      this.simplex[this.nDim][i] = value[i];
    }
    this.simplex[this.nDim].fx = value.fx;
  }

  // blas-like, store result in `ret`
  weightedSum(ret, w1, v1, w2, v2) {
    for (let j = 0; j < ret.length; ++j) {
      ret[j] = w1 * v1[j] + w2 * v2[j];
    }
  }
}
