import { detectCurrentLocation, UserLocationData, calculateDistanceKm } from './services/locationService';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserRole, 
  PatientProfile, 
  Hospital, 
  DoctorProfile, 
  NurseProfile, 
  FranchiseTerritory, 
  RevenueSplitConfig, 
  OpSlot, 
  DigitalPrescription, 
  CommunityPost,
  PlatformSettings,
  VideoAppointment
} from './types';
import { Navbar } from './components/Navbar';
import { WhatsAppAlertModal, WhatsAppNotification } from './components/WhatsAppAlertModal';
import { PatientPortal } from './portals/PatientPortal';
import { DoctorPortal } from './portals/DoctorPortal';
import { NursePortal } from './portals/NursePortal';
import { FranchisePortal } from './portals/FranchisePortal';
import { AdminPortal } from './portals/AdminPortal';
import { generatePrescriptionPdf } from './utils/pdfGenerator';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { BCareLogo } from './components/BCareLogo';
import { LiquidGlassNavbar, LiquidNavItem } from './components/LiquidGlassNavbar';
import { ProfileDrawer } from './components/ProfileDrawer';
import { 
  Smartphone, 
  Monitor, 
  Sparkles, 
  MessageCircle, 
  Building2, 
  Video, 
  FileText, 
  MessageSquare, 
  User,
  Ticket,
  Layers,
  UserPlus,
  Stethoscope,
  Landmark,
  Users,
  LogOut,
  X,
  Clock,
  Home,
  CalendarCheck,
  Calendar
} from 'lucide-react';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('PATIENT');
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bcare_user');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return null; }
      }
    }
    return {
      id: 'user-patient-1',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      role: 'PATIENT'
    };
  });
  const [isAuthOpen, setIsAuthOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'true' || params.get('auth') === '1') return true;
    }
    return false;
  });
  const [deviceView, setDeviceView] = useState<'iphone' | 'android'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      if (v === 'android') return 'android';
    }
    return 'iphone';
  });
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [unreadWhatsAppCount, setUnreadWhatsAppCount] = useState(1);
  const [showSplashScreen, setShowSplashScreen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('splash') === 'false') return false;
    }
    return true;
  });

  // Compulsory splash screen playback whenever switching between apps / roles (e.g., Patient -> Doctor)
  const prevRoleRef = useRef<UserRole>(currentRole);
  useEffect(() => {
    if (prevRoleRef.current !== currentRole) {
      prevRoleRef.current = currentRole;
      setShowSplashScreen(true);
    }
  }, [currentRole]);
  const [patientTab, setPatientTab] = useState<'op_booking' | 'bookings' | 'ai_assist' | 'hospitals' | 'profile'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'profile' || t === 'bookings' || t === 'ai_assist' || t === 'hospitals' || t === 'op_booking') return t as any;
    }
    return 'op_booking';
  });
  const [nurseTab, setNurseTab] = useState<'referrals' | 'bulk' | 'walkin' | 'profile'>('referrals');
  const [doctorTab, setDoctorTab] = useState<'queue' | 'rx' | 'completed' | 'profile'>('queue');
  const [franchiseTab, setFranchiseTab] = useState<'territory' | 'hospitals' | 'nurses' | 'profile'>('territory');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [previousPatientTab, setPreviousPatientTab] = useState<'op_booking' | 'bookings' | 'ai_assist' | 'hospitals'>('op_booking');
  const [isPatientBookingActive, setIsPatientBookingActive] = useState(false);

  const roleDefaultUsers: Record<UserRole, any> = {
    PATIENT: { id: 'user-patient-1', name: 'Ramesh Kumar', phone: '9876543210', role: 'PATIENT' },
    NURSE: { id: 'nurse_1', name: 'Sister Priya Nair', phone: '9842112233', role: 'NURSE' },
    DOCTOR: { id: 'doc_1', name: 'Dr. Anand Varma', phone: '9842001122', role: 'DOCTOR' },
    FRANCHISE_ADMIN: { id: 'fran_1', name: 'Kavitha Sundaram', phone: '9842998877', role: 'FRANCHISE_ADMIN' },
    SUPER_ADMIN: { id: 'admin_1', name: 'Ops Chief Admin', phone: '9900112233', role: 'SUPER_ADMIN' },
  };

  const isProfileActive = 
    (currentRole === 'PATIENT' && patientTab === 'profile') ||
    (currentRole === 'NURSE' && nurseTab === 'profile') ||
    (currentRole === 'DOCTOR' && doctorTab === 'profile') ||
    (currentRole === 'FRANCHISE_ADMIN' && franchiseTab === 'profile');

  const handleToggleProfile = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (showProfileModal) {
      setShowProfileModal(false);
      return;
    }

    setShowProfileModal(true);
  };

  // WhatsApp Notifications
  const [whatsAppNotifications, setWhatsAppNotifications] = useState<WhatsAppNotification[]>([
    {
      id: 'wa-init-1',
      to: '+91 9876543210',
      title: 'Welcome to B care',
      message: 'Hello Ramesh Kumar! Welcome to B care Digital Health. You can book Outpatient (OP) tokens, consult doctors via video, and receive branded digital prescriptions here.',
      timestamp: '10:00 AM',
      type: 'TOKEN_CONFIRMATION'
    }
  ]);

  // Initial Seed State (with live sync to Express server)
  const [splitConfig, setSplitConfig] = useState<RevenueSplitConfig>({
    id: 'split-default-v1',
    tierName: 'Standard District Outpatient Split',
    baseOpFee: 100,
    doctorFee: 50,
    nurseReferralCommission: 15,
    franchiseShare: 10,
    platformShare: 20,
    gstAmount: 5
  });

  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    userId: 'user-patient-1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    email: 'ramesh.kumar@example.com',
    age: 48,
    dob: '1978-06-14',
    gender: 'MALE',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContact: '+91 98450 11223 (Sunita - Spouse)',
    profileCompletionPct: 60
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    videoConsultationsEnabled: true,
    inPersonBookingEnabled: true,
    nurseBulkReservationEnabled: true,
    franchiseCashDeskEnabled: true,
    communityBoardActive: true,
    emergencySosActive: true,
    emergencyNumber: '108 / +91-98420-10800',
    broadcastBanner: {
      enabled: false,
      type: 'INFO',
      text: 'Specialist Cardiology, Orthopedic & Neurology Tokens available for today • ABDM Ayushman discounts applied'
    }
  });

  const [videoAppointments, setVideoAppointments] = useState<VideoAppointment[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocationData | null>(null);

  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: 'hosp-hyd-1',
      name: 'Apollo Health City & Multi-Specialty Centre',
      districtId: 'dist-hyderabad-central',
      districtName: 'Hyderabad Central',
      address: 'Road No 2, Jubilee Hills / Banjara Hills, Hyderabad',
      rating: 4.9,
      specialties: ['Cardiology', 'General Medicine', 'Neurology', 'Orthopedics'],
      baseOpFee: 100,
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
      emergencyAvailable: true,
      distance: '2.4 km',
      activeDoctorsCount: 1,
      latitude: 17.4265,
      longitude: 78.4118,
      phone: '+91 40 2360 7777',
      emergencyPhone: '108',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=17.4265,78.4118',
      adminUserId: 'user-franchise-hyd',
      isAccountVerified: true
    },
    {
      id: 'hosp-1',
      name: 'City Care Multi-Specialty Hospital',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      address: '42 Avinashi Road, Peelamedu, Coimbatore',
      rating: 4.8,
      specialties: ['Cardiology', 'Orthopedics', 'General Medicine'],
      baseOpFee: 100,
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
      emergencyAvailable: true,
      distance: '1.2 km',
      activeDoctorsCount: 2,
      latitude: 11.0267,
      longitude: 77.0089,
      phone: '+91 422 257 0100',
      emergencyPhone: '+91 422 257 0108',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=11.0267,77.0089',
      adminUserId: 'user-franchise-1',
      isAccountVerified: true
    },
    {
      id: 'hosp-2',
      name: 'Kovai Medical & Research Centre',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      address: '15 Trichy Road, Singanallur, Coimbatore',
      rating: 4.6,
      specialties: ['Neurology', 'General Medicine'],
      baseOpFee: 100,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
      emergencyAvailable: true,
      distance: '2.8 km',
      activeDoctorsCount: 1,
      latitude: 11.0016,
      longitude: 77.0253,
      phone: '+91 422 259 4400',
      emergencyPhone: '+91 422 259 4499',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=11.0016,77.0253',
      adminUserId: 'user-franchise-2',
      isAccountVerified: true
    }
  ]);

  const [doctors, setDoctors] = useState<DoctorProfile[]>([
    {
      id: 'doc-1',
      userId: 'user-doctor-1',
      name: 'Dr. Ananya Sharma, MD, DM',
      specialty: 'Cardiology',
      hospitalId: 'hosp-1',
      hospitalName: 'City Care Multi-Specialty Hospital',
      experienceYears: 14,
      opConsultationFee: 100,
      teleConsultationFee: 250,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      rating: 4.9,
      totalConsultations: 1420,
      status: 'ACTIVE',
      distance: '1.2 km',
      nextAvailableToken: 5,
      roomNumber: '204',
      estimatedWaitMins: 12,
      videoAvailable: true,
      registrationNumber: 'TMC-77492',
      isAccountVerified: true
    },
    {
      id: 'doc-2',
      userId: 'user-doctor-2',
      name: 'Dr. Rajesh Verma, MS (Ortho)',
      specialty: 'Orthopedics',
      hospitalId: 'hosp-1',
      hospitalName: 'City Care Multi-Specialty Hospital',
      experienceYears: 11,
      opConsultationFee: 100,
      teleConsultationFee: 200,
      availableDays: ['Mon', 'Wed', 'Fri'],
      rating: 4.7,
      totalConsultations: 980,
      status: 'ACTIVE',
      distance: '1.2 km',
      nextAvailableToken: 3,
      roomNumber: '108',
      estimatedWaitMins: 8,
      videoAvailable: true,
      registrationNumber: 'TMC-66291',
      isAccountVerified: true
    },
    {
      id: 'doc-hyd-1',
      userId: 'user-doctor-hyd',
      name: 'Dr. Vikram Reddy, MD, DM',
      specialty: 'Cardiology',
      hospitalId: 'hosp-hyd-1',
      hospitalName: 'Apollo Health City & Multi-Specialty Centre',
      experienceYears: 16,
      opConsultationFee: 100,
      teleConsultationFee: 250,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      rating: 4.9,
      totalConsultations: 1640,
      status: 'ACTIVE',
      distance: '2.4 km',
      nextAvailableToken: 1,
      roomNumber: '102',
      estimatedWaitMins: 10,
      videoAvailable: true,
      registrationNumber: 'TSMC-48201',
      isAccountVerified: true
    },
    {
      id: 'doc-3',
      userId: 'user-doctor-3',
      name: 'Dr. Meera Swaminathan, MD',
      specialty: 'Neurology',
      hospitalId: 'hosp-2',
      hospitalName: 'Kovai Medical & Research Centre',
      experienceYears: 16,
      opConsultationFee: 120,
      teleConsultationFee: 300,
      availableDays: ['Tue', 'Thu', 'Sat'],
      rating: 4.95,
      totalConsultations: 2100,
      status: 'ACTIVE',
      distance: '2.8 km',
      nextAvailableToken: 4,
      roomNumber: '302',
      estimatedWaitMins: 15,
      videoAvailable: true,
      registrationNumber: 'TMC-88102',
      isAccountVerified: true
    }
  ]);

  const [nurses, setNurses] = useState<NurseProfile[]>([
    {
      id: 'nurse-1',
      userId: 'user-nurse-1',
      name: 'Sister Priya Nair',
      phone: '9876543212',
      referralCode: 'NURSE-PRIYA-782',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      affiliatedHospitalId: 'hosp-1',
      totalReferrals: 138,
      walletBalance: 2070,
      totalEarnings: 6450
    }
  ]);

  const [franchise, setFranchise] = useState<FranchiseTerritory>({
    id: 'franchise-1',
    districtName: 'Coimbatore South & Rural',
    state: 'Tamil Nadu',
    agencyName: 'Apex Health District Franchise Agency',
    assignedAdminName: 'Vikas Patel',
    annualFranchiseFee: 50000,
    totalHospitals: 3,
    totalNurses: 18,
    monthlyRevenue: 148500,
    cashCollectedToday: 4500,
    cashDepositedToday: 4000,
    pendingReconciliation: 500
  });

  const [slots, setSlots] = useState<OpSlot[]>([]);
  const [prescriptions, setPrescriptions] = useState<DigitalPrescription[]>([
    {
      id: 'rx-2026-001',
      appointmentId: 'slot-sample-1',
      patientId: 'user-patient-1',
      patientName: 'Ramesh Kumar',
      patientAge: 48,
      patientGender: 'Male',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      diagnosis: 'Essential Hypertension Stage 1 with Mild Exertional Tachycardia',
      vitals: {
        bp: '142/92 mmHg',
        pulse: '84 bpm',
        temperature: '98.4 F',
        spo2: '98%'
      },
      symptoms: ['Occasional morning headaches', 'Mild chest tightness upon climbing stairs'],
      medicines: [
        {
          id: 'med-1',
          name: 'Telmisartan 40mg',
          dosage: '1 tablet',
          frequency: '1-0-0 (Morning)',
          duration: '30 days',
          instructions: 'Take after breakfast'
        },
        {
          id: 'med-2',
          name: 'Metoprolol Succinate 25mg ER',
          dosage: '1 tablet',
          frequency: '0-0-1 (Night)',
          duration: '30 days',
          instructions: 'Take after dinner'
        }
      ],
      clinicalNotes: 'Maintain low sodium diet (<2g/day). 30 mins brisk walking. Review BP weekly.',
      followUpDate: 'After 2 weeks',
      issuedAt: '2026-10-28T11:45:00Z',
      verificationQrHash: 'VERIF-RX-2026-001-MEDCONNECT-AUTH'
    }
  ]);

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      category: 'Cardiology',
      title: 'Managing Blood Pressure Naturally Along with Prescribed Medications',
      content: 'I was diagnosed with borderline hypertension 3 months ago. Regular morning walks and cutting out processed pickles helped bring systolic down by 8 points alongside my doctor\'s medication. What dietary habits worked for you?',
      authorId: 'user-patient-1',
      authorName: 'Ramesh Kumar',
      authorRole: 'PATIENT',
      upvotes: 24,
      commentCount: 2,
      createdAt: '2026-10-25T14:30:00Z',
      comments: [
        {
          id: 'c-1',
          authorName: 'Dr. Ananya Sharma',
          authorRole: 'DOCTOR',
          content: 'Excellent progress Ramesh! Potassium-rich foods like bananas, spinach, and coconut water also support vascular health, provided renal function is normal.',
          createdAt: '2026-10-25T16:00:00Z'
        },
        {
          id: 'c-2',
          authorName: 'Sister Priya Nair',
          authorRole: 'NURSE',
          content: 'Remember to check BP at resting state after sitting quietly for at least 5 minutes before recording.',
          createdAt: '2026-10-26T09:15:00Z'
        }
      ]
    },
    {
      id: 'post-2',
      category: 'Diabetes & Nutrition',
      title: 'Continuous Glucose Monitoring in Rural Camps: Observations and Insights',
      content: 'We ran a screening camp across 4 villages yesterday. Over 35% of people aged 45+ were unaware of elevated postprandial glucose. Early OP consultation tokens saved valuable travel time for them.',
      authorId: 'user-nurse-1',
      authorName: 'Sister Priya Nair',
      authorRole: 'NURSE',
      upvotes: 45,
      commentCount: 1,
      createdAt: '2026-10-28T10:15:00Z',
      comments: []
    }
  ]);

  // Simulator appearance mode: 'minimal' (zero chassis borders) vs 'chassis' (sleek 3px titanium rim)
  const [frameStyle, setFrameStyle] = useState<'minimal' | 'chassis'>('minimal');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = true;

  // Fetch initial data from server if reachable
  useEffect(() => {
    // 0. Auto-detect user GPS/IP location immediately
    detectCurrentLocation().then(loc => {
      setUserLocation(loc);
      if (loc.displayName) {
        setPatientProfile(prev => ({
          ...prev,
          city: loc.displayName
        }));
      }
    }).catch(err => {
      console.warn('Location detection notice:', err);
    });

    const fetchData = async () => {
      try {
        const [slotsRes, splitRes, hospitalsRes, doctorsRes, postsRes, settingsRes, appointmentsRes] = await Promise.all([
          fetch('/api/op/slots').catch(() => null),
          fetch('/api/admin/revenue-split').catch(() => null),
          fetch('/api/hospitals').catch(() => null),
          fetch('/api/doctors').catch(() => null),
          fetch('/api/community/posts').catch(() => null),
          fetch('/api/admin/settings').catch(() => null),
          fetch('/api/telehealth/appointments').catch(() => null)
        ]);

        if (slotsRes && slotsRes.ok) {
          const data = await slotsRes.json();
          setSlots(data);
        } else {
          // Generate local slots if server not responding
          generateLocalSlots();
        }

        if (splitRes && splitRes.ok) {
          const data = await splitRes.json();
          setSplitConfig(data);
        }
        if (hospitalsRes && hospitalsRes.ok) {
          const data = await hospitalsRes.json();
          setHospitals(data);
        }
        if (doctorsRes && doctorsRes.ok) {
          const data = await doctorsRes.json();
          setDoctors(data);
        }
        if (postsRes && postsRes.ok) {
          const data = await postsRes.json();
          setCommunityPosts(data);
        }
        if (settingsRes && settingsRes.ok) {
          const data = await settingsRes.json();
          setPlatformSettings(data);
        }
        if (appointmentsRes && appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          setVideoAppointments(data);
        }
      } catch (err) {
        console.warn('Backend offline or starting up, using local state store');
        generateLocalSlots();
      }
    };

    fetchData();
  }, []);

  const generateLocalSlots = () => {
    const times = [
      '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
      '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
      '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
      '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
      '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
      '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
      '04:00 PM'
    ];

    const generated = times.map((t, idx) => {
      const tokenNumber = idx + 1;
      let status: OpSlot['status'] = 'AVAILABLE';
      let patientId: string | undefined = undefined;
      let patientName: string | undefined = undefined;
      let patientPhone: string | undefined = undefined;
      let bookedByNurseId: string | undefined = undefined;
      let nurseReferralCode: string | undefined = undefined;

      if (tokenNumber === 1) {
        status = 'COMPLETED';
        patientId = 'user-patient-prev';
        patientName = 'G. Subramanian';
        patientPhone = '9845011111';
      } else if (tokenNumber === 2) {
        status = 'IN_CONSULTATION';
        patientName = 'Meenakshi Sundaram';
        patientPhone = '9845023456';
      } else if (tokenNumber === 3) {
        status = 'BOOKED';
        patientName = 'K. Arumugam';
        patientPhone = '9845034567';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
      } else if (tokenNumber >= 11 && tokenNumber <= 15) {
        status = 'RESERVED_BULK';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
      }

      return {
        id: `slot-${tokenNumber}`,
        doctorId: 'doc-1',
        doctorName: 'Dr. Ananya Sharma, MD, DM',
        hospitalId: 'hosp-1',
        hospitalName: 'City Care Multi-Specialty Hospital',
        specialty: 'Cardiology',
        date: new Date().toISOString().split('T')[0],
        time: t,
        tokenNumber,
        status,
        patientId,
        patientName,
        patientPhone,
        bookedByNurseId,
        nurseReferralCode,
        feePaid: 100,
        feeSplit: {
          doctor: 50,
          nurse: bookedByNurseId ? 15 : 0,
          franchise: 10,
          platform: bookedByNurseId ? 20 : 35,
          gst: 5
        }
      };
    });

    setSlots(generated);
  };

  // Helper: Trigger WhatsApp Toast Notification
  const triggerWhatsAppToast = (
    title: string, 
    message: string, 
    type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK'
  ) => {
    const newNotif: WhatsAppNotification = {
      id: `wa-${Date.now()}`,
      to: '+91 9876543210',
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };

    setWhatsAppNotifications(prev => [newNotif, ...prev]);
    setUnreadWhatsAppCount(prev => prev + 1);
  };

  // 1. Patient Action: Book Outpatient Slot
  const handleBookSlot = async (slotId: string, patientName: string, patientPhone: string, referralCode?: string) => {
    // Try API
    try {
      const res = await fetch('/api/op/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, patientName, patientPhone, patientId: patientProfile.userId, nurseReferralCode: referralCode })
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(prev => prev.map(s => s.id === slotId ? data.slot : s));
        return data;
      }
    } catch (e) {
      // Fallback local update
    }

    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        const isNurse = !!referralCode;
        return {
          ...s,
          status: 'BOOKED',
          patientName,
          patientPhone,
          patientId: patientProfile.userId,
          bookedByNurseId: isNurse ? 'nurse-1' : undefined,
          nurseReferralCode: referralCode,
          feeSplit: {
            doctor: splitConfig.doctorFee,
            nurse: isNurse ? splitConfig.nurseReferralCommission : 0,
            franchise: splitConfig.franchiseShare,
            platform: isNurse ? splitConfig.platformShare : (splitConfig.platformShare + splitConfig.nurseReferralCommission),
            gst: splitConfig.gstAmount
          }
        };
      }
      return s;
    }));

    // Update nurse stats if referred
    if (referralCode) {
      setNurses(prev => prev.map(n => ({
        ...n,
        totalReferrals: n.totalReferrals + 1,
        walletBalance: n.walletBalance + splitConfig.nurseReferralCommission,
        totalEarnings: n.totalEarnings + splitConfig.nurseReferralCommission
      })));
    }

    return { message: 'Slot booked locally' };
  };

  // 1b. Patient Action: Cancel Outpatient Slot
  const handleCancelSlot = async (slotId: string) => {
    try {
      const res = await fetch('/api/op/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId })
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(prev => prev.map(s => s.id === slotId ? data.slot : s));
        return data;
      }
    } catch (e) {}

    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          status: 'AVAILABLE',
          patientId: undefined,
          patientName: undefined,
          patientPhone: undefined,
          bookedAt: undefined,
          bookedByNurseId: undefined,
          nurseReferralCode: undefined
        };
      }
      return s;
    }));

    return { message: 'Slot cancelled locally' };
  };

  // 2. Patient Action: Progressive Profile Update
  const handleUpdateProfile = async (updated: Partial<PatientProfile>) => {
    setPatientProfile(prev => ({
      ...prev,
      ...updated,
      profileCompletionPct: 100 // Boosted upon filling medical history
    }));
  };

  // 3. Doctor Action: Advance Queue
  const handleCallNextToken = async (doctorId: string) => {
    // Try API
    try {
      const res = await fetch('/api/doctor/queue/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh slots from server
        const sRes = await fetch('/api/op/slots');
        if (sRes.ok) setSlots(await sRes.json());
        return data;
      }
    } catch (e) {}

    // Fallback local queue advancement
    setSlots(prev => {
      const list = [...prev];
      const curIdx = list.findIndex(s => s.doctorId === doctorId && s.status === 'IN_CONSULTATION');
      if (curIdx !== -1) list[curIdx] = { ...list[curIdx], status: 'COMPLETED' };

      const nextIdx = list.findIndex(s => s.doctorId === doctorId && s.status === 'BOOKED');
      if (nextIdx !== -1) list[nextIdx] = { ...list[nextIdx], status: 'IN_CONSULTATION' };
      return list;
    });
  };

  // 4. Doctor Action: AI Diagnostic Engine
  const handleRunAiDiagnostics = async (patientData: any) => {
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Fallback medical differential diagnosis
    return {
      possibleDiagnoses: [
        {
          condition: 'Essential Hypertension with Hypertensive Heart Disease',
          probability: 'HIGH',
          icd10Code: 'I11.9',
          rationale: 'Patient presents with exertional discomfort and elevated systemic vascular resistance indicators.'
        },
        {
          condition: 'Angina Pectoris / Stable Coronary Artery Disease',
          probability: 'MODERATE',
          icd10Code: 'I20.9',
          rationale: 'Substernal chest tightness with relation to physical effort.'
        },
        {
          condition: 'Costochondritis / Musculoskeletal Chest Wall Strain',
          probability: 'LOW',
          icd10Code: 'M94.0',
          rationale: 'Palpatory tenderness over parasternal costochondral junctions.'
        },
        {
          condition: 'Gastroesophageal Reflux Disease (GERD) with Pseudoangina',
          probability: 'LOW',
          icd10Code: 'K21.9',
          rationale: 'Acid regurgitation presenting with substernal burn mimicry.'
        }
      ],
      urgencyLevel: 'ELEVATED',
      recommendedInvestigations: ['12-Lead Electrocardiogram (ECG)', 'Serum Troponin-I', '2D Echocardiogram', 'Lipid Profile'],
      clinicalPrecaution: 'Rule out acute coronary syndrome if radiating pain to left arm or diaphoresis develops.'
    };
  };

  // 5. Doctor Action: Create Prescription
  const handleCreatePrescription = async (prescriptionData: any) => {
    try {
      const res = await fetch('/api/doctor/prescription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData)
      });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(prev => [data.prescription, ...prev]);
        return data;
      }
    } catch (e) {}

    const newRx: DigitalPrescription = {
      ...prescriptionData,
      id: `rx-${Date.now().toString().slice(-4)}`,
      issuedAt: new Date().toISOString(),
      verificationQrHash: `VERIF-RX-${Date.now()}-BCARE-AUTH`
    };

    setPrescriptions(prev => [newRx, ...prev]);
    return { prescription: newRx };
  };

  // 6. Nurse Action: Bulk Reserve
  const handleBulkReserve = async (nurseId: string, doctorId: string, startToken: number, endToken: number) => {
    try {
      const res = await fetch('/api/nurse/bulk-reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nurseId, doctorId, startToken, endToken })
      });
      if (res.ok) {
        const sRes = await fetch('/api/op/slots');
        if (sRes.ok) setSlots(await sRes.json());
        return await res.json();
      }
    } catch (e) {}

    setSlots(prev => prev.map(s => {
      if (s.doctorId === doctorId && s.tokenNumber >= startToken && s.tokenNumber <= endToken && s.status === 'AVAILABLE') {
        return {
          ...s,
          status: 'RESERVED_BULK',
          bookedByNurseId: nurseId,
          nurseReferralCode: 'NURSE-PRIYA-782',
          bulkReservationBatchId: `BATCH-LOCAL-${Date.now().toString().slice(-4)}`
        };
      }
      return s;
    }));

    return { message: 'Reserved locally' };
  };

  // 7. Nurse Action: Assign Bulk Slot
  const handleAssignBulkSlot = async (slotId: string, patientName: string, patientPhone: string, nurseId: string) => {
    try {
      const res = await fetch('/api/nurse/assign-bulk-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, patientName, patientPhone, nurseId })
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(prev => prev.map(s => s.id === slotId ? data.slot : s));
        return data;
      }
    } catch (e) {}

    setSlots(prev => prev.map(s => {
      if (s.id === slotId) {
        return {
          ...s,
          status: 'BOOKED',
          patientName,
          patientPhone,
          feeSplit: {
            doctor: splitConfig.doctorFee,
            nurse: splitConfig.nurseReferralCommission,
            franchise: splitConfig.franchiseShare,
            platform: splitConfig.platformShare,
            gst: splitConfig.gstAmount
          }
        };
      }
      return s;
    }));

    setNurses(prev => prev.map(n => ({
      ...n,
      totalReferrals: n.totalReferrals + 1,
      walletBalance: n.walletBalance + splitConfig.nurseReferralCommission,
      totalEarnings: n.totalEarnings + splitConfig.nurseReferralCommission
    })));

    return { message: 'Assigned locally' };
  };

  // 8. Franchise Action: Reconcile Cash
  const handleReconcileCash = async (amount: number) => {
    try {
      const res = await fetch('/api/franchise/reconcile-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const data = await res.json();
        setFranchise(data.franchise);
        return data;
      }
    } catch (e) {}

    setFranchise(prev => ({
      ...prev,
      cashDepositedToday: prev.cashDepositedToday + amount,
      pendingReconciliation: Math.max(0, prev.cashCollectedToday - (prev.cashDepositedToday + amount))
    }));

    return { message: 'Reconciled locally' };
  };

  // 9. Admin Action: Update Split Config
  const handleUpdateSplitConfig = async (newConfig: Partial<RevenueSplitConfig>) => {
    try {
      const res = await fetch('/api/admin/revenue-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setSplitConfig(data.config);
        return data;
      }
    } catch (e) {}

    setSplitConfig(prev => ({ ...prev, ...newConfig }));
    return { message: 'Updated locally' };
  };

  // 10. Community Action: Add Post
  const handleAddCommunityPost = async (post: { category: string; title: string; content: string }) => {
    const newP: CommunityPost = {
      id: `p-${Date.now()}`,
      category: post.category,
      title: post.title,
      content: post.content,
      authorId: patientProfile.userId,
      authorName: patientProfile.name,
      authorRole: 'PATIENT',
      upvotes: 1,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };
    setCommunityPosts(prev => [newP, ...prev]);
  };

  // 11. Community Action: Add Comment
  const handleAddCommunityComment = async (postId: string, content: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const comments = p.comments || [];
        return {
          ...p,
          commentCount: p.commentCount + 1,
          comments: [
            ...comments,
            {
              id: `c-${Date.now()}`,
              authorName: patientProfile.name,
              authorRole: 'PATIENT',
              content,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return p;
    }));
  };

  // 12. Admin Action: Update Doctor Profile & Fees
  const handleUpdateDoctor = async (docId: string, updates: Partial<DoctorProfile>) => {
    try {
      const res = await fetch(`/api/admin/doctors/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(prev => prev.map(d => d.id === docId ? data.doctor : d));
        return data;
      }
    } catch (e) {}
    setDoctors(prev => prev.map(d => d.id === docId ? { ...d, ...updates } : d));
    return { message: 'Doctor updated locally' };
  };

  // 13. Admin Action: Add Doctor
  const handleAddDoctor = async (docData: any) => {
    try {
      const res = await fetch('/api/admin/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(prev => [...prev, data]);
        return data;
      }
    } catch (e) {}
    const newDoc: DoctorProfile = {
      id: `doc-${Date.now()}`,
      userId: `user-doc-${Date.now()}`,
      name: docData.name,
      specialty: docData.specialty,
      hospitalId: docData.hospitalId,
      hospitalName: docData.hospitalName,
      experienceYears: docData.experienceYears || 5,
      opConsultationFee: docData.opConsultationFee || 100,
      teleConsultationFee: docData.teleConsultationFee || 200,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      rating: 4.8,
      totalConsultations: 0,
      status: 'ACTIVE',
      distance: '1.5 km',
      videoAvailable: true
    };
    setDoctors(prev => [...prev, newDoc]);
    return newDoc;
  };

  // 14. Admin Action: Update Hospital
  const handleUpdateHospital = async (hospId: string, updates: Partial<Hospital>) => {
    try {
      const res = await fetch(`/api/admin/hospitals/${hospId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(prev => prev.map(h => h.id === hospId ? data.hospital : h));
        return data;
      }
    } catch (e) {}
    setHospitals(prev => prev.map(h => h.id === hospId ? { ...h, ...updates } : h));
    return { message: 'Hospital updated locally' };
  };

  // 15. Admin Action: Add Hospital
  const handleAddHospital = async (hospData: any) => {
    try {
      const res = await fetch('/api/admin/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospData)
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(prev => [...prev, data]);
        return data;
      }
    } catch (e) {}
    const newHosp: Hospital = {
      id: `hosp-${Date.now()}`,
      name: hospData.name,
      districtId: 'dist-coimbatore-central',
      districtName: hospData.districtName || 'Coimbatore Central',
      address: hospData.address,
      rating: 4.5,
      specialties: ['General Medicine'],
      baseOpFee: hospData.baseOpFee || 100,
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
      emergencyAvailable: hospData.emergencyAvailable ?? true,
      distance: '2.5 km',
      activeDoctorsCount: 4
    };
    setHospitals(prev => [...prev, newHosp]);
    return newHosp;
  };

  // 16. Admin Action: Update Platform Settings
  const handleUpdatePlatformSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data.settings);
        return data;
      }
    } catch (e) {}
    setPlatformSettings(prev => ({ ...prev, ...newSettings }));
    return { message: 'Settings updated locally' };
  };

  // 17. Telehealth Video Booking
  const handleBookVideoConsultation = async (bookingData: any) => {
    try {
      const res = await fetch('/api/telehealth/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const data = await res.json();
        setVideoAppointments(prev => [data.appointment, ...prev]);
        return data;
      }
    } catch (e) {}
    const apt: VideoAppointment = {
      id: `vid-${Date.now()}`,
      doctorId: bookingData.doctorId,
      doctorName: bookingData.doctorName,
      doctorSpecialty: bookingData.doctorSpecialty,
      hospitalName: bookingData.hospitalName,
      patientId: patientProfile.userId,
      patientName: patientProfile.name,
      patientPhone: patientProfile.phone,
      date: new Date().toISOString().split('T')[0],
      time: bookingData.time || '11:00 AM',
      meetingLink: `https://meet.bcare.health/room/bc-vid-${bookingData.doctorId.slice(-4)}`,
      feePaid: bookingData.feePaid || 200,
      status: 'SCHEDULED',
      paymentMethod: bookingData.paymentMethod || 'UPI',
      createdAt: new Date().toISOString()
    };
    setVideoAppointments(prev => [apt, ...prev]);
    return { appointment: apt };
  };

  // Nimbus Liquid Glass Nav Items: Home, Bookings (Visits + Video), AI Health, Hospitals (with Maps), Profile (with Records & Legal)
  const activeBookingsCount = (
    slots.filter(s => s.patientPhone === currentUser?.phone && (s.status === 'BOOKED' || s.status === 'IN_CONSULTATION')).length +
    videoAppointments.filter(v => v.patientPhone === currentUser?.phone && v.status === 'SCHEDULED').length
  );

  const patientNavItems: LiquidNavItem<'op_booking' | 'bookings' | 'ai_assist' | 'hospitals' | 'profile'>[] = [
    {
      id: 'op_booking',
      label: 'Home',
      icon: Home,
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: CalendarCheck,
      badge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
    },
    {
      id: 'ai_assist',
      label: 'AI Health',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'hospitals',
      label: 'Hospitals',
      icon: Building2,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      verifiedBeacon: true,
    },
  ];

  const nurseNavItems: LiquidNavItem<'referrals' | 'bulk' | 'walkin' | 'profile'>[] = [
    { id: 'referrals', label: 'Referrals', icon: Ticket },
    { id: 'bulk', label: 'Bulk', icon: Layers },
    { id: 'walkin', label: 'Walk-ins', icon: UserPlus },
    { id: 'profile', label: 'Profile', icon: User, verifiedBeacon: true },
  ];

  const doctorNavItems: LiquidNavItem<'queue' | 'rx' | 'completed' | 'profile'>[] = [
    { id: 'queue', label: 'Queue', icon: Stethoscope },
    { id: 'rx', label: 'Rx & AI', icon: Sparkles },
    { id: 'completed', label: 'Ledger', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User, verifiedBeacon: true },
  ];

  const franchiseNavItems: LiquidNavItem<'territory' | 'hospitals' | 'nurses' | 'profile'>[] = [
    { id: 'territory', label: 'Territory', icon: Landmark },
    { id: 'hospitals', label: 'Centers', icon: Building2 },
    { id: 'nurses', label: 'Nurses', icon: Users },
    { id: 'profile', label: 'Profile', icon: User, verifiedBeacon: true },
  ];

  const activeUserTokens = slots.filter(
    s => (s.patientPhone === patientProfile.phone || (patientProfile.userId && s.patientId === patientProfile.userId)) && (s.status === 'BOOKED' || s.status === 'IN_CONSULTATION')
  );

  const handleAuthSuccess = (data: { user: any; token: string; role: UserRole; profile: any }) => {
    setCurrentUser(data.user);
    setCurrentRole(data.role);
    if (data.profile && data.role === 'PATIENT') {
      setPatientProfile(prev => ({
        ...prev,
        ...data.profile,
        name: data.user.name,
        phone: data.user.phone
      }));
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('bcare_user', JSON.stringify(data.user));
      localStorage.setItem('bcare_token', data.token);
    }
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bcare_user');
      localStorage.removeItem('bcare_token');
    }
    setIsAuthOpen(true);
  };

  // Render Portal by Role or Auth View
  const renderPortal = () => {
    if (isAuthOpen || !currentUser) {
      return (
        <AuthScreen
          onSuccess={handleAuthSuccess}
          initialRole={currentRole}
          isSimulator={true}
        />
      );
    }

    switch (currentRole) {
      case 'PATIENT':
        return (
          <PatientPortal
            patientProfile={patientProfile}
            hospitals={hospitals}
            doctors={doctors}
            slots={slots}
            prescriptions={prescriptions}
            videoAppointments={videoAppointments}
            communityPosts={communityPosts}
            splitConfig={splitConfig}
            platformSettings={platformSettings}
            isMobile={isMobile}
            activeTab={patientTab}
            onTabChange={setPatientTab}
            onBookSlot={handleBookSlot}
            onCancelSlot={handleCancelSlot}
            onBookVideoConsultation={handleBookVideoConsultation}
            onUpdateProfile={handleUpdateProfile}
            onAddCommunityPost={handleAddCommunityPost}
            onAddCommunityComment={handleAddCommunityComment}
            onTriggerWhatsAppToast={triggerWhatsAppToast}
            onBookingScreenToggle={setIsPatientBookingActive}
            onLogout={handleLogout}
            userLocation={userLocation}
            onRefreshLocation={async () => {
              const loc = await detectCurrentLocation(true);
              setUserLocation(loc);
              if (loc.displayName) {
                setPatientProfile(prev => ({ ...prev, city: loc.displayName }));
              }
            }}
            onSelectLocation={(loc) => {
              setUserLocation(loc);
              if (loc.displayName) {
                setPatientProfile(prev => ({ ...prev, city: loc.displayName }));
              }
            }}
          />
        );
      case 'DOCTOR':
        return (
          <DoctorPortal
            doctor={doctors[0]}
            slots={slots}
            splitConfig={splitConfig}
            isMobile={isMobile}
            activeTab={doctorTab}
            onTabChange={setDoctorTab}
            onCallNextToken={handleCallNextToken}
            onRunAiDiagnostics={handleRunAiDiagnostics}
            onCreatePrescription={handleCreatePrescription}
            onTriggerWhatsAppToast={triggerWhatsAppToast}
            onLogout={handleLogout}
          />
        );
      case 'NURSE':
        return (
          <NursePortal
            nurse={nurses[0]}
            slots={slots}
            doctors={doctors}
            splitConfig={splitConfig}
            isMobile={isMobile}
            activeTab={nurseTab}
            onTabChange={setNurseTab}
            onBulkReserve={handleBulkReserve}
            onAssignBulkSlot={handleAssignBulkSlot}
            onTriggerWhatsAppToast={triggerWhatsAppToast}
            onLogout={handleLogout}
          />
        );
      case 'FRANCHISE_ADMIN':
        return (
          <FranchisePortal
            franchise={franchise}
            hospitals={hospitals}
            nurses={nurses}
            slots={slots}
            splitConfig={splitConfig}
            isMobile={isMobile}
            activeTab={franchiseTab}
            onTabChange={setFranchiseTab}
            onReconcileCash={handleReconcileCash}
            onLogout={handleLogout}
          />
        );
      case 'SUPER_ADMIN':
        return (
          <AdminPortal
            splitConfig={splitConfig}
            slots={slots}
            hospitals={hospitals}
            franchises={[franchise]}
            doctors={doctors}
            platformSettings={platformSettings}
            isMobile={isMobile}
            onUpdateSplitConfig={handleUpdateSplitConfig}
            onUpdateDoctor={handleUpdateDoctor}
            onAddDoctor={handleAddDoctor}
            onUpdateHospital={handleUpdateHospital}
            onAddHospital={handleAddHospital}
            onUpdatePlatformSettings={handleUpdatePlatformSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-zinc-900">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          const defaultUser = roleDefaultUsers[role];
          if (defaultUser) {
            setCurrentUser(defaultUser);
            localStorage.setItem('bcare_user', JSON.stringify(defaultUser));
          }
          if (!currentUser) setIsAuthOpen(true);
        }}
        deviceView={deviceView}
        onDeviceViewChange={setDeviceView}
        onOpenWhatsAppLog={() => {
          setWhatsAppModalOpen(true);
          setUnreadWhatsAppCount(0);
        }}
        unreadWhatsAppCount={unreadWhatsAppCount}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container / Mobile Device Wrapper (iPhone & Android Exclusive) */}
      <main className="flex-1 py-2 sm:py-4">

        {/* If iPhone Frame Preview */}
        {deviceView === 'iphone' && (
          <div className="flex flex-col items-center justify-center py-1 sm:py-2 px-2">
            
            {/* View Mode & Splash Controls */}
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center p-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] font-medium shadow-xs">
                <button
                  onClick={() => setFrameStyle('minimal')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    frameStyle === 'minimal'
                      ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Clean Mobile View (Zero outside borders)"
                >
                  Clean Screen
                </button>
                <button
                  onClick={() => setFrameStyle('chassis')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    frameStyle === 'chassis'
                      ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Ultra-thin Titanium Bezel"
                >
                  iPhone 15 Pro
                </button>
              </div>
            </div>

            {/* Mobile Device Presentation */}
            <div className="relative select-none">
              
              {/* Outer Presentation Wrapper: Minimalist Seamless Canvas vs Ultra-Slim Titanium Bezel */}
              <div className={
                frameStyle === 'minimal'
                  ? "w-[390px] h-[calc(100vh-140px)] max-h-[820px] min-h-[580px] bg-[#fafafa] rounded-[32px] border border-zinc-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col relative overflow-hidden"
                  : "w-[394px] h-[calc(100vh-140px)] max-h-[824px] min-h-[580px] bg-zinc-950 p-[3.5px] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-zinc-800 flex flex-col relative overflow-hidden"
              }>
                
                {/* Screen Container (Crisp, perfectly concentric, 100% solid background with ZERO corner smudges) */}
                <div className={`w-full h-full bg-[#fafafa] ${frameStyle === 'chassis' ? 'rounded-[44.5px]' : 'rounded-[32px]'} overflow-hidden flex flex-col relative`}>
                  
                  {/* Native iOS Status Bar (100% Solid Background - Guaranteed Zero WebKit Corner Smear) */}
                  <div className="h-[48px] bg-[#fafafa] sticky top-0 z-40 shrink-0 relative select-none border-b border-zinc-100">
                    
                    {/* Time (Left) */}
                    <div className="absolute top-[15px] left-6 font-semibold text-[13px] text-zinc-950 font-sans tracking-tight leading-none">
                      9:41
                    </div>

                    {/* True Apple Dynamic Island (Centered, Clean Pill) */}
                    <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-xs pointer-events-none">
                      {/* Ambient Light Sensor */}
                      <span className="w-2.5 h-2.5 rounded-full bg-[#121215]" />
                      {/* TrueDepth Camera Lens with Anti-Reflective Flare */}
                      <div className="w-3 h-3 rounded-full bg-[#0a0a0f] ring-1 ring-zinc-800 flex items-center justify-center">
                        <span className="w-1 h-1 rounded-full bg-[#1e293b]" />
                      </div>
                    </div>

                    {/* Signal, Wi-Fi & Battery (Right) */}
                    <div className="absolute top-[14px] right-6 flex items-center gap-1.5 text-zinc-950 leading-none">
                      <svg className="w-4 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="16" width="3.5" height="6" rx="1"/>
                        <rect x="7.5" y="12" width="3.5" height="10" rx="1"/>
                        <rect x="13" y="8" width="3.5" height="14" rx="1"/>
                        <rect x="18.5" y="4" width="3.5" height="18" rx="1"/>
                      </svg>
                      {/* Apple Battery Pill */}
                      <div className="w-5 h-2.5 rounded-[4px] border border-zinc-950 p-[1.5px] flex items-center relative">
                        <div className="h-full w-full bg-zinc-950 rounded-[2px]" />
                        <div className="w-[1.5px] h-1.5 bg-zinc-950 rounded-r-xs absolute -right-[2.5px] top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                  </div>

                  {/* In-App Mobile Header with B care Branding (Hidden during AI Assistant mode) */}
                  {!(currentRole === 'PATIENT' && patientTab === 'ai_assist') && (
                    <div className="h-12 bg-white px-4 flex items-center justify-between border-b border-zinc-100 shrink-0 z-30 select-none">
                      <div className="flex items-center gap-2">
                        <BCareLogo size={28} variant="full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setWhatsAppModalOpen(true)}
                          className="relative p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                          title="WhatsApp Alerts"
                        >
                          <MessageCircle className="w-4 h-4 text-zinc-700" />
                          {unreadWhatsAppCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                              {unreadWhatsAppCount}
                            </span>
                          )}
                        </button>
                        {currentUser ? (
                          <button
                            type="button"
                            onClick={handleToggleProfile}
                            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
                            title={isProfileActive ? 'Close Profile View' : `Logged in as ${currentUser.name} • Tap for Profile & Sign Out`}
                          >
                            <div className="relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs border border-white transition-all ${
                                isProfileActive
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white'
                              }`}>
                                {isProfileActive ? (
                                  <X className="w-4 h-4 text-white" />
                                ) : (
                                  currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                                )}
                              </div>
                              {!isProfileActive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                              )}
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                          >
                            Sign In
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screen Content Container (Strict Overflow Protection) */}
                  <div className={`flex-1 ${
                    currentRole === 'PATIENT' && patientTab === 'ai_assist'
                      ? 'overflow-hidden flex flex-col px-3 pt-1 pb-2 h-full'
                      : isPatientBookingActive 
                      ? 'overflow-y-auto overflow-x-hidden p-0' 
                      : isAuthOpen || !currentUser 
                      ? 'overflow-y-auto overflow-x-hidden px-1 pt-1 pb-4' 
                      : 'overflow-y-auto overflow-x-hidden px-3.5 pt-3 pb-24'
                  } scrollbar-none w-full relative`}>
                    {renderPortal()}
                  </div>

                  {/* Nimbus Liquid Glass Navbar Dock for ALL Roles */}
                  <div className="absolute bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none">
                    <AnimatePresence>
                      {currentUser && !isAuthOpen && currentRole !== 'SUPER_ADMIN' && !isPatientBookingActive && !(currentRole === 'PATIENT' && patientTab === 'ai_assist') && (
                        <motion.div
                          key="liquid-glass-dock-ios"
                          initial={{ y: 90, opacity: 0, scale: 0.94 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: 90, opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="w-[93%] max-w-[344px] pointer-events-auto"
                        >
                          {currentRole === 'PATIENT' && (
                            <LiquidGlassNavbar
                              items={patientNavItems}
                              activeId={patientTab}
                              onChange={setPatientTab}
                            />
                          )}
                          {currentRole === 'NURSE' && (
                            <LiquidGlassNavbar
                              items={nurseNavItems}
                              activeId={nurseTab}
                              onChange={setNurseTab}
                            />
                          )}
                          {currentRole === 'DOCTOR' && (
                            <LiquidGlassNavbar
                              items={doctorNavItems}
                              activeId={doctorTab}
                              onChange={setDoctorTab}
                            />
                          )}
                          {currentRole === 'FRANCHISE_ADMIN' && (
                            <LiquidGlassNavbar
                              items={franchiseNavItems}
                              activeId={franchiseTab}
                              onChange={setFranchiseTab}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>



                  {/* Bottom Home Indicator Bar (Clean, Solid) */}
                  <div className="py-2 bg-transparent shrink-0 pointer-events-none relative z-30">
                    <div className="w-28 h-1 bg-zinc-950/30 rounded-full mx-auto" />
                  </div>

                  {/* In-App Simulator Splash Screen */}
                  {showSplashScreen && (
                    <SplashScreen isSimulator={true} onFinish={() => setShowSplashScreen(false)} />
                  )}

                  {/* Dynamic Screen-Pinned Modal Root Layer */}
                  <div id="phone-screen-modal-root" className="absolute inset-0 z-50 pointer-events-none overflow-hidden" />

                </div>
              </div>
            </div>
          </div>
        )}

        {/* If Android Frame Preview */}
        {deviceView === 'android' && (
          <div className="flex flex-col items-center justify-center py-1 sm:py-2 px-2">
            
            {/* View Mode & Splash Controls */}
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-flex items-center p-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] font-medium shadow-xs">
                <button
                  onClick={() => setFrameStyle('minimal')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    frameStyle === 'minimal'
                      ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Clean Mobile View (Zero outside borders)"
                >
                  Clean Screen
                </button>
                <button
                  onClick={() => setFrameStyle('chassis')}
                  className={`px-3 py-1 rounded-full transition-all ${
                    frameStyle === 'chassis'
                      ? 'bg-white text-zinc-950 shadow-xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                  title="Pixel 8 Hardware Bezel"
                >
                  Pixel 8
                </button>
              </div>
            </div>

            {/* Android Presentation */}
            <div className="relative select-none">
              <div className={
                frameStyle === 'minimal'
                  ? "w-[390px] h-[calc(100vh-140px)] max-h-[820px] min-h-[580px] bg-[#fafafa] rounded-[30px] border border-zinc-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col relative overflow-hidden"
                  : "w-[394px] h-[calc(100vh-140px)] max-h-[824px] min-h-[580px] bg-zinc-950 p-[3.5px] rounded-[44px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-zinc-800 flex flex-col relative overflow-hidden"
              }>
                {/* Screen Inner Container */}
                <div className={`w-full h-full bg-[#fafafa] ${frameStyle === 'chassis' ? 'rounded-[40.5px]' : 'rounded-[30px]'} overflow-hidden flex flex-col relative`}>
                  
                  {/* Fixed Android Status Bar (Solid Background, Zero Smudge) */}
                  <div className="h-[46px] bg-[#fafafa] sticky top-0 z-40 px-5 flex items-center justify-between border-b border-zinc-100 shrink-0 select-none">
                    <span className="font-semibold text-xs text-zinc-950 font-sans">10:00</span>
                    
                    {/* Camera Punchhole */}
                    <div className="w-3.5 h-3.5 bg-black rounded-full border border-zinc-800" />
                    
                    {/* Battery & Signal */}
                    <div className="flex items-center gap-1.5 text-zinc-950 text-[10px] tabular-nums font-medium">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* In-App Mobile Header with B care Logo (Hidden during AI Assistant mode) */}
                  {!(currentRole === 'PATIENT' && patientTab === 'ai_assist') && (
                    <div className="h-12 bg-white px-4 flex items-center justify-between border-b border-zinc-100 shrink-0 z-30 select-none">
                      <div className="flex items-center gap-2">
                        <BCareLogo size={28} variant="full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setWhatsAppModalOpen(true)}
                          className="relative p-1.5 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                          title="WhatsApp Alerts"
                        >
                          <MessageCircle className="w-4 h-4 text-zinc-700" />
                          {unreadWhatsAppCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                              {unreadWhatsAppCount}
                            </span>
                          )}
                        </button>
                        {currentUser ? (
                          <button
                            type="button"
                            onClick={handleToggleProfile}
                            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer group"
                            title={isProfileActive ? 'Close Profile View' : `Logged in as ${currentUser.name} • Tap for Profile & Sign Out`}
                          >
                            <div className="relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs border border-white transition-all ${
                                isProfileActive
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white'
                              }`}>
                                {isProfileActive ? (
                                  <X className="w-4 h-4 text-white" />
                                ) : (
                                  currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                                )}
                              </div>
                              {!isProfileActive && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                              )}
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAuthOpen(true)}
                            className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                          >
                            Sign In
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Screen Content Container */}
                  <div className={`flex-1 ${
                    currentRole === 'PATIENT' && patientTab === 'ai_assist'
                      ? 'overflow-hidden flex flex-col px-3 pt-1 pb-2 h-full'
                      : isPatientBookingActive 
                      ? 'overflow-y-auto overflow-x-hidden p-0' 
                      : isAuthOpen || !currentUser 
                      ? 'overflow-y-auto overflow-x-hidden px-1 pt-1 pb-4' 
                      : 'overflow-y-auto overflow-x-hidden px-3.5 pt-3 pb-24'
                  } scrollbar-none w-full relative`}>
                    {renderPortal()}
                  </div>

                  {/* Nimbus Liquid Glass Navbar Dock for ALL Roles */}
                  <div className="absolute bottom-5 inset-x-0 z-40 flex justify-center pointer-events-none">
                    <AnimatePresence>
                      {currentUser && !isAuthOpen && currentRole !== 'SUPER_ADMIN' && !isPatientBookingActive && !(currentRole === 'PATIENT' && patientTab === 'ai_assist') && (
                        <motion.div
                          key="liquid-glass-dock-android"
                          initial={{ y: 90, opacity: 0, scale: 0.94 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: 90, opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                          className="w-[93%] max-w-[344px] pointer-events-auto"
                        >
                          {currentRole === 'PATIENT' && (
                            <LiquidGlassNavbar
                              items={patientNavItems}
                              activeId={patientTab}
                              onChange={setPatientTab}
                            />
                          )}
                          {currentRole === 'NURSE' && (
                            <LiquidGlassNavbar
                              items={nurseNavItems}
                              activeId={nurseTab}
                              onChange={setNurseTab}
                            />
                          )}
                          {currentRole === 'DOCTOR' && (
                            <LiquidGlassNavbar
                              items={doctorNavItems}
                              activeId={doctorTab}
                              onChange={setDoctorTab}
                            />
                          )}
                          {currentRole === 'FRANCHISE_ADMIN' && (
                            <LiquidGlassNavbar
                              items={franchiseNavItems}
                              activeId={franchiseTab}
                              onChange={setFranchiseTab}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>



                  {/* Bottom Gesture Navigation Pill */}
                  <div className="py-2 bg-transparent shrink-0 pointer-events-none relative z-30">
                    <div className="w-24 h-1 bg-zinc-900/35 rounded-full mx-auto" />
                  </div>

                  {/* In-App Simulator Splash Screen */}
                  {showSplashScreen && (
                    <SplashScreen isSimulator={true} onFinish={() => setShowSplashScreen(false)} />
                  )}

                  {/* Dynamic Screen-Pinned Modal Root Layer */}
                  <div id="phone-screen-modal-root" className="absolute inset-0 z-50 pointer-events-none overflow-hidden" />

                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* WhatsApp Outbound Alerts Simulator Modal */}
      <WhatsAppAlertModal
        isOpen={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        notifications={whatsAppNotifications}
        onTriggerDownloadRx={(rxId) => {
          const rx = prescriptions.find(p => p.id === rxId) || prescriptions[0];
          if (rx) generatePrescriptionPdf(rx);
        }}
      />

      {/* Unified Liquid Glass Profile Sheet (Triggered by Top-Right Profile Pill) */}
      <ProfileDrawer
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        activeUserTokens={activeUserTokens}
        onOpenFullProfile={() => {
          if (currentRole === 'PATIENT') {
            setPreviousPatientTab(patientTab as any);
            setPatientTab('profile');
          } else if (currentRole === 'NURSE') setNurseTab('profile');
          else if (currentRole === 'DOCTOR') setDoctorTab('profile');
          else if (currentRole === 'FRANCHISE_ADMIN') setFranchiseTab('profile');
        }}
        onLogout={handleLogout}
        onSwitchRole={(role) => {
          setCurrentRole(role as UserRole);
          const defaultUser = roleDefaultUsers[role as UserRole];
          if (defaultUser) {
            setCurrentUser(defaultUser);
            localStorage.setItem('bcare_user', JSON.stringify(defaultUser));
          }
        }}
        onOpenLivePass={() => {
          if (currentRole === 'PATIENT') {
            setPatientTab('profile');
          }
        }}
      />

    </div>
  );
}

export default App;
