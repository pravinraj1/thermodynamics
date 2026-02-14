import { UnitSystem } from '../types';

export type UnitType = 'temp' | 'temp_C' | 'pressure' | 'volume' | 'energy' | 'specific_energy' | 'power' | 'mass' | 'mass_flow' | 'length' | 'area' | 'u_value' | 'density' | 'specific_heat' | 'conductance';

export const convertToSI = (value: number, type: UnitType, system: UnitSystem): number => {
    if (system === UnitSystem.SI) return value;

    switch (type) {
        case 'temp': // Rankine to Kelvin
            return value * (5 / 9);
        case 'temp_C': // Fahrenheit to Celsius
            return (value - 32) * (5 / 9);
        case 'pressure': // psi to kPa
            return value * 6.89476;
        case 'volume': // ft^3 to m^3
            return value * 0.0283168;
        case 'energy': // BTU to kJ
            return value * 1.05506;
        case 'specific_energy': // BTU/lb to kJ/kg
            return value * 2.326;
        case 'power': // HP to kW
            return value * 0.7457;
        case 'mass': // lb to kg
            return value * 0.453592;
        case 'mass_flow': // lb/s to kg/s
            return value * 0.453592;
        case 'length': // ft to m
            return value * 0.3048;
        case 'area': // ft^2 to m^2
            return value * 0.092903;
        case 'u_value': // BTU/(hr·ft²·°F) to W/(m²·K)
            return value * 5.67826;
        case 'density': // lb/ft^3 to kg/m^3
            return value * 16.0185;
        case 'specific_heat': // BTU/(lb·°F) to kJ/(kg·K)
            return value * 4.1868;
        case 'conductance': // BTU/(hr·°F) to kW/K
            return value / 1895.63;
        default:
            return value;
    }
};

export const convertFromSI = (value: number, type: UnitType, system: UnitSystem): number => {
    if (system === UnitSystem.SI) return value;

    switch (type) {
        case 'temp': // Kelvin to Rankine
            return value * 1.8;
        case 'temp_C': // Celsius to Fahrenheit
            return (value * 1.8) + 32;
        case 'pressure': // kPa to psi
            return value / 6.89476;
        case 'volume': // m^3 to ft^3
            return value / 0.0283168;
        case 'energy': // kJ to BTU
            return value / 1.05506;
        case 'specific_energy': // kJ/kg to BTU/lb
            return value / 2.326;
        case 'power': // kW to HP
            return value / 0.7457;
        case 'mass': // kg to lb
            return value / 0.453592;
        case 'mass_flow': // kg/s to lb/s
            return value / 0.453592;
        case 'length': // m to ft
            return value / 0.3048;
        case 'area': // m^2 to ft^2
            return value / 0.092903;
        case 'u_value': // W/(m²·K) to BTU/(hr·ft²·°F)
            return value / 5.67826;
        case 'density': // kg/m^3 to lb/ft^3
            return value / 16.0185;
        case 'specific_heat': // kJ/(kg·K) to BTU/(lb·°F)
            return value / 4.1868;
        case 'conductance': // kW/K to BTU/(hr·°F)
            return value * 1895.63;
        default:
            return value;
    }
};
