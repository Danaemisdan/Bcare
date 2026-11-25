import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Video, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Tag, 
  Check, 
  Smartphone, 
  CreditCard, 
  Wallet, 
  Receipt, 
  Sparkles, 
  Stethoscope, 
  Star, 
  MapPin, 
  CheckCircle2, 
  FileText,
  Lock,
  ArrowRight,
  UserCheck,
  Zap,
  Ticket,
  ChevronRight,
  Info,
  PhoneCall,
  AlertCircle
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile, RevenueSplitConfig } from '../types';
import { RollingCounter } from './RollingCounter';

export type ConsultationType = 'IN_PERSON_OPD' | 'VIDEO_CONSULTATION';

export interface BookingConsultationScreenProps {
  doctor: DoctorProfile;
  hospital: Hospital;
  allDoctors?: DoctorProfile[];
  selectDoctorFirst?: boolean;
  initialType?: ConsultationType;
  initialSlot?: OpSlot;
  allSlots: OpSlot[];
  patientProfile: PatientProfile;
  splitConfig: RevenueSplitConfig;
  onBack: () => void;
  onConfirmBooking: (bookingDetails: {
    consultationType: ConsultationType;
    doctorId: string;
    hospitalId: string;
    slotId?: string;
    date: string;
    timeSlot: string;
    tokenNumber?: number;
    paymentMethod: 'UPI' | 'CARD' | 'COUNTER';
    voucherCode?: string;
    totalPaid: number;
    patientReason?: string;
  }) => Promise<void>;
  onTriggerWhatsAppToast?: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
}

type StepName = 'DOCTOR' | 'MODE' | 'SLOT' | 'PAYMENT';

