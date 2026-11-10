import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, Send, Image as ImageIcon, 
  X, SwitchCamera, CheckCircle2, ShieldCheck, Volume2, Sparkles, FileText
} from 'lucide-react';
import { PhoneModalPortal } from './PhoneModalPortal';

interface TeleconsultRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  specialty: string;
  patientLanguages?: string[];
  onPrescriptionGenerated?: (rx: any) => void;
}

export const TeleconsultRoomModal: React.FC<TeleconsultRoomModalProps> = ({
  isOpen,
  onClose,
  patientName,
  doctorName,
  specialty,
  patientLanguages = ['English', 'Tamil'],
  onPrescriptionGenerated
}) => {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callEnded, setCallEnded] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<{ sender: string; text: string; time: string; image?: string }[]>([
    {
      sender: 'Doctor',
      text: `Vanakkam ${patientName}! I am ${doctorName}. I have your symptoms and vitals on screen. How are you feeling right now?`,
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Initialize Real User Media (Camera & Mic)
  useEffect(() => {
    if (!isOpen || callEnded) return;

    let isMounted = true;

    async function startMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this device');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
        setCameraError(null);

        // Web Audio API for real-time live Mic Visualizer
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch {
          // Audio visualizer fallback
        }
      } catch (err: any) {
        console.warn('Real camera not available or permission denied:', err);
        if (isMounted) {
          setCameraError(err.message || 'Camera permission denied');
        }
      }
    }

    startMedia();

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen, cameraFacing, callEnded]);

  // Handle Mute Mic toggle
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  // Handle Video On/Off toggle
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoActive;
      });
    }
    setVideoActive(!videoActive);
  };

  // Switch Camera Front / Back
  const switchCameraFacing = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !selectedImage) return;

    const newM = {
      sender: 'Patient',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined
    };
    setMessages(prev => [...prev, newM]);
    const sentText = inputMsg;
    setInputMsg('');
    setSelectedImage(null);

    // Realistic intelligent Doctor response
    setDoctorSpeaking(true);
    setTimeout(() => {
      let reply = `Thank you for sharing, ${patientName}. Based on what you describe, I am prescribing a standard regimen and ordering a quick baseline test.`;
      const lower = sentText.toLowerCase();
      if (lower.includes('chest') || lower.includes('heart') || lower.includes('pain')) {
        reply = `I understand. Let's keep your posture relaxed and breathe gently. I am noting down your symptoms and issuing a digital prescription with a follow-up advisory.`;
      } else if (lower.includes('fever') || lower.includes('cough') || lower.includes('cold')) {
        reply = `Understood. Stay hydrated with warm fluids. I am adding an antipyretic and symptomatic relief medicine to your digital prescription now.`;
      } else if (lower.includes('stomach') || lower.includes('vomit') || lower.includes('cramp')) {
        reply = `Please avoid oily or heavy foods. Take plenty of ORS or electral. I have prepared your digital prescription.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'Doctor',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setDoctorSpeaking(false);
    }, 1500);
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setCallEnded(true);
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <PhoneModalPortal>
      <div className="absolute inset-0 z-50 flex flex-col justify-end sm:justify-center bg-slate-950/85 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="bg-slate-950 rounded-t-[32px] sm:rounded-[32px] w-full h-[94%] sm:h-[90%] border border-white/15 shadow-2xl overflow-hidden flex flex-col relative text-white"
        >
          {/* Top Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-white">Live Teleconsultation</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded-full tabular-nums">
                    {formatDuration(callDuration)}
                  </span>
                  {patientLanguages && patientLanguages.length > 0 && (
                    <span className="text-[10px] text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2 py-0.2 rounded-full font-medium">
                      🗣️ {patientLanguages.join(', ')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {doctorName} ({specialty}) ↔ {patientName}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!callEnded ? (
            /* Main Video & Chat View */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 relative">
              {/* Main Doctor Screen */}
              <div className="lg:col-span-2 relative bg-black flex items-center justify-center overflow-hidden">
                {/* Doctor Visual Feed */}
                <div className="w-full h-full relative flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1594824813580-e83cb49f3e46?w=1000"
                    alt="Doctor Stream"
                    className="w-full h-full object-cover filter brightness-95"
                  />

                  {/* Doctor Status Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${doctorSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span className="font-bold text-white">{doctorName}</span>
                    <span className="text-[10px] text-slate-400">• {specialty}</span>
                  </div>

                  {/* Doctor Speaking Caption Indicator */}
                  {doctorSpeaking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-20 left-4 right-4 bg-black/75 backdrop-blur-md border border-white/20 p-2.5 rounded-xl text-center text-xs text-white font-medium"
                    >
                      <span className="text-emerald-400 font-bold mr-1.5">Doctor speaking:</span>
                      "Reviewing symptoms & generating clinical notes..."
                    </motion.div>
                  )}

                  {/* Local Patient Self-View (Picture-in-Picture) */}
                  <div className="absolute bottom-4 right-4 w-32 sm:w-36 h-40 sm:h-44 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-2xl bg-slate-900 group">
                    {videoActive && !cameraError ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                        <VideoOff className="w-7 h-7 mb-1 text-slate-500" />
                        <span className="text-[10px] font-medium leading-tight">
                          {cameraError ? 'Camera in use' : 'Camera off'}
                        </span>
                      </div>
                    )}

                    {/* Patient Label & Real-time Mic Level */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg text-[9.5px]">
                      <span className="font-bold text-white truncate">You</span>
                      {micActive && (
                        <div className="flex items-center gap-0.5">
                          <span
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (micVolume / 100) * 12)}px` }}
                          />
                          <span
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (micVolume / 100) * 16)}px` }}
                          />
                          <span
                            className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, (micVolume / 100) * 10)}px` }}
                          />
                        </div>
                      )}
                      {!micActive && <MicOff className="w-3 h-3 text-rose-400" />}
                    </div>

                    {/* Switch Camera Button on PiP */}
                    <button
                      type="button"
                      onClick={switchCameraFacing}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Switch Camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Floating Glass Action Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl select-none">
                  {/* Mute Mic Toggle */}
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-md'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Stop Video Toggle */}
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      videoActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-md'
                    }`}
                    title={videoActive ? 'Stop Video' : 'Start Video'}
                  >
                    {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  {/* End Call Button */}
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer"
                  >
                    <PhoneOff className="w-3.5 h-3.5" />
                    <span>End Consult</span>
                  </button>
                </div>
              </div>

              {/* Side Consultation Chat */}
              <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col min-h-0 text-xs">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>In-Call Clinical Chat</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full">
                    ABDM Encrypted
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === 'Patient' ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-0.5">
                        {m.sender === 'Patient' ? 'You' : doctorName} • {m.time}
                      </span>
                      <div
                        className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed ${
                          m.sender === 'Patient'
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/80'
                        }`}
                      >
                        <p>{m.text}</p>
                        {m.image && (
                          <div className="mt-2 rounded-xl overflow-hidden border border-slate-700">
                            <img src={m.image} alt="Symptom" className="w-full h-28 object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300')}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Attach Symptom Photo"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Describe symptoms to doctor..."
                    className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-full border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Consultation Completed Summary Screen */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Consultation Completed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Session with {doctorName} ({specialty}) has ended. Duration: {formatDuration(callDuration)}.
                </p>
              </div>

              <div className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Diagnosis:</span>
                  <span className="font-bold text-white">Acute Symptomatic Care</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Prescription ID:</span>
                  <span className="font-bold text-emerald-400">RX-BC-2026-9041</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ABDM Sync:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Linked to ABHA
                  </span>
                </div>
              </div>

              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Prescription</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PhoneModalPortal>
  );
};
