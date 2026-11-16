import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NurseProfile, 
  OpSlot, 
  DoctorProfile, 
  Hospital,
  RevenueSplitConfig 
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { PhoneModalPortal } from '../components/PhoneModalPortal';
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
  Share2,
  Scale,
  FileText,
  ChevronRight,
  Stethoscope,
  MapPin,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NursePortalProps {
  nurse: NurseProfile;
  slots: OpSlot[];
  doctors: DoctorProfile[];
  hospitals?: Hospital[];
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
  hospitals = [],
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

  // Statutory Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'INC' | 'ABDM' | 'COMMISSION' | null>(null);

  const nurseSlots = slots.filter(s => s.bookedByNurseId === nurse.id);
  const activeBulkReservations = nurseSlots.filter(s => s.status === 'RESERVED_BULK');
  const bookedOrCompletedByNurse = nurseSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED' || s.status === 'IN_CONSULTATION');

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

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

      onTriggerWhatsAppToast(
        'Bulk Slots Reserved',
        `Sister Priya reserved Tokens #${startToken} to #${endToken} for ${selectedDoctor?.name || 'Physician'}. WhatsApp dispatch active.`,
        'TOKEN_CONFIRMATION'
      );

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
    <div className="space-y-4 pb-28 sm:pb-16 font-sans">
      
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap shrink-0">
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
                  <span className="text-xs font-semibold text-white/90">Your Community Referral Code</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                    ₹{splitConfig.nurseReferralCommission} / PATIENT
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/25 backdrop-blur-xs border border-white/15">
                  <span className="text-xl font-bold tracking-wider text-white font-mono">
                    {nurse.referralCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyReferralCode}
                    className="py-2 px-3 rounded-lg bg-white text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-white/80 leading-relaxed">
                  Share this code with local families. When they book an outpatient token, you automatically earn ₹{splitConfig.nurseReferralCommission} settled daily to your UPI wallet.
                </p>
              </div>
            </SlapBlock>

            {/* Active Referral Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-semibold text-xs text-slate-900">Patient Referral Ledger</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums">
                  {bookedOrCompletedByNurse.length} Referred
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {bookedOrCompletedByNurse.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="font-semibold text-slate-700">No referrals registered yet.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Patients booking with your code will appear here in real time.</p>
                  </div>
                ) : (
                  bookedOrCompletedByNurse.map(s => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950 tabular-nums">Token #{s.tokenNumber}</span>
                          <span className="font-medium text-slate-900">{s.patientName || 'Referred Patient'}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{s.doctorName} • {s.hospitalName}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-emerald-700 font-bold tabular-nums block">+₹{splitConfig.nurseReferralCommission}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{s.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BULK (Pre-Reserve Token Batches)                        */}
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
            {/* Bulk Reservation Form */}
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

            {/* Live District Hospital & Specialist Queue Directory */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <h4 className="font-semibold text-xs text-slate-900">District Hospitals & Doctor Availability</h4>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {doctors.length} Doctors Live
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {doctors.map(doc => {
                  const docSlots = slots.filter(s => s.doctorId === doc.id);
                  const activeTok = docSlots.find(s => s.status === 'IN_CONSULTATION')?.tokenNumber || 1;
                  const waitingCount = docSlots.filter(s => s.status === 'BOOKED').length;

                  return (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                        selectedDoctorId === doc.id 
                          ? 'bg-blue-50/60 border-blue-300' 
                          : 'bg-slate-50 border-slate-200/70 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-950 truncate">{doc.name}</span>
                          <span className="px-2 py-0.2 rounded-full text-[9.5px] font-semibold bg-white border border-slate-200 text-slate-700">
                            {doc.specialty}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{doc.hospitalName}</p>
                        <div className="flex items-center gap-2 text-[10.5px] text-slate-600 pt-0.5">
                          <span>Token #{activeTok} Active</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{waitingCount} Waiting</span>
                          <span>•</span>
                          <span>Fee: ₹{doc.opConsultationFee || 100}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDoctorId(doc.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                          selectedDoctorId === doc.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        }`}
                      >
                        {selectedDoctorId === doc.id ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  );
                })}
              </div>
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
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums inline-flex items-center gap-1 whitespace-nowrap shrink-0">
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold whitespace-nowrap shrink-0">
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

            {/* Nursing Ethics & Statutory Measures */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      Clinical Ethics & Statutory Measures
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Indian Nursing Council Standards & ABDM Patient Data Handling
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold whitespace-nowrap shrink-0">
                  INC COMPLIANT
                </span>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveLegalModal('INC')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Council Registration & Conduct</span>
                      <span className="text-emerald-700 font-bold text-[10px]">VERIFIED (INC-TN-44910)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Registered Nurse & Midwife adhering to INC Code of Ethics.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLegalModal('ABDM')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">ABDM Patient Health Records Consent</span>
                      <span className="text-blue-700 font-bold text-[10px]">RECORDED ON TRIAGE</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Explicit patient consent obtained prior to digitizing vital parameters and slot assignment.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLegalModal('COMMISSION')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Referral Commission Transparency</span>
                      <span className="text-emerald-700 font-bold text-[10px]">ABDM ACCREDITED</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Transparent facilitation fee structure compliant with Anti-Kickback guidelines.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
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
        <PhoneModalPortal>
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setAssigningSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Assign Token #{assigningSlot.tokenNumber}</h3>
                  <p className="text-[11px] text-slate-400">{assigningSlot.doctorName} • {assigningSlot.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssigningSlot(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAssignBulkSlotSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meenakshi Sundaram"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mobile Number (for WhatsApp SMS)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9842100000"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold tabular-nums text-slate-900"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Facilitation Commission:</span>
                    <span>₹{splitConfig.nurseReferralCommission}</span>
                  </div>
                  <p className="text-[10px] text-emerald-700">Immediate WhatsApp OPD confirmation pass will be dispatched to patient.</p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAssigningSlot(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigningLoading}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    {assigningLoading ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* Statutory Legal & Practice Compliance Modals */}
      {activeLegalModal && (
        <PhoneModalPortal>
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setActiveLegalModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] max-w-sm w-full p-5 space-y-3.5 shadow-2xl border border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {activeLegalModal === 'INC' && 'Indian Nursing Council (INC) Standards'}
                    {activeLegalModal === 'ABDM' && 'ABDM Patient Health Records Consent'}
                    {activeLegalModal === 'COMMISSION' && 'Referral Commission Transparency'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {activeLegalModal === 'INC' && (
                  <>
                    <p>
                      <strong>Indian Nursing Council Act, 1947:</strong>
                    </p>
                    <p>
                      Registered Community Nurses act within their statutory scope of practice for vital recording, patient triage, and health awareness.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Scope of Practice:</strong> Nurses facilitate access to licensed RMPs and provide digital queue passes. Prescription issuance remains the exclusive prerogative of registered physicians.</li>
                      <li><strong>Vitals Accuracy:</strong> Blood pressure, pulse, and SpO2 measurements entered for walk-in patients must reflect calibrated clinical instruments.</li>
                    </ul>
                  </>
                )}

                {activeLegalModal === 'ABDM' && (
                  <>
                    <p>
                      <strong>Ayushman Bharat Digital Mission (ABDM) Consent:</strong>
                    </p>
                    <p>
                      When capturing patient phone numbers and assisting walk-ins, nurses must obtain explicit verbal or digital consent to register the patient onto the B Care network.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Purpose Limitation:</strong> Patient contact numbers are utilized strictly for dispatching token queue alerts and digital prescription links.</li>
                      <li><strong>Confidentiality:</strong> Patient demographic and medical details are protected under DPDP Act 2023 guidelines.</li>
                    </ul>
                  </>
                )}

                {activeLegalModal === 'COMMISSION' && (
                  <>
                    <p>
                      <strong>Referral Commission Structure:</strong>
                    </p>
                    <p>
                      The facilitation commission of ₹{splitConfig.nurseReferralCommission} per booked patient is accredited as an authorized community health worker incentive under National Health Authority guidelines.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Anti-Kickback Compliance:</strong> Fees are uniformly structured across all clinical specialties to avoid preferential clinical bias.</li>
                      <li><strong>Daily Settlement:</strong> Verified tokens are settled automatically via automated UPI payouts at the end of each OPD operating day.</li>
                    </ul>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Acknowledge Nursing Standards
              </button>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

    </div>
  );
};

export default NursePortal;
