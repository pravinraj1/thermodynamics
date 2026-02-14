import { thermoEngine } from './thermoEngine';
import { CycleType } from './types';

console.log("=== THERMODYNAMIC ENGINE VERIFICATION ===\n");

// 1. Otto Cycle
console.log("--- Test Case 1: Otto Cycle ---");
const otto = thermoEngine.calculateOttoCycle(8, 300, 100, 800);
console.log(`Inputs: r=8, T1=300K, P1=100kPa, q_in=800kJ/kg`);
console.log(`Outputs:
- Efficiency: ${otto.efficiency.toFixed(2)}%
- Net Work: ${otto.w_net.toFixed(2)} kJ/kg
- Max Temp (T3): ${otto.T3.toFixed(2)} K
- P3: ${otto.P3.toFixed(2)} kPa
`);

// 2. Rankine Cycle
console.log("--- Test Case 2: Rankine Cycle ---");
const rankine = thermoEngine.calculateRankineCycle(500, 8000, 10, 8, 2800, 50);
console.log(`Inputs: T3=500C, P3=8000kPa, P1=10kPa, m_dot=50kg/s`);
console.log(`Outputs:
- Efficiency: ${rankine.efficiency.toFixed(2)}%
- Net Power: ${(rankine.power_output / 1000).toFixed(2)} MW
- Turbine Work: ${rankine.w_turbine.toFixed(2)} kJ/kg
`);

// 3. Heat Exchanger
console.log("--- Test Case 3: Counter-Flow Heat Exchanger ---");
const hx = thermoEngine.calculateHeatExchanger(2.5, 4.18, 90, 40, 5.0, 4.18, 20, 50);
console.log(`Inputs: Hot(90->40C, 2.5kg/s), Cold(20C in, 5.0kg/s), UA=50kW/K`);
console.log(`Outputs:
- Heat Transfer Q: ${hx.Q.toFixed(2)} kW
- Cold Out Tc_out: ${hx.Tc_out.toFixed(2)} C
- LMTD: ${hx.LMTD.toFixed(2)} C
- Effectiveness: ${hx.epsilon.toFixed(2)}%
- NTU: ${hx.NTU.toFixed(2)}
`);

// 4. VCC (Refrigeration)
console.log("--- Test Case 4: Vapor Compression Cycle ---");
const vcc = thermoEngine.calculateVCC(-10, 40, 0.1);
console.log(`Inputs: T_evap=-10C, T_cond=40C, m_dot=0.1kg/s`);
console.log(`Outputs:
- COP: ${vcc.COP.toFixed(2)}
- Cooling Capacity: ${vcc.capacity.toFixed(2)} kW
- Compressor Work: ${vcc.w_c.toFixed(2)} kJ/kg
`);

// 5. Conduction (Composite Wall)
console.log("--- Test Case 5: Composite Wall Conduction ---");
const layers = [{ thickness: 0.2, k: 0.8 }, { thickness: 0.05, k: 0.04 }];
const cond = thermoEngine.calculateConduction(layers, 20, -5);
console.log(`Inputs: T_in=20C, T_out=-5C, Layers=[0.2m/0.8, 0.05m/0.04]`);
console.log(`Outputs:
- Heat Flux Q_dot: ${cond.Q_dot.toFixed(2)} W/m2
- Total Resistance: ${cond.R_total.toFixed(4)} K/W
- Interface Temp: ${cond.temperatures[1].toFixed(2)} C
`);

console.log("\n=== VERIFICATION COMPLETE ===");
