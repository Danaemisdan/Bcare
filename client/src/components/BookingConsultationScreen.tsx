import React, { useState, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile, RevenueSplitConfig } from '../types';
import { RollingCounter } from './RollingCounter';

export type ConsultationType = 'IN_PERSON_OPD' | 'VIDEO_CONSULTATION';

export interface BookingConsultationScreenProps {
  doctor: DoctorProfile;
  hospital: Hospital;
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

export const BookingConsultationScreen: React.FC<BookingConsultationScreenProps> = ({
  doctor,
  hospital,
  initialType = 'VIDEO_CONSULTATION',
  initialSlot,
  allSlots,
  patientProfile,
  splitConfig,
  onBack,
  onConfirmBooking,
  onTriggerWhatsAppToast
}) => {
  const [consultationType, setConsultationType] = useState<ConsultationType>(initialType);
  const isVideo = consultationType === 'VIDEO_CONSULTATION';

  // Automatically scroll container to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(c => { c.scrollTop = 0; });
  }, []);

  // Date selection
  const dates = [
    { id: 'today', day: 'Today', dateStr: 'Nov 4', fullDate: '2026-11-04' },
    { id: 'tomorrow', day: 'Tomorrow', dateStr: 'Nov 5', fullDate: '2026-11-05' },
    { id: 'day3', day: 'Thu', dateStr: 'Nov 6', fullDate: '2026-11-06' },
    { id: 'day4', day: 'Fri', dateStr: 'Nov 7', fullDate: '2026-11-07' },
    { id: 'day5', day: 'Sat', dateStr: 'Nov 8', fullDate: '2026-11-08' }
  ];
  const [selectedDate, setSelectedDate] = useState(dates[0]);

  // Slots
  const availableDoctorSlots = allSlots.filter(
    s => s.doctorId === doctor.id && (s.status === 'AVAILABLE' || s.id === initialSlot?.id)
  );

  const videoTimeSlots = [
    '⚡ Instant Call (Next in 2 mins)',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM'
  ];

  const [selectedVideoTime, setSelectedVideoTime] = useState<string>(videoTimeSlots[0]);
  const [selectedOpSlot, setSelectedOpSlot] = useState<OpSlot | null>(
    initialSlot || availableDoctorSlots[0] || null
  );

  // Vouchers
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COUNTER'>('UPI');
  const [patientReason, setPatientReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fee calculation
  const baseConsultFee = isVideo 
    ? (doctor.teleConsultationFee || 200) 
    : (doctor.opConsultationFee || splitConfig.baseOpFee || 500);

  const platformFee = isVideo ? 40 : splitConfig.platformShare + splitConfig.franchiseShare;
  const gstAmount = isVideo ? 10 : splitConfig.gstAmount;
  const subtotal = baseConsultFee + platformFee + gstAmount;

  const discountValue = appliedVoucher ? appliedVoucher.discount : 0;
  const grandTotal = Math.max(0, subtotal - discountValue);

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
      setVoucherError('Invalid promo code. Try AYUSHMAN, NURSE-PRIYA-782 or BCARE10');
    }
  };

  const handleProceedBooking = async () => {
    setIsProcessing(true);
    try {
      const chosenTime = isVideo ? selectedVideoTime : (selectedOpSlot?.time || '10:00 AM');
      const tokenNum = !isVideo ? selectedOpSlot?.tokenNumber : undefined;

      await onConfirmBooking({
        consultationType,
        doctorId: doctor.id,
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
            ? `Your HD Video Call with ${doctor.name} is scheduled for ${chosenTime}.`
            : `Your In-Person Token #${tokenNum} at ${hospital.name} is confirmed for ${chosenTime}.`,
          'TOKEN_CONFIRMATION'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-28 relative select-none"
    >
      {/* Sticky Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-4 h-4 shrink-0" />
          <span>Back</span>
        </button>

        <div className="text-center min-w-0 flex-1">
          <h2 className="text-xs font-bold text-slate-900 tracking-tight truncate">
            Book Consultation
          </h2>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            {hospital.name.split(' ')[0]} • ABDM Verified
          </p>
        </div>

        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>ABDM</span>
        </div>
      </div>

      {/* Main Scrollable Body */}
      <div className="p-4 space-y-4">
        
        {/* Doctor Showcase Card */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex items-start gap-3.5 relative overflow-hidden">
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {(doctor as any).avatar ? (
                <img src={(doctor as any).avatar} alt={doctor.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                doctor.name.replace('Dr. ', '').split(' ')[0][0]
              )}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight truncate">
                {doctor.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4.9</span>
              </div>
            </div>

            <p className="text-xs font-medium text-emerald-700 mt-0.5 truncate">
              {doctor.specialty}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1 truncate">
              <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{hospital.name}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold whitespace-nowrap shrink-0">
                Room {(doctor as any).roomNumber || '204'}
              </span>
              <span>•</span>
              <span className="whitespace-nowrap">14+ yrs clinical exp</span>
            </div>
          </div>
        </div>

        {/* Consultation Mode Switcher */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Choose Consultation Format
          </label>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setConsultationType('VIDEO_CONSULTATION')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isVideo
                  ? 'bg-white text-slate-950 font-bold shadow-xs ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Video className={`w-4 h-4 ${isVideo ? 'text-sky-600' : 'text-slate-500'}`} />
                <span className="text-xs">HD Video Call</span>
              </div>
              <span className={`text-[11px] tabular-nums ${isVideo ? 'text-sky-700 font-bold' : 'text-slate-500'}`}>
                ₹{doctor.teleConsultationFee || 200}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConsultationType('IN_PERSON_OPD')}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                !isVideo
                  ? 'bg-white text-slate-950 font-bold shadow-xs ring-1 ring-slate-300'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Building2 className={`w-4 h-4 ${!isVideo ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-xs">In-Person OPD</span>
              </div>
              <span className={`text-[11px] tabular-nums ${!isVideo ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                ₹{doctor.opConsultationFee || splitConfig.baseOpFee || 500}
              </span>
            </button>
          </div>
        </div>

        {/* Date Selection Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Select Appointment Day
          </label>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {dates.map((d) => {
              const isSelected = selectedDate.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`py-2.5 px-3.5 rounded-2xl border text-center transition-all cursor-pointer shrink-0 min-w-[70px] ${
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

        {/* Slot / Time Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            {isVideo ? 'Available Video Slots' : 'Available Clinic Token Slots'}
          </label>

          {isVideo ? (
            <div className="grid grid-cols-2 gap-2">
              {videoTimeSlots.map((slotTime) => {
                const isSelected = selectedVideoTime === slotTime;
                return (
                  <button
                    key={slotTime}
                    type="button"
                    onClick={() => setSelectedVideoTime(slotTime)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-50 text-sky-900 border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="truncate">{slotTime}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableDoctorSlots.length > 0 ? (
                availableDoctorSlots.map((slot) => {
                  const isSelected = selectedOpSlot?.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedOpSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-400/40 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="block font-bold">Token #{slot.tokenNumber}</span>
                        <span className="block text-[10px] font-normal text-slate-500">{slot.time}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full p-3 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                  No preset slots today. Next available walk-in token will be generated automatically.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Patient Profile & ABHA Identity Strip */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 min-w-0 flex-1 truncate">
              Patient Information
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold whitespace-nowrap shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Verified Account</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="font-bold text-slate-900 block">{patientProfile.name}</span>
              <span className="text-[11px] text-slate-500 font-mono">+91 {patientProfile.phone}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">ABDM ABHA ID</span>
              <span className="font-mono text-[11px] text-emerald-700 font-bold">ABHA-9842-8812-7491</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <input
              type="text"
              value={patientReason}
              onChange={(e) => setPatientReason(e.target.value)}
              placeholder="Optional: Brief reason for consult (e.g. Fever, routine BP check)"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 1-Tap Quick Offers & Referral Input */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Discounts & Subsidies
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">1-Tap Apply</span>
          </div>

          {!appliedVoucher ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                <button
                  type="button"
                  onClick={() => handleApplyCode('AYUSHMAN')}
                  className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  ⚡ AYUSHMAN (-₹20)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCode('PRIYA15')}
                  className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  🏷️ PRIYA15 (-₹15)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCode('BCARE10')}
                  className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  🎁 BCARE10 (-₹10)
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value);
                      setVoucherError('');
                    }}
                    placeholder="Have a voucher or nurse code?"
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyCode(voucherCode)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {voucherError && (
                <p className="text-[11px] text-rose-600 pl-1">{voucherError}</p>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <div>
                  <span className="font-mono font-bold">{appliedVoucher.code}</span>
                  <span className="text-[11px] text-emerald-700 ml-1.5 font-medium">{appliedVoucher.label}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppliedVoucher(null)}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Itemized Order Breakdown */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-900 text-xs">Billing Breakdown</span>
            <span className="text-[11px] text-slate-500">Standard Tier</span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span>{isVideo ? 'Doctor Video Consultation' : 'Doctor OPD Consultation'}</span>
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">₹{baseConsultFee}</span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Hospital Facility & Digital Token</span>
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">₹{platformFee}</span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>Statutory GST (5%)</span>
            </span>
            <span className="font-semibold text-slate-900 tabular-nums">₹{gstAmount}</span>
          </div>

          <div className="flex justify-between items-center gap-2 text-slate-500">
            <span className="flex items-center gap-1.5 min-w-0 flex-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">ABDM Health Record Cloud Sync</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
              Complimentary
            </span>
          </div>

          {appliedVoucher && (
            <div className="flex justify-between items-center text-emerald-700 font-bold pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Offer Discount ({appliedVoucher.code})</span>
              </span>
              <span className="tabular-nums">-₹{appliedVoucher.discount}</span>
            </div>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block px-1">
            Choose Payment Mode
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('UPI')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                paymentMethod === 'UPI'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span className="font-bold text-xs">Instant UPI</span>
              </div>
              <span className={`text-[10px] ${paymentMethod === 'UPI' ? 'text-slate-300' : 'text-slate-500'}`}>
                GPay, PhonePe, QR
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                paymentMethod === 'CARD'
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span className="font-bold text-xs">Cards / Bank</span>
              </div>
              <span className={`text-[10px] ${paymentMethod === 'CARD' ? 'text-slate-300' : 'text-slate-500'}`}>
                Visa, RuPay, NetBank
              </span>
            </button>

            {!isVideo && (
              <button
                type="button"
                onClick={() => setPaymentMethod('COUNTER')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'COUNTER'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span className="font-bold text-xs">Pay at Counter</span>
                </div>
                <span className={`text-[10px] ${paymentMethod === 'COUNTER' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Cash at Clinic Desk
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Security / Compliance Guarantee */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 py-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
          <span>•</span>
          <span>ABDM Compliant</span>
          <span>•</span>
          <span>100% Refund Guarantee</span>
        </div>

      </div>

      {/* Sticky Bottom Floating Action Bar */}
      <div className="sticky bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 p-3.5 sm:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 mt-auto">
        <div>
          <span className="text-[10px] text-slate-500 block font-medium">Total Payable</span>
          <div className="text-xl font-bold tracking-tight text-slate-950 flex items-center tabular-nums leading-none mt-0.5">
            <RollingCounter value={grandTotal} prefix="₹" height={24} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleProceedBooking}
          disabled={isProcessing}
          className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-98 ${
            isVideo
              ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sky-600/25'
              : 'bg-slate-950 hover:bg-slate-800 shadow-slate-950/20'
          }`}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>
                {paymentMethod === 'COUNTER'
                  ? 'Confirm Token (Pay at OPD)'
                  : isVideo
                  ? `Pay ₹${grandTotal} & Book Video Call`
                  : `Pay ₹${grandTotal} & Confirm Token`
                }
              </span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
