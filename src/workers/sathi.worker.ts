import { VoicePipeline } from "@runanywhere/web";

// Tactical fix for the "STT provider not available" error:
// We provide a dummy registration so the Pipeline doesn't crash on init.
const dummySTTProvider = {
  id: "stt-bypass",
  initialize: async () => {},
  recognize: async () => ({ text: "" }),
};

let pipeline: any = null;

self.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  console.log(`[SATHI-WORKER] Received Event: ${type}`, payload);

  if (type === "INIT") {
    try {
      if (!pipeline) {
        pipeline = new VoicePipeline();
        
        // Check if the SDK allows manual provider registration to satisfy the internal check
        if (pipeline.registerProvider) {
          pipeline.registerProvider("stt", dummySTTProvider);
        }
      }
      console.log("[SATHI-WORKER] Pipeline Instance Created & STT Bypassed");
      self.postMessage({ type: "READY" });
    } catch (err: any) {
      console.error("[SATHI-WORKER] Init Error:", err);
    }
  }

  if (type === "PROCESS_ALL") {
    console.log("[SATHI-WORKER] Processing Input Text:", payload?.input);
    
    if (!payload?.input) return;

    if (!pipeline) pipeline = new VoicePipeline();
    
    try {
      console.log("[SATHI-WORKER] Executing Tactical LLM Chain...");
      
      await pipeline.processTurn(
        new Float32Array(0), // Empty buffer since we are passing 'text'
        {
          text: payload.input,
          maxTokens: 80,
          systemPrompt: "You are SATHI Tactical AI. Give 3 immediate, high-impact safety actions for this crisis.",
          // The configuration that tells the orchestrator what to ignore
          skipSTT: true, 
          enableLLM: true,
          enableTTS: true,
          // Explicitly disabling features that trigger the missing provider error
          vad: { enabled: false },
          stt: { enabled: false } 
        },
        {
          onResponseToken: (token: string) => {
            // Stream tokens back to the UI for real-time text
            self.postMessage({ type: "TOKEN", payload: token });
          },
          onSynthesisComplete: (audio: Float32Array, sr: number) => {
            console.log("[SATHI-WORKER] TTS Generation Finished.");
            // Send audio buffer back to UI for playback
            self.postMessage({ 
              type: "TTS_COMPLETE", 
              payload: { audio, sr } 
            }, [audio.buffer]); // Using Transferable Objects for performance
          },
        }
      );

      console.log("[SATHI-WORKER] Task Cycle Complete.");

    } catch (err: any) {
      // Catching the specific "Provider not available" error to give better feedback
      if (err.message?.includes("stt")) {
        console.warn("[SATHI-WORKER] STT Check failed. Attempting pure LLM fallback...");
        // If this happens, the SDK is hard-coded to require STT. 
        // We'll need to check the exact version exports for the low-level SDKComponent.
      }
      
      console.error("[SATHI-WORKER] EXECUTION ERROR:", err);
      self.postMessage({ type: "ERROR", payload: err.message });
    }
  }
};

export {};