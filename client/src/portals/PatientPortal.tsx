import { UserLocationData, calculateDistanceKm, getGoogleMapsDirectionsUrl, detectCurrentLocation } from '../services/locationService';
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
  CalendarCheck,
  Navigation,
  Compass,
  HelpCircle,
  Scale,
  FileLock,
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
  Smile,
  Ear,
  Waves,
  Droplets,
  Wind,
  Syringe,
  ShieldPlus,
  User,
  QrCode,
  Copy,
  Heart,
  Activity,
  PhoneCall,
  AlertTriangle,
  FileCheck2,
  Share2,
  Eye,
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
  Plus,
  LocateFixed,
  Home,
  Mic,
  Ruler
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { LiquidGlassButton } from '../components/LiquidGlass';
import { SiriOrb } from '../components/SiriOrb';

export type PatientPortalTab = 'op_booking' | 'bookings' | 'ai_assist' | 'hospitals' | 'profile';

interface PatientPortalProps {
  patientProfile: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  prescriptions: DigitalPrescription[];
  videoAppointments?: VideoAppointment[];
  communityPosts: CommunityPost[];
  splitConfig: RevenueSplitConfig;
  platformSettings?: PlatformSettings;
  isMobile?: boolean;
  activeTab?: PatientPortalTab;
  onTabChange?: (tab: PatientPortalTab) => void;
  onBookSlot: (slotId: string, patientName: string, patientPhone: string, referralCode?: string) => Promise<any>;
  onCancelSlot?: (slotId: string) => Promise<any>;
  onBookVideoConsultation?: (bookingData: any) => Promise<any>;
  onUpdateProfile: (updatedData: Partial<PatientProfile>) => Promise<void>;
  onAddCommunityPost: (post: { category: string; title: string; content: string }) => Promise<void>;
  onAddCommunityComment: (postId: string, content: string) => Promise<void>;
  onTriggerWhatsAppToast: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
  onBookingScreenToggle?: (isOpen: boolean) => void;
  onLogout?: () => void;
  userLocation?: UserLocationData | null;
  onRefreshLocation?: () => Promise<void>;
  onSelectLocation?: (loc: UserLocationData) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patientProfile,
  hospitals,
  doctors,
  slots,
  prescriptions,
  videoAppointments = [],
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
  onLogout,
  userLocation,
  onRefreshLocation,
  onSelectLocation
}) => {
  const [showLocationPickerModal, setShowLocationPickerModal] = useState(false);
  const [isLocDetecting, setIsLocDetecting] = useState(false);
  const [internalTab, setInternalTab] = useState<PatientPortalTab>('op_booking');
  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = (tab: PatientPortalTab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'PRESCRIPTIONS' | 'TOKENS'>('ALL');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'IN_PERSON' | 'VIDEO' | 'COMPLETED'>('ALL');
  const [bookingScope, setBookingScope] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'CONSENT' | 'NMC' | 'PRIVACY' | 'GRIEVANCE' | null>(null);
  const [dpdpShareEHR, setDpdpShareEHR] = useState(true);
  const [dpdpAbhaSync, setDpdpAbhaSync] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
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
  const [specialtyCategory, setSpecialtyCategory] = useState<'GENERAL' | 'ADVANCED'>('GENERAL');
  const [consultationChoiceModal, setConsultationChoiceModal] = useState<'IN_PERSON' | 'VIDEO' | null>(null);

  // Exact Practo Specialty Cards (Direct from Screenshot 2026-11-10 at 3.18.43 AM)
  const practoSpecialties = [
    // General Care (8 specialties directly matching Practo Screenshot)
    {
      id: 'General Medicine',
      name: 'General Physician',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_gen_physician.png',
      tag: 'Fever, Cold, Viral'
    },
    {
      id: 'Gynecology',
      name: "Women's Health",
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_womens_health.png',
      tag: 'Periods & Gyn'
    },
    {
      id: 'Dermatology',
      name: 'Skin Specialist',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_skin_specialist.png',
      tag: 'Acne & Skin Care'
    },
    {
      id: 'Pediatrics',
      name: 'Child Care',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_child_care.png',
      tag: 'Infants & Kids'
    },
    {
      id: 'Dentistry',
      name: 'Dentist',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_dentist.png',
      tag: 'Teeth & Gums'
    },
    {
      id: 'Ophthalmology',
      name: 'Eye Specialist',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_eye_specialist.png',
      tag: 'Vision & Retina'
    },
    {
      id: 'ENT',
      name: 'Ear, Nose & Throat',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_ent.png',
      tag: 'Sinus & Hearing'
    },
    {
      id: 'Mental Wellness',
      name: 'Mental Wellness',
      category: 'GENERAL' as const,
      image: '/practo_specialties/card_mental_wellness.png',
      tag: 'Therapy & Mind'
    },

    // Advanced Care (8 specialties)
    {
      id: 'Orthopedics',
      name: 'Bones & Joints',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_ortho.png',
      tag: 'Knee & Spine'
    },
    {
      id: 'Cardiology',
      name: 'Heart & Chest',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_cardio.png',
      tag: 'ECG, BP & Chest'
    },
    {
      id: 'Neurology',
      name: 'Brain & Nerves',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_neuro.png',
      tag: 'Migraine & Nerves'
    },
    {
      id: 'Gastroenterology',
      name: 'Digestive Issues',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_gastro.png',
      tag: 'GERD & Acidity'
    },
    {
      id: 'Nephrology',
      name: 'Kidney Issues',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_kidney.png',
      tag: 'Kidney & Urology'
    },
    {
      id: 'Pulmonology',
      name: 'Lungs & Breathing',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_lungs.png',
      tag: 'Asthma & Cough'
    },
    {
      id: 'Diabetology',
      name: 'Diabetes Care',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_diabetes.png',
      tag: 'Sugar & Thyroid'
    },
    {
      id: 'General Surgery',
      name: 'General Surgery',
      category: 'ADVANCED' as const,
      image: '/practo_specialties/card_adv_surgery.png',
      tag: 'Laparoscopy & Care'
    }
  ];
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

  const specialties = [
    'All', 
    'General Medicine', 
    'Gynecology', 
    'Dermatology', 
    'Pediatrics', 
    'Dentistry', 
    'Ophthalmology', 
    'ENT', 
    'Mental Wellness', 
    'Orthopedics', 
    'Cardiology', 
    'Neurology', 
    'Gastroenterology', 
    'Nephrology', 
    'Pulmonology', 
    'Diabetology', 
    'General Surgery'
  ];
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
  const completedUserTokens = slots.filter(s => (s.patientPhone === patientProfile.phone || (patientProfile.userId && s.patientId === patientProfile.userId)) && s.status === 'COMPLETED');

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
    { id: 'General Medicine', label: 'General Medicine', icon: Stethoscope },
    { id: 'Gynecology', label: "Women's Health", icon: Sparkles },
    { id: 'Cardiology', label: 'Cardiology', icon: HeartPulse },
    { id: 'Orthopedics', label: 'Orthopedics', icon: Bone },
    { id: 'Neurology', label: 'Neurology', icon: Brain },
    { id: 'Pediatrics', label: 'Pediatrics', icon: Baby },
    { id: 'Dermatology', label: 'Dermatology', icon: Sparkles },
    { id: 'Mental Wellness', label: 'Mental Wellness', icon: Brain }
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
            {/* Header: Compact Sleek 1-Row Context Bar */}
            <div className="flex items-center justify-between pt-0.5 pb-0.5 px-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[13.5px] font-extrabold text-slate-900 tracking-tight shrink-0 flex items-center gap-1">
                  <span>Hello, {patientProfile.name.split(' ')[0]}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 fill-blue-100 shrink-0" />
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setShowLocationPickerModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-slate-800 text-xs font-bold transition-all cursor-pointer shrink-0 truncate shadow-2xs"
                  title="Auto-detect GPS or change location"
                >
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{userLocation?.displayName || 'Detecting Location...'}</span>
                  {userLocation?.isLiveGps ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Live GPS Active" />
                  ) : (
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  )}
                </button>
              </div>
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
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 truncate">
                        Active OPD Token Pass
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap shrink-0 ${
                      token.status === 'IN_CONSULTATION'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    }`}>
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : '● Live in Queue'}
                    </span>
                  </div>

                  {/* Ticket Body: Pass Badge + Dynamic Doctor & Hospital Details */}
                  <div className="grid grid-cols-[auto_1fr] gap-3.5 items-center">
                    {/* Left Column: Token Pass Badge */}
                    <div className="flex flex-col items-center justify-center px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[76px] shadow-inner">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-400">
                        TOKEN
                      </span>
                      <span className="text-3xl font-extrabold tracking-tight text-white my-0.5 tabular-nums">
                        #{token.tokenNumber < 10 ? `0${token.tokenNumber}` : token.tokenNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-300">
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
                        Serving: <strong className="text-white font-bold">#{currentServingToken}</strong>
                      </span>
                      <span className="text-emerald-300 font-semibold">
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-medium text-emerald-800 mb-1.5 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
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
              <div className="bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-subtle flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Status</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Active
                </span>
              </div>
              <div className="bg-white border border-zinc-200/80 px-3 py-1.5 rounded-xl shadow-subtle flex items-center gap-2 whitespace-nowrap shrink-0">
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Rx Archive</span>
                <span className="text-xs font-semibold text-zinc-900">{prescriptions.length} {prescriptions.length === 1 ? 'Record' : 'Records'}</span>
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
              <span>Home Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'bookings' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Bookings ({activeUserTokens.length + (videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0)})</span>
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
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'hospitals' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Hospitals & Maps</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'profile' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Records</span>
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
            className="space-y-2.5 pb-44"
          >
            {/* Active Booked Video Call or Toast Confirmation */}
          {(userVideoAppointments.length > 0 || bookedConfirmation) && (
            <div className="space-y-2">
              {/* Active Video Consultations */}
              {userVideoAppointments.map(app => (
                <div key={app.id} className="bg-sky-950 text-white rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md border border-sky-800 animate-in fade-in text-xs">
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
                <div className="bg-zinc-900 text-white rounded-2xl p-3 flex items-center justify-between gap-3 shadow-elevated border border-zinc-800 animate-in fade-in text-xs">
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

          {/* ============================================================== */}
          {/* PRACTO INTEGRATED LUXURY HOME VIEW (Screenshot 2026-11-10 at 3.18.13 AM) */}
          {/* ============================================================== */}

          {/* 1. THE TWO BIG HERO CONSULTATION CARDS SIDE-BY-SIDE (Practo Signature) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* In-Person Consultation Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setConsultationChoiceModal('IN_PERSON')}
              className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-xs hover:shadow-sm transition-all aspect-[525/295] bg-[#eef6fc] border border-blue-200/50"
            >
              <img
                src="/practo_hero/hero_in_person.png"
                alt="In-Person Consultation"
                className="w-full h-full object-cover block select-none pointer-events-none group-hover:scale-102 transition-transform duration-300"
              />
            </motion.div>

            {/* Video Consultation Card */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => setConsultationChoiceModal('VIDEO')}
              className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-xs hover:shadow-sm transition-all aspect-[525/295] bg-[#eef6fc] border border-blue-200/50"
            >
              <img
                src="/practo_hero/hero_video_consult.png"
                alt="Video Consultation"
                className="w-full h-full object-cover block select-none pointer-events-none group-hover:scale-102 transition-transform duration-300"
              />
            </motion.div>
          </div>

          {/* 3. SAFE & PRIVATE CARE PROMO BANNER */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 shadow-sm">
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-100/90 block">
                  Safe • Private • ABDM Verified
                </span>
                <h4 className="text-sm font-extrabold text-white leading-snug">
                  Affordable Specialist Care
                </h4>
                <p className="text-[11px] text-blue-100/85 leading-tight pt-0.5">
                  Instant token passes & live wait tracking {userLocation?.city ? `in ${userLocation.city}` : 'at top hospitals'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDirectoryMode('hospitals');
                  const el = document.getElementById('nearby-directory');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-full bg-white text-blue-700 font-bold text-xs whitespace-nowrap shrink-0 shadow-xs hover:bg-blue-50 transition-all cursor-pointer active:scale-95"
              >
                Book Token
              </button>
            </div>
          </div>

          {/* 4. "FIND DOCTORS BY SPECIALITY" SECTION (Matching Practo Screenshot 2026-11-10 at 3.18.43 AM) */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight px-0.5">
              Find doctors by speciality
            </h3>

            {/* Full-Width Pill Segmented Switcher (General Care / Advanced Care) */}
            <div className="w-full bg-[#f1f4f8] p-1 rounded-full flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={() => setSpecialtyCategory('GENERAL')}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  specialtyCategory === 'GENERAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                General Care
              </button>
              <button
                type="button"
                onClick={() => setSpecialtyCategory('ADVANCED')}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  specialtyCategory === 'ADVANCED'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Advanced Care
              </button>
            </div>

            {/* 4x2 Specialty Grid: Exact Practo Squircle Cards */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 select-none pt-0.5">
              {practoSpecialties
                .filter(s => s.category === specialtyCategory)
                .map(spec => {
                  const isSelected = selectedSpecialty.toLowerCase() === spec.id.toLowerCase();
                  return (
                    <motion.div
                      key={spec.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedSpecialty(spec.id);
                        setDirectoryMode('doctors');
                        const el = document.getElementById('nearby-directory');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 aspect-[285/360] shadow-2xs border ${
                        isSelected
                          ? 'ring-2 ring-blue-600 border-blue-500 shadow-sm scale-[1.02]'
                          : 'border-slate-200/80 hover:border-blue-300 hover:shadow-xs hover:scale-[1.01]'
                      }`}
                    >
                      <img
                        src={spec.image}
                        alt={spec.name}
                        className="w-full h-full object-cover block select-none pointer-events-none"
                        loading="lazy"
                      />
                    </motion.div>
                  );
                })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* 5. CLINICAL AI BANNER: ULTRA-SLEEK, THIN, ZERO SUGGESTION CHIPS */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onTabChange?.('ai_assist')}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1525] via-[#0d1d33] to-[#082234] text-white border border-blue-500/30 shadow-[0_12px_28px_-8px_rgba(4,28,40,0.35)] p-3 px-3.5 flex items-center justify-between gap-3 cursor-pointer group hover:border-cyan-400/50 transition-all select-none"
          >
            {/* Ambient Specular Cyan Highlight */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

            {/* Left: SiriOrb */}
            <div className="shrink-0 flex items-center">
              <SiriOrb size={34} state="idle" />
            </div>

            {/* Center: Natural Medical Copy (Zero truncation) */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10.5px] font-bold text-emerald-400 tracking-wider uppercase">
                  B Care AI Triage
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white tracking-tight leading-snug mt-0.5">
                Describe your symptoms
              </h3>
              <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                Instant doctor triage in 10 languages
              </p>
            </div>

            {/* Right: Unified Action Button with Voice Indicator */}
            <div className="shrink-0 flex items-center">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-emerald-400 group-hover:bg-emerald-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 shrink-0" />
                <span>Assess</span>
                <ArrowRight className="w-3 h-3 stroke-[2.5] shrink-0" />
              </button>
            </div>
          </motion.div>

          {/* 6. NEARBY DIRECTORY: HOSPITALS & DOCTORS */}
          <div id="nearby-directory" className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                Nearby Hospitals & Doctors
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Book Visit or Call
              </span>
            </div>

            {/* Understated Full-Width iOS Segmented Switcher */}
            <div className="w-full p-1 bg-slate-100 rounded-2xl grid grid-cols-2 gap-1 select-none">
              <button
                type="button"
                onClick={() => {
                  setDirectoryMode('hospitals');
                  setConsultationFilter('ALL');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  directoryMode === 'hospitals'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${directoryMode === 'hospitals' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>Hospitals ({allFilteredHospitals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirectoryMode('doctors');
                  setConsultationFilter('ALL');
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  directoryMode === 'doctors'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Stethoscope className={`w-3.5 h-3.5 ${directoryMode === 'doctors' ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>Doctors ({allFilteredDoctors.length})</span>
              </button>
            </div>

            {/* Search Bar + Ask Care AI Button */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="relative flex-1 min-w-0 flex items-center bg-white border border-slate-200/90 rounded-2xl shadow-xs px-3.5 py-2.5">
                <Search className="w-4 h-4 text-blue-600 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clinics, hospitals, doctors..."
                  className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="text-slate-400 hover:text-slate-600 text-xs p-0.5 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => onTabChange?.('ai_assist')}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/90 text-blue-900 font-bold text-xs shadow-xs hover:border-blue-300 transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
                title="Launch Clinical AI Assistant"
              >
                <div className="shrink-0">
                  <SiriOrb size={26} state="idle" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-[11px] font-extrabold text-blue-700">Ask Care AI</span>
                  <span className="block text-[9px] text-blue-500 font-medium">Instant Triage</span>
                </div>
              </button>
            </div>
          </div>

          {/* Minimalist Horizontal Specialty Rail */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar w-full">
            {specialtyPills.map(spec => {
              const isSelected = selectedSpecialty === spec.id;

              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialty(spec.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* VIEW A: ALL DOCTORS IN THE AREA */}
          {/* ============================================================== */}
          {directoryMode === 'doctors' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {allFilteredDoctors.map((doc, idx) => {
                  const hosp = hospitals.find(h => h.id === doc.hospitalId);
                  const docInitials = doc.name.replace(/^Dr\.\s*/i, '').split(' ').map(n => n[0]).slice(0, 2).join('') || 'DR';

                  return (
                    <SlapBlock
                      key={doc.id}
                      variant="subtle-slap"
                      delay={Math.min(idx * 0.05, 0.25)}
                      className="w-full"
                    >
                      <div className="rounded-[26px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all p-4 space-y-3 relative overflow-hidden">
                        {/* Doctor Avatar + Details */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-16 h-16 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0 relative">
                            {docInitials}
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug line-clamp-1">
                                {doc.name.split(',')[0]}
                              </h4>
                              <div className="flex items-center gap-1 text-slate-900 text-xs font-bold shrink-0 pt-0.5">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                <span>{doc.rating}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 truncate">
                              {doc.specialty} • {doc.experienceYears} yrs exp • {hosp ? hosp.name.replace(/Multi-Specialty Hospital|Hospital/i, 'Hosp.').trim() : doc.hospitalName}
                            </p>

                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 pt-0.5">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                              </span>
                              <span className="font-bold">Token #{doc.nextAvailableToken || 4} available</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">~{doc.estimatedWaitMins || 10}m wait</span>
                            </div>
                          </div>
                        </div>

                        {/* Modern Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              if (hosp) setSelectedHospital(hosp);
                              handleOpenCheckout(doc, 'IN_PERSON_OPD');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-blue-100" />
                            <span>Visit • ₹{doc.opConsultationFee || splitConfig.baseOpFee}</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              if (hosp) setSelectedHospital(hosp);
                              handleOpenCheckout(doc, 'VIDEO_CONSULTATION');
                            }}
                            className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-600" />
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
          {/* Compact, Luxury Layout Exactly Matching Reference (Image 4)   */}
          {/* ============================================================== */}
          {directoryMode === 'hospitals' && (
            <div className="space-y-3">
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
                      <div className="rounded-[22px] border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all p-3 space-y-2 relative group">
                        {/* Top Flex: Square Thumbnail on Left + Metadata on Right */}
                        <div className="flex items-start gap-2.5">
                          {/* Square Thumbnail with Rating Badge */}
                          <div className="relative w-20 h-20 min-w-[80px] min-h-[80px] max-h-[80px] aspect-square rounded-2xl overflow-hidden bg-slate-100 shrink-0 select-none shadow-xs">
                            <img
                              src={hosp.imageUrl}
                              alt={hosp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Star Rating Badge on thumbnail */}
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold flex items-center gap-0.5 shadow-xs">
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>{hosp.rating}</span>
                            </div>
                          </div>

                          {/* Hospital Details on Right */}
                          <div className="min-w-0 flex-1 space-y-0.5">
                            {/* Badges: Distance & 24/7 Emergency */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const mapUrl = hosp.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.address)}`;
                                  window.open(mapUrl, '_blank');
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[9.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                                title="Open route in Google Maps"
                              >
                                <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                <span>{hosp.distance || '1.2 km'} • Maps</span>
                              </button>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/80 text-[9.5px] font-semibold whitespace-nowrap shrink-0">
                                <span>24/7 Emergency</span>
                              </span>
                            </div>

                            {/* Hospital Name */}
                            <h4 className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug line-clamp-1">
                              {hosp.name}
                            </h4>

                            {/* Address */}
                            <p className="text-[10.5px] text-slate-500 truncate leading-tight">
                              {hosp.address}
                            </p>

                            {/* Live Token Status */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50/80 border border-emerald-200/70 text-[10px] font-medium text-emerald-800 whitespace-nowrap">
                              <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                              </span>
                              <span className="font-bold">Next: Token #{primaryDoc?.nextAvailableToken || 4}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">~10m wait</span>
                            </div>
                          </div>
                        </div>

                        {/* Middle Row: Doctor Info + Specialist count link */}
                        <div className="flex items-center justify-between text-xs px-0.5 pt-0.5 text-slate-600 border-t border-slate-100">
                          <div className="flex items-center gap-1.5 truncate">
                            <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 text-[11px] truncate">{primaryDoc?.name.split(',')[0]}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 text-[11px] truncate">{primaryDoc?.specialty}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              setDirectoryMode('doctors');
                              setSelectedSpecialty('ALL');
                            }}
                            className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 shrink-0 hover:underline cursor-pointer"
                          >
                            <span>{hospDoctors.length || 3} Specialists</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Modern High-End Action Buttons Matching Reference */}
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setSelectedDoctor(primaryDoc);
                              handleOpenCheckout(primaryDoc, 'IN_PERSON_OPD');
                            }}
                            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5 text-blue-100" />
                            <span>Normal Visit • ₹{hosp.baseOpFee || 100}</span>
                          </motion.button>

                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setSelectedDoctor(primaryDoc);
                              handleOpenCheckout(primaryDoc, 'VIDEO_CONSULTATION');
                            }}
                            className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-600" />
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
              patientLanguages={patientProfile.languages}
            />
          )}

        </motion.div>
      )}

      
      {/* ============================================================== */}
      {/* TAB 2: MY BOOKINGS & TOKENS (VISITS + VIDEO IN ONE PLACE)     */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <motion.div
          key="bookings"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 pb-32"
        >
          {/* Header & Quick Booking Action */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="min-w-0 flex-1 pr-1">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="truncate">My Bookings</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Real-time hospital queue passes & teleconsultations
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowNewBookingModal(true)}
              className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Book New</span>
            </button>
          </div>

          {/* Scope Switcher: Upcoming Passes vs Past Visits */}
          <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1 select-none">
            <button
              type="button"
              onClick={() => setBookingScope('ACTIVE')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                bookingScope === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upcoming Passes ({activeUserTokens.length + (videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0)})
            </button>
            <button
              type="button"
              onClick={() => setBookingScope('PAST')}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all text-center whitespace-nowrap cursor-pointer ${
                bookingScope === 'PAST'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Past Visits ({completedUserTokens.length + prescriptions.length})
            </button>
          </div>

          {/* ============================================================== */}
          {/* VIEW 1: ACTIVE / UPCOMING PASSES                               */}
          {/* ============================================================== */}
          {bookingScope === 'ACTIVE' && (
            <div className="space-y-4">
              {/* Secondary Category Filters */}
              {(activeUserTokens.length > 0 || (videoAppointments?.length || 0) > 0) && (
                <div className="bg-slate-100/70 p-1 rounded-full flex items-center gap-1 select-none overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setBookingFilter('ALL')}
                    className={`flex-1 py-1 px-3 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      bookingFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Active ({activeUserTokens.length + (videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFilter('IN_PERSON')}
                    className={`flex-1 py-1 px-3 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      bookingFilter === 'IN_PERSON'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    In-Person OPD ({activeUserTokens.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingFilter('VIDEO')}
                    className={`flex-1 py-1 px-3 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      bookingFilter === 'VIDEO'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Video Calls ({videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0})
                  </button>
                </div>
              )}

              {/* SECTION A: IN-PERSON OPD PASSES */}
              {(bookingFilter === 'ALL' || bookingFilter === 'IN_PERSON') && activeUserTokens.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span>Live Hospital OPD Passes ({activeUserTokens.length})</span>
                    </span>
                    <span className="text-[11px] text-blue-600 font-bold">Real-Time Queue</span>
                  </div>

                  {activeUserTokens.map(token => {
                    const doc = doctors.find(d => d.id === token.doctorId);
                    const hosp = hospitals.find(h => h.id === token.hospitalId) || hospitals[0];
                    const googleMapsUrl = hosp?.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp?.address || 'Coimbatore')}`;

                    const currentServingSlot = slots.find(s => s.status === 'IN_CONSULTATION' && s.doctorId === token.doctorId);
                    const currentServingToken = currentServingSlot?.tokenNumber ?? Math.max(1, token.tokenNumber - 2);
                    const tokensAhead = Math.max(0, token.tokenNumber - currentServingToken);
                    const estWait = tokensAhead * 6;

                    return (
                      <div
                        key={token.id}
                        className="rounded-[24px] border border-blue-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3 relative overflow-hidden"
                      >
                        {/* Header Row: Token # + Status badge */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                              #{token.tokenNumber < 10 ? `0${token.tokenNumber}` : token.tokenNumber}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                                Hospital OPD Token
                              </span>
                              <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                                {doc?.name || token.doctorName || 'Attending Specialist'}
                              </h4>
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 whitespace-nowrap shrink-0 ${
                            token.status === 'IN_CONSULTATION'
                              ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>{token.status === 'IN_CONSULTATION' ? 'In Consultation' : 'Live in Queue'}</span>
                          </span>
                        </div>

                        {/* Metadata: Hospital, Room, Slot Time */}
                        <div className="text-xs space-y-1.5 text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Hospital:</span>
                            <span className="font-bold text-slate-900">{hosp?.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Department & Room:</span>
                            <span className="font-semibold text-slate-800">{doc?.specialty || token.specialty || 'General'} • Room {doc?.roomNumber || '204'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Slot & Status:</span>
                            <span className="font-bold text-slate-900">Today • {token.time} • ₹{token.feePaid || 100} (Paid)</span>
                          </div>
                        </div>

                        {/* Queue Status Box */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              <span>Now Serving:</span>
                              <strong className="text-slate-900 font-bold">Token #{currentServingToken}</strong>
                            </span>
                            <span className="text-blue-700 font-bold">
                              {tokensAhead === 0 ? 'You are next in line!' : `~${estWait} mins (${tokensAhead} ahead)`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden flex">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(15, (currentServingToken / token.tokenNumber) * 100))}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions: Google Maps Navigation, View Full Pass */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => window.open(googleMapsUrl, '_blank')}
                            className="py-2 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                            title="Open Google Maps Route"
                          >
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Navigate (Maps)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowLivePassModal(true)}
                            className="py-2 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>View Pass (QR)</span>
                          </button>
                        </div>

                        {/* Secondary WhatsApp & Cancel Row */}
                        <div className="flex items-center justify-between pt-0.5 text-xs">
                          <button
                            type="button"
                            onClick={() => onTriggerWhatsAppToast(
                              'OP Queue Pass',
                              `Token #${token.tokenNumber} details shared to your WhatsApp (+91 ${patientProfile.phone})`,
                              'TOKEN_CONFIRMATION'
                            )}
                            className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            <span>Send to WhatsApp</span>
                          </button>

                          {onCancelSlot && (
                            <button
                              type="button"
                              onClick={() => onCancelSlot(token.id)}
                              className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Cancel Pass
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SECTION B: VIDEO CONSULTATIONS */}
              {(bookingFilter === 'ALL' || bookingFilter === 'VIDEO') && (videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0) > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-emerald-600" />
                      <span>Video Consultations ({videoAppointments?.filter(v => v.status === 'SCHEDULED').length})</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-bold">10 Languages</span>
                  </div>

                  {videoAppointments?.filter(v => v.status === 'SCHEDULED').map(apt => {
                    const doc = doctors.find(d => d.id === apt.doctorId) || doctors[0];

                    return (
                      <div
                        key={apt.id}
                        className="rounded-[24px] border border-emerald-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                              <Video className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                                Video Telehealth
                              </span>
                              <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                                {apt.doctorName || doc.name}
                              </h4>
                              <span className="text-[11px] text-slate-500 font-medium truncate block">
                                {apt.doctorSpecialty || doc.specialty} • {apt.hospitalName || doc.hospitalName}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 whitespace-nowrap shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            <span>Ready</span>
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Scheduled Time:</span>
                            <span className="font-bold text-slate-900">Today • {apt.time}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Consultation Fee:</span>
                            <span className="font-bold text-emerald-700">₹{apt.feePaid} (Paid via {apt.paymentMethod})</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400">Languages:</span>
                            <span className="font-semibold text-slate-800">English, Tamil, Hindi</span>
                          </div>
                        </div>

                        {/* Join Real Video Call Button */}
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveVideoModalDoc(doc)}
                            className="flex-1 py-2.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 whitespace-nowrap shadow-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Video className="w-4 h-4 shrink-0" />
                            <span>Launch Video Room Now</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setActiveVideoModalDoc(doc);
                            }}
                            className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            title="Doctor Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>Chat</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State for Active */}
              {activeUserTokens.length === 0 && (videoAppointments?.filter(v => v.status === 'SCHEDULED').length || 0) === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">No Upcoming Passes</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                      You do not have any active appointments for today. Book an in-person OPD pass or schedule a video call.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewBookingModal(true)}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    + Book New Appointment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: PAST VISITS & COMPLETED PASSES                         */}
          {/* ============================================================== */}
          {bookingScope === 'PAST' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Past Consultations & Summary</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">ABHA Synced</span>
              </div>

              {/* Sample Completed Visits with Doctor Prescription Download */}
              <div className="rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                      Rx
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-slate-900 leading-tight truncate">
                        Dr. Ananya Sharma, MD, DM
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        Cardiology • City Care Multi-Specialty Hospital
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold whitespace-nowrap shrink-0">
                    Completed
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="text-[11px] text-slate-500">Clinical Diagnosis:</div>
                  <div className="font-bold text-slate-800">
                    Essential Hypertension Stage 1 with Mild Exertional Tachycardia
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Slot: Token #01 • 28 Oct 2026 • Follow-up in 30 days
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      if (prescriptions && prescriptions.length > 0) {
                        generatePrescriptionPdf(prescriptions[0]);
                      }
                    }}
                    className="flex-1 py-2 px-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Download Rx (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctor(doctors[0]);
                      handleOpenCheckout(doctors[0], 'IN_PERSON_OPD');
                    }}
                    className="py-2 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Follow-up
                  </button>
                </div>
              </div>

              {completedUserTokens.filter(t => t.id !== 'slot-1').map(token => {
                const doc = doctors.find(d => d.id === token.doctorId);
                const hosp = hospitals.find(h => h.id === token.hospitalId) || hospitals[0];

                return (
                  <div
                    key={token.id}
                    className="rounded-[24px] border border-slate-200/90 bg-white p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="min-w-0 flex-1 pr-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">OPD Token #{token.tokenNumber}</span>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{doc?.name || 'Attending Specialist'}</h4>
                        <p className="text-[11px] text-slate-500 truncate">{hosp?.name}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold whitespace-nowrap shrink-0">
                        Completed
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Date & Time:</span>
                      <span className="font-medium text-slate-800">{token.date} • {token.time}</span>
                    </div>
                  </div>
                );
              })}
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
              patientLanguages={patientProfile.languages}
            />
          )}
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
            userLocation={userLocation}
            onOpenCheckout={(doc, type, explicitSlot) => handleOpenCheckout(doc, type, explicitSlot)}
            onClose={() => setActiveTab('op_booking')}
          />
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: HOSPITALS & 24/7 EMERGENCY DIRECTORY                   */}
      {/* ============================================================== */}
      {activeTab === 'hospitals' && (
        <motion.div
          key="hospitals"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 pb-32"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Accredited Hospitals & Emergency Care</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                GPS turn-by-turn navigation, 24/7 emergency casualty, and immediate token booking
              </p>
            </div>
            
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-bold whitespace-nowrap shrink-0">
              {hospitals.length} Network {hospitals.length === 1 ? 'Centre' : 'Centres'}
            </span>
          </div>

          {/* 24/7 Emergency SOS Hotline Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border border-rose-500/30 text-white flex items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-wider block">
                  24/7 Emergency Casualty
                </span>
                <h4 className="text-xs font-bold text-white">
                  Immediate Ambulance & Trauma Hotline
                </h4>
                <p className="text-[10.5px] text-slate-300">
                  National: 108 • Emergency Helpline: +91 422 257 0108
                </p>
              </div>
            </div>
            <a
              href="tel:108"
              className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Call 108</span>
            </a>
          </div>

          {/* District Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none no-scrollbar">
            {['All', ...Array.from(new Set(hospitals.map(h => h.districtName).filter(Boolean)))].map(area => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedArea === area
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          {/* Hospital Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            {hospitals
              .filter(h => selectedArea === 'All' || (h.districtName || '').toLowerCase().includes(selectedArea.toLowerCase()))
              .map(hosp => {
                const hospDoctors = doctors.filter(d => d.hospitalId === hosp.id);
                const primaryDoc = hospDoctors[0] || doctors[0];
                const googleMapsUrl = hosp.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hosp.address)}`;

                return (
                  <div
                    key={hosp.id}
                    className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                        <img
                          src={hosp.imageUrl}
                          alt={hosp.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold flex items-center gap-0.5 whitespace-nowrap">
                          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                          <span>{hosp.rating}</span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => window.open(googleMapsUrl, '_blank')}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-[10px] font-bold cursor-pointer transition-colors whitespace-nowrap shrink-0"
                            title="Open Google Maps Route"
                          >
                            <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{hosp.distance || '1.2 km'} away • Maps</span>
                          </button>
                          {hosp.emergencyAvailable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold whitespace-nowrap shrink-0">
                              24/7 Emergency
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug">
                          {hosp.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          {hosp.address}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {hosp.specialties.slice(0, 3).join(' • ')} • {hospDoctors.length || 3} Specialists
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons: Navigate in Google Maps + Call + Book */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => window.open(googleMapsUrl, '_blank')}
                        className="py-2 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1 border border-blue-200/80 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>Directions</span>
                      </button>

                      <a
                        href={`tel:${hosp.phone || '+914222570100'}`}
                        className="py-2 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHospital(hosp);
                          setSelectedDoctor(primaryDoc);
                          handleOpenCheckout(primaryDoc, 'IN_PERSON_OPD');
                        }}
                        className="py-2 px-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Ticket className="w-3.5 h-3.5 shrink-0" />
                        <span>Book • ₹{hosp.baseOpFee}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
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
                    <span className="font-bold text-[11px] tracking-wider uppercase text-emerald-400">
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
                      <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold whitespace-nowrap shrink-0">
                      ABDM Verified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate font-normal">
                    +91 {patientProfile.phone} • Age {patientProfile.age || 48} • {patientProfile.gender || 'Male'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate mt-0.5 font-normal">
                    {userLocation?.city ? `${userLocation.area ? `${userLocation.area}, ` : ''}${userLocation.city}${userLocation.state ? ` • ${userLocation.state}` : ''}` : 'Detecting Location...'}
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
                  <span className="text-[11px] text-zinc-400">Height, weight, allergies & emergency data synced</span>
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
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-zinc-950 tracking-tight">Ayushman Bharat Digital Health Card</h4>
                  <p className="text-[11px] text-zinc-400">National Health Authority (ABDM) • Government of India</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold whitespace-nowrap shrink-0">
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

          {/* 3. Stable Baseline Health Metrics Bento Grid (Constant Biometrics) */}
          {(() => {
            const heightCm = patientProfile.heightCm || 174;
            const weightKg = patientProfile.weightKg || 72;
            const totalInches = Math.round(heightCm / 2.54);
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            const bmiRaw = weightKg / Math.pow(heightCm / 100, 2);
            const bmi = bmiRaw.toFixed(1);
            const bmiStatus =
              bmiRaw < 18.5
                ? { label: 'Underweight', dot: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50 border-amber-200/60' }
                : bmiRaw < 25
                ? { label: 'Normal Range', dot: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200/60' }
                : bmiRaw < 30
                ? { label: 'Overweight', dot: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50 border-amber-200/60' }
                : { label: 'Obesity Class', dot: 'bg-rose-500', badge: 'text-rose-700 bg-rose-50 border-rose-200/60' };
            const bloodGrp = patientProfile.bloodGroup || 'B+';
            const rhLabel = bloodGrp.includes('-') ? 'Rh-' : 'Rh+';

            return (
              <div>
                <div className="flex items-center justify-between mb-2 px-0.5">
                  <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                    Baseline Health Metrics
                  </h3>
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(true)}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </div>
                <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-3'}`}>
                  
                  {/* Height */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 gap-1">
                      <span className="text-xs font-semibold text-slate-600 truncate">Height</span>
                      <Ruler className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                      <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">{heightCm}</span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">cm ({feet}&apos;{inches}&quot;)</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>Recorded Stature</span>
                      </span>
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 gap-1">
                      <span className="text-xs font-semibold text-slate-600 truncate">Weight</span>
                      <Scale className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                      <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">{weightKg}</span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">kg</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>Dosing Baseline</span>
                      </span>
                    </div>
                  </div>

                  {/* Blood Group */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 gap-1">
                      <span className="text-xs font-semibold text-slate-600 truncate">Blood Group</span>
                      <Droplets className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                      <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">{bloodGrp}</span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">{rhLabel}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                        <span>Verified Type</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Mass Index (BMI) */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 gap-1">
                      <span className="text-xs font-semibold text-slate-600 truncate">Body Mass Index</span>
                      <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                      <span className="text-xl font-bold text-slate-950 font-sans tracking-tight tabular-nums">{bmi}</span>
                      <span className="text-xs text-slate-400 font-medium shrink-0">kg/m²</span>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold border px-2 py-0.5 rounded-md whitespace-nowrap ${bmiStatus.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${bmiStatus.dot}`} />
                        <span>{bmiStatus.label}</span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

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

          {/* 5. UNIFIED MEDICAL HISTORY & PRESCRIPTIONS ARCHIVE (Integrated directly into Profile) */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Medical History & Verified Prescriptions
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Digitally signed prescriptions & outpatient consultation archives
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
                {(() => {
                  const total = prescriptions.length + activeUserTokens.length;
                  return `${total} ${total === 1 ? 'Record' : 'Records'}`;
                })()}
              </span>
            </div>

            {/* Prescriptions and Token Cards */}
            <div className="space-y-2.5">
              {prescriptions.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center">
                        Rx
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-900">{p.diagnosis}</h5>
                        <p className="text-[10.5px] text-slate-400">
                          {p.doctorName} • {new Date(p.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => generatePrescriptionPdf(p)}
                      className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3 text-emerald-400" />
                      <span>PDF</span>
                    </button>
                  </div>

                  {/* Medicines summary */}
                  <div className="bg-white p-2 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Prescribed Regimen ({p.medicines.length}):
                    </span>
                    {p.medicines.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span className="font-medium truncate">{m.name} ({m.dosage})</span>
                        <span className="text-slate-400 shrink-0 ml-2">{m.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {activeUserTokens.map(t => (
                <div
                  key={t.id}
                  className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                      #{t.tokenNumber}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block truncate">
                        OP Pass • {t.hospitalName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {t.time} • Fee ₹{t.feePaid}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold whitespace-nowrap shrink-0">
                    ACTIVE PASS
                  </span>
                </div>
              ))}

              {prescriptions.length === 0 && activeUserTokens.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No previous consultation records or prescriptions yet.
                </div>
              )}
            </div>
          </div>

          {/* 6. SETTINGS & STATUTORY LEGAL MEASURES (DPDP ACT 2023, NMC & ABDM) */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-4 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Settings & Statutory Legal Measures
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    ABDM Ayushman Bharat, DPDP Act 2023 Consent & NMC Telemedicine Regulations
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold whitespace-nowrap shrink-0">
                COMPLIANT
              </span>
            </div>

            {/* Notification & Communication Toggles */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">WhatsApp Token Alerts</span>
                    <span className="text-[10.5px] text-slate-400">Receive live queue updates and digital prescription on WhatsApp</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappNotifications}
                  onChange={(e) => setWhatsappNotifications(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">SMS Queue Reminders</span>
                    <span className="text-[10.5px] text-slate-400">Instant SMS when you are 3 tokens away</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              {/* DPDP Act 2023 Consent Controls */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">DPDP Act 2023 Clinical Consent</span>
                    <span className="text-[10.5px] text-slate-400">Share vitals & health records with attending doctor during consultation</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dpdpShareEHR}
                  onChange={(e) => setDpdpShareEHR(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Ayushman Bharat (ABHA) Sync</span>
                    <span className="text-[10.5px] text-slate-400">Store encrypted prescriptions in official ABDM Health Locker</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={dpdpAbhaSync}
                  onChange={(e) => setDpdpAbhaSync(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Legal Links & Statutory Disclosures Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveLegalModal('NMC')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                <span>NMC Guidelines 2020</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLegalModal('GRIEVANCE')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Grievance Officer</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLegalModal('CONSENT')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>DPDP Data Rights</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLegalModal('PRIVACY')}
                className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Terms & Privacy</span>
              </button>
            </div>

            {/* Session Info & Sign Out */}
            {onLogout && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-slate-500 text-[11px] truncate min-w-0">Active Session: {patientProfile.name}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 transition-colors font-bold text-[11px] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            <div className="pt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-slate-400 text-[10px] font-medium">
              <span className="whitespace-nowrap">B Care ABDM Certified v2.5</span>
              <span className="whitespace-nowrap">Support: 1800-419-BCARE</span>
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

          {/* Statutory Legal & Compliance Modals */}
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
                      <Scale className="w-5 h-5 text-blue-600" />
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {activeLegalModal === 'NMC' && 'NMC Telemedicine Guidelines 2020'}
                        {activeLegalModal === 'GRIEVANCE' && 'Statutory Grievance Redressal'}
                        {activeLegalModal === 'CONSENT' && 'DPDP Act 2023 Data Rights'}
                        {activeLegalModal === 'PRIVACY' && 'Medical Terms & Privacy Policy'}
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

                  <div className="text-xs text-slate-600 leading-relaxed space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                    {activeLegalModal === 'NMC' && (
                      <>
                        <p>
                          <strong>Registered Medical Practitioner (RMP) Verification:</strong> All doctors practicing on B Care hold active registrations with the National Medical Commission (NMC) or State Medical Councils under the Indian Medical Council Act, 1956.
                        </p>
                        <p>
                          <strong>Prescription Validity:</strong> Digital prescriptions generated on B Care comply with Schedule L of the Drugs and Cosmetics Rules, 1945, and the Telemedicine Practice Guidelines issued on 25th March 2020.
                        </p>
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                          <strong>Emergency Advisory:</strong> Telemedicine consultations are intended for non-emergent medical triage. For life-threatening emergencies, immediately call 108 or proceed to the nearest emergency trauma department.
                        </p>
                      </>
                    )}

                    {activeLegalModal === 'GRIEVANCE' && (
                      <>
                        <p>
                          Under the Digital Personal Data Protection Act, 2023, and Information Technology (Intermediary Guidelines) Rules, 2021, patients may address any grievance to our appointed statutory officer:
                        </p>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-slate-800">
                          <p><strong>Grievance Officer:</strong> Dr. K. Radhakrishnan, MS, MCh</p>
                          <p><strong>Email:</strong> grievance@bcare.health</p>
                          <p><strong>Helpline:</strong> +91 422 257 0199 (Mon-Sat, 9 AM - 6 PM)</p>
                          <p><strong>Office:</strong> 42 Avinashi Road, Peelamedu, Coimbatore - 641004, Tamil Nadu</p>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Statutory response SLA: Acknowledgement within 24 hours, resolution within 15 days.
                        </p>
                      </>
                    )}

                    {activeLegalModal === 'CONSENT' && (
                      <>
                        <p>
                          <strong>Digital Personal Data Protection Act, 2023 (DPDP):</strong>
                        </p>
                        <p>
                          As a Data Principal, you maintain sovereign control over your electronic health records. B Care acts as an Ayushman Bharat Health Information User (HIU) and Provider (HIP).
                        </p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700">
                          <li><strong>Right to Access:</strong> View all consultation notes, prescriptions, and billing receipts.</li>
                          <li><strong>Right to Erasure:</strong> Request permanent deletion of non-statutory health profile data.</li>
                          <li><strong>Right to Revoke:</strong> Withdraw consent for data sharing with non-attending facilities at any time.</li>
                        </ul>
                      </>
                    )}

                    {activeLegalModal === 'PRIVACY' && (
                      <>
                        <p>
                          <strong>Privacy & Doctor-Patient Confidentiality:</strong> All medical audio/video streams are end-to-end encrypted under WebRTC standards. Video streams are never recorded or stored without explicit two-way cryptographic consent.
                        </p>
                        <p>
                          <strong>ABDM Integration:</strong> Health data synced with your Ayushman Bharat Health Account (ABHA) is governed by the National Health Authority (NHA) framework.
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveLegalModal(null)}
                    className="w-full py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    I Understand & Acknowledge
                  </button>
                </motion.div>
              </div>
            </PhoneModalPortal>
          )}

        </motion.div>
      )}
      </AnimatePresence>

      {/* Interactive Live OPD Queue Pass Modal (Tapped from Top-Right Smart Element) */}
      <AnimatePresence>
        {/* Interactive Consultation Choice Modal: AI-Assisted vs Direct Browse */}
        {consultationChoiceModal && (
          <PhoneModalPortal>
            <div
              className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs pointer-events-auto"
              onClick={() => setConsultationChoiceModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/90 bg-white text-slate-900 p-5 space-y-4 max-h-[88vh] overflow-y-auto no-scrollbar"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 text-[10.5px] font-extrabold uppercase whitespace-nowrap">
                      {consultationChoiceModal === 'IN_PERSON' ? 'Clinic & Hospital Visit' : 'Instant Video Consult'}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {consultationChoiceModal === 'IN_PERSON' ? 'In-Person Consultation' : 'Video Consultation'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {consultationChoiceModal === 'IN_PERSON'
                        ? 'Do you know specifically who or what you need, or would you like AI guidance?'
                        : 'Connect with a certified doctor in ~10 minutes from home.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConsultationChoiceModal(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Option 1: Direct Non-Assisted Booking */}
                <div
                  onClick={() => {
                    const mode = consultationChoiceModal;
                    setConsultationChoiceModal(null);
                    if (mode === 'IN_PERSON') {
                      setDirectoryMode('hospitals');
                      const el = document.getElementById('nearby-directory');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onTabChange?.('bookings');
                    }
                  }}
                  className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 transition-all cursor-pointer group flex items-start gap-3.5 active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shrink-0">
                    {consultationChoiceModal === 'IN_PERSON' ? (
                      <Building2 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Video className="w-5 h-5 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {consultationChoiceModal === 'IN_PERSON'
                          ? 'I know who / what I need'
                          : 'Select Doctor or Specialty'}
                      </h4>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {consultationChoiceModal === 'IN_PERSON'
                        ? 'Browse nearby hospitals, clinics, or choose a specialist directly from our directory'
                        : 'Browse our list of available specialists ready for an immediate video call'}
                    </p>
                  </div>
                </div>

                {/* Option 2: AI-Assisted Clinical Triage */}
                <div
                  onClick={() => {
                    setConsultationChoiceModal(null);
                    onTabChange?.('ai_assist');
                  }}
                  className="relative overflow-hidden p-4 rounded-2xl border-2 border-blue-400/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-sky-50/80 shadow-xs hover:border-blue-500 transition-all cursor-pointer group flex items-start gap-3.5 active:scale-[0.99]"
                >
                  <div className="relative shrink-0 pt-0.5">
                    <SiriOrb size={38} state="listening" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap">
                        <h4 className="text-[13.5px] font-extrabold text-blue-950">
                          Not sure? Ask B Care AI
                        </h4>
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-extrabold tracking-wide uppercase whitespace-nowrap shrink-0">
                          Fast
                        </span>
                      </div>
                      <Sparkles className="w-4 h-4 text-blue-600 animate-pulse shrink-0" />
                    </div>
                    <p className="text-[11px] text-blue-900/80 mt-1 leading-snug">
                      Describe your symptoms, pain or discomfort in everyday words or voice. Our AI will triage and match you to the right specialist.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <span>Start Clinical AI Triage</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </PhoneModalPortal>
        )}

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
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="font-bold text-[11px] tracking-wider uppercase text-emerald-400 truncate">
                      LIVE OPD QUEUE PASS
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-emerald-300 text-[10px] font-medium tracking-wide backdrop-blur-md whitespace-nowrap shrink-0">
                      {token.status === 'IN_CONSULTATION' ? '● In Consultation' : 'Confirmed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLivePassModal(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
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
                      <span className="text-3xl font-extrabold tracking-tight text-white tabular-nums">
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
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
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

      {/* NEW BOOKING SELECTION MODAL */}
      {showNewBookingModal && (
        <PhoneModalPortal>
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/90 bg-white text-slate-900 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Book New Consultation</h3>
                  <p className="text-[11px] text-slate-500">Choose in-clinic visit or video consult</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewBookingModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Option 1: In-Person Hospital OPD */}
                <div
                  onClick={() => {
                    setShowNewBookingModal(false);
                    setDirectoryMode('hospitals');
                    setActiveTab('op_booking');
                    setTimeout(() => {
                      const el = document.getElementById('nearby-directory');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">
                        In-Person OPD Pass
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accredited Hospitals • Live Queue • From ₹100
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Option 2: Video Telehealth */}
                <div
                  onClick={() => {
                    setShowNewBookingModal(false);
                    setSelectedDoctor(doctors[0]);
                    handleOpenCheckout(doctors[0], 'VIDEO_CONSULTATION');
                  }}
                  className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">
                        Video Consultation
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Connect in ~10m • 10 Languages • ₹250
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}
    </AnimatePresence>

      {/* LOCATION PICKER & GPS AUTO-DETECTION MODAL */}
      {showLocationPickerModal && (
        <PhoneModalPortal>
          <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-sm rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl border border-slate-200/90 bg-white text-slate-900 p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Your Location</h3>
                    <p className="text-[11px] text-slate-500">Auto-detected live GPS & nearby care</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPickerModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Detected Location Display */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Location</span>
                  <span className="text-xs font-extrabold text-slate-900 truncate block mt-0.5">
                    {userLocation?.displayName || 'Detecting...'}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    {userLocation?.isLiveGps ? '● Live GPS High Accuracy' : '● Auto-detected Region'}
                  </span>
                </div>
              </div>

              {/* Live GPS Refresh Button */}
              <button
                type="button"
                onClick={async () => {
                  setIsLocDetecting(true);
                  if (onRefreshLocation) {
                    await onRefreshLocation();
                  }
                  setIsLocDetecting(false);
                  setShowLocationPickerModal(false);
                }}
                disabled={isLocDetecting}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <LocateFixed className={`w-4 h-4 ${isLocDetecting ? 'animate-spin' : ''}`} />
                <span>{isLocDetecting ? 'Detecting Live GPS...' : 'Detect My Exact GPS Location'}</span>
              </button>

              {/* Major Indian Hubs Quick Select */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Switch Hubs:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: 'Hyderabad, Telangana', area: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4156, lng: 78.4350 },
                    { name: 'Bengaluru, Karnataka', area: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
                    { name: 'Chennai, Tamil Nadu', area: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
                    { name: 'Coimbatore, Tamil Nadu', area: 'Peelamedu', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0267, lng: 76.9945 },
                    { name: 'Mumbai, Maharashtra', area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
                    { name: 'Delhi NCR', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090 }
                  ].map(hub => (
                    <button
                      key={hub.name}
                      type="button"
                      onClick={() => {
                        if (onSelectLocation) {
                          onSelectLocation({
                            area: hub.area,
                            city: hub.city,
                            state: hub.state,
                            country: 'India',
                            displayName: hub.name,
                            lat: hub.lat,
                            lng: hub.lng,
                            isLiveGps: true,
                            timestamp: Date.now()
                          });
                        }
                        setShowLocationPickerModal(false);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer ${
                        userLocation?.displayName === hub.name
                          ? 'bg-blue-50 border-blue-400 text-blue-950'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block truncate">{hub.city}</span>
                      <span className="text-[9.5px] text-slate-400 font-medium block truncate">{hub.area}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}
    </div>
  );
};
