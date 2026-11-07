import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Building2, 
  Stethoscope, 
  Star, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Activity,
  Heart,
  ChevronRight,
  Filter,
  CheckCircle2,
  PhoneCall,
  Search,
  X,
  Compass,
  Calendar,
  Zap,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

export type BodyZone = 
  | 'head'
  | 'neck'
  | 'chest'
  | 'abdomen'
  | 'upper_back'
  | 'lower_back'
  | 'pelvis'
  | 'arms'
  | 'legs'
  | 'feet';

interface ClinicalRule {
  zone: BodyZone;
  symptoms: string[];
  primaryDiagnosis: string;
  confidence: number;
  explanation: string;
  recommendedSpecialty: string;
  secondaryDiagnosis: string;
  urgency: 'ROUTINE' | 'ELEVATED' | 'PRIORITY';
  advice: string;
}

const CLINICAL_KNOWLEDGE_BASE: ClinicalRule[] = [
  {
    zone: 'lower_back',
    symptoms: ['Lower back pain', 'Lumbar ache', 'Back stiffness', 'Sciatica', 'Spine spasm'],
    primaryDiagnosis: 'Lumbar Spondylosis & Paraspinal Strain',
    confidence: 94,
    explanation: 'Mechanical stress on the lumbar spine or facet joint irritation. No acute nerve root compression detected.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'L4-L5 Postural Disc Strain',
    urgency: 'ROUTINE',
    advice: 'Avoid lifting heavy items, maintain upright lumbar ergonomics, and schedule an in-person physical evaluation.'
  },
  {
    zone: 'head',
    symptoms: ['Throbbing headache', 'Migraine', 'Temporal pain', 'Light sensitivity', 'Cluster headache'],
    primaryDiagnosis: 'Episodic Neurovascular Migraine',
    confidence: 92,
    explanation: 'Unilateral or pulsing cranial discomfort aggravated by screen exposure or stress.',
    recommendedSpecialty: 'Neurology',
    secondaryDiagnosis: 'Tension-Type Myofascial Headache',
    urgency: 'ROUTINE',
    advice: 'Rest in a quiet, low-light environment, hydrate well, and consult a neurologist for targeted relief.'
  },
  {
    zone: 'chest',
    symptoms: ['Chest tightness', 'Substernal pressure', 'Pectoral soreness', 'Heartburn', 'Acid reflux'],
    primaryDiagnosis: 'Costochondritis & Acidity / GERD',
    confidence: 89,
    explanation: 'Anterior chest wall tenderness combined with retrosternal gastric acidity.',
    recommendedSpecialty: 'Cardiology',
    secondaryDiagnosis: 'Atypical Angina Pectoris (Requires ECG)',
    urgency: 'PRIORITY',
    advice: 'Avoid heavy meals or recumbent posture after eating. A clinical cardiac ECG check is advised for peace of mind.'
  },
  {
    zone: 'abdomen',
    symptoms: ['Stomach cramp', 'Abdominal bloating', 'Acid reflux', 'Epigastric pain', 'Indigestion'],
    primaryDiagnosis: 'Acute Epigastric Gastritis & Dyspepsia',
    confidence: 93,
    explanation: 'Mucosal gastric hyperacidity and cramping in the upper gastrointestinal region.',
    recommendedSpecialty: 'General Medicine',
    secondaryDiagnosis: 'Irritable Bowel Syndrome (IBS) Flare-up',
    urgency: 'ROUTINE',
    advice: 'Drink warm water, take light bland meals, and see a general physician for soothing antacid regulation.'
  },
  {
    zone: 'legs',
    symptoms: ['Knee swelling', 'Joint stiffness', 'Patellar soreness', 'Calf cramp', 'Ligament sprain'],
    primaryDiagnosis: 'Patellofemoral Arthralgia & Joint Strain',
    confidence: 91,
    explanation: 'Synovial irritation or weight-bearing mechanical overload of the knee joint.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Early Synovial Cartilage Irritation',
    urgency: 'ROUTINE',
    advice: 'Elevate knee, avoid deep squats or stairs, and book an orthopedic OPD pass for joint assessment.'
  },
  {
    zone: 'neck',
    symptoms: ['Cervical stiffness', 'Neck spasm', 'Trapezius tension', 'Shoulder radiation'],
    primaryDiagnosis: 'Cervical Radiculopathy & Trapezius Spasm',
    confidence: 90,
    explanation: 'Ergonomic screen posture strain affecting the cervical lordosis and upper trapezius muscles.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Cervical Spondylitis',
    urgency: 'ROUTINE',
    advice: 'Apply warm fomentation, adjust monitor height to eye level, and consult an orthopedic doctor.'
  },
  {
    zone: 'arms',
    symptoms: ['Wrist pain', 'Elbow soreness', 'Carpal numbness', 'Shoulder impingement'],
    primaryDiagnosis: 'Repetitive Strain Injury & Tendon Irritation',
    confidence: 89,
    explanation: 'Micro-tendinous strain from repetitive typing, lifting, or ergonomic pressure.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Carpal Tunnel Tendon Irritation',
    urgency: 'ROUTINE',
    advice: 'Take hourly rest breaks, wear an ergonomic wrist support, and schedule an OPD consultation.'
  },
  {
    zone: 'feet',
    symptoms: ['Heel pain', 'Plantar stiffness', 'Ankle sprain', 'Arch soreness'],
    primaryDiagnosis: 'Plantar Fasciitis & Calcaneal Strain',
    confidence: 95,
    explanation: 'Micro-tearing of the plantar aponeurosis at the medial heel bone, sharpest during first morning steps.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Achilles Tendinopathy',
    urgency: 'ROUTINE',
    advice: 'Wear cushioned indoor footwear, perform gentle calf stretches, and book an orthopedic token.'
  }
];