export const BookingConsultationScreen: React.FC<BookingConsultationScreenProps> = ({
  doctor: initialDoctor,
  hospital,
  allDoctors = [],
  selectDoctorFirst = false,
  initialType = 'IN_PERSON_OPD',
  initialSlot,
  allSlots,
  patientProfile,
  splitConfig,
  onBack,
  onConfirmBooking,
  onTriggerWhatsAppToast
}) => {
  // Step sequence determination
  const steps: StepName[] = selectDoctorFirst 
    ? ['DOCTOR', 'MODE', 'SLOT', 'PAYMENT'] 
    : ['MODE', 'SLOT', 'PAYMENT'];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = steps[currentStepIndex];

  // Selected Doctor state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(initialDoctor);

  // Doctors affiliated with this hospital (or all if none explicitly affiliated)
  const hospitalDoctors = allDoctors.filter(d => d.hospitalId === hospital.id);
  const displayDoctors = hospitalDoctors.length > 0 ? hospitalDoctors : (allDoctors.length > 0 ? allDoctors : [initialDoctor]);

  // Consultation Format: In-Person OPD vs Video Call
  const [consultationType, setConsultationType] = useState<ConsultationType>(initialType);
  const isVideo = consultationType === 'VIDEO_CONSULTATION';

  // Automatically scroll container to top on mount and step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(c => { c.scrollTop = 0; });
  }, [currentStepIndex]);

  // Date selection (Dynamic 5-day calendar starting today)
  const dates = useMemo(() => {
    const result = [];
    const now = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const fullDate = `${yyyy}-${mm}-${dd}`;
      const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()];
      const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}`;
      result.push({
        id: i === 0 ? 'today' : i === 1 ? 'tomorrow' : `day${i + 1}`,
        day,
        dateStr,
        fullDate
      });
    }
    return result;
  }, []);

  const [selectedDate, setSelectedDate] = useState(dates[0]);

  // Standard session times for OPD (20 tokens per session)
  const defaultOpSessionTimes = [
    '08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM',
    '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
    '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM',
    '12:15 PM', '12:30 PM', '12:45 PM', '02:00 PM', '02:15 PM'
  ];

  // Resolve or synthesize OPD tokens for the selected doctor & date
  const activeDateSlots: OpSlot[] = useMemo(() => {
    // 1. Look for existing slots matching this doctor & date
    const matched = (allSlots || [])
      .filter(s => s.doctorId === selectedDoctor.id && (s.date === selectedDate.fullDate || (!s.date && selectedDate.id === 'today')))
      .sort((a, b) => a.tokenNumber - b.tokenNumber);

    if (matched.length >= 8) {
      return matched;
    }

    // 2. Synthesize a full realistic 20-token session so the queue is never blank
    const isToday = selectedDate.id === 'today' || selectedDate.fullDate === new Date().toISOString().split('T')[0];
    const nextAvail = selectedDoctor.nextAvailableToken || (isToday ? 3 : 1);

    return defaultOpSessionTimes.map((time, idx) => {
      const tokenNumber = idx + 1;
      const existingOne = matched.find(m => m.tokenNumber === tokenNumber);
      if (existingOne) return existingOne;

      let status: OpSlot['status'] = 'AVAILABLE';
      if (isToday) {
        if (tokenNumber === 1) status = 'COMPLETED';
        else if (tokenNumber === 2) status = 'IN_CONSULTATION';
        else if (tokenNumber < nextAvail) status = 'BOOKED';
      } else {
        // Tomorrow and upcoming days: first 2 tokens pre-booked by advance callers
        if (tokenNumber <= 2) status = 'BOOKED';
      }

      if (initialSlot && initialSlot.tokenNumber === tokenNumber && initialSlot.doctorId === selectedDoctor.id) {
        status = 'AVAILABLE';
      }

      return {
        id: `slot-${selectedDoctor.id}-${selectedDate.fullDate}-${tokenNumber}`,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        specialty: selectedDoctor.specialty,
        date: selectedDate.fullDate,
        time,
        tokenNumber,
        status,
        feePaid: selectedDoctor.opConsultationFee || hospital.baseOpFee || 100,
        feeSplit: {
          doctor: splitConfig?.doctorFee || 50,
          nurse: 0,
          franchise: splitConfig?.franchiseShare || 10,
          platform: (splitConfig?.platformShare || 20) + (splitConfig?.nurseReferralCommission || 15),
          gst: splitConfig?.gstAmount || 5
        }
      };
    });
  }, [allSlots, selectedDoctor, selectedDate, hospital, initialSlot, splitConfig]);

  const availableDoctorSlots = useMemo(() => {
    return activeDateSlots.filter(s => s.status === 'AVAILABLE' || s.id === initialSlot?.id);
  }, [activeDateSlots, initialSlot]);

  const bookedCount = useMemo(() => {
    return activeDateSlots.filter(s => s.status !== 'AVAILABLE' && s.id !== initialSlot?.id).length;
  }, [activeDateSlots, initialSlot]);

  const availableCount = activeDateSlots.length - bookedCount;

  // Video Time Slots
  const videoTimeSlots = [
    '⚡ Instant Call (~2 mins wait)',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
    '06:30 PM'
  ];

  const [selectedVideoTime, setSelectedVideoTime] = useState<string>(videoTimeSlots[0]);
  const [selectedOpSlot, setSelectedOpSlot] = useState<OpSlot | null>(() => {
    if (initialSlot && initialSlot.doctorId === selectedDoctor.id) return initialSlot;
    return activeDateSlots.find(s => s.status === 'AVAILABLE') || activeDateSlots[0] || null;
  });

  // Keep selectedOpSlot always pointing to an available token for the chosen doctor & date
  useEffect(() => {
    const isCurSlotStillValid = selectedOpSlot && activeDateSlots.some(s => s.id === selectedOpSlot.id && s.status === 'AVAILABLE');
    if (!isCurSlotStillValid) {
      const firstAvailable = activeDateSlots.find(s => s.status === 'AVAILABLE') || activeDateSlots[0] || null;
      setSelectedOpSlot(firstAvailable);
    }
  }, [selectedDoctor.id, selectedDate.fullDate, activeDateSlots]);

  // Vouchers & promo codes
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COUNTER'>('UPI');
  const [patientReason, setPatientReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fee calculation ("simple asf")
  const baseConsultFee = isVideo 
    ? (selectedDoctor.teleConsultationFee || 250) 
    : (selectedDoctor.opConsultationFee || hospital.baseOpFee || splitConfig.baseOpFee || 100);

  const platformFee = 0; // Transparent zero extra platform fees
  const subtotal = baseConsultFee + platformFee;
  const discountValue = appliedVoucher ? appliedVoucher.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountValue);

  // Handle promo code
  const handleApplyCode = (codeToApply: string) => {
    setVoucherError('');
    const clean = codeToApply.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'NURSE-PRIYA-782' || clean === 'PRIYA15') {
      setAppliedVoucher({
        code: clean,
        discount: 15,
        label: 'Nurse Community Rebate (₹15 off)'
      });
      setVoucherCode('');
    } else if (clean === 'AYUSHMAN' || clean === 'ABHA20') {
      setAppliedVoucher({
        code: clean,
        discount: 20,
        label: 'ABDM Ayushman Subsidy (₹20 off)'
      });
      setVoucherCode('');
    } else if (clean === 'BCARE10') {
      setAppliedVoucher({
        code: clean,
        discount: 10,
        label: 'First Visit Privilege (₹10 off)'
      });
      setVoucherCode('');
    } else {
      setVoucherError('Invalid code. Try BCARE10, AYUSHMAN or NURSE-PRIYA-782');
    }
  };

  // Step Navigation handlers
  const handleNextStep = () => {
    if (currentStep === 'SLOT' && !isVideo && !selectedOpSlot) {
      const fallback = availableDoctorSlots[0] || activeDateSlots[0];
      if (fallback) setSelectedOpSlot(fallback);
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      onBack();
    }
  };

  // Final Confirmation
  const handleProceedBooking = async () => {
    setIsProcessing(true);
    try {
      const chosenTime = isVideo ? selectedVideoTime : (selectedOpSlot?.time || '10:00 AM');
      const tokenNum = !isVideo ? (selectedOpSlot?.tokenNumber || selectedDoctor.nextAvailableToken || 5) : undefined;

      await onConfirmBooking({
        consultationType,
        doctorId: selectedDoctor.id,
        hospitalId: hospital.id,
        slotId: selectedOpSlot?.id,
        date: selectedDate.fullDate,
        timeSlot: chosenTime,
        tokenNumber: tokenNum,
        paymentMethod,
        voucherCode: appliedVoucher?.code,
        totalPaid: grandTotal,
        patientReason: patientReason.trim() || undefined
      });

      if (onTriggerWhatsAppToast) {
        onTriggerWhatsAppToast(
          isVideo ? 'Video Consultation Confirmed' : `OPD Token #${tokenNum} Confirmed`,
          isVideo 
            ? `Your HD Video Call with ${selectedDoctor.name} is scheduled for ${chosenTime}.`
            : `Your In-Person Token #${tokenNum} at ${hospital.name} is confirmed for ${chosenTime}.`,
          'TOKEN_CONFIRMATION'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const stepNumberDisplay = currentStepIndex + 1;
  const totalStepsDisplay = steps.length;

  return (
    <div className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-28 relative select-none">
      
      {/* ============================================================== */}
      {/* 1. TOP STICKY HEADER WITH STEP PROGRESS (Step X of Y)          */}
      {/* ============================================================== */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>{currentStepIndex === 0 ? 'Exit' : 'Back'}</span>
          </button>

          <div className="text-center min-w-0 flex-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                Step {stepNumberDisplay} of {totalStepsDisplay}
              </span>
            </div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate mt-0.5">
              {currentStep === 'DOCTOR' && 'Choose Doctor'}
              {currentStep === 'MODE' && 'Consultation Mode'}
              {currentStep === 'SLOT' && (isVideo ? 'Select Video Time' : 'Select OPD Token')}
              {currentStep === 'PAYMENT' && 'Confirm & Pay'}
            </h2>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ABDM</span>
          </div>
        </div>

        {/* Segmented Step Indicator Line */}
        <div className="flex items-center gap-1.5 w-full mt-2.5">
          {steps.map((s, idx) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. BODY: ONLY ONE FORM ON THE FACE AT ANY GIVEN TIME           */}
      {/* ============================================================== */}
      <div className="p-4 flex-1">
        <AnimatePresence mode="wait">

          {/* ========================================================== */}
          {/* STEP 1: CHOOSE DOCTOR (When initiated from Hospital)        */}
          {/* ========================================================== */}
          {currentStep === 'DOCTOR' && (
            <motion.div
              key="step-doctor"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Hospital Overview Card */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                  <img
                    src={hospital.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400'}
                    alt={hospital.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{hospital.name}</h3>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center shrink-0">
                      ★ {hospital.rating || 4.8}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{hospital.address}</p>
                  <span className="inline-block mt-1 text-[9.5px] font-bold text-rose-700 bg-rose-50 border border-rose-200/70 px-1.5 py-0.2 rounded-md">
                    24/7 Emergency & Live OPD
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Select Specialist at this Hospital
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the attending physician for your consultation:
                </p>
              </div>

              {/* Doctors List at Hospital */}
              <div className="space-y-2.5">
                {displayDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;

                  return (
                    <motion.div
                      whileTap={{ scale: 0.99 }}
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600 shadow-xs ring-1 ring-blue-600'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 relative shadow-2xs">
                          {doc.name.replace('Dr. ', '').split(' ')[0][0]}
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{doc.rating || 4.9}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <span className="font-bold text-blue-700">{doc.specialty}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 text-[11px]">{doc.experienceYears || 14} yrs exp</span>
                          </div>

                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px]">
                            <span className="font-medium text-slate-600">
                              OPD: <strong className="text-slate-900 font-bold">₹{doc.opConsultationFee || 100}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="font-medium text-slate-600">
                              Video: <strong className="text-slate-900 font-bold">₹{doc.teleConsultationFee || 250}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              Token #{doc.nextAvailableToken || 5} Ready
                            </span>
                          </div>
                        </div>

                        {/* Radio Checkmark */}
                        <div className="shrink-0 pt-1">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Continue Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Continue with {selectedDoctor.name.split(' ')[1] || selectedDoctor.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 2: CONSULTATION MODE (In-Person OPD vs Video Call)     */}
          {/* ========================================================== */}
          {currentStep === 'MODE' && (
            <motion.div
              key="step-mode"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Doctor Header Banner */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    {selectedDoctor.name.replace('Dr. ', '').split(' ')[0][0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs text-slate-900 truncate">{selectedDoctor.name}</h3>
                    <p className="text-[11px] font-semibold text-blue-700 truncate">{selectedDoctor.specialty} • {hospital.name.split(' ')[0]}</p>
                  </div>
                </div>

                {selectDoctorFirst && (
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(0)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md bg-blue-50 shrink-0"
                  >
                    Change
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  How would you like to consult?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select consultation format with Dr. {selectedDoctor.name}:
                </p>
              </div>

              {/* The Two Choice Cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. In-Person OPD */}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setConsultationType('IN_PERSON_OPD')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    !isVideo
                      ? 'bg-blue-50/60 border-blue-600 shadow-sm ring-2 ring-blue-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        !isVideo ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">
                            In-Person OPD Visit
                          </h4>
                          <span className="text-[9.5px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            Queue Pass
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Direct physical consultation at {hospital.name}.
                        </p>

                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Live queue tracker & token pass on your phone</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Room {(selectedDoctor as any).roomNumber || '204'} • In-person checkup & vitals</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Official signed hospital prescription</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Fee</span>
                      <span className="text-base font-black text-slate-900 tabular-nums">
                        ₹{selectedDoctor.opConsultationFee || hospital.baseOpFee || 100}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 2. Video Call */}
                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setConsultationType('VIDEO_CONSULTATION')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isVideo
                      ? 'bg-emerald-50/60 border-emerald-600 shadow-sm ring-2 ring-emerald-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isVideo ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Video className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">
                            Book an Appointment by Video Call
                          </h4>
                          <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            From Home
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Private 1-on-1 HD teleconsult with Dr. {selectedDoctor.name}.
                        </p>

                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Connect instantly in ~2 mins or schedule time</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>10 Indian regional languages supported</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Digital prescription delivered via WhatsApp & PDF</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Fee</span>
                      <span className="text-base font-black text-slate-900 tabular-nums">
                        ₹{selectedDoctor.teleConsultationFee || 250}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Continue to {isVideo ? 'Time Slots' : 'OPD Tokens'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 3: SELECT SLOT (OPD Tokens vs Video Time Slots)        */}
          {/* ========================================================== */}
          {currentStep === 'SLOT' && (
            <motion.div
              key="step-slot"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Doctor & Format Context */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${isVideo ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isVideo ? <Video className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                </div>
                <span className="font-bold text-blue-700">{isVideo ? 'Video Call' : 'Hospital OPD Pass'}</span>
              </div>

              {/* Day Selector */}
              <div>
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Select Day
                </label>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                  {dates.map((d) => {
                    const isSelected = selectedDate.id === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 px-3.5 rounded-xl border text-center transition-all cursor-pointer shrink-0 min-w-[70px] ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`block text-[10px] font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          {d.day}
                        </span>
                        <span className="block text-xs font-bold mt-0.5">
                          {d.dateStr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BRANCH A: IN-PERSON OPD TOKENS ("for OPD tokens as it is") */}
              {!isVideo && (
                <div className="space-y-3">
                  {/* Queue Status Box */}
                  {selectedDate.id === 'today' ? (
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                          Live OPD Queue Status
                        </span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">
                          Now in room: <strong className="text-blue-900 font-black">Token #02</strong> (Room {(selectedDoctor as any).roomNumber || '204'})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Est. Consultation</span>
                        <span className="text-blue-700 font-bold">~{selectedDoctor.estimatedWaitMins || 8} mins / patient</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider block">
                          Advance OPD Schedule ({selectedDate.day})
                        </span>
                        <span className="text-slate-800 font-semibold mt-0.5 block">
                          Queue begins: <strong className="text-slate-900 font-black">08:30 AM</strong> • Room {(selectedDoctor as any).roomNumber || '204'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Queue Capacity</span>
                        <span className="text-emerald-700 font-bold">20 Tokens / Day</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Available Tokens for {selectedDate.day} ({selectedDate.dateStr})
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select your preferred token number:
                    </p>
                  </div>

                  {/* Token Grid */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {activeDateSlots.map((slot) => {
                      const isSelected = selectedOpSlot?.id === slot.id || (selectedOpSlot?.tokenNumber === slot.tokenNumber && selectedOpSlot?.date === slot.date);
                      const isAvailable = slot.status === 'AVAILABLE';

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedOpSlot(slot)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-300'
                              : isAvailable
                              ? 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200 shadow-2xs cursor-pointer'
                              : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-black tabular-nums ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              Token #{slot.tokenNumber < 10 ? `0${slot.tokenNumber}` : slot.tokenNumber}
                            </span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : isAvailable
                                ? 'bg-emerald-50 text-emerald-700'
                                : slot.status === 'IN_CONSULTATION'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-500'
                            }`}>
                              {isSelected ? 'Selected' : isAvailable ? 'Available' : slot.status === 'IN_CONSULTATION' ? 'In Room' : 'Booked'}
                            </span>
                          </div>
                          <span className={`block text-[11px] mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                            Est: {slot.time}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BRANCH B: VIDEO CALL TIME SLOTS ("then for video the time slots") */}
              {isVideo && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Choose Video Time
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Doctor will connect with you at your chosen time:
                    </p>
                  </div>

                  {/* Instant Call Banner */}
                  <div
                    onClick={() => setSelectedVideoTime(videoTimeSlots[0])}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedVideoTime === videoTimeSlots[0]
                        ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-2 ring-emerald-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <Zap className="w-4 h-4 fill-emerald-200" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            Connect Instantly (Next in ~2 mins)
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            Dr. {selectedDoctor.name.split(' ')[1] || selectedDoctor.name} is online now
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedVideoTime === videoTimeSlots[0] ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {selectedVideoTime === videoTimeSlots[0] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>

                  {/* Scheduled Slots */}
                  <div className="pt-1">
                    <span className="text-[11px] font-bold text-slate-600 block mb-2">
                      Or Pick a Scheduled Slot ({selectedDate.day}):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {videoTimeSlots.slice(1).map((time) => {
                        const isSelected = selectedVideoTime === time;

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedVideoTime(time)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                              <span className="text-xs font-bold">{time}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Continue Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* STEP 4: PAYMENT ("then payment simple asf")                 */}
          {/* ========================================================== */}
          {currentStep === 'PAYMENT' && (
            <motion.div
              key="step-payment"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${isVideo ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isVideo ? <Video className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900">
                      {isVideo 
                        ? 'Video Consultation' 
                        : `OPD Token #${selectedOpSlot?.tokenNumber ? (selectedOpSlot.tokenNumber < 10 ? `0${selectedOpSlot.tokenNumber}` : selectedOpSlot.tokenNumber) : '03'}`}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">
                    {selectedDate.day}, {selectedDate.dateStr}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Physician:</span>
                    <span className="font-bold text-slate-900">{selectedDoctor.name} ({selectedDoctor.specialty})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Center:</span>
                    <span className="font-semibold text-slate-800">{hospital.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Time / Room:</span>
                    <span className="font-bold text-blue-700">
                      {isVideo ? selectedVideoTime : `${selectedOpSlot?.time || '10:00 AM'} • Room ${(selectedDoctor as any).roomNumber || '204'}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Patient Details
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Patient:</span>
                  <span className="font-bold text-slate-900">{patientProfile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Mobile Phone:</span>
                  <span className="font-bold text-slate-900">+91 {patientProfile.phone}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === 'UPI'
                        ? 'bg-blue-50 border-blue-600 text-slate-900 ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold block">Instant UPI (GPay, PhonePe, Paytm, QR)</span>
                        <span className="text-[10px] text-slate-500">Zero transaction fees • Instant Pass Confirmation</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'UPI' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {paymentMethod === 'UPI' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </button>

                  {!isVideo && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COUNTER')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'COUNTER'
                          ? 'bg-blue-50 border-blue-600 text-slate-900 ring-1 ring-blue-600'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 text-slate-600 shrink-0" />
                        <div>
                          <span className="text-xs font-bold block">Pay at Hospital Counter (Cash / UPI upon arrival)</span>
                          <span className="text-[10px] text-slate-500">Pay directly at reception Room 204</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'COUNTER' ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'COUNTER' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Simple asf Pricing Breakdown */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Consultation Fee</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{baseConsultFee}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Platform Convenience</span>
                  <span className="font-bold">₹0 (FREE)</span>
                </div>

                {appliedVoucher && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold">
                    <span>{appliedVoucher.label}</span>
                    <span>-₹{appliedVoucher.discount}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-sm">
                  <span className="font-extrabold text-slate-900">Total Amount</span>
                  <span className="font-black text-slate-900 text-base tabular-nums">₹{grandTotal}</span>
                </div>
              </div>

              {/* Promo code pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleApplyCode('BCARE10')}
                  className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 transition-colors"
                >
                  Use BCARE10 (₹10 off)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCode('AYUSHMAN')}
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 transition-colors"
                >
                  Use AYUSHMAN (₹20 off)
                </button>
              </div>

              {/* Single Tap Confirm CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProceedBooking}
                  className="w-full py-4 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'COUNTER' 
                          ? `Confirm Token #${selectedOpSlot?.tokenNumber ? (selectedOpSlot.tokenNumber < 10 ? `0${selectedOpSlot.tokenNumber}` : selectedOpSlot.tokenNumber) : '03'} (Pay at Hospital)` 
                          : `Pay ₹${grandTotal} & Confirm Booking`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
export default BookingConsultationScreen;
