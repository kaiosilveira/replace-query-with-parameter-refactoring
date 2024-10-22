export class HeatingPlan {
  constructor({ min, max }) {
    this._min = min;
    this._max = max;
  }

  targetTemperature(selectedTemperature) {
    if (selectedTemperature > this._max) return this._max;
    else if (selectedTemperature < this._min) return this._min;
    else return selectedTemperature;
  }
}