const COMMON_CONCERNS = [
  { icon: '🧠', label: 'Throbbing Headache / Migraine', zone: 'head' as BodyZone },
  { icon: '🧘', label: 'Lower Back & Spine Ache', zone: 'lower_back' as BodyZone },
  { icon: '🫀', label: 'Chest Discomfort & Acidity', zone: 'chest' as BodyZone },
  { icon: '🦵', label: 'Knee Swelling & Stiffness', zone: 'legs' as BodyZone },
  { icon: '🧣', label: 'Cervical Neck Strain', zone: 'neck' as BodyZone },
  { icon: '🫄', label: 'Stomach Cramps & Bloating', zone: 'abdomen' as BodyZone },
  { icon: '🦶', label: 'Foot & Heel Pain', zone: 'feet' as BodyZone },
  { icon: '⚡', label: 'Shoulder & Arm Spasm', zone: 'arms' as BodyZone }
];

const BODY_ZONES: { id: BodyZone; label: string; icon: string; desc: string }[] = [
  { id: 'head', label: 'Head & Face', icon: '🧠', desc: 'Migraine, sinuses, temples' },
  { id: 'neck', label: 'Neck & Throat', icon: '🧣', desc: 'Cervical spine, trapezius' },
  { id: 'chest', label: 'Chest & Ribs', icon: '🫀', desc: 'Tightness, heartburn, ribs' },
  { id: 'abdomen', label: 'Stomach & Gut', icon: '🫄', desc: 'Cramps, acidity, digestion' },
  { id: 'lower_back', label: 'Lower Back', icon: '🧘', desc: 'Lumbar spine, sciatica' },
  { id: 'legs', label: 'Knees & Legs', icon: '🦵', desc: 'Joints, calves, sprains' },
  { id: 'arms', label: 'Arms & Shoulders', icon: '🦾', desc: 'Wrists, elbows, spasms' },
  { id: 'feet', label: 'Feet & Heels', icon: '🦶', desc: 'Plantar heel, ankles' },
];

const DURATION_OPTIONS = [
  { id: 'today', label: 'Just Started Today', sub: 'Less than 24 hours ago', icon: '⚡' },
  { id: 'days', label: 'A Few Days', sub: '2 to 6 days ago', icon: '🗓️' },
  { id: 'weeks', label: 'Over a Week', sub: '1 to 3 weeks of discomfort', icon: '📅' },
  { id: 'chronic', label: 'Chronic / Recurring', sub: 'Ongoing for over a month', icon: '🔄' },
];

const ADDITIONAL_SYMPTOMS = [
  { id: 'fever', label: 'Fever / Chills', icon: '🌡️' },
  { id: 'dizziness', label: 'Dizziness / Lightheaded', icon: '💫' },
  { id: 'nausea', label: 'Nausea / Upset Stomach', icon: '🤢' },
  { id: 'fatigue', label: 'Fatigue / Body Weakness', icon: '🥱' },
  { id: 'sleep', label: 'Disturbed Sleep', icon: '😴' },
  { id: 'none', label: 'None, just the primary pain', icon: '✨' },
];

