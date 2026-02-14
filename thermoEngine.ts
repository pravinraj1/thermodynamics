
import { GasProcess, PHYSICAL_CONSTANTS, CycleType } from './types';

export const thermoEngine = {
  /**
   * Ideal Gas Process Calculations
   */
  calculateIdealGasProcess: (
    process: GasProcess,
    P1: number,
    V1: number,
    T1: number,
    param: number,
    n_poly: number = 1.3
  ) => {
    const { R_AIR, Cv_AIR, GAMMA_AIR } = PHYSICAL_CONSTANTS;
    let P2 = P1, V2 = V1, T2 = T1, W = 0, Q = 0, dU = 0;

    switch (process) {
      case GasProcess.ISOTHERMAL:
        V2 = param;
        T2 = T1;
        P2 = P1 * V1 / V2;
        W = P1 * V1 * Math.log(V2 / V1);
        Q = W;
        dU = 0;
        break;
      case GasProcess.ADIABATIC:
        V2 = param;
        P2 = P1 * Math.pow(V1 / V2, GAMMA_AIR);
        T2 = T1 * Math.pow(V1 / V2, GAMMA_AIR - 1);
        W = (P1 * V1 - P2 * V2) / (GAMMA_AIR - 1);
        dU = -W;
        Q = 0;
        break;
      case GasProcess.ISOBARIC:
        V2 = param;
        P2 = P1;
        T2 = T1 * V2 / V1;
        W = P1 * (V2 - V1);
        dU = Cv_AIR * (T2 - T1);
        Q = dU + W;
        break;
      case GasProcess.ISOCHORIC:
        P2 = param;
        V2 = V1;
        T2 = T1 * P2 / P1;
        W = 0;
        dU = Cv_AIR * (T2 - T1);
        Q = dU;
        break;
      case GasProcess.POLYTROPIC:
        V2 = param;
        P2 = P1 * Math.pow(V1 / V2, n_poly);
        T2 = T1 * Math.pow(V1 / V2, n_poly - 1);
        W = (P1 * V1 - P2 * V2) / (n_poly - 1);
        dU = Cv_AIR * (T2 - T1);
        Q = dU + W;
        break;
    }

    return { P2, V2, T2, W, Q, dU };
  },

  /**
   * Otto Cycle Analysis
   */
  calculateOttoCycle: (r: number, T1: number, P1: number, q_in: number) => {
    const { Cv_AIR, GAMMA_AIR, R_AIR } = PHYSICAL_CONSTANTS;
    // State 1 properties
    const v1 = (R_AIR * T1) / P1; // m3/kg
    const v2 = v1 / r;

    const T2 = T1 * Math.pow(r, GAMMA_AIR - 1);
    const P2 = P1 * Math.pow(r, GAMMA_AIR);
    const T3 = T2 + q_in / Cv_AIR;
    const P3 = P2 * (T3 / T2);
    const T4 = T3 * Math.pow(1 / r, GAMMA_AIR - 1);
    const P4 = P3 * Math.pow(1 / r, GAMMA_AIR);
    const w_net = q_in - Cv_AIR * (T4 - T1);
    const efficiency = 1 - (1 / Math.pow(r, GAMMA_AIR - 1));
    const MEP = w_net / (v1 - v2);

    return { T2, T3, T4, P2, P3, P4, w_net, efficiency: efficiency * 100, MEP };
  },

  /**
   * Rankine Cycle Analysis (Engineering Model)
   */
  calculateRankineCycle: (
    T3: number,     // Turbine Inlet Temp (C)
    P3: number,     // Boiler Pressure (kPa)
    P1: number,     // Condenser Pressure (kPa)
    w_pump: number, // Pump Work (kJ/kg)
    q_in: number,   // Boiler Heat Input (kJ/kg)
    m_dot: number   // Mass Flow Rate (kg/s)
  ) => {
    // Standard approximation constants for steam
    const Cp_steam = 1.8723; // kJ/kg.K
    const GAMMA_steam = 1.32;

    const T3K = T3 + 273.15;

    // Isentropic Turbine expansion h3 - h4
    const w_turbine = Cp_steam * T3K * (1 - Math.pow(P1 / P3, (GAMMA_steam - 1) / GAMMA_steam));

    const w_net = w_turbine - w_pump;
    const efficiency = (w_net / q_in) * 100;
    const power_output = m_dot * w_net; // kW

    return {
      w_turbine,
      w_net,
      efficiency,
      power_output,
      T3,
      P3,
      P1,
      // Return approx state points for visualization
      states: {
        1: { P: P1, T: 45, phase: "Saturated Liquid" }, // Condenser Outlet
        2: { P: P3, T: 45, phase: "Compressed Liquid" }, // Pump Outlet (Simplified isentropic T rise negligible)
        3: { P: P3, T: T3, phase: "Superheated Vapor" }, // Boiler Outlet
        4: { P: P1, T: 45, phase: "Wet Mixture" }        // Turbine Outlet (Simplified T drop)
      }
    };
  },

  /**
   * Diesel Cycle
   */
  calculateDieselCycle: (r: number, rc: number, T1: number, P1: number) => {
    const { GAMMA_AIR, Cv_AIR, Cp_AIR, R_AIR } = PHYSICAL_CONSTANTS;
    // State 1 properties
    const v1 = (R_AIR * T1) / P1;
    const v2 = v1 / r;

    const T2 = T1 * Math.pow(r, GAMMA_AIR - 1);
    const T3 = T2 * rc;
    const q_in = Cp_AIR * (T3 - T2);
    const T4 = T3 * Math.pow(rc / r, GAMMA_AIR - 1);
    const q_out = Cv_AIR * (T4 - T1);
    const w_net = q_in - q_out;
    const efficiency = (1 - (1 / Math.pow(r, GAMMA_AIR - 1)) * ((Math.pow(rc, GAMMA_AIR) - 1) / (GAMMA_AIR * (rc - 1)))) * 100;
    const MEP = w_net / (v1 - v2);

    const P2 = P1 * Math.pow(r, GAMMA_AIR);
    const P3 = P2; // Isobaric Heat Addition
    const P4 = P3 * Math.pow(rc / r, GAMMA_AIR); // Approx expansion

    return {
      T2, T3, T4,
      P2, P3, P4,
      w_net, efficiency, MEP
    };
  },

  /**
   * Brayton Cycle (Gas Turbine)
   */
  calculateBraytonCycle: (rp: number, T1: number, T3: number, P1: number = 100) => {
    const { GAMMA_AIR, Cp_AIR } = PHYSICAL_CONSTANTS;

    // Isentropic Compression (1-2)
    const T2 = T1 * Math.pow(rp, (GAMMA_AIR - 1) / GAMMA_AIR);

    // Isentropic Expansion (3-4)
    const T4 = T3 * Math.pow(1 / rp, (GAMMA_AIR - 1) / GAMMA_AIR);

    const w_comp = Cp_AIR * (T2 - T1);
    const w_turb = Cp_AIR * (T3 - T4);
    const w_net = w_turb - w_comp;
    const q_in = Cp_AIR * (T3 - T2);

    const efficiency = (w_net / q_in) * 100;
    const bwr = w_comp / w_turb; // Back Work Ratio

    const P2 = P1 * Math.pow(rp, GAMMA_AIR); // Should be rp but let's check formula P2/P1 = (T2/T1)^(k/k-1) -> P2 = P1 * (T2/T1)^(k/k-1) -> P2 = P1 * rp (defn of rp)
    // Actually rp is P2/P1 so P2 is simply P1 * rp
    const P2_val = P1 * rp;
    const P3 = P2_val;
    const P4 = P1;

    return {
      T2, T4,
      P2: P2_val, P3, P4,
      w_comp, w_turb, w_net, efficiency, bwr
    };
  },

  /**
   * Heat Exchanger: LMTD & NTU
   */
  calculateHeatExchanger: (
    mh: number, Cph: number, Th_in: number, Th_out: number,
    mc: number, Cpc: number, Tc_in: number, UA: number
  ) => {
    const Ch = mh * Cph;
    const Cc = mc * Cpc;
    const Q = Ch * (Th_in - Th_out);
    const Tc_out = Tc_in + Q / Cc;
    const dT1 = Th_in - Tc_out;
    const dT2 = Th_out - Tc_in;
    let LMTD = 0;
    if (Math.abs(dT1 - dT2) < 0.001) LMTD = dT1;
    else LMTD = (dT1 - dT2) / Math.log(dT1 / dT2);
    const Cmin = Math.min(Ch, Cc);
    const Cmax = Math.max(Ch, Cc);
    const Cr = Cmin / Cmax;
    const NTU = UA / Cmin;
    let epsilon = 0;
    if (Cr === 1) epsilon = NTU / (1 + NTU);
    else epsilon = (1 - Math.exp(-NTU * (1 - Cr))) / (1 - Cr * Math.exp(-NTU * (1 - Cr)));
    return { Q, Tc_out, LMTD, epsilon: epsilon * 100, NTU };
  },

  /**
   * Vapor Compression Refrigeration
   */
  calculateVCC: (T_evap: number, T_cond: number, m_dot: number = 0.1) => {
    // Highly simplified VCC model
    const h1 = 250 + T_evap; // Approx evap enthalpy
    const h3 = 100 + T_cond * 0.8; // Approx cond enthalpy
    const h2 = h1 + (h1 - h3) * 0.3; // Approx compressor outlet
    const h4 = h3;
    const w_c = h2 - h1;
    const q_e = h1 - h4;
    const q_c = h2 - h3;
    const COP = q_e / w_c;
    const capacity = m_dot * q_e;
    return { w_c, q_e, q_c, COP, capacity };
  },

  /**
   * Heat Conduction Through Composite Wall
   */
  calculateConduction: (layers: Array<{ thickness: number, k: number }>, T_inside: number, T_outside: number, area: number = 1) => {
    let R_total = 0;
    const resistances = layers.map(layer => {
      const R = layer.thickness / (layer.k * area);
      R_total += R;
      return R;
    });
    const Q_dot = (T_inside - T_outside) / R_total;
    const temperatures = [T_inside];
    let current_T = T_inside;
    resistances.forEach(R => {
      current_T -= Q_dot * R;
      temperatures.push(current_T);
    });
    return { Q_dot, R_total, temperatures };
  },

  /**
   * Convection Heat Transfer
   */
  calculateConvection: (h: number, T_surf: number, T_inf: number, area: number = 1) => {
    const Q_dot = h * area * (T_surf - T_inf);
    return { Q_dot };
  },

  /**
   * Radiation Heat Transfer
   */
  calculateRadiation: (epsilon: number, T_surf: number, T_surr: number, area: number = 1) => {
    const SIGMA = 5.67e-8; // Stefan-Boltzmann constant
    // Convert Temperatures to Kelvin (assuming input is in C)
    const T_surf_K = T_surf + 273.15;
    const T_surr_K = T_surr + 273.15;

    const Q_dot = epsilon * SIGMA * area * (Math.pow(T_surf_K, 4) - Math.pow(T_surr_K, 4));
    return { Q_dot };
  },

  /**
   * Process Validation (2nd Law)
   */
  validateProcess: (P1: number, T1: number, P2: number, T2: number, Q_transfer: number, T_surr: number) => {
    const { Cp_AIR, R_AIR } = PHYSICAL_CONSTANTS;

    // System Entropy Change (Ideal Gas assumption)
    // ds = Cp*ln(T2/T1) - R*ln(P2/P1)
    const dS_sys = Cp_AIR * Math.log(T2 / T1) - R_AIR * Math.log(P2 / P1);

    // Surroundings Entropy Change
    // dS_surr = -Q_sys / T_surr
    const dS_surr = -Q_transfer / T_surr;

    // Total Entropy Gen
    const S_gen = dS_sys + dS_surr;

    let status: 'POSSIBLE' | 'IMPOSSIBLE' | 'REVERSIBLE' = 'POSSIBLE';
    if (Math.abs(S_gen) < 0.0001) status = 'REVERSIBLE';
    else if (S_gen < 0) status = 'IMPOSSIBLE';

    return { dS_sys, dS_surr, S_gen, status };
  },

  /**
   * Data Generation for Visualizations
   */
  generateOttoPlotData: (r: number, P1: number, V1: number = 1) => {
    const { GAMMA_AIR } = PHYSICAL_CONSTANTS;
    const data = [];
    const V2 = V1 / r;

    // Compression 1-2 (Adiabatic)
    for (let v = V1; v >= V2; v -= (V1 - V2) / 20) {
      const p = P1 * Math.pow(V1 / v, GAMMA_AIR);
      data.push({ v, p, stage: 'Compression' });
    }

    // Heat Addition 2-3 (Isochoric - approximated vertical jump)
    // We don't know P3 exactly without q_in, but for viz we can scale
    const P2 = P1 * Math.pow(r, GAMMA_AIR);
    const P3 = P2 * 3; // Visual scale
    data.push({ v: V2, p: P2, stage: 'Combustion' });
    data.push({ v: V2, p: P3, stage: 'Combustion' });

    // Expansion 3-4 (Adiabatic)
    for (let v = V2; v <= V1; v += (V1 - V2) / 20) {
      const p = P3 * Math.pow(V2 / v, GAMMA_AIR);
      data.push({ v, p, stage: 'Expansion' });
    }

    // Heat Rejection 4-1
    const P4 = P3 * Math.pow(V2 / V1, GAMMA_AIR);
    data.push({ v: V1, p: P4, stage: 'Exhaust' });
    data.push({ v: V1, p: P1, stage: 'Exhaust' });

    return data;
  },

  generateRankinePlotData: (T3: number, P3: number, P1: number) => {
    // Simplified T-s Diagram
    // Saturation Dome (Water approx)
    const dome = [];
    for (let s = 0; s <= 9; s += 0.5) {
      const T = 374 - 40 * Math.pow(s - 4.5, 2); // Parabolic approx of dome
      if (T > 0) dome.push({ s, T });
    }

    // Cycle Points (Idealized)
    // 1: Condenser Outlet (Saturated Liquid) -> s~1.0, T~45C (at P=10kPa)
    // 2: Pump Outlet -> s~1.0, T~45C (ignoring small temp rise)
    // 3: Boiler Outlet -> s~6.5, T=T3 (Superheated)
    // 4: Turbine Outlet -> s~6.5, T~45C (or inside dome)

    // Scaling entropy based on pressures is complex for a simple viz.
    // We will use standard "shape" points adjusted by T3.
    const cycle = [
      { s: 1.5, T: 45 }, // 1 (Condenser out)
      { s: 1.5, T: 50 }, // 2 (Pump out)
      { s: 2.5, T: 250 }, // Saturation Liquid Line intersection
      { s: 5.5, T: 250 }, // Saturation Vapor Line intersection
      { s: 6.5, T: T3 }, // 3 (Turbine In)
      { s: 6.5, T: 45 }, // 4 (Turbine Out)
      { s: 1.5, T: 45 }  // Back to 1
    ];

    return { dome, cycle };
  },

  generateBraytonPlotData: (rp: number, P1: number, V1: number = 1) => {
    const { GAMMA_AIR } = PHYSICAL_CONSTANTS;
    const data = [];
    const V2 = V1 / Math.pow(rp, 1 / GAMMA_AIR);

    // Compression 1-2
    for (let v = V1; v >= V2; v -= (V1 - V2) / 20) {
      const p = P1 * Math.pow(V1 / v, GAMMA_AIR);
      data.push({ v, p });
    }

    // Heat Addition 2-3 (Isobaric)
    // V3/T3 relation -> V3 = V2 * (T3/T2)
    // For viz, we just expand Volume at constant Pressure
    const V3 = V2 * 2.5; // Visual scale
    const P2 = P1 * Math.pow(V1 / V2, GAMMA_AIR);
    data.push({ v: V2, p: P2 });
    data.push({ v: V3, p: P2 });

    // Expansion 3-4
    const P4 = P1; // Back to P1
    const V4 = V3 * Math.pow(P2 / P4, 1 / GAMMA_AIR);

    for (let v = V3; v <= V4; v += (V4 - V3) / 20) {
      const p = P2 * Math.pow(V3 / v, GAMMA_AIR);
      data.push({ v, p });
    }

    // Heat Rejection 4-1
    data.push({ v: V4, p: P1 });
    data.push({ v: V1, p: P1 });

    return data;
  }
};
