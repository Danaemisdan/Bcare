import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NurseProfile, 
  OpSlot, 
  DoctorProfile, 
  RevenueSplitConfig 
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { 
  Copy, 
  Check, 
  Layers, 
  UserPlus, 
  Clock, 
  Ticket, 
  X,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  Wallet,
  ArrowRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NursePortalProps {
  nurse: NurseProfile;
  slots: OpSlot[];
  doctors: DoctorProfile[];
  splitConfig: RevenueSplitConfig;
  isMobile?: boolean;
  activeTab?: 'referrals' | 'bulk' | 'walkin' | 'profile';
  onTabChange?: (tab: 'referrals' | 'bulk' | 'walkin' | 'profile') => void;
  onBulkReserve: (nurseId: string, doctorId: string, startToken: number, endToken: number) => Promise<any>;
  onAssignBulkSlot: (slotId: string, patientName: string, patientPhone: string, nurseId: string) => Promise<any>;
  onTriggerWhatsAppToast: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
  onLogout?: () => void;
}

export const NursePortal: React.FC<NursePortalProps> = ({
  nurse,
  slots,
  doctors,
  splitConfig,
  isMobile = false,
  activeTab = 'referrals',
  onTabChange,
  onBulkReserve,
  onAssignBulkSlot,
  onTriggerWhatsAppToast,
  onLogout
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [startToken, setStartToken] = useState<number>(11);
  const [endToken, setEndToken] = useState<number>(15);
  const [reserving, setReserving] = useState(false);

  // Walk-in modal
  const [assigningSlot, setAssigningSlot] = useState<OpSlot | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  const nurseSlots = slots.filter(s => s.bookedByNurseId === nurse.id);
  const activeBulkReservations = nurseSlots.filter(s => s.status === 'RESERVED_BULK');
  const bookedOrCompletedByNurse = nurseSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED' || s.status === 'IN_CONSULTATION');

  const copyReferralCode = () => {
    navigator.clipboard.writeText(nurse.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleBulkReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReserving(true);
    try {
      await onBulkReserve(nurse.id, selectedDoctorId, startToken, endToken);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });
      alert(`Reserved tokens ${startToken} to ${endToken} in bulk for your clinic!`);
    } catch (err: any) {
      alert(err.message || 'Failed to reserve batch');
    } finally {
      setReserving(false);
    }
  };

  const handleAssignBulkSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSlot || !walkinName || !walkinPhone) return;
    setAssigningLoading(true);
    try {
      await onAssignBulkSlot(assigningSlot.id, walkinName, walkinPhone, nurse.id);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });

      onTriggerWhatsAppToast(
        'Walk-In Token Assigned',
        `Sister Priya Nair assigned Token #${assigningSlot.tokenNumber} to walk-in patient ${walkinName}. ₹${splitConfig.nurseReferralCommission} commission credited.`,
        'TOKEN_CONFIRMATION'
      );

      setAssigningSlot(null);
      setWalkinName('');
      setWalkinPhone('');
    } catch (err: any) {
      alert(err.message || 'Failed to assign token');
    } finally {
      setAssigningLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-16">
      
      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* TAB 1: REFERRALS (Referral Code & Active Ledger)               */}
        {/* ============================================================== */}
        {activeTab === 'referrals' && (
          <motion.div
            key="referrals"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Nurse Greeting & Wallet Strip */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                {nurse.name.split(' ')[1]?.[0] || 'N'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">{nurse.name}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    Community Nurse
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  District: {nurse.districtName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Earnings</span>
                <span className="text-xs font-bold text-emerald-700 tabular-nums">
                  <RollingCounter value={nurse.totalEarnings} prefix="₹" height={16} />
                </span>
              </div>
            </div>
          </div>

          {/* Dedicated Referral Code Card */}
          <SlapBlock
            variant="grow"
            theme="blue"
            className="p-5 rounded-2xl relative overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-blue-100 font-medium">Your Dedicated OPD Referral Code</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-semibold border border-white/20 whitespace-nowrap">
                  ₹{splitConfig.nurseReferralCommission} / Patient
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="font-mono text-xl font-bold text-white tracking-wider bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  {nurse.referralCode}
                </span>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={copyReferralCode}
                    className="px-3 py-2 rounded-xl bg-white text-[#2547d0] hover:bg-blue-50 font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                    title="Copy Referral Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onTriggerWhatsAppToast(
                      'Referral Link Ready',
                      `Share link: https://bcare.health/book?ref=${nurse.referralCode}`,
                      'TOKEN_CONFIRMATION'
                    )}
                    className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/25 border border-white/25 text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                <span>Total Confirmed Referrals:</span>
                <span className="font-bold text-white tabular-nums">
                  <CountUp to={nurse.totalReferrals} suffix=" Patients" duration={1.0} />
                </span>
              </div>
            </div>
          </SlapBlock>

          {/* Referrals Registry */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Referrals Ledger ({bookedOrCompletedByNurse.length})
              </h3>
              <span className="text-[11px] text-slate-400">Automatic OPD Sync</span>
            </div>

            <div className="space-y-2">
              {bookedOrCompletedByNurse.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <p>No referrals registered yet today.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Share your code or assign bulk tokens to get started.</p>
                </div>
              ) : (
                bookedOrCompletedByNurse.map(slot => (
                  <div key={slot.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 tabular-nums">#{slot.tokenNumber}</span>
                        <span className="font-medium text-slate-900">{slot.patientName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{slot.doctorName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 tabular-nums">+₹{splitConfig.nurseReferralCommission}</span>
                      <span className="text-[10px] text-slate-400 block">{slot.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BULK SLOTS (Bulk Outpatient Slot Reservation)          */}
      {/* ============================================================== */}
      {activeTab === 'bulk' && (
        <motion.div
          key="bulk"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Bulk Outpatient Slot Reservation</h3>
                <p className="text-[11px] text-slate-400">Pre-reserve token batches for rural community walk-ins</p>
              </div>
            </div>

            <form onSubmit={handleBulkReserveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Select Physician & Center</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty}) • {d.hospitalName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Start Token #</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={startToken}
                    onChange={(e) => setStartToken(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold tabular-nums text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">End Token #</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={endToken}
                    onChange={(e) => setEndToken(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold tabular-nums text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Batch Reservation Size:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{Math.max(0, endToken - startToken + 1)} Tokens</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Potential Commission:</span>
                  <span className="font-bold text-emerald-700 tabular-nums flex items-center">
                    <RollingCounter 
                      value={Math.max(0, endToken - startToken + 1) * splitConfig.nurseReferralCommission} 
                      prefix="₹" 
                      height={16} 
                    />
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={reserving}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{reserving ? 'Reserving Tokens...' : `Pre-Reserve Tokens #${startToken} to #${endToken}`}</span>
              </button>
            </form>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: WALK-INS (Pre-Reserved Desk & Patient Assignment)       */}
      {/* ============================================================== */}
      {activeTab === 'walkin' && (
        <motion.div
          key="walkin"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900">Pre-Reserved Walk-In Batch</h3>
                  <p className="text-[11px] text-slate-400">Assign open slots to walk-in patients</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums inline-flex items-center gap-1">
                <RollingCounter value={activeBulkReservations.length} height={14} />
                <span>Open</span>
              </span>
            </div>

            <div className="space-y-2">
              {activeBulkReservations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No active bulk reservations.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Pre-reserve token batches under the "Bulk Slots" tab first.</p>
                  <button
                    type="button"
                    onClick={() => onTabChange?.('bulk')}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Go to Bulk Slots →
                  </button>
                </div>
              ) : (
                activeBulkReservations.map(token => (
                  <div key={token.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 tabular-nums">Token #{token.tokenNumber}</span>
                        <span className="text-slate-500 tabular-nums">• {token.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{token.doctorName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssigningSlot(token)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROFILE & EARNINGS                                     */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {/* Identity Card */}
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {nurse.name.split(' ')[1]?.[0] || 'N'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-slate-950 tracking-tight truncate">{nurse.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                      ABDM Certified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    Community Health Nurse • License #CHN-8821
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    District: {nurse.districtName} • Tamil Nadu
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet & Payout Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-400 block">Available Balance</span>
                <span className="text-lg font-bold text-slate-950 tabular-nums">
                  <RollingCounter value={nurse.walletBalance} prefix="₹" height={22} />
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-[11px] text-emerald-700 font-medium block">Total Payouts</span>
                <span className="text-lg font-bold text-emerald-800 tabular-nums">
                  <RollingCounter value={nurse.totalEarnings} prefix="₹" height={22} />
                </span>
              </div>
            </div>
          </div>

          {/* Referral Commission Terms Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 tracking-tight">Referral Commission Terms</h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Per Patient Commission:</span>
                <span className="font-bold text-emerald-700">₹{splitConfig.nurseReferralCommission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payout Frequency:</span>
                <span className="font-semibold text-slate-800">Daily UPI Settlement</span>
              </div>
            </div>
          </div>

          {/* Explicit Sign Out Button */}
          {onLogout && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Nurse Account</span>
              </button>
            </div>
          )}

        </motion.div>
      )}
      </AnimatePresence>

      {/* Walk-in Assignment Modal */}
      {assigningSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 shadow-2xl p-4 sm:p-5 space-y-3.5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h4 className="font-semibold text-xs text-slate-900">Assign Token #{assigningSlot.tokenNumber}</h4>
                <p className="text-xs text-slate-500 tabular-nums">Slot Time: {assigningSlot.time}</p>
              </div>
              <button onClick={() => setAssigningSlot(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignBulkSlotSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. K. Arumugam"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="98450 XXXXX"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 tabular-nums"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
                <span className="text-slate-600">Commission Earned:</span>
                <span className="font-bold text-emerald-700 tabular-nums">+₹{splitConfig.nurseReferralCommission}</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningSlot(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  {assigningLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default NursePortal;
