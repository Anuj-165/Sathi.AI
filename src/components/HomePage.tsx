import { useState } from "react";
import {
  Mic,
  Cpu,
  HeartPulse,
  HardDrive,
  MessageSquare,
} from "lucide-react";
import { useModelProgress } from "./ModelProgressContext";

interface HomeProps {
  onActivateVoice: (autoStart?: boolean) => void;
}

export default function Home({ onActivateVoice }: HomeProps) {
  const [alertMode, setAlertMode] = useState(false);
  const { state } = useModelProgress();

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        alertMode ? "bg-[#1a0505] text-red-100" : "bg-[#050505] text-white"
      }`}
    >
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      
      <section className="relative max-w-6xl mx-auto text-center py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250px] sm:w-[400px] md:w-[500px] h-[250px] sm:h-[400px] md:h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-6 sm:mb-8">
          <Cpu size={12} className="animate-spin-slow" />
          Edge Intelligence Active
        </div>

        {/* TITLE */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight leading-none">
          Sathi
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
            .AI
          </span>
        </h1>

        
        <p className="text-gray-400 max-w-2xl mx-auto mb-12 sm:mb-16 text-sm sm:text-base md:text-lg font-medium leading-relaxed px-2">
          Your resilient companion in crisis. Fully autonomous AI providing
          critical medical guidance — even without internet.
        </p>

        
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 mb-16 sm:mb-20">
          <button
            onClick={() => {
              setAlertMode(true);
              onActivateVoice(true);
            }}
            className="relative group scale-110 sm:scale-125 md:scale-150 transition-transform active:scale-95"
          >
            
            <div className="absolute inset-0 bg-orange-600 blur-[50px] opacity-20 group-hover:opacity-60 transition-opacity rounded-full" />

            
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-700 p-6 sm:p-8 md:p-10 rounded-full shadow-2xl border-4 border-white/20">
              <Mic size={32} className="sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>

            
            <div className="absolute -inset-3 sm:-inset-4 border border-amber-500/30 rounded-full animate-ping opacity-20" />
          </button>

          <div className="text-center">
            <p className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">
              Initiate Voice Protocol
            </p>
            <p className="text-[9px] sm:text-[10px] text-gray-500 mt-2 font-mono">
              ENCRYPTED_LOCAL_INFERENCE_ON
            </p>
          </div>
        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-8 sm:mb-12 text-center">
          Core Capabilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.02] hover:border-amber-500/20 transition-all">
            <HardDrive className="text-amber-500 mb-4 sm:mb-6" size={28} />
            <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">
              Zero-Cloud
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              100% processing in your device. No servers, no tracking.
            </p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.02] hover:border-blue-500/20 transition-all">
            <HeartPulse className="text-blue-400 mb-4 sm:mb-6" size={28} />
            <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">
              Rapid Triage
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Instantly detect severity and guide life-saving steps.
            </p>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 bg-white/[0.02] hover:border-green-500/20 transition-all">
            <MessageSquare className="text-green-400 mb-4 sm:mb-6" size={28} />
            <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-3">
              Offline Chat
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Full AI guidance without internet. Instant responses.
            </p>
          </div>
        </div>
      </section>

      
      <div className="fixed bottom-12 sm:bottom-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-md z-50">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-2xl">
          
          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-gray-400 mb-1 sm:mb-2">
            <span className="uppercase tracking-wider truncate">
              {state.status === "complete"
                ? "All Systems Ready"
                : `Loading ${state.current}`}
            </span>
            <span>{state.progress}%</span>
          </div>

          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-600 transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>

          <p className="text-[8px] sm:text-[9px] text-gray-500 mt-1 sm:mt-2 font-mono">
            {state.status === "downloading" && "Downloading model..."}
            {state.status === "cached" && "Optimizing locally..."}
            {state.status === "complete" && "Offline AI ready"}
          </p>
        </div>
      </div>
    </div>
  );
}