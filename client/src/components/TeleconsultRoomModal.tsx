import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Send, Image as ImageIcon, X } from 'lucide-react';
import { PhoneModalPortal } from './PhoneModalPortal';

interface TeleconsultRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  specialty: string;
  patientLanguages?: string[];
}

export const TeleconsultRoomModal: React.FC<TeleconsultRoomModalProps> = ({
  isOpen,
  onClose,
  patientName,
  doctorName,
  specialty,
  patientLanguages = ['English', 'Tamil']
}) => {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string; image?: string }[]>([
    {
      sender: 'Doctor',
      text: `Hello ${patientName}, I am ${doctorName}. I have your symptoms and vitals on screen. How can I assist today?`,
      time: '10:02 AM'
    },
    {
      sender: 'Patient',
      text: 'Doctor, I have developed chest discomfort upon morning exertion, and mild swelling in my lower leg.',
      time: '10:03 AM',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !selectedImage) return;

    const newM = {
      sender: 'Patient',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined
    };
    setMessages([...messages, newM]);
    setInputMsg('');
    setSelectedImage(null);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'Doctor',
          text: 'I see the image clearly. I am reviewing the differential diagnosis and signing your digital prescription.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <PhoneModalPortal>
      <div className="absolute inset-0 z-50 flex flex-col justify-end sm:justify-center bg-zinc-950/85 backdrop-blur-md pointer-events-auto">
        {/* Liquid Glass Animated Room Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 26,
            mass: 0.82
          }}
          className="bg-zinc-950/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] w-full h-[92%] sm:h-[88%] border border-white/20 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.6),inset_0_1.5px_2px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col relative"
        >
        
        {/* Top Header */}
        <div className="px-5 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-zinc-100">Encrypted Teleconsultation</span>
                <span className="text-[10px] tabular-nums font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">1080p HD</span>
                {patientLanguages && patientLanguages.length > 0 && (
                  <span className="text-[10px] text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <span>🗣️</span>
                    <span>{patientLanguages.join(', ')}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                {doctorName} ({specialty}) ↔ {patientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video & Chat Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0">
          
          {/* Main Video Stream */}
          <div className="lg:col-span-2 relative bg-black flex items-center justify-center overflow-hidden">
            <div className="w-full h-full relative flex items-center justify-center">
              {videoActive ? (
                <img 
                  src="https://images.unsplash.com/photo-1594824813580-e83cb49f3e46?w=1000" 
                  alt="Doctor Stream" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-600">
                  <VideoOff className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-zinc-500">Camera feed paused</p>
                </div>
              )}

              {/* Doctor Label */}
              <div className="absolute top-4 left-4 bg-zinc-950/70 backdrop-blur-md px-3 py-1 rounded-xl text-zinc-100 text-xs font-medium border border-zinc-800 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{doctorName}</span>
              </div>

              {/* PiP Local Video */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-40 h-28 sm:h-30 rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-900">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" 
                  alt="Patient Self View" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1.5 left-2 text-[10px] text-zinc-300 font-medium bg-black/70 px-1.5 py-0.5 rounded">
                  You ({patientName})
                </div>
              </div>
            </div>

            {/* Bottom Floating Glass Controls */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-zinc-800/90 shadow-2xl">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-2.5 rounded-xl transition-all ${
                  micActive ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-rose-600 text-white'
                }`}
                title={micActive ? 'Mute Mic' : 'Unmute Mic'}
              >
                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-white" />}
              </button>

              <button
                onClick={() => setVideoActive(!videoActive)}
                className={`p-2.5 rounded-xl transition-all ${
                  videoActive ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-rose-600 text-white'
                }`}
                title={videoActive ? 'Stop Video' : 'Start Video'}
              >
                {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-white" />}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Side Consultation Chat */}
          <div className="bg-zinc-900 border-l border-zinc-800 flex flex-col min-h-0 text-xs">
            <div className="p-3 bg-zinc-950 border-b border-zinc-800 text-zinc-400 font-medium text-xs flex justify-between items-center">
              <span>Doctor Session Chat</span>
              <span className="text-emerald-500">Active</span>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {messages.map((m, idx) => (
                <div 
                  key={idx}
                  className={`flex flex-col ${m.sender === 'Patient' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] tabular-nums text-zinc-500 mb-0.5">{m.sender} • {m.time}</span>
                  <div className={`p-2.5 rounded-xl max-w-[88%] leading-relaxed ${
                    m.sender === 'Patient'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'bg-zinc-800 text-zinc-200 border border-zinc-700/60'
                  }`}>
                    <p>{m.text}</p>
                    {m.image && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-zinc-700">
                        <img src={m.image} alt="Symptom" className="w-full h-28 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300')}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Message doctor..."
                className="flex-1 bg-zinc-900 text-zinc-100 text-xs px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </motion.div>
    </div>
    </PhoneModalPortal>
  );
};
