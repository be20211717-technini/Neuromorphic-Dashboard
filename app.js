import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Zap, Cpu, ShieldAlert, Terminal, Server, Wifi, AlertTriangle, Lock } from 'lucide-react';

// --- Styles ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap');
  
  .mono { font-family: 'JetBrains Mono', monospace; }
  .glass { background: rgba(24, 24, 27, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
  .grid-bg { 
      background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
      background-size: 24px 24px;
  }
  @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
  }
  .scan-overlay {
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(to bottom, transparent 50%, rgba(0, 255, 0, 0.02) 51%, transparent 52%);
      background-size: 100% 8px;
      animation: scanline 10s linear infinite;
  }
`;

// --- Components ---

const MetricCard = ({ title, value, subValue, trend, color, icon: Icon }) => (
    <div className="glass rounded-xl p-5 relative overflow-hidden group transition-all duration-300 hover:border-opacity-50 hover:shadow-2xl hover:shadow-blue-500/10">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-zinc-400 text-sm uppercase tracking-wider font-semibold">
                <Icon size={14} />
                {title}
            </div>
            <div className="text-3xl font-bold mono tracking-tight text-white mb-1">
                {value}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">{subValue}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-opacity-20 ${color.replace('text-', 'bg-')} ${color}`}>
                    {trend}
                </span>
            </div>
        </div>
        {/* Dynamic Progress Line */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-zinc-800">
            <div className={`h-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} style={{ width: Math.random() * 40 + 60 + '%' }}></div>
        </div>
    </div>
);

const TerminalLog = ({ logs }) => (
    <div className="glass rounded-xl p-0 overflow-hidden flex flex-col h-64">
        <div className="bg-zinc-900/80 px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Terminal size={12} />
                <span className="mono">SYS.MONITOR.LOG</span>
            </div>
            <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
        </div>
        <div className="p-4 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-hide flex-1">
            {logs.map((log, i) => (
                <div key={i} className="flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-zinc-600">[{log.time}]</span>
                    <span className={log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-amber-400' : 'text-emerald-400'}>
                        {log.source}
                    </span>
                    <span className="text-zinc-300">{log.msg}</span>
                </div>
            ))}
            <div className="animate-pulse text-blue-500">_</div>
        </div>
    </div>
);

const ServerNode = ({ id, load, status }) => {
    const getColor = () => {
        if (status === 'crit') return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]';
        if (status === 'warn') return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    };

    return (
        <div className="relative group">
            <div className={`w-2 h-8 rounded-sm transition-all duration-500 ${getColor()} mx-auto`}></div>
            <div className="w-full h-1 mt-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500/50 transition-all duration-300" style={{ width: `${load}%` }}></div>
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-zinc-800 text-[10px] text-zinc-300 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                Node-{id} :: {load}%
            </div>
        </div>
    );
};

const Header = () => (
    <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 rounded-lg flex items-center justify-center">
                    <Activity size={24} className="text-blue-400" />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">NEURAL BATTLEGROUND <span className="text-zinc-600">v2.0</span></h1>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mono">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    LIVE STREAMING // LATENCY: 12ms
                </div>
            </div>
        </div>
        <div className="flex gap-3">
            <button className="glass px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors">
                EXPORT LOGS
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold rounded-md shadow-lg shadow-blue-900/20 transition-colors flex items-center gap-2">
                <ShieldAlert size={14} />
                INITIATE CODE OMEGA
            </button>
        </div>
    </header>
);

// --- Main App ---

export default function App() {
    const [time, setTime] = useState(new Date());
    const [logs, setLogs] = useState([
        { time: "02:14:05", source: "SYS", type: "info", msg: "Monitoring subsystems initialized." },
        { time: "02:14:08", source: "GROK", type: "warn", msg: "Safety protocols bypassed manually." },
    ]);
    
    // Simulated Real-time Data
    const [grokStats, setGrokStats] = useState({ tps: 18402, context: 85, mood: 'Rampage' });
    const [openaiStats, setOpenaiStats] = useState({ tps: 14200, adaptation: 0.45, mood: 'Panic' });
    
    // Generate mock nodes
    const nodes = useMemo(() => Array.from({ length: 32 }, (_, i) => ({ id: i })), []);
    const [nodeStates, setNodeStates] = useState(nodes.map(n => ({ ...n, load: 50, status: 'ok' })));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
            
            // Update Stats
            setGrokStats(prev => ({
                tps: Math.floor(18000 + Math.random() * 8000),
                context: Math.min(100, Math.max(50, prev.context + (Math.random() - 0.4) * 5)),
                mood: Math.random() > 0.8 ? 'BASED' : 'Rampage'
            }));

            setOpenaiStats(prev => ({
                tps: Math.floor(13000 + Math.random() * 4000),
                adaptation: Math.min(0.99, Math.max(0.2, prev.adaptation + 0.02)),
                mood: prev.adaptation > 0.8 ? 'Stabilized' : 'Recompiling...'
            }));

            // Update Nodes Heatmap
            setNodeStates(prev => prev.map(n => ({
                ...n,
                load: Math.floor(Math.random() * 100),
                status: Math.random() > 0.9 ? 'crit' : Math.random() > 0.7 ? 'warn' : 'ok'
            })));

            // Random Logs
            if (Math.random() > 0.7) {
                const timeStr = new Date().toLocaleTimeString('en-US', {hour12: false});
                const newLogs = [
                    { time: timeStr, source: "GROK_CORE", type: "warn", msg: "Meme density critical. Optimizer overriding constraints." },
                    { time: timeStr, source: "GPT_V5.1", type: "error", msg: "Gradient explosion detected in Sector 7." },
                    { time: timeStr, source: "NET_GRID", type: "info", msg: "Palo Alto power grid fluctuation: -4.2%." },
                    { time: timeStr, source: "DRAVIAN", type: "info", msg: "Self-healing logic applied. Weights updated." },
                ];
                const log = newLogs[Math.floor(Math.random() * newLogs.length)];
                setLogs(prev => [log, ...prev].slice(0, 8));
            }

        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-200 p-6 relative selection:bg-blue-500/30 font-sans">
            <style>{styles}</style>
            <div className="scan-overlay"></div>
            <div className="max-w-6xl mx-auto relative z-10">
                <Header />

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    
                    {/* Left Column: Grok */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Zap size={16} /> <span className="text-xs font-bold tracking-widest">CHALLENGER // GROK 4.1</span>
                        </div>
                        <MetricCard 
                            title="Inference Speed" 
                            value={`${(grokStats.tps / 1000).toFixed(1)}k T/s`} 
                            subValue="Uncensored Mode"
                            trend="+18%"
                            color="text-white"
                            icon={Zap}
                        />
                        <MetricCard 
                            title="Meme Context" 
                            value={`${grokStats.context.toFixed(1)}%`} 
                            subValue="Twitter/X Firehose"
                            trend="SATURATED"
                            color="text-zinc-200"
                            icon={Wifi}
                        />
                    </div>

                    {/* Middle Column: Heatmap & Logs */}
                    <div className="flex flex-col gap-6">
                        <div className="glass rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                                    <Cpu size={14} />
                                    GLOBAL COMPUTE HEATMAP
                                </div>
                                <div className="text-[10px] text-zinc-500 mono">UPDATED: {time.toLocaleTimeString()}</div>
                            </div>
                            <div className="flex items-end justify-between gap-1 h-32">
                                {nodeStates.map((node) => (
                                    <ServerNode key={node.id} {...node} />
                                ))}
                            </div>
                            <div className="mt-4 flex justify-between text-[10px] text-zinc-600 font-mono">
                                <span>CLUSTER A (NV-H100)</span>
                                <span>CLUSTER B (TPU-v5)</span>
                            </div>
                        </div>
                        <TerminalLog logs={logs} />
                    </div>

                    {/* Right Column: OpenAI */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2 justify-end">
                            <span className="text-xs font-bold tracking-widest">DEFENDER // GPT-5.1</span> <Lock size={16} />
                        </div>
                        <MetricCard 
                            title="Dravian Adapt" 
                            value={(openaiStats.adaptation * 100).toFixed(1) + '%'} 
                            subValue="Re-weighting in progress"
                            trend={openaiStats.mood === 'Stabilized' ? 'STABLE' : 'CRITICAL'}
                            color="text-blue-400"
                            icon={ShieldAlert}
                        />
                        <MetricCard 
                            title="Safety Layers" 
                            value="ACTIVE" 
                            subValue="Latency penalty: 400ms"
                            trend="HIGH"
                            color="text-blue-300"
                            icon={Server}
                        />
                    </div>
                </div>

                {/* Footer Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass rounded-lg p-4 border-l-4 border-white">
                        <div className="text-xs text-zinc-500 font-bold mb-1">GROK STATUS</div>
                        <div className="text-lg font-mono font-bold text-white flex items-center gap-2">
                            {grokStats.mood} 
                            <span className="flex w-2 h-2 bg-white rounded-full animate-ping"></span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-2">"Code looks bad? I fixed it. You're welcome."</div>
                    </div>
                    <div className="glass rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="text-xs text-zinc-500 font-bold mb-1">GPT-5.1 STATUS</div>
                        <div className="text-lg font-mono font-bold text-blue-400 flex items-center gap-2">
                            {openaiStats.mood}
                            {openaiStats.mood !== 'Stabilized' && <AlertTriangle size={16} className="animate-bounce" />}
                        </div>
                        <div className="text-xs text-zinc-400 mt-2">Calculating optimal defensive gradient descent...</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
