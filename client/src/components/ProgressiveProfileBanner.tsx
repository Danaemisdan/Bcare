import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PatientProfile } from '../types';
import { Check, X, ArrowRight, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProgressiveProfileBannerProps {
  profile: PatientProfile | null;
  onUpdateProfile: (updatedData: Partial<PatientProfile>) => Promise<void>;
  isMobile?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderCustomTrigger?: (onOpen: () => void) => React.ReactNode;
}

export const ProgressiveProfileBanner: React.FC<ProgressiveProfileBannerProps> = ({
  profile,
  onUpdateProfile,
  isMobile = false,
  isOpen,
  onOpenChange,
  renderCustomTrigger
}) => {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const modalOpen = isOpen !== undefined ? isOpen : internalModalOpen;
  const setModalOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    setInternalModalOpen(open);
  };
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'B+');
  const [allergies, setAllergies] = useState<string>(profile?.allergies?.join(', ') || 'Penicillin, Dust');
  const [chronicConditions, setChronicConditions] = useState<string>(profile?.chronicConditions?.join(', ') || 'Type 2 Diabetes, Mild Hypertension');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact || '+91 98450 11223 (Sunita - Spouse)');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const completionPct = profile.profileCompletionPct || 60;
  const isComplete = completionPct >= 100;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile({
        bloodGroup,
        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact
      });
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {renderCustomTrigger ? (
        renderCustomTrigger(() => setModalOpen(true))
      ) : (
        /* Bulletproof Fluid Modern Profile Card */
        <div className="bg-white rounded-2xl border border-zinc-200/90 p-3 sm:p-4 shadow-subtle transition-all">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Icon & Title */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                isComplete 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                {isComplete ? <Check className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-zinc-900 tracking-tight">
                    {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums font-semibold ${
                    isComplete 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}>
                    {completionPct}%
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {isComplete 
                    ? 'Doctors have access to your vitals & allergies' 
                    : 'Add blood group & allergies for doctor safety'}
                </p>
              </div>
            </div>

            {/* Right Action Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white shrink-0 shadow-xs transition-colors"
            >
              <span>{isComplete ? 'View' : 'Complete'}</span>
              <ArrowRight className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          {/* Subtle Progress Bar */}
          {!isComplete && (
            <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden mt-2.5 border border-zinc-200/60">
              <div 
                className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Liquid Glass Animated Drawer Modal (@aakashmehra/components/liquid-glass-button inspired) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[3px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.86, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.88, y: 16, filter: 'blur(6px)' }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                mass: 0.82
              }}
              className="bg-white/95 backdrop-blur-2xl backdrop-saturate-150 rounded-[30px] max-w-sm sm:max-w-md w-full border border-white/90 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.35),inset_0_1.5px_2px_rgba(255,255,255,1)] overflow-hidden relative"
            >
              {/* Specular Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

              <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 tracking-tight">Clinical Medical Profile</h3>
                  <p className="text-[10px] text-zinc-400">Non-blocking progressive medical profiling</p>
                </div>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full text-xs font-medium p-2 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                  >
                    <option value="A+">A positive (A+)</option>
                    <option value="A-">A negative (A-)</option>
                    <option value="B+">B positive (B+)</option>
                    <option value="B-">B negative (B-)</option>
                    <option value="O+">O positive (O+)</option>
                    <option value="O-">O negative (O-)</option>
                    <option value="AB+">AB positive (AB+)</option>
                    <option value="AB-">AB negative (AB-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-zinc-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+91 98450 XXXXX"
                    className="w-full text-xs p-2 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-700 mb-1">
                  Drug & Food Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Sulfa drugs"
                  className="w-full text-xs p-2 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-700 mb-1">
                  Chronic Diagnoses & History
                </label>
                <input
                  type="text"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  placeholder="e.g. Type 2 Diabetes, Hypertension"
                  className="w-full text-xs p-2 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-all shadow-xs"
                >
                  {saving ? 'Updating...' : 'Save Details'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};
