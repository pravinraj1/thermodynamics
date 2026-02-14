
export enum UnitSystem {
  SI = 'SI',
  IMPERIAL = 'IMPERIAL'
}

export enum ModuleType {
  IDEAL_GAS = 'IDEAL_GAS',
  CYCLES = 'CYCLES',
  HEAT_EXCHANGER = 'HEAT_EXCHANGER',
  REFRIGERATION = 'REFRIGERATION',
  CONDUCTION = 'CONDUCTION',
  CONVECTION = 'CONVECTION',
  RADIATION = 'RADIATION',
  VALIDATION = 'VALIDATION'
}

export enum GasProcess {
  ISOTHERMAL = 'ISOTHERMAL',
  ADIABATIC = 'ADIABATIC',
  ISOBARIC = 'ISOBARIC',
  ISOCHORIC = 'ISOCHORIC',
  POLYTROPIC = 'POLYTROPIC'
}

export enum CycleType {
  OTTO = 'OTTO',
  DIESEL = 'DIESEL',
  RANKINE = 'RANKINE',
  BRAYTON = 'BRAYTON'
}

export interface CalculationResult {
  id: string;
  module: ModuleType;
  timestamp: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  efficiency?: number;
  safetyScore?: 'GREEN' | 'YELLOW' | 'RED';
}

export const PHYSICAL_CONSTANTS = {
  R_AIR: 0.287, // kJ/kg.K
  Cp_AIR: 1.005, // kJ/kg.K
  Cv_AIR: 0.718, // kJ/kg.K
  GAMMA_AIR: 1.4,
};

export const UNIT_LABELS = {
  [UnitSystem.SI]: {
    temp: 'K',
    pressure: 'kPa',
    volume: 'm³',
    energy: 'kJ',
    power: 'kW',
    mass: 'kg'
  },
  [UnitSystem.IMPERIAL]: {
    temp: '°R',
    pressure: 'psi',
    volume: 'ft³',
    energy: 'BTU',
    power: 'HP',
    mass: 'lb'
  }
};
