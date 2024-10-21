import { thermostat } from '../thermostat.js';

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
