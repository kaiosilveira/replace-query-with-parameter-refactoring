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

  describe('xxNEWtargetTemperature', () => {
    it('should return the maximum defined for the heating plan', () => {
      const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
      expect(heatingPlan.xxNEWtargetTemperature(30)).toBe(20);
    });

    it('should return the minimum defined for the heating plan', () => {
      const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
      expect(heatingPlan.xxNEWtargetTemperature(5)).toBe(10);
    });

    it('should return the selected temperature', () => {
      const heatingPlan = new HeatingPlan({ thermostat, min: 10, max: 20 });
      expect(heatingPlan.xxNEWtargetTemperature(15)).toBe(15);
    });
  });
});
