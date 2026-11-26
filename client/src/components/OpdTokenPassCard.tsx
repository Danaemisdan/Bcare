import React, { useState } from 'react';
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
  Check,
  Sparkles
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
  onCompleteToken?: (tokenId: string) => Promise<any> | void;
}

export const OpdTokenPassCard: React.FC<OpdTokenPassCardProps> = ({
  token,
  doctor,
  hospital,
  patientProfile,
  allSlots,
  onViewPassModal,
  onTriggerWhatsAppToast,
  onCompleteToken
}) => {
  const [isCompletedState, setIsCompletedState] = useState(token.status === 'COMPLETED');
  const [isVanishing, setIsVanishing] = useState(false);

  const doctorName = doctor?.name || token.doctorName || 'Dr. Ananya Sharma, MD, DM';
  const doctorSpecialty = doctor?.specialty || token.specialty || 'Cardiology';
  const hospitalName = hospital?.name || token.hospitalName || 'City Care Multi-Specialty Hospital';
  const hospitalAddress = hospital?.address || '42 Avinashi Road, Peelamedu, Coimbatore';
  const roomNumber = doctor?.roomNumber || 'Room 204';

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

  // Queue Calculations
  const currentServingSlot = isToday 
    ? allSlots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId && (s.date === token.date || !s.date))
    : null;
  const currentServingToken = currentServingSlot?.tokenNumber ?? (isToday ? Math.max(1, token.tokenNumber - 2) : 1);
  const tokensAhead = isToday ? Math.max(0, token.tokenNumber - currentServingToken) : token.tokenNumber;
  const estimatedWait = tokensAhead * 6;

  const paddedToken = token.tokenNumber < 10 ? `0${token.tokenNumber}` : `${token.tokenNumber}`;
  const paddedServing = currentServingToken < 10 ? `0${currentServingToken}` : `${currentServingToken}`;

  // Handle Mark Done & Vanish to History Flow
  const handleMarkAsDone = async () => {
    setIsCompletedState(true);
    // Show completed badge and smooth vanish
    setTimeout(async () => {
      setIsVanishing(true);
      if (onCompleteToken) {
        await onCompleteToken(token.id);
      }
      onTriggerWhatsAppToast(
        'Consultation Completed',
        `Token #${paddedToken} for ${doctorName} marked as completed. Record saved to your Bookings history.`,
        'TOKEN_CONFIRMATION'
      );
    }, 1600);
  };

  // If completed and vanishing
  if (isVanishing) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-center transition-all duration-300 opacity-0 scale-95">
        <span className="text-xs font-bold text-emerald-800">✓ Completed & Moved to History</span>
      </div>
    );
  }

  // Done Confirmation Banner State
  if (isCompletedState) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-4 shadow-xl text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 mx-auto flex items-center justify-center">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
        <div>
          <h4 className="font-black text-sm text-white">OPD Consultation Completed</h4>
          <p className="text-xs text-emerald-300 font-semibold mt-0.5">
            Token #{paddedToken} • {doctorName} ({hospitalName})
          </p>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          ✓ Nurse/Doctor confirmed consultation • Saved to your Bookings History
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden relative text-slate-900 transition-all hover:border-slate-300">
      {/* Top Subtle Gradient Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* COMPACT OPD PASS CONTAINER */}
      <div className="p-3.5 space-y-2.5">
        {/* Row 1: Hospital Name + Room + Live Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-extrabold text-xs text-slate-900 truncate leading-tight">
                {hospitalName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">
                {roomNumber} • OPD 2nd Floor
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border flex items-center gap-1 shrink-0 ${
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
                ? formattedDate
                : token.status === 'IN_CONSULTATION'
                  ? 'In Room'
                  : tokensAhead === 0
                    ? 'Your Turn'
                    : 'Live in Queue'
              }
            </span>
          </span>
        </div>

        {/* Row 2: Streamlined Dark Pass Ticket */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs border border-slate-800">
          {/* Left: Your Token */}
          <div className="min-w-0 flex-1">
            <span className="text-[9.5px] uppercase font-bold tracking-wider text-slate-400 block">
              Your OPD Token
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                #{paddedToken}
              </span>
              <span className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded ${
                isToday 
                  ? tokensAhead === 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-white/10 text-slate-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}>
                {isToday 
                  ? (tokensAhead === 0 ? '● You are next' : `● ${tokensAhead} ahead (~${estimatedWait}m)`)
                  : formattedDate}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 font-medium truncate mt-1">
              {doctorName} ({doctorSpecialty})
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="w-px h-12 bg-white/10 shrink-0" />

          {/* Right: Now Serving */}
          <div className="text-right shrink-0 min-w-[75px]">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
              Now Serving
            </span>
            <span className="text-2xl font-black text-emerald-400 tabular-nums block leading-tight mt-0.5">
              #{paddedServing}
            </span>
            <span className="text-[9.5px] text-slate-400 block font-medium mt-0.5">
              Slot: {token.time || '09:00 AM'}
            </span>
          </div>
        </div>

        {/* Row 3: Compact Footer with Patient + View Pass + Mark Done Button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="min-w-0 flex-1">
            <span className="text-[10.5px] font-bold text-slate-800 truncate block">
              Patient: {patientProfile.name}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block">
              ₹{token.feePaid || 100} Paid via UPI • Queue Locked
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Pass Modal Button */}
            <button
              type="button"
              onClick={onViewPassModal}
              className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pass & QR</span>
            </button>

            {/* Nurse/Doctor Done & Vanish Button */}
            <button
              type="button"
              onClick={handleMarkAsDone}
              title="Nurse or clinic confirmed: consultation completed, move to history"
              className="py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};