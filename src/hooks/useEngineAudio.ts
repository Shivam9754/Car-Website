import { useEffect, useRef, useState, useCallback } from "react";

export function useEngineAudio(url: string) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isRevving = useRef(false);
  const currentRate = useRef(0.9);
  const reqRef = useRef<number | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initAudio = useCallback(async () => {
    if (audioCtxRef.current) return;
    setLoading(true);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch audio file");
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = audioBuffer;
      source.loop = true;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      source.start(0);
      gainNode.gain.value = 0.4; // Idle volume is slightly lower
      setIsReady(true);
      setLoading(false);

      // The animation frame loop for smooth physics transitions on the audio
      const updateSound = () => {
        if (!sourceRef.current || !gainNodeRef.current) return;
        
        // Physics-like simulation for engine RPM mapping to playbackRate
        if (isRevving.current) {
          // Accelerate faster towards peak
          currentRate.current = Math.min(currentRate.current + 0.04, 2.6);
        } else {
          // Decelerate (engine brake feels a bit slower to drop off)
          currentRate.current = Math.max(currentRate.current - 0.025, 0.9);
        }

        sourceRef.current.playbackRate.value = currentRate.current;
        
        // Slight volume bump when revving
        const volumeTarget = isRevving.current ? 0.8 : 0.4;
        gainNodeRef.current.gain.setTargetAtTime(volumeTarget, ctx.currentTime, 0.1);

        reqRef.current = requestAnimationFrame(updateSound);
      };

      reqRef.current = requestAnimationFrame(updateSound);
      
    } catch (e: any) {
      console.warn("Audio fetch failed, falling back to synthesis:", e);
      // Fallback to synthesizing a low-frequency engine drone
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = audioCtxRef.current || new AudioContextClass();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 60; // Low frequency base

        filter.type = 'lowpass';
        filter.frequency.value = 400; // Muffle it to sound deeper

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        gainNode.gain.value = 0.4;
        
        setIsReady(true);
        setLoading(false);

        const updateSound = () => {
          if (!gainNode) return;
          
          if (isRevving.current) {
            currentRate.current = Math.min(currentRate.current + 0.04, 2.6);
          } else {
            currentRate.current = Math.max(currentRate.current - 0.025, 0.9);
          }

          // Pitch shifting for synthetic oscillator
          osc.frequency.setTargetAtTime(60 * currentRate.current, ctx.currentTime, 0.1);
          filter.frequency.setTargetAtTime(400 + (200 * currentRate.current), ctx.currentTime, 0.1);
          
          const volumeTarget = isRevving.current ? 0.8 : 0.4;
          gainNode.gain.setTargetAtTime(volumeTarget, ctx.currentTime, 0.1);

          reqRef.current = requestAnimationFrame(updateSound);
        };

        reqRef.current = requestAnimationFrame(updateSound);
      } catch (synthError) {
         setError("Failed to initialize audio or synthesis");
         setLoading(false);
      }
    }
  }, [url]);

  const startRev = useCallback(() => { 
    isRevving.current = true; 
    // Resume context if browser suspended it
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, []);
  
  const stopRev = useCallback(() => { 
    isRevving.current = false; 
  }, []);

  useEffect(() => {
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      if (sourceRef.current) sourceRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return { initAudio, startRev, stopRev, isReady, loading, error, currentRate };
}
