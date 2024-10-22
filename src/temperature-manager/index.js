import { thermostat } from '../thermostat.js';

export function setToHeat() {
  thermostat.mode = 'heat';
}

export function setToCool() {
  thermostat.mode = 'cool';
}

export function setOff() {
  thermostat.mode = 'off';
}

export function handleThermostatReading(thePlan, thermostat) {
  if (thePlan.targetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
  else if (thePlan.targetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
  else setOff();
}
