import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hospital, 
  DoctorProfile, 
  OpSlot, 
  DigitalPrescription, 
  CommunityPost, 
  PatientProfile, 
  RevenueSplitConfig,
  PlatformSettings,
  VideoAppointment
} from '../types';
import { ProgressiveProfileBanner } from '../components/ProgressiveProfileBanner';
import { TeleconsultRoomModal } from '../components/TeleconsultRoomModal';
import { CheckoutSummary, ConsultationType } from '../components/CheckoutSummary';
import { BookingConsultationScreen } from '../components/BookingConsultationScreen';
import { AiHealthAssistant } from '../components/AiHealthAssistant';
import { PhoneModalPortal } from '../components/PhoneModalPortal';
import { generatePrescriptionPdf } from '../utils/pdfGenerator';
import { 
  Building2, 
  Stethoscope, 
  Clock, 
  Video, 
  MessageSquare, 
  MessageCircle, 
  FileText, 
  Users, 
  CheckCircle2, 
  Check,
  Star, 
  ArrowRight, 
  ShieldCheck,
  Send,
  Image as ImageIcon,
  ThumbsUp,
  X,
  ChevronLeft,
  Sparkles,
  HeartPulse,
  Bone,
  Brain,
  Baby,
  User,
  QrCode,
  Copy,
  Heart,
  Activity,
  PhoneCall,
  AlertTriangle,
  FileCheck2,
  Share2,
  Lock,
  Bell,
  Globe,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  LogOut,
  Search,
  MapPin,
  Calendar,
  Ticket,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { LiquidGlassButton } from '../components/LiquidGlass';

interface PatientPortalProps {
  patientProfile: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  prescriptions: DigitalPrescription[];
  communityPosts: CommunityPost[];
  splitConfig: RevenueSplitConfig;
  platformSettings?: PlatformSettings;
  isMobile?: boolean;
  activeTab?: 'op_booking' | 'telehealth' | 'ai_assist' | 'history' | 'profile';
  onTabChange?: (tab: 'op_booking' | 'telehealth' | 'ai_assist' | 'history' | 'profile') => void;
  onBookSlot: (slotId: string, patientName: string, patientPhone: string, referralCode?: string) => Promise<any>;
  onCancelSlot?: (slotId: string) => Promise<any>;
  onBookVideoConsultation?: (bookingData: any) => Promise<any>;
  onUpdateProfile: (updatedData: Partial<PatientProfile>) => Promise<void>;
  onAddCommunityPost: (post: { category: string; title: string; content: string }) => Promise<void>;
  onAddCommunityComment: (postId: string, content: string) => Promise<void>;
  onTriggerWhatsAppToast: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
  onBookingScreenToggle?: (isOpen: boolean) => void;
  onLogout?: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patientProfile,
  hospitals,
  doctors,
  slots,
  prescriptions,
  communityPosts,
  splitConfig,
  platformSettings,
  isMobile = false,
  activeTab: controlledTab,
  onTabChange,
  onBookSlot,
  onCancelSlot,
  onBookVideoConsultation,
  onUpdateProfile,
  onAddCommunityPost,
  onAddCommunityComment,
  onTriggerWhatsAppToast,
  onBookingScreenToggle,
  onLogout
}) => {
  const [internalTab, setInternalTab] = useState<'op_booking' | 'telehealth' | 'ai_assist' | 'history' | 'profile'>('op_booking');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = (tab: 'op_booking' | 'telehealth' | 'ai_assist' | 'history' | 'profile') => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PRESCRIPTIONS' | 'TOKENS'>('ALL');
  const [copiedAbha, setCopiedAbha] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Discovery and Area Navigation States (Defaults to Hospitals near you)
  const [directoryMode, setDirectoryMode] = useState<'doctors' | 'hospitals'>('hospitals');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [consultationFilter, setConsultationFilter] = useState<'ALL' | 'IN_PERSON' | 'VIDEO'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dedicated Full-Page Booking Screen State
  const [activeBookingTarget, setActiveBookingTarget] = useState<{
    doctor: DoctorProfile;
    hospital: Hospital;
    consultationType: ConsultationType;
    slot?: OpSlot;
  } | null>(null);

  // Active Video Appointments State
  const [userVideoAppointments, setUserVideoAppointments] = useState<VideoAppointment[]>([]);
  const [activeVideoModalDoc, setActiveVideoModalDoc] = useState<DoctorProfile | null>(null);

  // OP Booking States
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedHospital, setSelectedHospital] = useState<Hospital>(hospitals[0]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile>(doctors[0]);
  const [nurseReferralCode, setNurseReferralCode] = useState<string>('');
  const [bookingSlot, setBookingSlot] = useState<OpSlot | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<OpSlot | null>(null);

  // Telehealth States
  const [teleconsultModalOpen, setTeleconsultModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: string; sender: 'user' | 'bot' | 'doctor'; text: string; time: string; image?: string }[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `Hello ${patientProfile.name}! I am your B care Clinical Assistant. Share your symptoms or attach a photo of visible symptoms (wound, rash, edema), and I will brief Dr. Ananya Sharma before your consultation.`,
      time: '10:00 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImage, setChatImage] = useState<string | null>(null);

  // Community State
  const [communityCategory, setCommunityCategory] = useState<string>('All');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Cardiology');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [upvotedPosts, setUpvotedPosts] = useState<Record<string, number>>({});
  const [showLivePassModal, setShowLivePassModal] = useState(false);

  // Luxury Banner Carousel State (Apollo 24/7 Inspired with High-End Polish)
  const [activeBanner, setActiveBanner] = useState(0);
  const banners = [
    {
      id: 'abdm',
      tag: 'ABDM Ayushman Bharat',
      title: 'Digital Health Mission OPD',
      desc: '100% Cashless OPD tokens & verified ABHA health records.',
      actionText: 'Explore ABHA',
      actionTab: 'profile' as const,
      bg: 'from-emerald-950 via-teal-950 to-slate-900',
      tagBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
    },
    {
      id: 'opd',
      tag: 'Fast-Track Queue',
      title: 'Live Outpatient Passes',
      desc: 'Cardiology, Orthopedic & Neuro OPD tokens open today.',
      actionText: 'Book Token',
      actionTab: 'op_booking' as const,
      bg: 'from-slate-950 via-slate-900 to-[#0a1f18]',
      tagBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30'
    },
    {
      id: 'telehealth',
      tag: 'HD Telehealth',
      title: 'Doctor Video Consultation',
      desc: 'Connect in 2 minutes with top specialists from home.',
      actionText: 'Consult Now',
      actionTab: 'telehealth' as const,
      bg: 'from-[#0b1727] via-slate-900 to-[#0a1e1b]',
      tagBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const specialties = ['All', 'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'General Medicine', 'Dermatology'];
  const areas = ['All', 'Coimbatore South', 'Coimbatore Central', 'Pollachi Rural'];

  // Enhanced Doctor Directory Filtering
  const allFilteredDoctors = doctors.filter(doc => {
    if (selectedSpecialty !== 'All' && doc.specialty.toLowerCase() !== selectedSpecialty.toLowerCase()) {
      return false;
    }
    if (selectedArea !== 'All') {
      const hosp = hospitals.find(h => h.id === doc.hospitalId);
      if (hosp && hosp.districtName !== selectedArea) return false;
    }
    if (consultationFilter === 'VIDEO' && !doc.videoAvailable) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchSpec = doc.specialty.toLowerCase().includes(q);
      const matchHosp = doc.hospitalName.toLowerCase().includes(q);
      if (!matchName && !matchSpec && !matchHosp) return false;
    }
    return true;
  });

  // Enhanced Hospital Directory Filtering
  const allFilteredHospitals = hospitals.filter(hosp => {
    if (selectedSpecialty !== 'All' && !hosp.specialties.includes(selectedSpecialty)) {
      return false;
    }
    if (selectedArea !== 'All' && hosp.districtName !== selectedArea) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = hosp.name.toLowerCase().includes(q);
      const matchAddress = hosp.address.toLowerCase().includes(q);
      const matchSpec = hosp.specialties.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchAddress && !matchSpec) return false;
    }
    return true;
  });

  const filteredHospitals = allFilteredHospitals;
  const filteredDoctors = allFilteredDoctors;
  const activeDoctor = filteredDoctors[0] || selectedDoctor || doctors[0];
  const doctorSlots = slots.filter(s => s.doctorId === activeDoctor.id);

  const activeUserTokens = slots.filter(s => (s.patientPhone === patientProfile.phone || (patientProfile.userId && s.patientId === patientProfile.userId)) && (s.status === 'BOOKED' || s.status === 'IN_CONSULTATION'));

  const handleOpenCheckout = (doc: DoctorProfile, type: ConsultationType, explicitSlot?: OpSlot) => {
    const hosp = hospitals.find(h => h.id === doc.hospitalId) || hospitals[0];
    const targetSlot = explicitSlot || slots.find(s => s.doctorId === doc.id && s.status === 'AVAILABLE') || slots[0];

    setActiveBookingTarget({
      doctor: doc,
      hospital: hosp,
      consultationType: type,
      slot: targetSlot
    });
    if (onBookingScreenToggle) onBookingScreenToggle(true);
  };

  // Handle Token Booking
  const handleConfirmBooking = async () => {
    if (!bookingSlot) return;
    setBookingLoading(true);
    try {
      await onBookSlot(
        bookingSlot.id,
        patientProfile.name,
        patientProfile.phone,
        nurseReferralCode.trim() || undefined
      );

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 }
      });

      setBookedConfirmation(bookingSlot);
      setBookingSlot(null);
      setNurseReferralCode('');

      onTriggerWhatsAppToast(
        'OP Token Confirmed',
        `B care Token #${bookingSlot.tokenNumber} is confirmed for ${bookingSlot.time} at ${selectedHospital.name} with ${activeDoctor.name}.\nFee: ₹${splitConfig.baseOpFee} (Doctor ₹${splitConfig.doctorFee}, GST ₹${splitConfig.gstAmount}).`,
        'TOKEN_CONFIRMATION'
      );
    } catch (err: any) {
      alert(err.message || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatImage) return;

    const userMsg = {
      id: `cm-${Date.now()}`,
      sender: 'user' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: chatImage || undefined
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatImage(null);

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: `cm-bot-${Date.now()}`,
          sender: 'doctor' as const,
          text: `Doctor Ananya has reviewed your intake notes and physical media. Please join the live video consultation room.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const specialtyPills = [
    { id: 'All', label: 'All Specialists', icon: Sparkles },
    { id: 'Cardiology', label: 'Cardiology', icon: HeartPulse },
    { id: 'Orthopedics', label: 'Orthopedics', icon: Bone },
    { id: 'Neurology', label: 'Neurology', icon: Brain },
    { id: 'Pediatrics', label: 'Pediatrics', icon: Baby },
    { id: 'General Medicine', label: 'General Medicine', icon: Stethoscope }
  ];

  if (activeBookingTarget) {
    return (
      <BookingConsultationScreen
        doctor={activeBookingTarget.doctor}
        hospital={activeBookingTarget.hospital}
        initialType={activeBookingTarget.consultationType}
        initialSlot={activeBookingTarget.slot}
        allSlots={slots}
        patientProfile={patientProfile}
        splitConfig={splitConfig}
        onBack={() => {
          setActiveBookingTarget(null);
          if (onBookingScreenToggle) onBookingScreenToggle(false);
        }}
        onConfirmBooking={async (details) => {
          if (details.consultationType === 'VIDEO_CONSULTATION') {
            if (onBookVideoConsultation) {
              await onBookVideoConsultation({
                doctorId: details.doctorId,
                patientName: patientProfile.name,
                patientPhone: patientProfile.phone,
                scheduledTime: details.timeSlot,
                consultationFee: details.totalPaid,
                hospitalId: details.hospitalId,
                paymentStatus: 'PAID',
                paymentMethod: details.paymentMethod,
                voucherCode: details.voucherCode
              });
            }
          } else {
            const targetSlot = details.slotId 
              ? slots.find(s => s.id === details.slotId)
              : slots.find(s => s.doctorId === details.doctorId && s.status === 'AVAILABLE') || slots[0];
            if (targetSlot) {
              await onBookSlot(targetSlot.id, patientProfile.name, patientProfile.phone, details.voucherCode);
            }
          }

          setActiveBookingTarget(null);
          if (onBookingScreenToggle) onBookingScreenToggle(false);
          setActiveTab('op_booking');

          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.55 }
          });
        }}
        onTriggerWhatsAppToast={onTriggerWhatsAppToast}
      />
    );
  }

  return (
    <div className="space-y-4 pb-28 sm:pb-16">
      
      {/* Real-Time Admin Broadcast Ribbon (Minimalist Frosted Banner, Desktop Only) */}
      {!isMobile && platformSettings?.broadcastBanner?.enabled && (
        <div className="px-3.5 py-2 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-2.5 shadow-sm text-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="font-normal text-[12px] text-slate-200 truncate">
              {platformSettings.broadcastBanner.text}
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-300 shrink-0 hover:underline cursor-pointer">
            View →
          </span>
        </div>
      )}
      
      {/* Patient Header: Sleek Minimal Greeting & Context-Aware Quick Care */}
      {isMobile ? (
        activeTab === 'op_booking' && (
          <div className="space-y-3">
            {/* Header Row: Welcoming Greeting + Clean ABDM Badge */}
            <div className="flex items-center justify-between pt-1 pb-0.5 px-0.5">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5 text-slate-500 text-[11px] font-medium tracking-tight">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="relative inline-flex items-center cursor-pointer">
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="appearance-none bg-transparent pr-4 font-semibold text-slate-800 text-[11px] cursor-pointer focus:outline-none"
                    >
                      {areas.map(a => (
                        <option key={a} value={a}>{a === 'All' ? 'Coimbatore (All Areas)' : a}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />
                  </div>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold">24/7 OPD</span>
                </div>
                <h1 className="text-xl font-bold text-slate-950 tracking-tight leading-tight">
                  Good morning, {patientProfile.name.split(' ')[0]}
                </h1>
              </div>

              {/* Clean Verified ABDM Badge */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ABDM Verified</span>
              </button>
            </div>

            {/* Live OPD Token Pass: ONLY rendered if user has an active booked token */}
            {activeUserTokens.length > 0 && (() => {
              const token = activeUserTokens[0];
              const bookedDoctor = doctors.find(d => d.id === token.doctorId);
              const bookedHospital = hospitals.find(h => h.id === token.hospitalId) || 
                                     hospitals.find(h => h.name.toLowerCase().includes(token.hospitalName?.toLowerCase() || '')) ||
                                     hospitals[0];
              const doctorName = bookedDoctor?.name || token.doctorName || 'Attending Physician';
              const doctorSpecialty = bookedDoctor?.specialty || token.specialty || 'General Medicine';
              const hospitalName = bookedHospital?.name || token.hospitalName || 'Medical Centre';
              const roomNumber = bookedDoctor?.roomNumber || 'Room 104';
              const doctorInitials = doctorName.replace(/^Dr\.\s*/i, '').split(' ').map(n => n[0]).slice(0, 2).join('') || 'DR';

              // Queue Calculation
              const currentServingSlot = slots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId);
              const currentServingToken = currentServingSlot?.tokenNumber ?? Math.max(1, token.tokenNumber - 2);
              const tokensAhead = Math.max(0, token.tokenNumber - currentServingToken);
              const estimatedWait = tokensAhead * 6;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b121e] via-[#08181f] to-[#041d19] text-white border border-emerald-500/30 shadow-[0_16px_36px_-8px_rgba(4,29,25,0.4)] p-4 sm:p-5 space-y-3 transition-all"
                >
                  {/* Glowing Specular Hairline */}
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none" />
                  {/* Subtle Background Radial Glow */}
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Row: Live Queue Indicator & Status Chip */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 font-mono">
                        Active OPD Token Pass
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      token.status === 'IN_CONSULTATION'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    }`}>
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : '● Live in Queue'}
                    </span>
                  </div>

                  {/* Ticket Body: Pass Badge + Dynamic Doctor & Hospital Details */}
                  <div className="grid grid-cols-[auto_1fr] gap-3.5 items-center">
                    {/* Left Column: Monospace Token Pass Badge */}
                    <div className="flex flex-col items-center justify-center px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[76px] shadow-inner">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 font-mono">
                        TOKEN
                      </span>
                      <span className="text-3xl font-extrabold font-mono tracking-tight text-white my-0.5 tabular-nums">
                        #{token.tokenNumber < 10 ? `0${token.tokenNumber}` : token.tokenNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-300 font-mono">
                        {token.time}
                      </span>
                    </div>

                    {/* Right Column: Doctor & Hospital Metadata */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-400/30">
                          {doctorInitials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate leading-tight">
                            {doctorName}
                          </h4>
                          <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded mt-0.5">
                            {doctorSpecialty}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate pt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hospitalName}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-medium shrink-0">{roomNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Queue Progress Timeline */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Serving: <strong className="text-white font-mono font-bold">#{currentServingToken}</strong>
                      </span>
                      <span className="text-emerald-300 font-bold font-mono">
                        {tokensAhead === 0 ? 'You are next in line!' : `~${estimatedWait} mins (${tokensAhead} ahead)`}
                      </span>
                    </div>

                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden flex">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(15, (currentServingToken / token.tokenNumber) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons: View Full Pass / Cancel */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setShowLivePassModal(true)}
                      className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pass & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Cancel Token #${token.tokenNumber} for ${doctorName}?`)) {
                          if (onCancelSlot) {
                            await onCancelSlot(token.id);
                          }
                          onTriggerWhatsAppToast(
                            'Token Cancelled',
                            `Your Token #${token.tokenNumber} at ${hospitalName} has been cancelled.`,
                            'TOKEN_CONFIRMATION'
                          );
                        }
                      }}
                      className="py-2 px-3 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 font-medium text-xs border border-white/10 hover:border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel Token</span>
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-medium text-emerald-800 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Patient ID: #BC-9842
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
                {patientProfile.name}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                ABDM ABHA: <span className="tabular-nums text-zinc-700 font-semibold">91-9845-0112-2384</span> • Age {patientProfile.age || 48} ({patientProfile.gender || 'Male'}) • Blood Group: <span className="font-bold text-zinc-900">{patientProfile.bloodGroup || 'B+'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-subtle flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Status</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
              <div className="bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-subtle flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Rx Archive</span>
                <span className="text-xs font-semibold text-zinc-900">{prescriptions.length} Records</span>
              </div>
            </div>
          </div>

          <ProgressiveProfileBanner 
            profile={patientProfile} 
            onUpdateProfile={onUpdateProfile} 
            isMobile={false}
          />

          {/* Navigation Switcher: Desktop 5-Tab Segmented Bar */}
          <div className="bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 flex items-center gap-1 select-none overflow-x-auto">
            <button
              onClick={() => setActiveTab('op_booking')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'op_booking' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home & Nearby Hospitals</span>
            </button>

            <button
              onClick={() => setActiveTab('telehealth')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'telehealth' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Doctor Consultation & Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_assist')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ai_assist' ? 'bg-white text-teal-900 shadow-xs ring-1 ring-emerald-500/30' : 'text-teal-700 hover:text-teal-950'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Health Assistant</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'history' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>History ({prescriptions.length + activeUserTokens.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'profile' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Health Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: AREA DOCTOR & HOSPITAL DISCOVERY & BOOKING */}
      {/* ============================================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'op_booking' && (
          <motion.div
            key="op_booking"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3.5 pb-44"
          >
            {/* Active Booked Video Call or Toast Confirmation */}
          {(userVideoAppointments.length > 0 || bookedConfirmation) && (
            <div className="space-y-2">
              {/* Active Video Consultations */}
              {userVideoAppointments.map(app => (
                <div key={app.id} className="bg-sky-950 text-white rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md border border-sky-800 animate-in fade-in text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                      <Video className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-sky-100 truncate flex items-center gap-1.5">
                        <span>Video Consultation Confirmed</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      </h4>
                      <p className="text-[11px] text-sky-300 truncate">
                        {app.doctorName} ({app.doctorSpecialty}) • {app.time}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const doc = doctors.find(d => d.id === app.doctorId) || doctors[0];
                      setActiveVideoModalDoc(doc);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-xs shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Room</span>
                  </button>
                </div>
              ))}

              {/* Booking Confirmation Toast */}
              {bookedConfirmation && (
                <div className="bg-zinc-900 text-white rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-elevated border border-zinc-800 animate-in fade-in text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center tabular-nums font-bold text-xs shrink-0">
                      #{bookedConfirmation.tokenNumber}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-zinc-100 truncate">Token #{bookedConfirmation.tokenNumber} Reserved</h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {bookedConfirmation.time} • {bookedConfirmation.hospitalName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookedConfirmation(null)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Standalone Sleek Search Bar */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                directoryMode === 'hospitals'
                  ? "Search hospitals near you, facilities, areas..."
                  : "Search doctors, specialties, conditions..."
              }
              className="w-full text-xs pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-600 transition-all placeholder:text-slate-400 font-sans tracking-tight"
            />
            {searchQuery && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>

          {/* View Mode Switcher: Full-Width iOS-Style Segmented Control */}
          <div className="p-1 bg-slate-100 rounded-2xl border border-slate-200/70 grid grid-cols-2 gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setDirectoryMode('hospitals');
                setConsultationFilter('ALL');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                directoryMode === 'hospitals'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${directoryMode === 'hospitals' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Hospitals ({allFilteredHospitals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDirectoryMode('doctors');
                setConsultationFilter('ALL');
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                directoryMode === 'doctors'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 ${directoryMode === 'doctors' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Doctors ({allFilteredDoctors.length})</span>
            </button>
          </div>

          {/* Medical Specialty Selector Pills (Horizontal Rail without cluttered headers) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar w-full">
            {specialtyPills.map(spec => {
              const isSelected = selectedSpecialty === spec.id;
              const IconComponent = spec.icon;

              return (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(spec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200/90 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <IconComponent
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}
                    strokeWidth={1.8}
                  />
                  <span>{spec.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* VIEW A: ALL DOCTORS IN THE AREA */}
          {/* ============================================================== */}
          {directoryMode === 'doctors' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-0.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Specialist Doctors Near You
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
                    {allFilteredDoctors.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Sorted by distance
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {allFilteredDoctors.map((doc, idx) => {
                  const hosp = hospitals.find(h => h.id === doc.hospitalId);
                  const docOpSlots = slots.filter(s => s.doctorId === doc.id);
                  const isSelectedForSlotView = selectedDoctor?.id === doc.id;
                  const docInitials = doc.name.replace(/^Dr\.\s*/i, '').split(' ').map(n => n[0]).slice(0, 2).join('') || 'DR';

                  return (
                    <SlapBlock
                      key={doc.id}
                      variant="subtle-slap"
                      delay={Math.min(idx * 0.05, 0.25)}
                      className="w-full"
                    >
                      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all p-3.5 sm:p-4 space-y-3 relative overflow-hidden">
                        {/* Row 1: Doctor Avatar + Identity + Rating */}
                        <div className="flex items-start gap-3.5">
                          {/* Doctor Avatar with Online Status */}
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs border border-slate-100">
                              {docInitials}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </span>
                          </div>

                          {/* Doctor Identity & Hospital */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                {doc.specialty}
                              </span>
                              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-md text-[11px] font-bold text-amber-800 shrink-0">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                                <span>{doc.rating}</span>
                              </div>
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug line-clamp-1">
                              {doc.name}
                            </h4>

                            <p className="text-xs text-slate-500 truncate font-normal flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{doc.hospitalName} • {doc.distance || '1.2 km'}</span>
                            </p>

                            {/* Live OPD status & Experience */}
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium pt-0.5">
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Token #{doc.nextAvailableToken || 4} (~{doc.estimatedWaitMins || 10}m)
                              </span>
                              <span className="text-slate-300">•</span>
                              <span>{doc.experienceYears} Yrs Exp</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Dual Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              if (hosp) setSelectedHospital(hosp);
                              handleOpenCheckout(doc, 'IN_PERSON_OPD');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Normal Visit • ₹{doc.opConsultationFee || splitConfig.baseOpFee}</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              if (hosp) setSelectedHospital(hosp);
                              handleOpenCheckout(doc, 'VIDEO_CONSULTATION');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-sky-600" />
                            <span>Video Call • ₹{doc.teleConsultationFee || 250}</span>
                          </motion.button>
                        </div>
                      </div>
                    </SlapBlock>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW B: ALL HOSPITALS & CLINICS NEAR YOU (DIRECT BOOKING)     */}
          {/* ============================================================== */}
          {directoryMode === 'hospitals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-0.5 pt-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Healthcare Centres Near You
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tabular-nums">
                    {allFilteredHospitals.length}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Sorted by distance
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {allFilteredHospitals.map((hosp, idx) => {
                  const hospDoctors = doctors.filter(d => d.hospitalId === hosp.id);
                  const primaryDoc = hospDoctors[0] || doctors[0];

                  return (
                    <SlapBlock
                      key={hosp.id}
                      variant="subtle-slap"
                      delay={Math.min(idx * 0.05, 0.25)}
                      className="w-full"
                    >
                      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-md transition-all p-3.5 sm:p-4 space-y-3 relative overflow-hidden">
                        {/* Row 1: Hospital Thumbnail + Identity + Live Status */}
                        <div className="flex items-start gap-3.5">
                          {/* 80x80px Media Thumbnail with Rating */}
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 relative shrink-0 border border-slate-100 shadow-xs">
                            <img
                              src={hosp.imageUrl}
                              alt={hosp.name}
                              className="w-full h-full object-cover"
                            />
                            {/* Rating Tag */}
                            <div className="absolute top-1.5 left-1.5 bg-slate-900/85 backdrop-blur-xs px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white flex items-center gap-0.5 shadow-xs">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{hosp.rating}</span>
                            </div>
                          </div>

                          {/* Hospital Details & Live Queue */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{hosp.distance || '1.2 km'} away</span>
                              </span>

                              {hosp.emergencyAvailable && (
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded-md shrink-0">
                                  24/7 OPD
                                </span>
                              )}
                            </div>

                            <h4 className="font-bold text-sm text-slate-900 tracking-tight leading-snug line-clamp-1">
                              {hosp.name}
                            </h4>

                            <p className="text-xs text-slate-500 truncate font-normal">
                              {hosp.address}
                            </p>

                            {/* Live Token Status Pill */}
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 bg-emerald-50/80 border border-emerald-200/50 px-2 py-0.5 rounded-md">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span>Next: Token #{primaryDoc?.nextAvailableToken || 4}</span>
                              <span className="text-emerald-500">•</span>
                              <span className="text-slate-600 font-normal">~10m wait</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Doctor on Duty & Specialists Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 min-w-0 text-slate-600 truncate">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 shrink-0">{primaryDoc?.name.split(',')[0] || 'On-Duty Specialist'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 truncate">{primaryDoc?.specialty}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setDirectoryMode('doctors');
                            }}
                            className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 px-2 py-0.5 rounded-md shrink-0 transition-colors cursor-pointer"
                          >
                            {hospDoctors.length} Specialists →
                          </button>
                        </div>

                        {/* Row 3: Dual 1-Tap Booking Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          {/* Button 1: Normal Visit */}
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setSelectedDoctor(primaryDoc);
                              handleOpenCheckout(primaryDoc, 'IN_PERSON_OPD');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Normal Visit • ₹{hosp.baseOpFee || 100}</span>
                          </motion.button>

                          {/* Button 2: Video Call */}
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setSelectedDoctor(primaryDoc);
                              handleOpenCheckout(primaryDoc, 'VIDEO_CONSULTATION');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-sky-600" />
                            <span>Video Call • ₹{primaryDoc?.teleConsultationFee || 250}</span>
                          </motion.button>
                        </div>
                      </div>
                    </SlapBlock>
                  );
                })}
              </div>
            </div>
          )}


          {/* Direct Video Teleconsult Room Modal */}
          {activeVideoModalDoc && (
            <TeleconsultRoomModal
              isOpen={!!activeVideoModalDoc}
              onClose={() => setActiveVideoModalDoc(null)}
              patientName={patientProfile.name}
              doctorName={activeVideoModalDoc.name}
              specialty={activeVideoModalDoc.specialty}
            />
          )}

        </motion.div>
      )}

      
      {/* ============================================================== */}
      {/* TAB 2: DOCTOR CHAT & TELECONSULTATION */}
      {/* ============================================================== */}
      {activeTab === 'telehealth' && (
        <motion.div
          key="telehealth"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}
        >
          {/* Doctor Profile Teleconsult Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-subtle text-center space-y-2.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto border border-zinc-200">
                <img 
                  src="https://images.unsplash.com/photo-1594824813580-e83cb49f3e46?w=300" 
                  alt="Doctor" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="font-bold text-xs text-zinc-950 tracking-tight">{activeDoctor.name}</h3>
                <p className="text-[11px] text-zinc-500">{activeDoctor.specialty} • {activeDoctor.hospitalName}</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 space-y-1 text-xs text-left">
                <div className="flex justify-between text-zinc-600 text-[11px]">
                  <span>Teleconsult Fee:</span>
                  <span className="tabular-nums font-semibold text-zinc-900">₹{activeDoctor.teleConsultationFee}</span>
                </div>
                <div className="flex justify-between text-zinc-600 text-[11px]">
                  <span>Video Engine:</span>
                  <span className="font-medium text-emerald-700">WebRTC Encrypted</span>
                </div>
              </div>

              <button
                onClick={() => setTeleconsultModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Video Room</span>
              </button>
            </div>
          </div>

          {/* Minimalist Doctor & AI Intake Chat */}
          <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-2'} bg-white rounded-2xl border border-zinc-200/80 shadow-subtle flex flex-col h-[460px]`}>
            <div className="p-3 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <h4 className="font-semibold text-xs text-zinc-900">Physician Messaging Channel</h4>
                  <p className="text-[10px] text-zinc-400">Assigned: {activeDoctor.name}</p>
                </div>
              </div>
              <button
                onClick={() => setTeleconsultModalOpen(true)}
                className="px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-[11px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Video className="w-3 h-3 text-zinc-500" />
                <span>Video Desk</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] tabular-nums text-zinc-400 mb-0.5">
                    {msg.sender === 'user' ? 'You' : msg.sender === 'doctor' ? activeDoctor.name : 'Clinical Intake AI'} • {msg.time}
                  </span>
                  <div
                    className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-zinc-900 text-white rounded-tr-xs'
                        : 'bg-zinc-100 text-zinc-800 rounded-tl-xs border border-zinc-200/60'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.image && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-zinc-200">
                        <img src={msg.image} alt="Uploaded symptom" className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Image Preview */}
            {chatImage && (
              <div className="px-3 py-1.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
                <span className="text-zinc-600 text-[11px]">Attachment: photo_symptom.jpg</span>
                <button onClick={() => setChatImage(null)} className="text-zinc-400 hover:text-zinc-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-2.5 border-t border-zinc-100 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setChatImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400')}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                title="Attach Photo"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Describe symptoms..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <TeleconsultRoomModal
            isOpen={teleconsultModalOpen}
            onClose={() => setTeleconsultModalOpen(false)}
            patientName={patientProfile.name}
            doctorName={activeDoctor.name}
            specialty={activeDoctor.specialty}
          />
        </motion.div>
      )}

      
      {/* ============================================================== */}
      {/* TAB 3: TINY LOCAL AI HEALTH ASSISTANT                          */}
      {/* ============================================================== */}
      {activeTab === 'ai_assist' && (
        <motion.div
          key="ai_assist"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          <AiHealthAssistant
            patientProfile={patientProfile}
            hospitals={hospitals}
            doctors={doctors}
            slots={slots}
            onOpenCheckout={(doc, type, explicitSlot) => handleOpenCheckout(doc, type, explicitSlot)}
            onClose={() => setActiveTab('op_booking')}
          />
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: UNIFIED PATIENT MEDICAL HISTORY & PRESCRIPTIONS ARCHIVE */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <motion.div
          key="history"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 pb-32"
        >
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Patient Records & History</span>
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Verified digital prescriptions, active OPD tokens, and consultation archives
              </p>
            </div>

            {/* Segmented Filter Pills */}
            <div className="bg-zinc-100 p-0.5 rounded-xl flex items-center text-[10px] font-semibold select-none">
              <button
                type="button"
                onClick={() => setHistoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  historyFilter === 'ALL'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                All ({prescriptions.length + activeUserTokens.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('PRESCRIPTIONS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  historyFilter === 'PRESCRIPTIONS'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Prescriptions ({prescriptions.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('TOKENS')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  historyFilter === 'TOKENS'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                OP Passes ({activeUserTokens.length})
              </button>
            </div>
          </div>

          {/* Active / Past OP Token Passes */}
          {(historyFilter === 'ALL' || historyFilter === 'TOKENS') && activeUserTokens.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 uppercase tracking-wider px-0.5">
                <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                <span>Outpatient Token Passes ({activeUserTokens.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeUserTokens.map(token => {
                  const doc = doctors.find(d => d.id === token.doctorId);
                  const hosp = hospitals.find(h => h.id === token.hospitalId);

                  return (
                    <div
                      key={token.id}
                      className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-sm space-y-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center font-mono">
                            #{token.tokenNumber}
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">OPD Token</span>
                            <h4 className="font-bold text-xs text-zinc-950">
                              {doc ? doc.name : 'Attending Specialist'}
                            </h4>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100/70 border border-emerald-300 text-emerald-800 text-[10px] font-semibold">
                          {token.status === 'IN_CONSULTATION' ? '● In Consultation' : '● Live in Queue'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-zinc-600">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Hospital:</span>
                          <span className="font-semibold text-zinc-900">{hosp ? hosp.name : 'City Care Hospital'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Department & Room:</span>
                          <span className="font-medium text-zinc-800">{doc?.specialty || 'General'} • Room 104</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-400">Slot Time:</span>
                          <span className="font-mono font-medium text-zinc-900">{token.time}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onTriggerWhatsAppToast(
                            'OP Queue Pass',
                            `Token #${token.tokenNumber} details shared to your WhatsApp (+91 ${patientProfile.phone})`,
                            'TOKEN_CONFIRMATION'
                          )}
                          className="flex-1 py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WhatsApp Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowLivePassModal(true)}
                          className="py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          View Full Pass
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prescriptions Section */}
          {(historyFilter === 'ALL' || historyFilter === 'PRESCRIPTIONS') && prescriptions.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-700 uppercase tracking-wider px-0.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Digital Prescriptions ({prescriptions.length})</span>
              </div>

              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
                {prescriptions.map(rx => (
                  <div 
                    key={rx.id} 
                    className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-subtle hover:border-zinc-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          Rx
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-zinc-900 tracking-tight">{rx.id}</h4>
                          <p className="text-[10px] text-zinc-400 tabular-nums">{new Date(rx.issuedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Digitally Signed
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Doctor:</span>
                        <span className="font-medium text-zinc-900">{rx.doctorName}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Diagnosis:</span>
                        <span className="font-semibold text-zinc-900 truncate ml-2">{rx.diagnosis}</span>
                      </div>
                    </div>

                    {/* Medicines List */}
                    <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 space-y-1 text-xs">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Prescribed Medicines ({rx.medicines.length}):</span>
                      {rx.medicines.map((m, idx) => (
                        <div key={idx} className="flex justify-between text-zinc-700 text-[11px] tabular-nums">
                          <span className="truncate mr-2">{m.name} ({m.dosage})</span>
                          <span className="text-zinc-400 shrink-0">{m.frequency}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => generatePrescriptionPdf(rx)}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Download Verified Prescription (PDF)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {((historyFilter === 'PRESCRIPTIONS' && prescriptions.length === 0) ||
            (historyFilter === 'TOKENS' && activeUserTokens.length === 0) ||
            (historyFilter === 'ALL' && prescriptions.length === 0 && activeUserTokens.length === 0)) && (
            <div className="p-8 text-center bg-white rounded-3xl border border-zinc-200/80 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900">No Records Found</h4>
                <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mt-0.5">
                  Your consultation passes, verified prescriptions, and diagnostic records will appear here automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('op_booking')}
                className="px-4 py-2 rounded-xl bg-zinc-950 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Book OPD Token Now
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: DEDICATED PATIENT PROFILE & DIGITAL HEALTH LOCKER */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 pb-32"
        >
          {/* Quick Back / Close Navigation Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => onTabChange?.('op_booking')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-slate-200/60 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Back to Clinic Desk</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange?.('op_booking')}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              title="Close Profile & Return to Clinic"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Live OPD Queue Pass (Integrated directly into Profile) */}
          {activeUserTokens.length > 0 && (() => {
            const token = activeUserTokens[0];
            const pDoc = doctors.find(d => d.id === token.doctorId);
            const pHosp = hospitals.find(h => h.id === token.hospitalId) || hospitals[0];
            const pDocName = pDoc?.name || token.doctorName || 'Attending Physician';
            const pSpecialty = pDoc?.specialty || token.specialty || 'General Medicine';
            const pHospName = pHosp?.name || token.hospitalName || 'Medical Centre';
            const pRoom = pDoc?.roomNumber || 'Room 104';

            const currentServingSlot = slots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId);
            const currentServingToken = currentServingSlot?.tokenNumber ?? Math.max(1, token.tokenNumber - 2);
            const tokensAhead = Math.max(0, token.tokenNumber - currentServingToken);
            const estWait = tokensAhead * 6;

            return (
              <SlapBlock
                variant="grow"
                theme="dark"
                className="rounded-3xl p-4.5 sm:p-5 relative overflow-hidden border border-slate-800 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-950 via-slate-900 to-[#071713]"
              >
                {/* Specular Edge Hairline */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between text-xs pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <span className="font-semibold text-[11px] tracking-wider uppercase text-emerald-400 font-mono">
                      ACTIVE LIVE OPD PASS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-medium tracking-wide">
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : '● Live in Queue'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onTabChange?.('op_booking')}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close Pass View"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Main Token & Doctor Info */}
                <div className="mt-3.5 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Your Token</span>
                      <span className="text-3xl font-bold tracking-tight text-white tabular-nums font-mono">
                        #{token.tokenNumber < 10 ? `0${token.tokenNumber}` : token.tokenNumber}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-white flex items-center gap-1.5 truncate">
                      <span>{pDocName}</span>
                      <span className="text-xs font-normal text-slate-400">• {pSpecialty}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-normal truncate">
                      {pHospName} • {pRoom} • {token.time}
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2.5 text-center shrink-0">
                    <div className="flex items-center justify-center gap-1 text-emerald-300 font-bold text-base tabular-nums">
                      <RollingCounter value={tokensAhead} height={20} />
                      <span className="text-xs text-slate-300 font-normal">ahead</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      ~{estWait}m wait
                    </span>
                  </div>
                </div>

                {/* Quick Actions Strip */}
                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onTriggerWhatsAppToast?.(
                      'Live OPD Queue Pass',
                      `Token #${token.tokenNumber} pass sent to WhatsApp`,
                      'TOKEN_CONFIRMATION'
                    )}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLivePassModal(true)}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/15 transition-all cursor-pointer"
                  >
                    <span>Expand Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SlapBlock>
            );
          })()}

          {/* 1. Ambient Patient Identity Card */}
          <div className="bg-white rounded-3xl p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-zinc-200/80 relative overflow-hidden">
            {/* Ambient emerald backlight */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-emerald-500/10 via-emerald-500/3 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-sm">
                    RK
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-semibold text-zinc-950 tracking-tight truncate">{patientProfile.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                      ABDM Verified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate font-normal">
                    +91 {patientProfile.phone} • Age {patientProfile.age || 48} • {patientProfile.gender || 'Male'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-normal">
                    Coimbatore District • Tamil Nadu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200/70 transition-colors shrink-0 shadow-2xs"
              >
                Edit
              </button>
            </div>

            {/* Profile Completeness Strip */}
            <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                  {patientProfile.profileCompletionPct || 60}%
                </div>
                <div>
                  <span className="font-semibold text-zinc-900 text-xs block">Health Record Completeness</span>
                  <span className="text-[11px] text-zinc-400">Vitals, allergies & emergency data synced with doctors</span>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
              >
                <span>Update</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Official ABHA Digital Health Card (Ayushman Bharat / NHA) */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-subtle relative overflow-hidden space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-950 tracking-tight">Ayushman Bharat Digital Health Card</h4>
                  <p className="text-[11px] text-zinc-400">National Health Authority (ABDM) • Government of India</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-xl p-3.5 space-y-2.5 shadow-sm border border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-medium block">ABHA Number</span>
                  <span className="text-sm font-bold tracking-wide text-emerald-300 tabular-nums">91-9845-0112-2384</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('91-9845-0112-2384');
                    setCopiedAbha(true);
                    setTimeout(() => setCopiedAbha(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedAbha ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-normal">ABHA Address</span>
                  <span className="text-zinc-200 font-medium">ramesh.kumar@abdm</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-normal">Universal Health ID</span>
                  <span className="text-zinc-200 font-medium">#BC-9842</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-[11px] text-zinc-500">Fast OPD queue check-in via QR scan</span>
              <button 
                onClick={() => alert('ABHA QR Pass is ready for scanning at City Care Hospital OPD desk.')}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR Pass</span>
              </button>
            </div>
          </div>

          {/* 3. Apple Health Vitals Bento Grid (Spacious 2x2 Grid with Zero Text Overflow) */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-2 px-0.5">
              Clinical Vitals & Metrics
            </h3>
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-3'}`}>
              
              {/* Blood Pressure */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 gap-1">
                  <span className="text-xs font-semibold text-slate-600 truncate">Blood Pressure</span>
                  <Activity className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">128/82</span>
                  <span className="text-xs text-slate-400 font-medium shrink-0">mmHg</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Optimal Range</span>
                  </span>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 gap-1">
                  <span className="text-xs font-semibold text-slate-600 truncate">Resting Pulse</span>
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">72</span>
                  <span className="text-xs text-slate-400 font-medium shrink-0">bpm</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Normal Sinus</span>
                  </span>
                </div>
              </div>

              {/* Blood Group */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 gap-1">
                  <span className="text-xs font-semibold text-slate-600 truncate">Blood Group</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">{patientProfile.bloodGroup || 'B+'}</span>
                  <span className="text-xs text-slate-400 font-medium shrink-0">Rh+</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                    <span>Donor Matched</span>
                  </span>
                </div>
              </div>

              {/* Fasting Glucose */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 gap-1">
                  <span className="text-xs font-semibold text-slate-600 truncate">Blood Glucose</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                  <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">108</span>
                  <span className="text-xs text-slate-400 font-medium shrink-0">mg/dL</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Fasting Control</span>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Emergency Health Safety & Allergies Card */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-950 tracking-tight">Clinical Safety & Allergies</h4>
                  <p className="text-[10px] text-zinc-400">Shared with doctors during emergency consultations</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="text-[11px] font-semibold text-zinc-600 hover:text-zinc-900"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
                <span className="text-xs font-semibold text-rose-800 block mb-0.5">Known Drug Allergies</span>
                <span className="font-semibold text-rose-950 text-xs">
                  {patientProfile.allergies?.join(', ') || 'Penicillin, Dust Mites'}
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">High alert flagged for attending physicians</span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <span className="text-xs font-semibold text-zinc-700 block mb-0.5">Chronic History</span>
                <span className="font-medium text-zinc-900 text-xs">
                  {patientProfile.chronicConditions?.join(', ') || 'Type 2 Diabetes, Mild Hypertension'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Emergency SOS Contact</span>
                  <span className="font-semibold text-zinc-900 text-xs">{patientProfile.emergencyContact || 'Sunita Kumar (Spouse) • +91 98450 11223'}</span>
                </div>
                <a
                  href={`tel:${patientProfile.emergencyContact || '+919845011223'}`}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  title="Call SOS Contact"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* 5. Health Locker & Digital Pharmacy Archive */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200/60 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-950 tracking-tight">Digital Health Locker</h4>
                  <p className="text-[10px] text-zinc-400">Encrypted prescriptions, lab orders & OP tokens</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-zinc-900">
                <CountUp to={prescriptions.length + activeUserTokens.length} suffix=" Records" />
              </span>
            </div>

            <div className="space-y-2">
              {activeUserTokens.map(t => (
                <div key={t.id} className="p-2.5 rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center tabular-nums">
                      #{t.tokenNumber}
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 block truncate">OP Token • {t.hospitalName}</span>
                      <span className="text-[11px] text-zinc-400 tabular-nums">{t.time} • Fee ₹{t.feePaid}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    ACTIVE
                  </span>
                </div>
              ))}

              {prescriptions.map(p => (
                <div key={p.id} className="p-2.5 rounded-xl border border-zinc-200/80 flex items-center justify-between text-xs hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center">
                      Rx
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-900 block truncate">{p.diagnosis}</span>
                      <span className="text-[11px] text-zinc-400 tabular-nums">{p.doctorName} • {new Date(p.issuedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => generatePrescriptionPdf(p)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium transition-colors"
                  >
                    PDF
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Preferences & 24/7 Helpline */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 shadow-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-700">
                <Bell className="w-4 h-4 text-zinc-400" />
                <span>WhatsApp Notifications</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-700">
                <Lock className="w-4 h-4 text-zinc-400" />
                <span>Biometric Face ID Lock</span>
              </div>
              <span className="text-[11px] font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-full">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-zinc-100">
              <div className="flex items-center gap-2 text-zinc-700">
                <Globe className="w-4 h-4 text-zinc-400" />
                <span>Language</span>
              </div>
              <span className="text-[11px] text-zinc-600 font-medium">
                English (India)
              </span>
            </div>

            {onLogout && (
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-zinc-500 text-[11px]">Active Session ({patientProfile.name})</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-600 border border-zinc-200 transition-colors font-medium text-[11px] cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between text-zinc-400 text-[11px] tabular-nums font-medium">
              <span>B care Health Platform v2.4</span>
              <span>24/7 Support: 1800-419-BCARE</span>
            </div>
          </div>

          {/* Interactive Modal Controller */}
          <ProgressiveProfileBanner
            profile={patientProfile}
            onUpdateProfile={onUpdateProfile}
            isOpen={profileModalOpen}
            onOpenChange={setProfileModalOpen}
            renderCustomTrigger={() => null}
          />

        </motion.div>
      )}
      </AnimatePresence>

      {/* Interactive Live OPD Queue Pass Modal (Tapped from Top-Right Smart Element) */}
      <AnimatePresence>
        {showLivePassModal && activeUserTokens.length > 0 && (() => {
          const token = activeUserTokens[0];
          const mDoc = doctors.find(d => d.id === token.doctorId);
          const mHosp = hospitals.find(h => h.id === token.hospitalId) || hospitals[0];
          const mDocName = mDoc?.name || token.doctorName || 'Attending Physician';
          const mSpecialty = mDoc?.specialty || token.specialty || 'General Medicine';
          const mHospName = mHosp?.name || token.hospitalName || 'Medical Centre';
          const mRoom = mDoc?.roomNumber || 'Room 104';

          const currentServingSlot = slots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId);
          const currentServingToken = currentServingSlot?.tokenNumber ?? Math.max(1, token.tokenNumber - 2);
          const tokensAhead = Math.max(0, token.tokenNumber - currentServingToken);
          const estWait = tokensAhead * 6;

          return (
            <PhoneModalPortal>
              <div 
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
                onClick={() => setShowLivePassModal(false)}
              >
                {/* Liquid Glass Animated Pop-up Modal (@aakashmehra/components/liquid-glass-button inspired) */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 12 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 26,
                    mass: 0.8
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-sm rounded-[30px] overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6),inset_0_1.5px_2px_rgba(255,255,255,0.3)] border border-white/25 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-[#081713]/95 backdrop-blur-2xl backdrop-saturate-180 text-white p-5 space-y-4"
                >
                {/* Specular Edge Hairline */}
                <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent pointer-events-none" />
                {/* Top Meta Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-[11px] tracking-wider uppercase text-emerald-400 font-mono">
                      LIVE OPD QUEUE PASS
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-emerald-300 text-[10px] font-medium tracking-wide backdrop-blur-md">
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : 'Confirmed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLivePassModal(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Ticket Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] uppercase text-slate-400 font-medium tracking-wider">Your Token</span>
                      <span className="text-3xl font-semibold tracking-tight text-white tabular-nums font-mono">
                        #{token.tokenNumber < 10 ? `0${token.tokenNumber}` : token.tokenNumber}
                      </span>
                    </div>
                    <div className="mt-1">
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">
                          {mDocName}
                        </h4>
                        <span className="inline-block text-[10px] font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.2 rounded mt-0.5">
                          {mSpecialty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-normal">
                        {mHospName} • {mRoom} • {token.time}
                      </p>
                    </div>
                  </div>

                  {/* Live Counter Box */}
                  <div className="text-right shrink-0">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-300 font-semibold text-sm tabular-nums">
                        <RollingCounter value={tokensAhead} height={18} />
                        <span className="text-xs text-slate-300 font-normal">ahead</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                        ~{estWait} min wait
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Perforation Footer */}
                <div className="pt-3 border-t border-dashed border-white/15 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                    PASS: BC-TKN-{token.tokenNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerWhatsAppToast?.('LIVE_OPD_TICKET', 'Live Token Pass sent to WhatsApp', 'TOKEN_CONFIRMATION');
                      setShowLivePassModal(false);
                    }}
                    className="text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Track Status on WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            </div>
          </PhoneModalPortal>
        );
      })()}
    </AnimatePresence>

    </div>
  );
};
