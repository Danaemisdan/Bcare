import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NurseProfile, 
  OpSlot, 
  DoctorProfile, 
  Hospital,
  RevenueSplitConfig,
  VideoAppointment
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { PhoneModalPortal } from '../components/PhoneModalPortal';
import { TeleconsultRoomModal } from '../components/TeleconsultRoomModal';
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
  Sparkles,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  UserCheck,
  Calendar,
  Video,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NursePortalProps {
  nurse: NurseProfile;
  slots: OpSlot[];
  doctors: DoctorProfile[];
  hospitals?: Hospital[];
  videoAppointments?: VideoAppointment[];
  onBookVideoConsultation?: (bookingData: any) => Promise<any>;
  splitConfig: RevenueSplitConfig;
  isMobile?: boolean;
  activeTab?: 'referrals' | 'bulk' | 'walkin' | 'profile';
  onTabChange?: (tab: 'referrals' | 'bulk' | 'walkin' | 'profile') => void;
  onBulkReserve: (nurseId: string, doctorId: string, startToken: number, endToken: number, date?: string, time?: string) => Promise<any>;
  onAssignBulkSlot: (slotId: string, patientName: string, patientPhone: string, nurseId: string) => Promise<any>;
  onTriggerWhatsAppToast: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
  onLogout?: () => void;
}