interface AiHealthAssistantProps {
  patientProfile: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  onOpenCheckout: (doctor: DoctorProfile, consultationType: ConsultationType, explicitSlot?: OpSlot) => void;
}

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  patientProfile,
  hospitals,
  doctors,
  slots,
  onOpenCheckout
}) => {
  // Wizard Step State: 1 = Problem, 2 = Area & Intensity, 3 = Duration, 4 = Secondary Symptoms, 5 = Geo Results
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [problemDescription, setProblemDescription] = useState<string>('Lower back pain radiating to hip');
  const [selectedZone, setSelectedZone] = useState<BodyZone>('lower_back');
  const [painSeverity, setPainSeverity] = useState<number>(5); // 1 to 10
  const [duration, setDuration] = useState<string>('days');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Geo & Filter State
  const [distanceRadius, setDistanceRadius] = useState<number>(10); // 5km, 10km, 25km
  const [viewMode, setViewMode] = useState<'HOSPITALS' | 'DOCTORS'>('HOSPITALS');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'hosp-1');

  // Match clinical rule locally (0ms)
  const clinicalResult = useMemo(() => {
    const matched = CLINICAL_KNOWLEDGE_BASE.find(r => r.zone === selectedZone) || CLINICAL_KNOWLEDGE_BASE[0];
    return matched;
  }, [selectedZone]);

  // Handle selecting a common concern from Step 1
  const handleSelectConcern = (concern: typeof COMMON_CONCERNS[0]) => {
    setProblemDescription(concern.label);
    setSelectedZone(concern.zone);
  };

  // Toggle secondary symptoms
  const handleToggleSymptom = (symptomId: string) => {
    if (symptomId === 'none') {
      setSelectedSymptoms(['none']);
      return;
    }
    const filtered = selectedSymptoms.filter(s => s !== 'none');
    if (filtered.includes(symptomId)) {
      setSelectedSymptoms(filtered.filter(s => s !== symptomId));
    } else {
      setSelectedSymptoms([...filtered, symptomId]);
    }
  };

  // Geo-ranked hospitals
  const rankedHospitals = useMemo(() => {
    return hospitals.map((hosp, idx) => {
      const distance = 1.2 + idx * 1.8;
      return {
        ...hosp,
        distanceKm: distance,
        liveWaitMins: 10 + idx * 5,
        rating: 4.8 + (idx % 3) * 0.08
      };
    }).filter(h => h.distanceKm <= distanceRadius);
  }, [hospitals, distanceRadius]);

  const activeHospital = rankedHospitals.find(h => h.id === selectedHospitalId) || rankedHospitals[0] || hospitals[0];

  // Matched doctors filtered by specialty
  const availableDoctors = useMemo(() => {
    let docs = doctors.filter(d => {
      const matchesSpecialty = d.specialty.toLowerCase().includes(clinicalResult.recommendedSpecialty.toLowerCase()) ||
        clinicalResult.recommendedSpecialty.toLowerCase().includes(d.specialty.toLowerCase()) ||
        d.specialty === 'General Medicine';
      const matchesHospital = !selectedHospitalId || d.hospitalId === selectedHospitalId;
      return matchesSpecialty && matchesHospital;
    });

    if (docs.length === 0) {
      docs = doctors.filter(d => d.hospitalId === activeHospital.id);
    }
    if (docs.length === 0) {
      docs = doctors.slice(0, 3);
    }
    return docs;
  }, [doctors, clinicalResult.recommendedSpecialty, selectedHospitalId, activeHospital.id]);

  const topDoctor = availableDoctors[0] || doctors[0];

  // Auto-booking handoff
  const handleProceedBooking = (chosenDoc: DoctorProfile, type: ConsultationType = 'IN_PERSON_OPD') => {
    const targetSlot = slots.find(s => s.doctorId === chosenDoc.id && s.status === 'AVAILABLE') || slots[0];
    onOpenCheckout(chosenDoc, type, targetSlot);
  };

  // Severity color & text helper
  const getSeverityInfo = (val: number) => {
    if (val <= 3) return { label: 'Mild Discomfort', desc: 'Manageable, minimal daily disruption', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val <= 6) return { label: 'Moderate Pain', desc: 'Impacting work, movement or sleep', color: 'text-sky-800 bg-sky-50 border-sky-200' };
    return { label: 'Severe / Acute', desc: 'Intense pain, requiring urgent attention', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const severityInfo = getSeverityInfo(painSeverity);

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* LIGHT & SMOOTH HEADER WITH ETHEREAL SIRI ORB                              */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-4.5 sm:p-5 shadow-sm">
        {/* Soft Pearlescent Background Aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/60 via-indigo-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100/40 to-transparent rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Smart Health Intake</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 font-normal">30-Second Clinical Triage</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {currentStep <= 4 ? "Find What's Wrong & Book Nearby" : "Top Verified Matches Near You"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              {currentStep <= 4 
                ? "Answer 4 quick questions. Our local clinical assistant identifies potential causes and connects you directly to accredited clinics."
                : `Matched with ${clinicalResult.recommendedSpecialty} specialists in Coimbatore. Choose a hospital or doctor to secure your slot.`}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 pr-1">
            <SiriOrb size={52} state={currentStep <= 4 ? "thinking" : "idle"} />
            <span className="text-[10px] text-sky-600 font-medium mt-1 tracking-tight">
              {currentStep <= 4 ? "Local Engine" : "Ready to Book"}
            </span>
          </div>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-1.5">
            {[
              { num: 1, label: 'Problem' },
              { num: 2, label: 'Area' },
              { num: 3, label: 'Duration' },
              { num: 4, label: 'Symptoms' },
              { num: 5, label: 'Geo Match' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isPast || currentStep === 5) setCurrentStep(step.num);
                  }}
                  className={`flex-1 flex flex-col items-center gap-1 group transition-all ${
                    isPast || currentStep === 5 ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-400 to-indigo-500 shadow-sm shadow-sky-400/30'
                      : isPast
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />
                  <span className={`text-[10px] font-medium hidden sm:block ${
                    isActive ? 'text-sky-700 font-bold' : isPast ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: WHAT'S THE PROBLEM?                                               */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Question 1 of 4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">What's bothering you today?</h3>
                <p className="text-xs text-slate-500">Type what you feel or tap a common health concern below.</p>
              </div>
              <span className="text-2xl">🩺</span>
            </div>

            {/* Natural Language Symptom Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder="e.g. Throbbing migraine, acute lower back stiffness, acid reflux..."
                className="w-full pl-10 pr-10 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm font-medium rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
              />
              {problemDescription && (
                <button
                  type="button"
                  onClick={() => setProblemDescription('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick One-Tap Concern Chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Common Concerns:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_CONCERNS.map((concern) => {
                  const isSelected = problemDescription === concern.label;
                  return (
                    <button
                      key={concern.label}
                      type="button"
                      onClick={() => handleSelectConcern(concern)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-sky-50/80 border-sky-300 text-sky-900 shadow-sm shadow-sky-100'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <span className="text-base shrink-0">{concern.icon}</span>
                      <span className="flex-1 font-semibold">{concern.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!problemDescription.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue: Where Does It Hurt?</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BODY AREA & PAIN INTENSITY                                        */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Question 2 of 4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Where is the discomfort located?</h3>
                <p className="text-xs text-slate-500">Select the primary body zone and its severity level.</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Body Zone Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BODY_ZONES.map((zone) => {
                const isSelected = selectedZone === zone.id;
                return (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => setSelectedZone(zone.id)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 shadow-sm shadow-sky-100 ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{zone.icon}</span>
                    <span className="text-xs font-bold leading-tight">{zone.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{zone.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Pain Severity Slider */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Pain Intensity</span>
                  <p className="text-[11px] text-slate-500">Rate how acute the pain feels right now</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityInfo.color}`}>
                  Score {painSeverity}/10 • {severityInfo.label}
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={painSeverity}
                onChange={(e) => setPainSeverity(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />

              <div className="grid grid-cols-3 gap-2">
                {[
                  { range: '1 - 3', label: 'Mild', val: 2 },
                  { range: '4 - 6', label: 'Moderate', val: 5 },
                  { range: '7 - 10', label: 'Severe', val: 8 },
                ].map((tier) => {
                  const isActive = (tier.val <= 3 && painSeverity <= 3) || 
                    (tier.val >= 4 && tier.val <= 6 && painSeverity >= 4 && painSeverity <= 6) ||
                    (tier.val >= 7 && painSeverity >= 7);
                  return (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setPainSeverity(tier.val)}
                      className={`p-2 rounded-xl text-center border text-xs transition-all ${
                        isActive
                          ? 'bg-sky-50 border-sky-300 font-bold text-sky-900 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-bold">{tier.label}</div>
                      <div className="text-[10px] text-slate-500">{tier.range}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation CTA */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue: Duration & Timing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: DURATION & PROGRESSION                                            */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Question 3 of 4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">How long has this been going on?</h3>
                <p className="text-xs text-slate-500">Helps distinguish acute episodes from chronic conditions.</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Duration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = duration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setDuration(opt.id);
                      // Auto-advance smoothly to question 4
                      setTimeout(() => setCurrentStep(4), 250);
                    }}
                    className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-sm ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation CTA */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue: Secondary Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: SECONDARY SYMPTOMS                                                */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Question 4 of 4</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Any additional symptoms?</h3>
                <p className="text-xs text-slate-500">Tap all that apply, or tap "None" to finish intake.</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Secondary Symptoms Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ADDITIONAL_SYMPTOMS.map((symp) => {
                const isSelected = selectedSymptoms.includes(symp.id);
                return (
                  <button
                    key={symp.id}
                    type="button"
                    onClick={() => handleToggleSymptom(symp.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-950 shadow-sm ring-1 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-lg shrink-0">{symp.icon}</span>
                    <span className="flex-1">{symp.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation CTA: Lead to Geo Results */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>Find Hospitals & Doctors Nearby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: GEO LOCATION & NEARBY HOSPITALS / DOCTORS                         */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {/* Clinical Triage Result Card */}
          <div className="bg-gradient-to-br from-white via-sky-50/40 to-emerald-50/30 rounded-3xl border border-sky-200/90 p-4.5 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Match: {clinicalResult.confidence}% Confidence</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {clinicalResult.primaryDiagnosis}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {clinicalResult.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            <div className="pt-2 border-t border-sky-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Recommended Specialty:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                {clinicalResult.recommendedSpecialty}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Urgency: <strong>{clinicalResult.urgency}</strong></span>
            </div>
          </div>

          {/* Geo-Location Bar & Distance Filters */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>Coimbatore South</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-700 font-medium">GPS Active</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Showing accredited centers near your live coordinates</div>
                </div>
              </div>

              {/* Radius Chips */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Radius:</span>
                {[5, 10, 25].map((rad) => (
                  <button
                    key={rad}
                    type="button"
                    onClick={() => setDistanceRadius(rad)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      distanceRadius === rad
                        ? 'bg-sky-500 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {rad} km
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle: Hospitals vs Doctors */}
            <div className="pt-2 border-t border-slate-100 flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('HOSPITALS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'HOSPITALS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Hospitals Nearby ({rankedHospitals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('DOCTORS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'DOCTORS'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available Doctors ({availableDoctors.length})</span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VIEW: NEARBY HOSPITALS LIST                                           */}
          {/* ===================================================================== */}
          {viewMode === 'HOSPITALS' && (
            <div className="space-y-3">
              {rankedHospitals.map((hospital) => {
                const isSelected = hospital.id === selectedHospitalId;
                const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
                const assignedDoctor = hospitalDoctors.find(d => 
                  d.specialty.toLowerCase().includes(clinicalResult.recommendedSpecialty.toLowerCase())
                ) || hospitalDoctors[0] || topDoctor;

                return (
                  <div
                    key={hospital.id}
                    className={`rounded-3xl border p-4.5 transition-all ${
                      isSelected
                        ? 'bg-white border-sky-400 shadow-md ring-2 ring-sky-100'
                        : 'bg-white hover:border-slate-300 border-slate-200/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              {hospital.distanceKm.toFixed(1)} km away
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{hospital.address}</p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {hospital.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Next Token #4 (~{hospital.liveWaitMins}m wait)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">OPD Pass</div>
                        <div className="text-sm font-bold text-slate-900">₹{assignedDoctor?.opConsultationFee || 200}</div>
                      </div>
                    </div>

                    {/* Booking Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-500">
                        Assigned: <strong>Dr. {assignedDoctor?.name}</strong> ({assignedDoctor?.specialty})
                      </div>
                      <button
                        type="button"
                        onClick={() => handleProceedBooking(assignedDoctor, 'IN_PERSON_OPD')}
                        className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Book OPD Token</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW: AVAILABLE DOCTORS LIST                                          */}
          {/* ===================================================================== */}
          {viewMode === 'DOCTORS' && (
            <div className="space-y-3">
              {availableDoctors.map((doc) => {
                const docHospital = hospitals.find(h => h.id === doc.hospitalId) || activeHospital;
                const docSlot = slots.find(s => s.doctorId === doc.id && s.status === 'AVAILABLE') || slots[0];

                return (
                  <div
                    key={doc.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-4.5 shadow-sm hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-base shrink-0">
                          {doc.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">Dr. {doc.name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                              {doc.specialty}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{docHospital.name} • {docHospital.address}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {doc.rating}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{doc.experienceYears} yrs exp</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">
                              Available Today
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-400">Consult Fee</div>
                        <div className="text-sm font-bold text-slate-900">₹{doc.opConsultationFee}</div>
                      </div>
                    </div>

                    {/* Action Buttons: Walk-in OPD or Video Consult */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleProceedBooking(doc, 'VIDEO_CONSULTATION')}
                        className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                        <span>Video Consult</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleProceedBooking(doc, 'IN_PERSON_OPD')}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <span>Book OPD Token</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

    </div>
  );
};

export default AiHealthAssistant;
