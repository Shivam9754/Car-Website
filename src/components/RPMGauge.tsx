import { useEffect, useRef } from 'react';

export function RPMGauge({ currentRate }: { currentRate: React.MutableRefObject<number> }) {
  const textRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  
  useEffect(() => {
    let req: number;
    const updateGauge = () => {
      const rate = currentRate.current; // 0.9 to 2.6
      const minRate = 0.9;
      const maxRate = 2.6;
      const normalized = Math.max(0, Math.min(1, (rate - minRate) / (maxRate - minRate)));
      
      const minRPM = 900;
      const maxRPM = 9000;
      const rpm = minRPM + normalized * (maxRPM - minRPM);

      if (textRef.current) {
        textRef.current.innerText = Math.floor(rpm).toLocaleString();
      }

      if (circleRef.current) {
        const circumference = 251.3;
        const fullOffset = 62.8; // 25% empty to make it an open 270-degree gauge arc
        const currentOffset = circumference - (normalized * (circumference - fullOffset));
        circleRef.current.style.strokeDashoffset = currentOffset.toString();
      }
      req = requestAnimationFrame(updateGauge);
    };
    req = requestAnimationFrame(updateGauge);
    return () => cancelAnimationFrame(req);
  }, [currentRate]);

  return (
    <div className="relative w-32 h-32 flex items-center justify-center mx-auto mb-4">
      {/* Gauge SVG */}
      <svg className="w-full h-full" style={{ transform: 'rotate(135deg)' }} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeDasharray="251.3" strokeDashoffset="62.8" strokeLinecap="round" />
        <circle 
          ref={circleRef} 
          cx="50" 
          cy="50" 
          r="40" 
          fill="transparent" 
          stroke="#dc2626" 
          strokeWidth="6" 
          strokeDasharray="251.3" 
          strokeDashoffset="251.3" 
          strokeLinecap="round" 
          style={{ transition: 'stroke-dashoffset 0.05s linear' }} 
          className="drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" 
        />
      </svg>
      
      {/* Dynamic Text Output */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span ref={textRef} className="text-2xl font-mono font-bold tracking-tighter mt-2">900</span>
        <span className="text-[9px] text-red-500 font-bold tracking-widest opacity-80 mt-1">RPM</span>
      </div>
    </div>
  );
}
