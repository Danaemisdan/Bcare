import React from 'react';
import { 
  Building2, 
  MapPin, 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Calendar,
  Stethoscope,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { OpSlot, DoctorProfile, Hospital, PatientProfile } from '../types';

interface OpdTokenPassCardProps {
  token: OpSlot;
  doctor?: DoctorProfile;
  hospital?: Hospital;
  patientProfile: PatientProfile;
  allSlots: OpSlot[];
  onViewPassModal: () => void;
  onTriggerWhatsAppToast: (title: string, message: string, type?: any) => void;
}

export const OpdTokenPassCard: React.FC<OpdTokenPassCardProps> = ({
  token,
  doctor,
  hospital,
  patientProfile,
  allSlots,
  onViewPassModal,
  onTriggerWhatsAppToast
}) => {
  const doctorName = doctor?.name || token.doctorName || 'Dr. Ananya Sharma, MD, DM';
  const doctorSpecialty = doctor?.specialty || token.specialty || 'Cardiology';
  const hospitalName = hospital?.name || token.hospitalName || 'City Care Multi-Specialty Hospital';
  const hospitalAddress = hospital?.address || '42 Avinashi Road, Peelamedu, Coimbatore';
  const roomNumber = doctor?.roomNumber || 'Room 204';
  const googleMapsUrl = hospital?.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospitalAddress)}`;

  // Date Context Determination
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const isToday = !token.date || token.date === today;
  const isTomorrow = token.date === tomorrow;

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr || dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const formattedDate = formatDateDisplay(token.date);

  // Queue Calculations (ONLY applicable if the appointment is for TODAY)
  const currentServingSlot = isToday 
    ? allSlots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId && (s.date === token.date || !s.date))
    : null;
  const currentServingToken = currentServingSlot?.tokenNumber ?? (isToday ? Math.max(1, token.tokenNumber - 2) : 1);
  const tokensAhead = isToday ? Math.max(0, token.tokenNumber - currentServingToken) : token.tokenNumber;
  const estimatedWait = tokensAhead * 6;

  const paddedToken = token.tokenNumber < 10 ? `0${token.tokenNumber}` : `${token.tokenNumber}`;
  const paddedServing = currentServingToken < 10 ? `0${currentServingToken}` : `${currentServingToken}`;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.07)] overflow-hidden relative text-slate-900 transition-all hover:border-slate-300">
      {/* Top Subtle Brand Gradient Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header: Hospital & Official Accreditation */}
      <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-[13px] text-slate-900 leading-snug">
              {hospitalName}
            </h4>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              {hospitalAddress}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 mt-0.5 ${
          !isToday
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : token.status === 'IN_CONSULTATION'
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : tokensAhead === 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-teal-50 text-teal-800 border-teal-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            !isToday 
              ? 'bg-blue-500' 
              : token.status === 'IN_CONSULTATION' 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
          }`} />
          <span>
            {!isToday
              ? 'Confirmed Pass'
              : token.status === 'IN_CONSULTATION'
                ? 'In Consultation'
                : tokensAhead === 0
                  ? 'Your Turn Next'
                  : 'Live in Queue'
            }
          </span>
        </span>
      </div>

      {/* Main Ticket Hero Body */}
      <div className="p-4 space-y-3.5">
        {/* Hero Token Block */}
        <div className="flex items-stretch justify-between gap-3 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          {/* Left: Token Number & Session Info */}
          <div className="flex flex-col justify-between min-w-0 pr-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Official OPD Token Pass
              </span>
              <div className="flex items-baseline gap-2.5 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                  #{paddedToken}
                </span>
                {isToday ? (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    tokensAhead === 0 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {tokensAhead === 0 ? '● You are next!' : `● ${tokensAhead} ahead`}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {formattedDate}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-2 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isToday 
                  ? `Slot: ${token.time || '09:00 AM'} • Arrive 10m before call`
                  : `Scheduled: ${formattedDate} at ${token.time || '09:00 AM'}`}
              </span>
            </div>
          </div>

          {/* Right: Live Queue or Advance Status Box */}
          <div className="shrink-0 flex flex-col justify-center items-end pl-3 border-l border-white/10">
            {isToday ? (
              <div className="text-right bg-white/5 rounded-xl p-2.5 border border-white/10 min-w-[95px]">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                  Now in Room
                </span>
                <span className="text-2xl font-black text-emerald-400 tabular-nums block leading-tight mt-0.5">
                  #{paddedServing}
                </span>
                <span className="text-[10px] text-slate-300 block font-medium mt-0.5">
                  {tokensAhead === 0 ? 'Proceed inside' : `~${estimatedWait}m wait`}
                </span>
              </div>
            ) : (
              <div className="text-right bg-white/5 rounded-xl p-2.5 border border-white/10 min-w-[95px]">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
                  OPD Session
                </span>
                <span className="text-lg font-black text-blue-300 block leading-tight mt-0.5">
                  Morning
                </span>
                <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                  Opens 08:30 AM
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Context / Guidance Strip */}
        {isToday ? (
          <div className={`p-3 rounded-2xl border text-xs ${
            tokensAhead === 0 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
              : 'bg-blue-50/70 border-blue-100 text-slate-700'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-bold pb-1.5 border-b border-black/5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Live OPD Flow</span>
              </span>
              <span className="font-extrabold text-blue-700">
                {tokensAhead === 0 
                  ? `Next in line for ${roomNumber}` 
                  : `Doctor consulting Token #${paddedServing}`}
              </span>
            </div>
            
            {/* Visual Queue Stepper */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 text-center text-[10px] font-bold">
              <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>1. Verified</span>
              </div>
              <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1 ${
                tokensAhead === 0 
                  ? 'bg-emerald-200/90 text-emerald-950 ring-1 ring-emerald-400' 
                  : 'bg-blue-100/70 text-blue-900'
              }`}>
                <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                <span>{tokensAhead === 0 ? '2. Call Ready' : '2. In Queue'}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center gap-1">
                <Stethoscope className="w-3 h-3 text-slate-500 shrink-0" />
                <span>3. {roomNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs">
                Appointment confirmed for {formattedDate}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Your queue position is locked. Arrive at the OPD desk by {token.time || '08:50 AM'}.
              </p>
            </div>
          </div>
        )}

        {/* Tactile Perforated Ticket Notches */}
        <div className="relative flex items-center justify-between select-none -mx-4 py-0.5">
          <div className="w-3.5 h-6 bg-slate-100 rounded-r-full border-r border-slate-200/80 -ml-0" />
          <div className="flex-1 border-b-2 border-dashed border-slate-200 mx-2" />
          <div className="w-3.5 h-6 bg-slate-100 rounded-l-full border-l border-slate-200/80 -mr-0" />
        </div>

        {/* Doctor, Room, Patient & Billing Grid (Zero truncation, full clarity) */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/90 p-3 rounded-2xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Attending Doctor
            </span>
            <span className="font-extrabold text-slate-900 block leading-tight mt-0.5">
              {doctorName}
            </span>
            <span className="text-[11px] text-blue-700 font-semibold block mt-0.5">
              {doctorSpecialty}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Consultation Room
            </span>
            <span className="font-extrabold text-slate-900 block leading-tight mt-0.5">
              {roomNumber}
            </span>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
              OPD Wing • 2nd Floor
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Patient
            </span>
            <span className="font-bold text-slate-900 block leading-tight mt-0.5">
              {patientProfile.name}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              ABHA: 91-9845-0112-2384
            </span>
          </div>

          <div className="pt-1.5 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Payment Status
            </span>
            <span className="font-extrabold text-emerald-700 block leading-tight mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>₹{token.feePaid || 100} Paid</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              UPI • Non-Cancellable
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={onViewPassModal}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>View Pass & QR</span>
          </button>

          <button
            type="button"
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer active:scale-95"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Navigate (Maps)</span>
          </button>
        </div>

        {/* Security & Token Guarantee Notice */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-0.5">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ABDM Accredited Pass</span>
          </span>

          <button
            type="button"
            onClick={() => onTriggerWhatsAppToast(
              'OP Queue Pass',
              `Token #${token.tokenNumber} pass sent to WhatsApp (+91 ${patientProfile.phone})`,
              'TOKEN_CONFIRMATION'
            )}
            className="text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Send to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
