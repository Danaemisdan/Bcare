import React, { useState } from 'react';
import { 
  RevenueSplitConfig, 
  OpSlot, 
  Hospital, 
  FranchiseTerritory,
  DoctorProfile,
  PlatformSettings
} from '../types';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
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
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPortalProps {
  splitConfig: RevenueSplitConfig;
  slots: OpSlot[];
  hospitals: Hospital[];
  franchises: FranchiseTerritory[];
  doctors: DoctorProfile[];
  platformSettings: PlatformSettings;
  isMobile?: boolean;
  onUpdateSplitConfig: (newConfig: Partial<RevenueSplitConfig>) => Promise<any>;
  onUpdateDoctor: (docId: string, updates: Partial<DoctorProfile>) => Promise<any>;
  onAddDoctor: (docData: any) => Promise<any>;
  onUpdateHospital: (hospId: string, updates: Partial<Hospital>) => Promise<any>;
  onAddHospital: (hospData: any) => Promise<any>;
  onUpdatePlatformSettings: (newSettings: Partial<PlatformSettings>) => Promise<any>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  splitConfig,
  slots,
  hospitals,
  franchises,
  doctors,
  platformSettings,
  isMobile = false,
  onUpdateSplitConfig,
  onUpdateDoctor,
  onAddDoctor,
  onUpdateHospital,
  onAddHospital,
  onUpdatePlatformSettings
}) => {
  // Active Admin Sub-panel Tab
  const [activePanel, setActivePanel] = useState<'pricing' | 'doctors' | 'hospitals' | 'controls' | 'ledger'>('pricing');

  // Revenue Split State
  const [baseFee, setBaseFee] = useState<number>(splitConfig.baseOpFee);
  const [docFee, setDocFee] = useState<number>(splitConfig.doctorFee);
  const [nurseCut, setNurseCut] = useState<number>(splitConfig.nurseReferralCommission);
  const [franchiseCut, setFranchiseCut] = useState<number>(splitConfig.franchiseShare);
  const [platformCut, setPlatformCut] = useState<number>(splitConfig.platformShare);
  const [gstFee, setGstFee] = useState<number>(splitConfig.gstAmount);
  const [savingConfig, setSavingConfig] = useState(false);

  // Platform Controls State
  const [videoEnabled, setVideoEnabled] = useState(platformSettings.videoConsultationsEnabled);
  const [inPersonEnabled, setInPersonEnabled] = useState(platformSettings.inPersonBookingEnabled);
  const [nurseBulkEnabled, setNurseBulkEnabled] = useState(platformSettings.nurseBulkReservationEnabled);
  const [franchiseCashEnabled, setFranchiseCashEnabled] = useState(platformSettings.franchiseCashDeskEnabled);
  const [bannerActive, setBannerActive] = useState(platformSettings.broadcastBanner.enabled);
  const [bannerText, setBannerText] = useState(platformSettings.broadcastBanner.text);
  const [emergencyPhone, setEmergencyPhone] = useState(platformSettings.emergencyNumber);
  const [savingSettings, setSavingSettings] = useState(false);

  // Doctor Edit Modal / Inline State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocOpFee, setEditDocOpFee] = useState<number>(100);
  const [editDocTeleFee, setEditDocTeleFee] = useState<number>(200);
  const [editDocStatus, setEditDocStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'OFFLINE'>('ACTIVE');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Medicine');
  const [newDocHospitalId, setNewDocHospitalId] = useState(hospitals[0]?.id || 'hosp-1');

  // Hospital Edit State
  const [editingHospId, setEditingHospId] = useState<string | null>(null);
  const [editHospBaseFee, setEditHospBaseFee] = useState<number>(100);
  const [editHospEmergency, setEditHospEmergency] = useState<boolean>(true);
  const [showAddHospModal, setShowAddHospModal] = useState(false);
  const [newHospName, setNewHospName] = useState('');
  const [newHospDistrict, setNewHospDistrict] = useState('Coimbatore Central');
  const [newHospAddress, setNewHospAddress] = useState('');

  const calculatedSum = docFee + nurseCut + franchiseCut + platformCut + gstFee;
  const isBalanced = calculatedSum === baseFee;

  const bookedSlots = slots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED');
  const totalVolume = bookedSlots.reduce((acc, s) => acc + s.feePaid, 0);
  const totalDoctorPayout = bookedSlots.reduce((acc, s) => acc + s.feeSplit.doctor, 0);
  const totalNurseCommission = bookedSlots.reduce((acc, s) => acc + s.feeSplit.nurse, 0);
  const totalFranchiseShare = bookedSlots.reduce((acc, s) => acc + s.feeSplit.franchise, 0);
  const totalPlatformGross = bookedSlots.reduce((acc, s) => acc + s.feeSplit.platform, 0);
  const totalGst = bookedSlots.reduce((acc, s) => acc + s.feeSplit.gst, 0);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await onUpdateSplitConfig({
        baseOpFee: baseFee,
        doctorFee: docFee,
        nurseReferralCommission: nurseCut,
        franchiseShare: franchiseCut,
        platformShare: platformCut,
        gstAmount: gstFee
      });
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.6 } });
      alert('Revenue split dynamically updated across all district clusters!');
    } catch (err: any) {
      alert(err.message || 'Failed to update configuration');
    } finally {
      setSavingConfig(false);
    }
  };

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

  const handleSaveDoctor = async (docId: string) => {
    try {
      await onUpdateDoctor(docId, {
        opConsultationFee: editDocOpFee,
        teleConsultationFee: editDocTeleFee,
        status: editDocStatus
      });
      setEditingDocId(null);
      alert('Doctor consultation fee and availability status updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update doctor');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    try {
      const hosp = hospitals.find(h => h.id === newDocHospitalId);
      await onAddDoctor({
        name: newDocName,
        specialty: newDocSpecialty,
        hospitalId: newDocHospitalId,
        hospitalName: hosp?.name || 'City Care Multi-Specialty Hospital',
        opConsultationFee: 100,
        teleConsultationFee: 200,
        experienceYears: 7,
        status: 'ACTIVE'
      });
      setShowAddDoctorModal(false);
      setNewDocName('');
      alert('New doctor added to network directory!');
    } catch (err: any) {
      alert(err.message || 'Failed to add doctor');
    }
  };

  const handleSaveHospital = async (hospId: string) => {
    try {
      await onUpdateHospital(hospId, {
        baseOpFee: editHospBaseFee,
        emergencyAvailable: editHospEmergency
      });
      setEditingHospId(null);
      alert('Hospital facilities and OPD fee updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to update hospital');
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospName) return;
    try {
      await onAddHospital({
        name: newHospName,
        districtName: newHospDistrict,
        address: newHospAddress || 'Main Road, Coimbatore',
        baseOpFee: 100,
        emergencyAvailable: true
      });
      setShowAddHospModal(false);
      setNewHospName('');
      setNewHospAddress('');
      alert('New clinic/hospital facility registered!');
    } catch (err: any) {
      alert(err.message || 'Failed to add hospital');
    }
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Admin Suite Header */}
      <div className={`bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs flex ${isMobile ? 'flex-col gap-3' : 'flex-col md:flex-row md:items-center justify-between gap-4'}`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Super Admin Orchestration Desk
            </span>
          </div>
          <h1 className="text-lg font-bold text-zinc-950 tracking-tight">System Control & Multi-Panel Manager</h1>
          <p className="text-xs text-zinc-500">
            Full governance across Doctors, Clinics, Feature Flags, Financial Splits & Live Broadcasts
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-zinc-100 bg-zinc-50/80 rounded-2xl border border-zinc-200/60 p-2 sm:p-2.5 w-full sm:w-auto">
          <div className="px-3 text-center sm:text-left">
            <span className="text-[11px] text-zinc-500 font-medium block">Platform Cut</span>
            <span className="font-semibold text-emerald-700 text-sm sm:text-base tabular-nums flex items-center justify-center sm:justify-start">
              <RollingCounter value={totalPlatformGross} prefix="₹" height={20} />
            </span>
          </div>
          <div className="px-3 text-center sm:text-left">
            <span className="text-[11px] text-zinc-500 font-medium block">Network Doctors</span>
            <span className="font-semibold text-zinc-900 text-sm sm:text-base tabular-nums flex items-center justify-center sm:justify-start">
              <RollingCounter value={doctors.length} suffix=" Active" height={20} />
            </span>
          </div>
        </div>
      </div>

      {/* Admin Panel Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActivePanel('pricing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activePanel === 'pricing'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 hover:bg-zinc-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Revenue Split & Pricing</span>
        </button>

        <button
          onClick={() => setActivePanel('doctors')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activePanel === 'doctors'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 hover:bg-zinc-50'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Directory & Fees ({doctors.length})</span>
        </button>

        <button
          onClick={() => setActivePanel('hospitals')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activePanel === 'hospitals'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 hover:bg-zinc-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hospitals & Clinics ({hospitals.length})</span>
        </button>

        <button
          onClick={() => setActivePanel('controls')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activePanel === 'controls'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 hover:bg-zinc-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Platform Flags & Broadcast</span>
        </button>

        <button
          onClick={() => setActivePanel('ledger')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activePanel === 'ledger'
              ? 'bg-zinc-950 text-white shadow-xs'
              : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200/80 hover:bg-zinc-50'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Audit Ledger ({bookedSlots.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PANEL 1: REVENUE SPLIT & PRICING */}
      {/* ============================================================== */}
      {activePanel === 'pricing' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-100">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Dynamic OP Consultation Split Engine</h3>
              <p className="text-xs text-zinc-500">
                Set component allocations per ₹100 base fee in real-time
              </p>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium self-start sm:self-center tabular-nums ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' 
                : 'bg-rose-50 text-rose-700 border border-rose-200/70'
            }`}>
              {isBalanced ? `Balanced (₹${calculatedSum})` : `Mismatch: ₹${calculatedSum} ≠ ₹${baseFee}`}
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            {/* Base Fee */}
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-900 text-xs">Patient Base Fee</span>
                <p className="text-xs text-zinc-500">Total charged to patient</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 font-medium">₹</span>
                <input
                  type="number"
                  value={baseFee}
                  onChange={(e) => setBaseFee(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded-lg border border-zinc-300 font-semibold text-right tabular-nums bg-white"
                />
              </div>
            </div>

            {/* Component Sliders */}
            <div className="space-y-3 pt-1">
              {/* Doctor Fee Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-700">Doctor Consultation Share</span>
                  <span className="text-zinc-950 font-semibold flex items-center">
                    <RollingCounter value={docFee} prefix="₹" height={16} />
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={docFee}
                  onChange={(e) => setDocFee(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                />
              </div>

              {/* Nurse Commission Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-700">Nurse Referral Commission</span>
                  <span className="text-zinc-950 font-semibold flex items-center">
                    <RollingCounter value={nurseCut} prefix="₹" height={16} />
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={nurseCut}
                  onChange={(e) => setNurseCut(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                />
              </div>

              {/* Franchise Share Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-700">Franchise Territory Share</span>
                  <span className="text-zinc-950 font-semibold flex items-center">
                    <RollingCounter value={franchiseCut} prefix="₹" height={16} />
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={franchiseCut}
                  onChange={(e) => setFranchiseCut(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-950"
                />
              </div>

              {/* Platform Share Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-700">B care Platform Gross</span>
                  <span className="text-emerald-700 font-semibold flex items-center">
                    <RollingCounter value={platformCut} prefix="₹" height={16} />
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={platformCut}
                  onChange={(e) => setPlatformCut(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* GST Amount Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-700">Statutory GST (5%)</span>
                  <span className="text-zinc-500 font-semibold flex items-center">
                    <RollingCounter value={gstFee} prefix="₹" height={16} />
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={gstFee}
                  onChange={(e) => setGstFee(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isBalanced || savingConfig}
              className={`w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                isBalanced
                  ? 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingConfig ? 'Saving Configurations...' : 'Broadcast Revenue Split to Network'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANEL 2: DOCTOR DIRECTORY & FEES */}
      {/* ============================================================== */}
      {activePanel === 'doctors' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-100">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Doctor Directory & Consultation Fees</h3>
              <p className="text-xs text-zinc-500">
                Adjust individual OPD visit fees, video consultation fees, and doctor active status
              </p>
            </div>

            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold self-start sm:self-center transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Doctor</span>
            </button>
          </div>

          {/* Doctors List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {doctors.map(doc => {
              const isEditing = editingDocId === doc.id;

              return (
                <div key={doc.id} className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {doc.name.replace('Dr. ', '').split(' ')[0][0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-zinc-950">{doc.name}</h4>
                        <p className="text-[11px] text-zinc-500">{doc.specialty} • {doc.hospitalName}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      doc.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                        : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                    }`}>
                      {doc.status || 'ACTIVE'}
                    </span>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-2 pt-1 border-t border-zinc-200/60 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">In-Person OPD Fee:</span>
                        <span className="font-semibold text-zinc-950 tabular-nums">₹{doc.opConsultationFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Video Teleconsult Fee:</span>
                        <span className="font-semibold text-zinc-950 tabular-nums">₹{doc.teleConsultationFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Experience:</span>
                        <span className="text-zinc-800 font-medium">{doc.experienceYears} Years</span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDocId(doc.id);
                          setEditDocOpFee(doc.opConsultationFee);
                          setEditDocTeleFee(doc.teleConsultationFee);
                          setEditDocStatus(doc.status || 'ACTIVE');
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-zinc-500" />
                        <span>Edit Fees & Status</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-zinc-200/60 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-zinc-500 font-medium block mb-1">OPD Fee (₹)</label>
                          <input
                            type="number"
                            value={editDocOpFee}
                            onChange={(e) => setEditDocOpFee(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 font-semibold text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-500 font-medium block mb-1">Video Fee (₹)</label>
                          <input
                            type="number"
                            value={editDocTeleFee}
                            onChange={(e) => setEditDocTeleFee(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 font-semibold text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-500 font-medium block mb-1">Status</label>
                        <select
                          value={editDocStatus}
                          onChange={(e: any) => setEditDocStatus(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 font-medium text-xs bg-white"
                        >
                          <option value="ACTIVE">ACTIVE (Accepting Bookings)</option>
                          <option value="ON_LEAVE">ON_LEAVE (Temporarily Offline)</option>
                          <option value="OFFLINE">OFFLINE</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDocId(null)}
                          className="flex-1 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveDoctor(doc.id)}
                          className="flex-1 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANEL 3: HOSPITALS & CLINICS */}
      {/* ============================================================== */}
      {activePanel === 'hospitals' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-100">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Hospital & Clinic Facilities</h3>
              <p className="text-xs text-zinc-500">
                Manage base outpatient charges, emergency trauma availability, and affiliated districts
              </p>
            </div>

            <button
              onClick={() => setShowAddHospModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold self-start sm:self-center transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Facility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {hospitals.map(hosp => {
              const isEditing = editingHospId === hosp.id;

              return (
                <div key={hosp.id} className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
                  <div className="h-28 rounded-xl overflow-hidden bg-zinc-200 relative">
                    <img src={hosp.imageUrl} alt={hosp.name} className="w-full h-full object-cover" />
                    {hosp.emergencyAvailable && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
                        24/7 Trauma
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-zinc-950 line-clamp-1">{hosp.name}</h4>
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{hosp.address}</p>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-2 pt-1 border-t border-zinc-200/60 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Base OPD Fee:</span>
                        <span className="font-semibold text-zinc-950 tabular-nums">₹{hosp.baseOpFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Emergency Unit:</span>
                        <span className={`font-semibold text-[11px] ${hosp.emergencyAvailable ? 'text-emerald-700' : 'text-zinc-500'}`}>
                          {hosp.emergencyAvailable ? 'Active (24x7)' : 'OPD Hours Only'}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setEditingHospId(hosp.id);
                          setEditHospBaseFee(hosp.baseOpFee);
                          setEditHospEmergency(hosp.emergencyAvailable ?? true);
                        }}
                        className="w-full mt-2 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200/80 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-zinc-500" />
                        <span>Edit Facility Details</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-zinc-200/60 text-xs">
                      <div>
                        <label className="text-[11px] text-zinc-500 font-medium block mb-1">Base OPD Fee (₹)</label>
                        <input
                          type="number"
                          value={editHospBaseFee}
                          onChange={(e) => setEditHospBaseFee(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-300 font-semibold text-xs bg-white"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`emerg-${hosp.id}`}
                          checked={editHospEmergency}
                          onChange={(e) => setEditHospEmergency(e.target.checked)}
                          className="w-4 h-4 rounded text-zinc-900 accent-zinc-950"
                        />
                        <label htmlFor={`emerg-${hosp.id}`} className="text-xs text-zinc-700 font-medium">
                          24x7 Emergency / Trauma Ready
                        </label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingHospId(null)}
                          className="flex-1 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-xs transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveHospital(hosp.id)}
                          className="flex-1 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PANEL 4: PLATFORM FEATURE FLAGS & BROADCASTS */}
      {/* ============================================================== */}
      {activePanel === 'controls' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-5">
          <div className="pb-2.5 border-b border-zinc-100">
            <h3 className="font-semibold text-sm text-zinc-900">Platform Feature Flags & System Controls</h3>
            <p className="text-xs text-zinc-500">
              Toggle global capabilities in real-time and broadcast active health alerts to all user devices
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Video Consultation Toggle */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    videoEnabled ? 'bg-sky-100 text-sky-700' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-950 block">HD Video Consultations</span>
                    <span className="text-[11px] text-zinc-500">WebRTC Telehealth Engine</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    videoEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    videoEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* In-Person OPD Booking Toggle */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    inPersonEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-950 block">In-Person OPD Tokens</span>
                    <span className="text-[11px] text-zinc-500">Hospital queue dispatch</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInPersonEnabled(!inPersonEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    inPersonEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    inPersonEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Nurse Bulk Reservation Toggle */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    nurseBulkEnabled ? 'bg-purple-100 text-purple-700' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-950 block">Nurse Bulk Block Allocation</span>
                    <span className="text-[11px] text-zinc-500">Batch 11–15 block booking</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNurseBulkEnabled(!nurseBulkEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    nurseBulkEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    nurseBulkEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Franchise Ground Cash Toggle */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    franchiseCashEnabled ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-950 block">Franchise Cash Desk</span>
                    <span className="text-[11px] text-zinc-500">Physical OPD counter POS</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFranchiseCashEnabled(!franchiseCashEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    franchiseCashEnabled ? 'bg-emerald-600' : 'bg-zinc-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                    franchiseCashEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

            </div>

            {/* Broadcast Banner Composer */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs text-zinc-950">Global Patient Broadcast Ribbon</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-500">Visible to all patients</span>
                  <button
                    type="button"
                    onClick={() => setBannerActive(!bannerActive)}
                    className={`w-10 h-5 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      bannerActive ? 'bg-emerald-600' : 'bg-zinc-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                      bannerActive ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                placeholder="Type real-time announcement to display on all patient screens..."
                className="w-full text-xs p-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
              />
            </div>

            {/* Emergency SOS Helpline */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <div>
                  <span className="font-semibold text-zinc-950">Emergency SOS Dispatch Line</span>
                  <p className="text-[11px] text-zinc-500">Direct ambulance & trauma routing</p>
                </div>
              </div>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-48 px-3 py-1.5 rounded-xl border border-zinc-300 font-semibold text-xs bg-white text-right"
              />
            </div>

            {/* Statutory Legal & DPDP Act 2023 Platform Controls */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">ABDM & DPDP Act 2023 Statutory Governance</span>
                    <span className="text-[10.5px] text-slate-500">Ayushman Bharat Sandbox & National Medical Commission Compliance</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                  ACTIVE GOVERNANCE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 block font-medium">ABDM Gateway Sandbox:</span>
                  <span className="font-bold text-emerald-700">M1, M2 & M3 CERTIFIED</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-0.5">
                  <span className="text-slate-400 block font-medium">Grievance Redressal SLA:</span>
                  <span className="font-bold text-slate-900">24h Ack / 15d Resolution</span>
                </div>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* PANEL 5: AUDIT LEDGER & FINANCIAL TRANSPARENCY */}
      {/* ============================================================== */}
      {activePanel === 'ledger' && (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div>
              <h3 className="font-semibold text-sm text-zinc-900">Live Financial Ledger & Audit Trail</h3>
              <p className="text-xs text-zinc-500">
                Transparent revenue ledger calculated dynamically per token
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 font-medium block">Total OPD Volume</span>
              <span className="font-bold text-zinc-950 text-base tabular-nums flex items-center justify-end">
                <RollingCounter value={totalVolume} prefix="₹" height={22} />
              </span>
            </div>
          </div>

          {/* Breakdown summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 font-medium block">Doctor Pool</span>
              <span className="font-semibold text-zinc-900 text-xs tabular-nums flex items-center justify-center">
                <RollingCounter value={totalDoctorPayout} prefix="₹" height={16} />
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 font-medium block">Nurse Comm.</span>
              <span className="font-semibold text-zinc-900 text-xs tabular-nums flex items-center justify-center">
                <RollingCounter value={totalNurseCommission} prefix="₹" height={16} />
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 font-medium block">Franchise Cut</span>
              <span className="font-semibold text-zinc-900 text-xs tabular-nums flex items-center justify-center">
                <RollingCounter value={totalFranchiseShare} prefix="₹" height={16} />
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
              <span className="text-[11px] text-zinc-500 font-medium block">Platform</span>
              <span className="font-semibold text-emerald-700 text-xs tabular-nums flex items-center justify-center">
                <RollingCounter value={totalPlatformGross} prefix="₹" height={16} />
              </span>
            </div>
            <div className={`p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/60 ${isMobile ? 'col-span-2' : ''}`}>
              <span className="text-[11px] text-zinc-500 font-medium block">GST</span>
              <span className="font-semibold text-zinc-600 text-xs tabular-nums flex items-center justify-center">
                <RollingCounter value={totalGst} prefix="₹" height={16} />
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 text-xs">
                  <th className="py-2 font-medium">TOKEN</th>
                  <th className="py-2 font-medium">PATIENT</th>
                  <th className="py-2 font-medium">PHYSICIAN</th>
                  <th className="py-2 font-medium">DOC FEE</th>
                  <th className="py-2 font-medium">NURSE</th>
                  <th className="py-2 font-medium">FRANCHISE</th>
                  <th className="py-2 font-medium">PLATFORM</th>
                  <th className="py-2 font-medium">GST</th>
                  <th className="py-2 font-medium text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {bookedSlots.map(slot => (
                  <tr key={slot.id} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 font-semibold text-zinc-950 tabular-nums">#{slot.tokenNumber}</td>
                    <td className="py-2.5 font-medium text-zinc-800">{slot.patientName}</td>
                    <td className="py-2.5 text-zinc-500">{slot.doctorName}</td>
                    <td className="py-2.5 text-zinc-800 tabular-nums">₹{slot.feeSplit.doctor}</td>
                    <td className="py-2.5 text-zinc-800 tabular-nums">₹{slot.feeSplit.nurse}</td>
                    <td className="py-2.5 text-zinc-800 tabular-nums">₹{slot.feeSplit.franchise}</td>
                    <td className="py-2.5 text-emerald-700 font-semibold tabular-nums">₹{slot.feeSplit.platform}</td>
                    <td className="py-2.5 text-zinc-400 tabular-nums">₹{slot.feeSplit.gst}</td>
                    <td className="py-2.5 text-right font-semibold text-zinc-950 tabular-nums">₹{slot.feePaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-zinc-200/90 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950">Add Doctor to District Network</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Doctor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kavitha Rajan, MD"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Specialty</label>
                <select
                  value={newDocSpecialty}
                  onChange={(e) => setNewDocSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Assigned Hospital Facility</label>
                <select
                  value={newDocHospitalId}
                  onChange={(e) => setNewDocHospitalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctorModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold transition-colors"
                >
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hospital Modal */}
      {showAddHospModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-zinc-200/90 space-y-4">
            <h3 className="font-bold text-sm text-zinc-950">Add Clinic / Hospital Facility</h3>
            <form onSubmit={handleCreateHospital} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Telehealth Clinic"
                  value={newHospName}
                  onChange={(e) => setNewHospName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">District / Territory</label>
                <input
                  type="text"
                  required
                  value={newHospDistrict}
                  onChange={(e) => setNewHospDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-500 font-medium block mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="e.g. 88 Cross Cut Road, Gandhipuram"
                  value={newHospAddress}
                  onChange={(e) => setNewHospAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHospModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold transition-colors"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};