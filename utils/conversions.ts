
export const convertValue = (value: number, type: 'temp' | 'pressure' | 'energy', toSI: boolean) => {
  if (toSI) {
    // Imperial to SI
    switch (type) {
      case 'temp': return (value + 459.67) * 5/9; // Rankine to Kelvin
      case 'pressure': return value * 6.89476; // PSI to kPa
      case 'energy': return value * 1.05506; // BTU to kJ
      default: return value;
    }
  } else {
    // SI to Imperial
    switch (type) {
      case 'temp': return value * 1.8; // Kelvin to Rankine
      case 'pressure': return value / 6.89476; // kPa to PSI
      case 'energy': return value / 1.05506; // kJ to BTU
      default: return value;
    }
  }
};
