import { useState, useRef, useEffect, useCallback } from 'react';
import { ModelCategory } from '@runanywhere/web';
import { TextGeneration } from '@runanywhere/web-llamacpp';
import { useModelLoader } from '../hooks/useModelLoader';
import { ModelBanner } from './ModelBanner';
import { Send, StopCircle, ShieldAlert } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  stats?: { tokens: number; tokPerSec: number; latencyMs: number };
}

export function ChatTab() {
  const loader = useModelLoader(ModelCategory.Language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [isEmergency, setIsEmergency] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const cancelRef = useRef<(() => void) | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loader.ensure(); }, []);

  useEffect(() => {
    if (listRef.current) {
      requestAnimationFrame(() => {
        listRef.current!.scrollTop = listRef.current!.scrollHeight;
      });
    }
  }, [messages]);

  const handleCancel = () => cancelRef.current?.();

  function handleGreeting(text: string) {
    const t = text.toLowerCase().trim();
    if (["hi", "hello", "hey", "hii", "helo"].includes(t)) {
      return "Hi 👋 I am Sathi — your emergency assistant. Tell me what happened.";
    }
    return null;
  }

  function detectIntent(text: string) {
    const t = text.toLowerCase();
    if (/(burn|cut|bleed|pain|injury|sprain|fracture)/.test(t)) return "medical";
    if (/(follow|stalk|danger|attack|threat|break in)/.test(t)) return "safety";
    if (/(fire|earthquake|flood|disaster)/.test(t)) return "disaster";
    if (/(panic|anxiety|stress|depressed)/.test(t)) return "mental";
    return "general";
  }

  function getProtocol(text: string) {
    const t = text.toLowerCase();
    if (t.includes("burn")) return "Burn: cool water only, never ice.";
    if (t.includes("sprain") || t.includes("twist")) return "Sprain: RICE method.";
    if (t.includes("bleed") || t.includes("cut")) return "Bleeding: apply pressure.";
    if (t.includes("panic")) return "Panic: focus on slow breathing.";
    return "";
  }

  function cleanFinalOutput(text: string, original: string) {
    let cleaned = text
      .replace(/Step\s*1:/gi, "Step 1:")
      .replace(/Step\s*2:/gi, "\nStep 2:")
      .replace(/Step\s*3:/gi, "\nStep 3:");

    if (/burn/i.test(original)) {
      cleaned = cleaned.replace(/\bice\b/gi, "");
    }

    const lines = cleaned.split("\n");
    const merged: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.toLowerCase().startsWith("step")) {
        if (lines[i + 1]?.toLowerCase().startsWith("protocol")) {
          const protocol = lines[i + 1].replace(/protocol:\s*/i, "").trim();
          line = `${line} ${protocol}`;
          i++;
        }
        merged.push(line);
      }
    }

    return merged.slice(0, 3).join("\n");
  }

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || generating) return;
    setInput('');

    const greet = handleGreeting(text);
    if (greet) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'assistant', text: greet }]);
      return;
    }

    const intent = detectIntent(text);
    const protocol = getProtocol(text);

    let systemPrompt = `
You are Sathi, emergency assistant.

STRICT:
- EXACTLY 3 steps
- Each step  starts on new line
- Start with Step 1, Step 2, Step 3
- Max 10 words per step
- Only actions
- No explanation
`;

    if (intent === "mental") {
      systemPrompt += `
- Calm tone
- Focus on breathing
`;
    }

    if (loader.state !== 'ready') {
      const ok = await loader.ensure();
      if (!ok) return;
    }

    setGenerating(true);
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'assistant', text: '' }]);

    try {
      const { stream, result: resultPromise, cancel } =
        await TextGeneration.generateStream(
          `EMERGENCY (${intent}): ${text}

Protocol:
${protocol}`,
          {
            maxTokens: 80,
            temperature: 0.1,
            topP: 0.8,
            systemPrompt,
          }
        );

      cancelRef.current = cancel;
      let accumulated = '';

      for await (const token of stream) {
        accumulated += token;

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, text: accumulated }];
          }
          return prev;
        });
      }

      const result = await resultPromise;

      let finalText = cleanFinalOutput(result.text || accumulated, text);

      if (!finalText || finalText.length < 10) {
        finalText = accumulated;
      }

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            text: finalText,
            stats: {
              tokens: result.tokensUsed,
              tokPerSec: result.tokensPerSecond,
              latencyMs: result.latencyMs,
            },
          },
        ];
      });

    } catch (err) {
      console.error(err);
    } finally {
      cancelRef.current = null;
      setGenerating(false);
    }
  }, [input, generating, loader]);
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return (
    <div className={`flex flex-col h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] ${isEmergency ? 'bg-black' : 'bg-[#121212]'}`}>

      
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex flex-wrap gap-3 justify-between items-center bg-[#1a1a1a]">

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEmergency ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}`}>
            <ShieldAlert size={18} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold uppercase">Emergency Intel</h2>
            <p className="text-[9px] sm:text-[10px] text-gray-500">OFFLINE MODE</p>
          </div>
        </div>

        <button
          onClick={() => setIsEmergency(!isEmergency)}
          className={`text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-full border whitespace-nowrap ${isEmergency ? 'border-red-500 text-red-500' : 'border-gray-600 text-gray-400'
            }`}
        >
          {isEmergency ? 'HIGH PRIORITY' : 'STANDARD'}
        </button>
      </div>

      <ModelBanner
        state={loader.state}
        progress={loader.progress}
        error={loader.error}
        onLoad={loader.ensure}
        label="SATHI CORE"
      />

      
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div className={`w-fit max-w-[90%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl px-3 sm:px-5 py-2 sm:py-3 text-sm sm:text-base ${msg.role === 'user'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                : 'bg-[#1e1e1e] border border-white/10'
              }`}>

              <div className="text-[10px] sm:text-xs opacity-60 mb-1">
                {msg.role === 'user' ? 'User' : 'Sathi'}
              </div>

              {msg.role === 'assistant' && generating && i === messages.length - 1 ? (
                <div className="whitespace-pre-line text-xs sm:text-sm">
                  <p>{msg.text}</p>
                  <p className="mt-2 text-[10px] sm:text-xs text-gray-400">
                    The following will help you with your emergency situation: {input}
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-line text-xs sm:text-sm">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}

              {msg.stats && (
                <div className="text-[9px] sm:text-[10px] text-gray-500 mt-2">
                  {msg.stats.tokPerSec.toFixed(1)} T/S • {msg.stats.latencyMs.toFixed(0)}ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      
      <div className="p-3 sm:p-4 bg-[#1a1a1a] border-t border-white/5">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2 sm:gap-3 max-w-4xl mx-auto"
        >
          <input
            autoFocus
            type="text"
            placeholder="Describe emergency..."
            className="flex-1 bg-black border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {generating ? (
            <button onClick={handleCancel} className="bg-red-600 px-3 sm:px-4 rounded-xl flex items-center justify-center">
              <StopCircle size={18} />
            </button>
          ) : (
            <button className="bg-gradient-to-r from-amber-500 to-orange-600 px-3 sm:px-4 rounded-xl flex items-center justify-center">
              <Send size={18} />
            </button>
          )}
        </form>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-zinc-500' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`} />
        <span className="text-[10px] uppercase font-bold tracking-tighter">
          {isOnline ? 'Network Standby' : 'Tactical Offline Mode Active'}
        </span>
      </div>
    </div>
  );
}