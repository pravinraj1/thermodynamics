
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Activity, Cpu, Wind, Thermometer, Layers
} from 'lucide-react';
import { ModuleType } from './types';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0f1d] text-white font-sans overflow-x-hidden">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Activity size={20} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">THERMOCORE</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
                    {/* Links removed as per user request */}
                </div>
                <button
                    onClick={() => navigate('/app')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                    Launch Analyzer
                </button>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 space-y-8 z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold tracking-wide"
                        >
                            V4.2.0 STABLE RELEASE
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                            Advanced <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Thermodynamic</span> <br />
                            Analysis Platform
                        </h1>
                        <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                            Simulate, Analyze, and Optimize Engineering Heat & Power Systems with Precision. High-fidelity thermal modeling for professional engineers.
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/app')}
                                className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                            >
                                Start Simulation
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-3.5 rounded-lg border border-white/10 hover:bg-white/5 text-gray-300 font-medium transition-colors">
                                View Modules
                            </button>
                        </div>

                        <div className="flex items-center gap-4 pt-8 text-sm text-gray-500">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#0a0f1d]" />
                                ))}
                            </div>
                            <p>Trusted by <span className="text-white font-bold">12,000+</span> Lead Engineers worldwide</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 w-full relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl rounded-full opacity-30" />
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-[#0F1629] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden aspect-video group"
                        >
                            {/* Decorative Graph UI */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
                            <div className="flex justify-between items-center mb-8">
                                <div className="h-2 w-24 bg-gray-700 rounded" />
                                <div className="h-2 w-8 bg-gray-700 rounded" />
                            </div>

                            <div className="relative h-64 w-full border-l border-b border-gray-700/50">
                                <svg className="absolute inset-0 w-full h-full overflow-visible">
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                        d="M0,50 Q150,50 200,150 T400,250"
                                        fill="none" stroke="#3b82f6" strokeWidth="3"
                                        className="drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    />
                                    <motion.path
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.2 }}
                                        transition={{ delay: 1, duration: 1 }}
                                        d="M0,50 Q150,50 200,150 T400,250 L400,250 L0,250 Z"
                                        fill="url(#grad1)"
                                    />
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <motion.circle
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 2 }}
                                        cx="400" cy="250" r="4" fill="#60a5fa"
                                    />
                                </svg>

                                {/* Grid Lines */}
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="absolute left-0 w-full border-t border-dashed border-gray-800" style={{ top: `${i * 20}%` }} />
                                ))}
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="absolute top-0 h-full border-l border-dashed border-gray-800" style={{ left: `${i * 12.5}%` }} />
                                ))}
                            </div>

                            <div className="absolute bottom-4 right-6 text-right">
                                <p className="text-xs text-blue-400 font-mono">CYCLE EFFICIENCY</p>
                                <p className="text-2xl font-bold text-white">42.8%</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </header>

            {/* Modules Section */}
            <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-2">Engineering Modules</h2>
                <p className="text-gray-400 mb-12">Specialized computational tools for diverse thermal analysis needs.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { module: ModuleType.IDEAL_GAS, icon: <Wind size={24} />, title: "Ideal Gas Processes", desc: "Isentropic, Isobaric, and Polytropic modeling with fluid property databases." },
                        { module: ModuleType.CYCLES, icon: <Activity size={24} />, title: "Thermodynamic Cycles", desc: "Rankine, Brayton, and Otto cycle optimization for power generation systems." },
                        { module: ModuleType.HEAT_EXCHANGER, icon: <Cpu size={24} />, title: "Heat Exchangers", desc: "Advanced LMTD and NTU-Effectiveness calculations for industrial systems." },
                        { module: ModuleType.REFRIGERATION, icon: <Thermometer size={24} />, title: "Refrigeration Systems", desc: "COP analysis and real-time refrigerant property mapping for HVAC-R." },
                        { module: ModuleType.CONDUCTION, icon: <Layers size={24} />, title: "Heat Transfer Analysis", desc: "Steady-state conduction, convection, and radiation solver modules." }
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <ModuleCard
                                onClick={() => navigate('/app', { state: { module: item.module } })}
                                icon={item.icon}
                                title={item.title}
                                desc={item.desc}
                            />
                        </motion.div>
                    ))}
                </div>
            </section>



            {/* Footer Call to Action */}
            <div className="py-24 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Engineer Smarter. <br />
                    <span className="text-blue-500">Simulate Faster.</span>
                </h2>
                <p className="text-gray-400 mb-10 max-w-2xl mx-auto">
                    Join thousands of mechanical and chemical engineers building the future of efficient energy systems with ThermoCore.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/app')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        Launch Full Analyzer
                    </button>
                    <button className="px-8 py-3.5 rounded-lg border border-white/10 hover:bg-white/5 text-white font-medium">
                        Request Demo
                    </button>
                </div>
            </div>

        </div>
    );
};

// Helper Components
const ModuleCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) => (
    <motion.div
        whileHover={{ scale: 1.02, borderColor: "rgba(59,130,246,0.4)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-[#0e121e] border border-white/5 p-6 rounded-xl transition-colors group cursor-pointer h-full"
    >
        <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
            {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </motion.div>
);



export default LandingPage;
