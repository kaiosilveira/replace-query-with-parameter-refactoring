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
  if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) > thermostat.currentTemperature) setToHeat();
  else if (thePlan.xxNEWtargetTemperature(thermostat.selectedTemperature) < thermostat.currentTemperature) setToCool();
  else setOff();
}
