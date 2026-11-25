import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RevenueSplitConfig, 
  OpSlot, 
  Hospital, 
  FranchiseTerritory,
  DoctorProfile,
  NurseProfile,
  PatientProfile,
  PlatformSettings
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { PhoneModalPortal } from '../components/PhoneModalPortal';
import { 
  Sliders, 
  Save, 
  FileSpreadsheet, 
  ShieldCheck,
  Stethoscope,
  Building2,
  SlidersHorizontal,
  BellRing,
  Radio,
  Plus,
  Edit2,
  Check,
  Video,
  Power,
  PhoneCall,
  AlertTriangle,
  Scale,
  FileText,
  Lock,
  ChevronRight,
  X,
  MessageSquare,
  CheckCircle2,
  Activity,
  Send,
  Search,
  Filter,
  Star,
  UserCheck,
  UserX,
  Users,
  User,
  ArrowUpRight,
  Award,
  Eye,
  Trash2,
  RefreshCw,
  BadgeCheck,
  Phone,
  MapPin,
  Sparkles,
  AlertCircle,
  HeartHandshake,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPortalProps {
  splitConfig: RevenueSplitConfig;
  slots: OpSlot[];
  hospitals: Hospital[];
  franchises: FranchiseTerritory[];
  doctors: DoctorProfile[];
  nurses?: NurseProfile[];
  patientProfile?: PatientProfile;
  platformSettings: PlatformSettings;
  isMobile?: boolean;
  onUpdateSplitConfig: (newConfig: Partial<RevenueSplitConfig>) => Promise<any>;
  onUpdateDoctor: (docId: string, updates: Partial<DoctorProfile>) => Promise<any>;
  onAddDoctor: (docData: any) => Promise<any>;
  onUpdateHospital: (hospId: string, updates: Partial<Hospital>) => Promise<any>;
  onAddHospital: (hospData: any) => Promise<any>;
  onUpdatePlatformSettings: (newSettings: Partial<PlatformSettings>) => Promise<any>;
  onTriggerWhatsAppToast?: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
}

interface PendingOnboardingRequest {
  id: string;
  type: 'DOCTOR' | 'FACILITY';
  name: string;
  specialty?: string;
  affiliation?: string;
  registrationNumber?: string;
  experienceYears?: number;
  districtName: string;
  onboardingSource: string;
  proposedOpFee: number;
  proposedTeleFee?: number;
  documents: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  splitConfig,
  slots,
  hospitals,
  franchises,
  doctors,
  nurses = [],
  patientProfile,
  platformSettings,
  isMobile = false,
  onUpdateSplitConfig,
  onUpdateDoctor,
  onAddDoctor,
  onUpdateHospital,
  onAddHospital,
  onUpdatePlatformSettings,
  onTriggerWhatsAppToast
}) => {
  // Active Admin Sub-panel Tab
  const [activePanel, setActivePanel] = useState<'approvals' | 'doctors' | 'hospitals' | 'users' | 'pricing' | 'controls'>('approvals');

  // Statutory Compliance & Audit Modal
  const [activeComplianceModal, setActiveComplianceModal] = useState<'ABDM_SANDBOX' | 'DPDP_AUDIT' | 'EMERGENCY_PROTOCOL' | null>(null);

  // Local synced state for live interactive edits
  const [localDoctors, setLocalDoctors] = useState<DoctorProfile[]>(doctors);
  const [localHospitals, setLocalHospitals] = useState<Hospital[]>(hospitals);
  const [localNurses, setLocalNurses] = useState<NurseProfile[]>(nurses);

  // Sync when prop updates
  React.useEffect(() => {
    setLocalDoctors(doctors);
  }, [doctors]);

  React.useEffect(() => {
    setLocalHospitals(hospitals);
  }, [hospitals]);

  React.useEffect(() => {
    setLocalNurses(nurses);
  }, [nurses]);

  // ==============================================================
  // 1. PENDING ONBOARDING REQUESTS QUEUE
  // ==============================================================
  const [pendingRequests, setPendingRequests] = useState<PendingOnboardingRequest[]>([
    {
      id: 'req-doc-1',
      type: 'DOCTOR',
      name: 'Dr. Karthik S. Raghavan, MD, DNB',
      specialty: 'Pediatrics',
      affiliation: 'Royal Care Super Specialty Hospital',
      registrationNumber: 'TMC-99124',
      experienceYears: 9,
      districtName: 'Coimbatore South & Rural',
      onboardingSource: 'Apex Health District Franchise (Coimbatore South)',
      proposedOpFee: 150,
      proposedTeleFee: 250,
      documents: ['NMC Annual License 2026', 'MD Pediatrics Degree', 'Class 3 DSC Form'],
      status: 'PENDING'
    },
    {
      id: 'req-doc-2',
      type: 'DOCTOR',
      name: 'Dr. Sangeetha Menon, MS, DGO',
      specialty: 'Obstetrics & Gynecology',
      affiliation: 'PSG Hospitals, Peelamedu',
      registrationNumber: 'TMC-77312',
      experienceYears: 12,
      districtName: 'Coimbatore South',
      onboardingSource: 'Apex Health District Franchise (Coimbatore South)',
      proposedOpFee: 200,
      proposedTeleFee: 350,
      documents: ['NMC Registration Card', 'Aadhaar Verified ID', 'Indemnity Insurance'],
      status: 'PENDING'
    },
    {
      id: 'req-hosp-1',
      type: 'FACILITY',
      name: 'Pollachi Rural Care & Triage Clinic',
      districtName: 'Coimbatore Rural',
      affiliation: 'Outpatient Triage Facility',
      registrationNumber: 'TN-CEA-88491',
      onboardingSource: 'Apex Health District Franchise',
      proposedOpFee: 80,
      documents: ['Clinical Establishment Act License', 'Fire Safety NOC'],
      status: 'PENDING'
    }
  ]);

  const [requestFilter, setRequestFilter] = useState<'ALL' | 'DOCTOR' | 'FACILITY'>('ALL');
  const [editingRequest, setEditingRequest] = useState<PendingOnboardingRequest | null>(null);
  const [editReqOpFee, setEditReqOpFee] = useState<number>(100);
  const [editReqTeleFee, setEditReqTeleFee] = useState<number>(200);

  const pendingCount = pendingRequests.filter(r => r.status === 'PENDING').length;

  const handleApproveRequest = async (req: PendingOnboardingRequest, agreedOpFee?: number, agreedTeleFee?: number) => {
    const opFee = agreedOpFee || req.proposedOpFee;
    const teleFee = agreedTeleFee || req.proposedTeleFee || 200;

    if (req.type === 'DOCTOR') {
      const newDocData = {
        name: req.name,
        specialty: req.specialty || 'General Medicine',
        hospitalId: 'hosp-1',
        hospitalName: req.affiliation || 'City Care Multi-Specialty Hospital',
        experienceYears: req.experienceYears || 8,
        opConsultationFee: opFee,
        teleConsultationFee: teleFee,
        status: 'ACTIVE' as const,
        registrationNumber: req.registrationNumber,
        onboardingSource: req.onboardingSource,
        franchiseName: 'Apex Health District Franchise',
        featured: false,
        isAccountVerified: true
      };

      try {
        await onAddDoctor(newDocData);
        setLocalDoctors(prev => [...prev, {
          id: `doc-${Date.now()}`,
          userId: `user-doc-${Date.now()}`,
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          rating: 4.8,
          totalConsultations: 0,
          ...newDocData
        }]);
      } catch (e) {}

      if (onTriggerWhatsAppToast) {
        onTriggerWhatsAppToast(
          'Doctor Approved & Activated',
          `${req.name} verified under ${req.registrationNumber}. Welcome kit and OPD passes dispatched.`,
          'TOKEN_CONFIRMATION'
        );
      }
    } else {
      const newHospData = {
        name: req.name,
        districtName: req.districtName,
        address: `${req.districtName}, Tamil Nadu`,
        baseOpFee: opFee,
        emergencyAvailable: true,
        onboardingSource: req.onboardingSource,
        status: 'ACTIVE' as const,
        featured: false,
        isAccountVerified: true
      };

      try {
        await onAddHospital(newHospData);
        setLocalHospitals(prev => [...prev, {
          id: `hosp-${Date.now()}`,
          districtId: 'dist-coimbatore-rural',
          rating: 4.6,
          specialties: ['General Medicine', 'Triage'],
          distance: '3.5 km',
          activeDoctorsCount: 1,
          ...newHospData
        }]);
      } catch (e) {}

      if (onTriggerWhatsAppToast) {
        onTriggerWhatsAppToast(
          'Clinic Facility Approved',
          `${req.name} registered under ${req.registrationNumber}. Live on B Care network.`,
          'TOKEN_CONFIRMATION'
        );
      }
    }

    setPendingRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r));
    setEditingRequest(null);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
  };

  const handleRejectRequest = (reqId: string) => {
    setPendingRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED', rejectionReason: 'License verification mismatch' } : r));
  };

  // ==============================================================
  // 2. DOCTOR DIRECTORY SEARCH & FILTERS
  // ==============================================================
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDistrictFilter, setDoctorDistrictFilter] = useState('ALL');
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('ALL');
  const [doctorStatusFilter, setDoctorStatusFilter] = useState('ALL');

  // Doctor Edit Modal / Inline State
  const [editingDoc, setEditingDoc] = useState<DoctorProfile | null>(null);
  const [editDocOpFee, setEditDocOpFee] = useState<number>(100);
  const [editDocTeleFee, setEditDocTeleFee] = useState<number>(200);
  const [editDocStatus, setEditDocStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'OFFLINE' | 'BLOCKED'>('ACTIVE');
  const [editDocFeatured, setEditDocFeatured] = useState<boolean>(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Medicine');
  const [newDocHospitalId, setNewDocHospitalId] = useState(hospitals[0]?.id || 'hosp-1');
  const [newDocRegNumber, setNewDocRegNumber] = useState('TMC-');
  const [newDocSource, setNewDocSource] = useState('Apex Health District Franchise');

  const filteredDoctors = useMemo(() => {
    return localDoctors.filter(doc => {
      const matchSearch = doctorSearch === '' || 
        doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        doc.hospitalName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        (doc.registrationNumber && doc.registrationNumber.toLowerCase().includes(doctorSearch.toLowerCase()));

      const matchDistrict = doctorDistrictFilter === 'ALL' || 
        (doctorDistrictFilter === 'COIMBATORE' && (doc.hospitalName.includes('City Care') || doc.hospitalName.includes('Kovai'))) ||
        (doctorDistrictFilter === 'HYDERABAD' && doc.hospitalName.includes('Apollo'));

      const matchSpecialty = doctorSpecialtyFilter === 'ALL' || doc.specialty === doctorSpecialtyFilter;

      const matchStatus = doctorStatusFilter === 'ALL' || 
        (doctorStatusFilter === 'FEATURED' && doc.featured) ||
        (doctorStatusFilter === 'ACTIVE' && doc.status === 'ACTIVE') ||
        (doctorStatusFilter === 'BLOCKED' && doc.status === 'BLOCKED') ||
        (doctorStatusFilter === 'ON_LEAVE' && doc.status === 'ON_LEAVE');

      return matchSearch && matchDistrict && matchSpecialty && matchStatus;
    });
  }, [localDoctors, doctorSearch, doctorDistrictFilter, doctorSpecialtyFilter, doctorStatusFilter]);

  const handleToggleDoctorFeatured = async (doc: DoctorProfile) => {
    const updatedFeatured = !doc.featured;
    setLocalDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, featured: updatedFeatured } : d));
    try {
      await onUpdateDoctor(doc.id, { featured: updatedFeatured });
    } catch (e) {}
  };

  const handleToggleDoctorBlock = async (doc: DoctorProfile) => {
    const nextStatus = doc.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    setLocalDoctors(prev => prev.map(d => d.id === doc.id ? { ...d, status: nextStatus } : d));
    try {
      await onUpdateDoctor(doc.id, { status: nextStatus });
    } catch (e) {}
  };

  const handleSaveDoctorDetails = async () => {
    if (!editingDoc) return;
    setLocalDoctors(prev => prev.map(d => d.id === editingDoc.id ? {
      ...d,
      opConsultationFee: editDocOpFee,
      teleConsultationFee: editDocTeleFee,
      status: editDocStatus,
      featured: editDocFeatured
    } : d));

    try {
      await onUpdateDoctor(editingDoc.id, {
        opConsultationFee: editDocOpFee,
        teleConsultationFee: editDocTeleFee,
        status: editDocStatus,
        featured: editDocFeatured
      });
    } catch (e) {}
    setEditingDoc(null);
  };

  const handleCreateDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    try {
      const hosp = hospitals.find(h => h.id === newDocHospitalId);
      const newDocObj = {
        name: newDocName,
        specialty: newDocSpecialty,
        hospitalId: newDocHospitalId,
        hospitalName: hosp?.name || 'City Care Multi-Specialty Hospital',
        opConsultationFee: 100,
        teleConsultationFee: 200,
        experienceYears: 8,
        status: 'ACTIVE' as const,
        registrationNumber: newDocRegNumber,
        onboardingSource: newDocSource,
        franchiseName: newDocSource,
        featured: false,
        isAccountVerified: true
      };

      await onAddDoctor(newDocObj);
      setLocalDoctors(prev => [...prev, {
        id: `doc-${Date.now()}`,
        userId: `user-doc-${Date.now()}`,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        rating: 4.8,
        totalConsultations: 0,
        ...newDocObj
      }]);
      setShowAddDoctorModal(false);
      setNewDocName('');
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to add doctor');
    }
  };

  // ==============================================================
  // 3. HOSPITAL DIRECTORY SEARCH & FILTERS
  // ==============================================================
  const [hospSearch, setHospSearch] = useState('');
  const [hospDistrictFilter, setHospDistrictFilter] = useState('ALL');
  const [hospEmergencyFilter, setHospEmergencyFilter] = useState('ALL');

  const [editingHosp, setEditingHosp] = useState<Hospital | null>(null);
  const [editHospBaseFee, setEditHospBaseFee] = useState<number>(100);
  const [editHospEmergency, setEditHospEmergency] = useState<boolean>(true);
  const [editHospFeatured, setEditHospFeatured] = useState<boolean>(false);
  const [showAddHospModal, setShowAddHospModal] = useState(false);
  const [newHospName, setNewHospName] = useState('');
  const [newHospDistrict, setNewHospDistrict] = useState('Coimbatore Central');
  const [newHospAddress, setNewHospAddress] = useState('');
  const [newHospSource, setNewHospSource] = useState('Apex Health District Franchise');

  const filteredHospitals = useMemo(() => {
    return localHospitals.filter(hosp => {
      const matchSearch = hospSearch === '' ||
        hosp.name.toLowerCase().includes(hospSearch.toLowerCase()) ||
        hosp.address.toLowerCase().includes(hospSearch.toLowerCase()) ||
        hosp.districtName.toLowerCase().includes(hospSearch.toLowerCase());

      const matchDistrict = hospDistrictFilter === 'ALL' ||
        (hospDistrictFilter === 'COIMBATORE' && hosp.districtName.toLowerCase().includes('coimbatore')) ||
        (hospDistrictFilter === 'HYDERABAD' && hosp.districtName.toLowerCase().includes('hyderabad'));

      const matchEmergency = hospEmergencyFilter === 'ALL' ||
        (hospEmergencyFilter === 'EMERGENCY_ONLY' && hosp.emergencyAvailable) ||
        (hospEmergencyFilter === 'FEATURED' && hosp.featured);

      return matchSearch && matchDistrict && matchEmergency;
    });
  }, [localHospitals, hospSearch, hospDistrictFilter, hospEmergencyFilter]);

  const handleToggleHospFeatured = async (hosp: Hospital) => {
    const nextFeatured = !hosp.featured;
    setLocalHospitals(prev => prev.map(h => h.id === hosp.id ? { ...h, featured: nextFeatured } : h));
    try {
      await onUpdateHospital(hosp.id, { featured: nextFeatured });
    } catch (e) {}
  };

  const handleToggleHospEmergency = async (hosp: Hospital) => {
    const nextEmergency = !hosp.emergencyAvailable;
    setLocalHospitals(prev => prev.map(h => h.id === hosp.id ? { ...h, emergencyAvailable: nextEmergency } : h));
    try {
      await onUpdateHospital(hosp.id, { emergencyAvailable: nextEmergency });
    } catch (e) {}
  };

  const handleToggleHospBlock = async (hosp: Hospital) => {
    const nextStatus = hosp.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    setLocalHospitals(prev => prev.map(h => h.id === hosp.id ? { ...h, status: nextStatus } : h));
    try {
      await onUpdateHospital(hosp.id, { status: nextStatus });
    } catch (e) {}
  };

  const handleSaveHospDetails = async () => {
    if (!editingHosp) return;
    setLocalHospitals(prev => prev.map(h => h.id === editingHosp.id ? {
      ...h,
      baseOpFee: editHospBaseFee,
      emergencyAvailable: editHospEmergency,
      featured: editHospFeatured
    } : h));

    try {
      await onUpdateHospital(editingHosp.id, {
        baseOpFee: editHospBaseFee,
        emergencyAvailable: editHospEmergency,
        featured: editHospFeatured
      });
    } catch (e) {}
    setEditingHosp(null);
  };

  const handleCreateHospitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName) return;
    try {
      const newHospObj = {
        name: newHospName,
        districtName: newHospDistrict,
        address: newHospAddress,
        baseOpFee: 100,
        emergencyAvailable: true,
        onboardingSource: newHospSource,
        status: 'ACTIVE' as const,
        featured: false,
        isAccountVerified: true
      };

      await onAddHospital(newHospObj);
      setLocalHospitals(prev => [...prev, {
        id: `hosp-${Date.now()}`,
        districtId: 'dist-coimbatore-central',
        rating: 4.8,
        specialties: ['General Medicine', 'Cardiology'],
        distance: '2.0 km',
        activeDoctorsCount: 2,
        imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
        ...newHospObj
      }]);
      setShowAddHospModal(false);
      setNewHospName('');
      setNewHospAddress('');
      confetti({ particleCount: 40, spread: 40, origin: { y: 0.6 } });
    } catch (err: any) {
      alert(err.message || 'Failed to add hospital');
    }
  };

  // ==============================================================
  // 4. ALL USERS & ACCOUNTS DIRECTORY
  // ==============================================================
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'DOCTORS' | 'NURSES' | 'FRANCHISES' | 'PATIENTS'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // ==============================================================
  // 5. PRICING ARCHITECTURE & REVENUE ENGINE
  // ==============================================================
  const [simulatedPatientFee, setSimulatedPatientFee] = useState<number>(100);
  const [activePresetTier, setActivePresetTier] = useState<string>('Standard General OPD');

  // Percentages & rules
  const [doctorPct, setDoctorPct] = useState<number>(70);
  const [platformPct, setPlatformPct] = useState<number>(15);
  const [franchisePct, setFranchisePct] = useState<number>(10);
  const [nurseReferralFlat, setNurseReferralFlat] = useState<number>(15);
  const [gstPct, setGstPct] = useState<number>(5);

  const [savingConfig, setSavingConfig] = useState(false);

  // Computed split for simulated fee
  const simDoctorCut = Math.round((simulatedPatientFee * doctorPct) / 100);
  const simPlatformCut = Math.round((simulatedPatientFee * platformPct) / 100);
  const simFranchiseCut = Math.round((simulatedPatientFee * franchisePct) / 100);
  const simGstCut = Math.round((simulatedPatientFee * gstPct) / 100);

  const handleApplyPreset = (name: string, base: number, docP: number, platP: number, franP: number) => {
    setActivePresetTier(name);
    setSimulatedPatientFee(base);
    setDoctorPct(docP);
    setPlatformPct(platP);
    setFranchisePct(franP);
  };

  const handlePublishPricing = async () => {
    setSavingConfig(true);
    try {
      await onUpdateSplitConfig({
        baseOpFee: simulatedPatientFee,
        doctorFee: simDoctorCut,
        nurseReferralCommission: nurseReferralFlat,
        franchiseShare: simFranchiseCut,
        platformShare: simPlatformCut,
        gstAmount: simGstCut
      });
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
      alert('Global Pricing Architecture & Commission Splits published to network!');
    } catch (err: any) {
      alert(err.message || 'Failed to update pricing');
    } finally {
      setSavingConfig(false);
    }
  };

  // ==============================================================
  // 6. GLOBAL CONTROLS & AUDIT TRAIL
  // ==============================================================
  const [videoEnabled, setVideoEnabled] = useState(platformSettings.videoConsultationsEnabled);
  const [inPersonEnabled, setInPersonEnabled] = useState(platformSettings.inPersonBookingEnabled);
  const [nurseBulkEnabled, setNurseBulkEnabled] = useState(platformSettings.nurseBulkReservationEnabled);
  const [franchiseCashEnabled, setFranchiseCashEnabled] = useState(platformSettings.franchiseCashDeskEnabled);
  const [bannerActive, setBannerActive] = useState(platformSettings.broadcastBanner.enabled);
  const [bannerText, setBannerText] = useState(platformSettings.broadcastBanner.text);
  const [emergencyPhone, setEmergencyPhone] = useState(platformSettings.emergencyNumber);
  const [savingSettings, setSavingSettings] = useState(false);

  const bookedSlots = slots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED');
  const totalVolume = bookedSlots.reduce((acc, s) => acc + s.feePaid, 0);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onUpdatePlatformSettings({
        videoConsultationsEnabled: videoEnabled,
        inPersonBookingEnabled: inPersonEnabled,
        nurseBulkReservationEnabled: nurseBulkEnabled,
        franchiseCashDeskEnabled: franchiseCashEnabled,
        emergencyNumber: emergencyPhone,
        broadcastBanner: {
          enabled: bannerActive,
          type: 'INFO',
          text: bannerText
        }
      });
      confetti({ particleCount: 40, spread: 35, origin: { y: 0.5 } });
      alert('Platform feature flags and live broadcast banner published!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-16 font-sans">

      {/* Top Super Admin Header */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              HQ
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight">
                  Platform Operations HQ
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[10px] font-semibold whitespace-nowrap shrink-0">
                  Live Master Desk
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-medium leading-snug">
                Governance • Verification • Directory • Dynamic Revenue Splits
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-zinc-400 font-semibold block uppercase tracking-wider">Gross Volume</span>
            <span className="font-bold text-zinc-950 text-base tabular-nums">
              <RollingCounter value={totalVolume} prefix="₹" height={22} />
            </span>
          </div>
        </div>

        {/* Clean Segmented Sub-Panel Navigation (No text clipping) */}
        <div className="pt-2 border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActivePanel('approvals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'approvals'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Requests</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-bold tabular-nums ${
                activePanel === 'approvals' ? 'bg-amber-400 text-zinc-950' : 'bg-amber-100 text-amber-900'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('doctors')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'doctors'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors ({localDoctors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('hospitals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'hospitals'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospitals ({localHospitals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'users'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Accounts</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'pricing'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pricing & Splits</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePanel('controls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              activePanel === 'controls'
                ? 'bg-zinc-950 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/80'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Controls & Audit</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* PANEL 1: PENDING ONBOARDING & VERIFICATION DESK               */}
        {/* ============================================================== */}
        {activePanel === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <h3 className="font-semibold text-sm text-zinc-950">Onboarding & Verification Desk</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Review credentials, set negotiated consultation fees, and approve or reject providers
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      requestFilter === 'ALL' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    All ({pendingRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter('DOCTOR')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      requestFilter === 'DOCTOR' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    Doctors ({pendingRequests.filter(r => r.type === 'DOCTOR').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestFilter('FACILITY')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      requestFilter === 'FACILITY' ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    Clinics ({pendingRequests.filter(r => r.type === 'FACILITY').length})
                  </button>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {pendingRequests
                  .filter(r => requestFilter === 'ALL' || r.type === requestFilter)
                  .map(req => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/60 hover:bg-zinc-50 transition-all space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-zinc-950 text-sm truncate">{req.name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700 font-semibold text-[10px]">
                              {req.type === 'DOCTOR' ? req.specialty : 'Clinic'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9.5px] ${
                              req.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : 'bg-rose-100 text-rose-900 border border-rose-200'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <p className="text-zinc-500 text-xs">
                            License / Reg: <span className="font-mono font-semibold text-zinc-800">{req.registrationNumber}</span> • {req.affiliation}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 pt-0.5">
                            <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="font-medium">Onboarded via:</span>
                            <span className="font-semibold text-zinc-900">{req.onboardingSource}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Proposed Fee</span>
                          <span className="text-sm font-bold text-zinc-950 tabular-nums">
                            ₹{req.proposedOpFee} <span className="text-[10px] text-zinc-500 font-normal">OPD</span>
                          </span>
                        </div>
                      </div>

                      {/* Documents Strip */}
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200/70 space-y-1 text-[11px]">
                        <span className="font-semibold text-zinc-700 block">Uploaded Statutory Documents:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {req.documents.map((doc, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium text-[10.5px] border border-zinc-200/60">
                              ✓ {doc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {req.status === 'PENDING' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleApproveRequest(req)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Activate</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingRequest(req);
                              setEditReqOpFee(req.proposedOpFee);
                              setEditReqTeleFee(req.proposedTeleFee || 200);
                            }}
                            className="py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Edit Terms</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRejectRequest(req.id)}
                            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 font-semibold text-xs transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* PANEL 2: DOCTORS DIRECTORY (List View with Filters & Fee Setup) */}
        {/* ============================================================== */}
        {activePanel === 'doctors' && (
          <motion.div
            key="doctors"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              {/* Header & Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-semibold text-sm text-zinc-950">Physician Directory & Fee Terms</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Admin sets approved consultation fees, reviews franchise referral sources, and toggles featured/active status
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold self-start sm:self-center transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Doctor</span>
                </button>
              </div>

              {/* Search & Location Filter Strip */}
              <div className="space-y-2 text-xs">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search doctor by name, registration #, specialty, or hospital..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white text-xs text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                  {doctorSearch && (
                    <button
                      type="button"
                      onClick={() => setDoctorSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns (Location wise, specialty, status) */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-0.5 uppercase">Location</label>
                    <select
                      value={doctorDistrictFilter}
                      onChange={(e) => setDoctorDistrictFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800"
                    >
                      <option value="ALL">All Districts</option>
                      <option value="COIMBATORE">Coimbatore</option>
                      <option value="HYDERABAD">Hyderabad</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-0.5 uppercase">Specialty</label>
                    <select
                      value={doctorSpecialtyFilter}
                      onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800"
                    >
                      <option value="ALL">All Specialties</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-0.5 uppercase">Status</label>
                    <select
                      value={doctorStatusFilter}
                      onChange={(e) => setDoctorStatusFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="FEATURED">Featured Only</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="ON_LEAVE">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spacious Full-Width Doctor List (NO cramped columns) */}
              <div className="space-y-3 pt-1">
                {filteredDoctors.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-xs">
                    <p className="font-semibold text-zinc-700">No doctors matching search criteria.</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Try clearing filters or search queries.</p>
                  </div>
                ) : (
                  filteredDoctors.map(doc => (
                    <div
                      key={doc.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 text-xs ${
                        doc.status === 'BLOCKED'
                          ? 'bg-rose-50/40 border-rose-200'
                          : doc.featured
                          ? 'bg-amber-50/30 border-amber-200 shadow-2xs'
                          : 'bg-zinc-50/60 border-zinc-200/80 hover:border-zinc-300'
                      }`}
                    >
                      {/* Top Row: Avatar, Name, Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                            {doc.name.replace('Dr. ', '').split(' ')[0][0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-zinc-950 truncate">{doc.name}</h4>
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/70 font-semibold text-[10px] whitespace-nowrap shrink-0">
                                {doc.specialty}
                              </span>
                              {doc.featured && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9.5px] flex items-center gap-1 whitespace-nowrap shrink-0">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>FEATURED</span>
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[9.5px] whitespace-nowrap shrink-0 ${
                                doc.status === 'BLOCKED'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : doc.status === 'ON_LEAVE'
                                  ? 'bg-zinc-200 text-zinc-700'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {doc.status || 'ACTIVE'}
                              </span>
                            </div>

                            <p className="text-zinc-500 text-xs mt-0.5 truncate">
                              {doc.hospitalName} • Reg #{doc.registrationNumber || 'TMC-77492'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-zinc-900 text-xs">★ {doc.rating || 4.9}</span>
                          <span className="text-[10px] text-zinc-400 block">{doc.experienceYears} Yrs Exp</span>
                        </div>
                      </div>

                      {/* Middle Strip: Franchise Source Attribution & Referral */}
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px]">
                        <div className="flex items-start sm:items-center gap-1.5 min-w-0">
                          <HeartHandshake className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-zinc-500 font-medium shrink-0">Brought by:</span>
                          <span className="font-semibold text-zinc-900 break-words">
                            {doc.onboardingSource || 'Apex Health District Franchise (Coimbatore South)'}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 self-start sm:self-auto">
                          10% Franchise Cut
                        </span>
                      </div>

                      {/* Fee Structure (Set by Admin) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-zinc-200/60 text-xs">
                        <div className="p-2 rounded-xl bg-white border border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400 block font-medium">In-Person OPD</span>
                          <span className="font-bold text-zinc-950 tabular-nums">₹{doc.opConsultationFee}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400 block font-medium">Video Consult</span>
                          <span className="font-bold text-zinc-950 tabular-nums">₹{doc.teleConsultationFee}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400 block font-medium">Doctor Share</span>
                          <span className="font-bold text-emerald-700 tabular-nums">75% (₹{Math.round(doc.opConsultationFee * 0.75)})</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-zinc-200/60">
                          <span className="text-[10px] text-zinc-400 block font-medium">Platform Margin</span>
                          <span className="font-bold text-zinc-950 tabular-nums">15% (₹{Math.round(doc.opConsultationFee * 0.15)})</span>
                        </div>
                      </div>

                      {/* Action Bar (Marketing / Featured, Block / Unblock, Edit Fees) */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDoctorFeatured(doc)}
                          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            doc.featured
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${doc.featured ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
                          <span>{doc.featured ? 'Featured on App' : 'Promote / Feature'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoc(doc);
                            setEditDocOpFee(doc.opConsultationFee);
                            setEditDocTeleFee(doc.teleConsultationFee);
                            setEditDocStatus((doc.status as any) || 'ACTIVE');
                            setEditDocFeatured(!!doc.featured);
                          }}
                          className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Terms</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDoctorBlock(doc)}
                          className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                            doc.status === 'BLOCKED'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{doc.status === 'BLOCKED' ? 'Unblock' : 'Block'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* PANEL 3: HOSPITALS & CLINICS (List View with Controls)        */}
        {/* ============================================================== */}
        {activePanel === 'hospitals' && (
          <motion.div
            key="hospitals"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-zinc-950" />
                    <h3 className="font-semibold text-sm text-zinc-950">Hospital Facilities & Clinical Centers</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Manage facility charges, emergency trauma status, sponsored boost, and active licensing
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddHospModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold self-start sm:self-center transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Facility</span>
                </button>
              </div>

              {/* Search & Filter Strip */}
              <div className="space-y-2 text-xs">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search hospital by name, district, or address..."
                    value={hospSearch}
                    onChange={(e) => setHospSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white text-xs text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-950"
                  />
                  {hospSearch && (
                    <button
                      type="button"
                      onClick={() => setHospSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-0.5 uppercase">District</label>
                    <select
                      value={hospDistrictFilter}
                      onChange={(e) => setHospDistrictFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800"
                    >
                      <option value="ALL">All Districts</option>
                      <option value="COIMBATORE">Coimbatore</option>
                      <option value="HYDERABAD">Hyderabad</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-zinc-400 block mb-0.5 uppercase">Facility Type</label>
                    <select
                      value={hospEmergencyFilter}
                      onChange={(e) => setHospEmergencyFilter(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800"
                    >
                      <option value="ALL">All Facilities</option>
                      <option value="EMERGENCY_ONLY">24/7 Trauma Centers</option>
                      <option value="FEATURED">Featured Facilities</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Spacious Hospital List (NO squeezed 3-column carousel) */}
              <div className="space-y-4 pt-1">
                {filteredHospitals.map(hosp => (
                  <div
                    key={hosp.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3.5 text-xs ${
                      hosp.status === 'BLOCKED'
                        ? 'bg-rose-50/40 border-rose-200'
                        : hosp.featured
                        ? 'bg-amber-50/30 border-amber-200 shadow-2xs'
                        : 'bg-zinc-50/60 border-zinc-200/80 hover:border-zinc-300'
                    }`}
                  >
                    {/* Landscape Banner Image with Overlaid Badges */}
                    <div className="h-36 sm:h-44 rounded-2xl overflow-hidden bg-zinc-200 relative border border-zinc-200/70">
                      <img 
                        src={hosp.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'} 
                        alt={hosp.name} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                        {hosp.emergencyAvailable ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs whitespace-nowrap">
                            24/7 Trauma Ready
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-zinc-800/80 text-white text-[10px] font-medium backdrop-blur-xs whitespace-nowrap">
                            OPD Hours Only
                          </span>
                        )}

                        {hosp.featured && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-bold shadow-xs flex items-center gap-1 whitespace-nowrap">
                            <Star className="w-3 h-3 fill-zinc-950 text-zinc-950" />
                            <span>FEATURED CLINIC</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <h4 className="font-bold text-sm drop-shadow-sm truncate">{hosp.name}</h4>
                        <p className="text-[11px] text-white/90 drop-shadow-sm truncate">{hosp.address}</p>
                      </div>
                    </div>

                    {/* Facility Info Strip */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-zinc-600">
                      <div className="p-2 rounded-xl bg-white border border-zinc-200/70">
                        <span className="text-zinc-400 block text-[10px]">On-Duty Doctors</span>
                        <span className="font-bold text-zinc-950">{hosp.activeDoctorsCount || 4} Physicians</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-zinc-200/70">
                        <span className="text-zinc-400 block text-[10px]">Base OPD Fee</span>
                        <span className="font-bold text-zinc-950 tabular-nums">₹{hosp.baseOpFee}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-zinc-200/70">
                        <span className="text-zinc-400 block text-[10px]">Affiliated Franchise</span>
                        <span className="font-bold text-indigo-700 truncate block">Apex Health</span>
                      </div>
                    </div>

                    {/* Actions Strip */}
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60">
                      <button
                        type="button"
                        onClick={() => handleToggleHospFeatured(hosp)}
                        className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          hosp.featured
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                            : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${hosp.featured ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'}`} />
                        <span>{hosp.featured ? 'Sponsored' : 'Feature Clinic'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleHospEmergency(hosp)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          hosp.emergencyAvailable
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {hosp.emergencyAvailable ? 'Emergency Active' : 'Enable 24/7'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingHosp(hosp);
                          setEditHospBaseFee(hosp.baseOpFee);
                          setEditHospEmergency(hosp.emergencyAvailable ?? true);
                          setEditHospFeatured(!!hosp.featured);
                        }}
                        className="py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleHospBlock(hosp)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          hosp.status === 'BLOCKED'
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-zinc-100 hover:bg-rose-50 text-zinc-600 hover:text-rose-700'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* PANEL 4: ALL NETWORK ACCOUNTS (Doctors, Nurses, Franchises)   */}
        {/* ============================================================== */}
        {activePanel === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-950" />
                    <h3 className="font-semibold text-sm text-zinc-950">Network Accounts & Role Governance</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Central directory of all Physicians, Community Nurses, District Franchises, and Patients
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs">
                  {(['ALL', 'DOCTORS', 'NURSES', 'FRANCHISES', 'PATIENTS'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        userRoleFilter === role ? 'bg-white text-zinc-950 shadow-2xs' : 'text-zinc-600'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accounts Feed */}
              <div className="space-y-3">
                {/* 1. Nurses */}
                {(userRoleFilter === 'ALL' || userRoleFilter === 'NURSES') && localNurses.map(nurse => (
                  <div key={nurse.id} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                          RN
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-950 text-xs">{nurse.name}</h4>
                            <span className="px-2 py-0.2 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[9.5px] font-bold">
                              COMMUNITY NURSE
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px]">Phone: {nurse.phone} • Code: {nurse.referralCode}</p>
                        </div>
                      </div>

                      <span className="font-bold text-emerald-700 tabular-nums">
                        ₹{nurse.walletBalance} Wallet
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">District Assignment:</span>
                        <span className="font-semibold text-zinc-900">{nurse.districtName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Total Patients Referred:</span>
                        <span className="font-semibold text-zinc-900">{nurse.totalReferrals} Patients</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 2. Franchises */}
                {(userRoleFilter === 'ALL' || userRoleFilter === 'FRANCHISES') && franchises.map(f => (
                  <div key={f.id} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          DF
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-950 text-xs">{f.agencyName}</h4>
                            <span className="px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[9.5px] font-bold">
                              DISTRICT FRANCHISE
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px]">Territory: {f.districtName} • Admin: {f.assignedAdminName}</p>
                        </div>
                      </div>

                      <span className="font-bold text-zinc-950 tabular-nums">
                        ₹{f.monthlyRevenue} / mo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Cash Reconciled:</span>
                        <span className="font-semibold text-emerald-700">₹{f.cashDepositedToday} Deposited</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Pending Ground Cash:</span>
                        <span className="font-semibold text-amber-700">₹{f.pendingReconciliation} Pending</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 3. Patients */}
                {(userRoleFilter === 'ALL' || userRoleFilter === 'PATIENTS') && patientProfile && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-bold flex items-center justify-center text-xs">
                          PT
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-950 text-xs">{patientProfile.name}</h4>
                            <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold">
                              VERIFIED PATIENT
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px]">Phone: {patientProfile.phone} • ABHA: {patientProfile.abhaId || '91-8842-1920-4491'}</p>
                        </div>
                      </div>

                      <span className="font-bold text-zinc-900 tabular-nums">
                        {patientProfile.city || 'Coimbatore'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Baseline Biometrics:</span>
                        <span className="font-semibold text-zinc-900">Height 175cm • Weight 72kg • Blood B+</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">ABDM Consent:</span>
                        <span className="font-semibold text-emerald-700">HIP / HIU Verified</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* PANEL 5: PRICING ARCHITECTURE & REVENUE ENGINE                */}
        {/* ============================================================== */}
        {activePanel === 'pricing' && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-zinc-950" />
                    <h3 className="font-semibold text-sm text-zinc-950">Pricing Architecture & Commission Matrix</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Configure standard platform commission models, consultation fee tiers, and test live payouts
                  </p>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold whitespace-nowrap self-start">
                  Active Framework
                </span>
              </div>

              {/* Consultation Tier Presets */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Standard Consultation Tiers</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Standard General OPD', fee: 100, doc: 70, plat: 15, fran: 10 },
                    { name: 'Specialist Clinic', fee: 250, doc: 72, plat: 16, fran: 10 },
                    { name: 'Super-Specialty', fee: 400, doc: 75, plat: 14, fran: 10 },
                    { name: 'Telehealth Video', fee: 250, doc: 74, plat: 16, fran: 10 }
                  ].map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset.name, preset.fee, preset.doc, preset.plat, preset.fran)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        activePresetTier === preset.name
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-900'
                      }`}
                    >
                      <span className={`text-[10px] block font-medium truncate ${activePresetTier === preset.name ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {preset.name}
                      </span>
                      <span className="text-base font-bold tabular-nums block mt-0.5">
                        ₹{preset.fee}
                      </span>
                      <span className={`text-[9.5px] block mt-1 ${activePresetTier === preset.name ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        Doctor gets {preset.doc}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Live Payout Simulator */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">Live Consultation Payout Simulator</span>
                    <span className="text-[11px] text-zinc-500">Test exact rupee splits for any patient fee</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-zinc-300">
                    <span className="text-xs font-semibold text-zinc-400">₹</span>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={simulatedPatientFee}
                      onChange={(e) => setSimulatedPatientFee(Number(e.target.value))}
                      className="w-16 font-bold text-xs text-zinc-950 bg-transparent focus:outline-none text-right tabular-nums"
                    />
                  </div>
                </div>

                {/* Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Physician ({doctorPct}%)</span>
                    <span className="text-base font-bold text-emerald-700 tabular-nums">₹{simDoctorCut}</span>
                    <span className="text-[9.5px] text-zinc-400 block">Direct Net Payout</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">B Care ({platformPct}%)</span>
                    <span className="text-base font-bold text-zinc-950 tabular-nums">₹{simPlatformCut}</span>
                    <span className="text-[9.5px] text-zinc-400 block">Gross Platform Cut</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Franchise ({franchisePct}%)</span>
                    <span className="text-base font-bold text-indigo-700 tabular-nums">₹{simFranchiseCut}</span>
                    <span className="text-[9.5px] text-zinc-400 block">Territory SLA Cut</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-0.5">
                    <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Nurse Incentive</span>
                    <span className="text-base font-bold text-teal-700 tabular-nums">₹{nurseReferralFlat}</span>
                    <span className="text-[9.5px] text-zinc-400 block">Flat Per Patient</span>
                  </div>
                </div>
              </div>

              {/* Publish Button */}
              <button
                type="button"
                disabled={savingConfig}
                onClick={handlePublishPricing}
                className="w-full py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingConfig ? 'Broadcasting Pricing Engine...' : 'Publish & Broadcast Pricing Architecture'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* PANEL 6: CONTROLS, DISPATCH AUDIT & STATUTORY GOVERNANCE     */}
        {/* ============================================================== */}
        {activePanel === 'controls' && (
          <motion.div
            key="controls"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-950">Platform Feature Flags & Broadcasts</h3>
                  <p className="text-xs text-zinc-500">
                    Instant toggles for telemedicine, OPD bookings, emergency triage, and network alerts
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                {/* Feature Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-950 text-xs block">Video Teleconsultations</span>
                      <span className="text-[11px] text-zinc-500">Live WebRTC consultations</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={videoEnabled}
                      onChange={(e) => setVideoEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-950 text-xs block">In-Person OPD Passes</span>
                      <span className="text-[11px] text-zinc-500">Physical queue token bookings</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={inPersonEnabled}
                      onChange={(e) => setInPersonEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-950 text-xs block">Nurse Bulk Reservations</span>
                      <span className="text-[11px] text-zinc-500">Community walk-in batch desk</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nurseBulkEnabled}
                      onChange={(e) => setNurseBulkEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-950 text-xs block">Franchise Cash Desk</span>
                      <span className="text-[11px] text-zinc-500">Ground counter cash deposits</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={franchiseCashEnabled}
                      onChange={(e) => setFranchiseCashEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Broadcast Banner */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-950 text-xs">Network Broadcast Announcement</span>
                    <input
                      type="checkbox"
                      checked={bannerActive}
                      onChange={(e) => setBannerActive(e.target.checked)}
                      className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="Broadcast message displayed across patient and provider dashboards..."
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white font-medium"
                  />
                </div>

                {/* Statutory Governance Cards */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-indigo-700" />
                      <span className="font-bold text-slate-900 text-xs">ABDM & DPDP Act 2023 Statutory Governance</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                      ACTIVE GOVERNANCE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setActiveComplianceModal('ABDM_SANDBOX')}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 space-y-0.5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 block font-medium">ABDM Gateway Sandbox:</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="font-bold text-emerald-700 block">M1, M2 & M3 CERTIFIED</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveComplianceModal('DPDP_AUDIT')}
                      className="text-left p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 space-y-0.5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 block font-medium">Grievance Redressal SLA:</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="font-bold text-slate-900 block">24h Ack / 15d Resolution</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? 'Publishing Updates...' : 'Publish Global Platform Controls'}</span>
                </button>
              </form>

              {/* Live Gateway Dispatch & WhatsApp Audit Stream */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-xs text-zinc-950">Live Gateway Dispatch & WhatsApp Audit Stream</h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Gupshup / Meta Cloud API Active
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    { id: 'd-1', type: 'OPD Token Pass', recipient: '+91 98421 *****', detail: 'Token #4 OPD Pass with QR Code dispatched to patient', time: '2 mins ago', status: 'DELIVERED' },
                    { id: 'd-2', type: 'Digital Rx Issued', recipient: '+91 98765 *****', detail: 'Signed Prescription #RX-9942 PDF link delivered with Class 3 DSC hash', time: '14 mins ago', status: 'READ' },
                    { id: 'd-3', type: 'Teleconsult Room', recipient: '+91 98421 *****', detail: 'Encrypted WebRTC Room meet.bcare.health/room/bc-vid-0401 dispatched', time: '32 mins ago', status: 'DELIVERED' },
                    { id: 'd-4', type: '108 Emergency Hook', recipient: 'State ERS Gateway', detail: 'Coimbatore District 108 Emergency trauma dispatch link active & healthy', time: 'Realtime', status: 'MONITORING' }
                  ].map(d => (
                    <div key={d.id} className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-xs">{d.type}</span>
                          <span className="text-zinc-400 font-mono text-[10.5px]">{d.recipient}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{d.detail}</p>
                        <span className="text-[10px] text-zinc-400 tabular-nums">{d.time}</span>
                      </div>

                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                        d.status === 'READ'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : d.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-200/70 text-zinc-700'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}

      {/* 1. Request Terms Negotiation Modal */}
      {editingRequest && (
        <PhoneModalPortal>
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setEditingRequest(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 text-zinc-900 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Negotiate Consultation Fees</h3>
                  <p className="text-[11px] text-zinc-400">{editingRequest.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRequest(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Approved In-Person OPD Fee (₹)</label>
                  <input
                    type="number"
                    value={editReqOpFee}
                    onChange={(e) => setEditReqOpFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Approved Video Teleconsult Fee (₹)</label>
                  <input
                    type="number"
                    value={editReqTeleFee}
                    onChange={(e) => setEditReqTeleFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Doctor Net Payout (75%):</span>
                    <span className="font-bold text-emerald-700">₹{Math.round(editReqOpFee * 0.75)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Franchise Cut (10%):</span>
                    <span className="font-semibold text-indigo-700">₹{Math.round(editReqOpFee * 0.10)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Service Fee (15%):</span>
                    <span className="font-bold text-zinc-950">₹{Math.round(editReqOpFee * 0.15)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingRequest(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveRequest(editingRequest, editReqOpFee, editReqTeleFee)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Approve with Terms
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* 2. Doctor Edit Terms Modal */}
      {editingDoc && (
        <PhoneModalPortal>
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setEditingDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 text-zinc-900 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Edit Physician Terms & Fees</h3>
                  <p className="text-[11px] text-zinc-400">{editingDoc.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">In-Person OPD (₹)</label>
                    <input
                      type="number"
                      value={editDocOpFee}
                      onChange={(e) => setEditDocOpFee(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Video Consult (₹)</label>
                    <input
                      type="number"
                      value={editDocTeleFee}
                      onChange={(e) => setEditDocTeleFee(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Practice Status</label>
                  <select
                    value={editDocStatus}
                    onChange={(e: any) => setEditDocStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-900"
                  >
                    <option value="ACTIVE">ACTIVE (Accepting Tokens)</option>
                    <option value="ON_LEAVE">ON_LEAVE (Temporarily Away)</option>
                    <option value="BLOCKED">BLOCKED (Suspended by Admin)</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-zinc-900 text-xs block">Featured on Patient App</span>
                    <span className="text-[10px] text-zinc-500">Sponsored boost on discovery</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editDocFeatured}
                    onChange={(e) => setEditDocFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDoctorDetails}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* 3. Hospital Edit Facility Modal */}
      {editingHosp && (
        <PhoneModalPortal>
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setEditingHosp(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-zinc-200 text-zinc-900 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-zinc-950">Edit Hospital Facility Details</h3>
                  <p className="text-[11px] text-zinc-400">{editingHosp.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingHosp(null)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Base OPD Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={editHospBaseFee}
                    onChange={(e) => setEditHospBaseFee(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-bold text-zinc-950"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-zinc-950 text-xs block">24/7 Emergency / Trauma Ready</span>
                    <span className="text-[10px] text-zinc-500">Connected to 108 ambulance triage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editHospEmergency}
                    onChange={(e) => setEditHospEmergency(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-zinc-950 text-xs block">Featured Sponsored Clinic</span>
                    <span className="text-[10px] text-zinc-500">Promoted on patient map search</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editHospFeatured}
                    onChange={(e) => setEditHospFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 accent-zinc-950 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingHosp(null)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveHospDetails}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* 4. Add Doctor Modal */}
      {showAddDoctorModal && (
        <PhoneModalPortal>
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setShowAddDoctorModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl border border-zinc-200 text-zinc-900 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="font-bold text-sm text-zinc-950">Add Doctor to Platform Network</h3>
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDoctorSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Doctor Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Kavitha Rajan, MD"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Specialty</label>
                    <select
                      value={newDocSpecialty}
                      onChange={(e) => setNewDocSpecialty(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-900"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Medical Reg #</label>
                    <input
                      type="text"
                      required
                      placeholder="TMC-77492"
                      value={newDocRegNumber}
                      onChange={(e) => setNewDocRegNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Hospital Center</label>
                  <select
                    value={newDocHospitalId}
                    onChange={(e) => setNewDocHospitalId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-900"
                  >
                    {localHospitals.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Onboarding Franchise Source</label>
                  <input
                    type="text"
                    value={newDocSource}
                    onChange={(e) => setNewDocSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-900"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddDoctorModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                  >
                    Register Doctor
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* 5. Add Hospital Modal */}
      {showAddHospModal && (
        <PhoneModalPortal>
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setShowAddHospModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl border border-zinc-200 text-zinc-900 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="font-bold text-sm text-zinc-950">Add Clinic / Hospital Center</h3>
                <button
                  type="button"
                  onClick={() => setShowAddHospModal(false)}
                  className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateHospitalSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Facility Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Telehealth Clinic"
                    value={newHospName}
                    onChange={(e) => setNewHospName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">District / Region</label>
                  <input
                    type="text"
                    required
                    value={newHospDistrict}
                    onChange={(e) => setNewHospDistrict(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 88 Cross Cut Road, Gandhipuram"
                    value={newHospAddress}
                    onChange={(e) => setNewHospAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Onboarding Franchise Source</label>
                  <input
                    type="text"
                    value={newHospSource}
                    onChange={(e) => setNewHospSource(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 font-medium text-zinc-900"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddHospModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold"
                  >
                    Register Facility
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* 6. Statutory Governance Modal */}
      {activeComplianceModal && (
        <PhoneModalPortal>
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs pointer-events-auto"
            onClick={() => setActiveComplianceModal(null)}
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
                    {activeComplianceModal === 'ABDM_SANDBOX' && 'ABDM Gateway Sandbox Certification'}
                    {activeComplianceModal === 'DPDP_AUDIT' && 'DPDP Act 2023 Statutory Audits & SLA'}
                    {activeComplianceModal === 'EMERGENCY_PROTOCOL' && '108 Emergency Casualty Protocols'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveComplianceModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {activeComplianceModal === 'ABDM_SANDBOX' && (
                  <>
                    <p>
                      <strong>Ayushman Bharat Digital Mission (ABDM) Sandbox:</strong>
                    </p>
                    <p>
                      The B Care core architecture is certified across Milestone 1, 2, and 3 by the National Health Authority (NHA):
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>M1 (ABHA Creation):</strong> 14-digit Ayushman Bharat Health Account generation with Aadhaar OTP and demographic deduplication.</li>
                      <li><strong>M2 (Health Facility & Professional Registry):</strong> HFR and HPR gateway integration verifying hospital licenses and doctor registrations.</li>
                      <li><strong>M3 (Health Information Exchange):</strong> HIP/HIU consent manager interoperability for FHIR/JSON diagnostic bundles.</li>
                    </ul>
                  </>
                )}

                {activeComplianceModal === 'DPDP_AUDIT' && (
                  <>
                    <p>
                      <strong>Digital Personal Data Protection Act, 2023 Governance:</strong>
                    </p>
                    <p>
                      The Super Admin Portal enforces mandatory compliance standards across all participating district franchises:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Data Protection Officer (DPO):</strong> Statutory grievance escalation officer appointed with 24-hour acknowledgement SLA.</li>
                      <li><strong>Breach Notification Protocol:</strong> Automated notification hook to the Data Protection Board of India (DPBI) within 72 hours of any security event.</li>
                      <li><strong>Log Anonymization:</strong> Audit trails store cryptographically salted phone identifiers to protect patient anonymity.</li>
                    </ul>
                  </>
                )}

                {activeComplianceModal === 'EMERGENCY_PROTOCOL' && (
                  <>
                    <p>
                      <strong>Tamil Nadu Emergency Response Service (108):</strong>
                    </p>
                    <p>
                      Platform-wide emergency casualty triage connects directly to the state ambulance dispatch network and trauma casualty reception units.
                    </p>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveComplianceModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close Statutory Panel
              </button>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

    </div>
  );
};

export default AdminPortal;
