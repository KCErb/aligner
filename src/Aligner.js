/**
 * An aligner is an object which knows how to coordinate a optimizer and a driver to 
 * find the maximum/minimum of the space the driver can search. It also holds metadata about
 * the alignment process which is really what makes it an 'aligner' rather than
 * just an optimization search algorithm. For example, each search step may induce
 * vibrations in the system being searched and require a dwell-time between measurements
 * related to the step size.
 */
export default class Aligner {
  /**
   * Create an instance of the alignment class.
   * @param {Optimizer} optimizer Object capable of taking a measurement and producing a set of coordinates.
   * @param {Driver} driver Object capable of taking in coordinates and producing a measurement.
   */
  constructor (optimizer, driver) {
    this.optimizer = optimizer;
    this.driver = driver;
    this.stats = {
      measurements: 0,
    }
  }

  /**
   * Perform alignment loop between optimizer and driver.
   */
  async align () {
    this.stats.measurements++
    let coordVec = this.driver.currentCoords;
    let measurement = await this.driver.measureAt(coordVec);
    const funcGenerator = this.optimizer.generator(measurement, coordVec);
    
    let generatorOutput = funcGenerator.next(measurement);
    while(!generatorOutput.done) {
      this.stats.measurements++;
      measurement = await this.driver.measureAt(generatorOutput.value);
      generatorOutput = funcGenerator.next(measurement);
    }
  }
}
