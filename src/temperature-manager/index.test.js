import { handleThermostatReading } from './index';
import { thermostat } from '../thermostat';
import { HeatingPlan } from '../heating-plan';

describe('TemperatureManager', () => {
  const heatingPlan = new HeatingPlan({ min: 10, max: 20 });

  let originalThermostat;
  beforeEach(() => {
    originalThermostat = { ...thermostat };
  });

  afterEach(() => {
    thermostat.currentTemperature = originalThermostat.currentTemperature;
    thermostat.selectedTemperature = originalThermostat.selectedTemperature;
  });

  describe('handleThermostatReading', () => {
    describe("when the heating plan's target temperature is greater than the thermostat's current temperature", () => {
      it('should set the thermostat to heat', () => {
        thermostat.currentTemperature = 10;
        thermostat.selectedTemperature = 15;

        handleThermostatReading(heatingPlan, thermostat);

        expect(thermostat.mode).toBe('heat');
      });
    });

    describe("when the heating plan's target temperature is less than the thermostat's current temperature", () => {
      it('should set the thermostat to cool', () => {
        thermostat.currentTemperature = 20;
        thermostat.selectedTemperature = 15;

        handleThermostatReading(heatingPlan, thermostat);

        expect(thermostat.mode).toBe('cool');
      });
    });

    describe("when the heating plan's target temperature is equal to the thermostat's current temperature", () => {
      it('should set the thermostat to off', () => {
        thermostat.currentTemperature = 15;
        thermostat.selectedTemperature = 15;

        handleThermostatReading(heatingPlan, thermostat);

        expect(thermostat.mode).toBe('off');
      });
    });
  });
});
