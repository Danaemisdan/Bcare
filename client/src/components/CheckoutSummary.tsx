import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Video, 
  Building2, 
  Clock, 
  Calendar, 
  Tag, 
  Check, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Receipt, 
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { RollingCounter } from './RollingCounter';
import { PhoneModalPortal } from './PhoneModalPortal';

export type ConsultationType = 'IN_PERSON_OPD' | 'VIDEO_CONSULTATION';

export interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  consultationType: ConsultationType;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar?: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  tokenNumber?: number;
  baseFee: number;
  doctorShare: number;
  platformShare: number;
  gstAmount: number;
  patientName: string;
  patientPhone: string;
  abhaId?: string;
  onConfirmPayment: (paymentDetails: {
    method: 'UPI' | 'CARD' | 'COUNTER';
    voucherCode?: string;
    totalPaid: number;
  }) => Promise<void>;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  isOpen,
  onClose,
  consultationType,
  doctorName,
  doctorSpecialty,
  doctorAvatar,
  hospitalName,
  date,
  timeSlot,
  tokenNumber,
  baseFee,
  doctorShare,
  platformShare,
  gstAmount,
  patientName,
  patientPhone,
  abhaId = 'ABHA-9842-8812-7491',
  onConfirmPayment
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'COUNTER'>(
    consultationType === 'IN_PERSON_OPD' ? 'UPI' : 'UPI'
  );
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isVideo = consultationType === 'VIDEO_CONSULTATION';

  const handleApplyCode = (codeToApply: string) => {
    setVoucherError('');
    const clean = codeToApply.trim().toUpperCase();

    if (!clean) return;

    if (clean === 'NURSE-PRIYA-782' || clean === 'PRIYA15') {
      setAppliedVoucher({
        code: clean,
        discount: 15,
        label: 'Nurse Referral (₹15 off)'
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

  const handleApplyVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleApplyCode(voucherCode);
  };

  const discountValue = appliedVoucher ? appliedVoucher.discount : 0;
  const grandTotal = Math.max(0, baseFee - discountValue);

  const handleProceed = async () => {
    setIsProcessing(true);
    try {
      await onConfirmPayment({
        method: paymentMethod,
        voucherCode: appliedVoucher?.code,
        totalPaid: grandTotal
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PhoneModalPortal>
      <AnimatePresence>
        <div 
          className="absolute inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
          onClick={onClose}
        >
          {/* iOS Liquid Glass Bottom Sheet Drawer */}
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
            className="relative w-full max-h-[88%] bg-white/95 backdrop-blur-2xl backdrop-saturate-150 rounded-t-[32px] border-t border-white/80 shadow-[0_-25px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col overflow-hidden text-slate-900 select-none"
          >
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300/90 rounded-full mx-auto my-2.5 shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Specular Edge Highlight */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            {/* Sheet Header */}
            <div className="px-5 pb-3 border-b border-slate-100/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight shadow-xs ${
                  isVideo 
                    ? 'bg-sky-50 text-sky-700 border border-sky-200/80' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                }`}>
                  {isVideo ? <Video className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" /> : <Building2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />}
                  <span>{isVideo ? 'HD Video Consultation' : 'In-Person OPD Token'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">B care Checkout</span>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Sheet Content */}
            <div className="overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-none flex-1 overscroll-contain">
              
              {/* Doctor & Consultation Summary Card */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  {doctorAvatar ? (
                    <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    doctorName.replace('Dr. ', '').split(' ')[0][0]
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <h3 className="font-semibold text-xs text-slate-900 tracking-tight truncate">
                      {doctorName}
                    </h3>
                    {tokenNumber && !isVideo && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold shrink-0">
                        Token #{tokenNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{doctorSpecialty} • {hospitalName}</p>

                  <div className="mt-1 flex items-center gap-2.5 text-[10px] text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{date}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeSlot}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient & ABDM Health Strip */}
              <div className="px-3 py-2 rounded-xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block">Patient Profile</span>
                  <span className="font-semibold text-slate-800 text-xs truncate block">{patientName} ({patientPhone})</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] text-slate-400 font-medium block">ABDM ABHA ID</span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold">{abhaId}</span>
                </div>
              </div>

              {/* Itemized Order Breakdown */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-semibold text-slate-900 tracking-tight">Fee Summary</span>
                  <span className="text-[10px] text-slate-400 font-normal">Standard Tier</span>
                </div>

                <div className="space-y-1.5 text-xs rounded-2xl border border-slate-200/80 p-3 bg-white divide-y divide-slate-100">
                  {/* Doctor Consultation */}
                  <div className="flex justify-between items-center text-slate-700 pb-1.5">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isVideo ? 'HD Teleconsultation Session' : 'Doctor Consultation Fee'}</span>
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums text-xs">₹{doctorShare}</span>
                  </div>

                  {/* Hospital & Queue Facility */}
                  <div className="flex justify-between items-center pt-1.5 pb-1.5 text-slate-700">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hospital Facility & Token Queue</span>
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums text-xs">₹{platformShare}</span>
                  </div>

                  {/* Statutory GST */}
                  <div className="flex justify-between items-center pt-1.5 pb-1.5 text-slate-700">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Receipt className="w-3.5 h-3.5 text-slate-400" />
                      <span>Statutory GST (5%)</span>
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums text-xs">₹{gstAmount}</span>
                  </div>

                  {/* Complimentary ABDM Cloud Sync */}
                  <div className="flex justify-between items-center pt-1.5 pb-1.5 text-slate-500">
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ABDM Digital Cloud Sync</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      Complimentary
                    </span>
                  </div>

                  {/* Voucher Discount */}
                  {appliedVoucher && (
                    <div className="flex justify-between items-center pt-1.5 text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="truncate">{appliedVoucher.label}</span>
                      </span>
                      <span className="tabular-nums shrink-0 text-xs">-₹{appliedVoucher.discount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Tap Quick Promo Chips & Input */}
              <div className="space-y-1.5">
                {!appliedVoucher ? (
                  <>
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick Offers:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyCode('AYUSHMAN')}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-semibold shrink-0 transition-colors"
                      >
                        ⚡ AYUSHMAN (-₹20)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCode('PRIYA15')}
                        className="px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-semibold shrink-0 transition-colors"
                      >
                        🏷️ PRIYA15 (-₹15)
                      </button>
                    </div>

                    <form onSubmit={handleApplyVoucherSubmit} className="flex gap-1.5">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value);
                            setVoucherError('');
                          }}
                          placeholder="Promo or Nurse code"
                          className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span className="font-mono font-bold">{appliedVoucher.code}</span>
                      <span className="text-[10px] text-emerald-700 font-normal">applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedVoucher(null)}
                      className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {voucherError && (
                  <p className="text-[10px] text-rose-600 pl-1">{voucherError}</p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-slate-900 tracking-tight block">
                  Payment Method
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'UPI'
                        ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Instant UPI</span>
                    </div>
                    <span className={`text-[9px] ${paymentMethod === 'UPI' ? 'text-slate-300' : 'text-slate-500'}`}>
                      GPay, PhonePe, QR
                    </span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">Card / Bank</span>
                    </div>
                    <span className={`text-[9px] ${paymentMethod === 'CARD' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Visa, RuPay, NetBank
                    </span>
                  </button>

                  {/* Counter (if In-Person) */}
                  {!isVideo && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('COUNTER')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer ${
                        paymentMethod === 'COUNTER'
                          ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="font-bold text-[11px]">Pay at Counter</span>
                      </div>
                      <span className={`text-[9px] ${paymentMethod === 'COUNTER' ? 'text-slate-300' : 'text-slate-500'}`}>
                        Cash at Hospital
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Total Payable Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-normal">Total Amount</span>
                  <span className="text-[9px] text-emerald-400 font-medium">ABDM & GST included</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold tracking-tight text-white flex items-center justify-end tabular-nums">
                    <RollingCounter value={grandTotal} prefix="₹" height={24} />
                  </span>
                </div>
              </div>

              {/* Trust Subtext */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 py-1">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span>•</span>
                <span>100% Refund Guarantee</span>
              </div>

            </div>

            {/* Bottom Action Bar */}
            <div className="p-3.5 border-t border-slate-100 bg-white/90 backdrop-blur-md flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceed}
                disabled={isProcessing}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer ${
                  isVideo 
                    ? 'bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700' 
                    : 'bg-slate-950 hover:bg-slate-800'
                }`}
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'COUNTER' 
                        ? 'Confirm Reservation (Pay at OPD)' 
                        : isVideo
                        ? `Pay ₹${grandTotal} & Start HD Video Call`
                        : `Authorize & Pay ₹${grandTotal}`
                      }
                    </span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>
    </PhoneModalPortal>
  );
};
