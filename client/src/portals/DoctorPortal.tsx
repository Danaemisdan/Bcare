import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DoctorProfile, 
  OpSlot, 
  DigitalPrescription, 
  AiDiagnosticResult, 
  PrescriptionMedicine,
  RevenueSplitConfig,
  VideoAppointment
} from '../types';
import { generatePrescriptionPdf } from '../utils/pdfGenerator';
import { RollingCounter } from '../components/RollingCounter';
import { CountUp } from '../components/CountUp';
import { SlapBlock } from '../components/SlapBlock';
import { TeleconsultRoomModal } from '../components/TeleconsultRoomModal';
import { PhoneModalPortal } from '../components/PhoneModalPortal';
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
  Wallet,
  Scale,
  Lock,
  Bell,
  MessageSquare,
  Send,
  ZoomIn,
  X,
  Phone,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DoctorPortalProps {
  doctor: DoctorProfile;
  slots: OpSlot[];
  videoAppointments?: VideoAppointment[];
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
  videoAppointments = [],
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

  // Video Appointments for this doctor
  const [localVideoAppointments, setLocalVideoAppointments] = useState<VideoAppointment[]>([]);
  const combinedVideoAppointments = [
    ...videoAppointments.filter(v => v.doctorId === doctor.id || v.status === 'SCHEDULED'),
    ...localVideoAppointments
  ];

  const todayEarnings = completedToday.length * splitConfig.doctorFee;
  const activePatientName = currentConsultation?.patientName || 'Ramesh Kumar';
  const activeTokenNumber = currentConsultation?.tokenNumber || 2;

  // Queue sub-tab: In-person OPD vs Scheduled Video Teleconsultations
  const [queueMode, setQueueMode] = useState<'IN_PERSON' | 'VIDEO'>('IN_PERSON');
  const [activeVideoRoomApt, setActiveVideoRoomApt] = useState<VideoAppointment | null>(null);

  // Diagnostic Media & Chat States
  const diagnosticMedia = [
    {
      id: 'media-1',
      title: '12-Lead ECG Strip',
      type: 'Electrocardiogram',
      time: 'Today, 10:45 AM',
      url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=900',
      note: 'Normal sinus rhythm, mild ST elevation in V2-V3 under observation. Heart rate 84 bpm.'
    },
    {
      id: 'media-2',
      title: 'Chest Radiograph (PA View)',
      type: 'X-Ray Imaging',
      time: 'Today, 09:30 AM',
      url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=900',
      note: 'Clear lung fields bilaterally. Cardiothoracic ratio within normal physiological limits (<0.50).'
    },
    {
      id: 'media-3',
      title: 'Dermal Examination',
      type: 'Clinical Photograph',
      time: 'Yesterday, 04:15 PM',
      url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=900',
      note: 'Superficial macular rash on anterior forearm. Resolving post anti-histamine administration.'
    }
  ];
  const [activeMediaModal, setActiveMediaModal] = useState<typeof diagnosticMedia[0] | null>(null);

  // Interactive Clinical Chat
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'DOCTOR' | 'PATIENT'; text: string; time: string }>>([
    {
      id: 'msg-1',
      sender: 'PATIENT',
      text: 'Doctor, the substernal tightness started 2 days ago when walking up the steps.',
      time: '10:48 AM'
    },
    {
      id: 'msg-2',
      sender: 'DOCTOR',
      text: 'Noted. Does the discomfort radiate to your jaw or left shoulder?',
      time: '10:50 AM'
    },
    {
      id: 'msg-3',
      sender: 'PATIENT',
      text: 'Slightly to the left shoulder, but it subsides as soon as I sit down for 5 minutes.',
      time: '10:52 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'DOCTOR' as const,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  // Statutory Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'NMC' | 'DSC' | 'DPDP' | null>(null);

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

  const handleSimulateSampleVideoConsult = () => {
    const demoApt: VideoAppointment = {
      id: `vid-${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      hospitalName: doctor.hospitalName,
      patientId: 'pat-demo-01',
      patientName: 'Karthik Subramanian',
      patientPhone: '+91 98421 55012',
      date: new Date().toISOString().split('T')[0],
      time: '11:30 AM',
      meetingLink: `https://meet.bcare.health/room/bc-${doctor.id.slice(-4)}`,
      feePaid: doctor.teleConsultationFee || 250,
      status: 'SCHEDULED',
      paymentMethod: 'UPI (Google Pay)',
      createdAt: new Date().toISOString()
    };
    setLocalVideoAppointments(prev => [demoApt, ...prev]);
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-16 font-sans">
      
      {/* Top Clinical Greeting & Today's Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {doctor.name.replace('Dr. ', '').split(' ')[0][0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-semibold text-slate-900 tracking-tight truncate">{doctor.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap shrink-0">
                OPD Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
              {doctor.specialty} • {doctor.hospitalName}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold block">Completed Today</span>
          <div className="flex items-baseline justify-end gap-1 font-bold text-slate-950">
            <span className="text-lg tabular-nums">
              <CountUp to={completedToday.length} />
            </span>
            <span className="text-xs text-slate-400 font-normal">Patients</span>
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
            {/* Segmented Queue Switcher: In-Person OPD vs Scheduled Video */}
            <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setQueueMode('IN_PERSON')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  queueMode === 'IN_PERSON'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>In-Person OPD Queue</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200/80 text-slate-700 font-bold tabular-nums">
                  {upcomingQueue.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQueueMode('VIDEO')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  queueMode === 'VIDEO'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-blue-600" />
                <span>Video Consultations</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold tabular-nums">
                  {combinedVideoAppointments.length}
                </span>
              </button>
            </div>

            {/* QUEUE MODE 1: IN-PERSON OPD QUEUE */}
            {queueMode === 'IN_PERSON' && (
              <div className="space-y-4">
                {/* Active Token Callout */}
                <SlapBlock
                  variant="grow"
                  theme="dark"
                  className="p-4 sm:p-5 rounded-2xl relative overflow-hidden border border-slate-800 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.5)] bg-gradient-to-br from-slate-950 via-slate-900 to-[#071713]"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white min-w-0 flex-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">Current In Consultation</span>
                    </span>
                    <span className="font-semibold text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 whitespace-nowrap shrink-0">
                      Token #{activeTokenNumber}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-semibold text-base text-white">{activePatientName}</h3>
                      <p className="text-xs text-slate-400">Age 48 • Male • +91 9876543210</p>
                      <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-xs font-medium whitespace-nowrap shrink-0">Blood: B+</span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-medium whitespace-nowrap shrink-0">Allergy: Penicillin</span>
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
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <h3 className="font-semibold text-xs text-slate-900 truncate">Waiting OPD Queue</h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums whitespace-nowrap shrink-0 inline-flex items-center">
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
                        <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-950 tabular-nums shrink-0">#{q.tokenNumber}</span>
                              <span className="font-medium text-slate-900 truncate">{q.patientName || 'Walk-in Patient'}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 tabular-nums">{q.time}</span>
                          </div>

                          {q.bookedByNurseId ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap shrink-0">
                              Nurse Ref
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">Direct App</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Patient Diagnostic Media Inspection */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      Physical Inspection & Diagnostic Media
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">{diagnosticMedia.length} Uploads</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {diagnosticMedia.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setActiveMediaModal(item)}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 p-2 cursor-pointer hover:border-blue-400 transition-all shadow-2xs"
                      >
                        <div className="h-24 w-full rounded-lg overflow-hidden bg-slate-100 relative mb-2">
                          <img 
                            src={item.url} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.type} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Patient Clinical Triage Chat */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                      <h4 className="font-semibold text-slate-900">Patient Live Clinical Triage</h4>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap">
                      ABDM E2EE Chat
                    </span>
                  </div>

                  {/* Messages Feed */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 max-h-48 overflow-y-auto space-y-2 text-xs">
                    {chatMessages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'DOCTOR' ? 'items-end' : 'items-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                            msg.sender === 'DOCTOR' 
                              ? 'bg-slate-900 text-white rounded-br-xs' 
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p className="leading-snug">{msg.text}</p>
                        </div>
                        <span className="text-[9.5px] text-slate-400 mt-0.5 px-1 tabular-nums">{msg.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Preset Prompts */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    <span className="text-[10px] text-slate-400 font-semibold shrink-0">Quick Reply:</span>
                    {[
                      'Take a deep breath and rest',
                      'Please attach previous ECG',
                      'Rest for 5 minutes',
                      'Check BP again'
                    ].map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setChatInput(prompt);
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendChatMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type clinical triage advice..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* QUEUE MODE 2: SCHEDULED VIDEO TELECONSULTATIONS */}
            {queueMode === 'VIDEO' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs text-slate-900">Scheduled Video Teleconsultations</h3>
                        <p className="text-[11px] text-slate-400">Certified WebRTC video appointments with digital Rx capability</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-semibold tabular-nums whitespace-nowrap shrink-0">
                      {combinedVideoAppointments.length} Booked
                    </span>
                  </div>

                  {combinedVideoAppointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                      <Video className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <p className="font-semibold text-slate-800">No video appointments booked yet</p>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                          When patients book video teleconsultations through the app, they will appear here with live room launch buttons.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulateSampleVideoConsult}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Simulate Sample Video Patient</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {combinedVideoAppointments.map(apt => (
                        <div
                          key={apt.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all space-y-3 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-950 text-sm">{apt.patientName}</h4>
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold whitespace-nowrap">
                                  Fee Paid: ₹{apt.feePaid} ({apt.paymentMethod})
                                </span>
                              </div>
                              <p className="text-slate-500 text-xs">
                                Phone: {apt.patientPhone} • Date: {apt.date} • Slot: {apt.time}
                              </p>
                              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                                <Languages className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Patient Languages: English, Tamil, Hindi</span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold whitespace-nowrap shrink-0">
                              READY TO JOIN
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-[11px] text-slate-600 space-y-1">
                            <span className="font-semibold text-slate-800 block">Chief Complaint:</span>
                            <p>Recurrent palpitations, mild fatigue during evening hours. Wants medication review.</p>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveVideoRoomApt(apt)}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                              <Video className="w-4 h-4" />
                              <span>Launch Video Room Now</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerWhatsAppToast(
                                  'Video Room Link Sent',
                                  `Direct teleconsult room link dispatched to ${apt.patientName}'s WhatsApp.`,
                                  'TELECONSULT_LINK'
                                );
                              }}
                              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
                              title="Resend WhatsApp Link"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
          {/* Patient Quick Info Strip */}
          <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Patient Rx</span>
              <h4 className="font-bold text-sm">{activePatientName}</h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[11px]">
              Token #{activeTokenNumber}
            </span>
          </div>

          {/* AI Clinical Assistant Card */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="font-semibold text-xs text-slate-900">AI Clinical Diagnostic Differential</h4>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                ICD-10 Helper
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block">BP</span>
                <input 
                  type="text" 
                  value={vitals.bp} 
                  onChange={(e) => setVitals(v => ({ ...v, bp: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs" 
                />
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block">Pulse</span>
                <input 
                  type="text" 
                  value={vitals.pulse} 
                  onChange={(e) => setVitals(v => ({ ...v, pulse: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs" 
                />
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block">Temp</span>
                <input 
                  type="text" 
                  value={vitals.temperature} 
                  onChange={(e) => setVitals(v => ({ ...v, temperature: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs" 
                />
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block">SpO2</span>
                <input 
                  type="text" 
                  value={vitals.spo2} 
                  onChange={(e) => setVitals(v => ({ ...v, spo2: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs" 
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Reported Symptoms</label>
              <textarea
                rows={2}
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900"
              />
            </div>

            <button
              type="button"
              disabled={aiLoading}
              onClick={handleTriggerAiDiagnostics}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Analyzing Clinical Signals...' : 'Run Differential Diagnosis'}</span>
            </button>

            {aiResult && (
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950">Primary Finding:</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-200/60 text-indigo-900">
                    Confidence: {aiResult.possibleDiagnoses[0]?.probability || 'HIGH'}
                  </span>
                </div>
                <p className="font-semibold text-indigo-900">
                  {aiResult.possibleDiagnoses[0]?.condition} ({aiResult.possibleDiagnoses[0]?.icd10Code})
                </p>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  {aiResult.possibleDiagnoses[0]?.rationale || aiResult.clinicalPrecaution}
                </p>
              </div>
            )}
          </div>

          {/* Diagnosis & Medicine Form */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Definitive Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Acute Bronchitis (J20.9)"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700">Prescribed Medications</label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Medicine</span>
                </button>
              </div>

              {medicines.map((med, idx) => (
                <div key={med.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Medicine Name (e.g. Paracetamol 650mg)"
                      value={med.name}
                      onChange={(e) => handleUpdateMedicine(med.id, 'name', e.target.value)}
                      className="font-semibold text-slate-900 w-full bg-transparent border-b border-transparent focus:border-slate-300 pb-0.5"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(med.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <input
                      type="text"
                      placeholder="Freq (1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                      className="p-1 rounded bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                      className="p-1 rounded bg-white border border-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedicine(med.id, 'instructions', e.target.value)}
                      className="p-1 rounded bg-white border border-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Clinical Advice & Follow-Up</label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Dietary instructions, tests required, follow-up timeline..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900"
              />
            </div>

            <button
              type="button"
              disabled={submittingRx}
              onClick={handleSignAndGeneratePrescription}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submittingRx ? 'Signing with Class 3 DSC...' : 'Cryptographically Sign & Issue Prescription'}</span>
            </button>
          </div>

        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: COMPLETED                                              */}
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
              <h3 className="font-semibold text-xs text-slate-900">Today's Completed Consultations</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold tabular-nums">
                {completedToday.length} Patients
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {completedToday.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p className="font-semibold text-slate-700">No completed consultations yet today.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Completed patients will be logged here with PDF Rx records.</p>
                </div>
              ) : (
                completedToday.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-950 tabular-nums">Token #{c.tokenNumber}</span>
                        <span className="font-medium text-slate-900">{c.patientName || 'Outpatient'}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{c.time} • Completed</span>
                    </div>
                    <span className="text-emerald-700 font-bold tabular-nums">
                      +₹{splitConfig.doctorFee}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PROFILE & STATUTORY COMPLIANCE                         */}
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
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-semibold whitespace-nowrap shrink-0">
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

          {/* Statutory Legal & Practice Compliance Settings */}
          <div className="bg-white rounded-3xl p-5 shadow-2xs border border-slate-200/90 space-y-3.5 text-xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                    Practice Regulations & Statutory Compliance
                  </h4>
                  <p className="text-[10.5px] text-slate-400">
                    NMC Telemedicine Guidelines 2020 & DPDP Act 2023 Doctor Obligations
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9.5px] font-bold whitespace-nowrap shrink-0">
                NMC REGISTERED
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveLegalModal('NMC')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Medical Council Registration</span>
                    <span className="text-emerald-700 font-bold text-[10px]">VERIFIED (TMC-77492)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Affiliated with Tamil Nadu Medical Council & National Medical Commission (NMC).
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveLegalModal('DSC')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Digital Signature Certificate (DSC)</span>
                    <span className="text-emerald-700 font-bold text-[10px]">ACTIVE (Class 3)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All PDF prescriptions are cryptographically signed per Information Technology Act, 2000.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveLegalModal('DPDP')}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">DPDP Act 2023 Confidentiality</span>
                    <span className="text-blue-700 font-bold text-[10px]">ABDM ENCRYPTED</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Patient medical histories and chat transcripts are strictly protected under doctor-patient privilege.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
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

      {/* Media Inspection Modal */}
      {activeMediaModal && (
        <PhoneModalPortal>
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs pointer-events-auto"
            onClick={() => setActiveMediaModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl border border-slate-200 text-slate-900"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{activeMediaModal.title}</h3>
                  <p className="text-[10px] text-slate-400">{activeMediaModal.type} • {activeMediaModal.time}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMediaModal(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-64 bg-black">
                <img 
                  src={activeMediaModal.url} 
                  alt={activeMediaModal.title} 
                  className="w-full h-full object-contain" 
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clinical Impression</span>
                <p className="text-slate-700 leading-relaxed font-medium">{activeMediaModal.note}</p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMediaModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Close Diagnostic View
              </button>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* Statutory Legal & Practice Compliance Modals */}
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
                  <Scale className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {activeLegalModal === 'NMC' && 'NMC Telemedicine Guidelines 2020'}
                    {activeLegalModal === 'DSC' && 'Class 3 DSC Cryptographic Signing'}
                    {activeLegalModal === 'DPDP' && 'DPDP Act 2023 Doctor Obligations'}
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

              <div className="text-xs text-slate-600 leading-relaxed space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {activeLegalModal === 'NMC' && (
                  <>
                    <p>
                      <strong>Telemedicine Practice Guidelines (25 March 2020):</strong> Issued under the Indian Medical Council Act, 1956, and National Medical Commission Act, 2019.
                    </p>
                    <p>
                      <strong>Prescription Classifications:</strong>
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>List O:</strong> Over-The-Counter (OTC) drugs (antacids, cough lozenges, ORS) permissible via any mode.</li>
                      <li><strong>List A:</strong> First consultation medications (re-fill medications, anti-hypertensives, statins) permitted via certified video consultation.</li>
                      <li><strong>Prohibited (Schedule X):</strong> Psychotropic substances, narcotics, and injectable opioids are strictly barred from telemedicine issuance.</li>
                    </ul>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <strong>Emergency Protocol:</strong> If an acute cardiac, respiratory, or neurologic emergency is detected, advise patient to immediately call 108 or report to the nearest emergency trauma center.
                    </div>
                  </>
                )}

                {activeLegalModal === 'DSC' && (
                  <>
                    <p>
                      <strong>Information Technology Act, 2000 (Sections 4, 5 & 10A):</strong>
                    </p>
                    <p>
                      Digital prescriptions signed through B Care utilize Class 3 PKI (Public Key Infrastructure) digital signature certificates, granting them full legal parity with physical ink-signed prescriptions.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Tamper-Evident Hash:</strong> Every issued PDF is hashed with SHA-256 and timestamped per ISO 32000-1 specifications.</li>
                      <li><strong>Pharmacy Acceptance:</strong> Valid across all licensed pharmacies under Rule 65 of the Drugs and Cosmetics Rules, 1945.</li>
                    </ul>
                  </>
                )}

                {activeLegalModal === 'DPDP' && (
                  <>
                    <p>
                      <strong>Digital Personal Data Protection Act, 2023:</strong>
                    </p>
                    <p>
                      Doctors acting as Data Fiduciaries must maintain strict purpose limitation and confidentiality:
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      <li><strong>Doctor-Patient Privilege:</strong> Governed by Section 6 of Indian Medical Council (Professional Conduct, Etiquette and Ethics) Regulations, 2002.</li>
                      <li><strong>Data Retention:</strong> Consultation notes and digital prescriptions must be retained for 3 years in accordance with NMC guidelines.</li>
                      <li><strong>Zero Third-Party Sharing:</strong> Diagnostic notes and vitals are never shared with advertisers or unauthorized third parties.</li>
                    </ul>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Acknowledge Statutory Terms
              </button>
            </motion.div>
          </div>
        </PhoneModalPortal>
      )}

      {/* Teleconsultation Video Room Modal */}
      {activeVideoRoomApt && (
        <TeleconsultRoomModal
          isOpen={!!activeVideoRoomApt}
          onClose={() => setActiveVideoRoomApt(null)}
          patientName={activeVideoRoomApt.patientName}
          doctorName={doctor.name}
          specialty={doctor.specialty}
          patientLanguages={['English', 'Tamil', 'Hindi']}
          onPrescriptionGenerated={(rx) => {
            setActiveVideoRoomApt(null);
            if (onTabChange) onTabChange('rx');
          }}
        />
      )}

    </div>
  );
};

export default DoctorPortal;
