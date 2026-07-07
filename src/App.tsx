/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Experience, ViewState } from "./components/Experience";
import { useEngineAudio } from "./hooks/useEngineAudio";
import { RPMGauge } from "./components/RPMGauge";
import { Car, Power, Gauge, CircleDot, Info, Volume2, MoveHorizontal } from "lucide-react";
import { cn } from "./lib/utils";

const ENGINE_MP3_URL = "https://cdn.jsdelivr.net/gh/jasonola/VRDV@main/assets/engine.mp3";

const DETAILS_CONTENT: Record<ViewState, { title: string; subtitle: string; description: string }> = {
  front: {
    title: "4.5L V8 Engine Specs",
    subtitle: "Front / Powertrain",
    description: "Features a 4.5 L F136 F V8 engine producing 562 hp. The aggressive front splitters channel air efficiently to create massive downforce."
  },
  rear: {
    title: "Rear Exhaust & Aero",
    subtitle: "Rear Profile",
    description: "Triple exhaust pipes pay homage to Ferrari's racing heritage. The rear diffuser and sculpted decklid keep the car planted at 325 km/h."
  },
  side: {
    title: "Pininfarina Silhouette",
    subtitle: "Aesthetics",
    description: "Sculpted by Pininfarina, the side profile balances elegance with brute force, directing air seamlessly into the rear intakes."
  },
  wheels: {
    title: "20-inch Forged Alloys",
    subtitle: "Wheels & Brakes",
    description: "Equipped with 20-inch lightweight forged alloy wheels (Front: 235/35 ZR20, Rear: 295/35 ZR20) and massive carbon-ceramic brakes for track-ready stopping power."
  }
};

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>("side");
  const [activeTab, setActiveTab] = useState<"showcase" | "history" | "technical">("showcase");
  const { initAudio, startRev, stopRev, isReady, loading, currentRate } = useEngineAudio(ENGINE_MP3_URL);
  const shakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let req: number;
    const updateShake = () => {
      if (shakeRef.current && isReady) {
        const rate = currentRate.current;
        // Start shaking when revving above idle (idle is ~0.9)
        if (rate > 1.05) {
          const intensity = Math.pow((rate - 1.05) / 1.55, 2) * 6; // Max 6px displacement
          const x = (Math.random() * 2 - 1) * intensity;
          const y = (Math.random() * 2 - 1) * intensity;
          shakeRef.current.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
        } else {
          shakeRef.current.style.transform = 'scale(1.02) translate(0px, 0px)';
        }
      }
      req = requestAnimationFrame(updateShake);
    };
    req = requestAnimationFrame(updateShake);
    return () => cancelAnimationFrame(req);
  }, [currentRate, isReady]);

  const views: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: "front", label: "Front / Engine", icon: <Car className="w-5 h-5" /> },
    { id: "side", label: "Side Profile", icon: <MoveHorizontal className="w-5 h-5" /> },
    { id: "rear", label: "Rear / Exhaust", icon: <Gauge className="w-5 h-5" /> },
    { id: "wheels", label: "Wheels / Alloys", icon: <CircleDot className="w-5 h-5" /> },
  ];

  return (
    <div className="relative w-full h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col overflow-hidden select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,0)_0%,rgba(0,0,0,1)_90%)]"></div>
      </div>

      {/* 3D Canvas Background */}
      <div ref={shakeRef} className="absolute inset-0 cursor-move z-0 scale-[1.02] origin-center">
        <Experience activeView={activeView} />
      </div>

      {/* Intro / Ignition Overlay - Required for Audio Context */}
      {!isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050505]/90 backdrop-blur-md transition-opacity duration-500">
          <div className="text-center flex flex-col items-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 uppercase text-white">
              Forza Web Concept
            </h1>
            <p className="text-white/50 max-w-md mx-auto mb-10 text-sm leading-relaxed font-light px-4 tracking-wide">
              Explore the 3D model, transition viewpoints, and interact with the physical audio simulation. Make sure your volume is on.
            </p>
            <button
              onClick={initAudio}
              disabled={loading}
              className={cn(
                "group relative flex items-center gap-3 px-10 py-4 bg-white hover:bg-zinc-200 text-black transition-all rounded-sm font-bold uppercase tracking-[0.2em] overflow-hidden text-[10px]",
                loading && "opacity-70 cursor-not-allowed"
              )}
            >
              <Power className={cn("w-4 h-4 transition-transform group-hover:scale-110", loading && "animate-pulse")} />
              <span className="relative z-10">{loading ? "Starting Engine..." : "Turn Ignition"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main UI Overlay - Shown when Ignition is pressed */}
      {isReady && (
        <div className="relative z-10 flex flex-col h-full pointer-events-none">
          {/* Header */}
          <nav className="flex justify-between items-center px-6 py-6 md:px-12 md:py-8 pointer-events-auto">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-12 bg-red-600 flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                <span className="font-black text-xl italic text-white">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tighter uppercase text-white">Ferrari 458 Italia</h1>
                <p className="text-[10px] text-red-500 font-bold tracking-[0.2em] uppercase leading-none mt-1">Supercar Collection</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-8 text-[11px] font-semibold tracking-widest uppercase text-white/40 pointer-events-auto">
              <span onClick={() => setActiveTab("showcase")} className={cn("cursor-pointer transition-colors", activeTab === "showcase" ? "text-white border-b border-red-600 pb-1" : "hover:text-white")}>Showcase</span>
              <span onClick={() => setActiveTab("history")} className={cn("cursor-pointer transition-colors", activeTab === "history" ? "text-white border-b border-red-600 pb-1" : "hover:text-white")}>History</span>
              <span onClick={() => setActiveTab("technical")} className={cn("cursor-pointer transition-colors", activeTab === "technical" ? "text-white border-b border-red-600 pb-1" : "hover:text-white")}>Technical</span>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 flex relative">
            
            {/* History Overlay */}
            {activeTab === "history" && (
              <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 pointer-events-auto z-20 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-2xl">
                  <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6 text-white">The Italia Legacy</h2>
                  <p className="text-white/70 leading-relaxed mb-6">
                    Replacing the legendary F430, the 458 Italia was officially unveiled at the 2009 Frankfurt Motor Show. It represented a massive generational leap forward in both aerodynamics and powertrain development, directly incorporating Formula 1 engineering expertise.
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    Designed by Pininfarina and Michael Schumacher, its body is highly aerodynamic, producing 140 kg of downforce at 200 km/h without relying on a large rear wing. This legendary supercar marked the end of an era, being the last naturally aspirated mid-engine V8 Ferrari produced in Maranello.
                  </p>
                </div>
              </div>
            )}

            {/* Technical Overlay */}
            {activeTab === "technical" && (
              <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12 pointer-events-auto z-20 animate-in fade-in zoom-in-95 duration-500 text-white">
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-xl font-bold uppercase tracking-tighter mb-6 text-red-500">Powertrain Specs</h3>
                    <ul className="space-y-4">
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Engine</span>
                         <span className="font-mono text-lg">4.5 L F136 F V8</span>
                       </li>
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Power</span>
                         <span className="font-mono text-lg">562 hp @ 9,000 rpm</span>
                       </li>
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Torque</span>
                         <span className="font-mono text-lg">398 lb-ft @ 6,000 rpm</span>
                       </li>
                       <li className="flex justify-between pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Transmission</span>
                         <span className="font-mono text-lg">7-speed dual-clutch</span>
                       </li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                    <h3 className="text-xl font-bold uppercase tracking-tighter mb-6 text-red-500">Chassis & Performance</h3>
                    <ul className="space-y-4">
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Curb Weight</span>
                         <span className="font-mono text-lg">1,485 kg (3,274 lb)</span>
                       </li>
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Length / Width</span>
                         <span className="font-mono text-lg">4,527 mm / 1,937 mm</span>
                       </li>
                       <li className="flex justify-between border-b border-white/10 pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">0-100 km/h (62 mph)</span>
                         <span className="font-mono text-lg">3.4 seconds</span>
                       </li>
                       <li className="flex justify-between pb-3">
                         <span className="text-white/50 text-sm tracking-widest uppercase flex items-center">Top Speed</span>
                         <span className="font-mono text-lg">325 km/h (202 mph)</span>
                       </li>
                    </ul>
                  </div>
                </div>
               </div>
            )}

            {/* Left Stats Rail */}
            <div className={cn("hidden md:flex w-48 flex-col justify-center px-12 space-y-12 transition-opacity duration-500 z-10", activeTab === "showcase" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">0-100 KM/H</p>
                <p className="text-3xl font-light italic tracking-tight">3.4 <span className="text-sm">SEC</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">TOP SPEED</p>
                <p className="text-3xl font-light italic tracking-tight">325 <span className="text-sm">KM/H</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">POWER</p>
                <p className="text-3xl font-light italic tracking-tight">562 <span className="text-sm">CV</span></p>
              </div>
            </div>

            {/* Central area is visually handled by the 3D Canvas in background */}
            <div className="flex-1"></div>

            {/* Right Audio Rail */}
            <div className={cn("hidden md:flex w-64 flex-col justify-center px-8 transition-opacity duration-500 z-10", activeTab === "showcase" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex justify-between items-end mb-4 text-white">
                  <span className="text-[10px] font-bold text-red-500">AUDIO ENGINE</span>
                  <Volume2 className="w-4 h-4 text-white/50" />
                </div>
                
                <RPMGauge currentRate={currentRate} />
                
                <p className="mt-4 text-[9px] text-white/40 uppercase tracking-widest text-center">Synthesis Active</p>
              </div>
            </div>
          </main>

          {/* Bottom Controls Layout */}
          <footer className={cn("px-6 pb-6 md:px-12 md:pb-12 flex justify-between items-end transition-opacity duration-500 z-10", activeTab === "showcase" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
            {/* Camera Presets */}
            <div className="flex flex-col md:flex-row gap-2">
              {views.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={cn(
                    "px-4 py-2 md:px-6 md:py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors text-left md:text-center",
                    activeView === v.id
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="hidden md:inline mr-2">0{i + 1}.</span>
                  {v.label}
                </button>
              ))}
            </div>

            {/* Gas Pedal Control */}
            <div className="flex flex-col items-center group">
              <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] mb-4 text-center">
                <span className="hidden md:inline">Hold to </span>Rev Engine
              </p>
              <button
                onMouseDown={startRev}
                onMouseUp={stopRev}
                onMouseLeave={stopRev}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startRev();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  stopRev();
                }}
                className="w-16 h-24 md:w-24 md:h-40 bg-[#1A1A1A] rounded-t-3xl rounded-b-lg border-2 border-white/10 relative p-1 shadow-2xl overflow-hidden cursor-pointer active:translate-y-2 transition-transform duration-75 focus:outline-none"
                aria-label="Gas Pedal"
              >
                {/* Tread pattern */}
                <div className="absolute inset-2 border border-white/5 rounded-t-2xl rounded-b-sm flex flex-col justify-between py-2 md:py-4 opacity-50 pointer-events-none">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="h-1 bg-white/20 mx-2 md:mx-4 rounded-full"></div>
                  ))}
                </div>
                {/* Surface shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              </button>
            </div>

            {/* Detail View */}
            <div className="hidden lg:block w-64 text-right">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">{DETAILS_CONTENT[activeView].subtitle}</p>
              <h3 className="text-xl font-bold uppercase tracking-tighter">{DETAILS_CONTENT[activeView].title}</h3>
              <p className="text-xs text-white/50 mt-2 leading-relaxed">
                {DETAILS_CONTENT[activeView].description}
              </p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
