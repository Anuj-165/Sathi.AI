import React, { useEffect, useState, useCallback, useRef } from 'react';
import { initSDK, ModelCategory } from '../runanywhere'; 
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelProgressProvider, useModelProgress } from "./ModelProgressContext";
import { Shield, Zap, Terminal, Database, Cpu, Activity, Lock } from 'lucide-react';

const ALL_CATEGORIES = [
  ModelCategory.Language,
  ModelCategory.SpeechRecognition,
  ModelCategory.SpeechSynthesis,
  ModelCategory.Audio,
];

const GPU_SAFETY_CONFIG = {
  llamacpp: { n_batch: 512, n_ubatch: 128, n_ctx: 2048, flash_attn: true, offload_kqv: true },
  onnx: { executionProviders: ['webgpu'], preferredOutputLocation: 'gpu' },
  stt: { modelType: 'whisper', beamSize: 1 }
};

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStarted, setUserStarted] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const initializing = useRef(false); 

  useEffect(() => {
    if (!userStarted || initializing.current || sdkInitialized) return;
    initializing.current = true;

    const bootSequence = async () => {
      try {
        const initTask = async () => {
          await initSDK(GPU_SAFETY_CONFIG as any);
          if (navigator.storage?.persist) await navigator.storage.persist();
        };
        if ('locks' in navigator) await navigator.locks.request("sathi-sdk-init", initTask);
        else await initTask();
        setSdkInitialized(true);
      } catch (err) { 
        console.error("[Sathi] Critical Boot Error:", err); 
        setSdkInitialized(true); 
      } finally { 
        initializing.current = false; 
      }
    };
    bootSequence();
  }, [userStarted, sdkInitialized]);

  if (!userStarted) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="text-amber-500 animate-pulse" size={32} />
          <span className="text-[10px] font-black tracking-[0.6em] text-zinc-500 uppercase">Resilient Intelligence</span>
        </div>
        <h1 className="text-8xl font-black italic tracking-tighter text-white">
          SATHI<span className="text-amber-500">.AI</span>
        </h1>
        <div className="pt-12">
          <button onClick={() => setUserStarted(true)} className="group relative px-12 py-5 bg-amber-500 text-black font-black uppercase tracking-[0.2em] text-xs transition-all hover:bg-white">
            <span className="relative z-10 flex items-center gap-3"><Zap size={16} fill="black" /> Deploy AI Kernel</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!sdkInitialized) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-mono p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
           <Terminal size={14} className="animate-bounce" /> Initializing Hardware Link
        </div>
        <div className="h-[1px] w-full bg-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 h-full bg-amber-500 w-1/3 animate-[loading-shimmer_1.5s_infinite]" />
        </div>
      </div>
    </div>
  );

  return (
    <ModelProgressProvider>
      <SequentialPreloader>{children}</SequentialPreloader>
    </ModelProgressProvider>
  );
};

const SequentialPreloader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory | null>(ModelCategory.Language);
  const [kernelReady, setKernelReady] = useState(false);
  const queue = useRef([...ALL_CATEGORIES]);

  const handleTaskComplete = useCallback(() => {
    const completed = queue.current.shift();
    console.log(`[Sathi] Sync Complete: ${completed}`);

    if (completed === ModelCategory.Language) {
      setKernelReady(true);
    }

    if (queue.current.length > 0) {
      setActiveCategory(queue.current[0]);
    } else {
      setActiveCategory(null);
    }
  }, []);

  return (
    <>
      
      {activeCategory && (
        <div className="hidden pointer-events-none" aria-hidden="true">
          <DownloadTask 
            key={activeCategory} 
            category={activeCategory} 
            onComplete={handleTaskComplete} 
          />
        </div>
      )}

      {!kernelReady ? (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-10">
          <TacticalLoader 
            category={ModelCategory.Language} 
            index={0} 
            total={ALL_CATEGORIES.length} 
          />
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
};

const TacticalLoader: React.FC<{ category: ModelCategory, index: number, total: number }> = ({ category, index, total }) => {
  const { state } = useModelProgress();
  return (
    <div className="w-full max-w-xl text-center space-y-10">
      <div className="p-5 rounded-3xl border-2 border-amber-500 bg-amber-500/10 inline-block mx-auto">
         <Cpu size={40} className="text-amber-500" />
      </div>
      <div className="space-y-4 text-left">
        <div className="flex justify-between font-mono text-[10px] uppercase">
          <span className="text-zinc-500">Critical Kernel Module</span>
          <span className="text-amber-500 font-black">{Math.round(state.progress)}% Sync</span>
        </div>
        <div className="h-4 bg-zinc-900 border border-white/5 p-1">
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${state.progress}%` }} />
        </div>
        <h2 className="text-4xl font-black uppercase italic text-white text-center">{category}</h2>
      </div>
    </div>
  );
};

const DownloadTask: React.FC<{ category: ModelCategory, onComplete: () => void }> = ({ category, onComplete }) => {
  const { preCache, isCached } = useModelLoader(category);
  const { dispatch } = useModelProgress(); 
  const executionRef = useRef(false);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (executionRef.current) return;
      executionRef.current = true;

      try {
        if (isCached) {
          dispatch({ type: 'SET_PROGRESS', payload: { current: category, progress: 100, status: "complete" } });
          if (active) onComplete();
          return;
        }

        dispatch({ type: 'SET_PROGRESS', payload: { current: category, progress: 1, status: "downloading" } });
        
        const success = await navigator.locks.request("sathi-opfs-lock", { ifAvailable: true }, async (lock) => {
          if (!lock) return true; 
          return await preCache();
        });

        if (active) {
          dispatch({ type: 'SET_PROGRESS', payload: { current: category, progress: 100, status: "complete" } });
          
          setTimeout(() => { if (active) onComplete(); }, 50);
        }
      } catch (err) {
        console.error(`[Sathi] Sync Error (${category}):`, err);
        if (active) onComplete();
      }
    };

    run();
    return () => { active = false; };
  }, [category, preCache, isCached, onComplete, dispatch]); 

  return null;
};