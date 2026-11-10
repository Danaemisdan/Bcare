import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OpSlot } from '../types';
import { RollingCounter } from './RollingCounter';
import { 
  ArrowRight, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Plus,
  MessageCircle, 
  MapPin, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface FloatingQueueBlimpProps {
  token: OpSlot;
  onTriggerWhatsAppToast?: (
    title: string,
    message: string,
    type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK'
  ) => void;
}

export const FloatingQueueBlimp: React.FC<FloatingQueueBlimpProps> = ({
  token,
  onTriggerWhatsAppToast,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Speed-dial action items inspired by @serafimcloud/components/floating-action-button
  const quickActions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp Pass',
      icon: MessageCircle,
      accent: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25',
      onClick: () => {
        onTriggerWhatsAppToast?.(
          'Live OPD Queue Pass',
          `Token #${token.tokenNumber} live queue pass sent to WhatsApp`,
          'TOKEN_CONFIRMATION'
        );
      },
    },
    {
      id: 'room',
      label: 'Room 104',
      icon: MapPin,
      accent: 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/25',
      onClick: () => {
        onTriggerWhatsAppToast?.(
          'Hospital Room Directions',
          'City Care Hospital, 1st Floor, OPD Wing Room 104',
          'TOKEN_CONFIRMATION'
        );
      },
    },
    {
      id: 'doctor',
      label: 'Dr. Ananya',
      icon: Stethoscope,
      accent: 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25',
      onClick: () => {
        onTriggerWhatsAppToast?.(
          'Doctor Consultation Room',
          'Dr. Ananya Sharma • Cardiology Specialist (MD, DM)',
          'TOKEN_CONFIRMATION'
        );
      },
    },
  ];

  return (
    <>
      {/* Dimmed backdrop when expanded (fills only phone screen) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
            className="absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Floating Action Blimp Container (Pinned inside phone frame above liquid glass bottom nav) */}
      <div 
        className={`absolute bottom-[84px] z-50 pointer-events-auto select-none transition-all duration-300 ${
          isExpanded ? 'left-1/2 -translate-x-1/2 w-[340px]' : 'right-3.5'
        }`}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* ========================================================================= */
            /* COLLAPSED: Apple-Inspired Smart Notification Blimp (21st.dev FAB style)   */
            /* ========================================================================= */
            <motion.div
              key="collapsed-blimp"
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 10 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 28,
              }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="group flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full 
                           bg-slate-950 text-white 
                           border border-slate-700/80 
                           shadow-[0_12px_36px_rgba(0,0,0,0.5),0_2px_10px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)] 
                           hover:border-emerald-400/60 transition-all cursor-pointer"
                title="Active Live OPD Queue Pass (Tap to expand)"
              >
                {/* Live Pulse Indicator & Token Number */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-xs font-extrabold text-white tabular-nums tracking-tight">
                    #{token.tokenNumber}
                  </span>
                </div>

                {/* Hairline Divider */}
                <div className="h-3 w-px bg-slate-700" />

                {/* Doctor Name & Wait Time */}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold text-white leading-tight truncate max-w-[76px]">
                    Dr. Ananya
                  </span>
                  <span className="text-[9px] text-emerald-400 font-semibold leading-none">
                    ~12m wait
                  </span>
                </div>

                {/* Serafim-Style FAB Circular Action Button with Plus */}
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs shrink-0">
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </div>
              </button>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* EXPANDED: Liquid Glass Pop-up Speed-Dial + Apple Wallet Titanium Pass    */
            /* ========================================================================= */
            <motion.div
              key="expanded-blimp"
              initial={{ opacity: 0, scale: 0.86, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.88, y: 16, filter: 'blur(6px)' }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                mass: 0.82,
              }}
              className="flex flex-col items-end gap-2.5 max-w-[340px]"
            >
              {/* Liquid Glass Speed Dial Pills (@aakashmehra/components/liquid-glass-button inspired) */}
              <div className="flex items-center gap-2 pr-1">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.8, y: 12, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 0.8, y: 8, filter: 'blur(3px)' }}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 22,
                        delay: i * 0.04,
                      }}
                      type="button"
                      onClick={action.onClick}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold 
                                 border border-white/35 shadow-[0_4px_16px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.45)] 
                                 backdrop-blur-xl cursor-pointer overflow-hidden ${action.accent}`}
                      title={action.label}
                    >
                      {/* Specular Liquid Glaze Rim */}
                      <span className="absolute inset-x-2 top-0 h-[1px] bg-white/50 pointer-events-none" />
                      <Icon className="w-3.5 h-3.5" />
                      <span>{action.label}</span>
                    </motion.button>
                  );
                })}

                {/* FAB Close Toggle with Elastic Rotation */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsExpanded(false)}
                  className="relative w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 flex items-center justify-center shadow-lg backdrop-blur-xl cursor-pointer transition-colors"
                  title="Close Pass"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* Liquid Glass Apple Wallet Titanium Pass Card */}
              <div className="w-[336px] rounded-[28px] overflow-hidden 
                              bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-[#081713]/95 text-white 
                              border border-white/25 
                              shadow-[0_24px_60px_-10px_rgba(0,0,0,0.6),0_6px_20px_rgba(0,0,0,0.3),inset_0_1.5px_2px_rgba(255,255,255,0.3)] 
                              backdrop-blur-2xl backdrop-saturate-180 
                              p-4.5 space-y-3.5 relative">
                
                {/* Specular Edge Hairline */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

                {/* Header: Title, Live Status & Minimize */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="font-bold text-[11px] tracking-wider uppercase text-emerald-400">
                      LIVE OPD QUEUE PASS
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-emerald-300 text-[10px] font-medium tracking-wide backdrop-blur-md">
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : 'Confirmed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExpanded(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Minimize"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Ticket Info */}
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">
                        Your Token
                      </span>
                      <span className="text-3xl font-semibold tracking-tight text-white tabular-nums">
                        #{token.tokenNumber}
                      </span>
                    </div>
                    <div className="mt-1">
                      <h3 className="font-semibold text-sm text-white flex items-center gap-1.5">
                        <span>Dr. Ananya Sharma</span>
                        <span className="text-xs font-normal text-slate-400">• Cardiology</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-normal">
                        City Care Hospital • Room 104 • {token.time}
                      </p>
                    </div>
                  </div>

                  {/* Live Queue Counter */}
                  <div className="text-right shrink-0">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-300 font-semibold text-sm tabular-nums">
                        <RollingCounter value={2} height={18} />
                        <span className="text-xs text-slate-300 font-normal">ahead</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        ~12 min wait
                      </span>
                    </div>
                  </div>
                </div>

                {/* Perforated Ticket Footer */}
                <div className="pt-2.5 border-t border-dashed border-white/15 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                    PASS: BC-TKN-9842
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerWhatsAppToast?.(
                        'Live OPD Queue Pass',
                        `Live Token Pass #${token.tokenNumber} sent to WhatsApp`,
                        'TOKEN_CONFIRMATION'
                      );
                      setIsExpanded(false);
                    }}
                    className="text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Track on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default FloatingQueueBlimp;
