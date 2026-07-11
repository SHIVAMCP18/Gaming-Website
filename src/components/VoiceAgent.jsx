import React, { useState, useEffect, useRef } from "react";
import { HiOutlineMicrophone, HiOutlineX, HiOutlineSparkles, HiOutlineChevronRight, HiOutlineVolumeUp, HiOutlineVolumeOff } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const VoiceAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("disconnected"); // 'disconnected' | 'connecting' | 'ready' | 'listening' | 'speaking' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [transcript, setTranscript] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Aoede"); // 'Aoede' (female celestial) | 'Puck' (male robot)

  // Ref mirror of status to avoid stale closures in WebSocket callbacks
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const wsRef = useRef(null);
  const navigate = useNavigate();
  
  // Audio state refs
  const audioContextRef = useRef(null);
  const micAudioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const activeSourcesRef = useRef([]);
  const nextStartTimeRef = useRef(0);
  const isAgentSpeakingRef = useRef(false);
  const isSessionActiveRef = useRef(false);
  const isClosingRef = useRef(false); // Guard against re-entrant closeSession calls

  // Audio Visualizer Canvas refs
  const canvasRef = useRef(null);
  const volumeRef = useRef(0);
  const animationRef = useRef(null);

  // Speech Recognition (for client-side transcription display)
  const parallelRecRef = useRef(null);

  // UI animation references
  const widgetRef = useRef(null);
  const orbRef = useRef(null);

  // GSAP spinning animation for the floating orb
  useEffect(() => {
    if (orbRef.current) {
      gsap.to(orbRef.current, {
        rotation: 360,
        duration: 12,
        repeat: -1,
        ease: "linear"
      });
    }
  }, [isOpen]);

  // Handle open/close slide transitions
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(widgetRef.current,
        { opacity: 0, scale: 0.85, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  // Canvas Neon Waveform Visualizer render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let phase = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      
      // Clear canvas with transparent bg
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      // Calculate dynamic amplitude based on current audio volume
      const amplitude = Math.max(3, volumeRef.current * 180);

      // 1. Draw glowing background blur wave
      ctx.beginPath();
      ctx.strokeStyle = selectedVoice === "Aoede" ? "rgba(167,139,250,0.2)" : "rgba(6,182,212,0.2)";
      ctx.lineWidth = 6;
      ctx.shadowBlur = 12;
      ctx.shadowColor = selectedVoice === "Aoede" ? "rgba(167,139,250,0.6)" : "rgba(6,182,212,0.6)";

      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 3.5 + phase;
        const dampening = Math.sin((x / width) * Math.PI); // Pin the edges to 0
        const y = centerY + Math.sin(angle) * (amplitude * 0.8) * dampening;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Draw sharp foreground wave
      ctx.beginPath();
      ctx.strokeStyle = status === "speaking" 
        ? (selectedVoice === "Aoede" ? "#F59E0B" : "#EC4899") // Gold / Pink
        : "#10B981"; // Active listening: Emerald Green
      
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = status === "speaking" ? "rgba(245,158,11,0.5)" : "rgba(16,185,129,0.5)";

      for (let x = 0; x < width; x++) {
        const angle = (x / width) * Math.PI * 4 + phase * 1.3;
        const dampening = Math.sin((x / width) * Math.PI);
        const y = centerY + Math.cos(angle) * amplitude * dampening;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Animate phase shift
      phase += status === "speaking" ? 0.08 + volumeRef.current * 0.2 : 0.05;
      
      // Decay volume slowly back to baseline
      if (volumeRef.current > 0.01) {
        volumeRef.current *= 0.90;
      } else {
        volumeRef.current = 0;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    if (isOpen && (status === "speaking" || status === "listening" || status === "ready")) {
      render();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, status, selectedVoice]);

  // Audio resampling utility
  const resample = (inputBuffer, fromSampleRate, toSampleRate) => {
    if (fromSampleRate === toSampleRate) {
      return inputBuffer;
    }
    const ratio = fromSampleRate / toSampleRate;
    const newLength = Math.round(inputBuffer.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = inputBuffer[Math.round(i * ratio)];
    }
    return result;
  };

  // Convert Float32 audio samples to 16-bit PCM (Int16)
  const convertFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    const arrayBuffer = new ArrayBuffer(l * 2);
    const view = new DataView(arrayBuffer);
    for (let i = 0; i < l; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return arrayBuffer;
  };

  // Start the voice streaming session
  const startSession = async (voiceOverride = selectedVoice) => {
    if (isSessionActiveRef.current) closeSession();

    setStatus("connecting");
    setErrorMessage("");
    setTranscript("");
    setUserTranscript("");
    isSessionActiveRef.current = true;

    try {
      // 1. Initialize WebSocket connection to Python FastAPI (passing voice configuration parameter)
      const wsUrl = `ws://localhost:8000/stream-voice?voice=${voiceOverride}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log(`[VoiceAgent] WebSocket open with voice: ${voiceOverride}`);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          mediaStreamRef.current = stream;

          // Initialize Web Audio API contexts
          micAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          if (micAudioContextRef.current.state === "suspended") {
            await micAudioContextRef.current.resume();
          }

          const source = micAudioContextRef.current.createMediaStreamSource(stream);
          const inputSampleRate = micAudioContextRef.current.sampleRate;

          const scriptProcessor = micAudioContextRef.current.createScriptProcessor(2048, 1, 1);
          scriptProcessorRef.current = scriptProcessor;

          scriptProcessor.onaudioprocess = (e) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (isAgentSpeakingRef.current) return; // Silent recording while agent speaks

            const inputData = e.inputBuffer.getChannelData(0);
            const resampled = resample(inputData, inputSampleRate, 16000);
            const pcmBuffer = convertFloat32ToInt16(resampled);

            // Send raw binary PCM audio
            wsRef.current.send(pcmBuffer);
          };

          source.connect(scriptProcessor);
          scriptProcessor.connect(micAudioContextRef.current.destination);

          // Tell backend to start session
          ws.send(JSON.stringify({ type: "start-recording" }));
          
          startSpeechRecognition();

        } catch (err) {
          console.error("[VoiceAgent] Mic access error:", err);
          setErrorMessage("Microphone access denied or error occurred.");
          setStatus("error");
          closeSession();
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        
        switch (msg.type) {
          case "ready":
            setStatus("listening");
            break;

          case "audio":
            // Incoming PCM audio response from Gemini (24kHz)
            const audioData = base64ToArrayBuffer(msg.data);
            playAudioChunk(audioData);
            setStatus("speaking");
            isAgentSpeakingRef.current = true;
            break;

          case "transcript":
            setTranscript((prev) => prev + msg.text);
            break;

          case "navigate":
            console.log("[VoiceAgent] Navigation requested by AI:", msg.path);
            navigate(msg.path);
            break;

          case "interrupted":
            console.log("[VoiceAgent] Interrupted by user");
            stopPlayback();
            setTranscript("");
            setStatus("listening");
            isAgentSpeakingRef.current = false;
            break;

          case "done":
            setStatus("listening");
            isAgentSpeakingRef.current = false;
            break;

          case "error":
            console.error("[VoiceAgent] Backend error:", msg.message);
            setErrorMessage(msg.message);
            setStatus("error");
            closeSession();
            break;

          default:
            break;
        }
      };

      ws.onerror = (err) => {
        console.error("[VoiceAgent] WebSocket error:", err);
        setErrorMessage("Connection to local backend server failed.");
        setStatus("error");
        closeSession();
      };

      ws.onclose = () => {
        console.log("[VoiceAgent] WebSocket connection closed");
        if (statusRef.current !== "error") setStatus("disconnected");
        closeSession();
      };

    } catch (e) {
      console.error("[VoiceAgent] Failed to establish session:", e);
      setStatus("error");
      closeSession();
    }
  };

  // Convert base64 string to ArrayBuffer
  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Play audio chunks back-to-back using AudioContext scheduling
  const playAudioChunk = (pcmDataBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const pcm16 = new Int16Array(pcmDataBuffer);
    const float32 = new Float32Array(pcm16.length);
    let sum = 0;
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
      sum += Math.abs(float32[i]);
    }

    // Set real-time amplitude volume ref for rendering waveform
    volumeRef.current = (sum / pcm16.length) * 1.5;

    // Gemini Live audio outputs at 24000 Hz sample rate
    const audioBuffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
    audioBuffer.getChannelData(0).set(float32);

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    const currentTime = audioContextRef.current.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime;
    }

    activeSourcesRef.current.push(source);
    source.onended = () => {
      const index = activeSourcesRef.current.indexOf(source);
      if (index > -1) {
        activeSourcesRef.current.splice(index, 1);
      }
      if (activeSourcesRef.current.length === 0 && isAgentSpeakingRef.current) {
        setStatus("listening");
        isAgentSpeakingRef.current = false;
      }
    };

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
  };

  // Stop current speech playback
  const stopPlayback = () => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
  };

  // Setup local Web Speech API Recognition for UI text matching
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = false;

      rec.onresult = (e) => {
        const text = e.results[e.results.length - 1][0].transcript;
        setUserTranscript(text);
      };

      rec.onerror = (e) => {
        if (e.error !== "no-speech" && e.error !== "aborted") {
          console.warn("[VoiceAgent] Speech Recognition error:", e.error);
        }
      };

      parallelRecRef.current = rec;
      rec.start();
    } catch (e) {
      console.warn("[VoiceAgent] Speech recognition failed to start", e);
    }
  };

  // Close/cleanup current session
  const closeSession = () => {
    // Guard against re-entrant calls (closing WS triggers onclose which calls closeSession again)
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    isSessionActiveRef.current = false;
    isAgentSpeakingRef.current = false;

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (micAudioContextRef.current) {
      try {
        micAudioContextRef.current.close();
      } catch (e) {}
      micAudioContextRef.current = null;
    }

    if (parallelRecRef.current) {
      try {
        parallelRecRef.current.stop();
      } catch (e) {}
      parallelRecRef.current = null;
    }

    stopPlayback();
    isClosingRef.current = false;
  };

  // Trigger quick context questions
  const askGuide = (text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (isAgentSpeakingRef.current) {
        stopPlayback();
        isAgentSpeakingRef.current = false;
      }
      setTranscript("");
      setUserTranscript(text);
      
      wsRef.current.send(
        JSON.stringify({
          type: "text-turn",
          text: text,
        })
      );
    }
  };

  // Dynamic voice change handler
  const handleVoiceChange = (voice) => {
    setSelectedVoice(voice);
    if (isSessionActiveRef.current) {
      // Re-initialize websocket with new voice
      startSession(voice);
    }
  };

  // Status-dependent styling
  const getOrbStateClass = () => {
    switch (status) {
      case "connecting":
        return "from-violet-600 via-stone-800 to-indigo-600 animate-pulse";
      case "listening":
        return "from-emerald-400 via-cyan-500 to-blue-500 shadow-[0_0_35px_rgba(16,185,129,0.7)]";
      case "speaking":
        return selectedVoice === "Aoede"
          ? "from-yellow-400 via-violet-500 to-pink-500 shadow-[0_0_35px_rgba(234,179,8,0.8)] scale-105"
          : "from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_35px_rgba(6,182,212,0.8)] scale-105";
      case "error":
        return "from-red-600 via-stone-900 to-red-800 border-red-500/50";
      default:
        return "from-stone-800 via-stone-950 to-stone-800 border-white/5 opacity-80";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "SYNCING COGNITIVE LINK...";
      case "listening":
        return "LISTENING TO MULTIVERSE...";
      case "speaking":
        return `${selectedVoice.toUpperCase()} GUIDE SPEAKING...`;
      case "error":
        return "LINK FAILURE";
      default:
        return "GUIDE CONSCIOUSNESS OFFLINE";
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[1000] font-mono">
      {/* Expanded HUD Panel */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="absolute bottom-24 right-0 w-[380px] bg-stone-950/90 border border-white/10 p-6 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-blue-50 relative overflow-hidden"
        >
          {/* Grid decorative backdrop */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`size-3 rounded-full ${status === "disconnected" ? "bg-stone-500" : "bg-violet-400 animate-ping"}`} />
              <div>
                <h4 className="font-zentry text-lg uppercase tracking-widest leading-none">Celestial Guide</h4>
                <p className="text-[9px] text-violet-300 opacity-60 uppercase mt-1">Supabase & Gemini Live Link</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                closeSession();
                setIsOpen(false);
              }}
              className="size-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer text-white"
            >
              <HiOutlineX size={16} />
            </button>
          </div>

          {/* Real-time Neon Waveform visualizer */}
          <div className="bg-stone-900/60 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden h-28">
            <div className={`absolute inset-0 bg-gradient-to-r opacity-5 pointer-events-none ${getOrbStateClass()}`} />
            
            {/* Visualizer Canvas */}
            <canvas 
              ref={canvasRef} 
              className="w-full h-16 bg-transparent relative z-10"
              width={330}
              height={64}
            />

            <p className="text-[10px] tracking-[0.2em] font-bold text-violet-300 uppercase mt-2 relative z-10">
              {getStatusText()}
            </p>
          </div>

          {/* Voice Customizer Selectors */}
          <div className="mt-4 flex items-center justify-between bg-stone-900/40 border border-white/5 px-4 py-2 rounded-xl text-xs relative z-10">
            <span className="text-[10px] text-white/50 uppercase font-bold">Guide Consciousness</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleVoiceChange("Aoede")}
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  selectedVoice === "Aoede" 
                    ? "bg-violet-400 text-black shadow-md shadow-violet-500/20" 
                    : "bg-stone-800 hover:bg-stone-700 text-white"
                }`}
              >
                Aoede (Female)
              </button>
              <button
                onClick={() => handleVoiceChange("Puck")}
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer ${
                  selectedVoice === "Puck" 
                    ? "bg-cyan-400 text-black shadow-md shadow-cyan-500/20" 
                    : "bg-stone-800 hover:bg-stone-700 text-white"
                }`}
              >
                Puck (Male)
              </button>
            </div>
          </div>

          {/* Transcript Display Area */}
          <div className="mt-4 min-h-[90px] max-h-[140px] overflow-y-auto bg-stone-900/40 border border-white/5 p-4 rounded-2xl text-xs flex flex-col gap-2 custom-scrollbar relative z-10">
            {userTranscript && (
              <p className="text-violet-300 italic opacity-85">
                <span className="text-[10px] text-white/40 uppercase font-bold not-italic block mb-1">Your query:</span>
                "{userTranscript}"
              </p>
            )}
            
            {transcript ? (
              <p className="text-white leading-relaxed">
                <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">Guide response:</span>
                {transcript}
              </p>
            ) : (
              !userTranscript && (
                <p className="text-white/30 text-center py-5">
                  Click 'Wake Guide' below and start speaking to search the Multiverse lore, or command me: <span className="text-violet-300 italic">"Take me to the vault"</span>!
                </p>
              )
            )}

            {errorMessage && (
              <p className="text-red-500 font-bold border border-red-500/10 p-2 rounded-lg bg-red-500/5 text-[11px]">
                System Error: {errorMessage}
              </p>
            )}
          </div>

          {/* Quick-Ask Prompts */}
          <div className="mt-4 space-y-2 relative z-10">
            <p className="text-[9px] uppercase text-white/40 font-bold tracking-widest">Recommended Actions</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                disabled={status === "disconnected" || status === "connecting"}
                onClick={() => askGuide("Take me to the Vault")}
                className="flex items-center justify-between p-2 bg-stone-900 border border-white/5 hover:border-violet-300/30 rounded-xl text-left hover:bg-white/5 transition-all text-white disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
              >
                <span>Navigate to Vault</span>
                <HiOutlineChevronRight className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                disabled={status === "disconnected" || status === "connecting"}
                onClick={() => askGuide("Show me active quests")}
                className="flex items-center justify-between p-2 bg-stone-900 border border-white/5 hover:border-violet-300/30 rounded-xl text-left hover:bg-white/5 transition-all text-white disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
              >
                <span>Check Active Quests</span>
                <HiOutlineChevronRight className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="mt-6 flex gap-3 relative z-10">
            {status === "disconnected" || status === "error" ? (
              <button
                onClick={() => startSession()}
                className="w-full bg-violet-400 text-black py-3 rounded-full hover:bg-yellow-400 transition-colors uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(167,139,250,0.3)] border-none"
              >
                <HiOutlineMicrophone size={16} />
                Wake Guide Link
              </button>
            ) : (
              <button
                onClick={closeSession}
                className="w-full bg-red-500/20 text-red-500 border border-red-500/50 py-3 rounded-full hover:bg-red-500/30 transition-colors uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                Disconnect Link
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Orb Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            if (status === "disconnected") {
              startSession();
            }
          }}
          className="group relative size-20 flex items-center justify-center cursor-pointer"
        >
          {/* Glowing Aura Rings */}
          <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/35 transition-all duration-700 animate-pulse" />
          <div className="absolute inset-0 border border-violet-500/20 rounded-full group-hover:scale-120 transition-transform duration-500" />
          
          {/* Pulsing Outer Dynamic Border */}
          <div className={`absolute inset-1.5 rounded-full border-2 border-dashed ${status === "disconnected" ? "border-stone-500/40" : "border-violet-300/40"} animate-spin`} style={{ animationDuration: "12s" }} />

          {/* Inner Glowing Spherical Orb */}
          <div
            ref={orbRef}
            className={`size-14 rounded-full bg-gradient-to-tr ${getOrbStateClass()} border border-white/10 flex items-center justify-center shadow-2xl relative z-10 overflow-hidden group-hover:scale-110 transition-transform duration-300`}
          >
            {/* High-tech internal mesh grid overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
            <HiOutlineMicrophone size={24} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
          </div>
        </button>
      )}
    </div>
  );
};

export default VoiceAgent;
