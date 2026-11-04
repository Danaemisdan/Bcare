import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DoctorProfile, 
  OpSlot, 
  DigitalPrescription, 
  AiDiagnosticResult, 
  PrescriptionMedicine,
  RevenueSplitConfig 
} from '../types';
import { generatePrescriptionPdf } from '../utils/pdfGenerator';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { 
  Stethoscope, 
  Clock, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2, 
  ArrowRight,
  ShieldCheck,
  Eye,
  CheckCircle2,
  LogOut,
  Building2,
  Video,
  User,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DoctorPortalProps {
  doctor: DoctorProfile;
  slots: OpSlot[];
  splitConfig: RevenueSplitConfig;
  isMobile?: boolean;
  activeTab?: 'queue' | 'rx' | 'completed' | 'profile';
  onTabChange?: (tab: 'queue' | 'rx' | 'completed' | 'profile') => void;
  onCallNextToken: (doctorId: string) => Promise<any>;
  onRunAiDiagnostics: (patientData: any) => Promise<AiDiagnosticResult>;
  onCreatePrescription: (prescriptionData: any) => Promise<any>;
  onTriggerWhatsAppToast: (title: string, message: string, type: 'TOKEN_CONFIRMATION' | 'PRESCRIPTION_READY' | 'TELECONSULT_LINK') => void;
  onLogout?: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  doctor,
  slots,
  splitConfig,
  isMobile = false,
  activeTab = 'queue',
  onTabChange,
  onCallNextToken,
  onRunAiDiagnostics,
  onCreatePrescription,
  onTriggerWhatsAppToast,
  onLogout
}) => {
  const doctorSlots = slots.filter(s => s.doctorId === doctor.id);
  const currentConsultation = doctorSlots.find(s => s.status === 'IN_CONSULTATION');
  const upcomingQueue = doctorSlots.filter(s => s.status === 'BOOKED');
  const completedToday = doctorSlots.filter(s => s.status === 'COMPLETED');

  const todayEarnings = completedToday.length * splitConfig.doctorFee;
  const activePatientName = currentConsultation?.patientName || 'Ramesh Kumar';
  const activeTokenNumber = currentConsultation?.tokenNumber || 2;

  // Vitals State
  const [vitals, setVitals] = useState({
    bp: '142/92',
    pulse: '84',
    temperature: '98.6',
    spo2: '98'
  });
  const [symptomInput, setSymptomInput] = useState('Substernal chest tightness radiating to left shoulder on moderate exertion. Relieved by rest.');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiDiagnosticResult | null>(null);

  // Prescription State
  const [diagnosis, setDiagnosis] = useState('Stable Angina Pectoris (I20.9)');
  const [clinicalNotes, setClinicalNotes] = useState('Advised Echocardiogram & Lipid Panel review. Follow-up in 14 days.');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    { id: 'med-1', name: 'Telmisartan 40mg', dosage: '40mg', frequency: '1-0-0 (Morning)', duration: '30 Days', instructions: 'Take after breakfast' },
    { id: 'med-2', name: 'Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1 (Night)', duration: '30 Days', instructions: 'Take at bedtime' },
    { id: 'med-3', name: 'Aspirin 75mg', dosage: '75mg', frequency: '0-1-0 (After Lunch)', duration: '30 Days', instructions: 'Take after lunch' }
  ]);
  const [submittingRx, setSubmittingRx] = useState(false);

  const handleAddMedicine = () => {
    setMedicines(prev => [
      ...prev,
      { id: `med-${Date.now()}`, name: '', dosage: '1 Tab', frequency: '1-0-1', duration: '7 Days', instructions: 'Take with water' }
    ]);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, value: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleTriggerAiDiagnostics = async () => {
    setAiLoading(true);
    try {
      const res = await onRunAiDiagnostics({
        patientName: activePatientName,
        age: 48,
        gender: 'Male',
        vitals,
        symptoms: symptomInput
      });
      setAiResult(res);
      if (res.possibleDiagnoses[0]) {
        setDiagnosis(`${res.possibleDiagnoses[0].condition} (${res.possibleDiagnoses[0].icd10Code})`);
      }
    } catch (err: any) {
      alert(err.message || 'AI diagnosis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSignAndGeneratePrescription = async () => {
    if (!diagnosis.trim()) {
      alert('Please enter a clinical diagnosis');
      return;
    }
    setSubmittingRx(true);
    try {
      const rxPayload = {
        patientName: activePatientName,
        patientPhone: '9876543210',
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        hospitalName: doctor.hospitalName,
        diagnosis,
        vitals,
        medicines: medicines.filter(m => m.name.trim() !== ''),
        advice: clinicalNotes
      };

      const created = await onCreatePrescription(rxPayload);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onTriggerWhatsAppToast(
        'Digital Rx Issued',
        `Prescription #${created.rxNumber || 'RX-9942'} signed and dispatched to ${activePatientName}'s WhatsApp.`,
        'PRESCRIPTION_READY'
      );

      // Download PDF
      generatePrescriptionPdf(created);

    } catch (err: any) {
      alert(err.message || 'Failed to dispatch prescription');
    } finally {
      setSubmittingRx(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-16">
      
      {/* Top Clinical Greeting & Today's Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {doctor.name.replace('Dr. ', '').split(' ')[0][0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">{doctor.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                {doctor.specialty}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {doctor.hospitalName} • OPD Room 104
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Today</span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              <RollingCounter value={todayEarnings} prefix="₹" height={16} />
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: QUEUE (Live Queue Desk & Patient Calling)              */}
      {/* ============================================================== */}
      <AnimatePresence mode="wait">
        {activeTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Active Token Callout */}
          <SlapBlock
            variant="grow"
            theme="dark"
            className="p-4 sm:p-5 rounded-2xl relative overflow-hidden border border-slate-800 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-950 via-slate-900 to-[#071713]"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Current In Consultation
              </span>
              <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Token #{activeTokenNumber}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <h3 className="font-semibold text-base text-white">{activePatientName}</h3>
                <p className="text-xs text-slate-400">Age 48 • Male • +91 9876543210</p>
                <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-medium">Blood: B+</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-medium">Allergy: Penicillin</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onCallNextToken(doctor.id)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer shrink-0"
              >
                <span>Call Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </SlapBlock>

          {/* Waiting Tokens Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-xs text-slate-900">Waiting OPD Queue</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums">
                <RollingCounter value={upcomingQueue.length} suffix=" Patients" height={14} />
              </span>
            </div>

            <div className="space-y-2">
              {upcomingQueue.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-1">No waiting patients in queue.</p>
                </div>
              ) : (
                upcomingQueue.map(q => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 tabular-nums">#{q.tokenNumber}</span>
                        <span className="font-medium text-slate-900">{q.patientName || 'Walk-in Patient'}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">{q.time}</span>
                    </div>

                    {q.bookedByNurseId ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                        Nurse Ref
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Direct App</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Patient Inspection Media */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                Physical Inspection Media
              </span>
              <span className="text-[11px] text-slate-400">1 Upload</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 relative">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500" 
                alt="Inspection Media" 
                className="w-full h-32 object-cover" 
              />
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RX & AI (Differential Diagnosis & Digital PDF Writer)  */}
      {/* ============================================================== */}
      {activeTab === 'rx' && (
        <motion.div
          key="rx"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {/* AI Clinical Diagnostic Assistant */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-slate-900">AI Differential Diagnosis Engine</h3>
                  <p className="text-[10px] text-slate-400">ICD-10 clinical guidance based on patient vitals</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTriggerAiDiagnostics}
                disabled={aiLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{aiLoading ? 'Computing...' : 'Run Diagnostics'}</span>
              </button>
            </div>

            {/* Vitals Form Row (2x2 on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pulse (bpm)</label>
                <input
                  type="text"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Temp (°F)</label>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Chief Symptoms & Presentation</label>
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            {/* AI Results */}
            {aiResult && (
              <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in">
                <span className="font-semibold text-slate-900 text-xs block">Differential Diagnoses (Tap to Apply):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiResult.possibleDiagnoses.map((diag, idx) => (
                    <div
                      key={idx}
                      onClick={() => setDiagnosis(diag.condition)}
                      className="cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-900 transition-all space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-xs truncate mr-2">{diag.condition}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 shrink-0">
                          {diag.icd10Code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{diag.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Digital PDF Prescription Builder */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                <h3 className="font-semibold text-xs text-slate-900">Digital Prescription Builder</h3>
              </div>
              <span className="text-xs text-slate-400">ABDM Verified PDF</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirmed Clinical Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">Prescribed Medicines ({medicines.length})</span>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Medicine</span>
                </button>
              </div>

              <div className="space-y-2">
                {medicines.map((med) => (
                  <div key={med.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Drug name (e.g. Telmisartan 40mg)"
                        value={med.name}
                        onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                        className="flex-1 bg-white p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Freq (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 font-medium text-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Duration (30 days)"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                        className="w-full bg-white p-1.5 rounded-lg border border-slate-200 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinical Advice</label>
              <input
                type="text"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Automatic dispatch to WhatsApp</span>
              <button
                type="button"
                onClick={handleSignAndGeneratePrescription}
                disabled={submittingRx}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{submittingRx ? 'Signing...' : 'Sign & Dispatch PDF'}</span>
              </button>
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: COMPLETED (Consultations Ledger & OP Fee Breakdown)    */}
      {/* ============================================================== */}
      {activeTab === 'completed' && (
        <motion.div
          key="completed"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-xs text-slate-900 tracking-tight">
                Completed Consultations ({completedToday.length})
              </h3>
              <span className="text-[11px] text-slate-400">Today's OP Ledger</span>
            </div>

            <div className="space-y-2">
              {completedToday.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No completed consultations yet today.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Patients completed from the Queue tab will be logged here.</p>
                </div>
              ) : (
                completedToday.map(slot => (
                  <div key={slot.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 tabular-nums">#{slot.tokenNumber}</span>
                        <span className="font-medium text-slate-900">{slot.patientName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">{slot.time} • Completed</span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-700 tabular-nums">+₹{splitConfig.doctorFee}</span>
                      <span className="text-[10px] text-emerald-600 block font-medium">Credited</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROFILE & SETTINGS                                     */}
      {/* ============================================================== */}
      {activeTab === 'profile' && (
        <motion.div
          key="profile"
          initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          {/* Identity Card */}
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/90 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  {doctor.name.replace('Dr. ', '').split(' ')[0][0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-semibold text-slate-950 tracking-tight truncate">{doctor.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold">
                      Verified Specialist
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                    {doctor.specialty} • License #TMC-77492
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {doctor.hospitalName} • Coimbatore Central
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Strip */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] text-slate-400 block">Base OPD Fee</span>
                <span className="text-lg font-bold text-slate-950 tabular-nums">
                  ₹{doctor.opConsultationFee || 100}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                <span className="text-[11px] text-emerald-700 font-medium block">Today's OPD Share</span>
                <span className="text-lg font-bold text-emerald-800 tabular-nums">
                  <RollingCounter value={todayEarnings} prefix="₹" height={22} />
                </span>
              </div>
            </div>
          </div>

          {/* Explicit Sign Out Button */}
          {onLogout && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Physician Account</span>
              </button>
            </div>
          )}

        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
};

export default DoctorPortal;
