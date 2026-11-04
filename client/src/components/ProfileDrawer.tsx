import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  User, 
  Stethoscope, 
  Activity, 
  Building2, 
  Users
} from 'lucide-react';
import { PhoneModalPortal } from './PhoneModalPortal';

export interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  currentRole: string;
  activeUserTokens?: any[];
  onOpenFullProfile: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: any) => void;
  onOpenLivePass?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  activeUserTokens = [],
  onOpenFullProfile,
  onLogout,
  onSwitchRole,
  onOpenLivePass
}) => {
  if (!isOpen || !currentUser) return null;

  const roleTitleMap: Record<string, string> = {
    PATIENT: 'Verified Patient',
    NURSE: 'Community Health Nurse',
    DOCTOR: 'Specialist Physician',
    FRANCHISE_ADMIN: 'District Franchise Partner',
    SUPER_ADMIN: 'System Operations Chief'
  };

  const roleDisplay = roleTitleMap[currentRole] || 'Verified Account';
  const hasActiveToken = currentRole === 'PATIENT' && activeUserTokens.length > 0;
  const activeToken = hasActiveToken ? activeUserTokens[0] : null;

  return (
    <PhoneModalPortal>
      <AnimatePresence>
        <div 
          className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.4 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 32,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-h-[85%] bg-white/95 backdrop-blur-2xl backdrop-saturate-150 rounded-t-[32px] border-t border-white/80 shadow-[0_-25px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden text-slate-900 select-none"
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300/90 rounded-full mx-auto my-2.5 shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Specular Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            {/* Header Identity Row */}
            <div className="px-5 pb-3.5 border-b border-slate-100/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-sm ring-1 ring-slate-700/30">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-slate-900 tracking-tight leading-snug">
                    {currentUser.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      {roleDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">• ABDM Linked</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Profile"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto px-4 py-3 space-y-3 scrollbar-none flex-1 overscroll-contain">
              
              {/* Active OPD Ticket Card (If Token Active) */}
              {hasActiveToken && (
                <div 
                  onClick={() => {
                    onClose();
                    if (onOpenLivePass) onOpenLivePass();
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-500/30 shadow-xs cursor-pointer hover:border-emerald-400/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 font-mono">
                        Active Queue Pass
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">Room 204</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold font-mono text-white tracking-tight">
                        Token #{activeToken.tokenNumber}
                      </span>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        City Care Multi-Specialty
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Clock className="w-3 h-3" />
                        <span>~12m wait</span>
                      </span>
                      <span className="block text-[10px] text-emerald-400 mt-1 font-medium group-hover:underline">
                        View Live Pass →
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Quick Meta Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 text-[11px]">Phone / Identity:</span>
                  <span className="font-semibold text-slate-900 font-mono text-xs">+91 {currentUser.phone || '9876543210'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 text-[11px]">Region & Zone:</span>
                  <span className="font-medium text-slate-800 text-[11px]">Coimbatore District • Tamil Nadu</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 pt-1.5 border-t border-slate-200/60">
                  <span className="text-slate-500 text-[11px]">ABDM ABHA Health ID:</span>
                  <span className="font-mono text-emerald-700 font-bold text-[11px]">9842-8812-7491</span>
                </div>
              </div>

              {/* Settings / Navigation Actions */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFullProfile();
                  }}
                  className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-slate-900 block leading-tight">
                        Full Health Profile & ABHA Card
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Digital records, prescriptions & identity pass
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>

              {/* Demo Persona Switcher (Convenient for Pairing & Testing) */}
              {onSwitchRole && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block px-1">
                    Quick Role Switcher
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('PATIENT');
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                        currentRole === 'PATIENT'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 mx-auto mb-1 opacity-80" />
                      Patient
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('NURSE');
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                        currentRole === 'NURSE'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 mx-auto mb-1 opacity-80" />
                      Nurse
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('DOCTOR');
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                        currentRole === 'DOCTOR'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5 mx-auto mb-1 opacity-80" />
                      Doctor
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchRole('FRANCHISE_ADMIN');
                        onClose();
                      }}
                      className={`p-2 rounded-xl text-[10px] font-semibold border transition-all cursor-pointer ${
                        currentRole === 'FRANCHISE_ADMIN'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 mx-auto mb-1 opacity-80" />
                      Franchise
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions: Sign Out */}
            <div className="p-3.5 border-t border-slate-100 bg-white/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ABDM Ayushman Bharat 2.0</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>
    </PhoneModalPortal>
  );
};
