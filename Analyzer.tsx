
import * as React from 'react';
import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Download } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, Label
} from 'recharts';
import { ModuleType, UnitSystem, UNIT_LABELS, GasProcess, CycleType } from './types';
import { thermoEngine } from './thermoEngine';
import { Card, InputField, Badge, Button, TabButton, UnitAwareInput } from './components';

const Analyzer: React.FC = () => {
    const location = useLocation();
    const [activeModule, setActiveModule] = useState<ModuleType>((location.state as any)?.module || ModuleType.CYCLES);
    const [unitSystem, setUnitSystem] = useState<UnitSystem>(UnitSystem.SI);
    const labels = UNIT_LABELS[unitSystem];

    // --- MODULE STATES & CALCULATIONS ---

    // Ideal Gas
    const [igState, setIgState] = useState({ process: GasProcess.ISOTHERMAL, P1: 100, V1: 1, T1: 300, param: 2 });
    const igResult = useMemo(() => thermoEngine.calculateIdealGasProcess(igState.process, igState.P1, igState.V1, igState.T1, igState.param), [igState]);

    // Cycles
    const [activeCycle, setActiveCycle] = useState<CycleType>(CycleType.RANKINE);

    // Otto
    const [ottoState, setOttoState] = useState({ r: 8, T1: 300, P1: 100, q_in: 800 });
    const ottoResult = useMemo(() => thermoEngine.calculateOttoCycle(ottoState.r, ottoState.T1, ottoState.P1, ottoState.q_in), [ottoState]);

    // Diesel
    const [dieselState, setDieselState] = useState({ r: 18, rc: 2, T1: 300, P1: 100 });
    const dieselResult = useMemo(() => thermoEngine.calculateDieselCycle(dieselState.r, dieselState.rc, dieselState.T1, dieselState.P1), [dieselState]);

    // Brayton
    const [braytonState, setBraytonState] = useState({ rp: 10, T1: 300, P1: 100, T3: 1300 });
    const braytonResult = useMemo(() => thermoEngine.calculateBraytonCycle(braytonState.rp, braytonState.T1, braytonState.T3, braytonState.P1), [braytonState]);

    // Rankine
    const [rankineState, setRankineState] = useState({
        T3: 500,     // Turbine Inlet Temp (C)
        P3: 8000,    // Boiler Pressure (kPa)
        P1: 10,      // Condenser Pressure (kPa)
        w_pump: 8,   // Pump Work Input (kJ/kg)
        q_boiler: 2800, // Boiler Heat Input (kJ/kg)
        m_dot: 50    // Mass flow rate (kg/s)
    });
    const rankineResult = useMemo(() => thermoEngine.calculateRankineCycle(
        rankineState.T3, rankineState.P3, rankineState.P1, rankineState.w_pump, rankineState.q_boiler, rankineState.m_dot
    ), [rankineState]);

    // --- PLOT DATA ---
    const ottoPlotData = useMemo(() => thermoEngine.generateOttoPlotData(ottoState.r, ottoState.P1), [ottoState]);
    const rankinePlotData = useMemo(() => thermoEngine.generateRankinePlotData(rankineState.T3, rankineState.P3, rankineState.P1), [rankineState]);
    const braytonPlotData = useMemo(() => thermoEngine.generateBraytonPlotData(braytonState.rp, 100), [braytonState]);

    // Heat Exchanger
    const [hxState, setHxState] = useState({ mh: 2.5, Cph: 4.18, Th_in: 90, Th_out: 40, mc: 5.0, Cpc: 4.18, Tc_in: 20, UA: 50 });
    const hxResult = useMemo(() => thermoEngine.calculateHeatExchanger(
        hxState.mh, hxState.Cph, hxState.Th_in, hxState.Th_out, hxState.mc, hxState.Cpc, hxState.Tc_in, hxState.UA
    ), [hxState]);

    // Refrigeration (VCC)
    const [vccState, setVccState] = useState({ T_evap: -10, T_cond: 40, m_dot: 0.1 });
    const vccResult = useMemo(() => thermoEngine.calculateVCC(vccState.T_evap, vccState.T_cond, vccState.m_dot), [vccState]);

    // Conduction
    const [condState, setCondState] = useState({
        T_in: 20, T_out: -5,
        layers: [
            { thickness: 0.2, k: 0.8 }, // Brick
            { thickness: 0.05, k: 0.04 } // Insulation
        ]
    });
    const condResult = useMemo(() => thermoEngine.calculateConduction(condState.layers, condState.T_in, condState.T_out), [condState]);

    // Convection
    const [convState, setConvState] = useState({ h: 25, T_surf: 100, T_inf: 25, area: 1 });
    const convResult = useMemo(() => thermoEngine.calculateConvection(convState.h, convState.T_surf, convState.T_inf, convState.area), [convState]);

    // Radiation
    const [radState, setRadState] = useState({ epsilon: 0.8, T_surf: 500, T_surr: 30, area: 1 });
    const radResult = useMemo(() => thermoEngine.calculateRadiation(radState.epsilon, radState.T_surf, radState.T_surr, radState.area), [radState]);

    // Validation
    const [validationState, setValidationState] = useState({ P1: 100, T1: 300, P2: 500, T2: 600, Q: 0, T_surr: 298 });
    const validationResult = useMemo(() => thermoEngine.validateProcess(
        validationState.P1, validationState.T1, validationState.P2, validationState.T2, validationState.Q, validationState.T_surr
    ), [validationState]);


    // --- EXPORT ---
    const handleExport = () => {
        let data: any = { unitSystem, timestamp: new Date().toISOString() };
        switch (activeModule) {
            case ModuleType.IDEAL_GAS:
                data = { ...data, module: 'Ideal Gas', state: igState, result: igResult };
                break;
            case ModuleType.CYCLES:
                data = { ...data, module: 'Cycles', cycleType: activeCycle };
                if (activeCycle === CycleType.RANKINE) data = { ...data, state: rankineState, result: rankineResult };
                else if (activeCycle === CycleType.BRAYTON) data = { ...data, state: braytonState, result: braytonResult };
                else if (activeCycle === CycleType.OTTO) data = { ...data, state: ottoState, result: ottoResult };
                else if (activeCycle === CycleType.DIESEL) data = { ...data, state: dieselState, result: dieselResult };
                break;
            case ModuleType.HEAT_EXCHANGER:
                data = { ...data, module: 'Heat Exchanger', state: hxState, result: hxResult };
                break;
            case ModuleType.REFRIGERATION:
                data = { ...data, module: 'Refrigeration', state: vccState, result: vccResult };
                break;
            case ModuleType.CONDUCTION:
                data = { ...data, module: 'Conduction', state: condState, result: condResult };
                break;
            case ModuleType.CONVECTION:
                data = { ...data, module: 'Convection', state: convState, result: convResult };
                break;
            case ModuleType.RADIATION:
                data = { ...data, module: 'Radiation', state: radState, result: radResult };
                break;
            case ModuleType.VALIDATION:
                data = { ...data, module: 'Validation', state: validationState, result: validationResult };
                break;
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `thermo_${activeModule.toLowerCase()}_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- RENDER HELPERS ---

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">Tp</div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                        Thermodynamics Pro
                    </h1>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={handleExport}
                        className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-2 border-r border-slate-200 pr-3 mr-3"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button
                        onClick={() => setUnitSystem(UnitSystem.SI)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${unitSystem === UnitSystem.SI ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                    >SI Units</button>
                    <button
                        onClick={() => setUnitSystem(UnitSystem.IMPERIAL)}
                        className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${unitSystem === UnitSystem.IMPERIAL ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                    >Imperial</button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">

                {/* Sidebar Nav */}
                <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-1 shrink-0">
                    <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Modules</p>
                    {Object.values(ModuleType).map(module => (
                        <button
                            key={module}
                            onClick={() => setActiveModule(module)}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeModule === module
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {module.replace('_', ' ')}
                        </button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">

                    {/* --- IDEAL GAS MODULE --- */}
                    {activeModule === ModuleType.IDEAL_GAS && (
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-800">Ideal Gas Processes</h2>
                                <Badge status="GREEN" label="Engine Ready" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card title="Process Parameters">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5 w-full">
                                            <label className="text-sm font-medium text-slate-700">Process Type</label>
                                            <select
                                                value={igState.process}
                                                onChange={(e) => setIgState({ ...igState, process: e.target.value as GasProcess })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            >
                                                {Object.values(GasProcess).map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <UnitAwareInput label={`Initial Pressure (P1)`} unitType="pressure" system={unitSystem} value={igState.P1} onChange={v => setIgState({ ...igState, P1: Number(v) })} />
                                        <UnitAwareInput label={`Initial Volume (V1)`} unitType="volume" system={unitSystem} value={igState.V1} onChange={v => setIgState({ ...igState, V1: Number(v) })} />
                                        <UnitAwareInput label={`Initial Temp (T1)`} unitType="temp" system={unitSystem} value={igState.T1} onChange={v => setIgState({ ...igState, T1: Number(v) })} />
                                        <UnitAwareInput label={igState.process === GasProcess.ISOCHORIC ? 'Final Pressure (P2)' : 'Final Volume (V2)'}
                                            unitType={igState.process === GasProcess.ISOCHORIC ? 'pressure' : 'volume'}
                                            system={unitSystem}
                                            value={igState.param}
                                            onChange={v => setIgState({ ...igState, param: Number(v) })}
                                        />
                                    </div>
                                </Card>

                                <Card title="Results" className="bg-slate-50/50">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">Final Pressure</p>
                                                <p className="text-lg font-bold text-slate-800">{igResult.P2.toFixed(2)} kPa</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">Final Temp</p>
                                                <p className="text-lg font-bold text-slate-800">{igResult.T2.toFixed(2)} K</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">Work Done (W)</p>
                                                <p className="text-lg font-bold text-blue-600">{igResult.W.toFixed(2)} kJ</p>
                                            </div>
                                            <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                <p className="text-xs text-slate-500">Heat Transfer (Q)</p>
                                                <p className="text-lg font-bold text-orange-600">{igResult.Q.toFixed(2)} kJ</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* --- CYCLES MODULE --- */}
                    {activeModule === ModuleType.CYCLES && (
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-56 shrink-0 bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm order-2 md:order-1 h-fit sticky top-24">
                                <h2 className="text-xl font-bold text-slate-800 mb-2 px-2">Cycles</h2>
                                {Object.values(CycleType).map(c => (
                                    <TabButton
                                        key={c}
                                        active={activeCycle === c}
                                        onClick={() => setActiveCycle(c)}
                                        className="w-full text-left justify-start py-3"
                                    >
                                        {c}
                                    </TabButton>
                                ))}
                            </div>

                            <div className="flex-1 w-full space-y-6 order-1 md:order-2">
                                {activeCycle === CycleType.RANKINE && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <Card title="Plant Parameters" className="lg:col-span-1">
                                            <div className="space-y-4">
                                                <UnitAwareInput label="Turbine Inlet Temp (T3)" unitType="temp_C" system={unitSystem} value={rankineState.T3} onChange={v => setRankineState({ ...rankineState, T3: Number(v) })} />
                                                <UnitAwareInput label="Boiler Pressure (P3)" unitType="pressure" system={unitSystem} value={rankineState.P3} onChange={v => setRankineState({ ...rankineState, P3: Number(v) })} />
                                                <UnitAwareInput label="Condenser Pressure (P1)" unitType="pressure" system={unitSystem} value={rankineState.P1} onChange={v => setRankineState({ ...rankineState, P1: Number(v) })} />
                                                <UnitAwareInput label="Boiler Heat In (qin)" unitType="specific_energy" system={unitSystem} value={rankineState.q_boiler} onChange={v => setRankineState({ ...rankineState, q_boiler: Number(v) })} />
                                                <UnitAwareInput label="Mass Flow Rate" unitType="mass_flow" system={unitSystem} value={rankineState.m_dot} onChange={v => setRankineState({ ...rankineState, m_dot: Number(v) })} />
                                            </div>
                                        </Card>

                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Efficiency</p>
                                                    <p className="text-2xl font-bold text-emerald-600">{rankineResult.efficiency.toFixed(1)}%</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Net Power</p>
                                                    <p className="text-2xl font-bold text-blue-600">{(rankineResult.power_output / 1000).toFixed(2)} MW</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Turbine Work</p>
                                                    <p className="text-2xl font-bold text-slate-800">{rankineResult.w_turbine.toFixed(1)} kJ/kg</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Net Work</p>
                                                    <p className="text-2xl font-bold text-slate-800">{rankineResult.w_net.toFixed(1)} kJ/kg</p>
                                                </div>
                                            </div>

                                            <Card title="Rankine Cycle Visualization (T-s Diagram)">
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis type="number" dataKey="s" domain={[0, 9]} label={{ value: 'Entropy (s)', position: 'insideBottom', offset: -5 }} />
                                                            <YAxis type="number" dataKey="T" label={{ value: 'Temp (C)', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip />
                                                            {/* Saturation Dome */}
                                                            <Area data={rankinePlotData.dome} type="monotone" dataKey="T" stroke="#cbd5e1" fill="#f1f5f9" strokeWidth={2} isAnimationActive={false} />
                                                            {/* Cycle Process */}
                                                            <Area data={rankinePlotData.cycle} type="linear" dataKey="T" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                                {(activeCycle === CycleType.OTTO || activeCycle === CycleType.DIESEL) && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <Card title="Engine Parameters" className="lg:col-span-1">
                                            <div className="space-y-4">
                                                <InputField label="Compression Ratio (r)" value={activeCycle === CycleType.OTTO ? ottoState.r : dieselState.r}
                                                    onChange={v => activeCycle === CycleType.OTTO ? setOttoState({ ...ottoState, r: Number(v) }) : setDieselState({ ...dieselState, r: Number(v) })} />

                                                {activeCycle === CycleType.DIESEL && (
                                                    <InputField label="Cutoff Ratio (rc)" value={dieselState.rc} onChange={v => setDieselState({ ...dieselState, rc: Number(v) })} />
                                                )}

                                                <UnitAwareInput label="Intake Temp (T1)" unitType="temp" system={unitSystem} value={activeCycle === CycleType.OTTO ? ottoState.T1 : dieselState.T1}
                                                    onChange={v => activeCycle === CycleType.OTTO ? setOttoState({ ...ottoState, T1: Number(v) }) : setDieselState({ ...dieselState, T1: Number(v) })} />

                                                {activeCycle === CycleType.OTTO && (
                                                    <UnitAwareInput label="Heat Added (qin)" unitType="specific_energy" system={unitSystem} value={ottoState.q_in} onChange={v => setOttoState({ ...ottoState, q_in: Number(v) })} />
                                                )}
                                            </div>
                                        </Card>
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Thermal Efficiency</p>
                                                    <p className="text-2xl font-bold text-emerald-600">
                                                        {activeCycle === CycleType.OTTO ? ottoResult.efficiency.toFixed(1) : dieselResult.efficiency.toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Net Work Output</p>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {activeCycle === CycleType.OTTO ? ottoResult.w_net.toFixed(1) : dieselResult.w_net.toFixed(1)} kJ/kg
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">MEP</p>
                                                    <p className="text-2xl font-bold text-slate-800">
                                                        {activeCycle === CycleType.OTTO ? ottoResult.MEP.toFixed(1) : dieselResult.MEP.toFixed(1)} kPa
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Max Temp (T3)</p>
                                                    <p className="text-2xl font-bold text-slate-800">
                                                        {activeCycle === CycleType.OTTO ? ottoResult.T3.toFixed(0) : dieselResult.T3.toFixed(0)} K
                                                    </p>
                                                </div>
                                            </div>

                                            <Card title="PV Diagram (Idealized)">
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={ottoPlotData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="v" type="number" domain={['auto', 'auto']} label={{ value: 'Volume', position: 'insideBottomRight', offset: -5 }} />
                                                            <YAxis dataKey="p" label={{ value: 'Pressure', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip formatter={(val: number) => val.toFixed(1)} />
                                                            <Area type="monotone" dataKey="p" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-2 text-center">* Simplified Ideal Curve</p>
                                            </Card>
                                        </div>
                                    </div>
                                )}

                                {activeCycle === CycleType.BRAYTON && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <Card title="Gas Turbine Parameters" className="lg:col-span-1">
                                            <div className="space-y-4">
                                                <InputField label="Pressure Ratio (rp)" value={braytonState.rp} onChange={v => setBraytonState({ ...braytonState, rp: Number(v) })} />
                                                <UnitAwareInput label="Inlet Pressure (P1)" unitType="pressure" system={unitSystem} value={braytonState.P1} onChange={v => setBraytonState({ ...braytonState, P1: Number(v) })} />
                                                <UnitAwareInput label="Inlet Temp (T1)" unitType="temp" system={unitSystem} value={braytonState.T1} onChange={v => setBraytonState({ ...braytonState, T1: Number(v) })} />
                                                <UnitAwareInput label="Turbine Inlet Temp (T3)" unitType="temp" system={unitSystem} value={braytonState.T3} onChange={v => setBraytonState({ ...braytonState, T3: Number(v) })} />
                                            </div>
                                        </Card>
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Thermal Efficiency</p>
                                                    <p className="text-2xl font-bold text-emerald-600">{braytonResult.efficiency.toFixed(1)}%</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Net Work</p>
                                                    <p className="text-2xl font-bold text-blue-600">{braytonResult.w_net.toFixed(1)} kJ/kg</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Back Work Ratio</p>
                                                    <p className="text-2xl font-bold text-slate-800">{braytonResult.bwr.toFixed(3)}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                    <p className="text-sm text-slate-500">Turbine Out (T4)</p>
                                                    <p className="text-2xl font-bold text-slate-800">{braytonResult.T4.toFixed(0)} K</p>
                                                </div>
                                            </div>

                                            <Card title="Brayton Cycle Visualization (P-v)">
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={braytonPlotData}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="v" type="number" label={{ value: 'Volume', position: 'insideBottomRight', offset: -5 }} />
                                                            <YAxis dataKey="p" label={{ value: 'Pressure', angle: -90, position: 'insideLeft' }} />
                                                            <Tooltip formatter={(val: number) => val.toFixed(1)} />
                                                            <Area type="monotone" dataKey="p" stroke="#f59e0b" fill="#fcd34d" fillOpacity={0.3} />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {/* --- CYCLE STEP-BY-STEP RESULTS --- */}
                    {
                        activeModule === ModuleType.CYCLES && (
                            <div className="max-w-6xl mx-auto mt-6">
                                <Card title="Step-by-Step Process Analysis">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                        {/* Header */}
                                        <div className="font-bold text-slate-500">State</div>
                                        <div className="font-bold text-slate-500">Process</div>
                                        <div className="font-bold text-slate-500">Pressure (kPa)</div>
                                        <div className="font-bold text-slate-500">Temperature (K/C)</div>

                                        {/* Rows */}
                                        {activeCycle === CycleType.RANKINE ? (
                                            <>
                                                {[1, 2, 3, 4].map(s => {
                                                    const state = (rankineResult as any).states[s];
                                                    const processNames = ["Condenser Outlet", "Pump Outlet", "Boiler Outlet", "Turbine Outlet"];
                                                    return (
                                                        <React.Fragment key={s}>
                                                            <div className="p-2 bg-slate-50 rounded font-bold text-slate-700">{s}</div>
                                                            <div className="p-2 text-slate-600 text-sm flex flex-col justify-center">
                                                                <span>{processNames[s - 1]}</span>
                                                                <span className="text-xs text-slate-400">{state.phase}</span>
                                                            </div>
                                                            <div className="p-2 font-mono text-blue-600">{state.P.toFixed(1)}</div>
                                                            <div className="p-2 font-mono text-red-600">{state.T.toFixed(1)} °C</div>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <>
                                                {/* Generic Logic for Otto/Diesel/Brayton */}
                                                {[1, 2, 3, 4].map(s => {
                                                    let T, P;
                                                    // Inputs
                                                    if (s === 1) {
                                                        if (activeCycle === CycleType.OTTO) { T = ottoState.T1; P = ottoState.P1; }
                                                        else if (activeCycle === CycleType.DIESEL) { T = dieselState.T1; P = dieselState.P1; }
                                                        else if (activeCycle === CycleType.BRAYTON) { T = braytonState.T1; P = braytonState.P1; }
                                                    } else {
                                                        const res: any = activeCycle === CycleType.OTTO ? ottoResult :
                                                            activeCycle === CycleType.DIESEL ? dieselResult : braytonResult;
                                                        T = res[`T${s}`];
                                                        P = res[`P${s}`];
                                                    }

                                                    let processName = "";
                                                    if (activeCycle === CycleType.OTTO) {
                                                        processName = s === 1 ? "Intake / Compression Start" : s === 2 ? "Compression End / Ignition" : s === 3 ? "Combustion End / Expansion Start" : "Expansion End / Exhaust";
                                                    } else if (activeCycle === CycleType.DIESEL) {
                                                        processName = s === 1 ? "Intake" : s === 2 ? "Compression End" : s === 3 ? "Fuel Injection End" : "Expansion End";
                                                    } else if (activeCycle === CycleType.BRAYTON) {
                                                        processName = s === 1 ? "Compressor In" : s === 2 ? "Combustor In" : s === 3 ? "Turbine In" : "Turbine Out";
                                                    }

                                                    return (
                                                        <React.Fragment key={s}>
                                                            <div className="p-2 bg-slate-50 rounded font-bold text-slate-700">{s}</div>
                                                            <div className="p-2 text-slate-600 text-sm flex items-center justify-center">{processName}</div>
                                                            <div className="p-2 font-mono text-blue-600">{P ? P.toFixed(1) : '-'}</div>
                                                            <div className="p-2 font-mono text-red-600">{T ? T.toFixed(1) : '-'} K</div>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )
                    }

                    {/* --- HEAT EXCHANGER MODULE --- */}
                    {
                        activeModule === ModuleType.HEAT_EXCHANGER && (
                            <div className="max-w-5xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Heat Exchanger Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Hot Fluid Stream">
                                        <div className="space-y-4">
                                            <UnitAwareInput label="Mass Flow (mh)" unitType="mass_flow" system={unitSystem} value={hxState.mh} onChange={v => setHxState({ ...hxState, mh: Number(v) })} />
                                            <UnitAwareInput label="Specific Heat (Cph)" unitType="specific_heat" system={unitSystem} value={hxState.Cph} onChange={v => setHxState({ ...hxState, Cph: Number(v) })} />
                                            <UnitAwareInput label="Inlet Temp (Th_in)" unitType="temp_C" system={unitSystem} value={hxState.Th_in} onChange={v => setHxState({ ...hxState, Th_in: Number(v) })} />
                                            <UnitAwareInput label="Outlet Temp (Th_out)" unitType="temp_C" system={unitSystem} value={hxState.Th_out} onChange={v => setHxState({ ...hxState, Th_out: Number(v) })} />
                                        </div>
                                    </Card>
                                    <Card title="Cold Fluid Stream & Design">
                                        <div className="space-y-4">
                                            <UnitAwareInput label="Mass Flow (mc)" unitType="mass_flow" system={unitSystem} value={hxState.mc} onChange={v => setHxState({ ...hxState, mc: Number(v) })} />
                                            <UnitAwareInput label="Specific Heat (Cpc)" unitType="specific_heat" system={unitSystem} value={hxState.Cpc} onChange={v => setHxState({ ...hxState, Cpc: Number(v) })} />
                                            <UnitAwareInput label="Inlet Temp (Tc_in)" unitType="temp_C" system={unitSystem} value={hxState.Tc_in} onChange={v => setHxState({ ...hxState, Tc_in: Number(v) })} />
                                            <UnitAwareInput label="UA Value" unitType="conductance" system={unitSystem} value={hxState.UA} onChange={v => setHxState({ ...hxState, UA: Number(v) })} />
                                        </div>
                                    </Card>
                                </div>

                                <Card title="Performance Indices" className="bg-blue-50/50 border-blue-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Effectiveness (ε)</p>
                                            <p className="text-3xl font-bold text-blue-700">{hxResult.epsilon.toFixed(1)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">LMTD</p>
                                            <p className="text-3xl font-bold text-slate-700">{hxResult.LMTD.toFixed(1)} °C</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">Heat Transfer (Q)</p>
                                            <p className="text-3xl font-bold text-orange-600">{hxResult.Q.toFixed(1)} kW</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase">NTU</p>
                                            <p className="text-3xl font-bold text-slate-700">{hxResult.NTU.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                    }

                    {/* --- REFRIGERATION MODULE --- */}
                    {
                        activeModule === ModuleType.REFRIGERATION && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Vapor Compression Cycle</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Cycle Parameters">
                                        <div className="space-y-4">
                                            <UnitAwareInput label="Evaporator Temp" unitType="temp_C" system={unitSystem} value={vccState.T_evap} onChange={v => setVccState({ ...vccState, T_evap: Number(v) })} />
                                            <UnitAwareInput label="Condenser Temp" unitType="temp_C" system={unitSystem} value={vccState.T_cond} onChange={v => setVccState({ ...vccState, T_cond: Number(v) })} />
                                            <UnitAwareInput label="Refrigerant Flow" unitType="mass_flow" system={unitSystem} value={vccState.m_dot} onChange={v => setVccState({ ...vccState, m_dot: Number(v) })} />
                                        </div>
                                    </Card>

                                    <div className="space-y-4">
                                        <Card className="bg-emerald-50 border-emerald-100">
                                            <p className="text-sm font-semibold text-emerald-800">Coefficient of Performance (COP)</p>
                                            <p className="text-4xl font-bold text-emerald-600 mt-2">{vccResult.COP.toFixed(2)}</p>
                                        </Card>
                                        <Card>
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                                                <span className="text-slate-600">Cooling Capacity</span>
                                                <span className="font-bold text-slate-800">{vccResult.capacity.toFixed(2)} kW</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                                                <span className="text-slate-600">Compressor Work</span>
                                                <span className="font-bold text-slate-800">{vccResult.w_c.toFixed(2)} kJ/kg</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Heat Rejected</span>
                                                <span className="font-bold text-slate-800">{vccResult.q_c.toFixed(2)} kJ/kg</span>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* --- CONDUCTION MODULE --- */}
                    {
                        activeModule === ModuleType.CONDUCTION && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Heat Conduction (Composite Wall)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Boundary Conditions">
                                        <div className="space-y-4">
                                            <UnitAwareInput label="Inside Temp" unitType="temp_C" system={unitSystem} value={condState.T_in} onChange={v => setCondState({ ...condState, T_in: Number(v) })} />
                                            <UnitAwareInput label="Outside Temp" unitType="temp_C" system={unitSystem} value={condState.T_out} onChange={v => setCondState({ ...condState, T_out: Number(v) })} />
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-sm font-medium text-slate-700 mb-2">Layers Config</p>
                                                <div className="text-sm text-slate-500 italic">
                                                    Layer editing not fully implemented in UI demo.
                                                    <br />Currently simulating: Brick (20cm) + Insulation (5cm).
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card title="Results" className="bg-orange-50/50 border-orange-100">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Heat Flux (Q/A)</p>
                                                <p className="text-3xl font-bold text-orange-700">{condResult.Q_dot.toFixed(2)} W/m²</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-semibold">Total Resistance (R)</p>
                                                <p className="text-2xl font-bold text-slate-700">{condResult.R_total.toFixed(4)} K/W</p>
                                            </div>
                                            <div className="pt-4 border-t border-slate-100">
                                                <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Temp Distribution</p>
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {condResult.temperatures.map((t, i) => (
                                                        <div key={i} className="bg-white px-3 py-2 rounded border border-slate-200 min-w-[80px] text-center">
                                                            <p className="text-[10px] text-slate-400">Node {i}</p>
                                                            <p className="font-bold text-slate-800">{t.toFixed(1)}°C</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )
                    }

                    {/* --- CONVECTION MODULE --- */}
                    {
                        activeModule === ModuleType.CONVECTION && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Convection Heat Transfer</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Parameters">
                                        <div className="space-y-4">
                                            <UnitAwareInput label="Heat Transfer Coeff (h)" unitType="u_value" system={unitSystem} value={convState.h} onChange={v => setConvState({ ...convState, h: Number(v) })} />
                                            <UnitAwareInput label="Surface Temp (Ts)" unitType="temp_C" system={unitSystem} value={convState.T_surf} onChange={v => setConvState({ ...convState, T_surf: Number(v) })} />
                                            <UnitAwareInput label="Fluid Temp (T∞)" unitType="temp_C" system={unitSystem} value={convState.T_inf} onChange={v => setConvState({ ...convState, T_inf: Number(v) })} />
                                            <UnitAwareInput label="Surface Area" unitType="area" system={unitSystem} value={convState.area} onChange={v => setConvState({ ...convState, area: Number(v) })} />
                                        </div>
                                    </Card>
                                    <Card title="Results" className="bg-blue-50/50 border-blue-100">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Heat Transfer Rate (Q)</p>
                                            <p className="text-4xl font-bold text-blue-700">{convResult.Q_dot.toFixed(2)} W</p>
                                            <p className="text-sm text-slate-400 mt-1">{(convResult.Q_dot / 1000).toFixed(3)} kW</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )
                    }

                    {/* --- RADIATION MODULE --- */}
                    {
                        activeModule === ModuleType.RADIATION && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Radiation Heat Transfer</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card title="Parameters">
                                        <div className="space-y-4">
                                            <InputField label="Emissivity (ε)" value={radState.epsilon} onChange={v => setRadState({ ...radState, epsilon: Number(v) })} />
                                            <UnitAwareInput label="Surface Temp (Ts)" unitType="temp_C" system={unitSystem} value={radState.T_surf} onChange={v => setRadState({ ...radState, T_surf: Number(v) })} />
                                            <UnitAwareInput label="Surroundings Temp (Tsurr)" unitType="temp_C" system={unitSystem} value={radState.T_surr} onChange={v => setRadState({ ...radState, T_surr: Number(v) })} />
                                            <UnitAwareInput label="Surface Area" unitType="area" system={unitSystem} value={radState.area} onChange={v => setRadState({ ...radState, area: Number(v) })} />
                                        </div>
                                    </Card>
                                    <Card title="Results" className="bg-orange-50/50 border-orange-100">
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase font-semibold">Heat Transfer Rate (Q)</p>
                                            <p className="text-4xl font-bold text-orange-700">{radResult.Q_dot.toFixed(2)} W</p>
                                            <p className="text-sm text-slate-400 mt-1">{(radResult.Q_dot / 1000).toFixed(3)} kW</p>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )
                    }

                    {
                        activeModule === ModuleType.VALIDATION && (
                            <div className="max-w-4xl mx-auto space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800">Process Feasibility Validator (2nd Law)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <Card title="Initial State (State 1)">
                                            <div className="space-y-4">
                                                <UnitAwareInput label="Pressure (P1)" unitType="pressure" system={unitSystem} value={validationState.P1} onChange={v => setValidationState({ ...validationState, P1: Number(v) })} />
                                                <UnitAwareInput label="Temperature (T1)" unitType="temp" system={unitSystem} value={validationState.T1} onChange={v => setValidationState({ ...validationState, T1: Number(v) })} />
                                            </div>
                                        </Card>
                                        <Card title="Final State (State 2)">
                                            <div className="space-y-4">
                                                <UnitAwareInput label="Pressure (P2)" unitType="pressure" system={unitSystem} value={validationState.P2} onChange={v => setValidationState({ ...validationState, P2: Number(v) })} />
                                                <UnitAwareInput label="Temperature (T2)" unitType="temp" system={unitSystem} value={validationState.T2} onChange={v => setValidationState({ ...validationState, T2: Number(v) })} />
                                            </div>
                                        </Card>
                                        <Card title="Process Interaction">
                                            <div className="space-y-4">
                                                <UnitAwareInput label="Heat Transfer to System (Q)" unitType="specific_energy" system={unitSystem} value={validationState.Q} onChange={v => setValidationState({ ...validationState, Q: Number(v) })} />
                                                <UnitAwareInput label="Surroundings Temp (T_surr)" unitType="temp" system={unitSystem} value={validationState.T_surr} onChange={v => setValidationState({ ...validationState, T_surr: Number(v) })} />
                                            </div>
                                        </Card>
                                    </div>

                                    <Card title="Feasibility Analysis" className="h-fit">
                                        <div className="flex flex-col items-center justify-center py-6 border-b border-slate-100 mb-6">
                                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 ${validationResult.status === 'IMPOSSIBLE' ? 'bg-red-100 text-red-600' :
                                                validationResult.status === 'REVERSIBLE' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                                                }`}>
                                                <i className={`fa-solid ${validationResult.status === 'IMPOSSIBLE' ? 'fa-ban' : 'fa-check'}`}></i>
                                            </div>
                                            <h3 className={`text-2xl font-bold ${validationResult.status === 'IMPOSSIBLE' ? 'text-red-700' :
                                                validationResult.status === 'REVERSIBLE' ? 'text-blue-700' : 'text-emerald-700'
                                                }`}>
                                                {validationResult.status}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1">According to 2nd Law of Thermodynamics</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                                                <span className="text-sm font-medium text-slate-600">System Entropy Change (ΔSsys)</span>
                                                <span className="font-bold text-slate-800">{validationResult.dS_sys.toFixed(4)} kJ/kg.K</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                                                <span className="text-sm font-medium text-slate-600">Surr. Entropy Change (ΔSsurr)</span>
                                                <span className="font-bold text-slate-800">{validationResult.dS_surr.toFixed(4)} kJ/kg.K</span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-100 border border-slate-200">
                                                <span className="text-sm font-bold text-slate-700">Total Entropy Gen (Sgen)</span>
                                                <span className={`font-bold ${validationResult.S_gen >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {validationResult.S_gen.toFixed(4)} kJ/kg.K
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )
                    }

                </main >
            </div >
        </div >
    );
};

export default Analyzer;
