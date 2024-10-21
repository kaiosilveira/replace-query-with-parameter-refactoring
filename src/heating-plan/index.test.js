import { HeatingPlan } from '.';
import { thermostat } from '../thermostat.js';

describe('HeatingPlan', () => {
  let originalThermostat;
  beforeEach(() => {
    originalThermostat = { ...thermostat };
  });

  afterEach(() => {
    thermostat.currentTemperature = originalThermostat.currentTemperature;
    thermostat.selectedTemperature = originalThermostat.selectedTemperature;
  });

  describe('targetTemperature', () => {
    describe("when the thermostat's selected temperature is greater than the maximum defined for the heating plan", () => {
      it('should return the maximum defined for the heating plan', () => {
        thermostat.selectedTemperature = 30;
        const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
        expect(heatingPlan.targetTemperature).toBe(20);
      });
    });

    describe("when the thermostat's selected temperature is less than the minimum defined for the heating plan", () => {
      it('should return the minimum defined for the heating plan', () => {
        thermostat.selectedTemperature = 5;
        const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
        expect(heatingPlan.targetTemperature).toBe(10);
      });
    });

    describe("when the thermostat's selected temperature is within the range defined for the heating plan", () => {
      it("should return the thermostat's selected temperature", () => {
        thermostat.selectedTemperature = 15;
        const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
        expect(heatingPlan.targetTemperature).toBe(15);
      });
    });
  });
});