export const NursePortal: React.FC<NursePortalProps> = ({
  nurse,
  slots,
  doctors,
  hospitals = [],
  videoAppointments = [],
  onBookVideoConsultation,
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
  const [appointmentDate, setAppointmentDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');

  // Walk-in modal
  const [assigningSlot, setAssigningSlot] = useState<OpSlot | null>(null);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  // Statutory Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'INC' | 'ABDM' | 'COMMISSION' | null>(null);

  // Search & Filter state for Walk-In tokens
  const [tokenSearch, setTokenSearch] = useState('');
  const [tokenStatusFilter, setTokenStatusFilter] = useState<'open' | 'all' | 'assigned' | 'video'>('open');
  const [tokenTimeFilter, setTokenTimeFilter] = useState<'all' | 'morning' | 'afternoon'>('all');
  const [tokenDoctorFilter, setTokenDoctorFilter] = useState<string>('all');
  const [tokenSortOrder, setTokenSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Video Call Reservation state for Walk-in patients
  const [localVideoAppointments, setLocalVideoAppointments] = useState<VideoAppointment[]>([]);
  const [isVideoReserveModalOpen, setIsVideoReserveModalOpen] = useState(false);
  const [videoPatientName, setVideoPatientName] = useState('');
  const [videoPatientPhone, setVideoPatientPhone] = useState('');
  const [videoDoctorId, setVideoDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [videoDate, setVideoDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [videoTime, setVideoTime] = useState<string>('Instant (Now)');
  const [videoBookingLoading, setVideoBookingLoading] = useState(false);
  const [activeTeleconsultDoctor, setActiveTeleconsultDoctor] = useState<{
    doctorName: string;
    specialty: string;
    patientName: string;
  } | null>(null);

  const allNurseVideoAppointments = [
    ...localVideoAppointments,
    ...(videoAppointments || []).filter(v => v.patientPhone === nurse.phone || (v as any).bookedByNurseId === nurse.id || (v as any).nurseId === nurse.id)
  ];

  const nurseSlots = slots.filter(s => s.bookedByNurseId === nurse.id);
  const activeBulkReservations = nurseSlots.filter(s => s.status === 'RESERVED_BULK');
  const bookedOrCompletedByNurse = nurseSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED' || s.status === 'IN_CONSULTATION');

  const openTokensCount = activeBulkReservations.length;
  const assignedTokensCount = bookedOrCompletedByNurse.length;
  const totalNurseTokensCount = nurseSlots.length;
  const batchDoctors = Array.from(new Set(nurseSlots.map(s => s.doctorName)));

  // Patient Attendance Counts (Online Video Call vs Offline Hospital OPD)
  const onlineVideoAttendanceCount = allNurseVideoAppointments.length;
  // Offline hospital attendances (in-person patients attending hospital OPD today - all 30 booked/reserved tokens)
  const offlineHospitalAttendanceCount = slots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED' || s.status === 'IN_CONSULTATION' || s.status === 'RESERVED_BULK').length;
  const offlineNurseWalkinCount = bookedOrCompletedByNurse.length;
  const totalPatientAttendanceCount = onlineVideoAttendanceCount + offlineHospitalAttendanceCount;
  const onlineAttendancePct = totalPatientAttendanceCount > 0 ? Math.round((onlineVideoAttendanceCount / totalPatientAttendanceCount) * 100) : 0;
  const offlineAttendancePct = totalPatientAttendanceCount > 0 ? (100 - onlineAttendancePct) : 0;

  // Filtered Walk-in tokens
  const filteredWalkinTokens = nurseSlots.filter(token => {
    // 1. Status Filter
    if (tokenStatusFilter === 'open' && token.status !== 'RESERVED_BULK') return false;
    if (tokenStatusFilter === 'assigned' && token.status === 'RESERVED_BULK') return false;

    // 2. Doctor Filter
    if (tokenDoctorFilter !== 'all' && token.doctorName !== tokenDoctorFilter) return false;

    // 3. Time Filter
    if (tokenTimeFilter === 'morning') {
      const isMorning = token.time.toUpperCase().includes('AM');
      if (!isMorning) return false;
    } else if (tokenTimeFilter === 'afternoon') {
      const isAfternoon = token.time.toUpperCase().includes('PM');
      if (!isAfternoon) return false;
    }

    // 4. Search Query Filter
    if (tokenSearch.trim()) {
      const cleanSearch = tokenSearch.trim().toLowerCase().replace(/^#/, '');
      const tokenNumStr = token.tokenNumber.toString();
      const tokenFullStr = `token #${tokenNumStr}`.toLowerCase();
      const docMatch = token.doctorName?.toLowerCase().includes(cleanSearch);
      const timeMatch = token.time?.toLowerCase().includes(cleanSearch);
      const tokenMatch = tokenNumStr.includes(cleanSearch) || tokenFullStr.includes(cleanSearch);
      const patientMatch = token.patientName?.toLowerCase().includes(cleanSearch);
      const phoneMatch = token.patientPhone?.includes(cleanSearch);
      const hospMatch = token.hospitalName?.toLowerCase().includes(cleanSearch);

      if (!tokenMatch && !docMatch && !timeMatch && !patientMatch && !phoneMatch && !hospMatch) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (tokenSortOrder === 'desc') {
      return b.tokenNumber - a.tokenNumber;
    }
    return a.tokenNumber - b.tokenNumber;
  });

  const hasActiveFilters = tokenSearch.trim() !== '' || 
    tokenStatusFilter !== 'open' || 
    tokenTimeFilter !== 'all' || 
    tokenDoctorFilter !== 'all' || 
    tokenSortOrder !== 'asc';

  const activeFilterCount = (tokenTimeFilter !== 'all' ? 1 : 0) + 
    (tokenDoctorFilter !== 'all' ? 1 : 0) + 
    (tokenSortOrder !== 'asc' ? 1 : 0);

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
      await onBulkReserve(nurse.id, selectedDoctorId, startToken, endToken, appointmentDate, appointmentTime);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.6 }
      });

      onTriggerWhatsAppToast(
        'Bulk Slots Reserved',
        `Sister Priya reserved Tokens #${startToken} to #${endToken} for ${selectedDoctor?.name || 'Physician'} on ${appointmentDate} at ${appointmentTime}. WhatsApp dispatch active.`,
        'TOKEN_CONFIRMATION'
      );

      alert(`Reserved tokens ${startToken} to ${endToken} in bulk for ${appointmentDate} (${appointmentTime})!`);
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

  const handleVideoReserveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPatientName || !videoPatientPhone) return;
    setVideoBookingLoading(true);

    const doc = doctors.find(d => d.id === videoDoctorId) || doctors[0];
    const newVideoApt: VideoAppointment = {
      id: `vid-nurse-${Date.now()}`,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      hospitalName: doc.hospitalName,
      patientId: `walkin-${Date.now().toString().slice(-4)}`,
      patientName: videoPatientName,
      patientPhone: videoPatientPhone,
      date: videoDate,
      time: videoTime === 'Instant (Now)' ? '11:00 AM' : videoTime,
      meetingLink: `https://meet.bcare.health/room/bc-tele-${doc.id.slice(-4)}`,
      feePaid: doc.teleConsultationFee || 200,
      status: 'SCHEDULED',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString()
    };

    try {
      if (onBookVideoConsultation) {
        await onBookVideoConsultation({
          ...newVideoApt,
          nurseId: nurse.id
        });
      }
    } catch (err) {}

    setLocalVideoAppointments(prev => [newVideoApt, ...prev]);

    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.6 }
    });

    onTriggerWhatsAppToast(
      'Video Call Reserved',
      `Sister Priya reserved Video Teleconsultation with ${doc.name} for walk-in patient ${videoPatientName}. Link dispatched to ${videoPatientPhone}.`,
      'TELECONSULT_LINK'
    );

    const savedPatientName = videoPatientName;
    setIsVideoReserveModalOpen(false);
    setVideoBookingLoading(false);
    setVideoPatientName('');
    setVideoPatientPhone('');

    const launchNow = window.confirm(
      `Video Teleconsultation reserved for ${savedPatientName} with ${doc.name}!\n\nWould you like to launch the HD Video Room right now on your screen?`
    );
    if (launchNow) {
      setActiveTeleconsultDoctor({
        doctorName: doc.name,
        specialty: doc.specialty,
        patientName: savedPatientName
      });
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

                {/* Date and Time of Appointment */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date of Appointment</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Time of Appointment</span>
                    </label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="08:30 AM">08:30 AM (Morning)</option>
                      <option value="09:00 AM">09:00 AM (Morning)</option>
                      <option value="09:30 AM">09:30 AM (Morning)</option>
                      <option value="10:00 AM">10:00 AM (Morning)</option>
                      <option value="10:30 AM">10:30 AM (Morning)</option>
                      <option value="11:00 AM">11:00 AM (Morning)</option>
                      <option value="11:30 AM">11:30 AM (Morning)</option>
                      <option value="12:00 PM">12:00 PM (Noon)</option>
                      <option value="12:30 PM">12:30 PM (Noon)</option>
                      <option value="01:00 PM">01:00 PM (Afternoon)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon)</option>
                      <option value="02:30 PM">02:30 PM (Afternoon)</option>
                      <option value="03:00 PM">03:00 PM (Afternoon)</option>
                      <option value="03:30 PM">03:30 PM (Afternoon)</option>
                      <option value="04:00 PM">04:00 PM (Evening)</option>
                      <option value="04:30 PM">04:30 PM (Evening)</option>
                      <option value="05:00 PM">05:00 PM (Evening)</option>
                      <option value="05:30 PM">05:30 PM (Evening)</option>
                      <option value="06:00 PM">06:00 PM (Evening)</option>
                    </select>
                  </div>
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
                    <span>Scheduled Slot:</span>
                    <span className="font-semibold text-slate-900">{appointmentDate} • {appointmentTime}</span>
                  </div>
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

              {/* Search Bar & Filters for Tokens */}
              <div className="space-y-2.5 pt-0.5">
                {/* Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search token #, doctor, time..."
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
                    />
                    {tokenSearch && (
                      <button
                        type="button"
                        onClick={() => setTokenSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Toggle Advanced Filters Button */}
                  <button
                    type="button"
                    onClick={() => setShowFilterDrawer(prev => !prev)}
                    className={`px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      showFilterDrawer || activeFilterCount > 0
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                    title="Toggle extra filters"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Filter Pills & Reset */}
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <button
                      type="button"
                      onClick={() => setTokenStatusFilter('open')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        tokenStatusFilter === 'open'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tokenStatusFilter === 'open' ? 'bg-white' : 'bg-emerald-500'}`} />
                      <span>Open</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        tokenStatusFilter === 'open' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {openTokensCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTokenStatusFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        tokenStatusFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>All</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        tokenStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {totalNurseTokensCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTokenStatusFilter('assigned')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        tokenStatusFilter === 'assigned'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>Assigned</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        tokenStatusFilter === 'assigned' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {assignedTokensCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTokenStatusFilter('video')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        tokenStatusFilter === 'video'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      <span>Video</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                        tokenStatusFilter === 'video' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {allNurseVideoAppointments.length}
                      </span>
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setTokenSearch('');
                        setTokenStatusFilter('open');
                        setTokenTimeFilter('all');
                        setTokenDoctorFilter('all');
                        setTokenSortOrder('asc');
                        setShowFilterDrawer(false);
                      }}
                      className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer py-0.5 px-1.5"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Advanced Filter Drawer */}
                {showFilterDrawer && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Doctor
                        </label>
                        <select
                          value={tokenDoctorFilter}
                          onChange={(e) => setTokenDoctorFilter(e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="all">All Doctors</option>
                          {batchDoctors.map(doc => (
                            <option key={doc} value={doc}>{doc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Time of Day
                        </label>
                        <select
                          value={tokenTimeFilter}
                          onChange={(e) => setTokenTimeFilter(e.target.value as any)}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="all">All Times</option>
                          <option value="morning">Morning (AM)</option>
                          <option value="afternoon">Afternoon (PM)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sort:</span>
                        <button
                          type="button"
                          onClick={() => setTokenSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                          className="font-semibold text-slate-800 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                        >
                          {tokenSortOrder === 'asc' ? 'Token # (Ascending)' : 'Token # (Descending)'}
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {filteredWalkinTokens.length} tokens
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Video Call Reservation Option */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-sky-50/90 via-indigo-50/30 to-emerald-50/30 border border-sky-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs shrink-0 relative">
                      <Video className="w-4 h-4" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs text-slate-900 tracking-tight">Video Call Reservation</h4>
                        <span className="px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                          Telehealth
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">Book or launch instant video consult for walk-in patient</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVideoReserveModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Reserve Video Call</span>
                  </button>
                </div>

                {/* Active / Scheduled Video Consultations Preview */}
                {allNurseVideoAppointments.length > 0 && (
                  <div className="pt-2 border-t border-sky-100/90 space-y-1.5">
                    <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-semibold">
                      <span>Active Video Telehealth ({allNurseVideoAppointments.length})</span>
                      <span className="text-sky-700 font-bold">₹{allNurseVideoAppointments.length * splitConfig.nurseReferralCommission} Commission</span>
                    </div>
                    {allNurseVideoAppointments.map((vApt) => (
                      <div key={vApt.id} className="p-2 rounded-xl bg-white/90 border border-sky-100 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 truncate">{vApt.patientName}</span>
                            <span className="text-[10px] text-slate-400">• {vApt.time}</span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 truncate">{vApt.doctorName} ({vApt.doctorSpecialty})</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTeleconsultDoctor({
                            doctorName: vApt.doctorName,
                            specialty: vApt.doctorSpecialty,
                            patientName: vApt.patientName
                          })}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer"
                        >
                          <Video className="w-3 h-3" />
                          <span>Launch Call</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Attendance Count: Online Video Call vs Offline Hospital */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">Patient Attendance Summary</h4>
                      <p className="text-[10.5px] text-slate-500">Live count of patients attending Online vs Offline today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Live Roster</span>
                  </div>
                </div>

                {/* Metric Cards Grid: Online Attend vs Offline Attend */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. Online Attend (Video Call) */}
                  <div 
                    onClick={() => setTokenStatusFilter('video')}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      tokenStatusFilter === 'video' 
                        ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-200' 
                        : 'bg-gradient-to-br from-sky-50/60 to-blue-50/40 border-sky-200 hover:border-sky-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-2xs">
                          <Video className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Online Attend</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700 font-bold text-[9px]">
                        Video Call
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-sky-950 tracking-tight">
                        <RollingCounter value={onlineVideoAttendanceCount} />
                      </span>
                      <span className="text-[11px] text-sky-700 font-semibold">Patients</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-sky-100/90 flex items-center justify-between text-[10px] text-sky-800/80">
                      <span>Telehealth Calls</span>
                      <span className="font-bold text-sky-700 group-hover:underline">
                        {tokenStatusFilter === 'video' ? 'Active' : 'Filter Calls →'}
                      </span>
                    </div>
                  </div>

                  {/* 2. Offline Attend (Hospital OPD) */}
                  <div 
                    onClick={() => setTokenStatusFilter(tokenStatusFilter === 'video' ? 'all' : tokenStatusFilter)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                      tokenStatusFilter !== 'video' 
                        ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-200' 
                        : 'bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border-emerald-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Offline Attend</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[9px]">
                        Hospital OPD
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
                        <RollingCounter value={offlineHospitalAttendanceCount} />
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">Patients</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-emerald-100/90 flex items-center justify-between text-[10px] text-emerald-800/80">
                      <span>In-Clinic / OPD</span>
                      <span className="font-bold text-emerald-700 group-hover:underline">
                        {tokenStatusFilter !== 'video' ? 'Viewing' : 'Filter Tokens →'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance Split Bar & Total Indicator */}
                <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">
                      Total Attending: <strong className="text-slate-900 font-bold">{totalPatientAttendanceCount} Patients</strong>
                    </span>
                    <div className="flex items-center gap-2 text-[10.5px] font-bold tabular-nums">
                      <span className="text-sky-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        {onlineVideoAttendanceCount} Online ({onlineAttendancePct}%)
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {offlineHospitalAttendanceCount} Offline ({offlineAttendancePct}%)
                      </span>
                    </div>
                  </div>

                  {/* Visual Percentage Distribution Bar */}
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-sky-500 h-full transition-all duration-500" 
                      style={{ width: `${onlineAttendancePct}%` }}
                      title={`Online Video Call: ${onlineVideoAttendanceCount} (${onlineAttendancePct}%)`}
                    />
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${offlineAttendancePct}%` }}
                      title={`Offline Hospital: ${offlineHospitalAttendanceCount} (${offlineAttendancePct}%)`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5">
                    <span>Includes Sister Priya Walk-Ins ({offlineNurseWalkinCount}) & Hospital OPD Tokens</span>
                    <span>ABDM Synced</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {tokenStatusFilter === 'video' ? (
                  allNurseVideoAppointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Video className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700">No active video call reservations yet.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Use the "Reserve Video Call" button above to book an instant teleconsultation.</p>
                      <button
                        type="button"
                        onClick={() => setIsVideoReserveModalOpen(true)}
                        className="mt-3 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        + Reserve Video Call
                      </button>
                    </div>
                  ) : (
                    allNurseVideoAppointments.map((vApt) => (
                      <div 
                        key={vApt.id} 
                        className="p-3 rounded-xl bg-sky-50/30 border border-sky-100 hover:border-sky-200 transition-all flex items-center justify-between text-xs gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-950 truncate">{vApt.patientName}</span>
                            <span className="text-slate-500 tabular-nums">• {vApt.time}</span>
                            <span className="px-1.5 py-0.2 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 text-[10px] font-semibold flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" />
                              Video Consult
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 font-medium mt-0.5 truncate">
                            {vApt.doctorName} • <span className="text-slate-500">{vApt.doctorSpecialty}</span>
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">Phone: {vApt.patientPhone} • Fee: ₹{vApt.feePaid}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveTeleconsultDoctor({
                            doctorName: vApt.doctorName,
                            specialty: vApt.doctorSpecialty,
                            patientName: vApt.patientName
                          })}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Launch</span>
                        </button>
                      </div>
                    ))
                  )
                ) : activeBulkReservations.length === 0 ? (
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
                ) : filteredWalkinTokens.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Search className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                    <p className="font-semibold text-slate-700">No tokens match your search or filter.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching a different token number or reset the filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTokenSearch('');
                        setTokenStatusFilter('open');
                        setTokenTimeFilter('all');
                        setTokenDoctorFilter('all');
                        setTokenSortOrder('asc');
                        setShowFilterDrawer(false);
                      }}
                      className="mt-2.5 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredWalkinTokens.map(token => {
                    const isOpen = token.status === 'RESERVED_BULK';

                    return (
                      <div 
                        key={token.id} 
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs gap-2 ${
                          isOpen 
                            ? 'bg-slate-50 border-slate-200/70 hover:border-slate-300' 
                            : 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-950 tabular-nums">Token #{token.tokenNumber}</span>
                            <span className="text-slate-500 tabular-nums">• {token.time}</span>
                            {isOpen ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                                Open
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80 text-[10px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Assigned
                              </span>
                            )}
                          </div>
                          
                          {isOpen ? (
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{token.doctorName}</p>
                          ) : (
                            <div className="mt-0.5 space-y-0.5">
                              <p className="text-[11px] text-slate-700 font-medium truncate">
                                Patient: <span className="font-semibold text-slate-950">{token.patientName || 'Assigned Walk-in'}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">{token.doctorName}</p>
                            </div>
                          )}
                        </div>

                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => setAssigningSlot(token)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <div className="text-right shrink-0">
                            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span className="tabular-nums">{token.patientPhone || 'Assigned'}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
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

      {/* Video Call Reservation Modal */}
      {isVideoReserveModalOpen && (
        <PhoneModalPortal>
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setIsVideoReserveModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Video Call Reservation</h3>
                    <p className="text-[11px] text-slate-400">Teleconsultation for walk-in patient</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoReserveModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVideoReserveSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Select Specialist Physician</label>
                  <select
                    value={videoDoctorId}
                    onChange={(e) => setVideoDoctorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 cursor-pointer"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty}) • ₹{d.teleConsultationFee || 200}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Walk-in Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Murugan K."
                    value={videoPatientName}
                    onChange={(e) => setVideoPatientName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Patient Mobile (for Video Call Link)</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9842100000"
                    value={videoPatientPhone}
                    onChange={(e) => setVideoPatientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold tabular-nums text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      value={videoDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setVideoDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Time</span>
                    </label>
                    <select
                      value={videoTime}
                      onChange={(e) => setVideoTime(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="Instant (Now)">Instant (Now)</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/80 text-[11px] text-sky-950 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Nurse Facilitation Commission:</span>
                    <span className="text-emerald-700">₹{splitConfig.nurseReferralCommission}</span>
                  </div>
                  <p className="text-[10px] text-sky-700">
                    Patient receives an end-to-end encrypted WebRTC room link on WhatsApp. You can also launch the video room directly from this desk.
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsVideoReserveModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={videoBookingLoading}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{videoBookingLoading ? 'Reserving...' : 'Confirm Video Call'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* Live Telehealth Video Room Modal */}
      {activeTeleconsultDoctor && (
        <TeleconsultRoomModal
          isOpen={!!activeTeleconsultDoctor}
          onClose={() => setActiveTeleconsultDoctor(null)}
          patientName={activeTeleconsultDoctor.patientName}
          doctorName={activeTeleconsultDoctor.doctorName}
          specialty={activeTeleconsultDoctor.specialty}
        />
      )}

    </div>
  );
};

export default NursePortal;
