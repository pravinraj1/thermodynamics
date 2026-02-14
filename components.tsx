
import React, { useState, useEffect } from 'react';
import { UnitSystem } from './types';
import { convertToSI, convertFromSI, UnitType } from './utils/unitConversion';

export const UnitAwareInput: React.FC<{
  label: string,
  value: number,
  onChange: (val: number) => void,
  unitType: UnitType,
  system: UnitSystem,
  precision?: number
}> = ({ label, value, onChange, unitType, system, precision = 2 }) => {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when SI value or system changes
  useEffect(() => {
    const val = convertFromSI(value, unitType, system);
    setDisplayValue(val.toFixed(precision));
  }, [value, system, unitType, precision]);

  const handleChange = (val: string) => {
    setDisplayValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange(convertToSI(num, unitType, system));
    }
  };

  const getUnitLabel = () => {
    if (system === UnitSystem.SI) {
      switch (unitType) {
        case 'temp': return 'K';
        case 'temp_C': return '°C';
        case 'pressure': return 'kPa';
        case 'volume': return 'm³';
        case 'energy': return 'kJ';
        case 'specific_energy': return 'kJ/kg';
        case 'power': return 'kW';
        case 'mass': return 'kg';
        case 'mass_flow': return 'kg/s';
        case 'length': return 'm';
        case 'area': return 'm²';
        case 'u_value': return 'W/m²K';
        case 'specific_heat': return 'kJ/kg·K';
        default: return '';
      }
    } else {
      switch (unitType) {
        case 'temp': return '°R';
        case 'temp_C': return '°F';
        case 'pressure': return 'psi';
        case 'volume': return 'ft³';
        case 'energy': return 'BTU';
        case 'specific_energy': return 'BTU/lb';
        case 'power': return 'HP';
        case 'mass': return 'lb';
        case 'mass_flow': return 'lb/s';
        case 'length': return 'ft';
        case 'area': return 'ft²';
        case 'u_value': return 'BTU/hr·ft²·°F';
        case 'specific_heat': return 'BTU/lb·°F';
        default: return '';
      }
    }
  };


  return (
    <InputField
      label={label}
      value={displayValue}
      onChange={handleChange as any} // InputField expects string | number but we handle the event manually in wrapper? Wait, InputField takes value and onChange(val).
      unit={getUnitLabel()}
      type="number"
    />
  );
};


export const Card: React.FC<{ children: React.ReactNode, title?: string, className?: string }> = ({ children, title, className }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className || ''}`}>
    {title && <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

export const InputField: React.FC<{
  label: string,
  value: number | string,
  onChange: (val: any) => void,
  unit?: string,
  error?: string,
  helperText?: string,
  type?: string
}> = ({ label, value, onChange, unit, error, helperText, type = 'number' }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-slate-700">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${error ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
      />
      {unit && <span className="absolute right-3 top-2.5 text-slate-400 text-sm">{unit}</span>}
    </div>
    {error ? <p className="text-xs text-red-600">{error}</p> : helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
  </div>
);

export const Badge: React.FC<{ status: 'GREEN' | 'YELLOW' | 'RED', label: string }> = ({ status, label }) => {
  const styles = {
    GREEN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    YELLOW: 'bg-amber-100 text-amber-700 border-amber-200',
    RED: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {label}
    </span>
  );
};

export const Button: React.FC<{
  children: React.ReactNode,
  onClick?: () => void,
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string
}> = ({ children, onClick, variant = 'primary', className }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-400"
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className || ''}`}>
      {children}
    </button>
  );
};

export const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ active, onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${active
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-slate-600 hover:bg-slate-100'
      } ${className || ''}`}
  >
    {children}
  </button>
);

