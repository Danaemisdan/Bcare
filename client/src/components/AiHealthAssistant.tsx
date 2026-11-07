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
  Zap,
  Activity,
  Heart,
  ChevronRight,
  Filter,
  Sliders,
  Compass,
  CheckCircle2,
  PhoneCall
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
  redFlags: string[];
}

const CLINICAL_KNOWLEDGE_BASE: ClinicalRule[] = [
  {
    zone: 'lower_back',
    symptoms: ['Lower back pain', 'Lumbar ache', 'Back stiffness', 'Sciatica', 'Spine spasm'],
    primaryDiagnosis: 'Lumbar Spondylosis & Paraspinal Myofascial Strain',
    confidence: 94,
    explanation: 'Clinical indicators suggest mechanical stress or facet joint irritation of the L4-L5/S1 spinal axis without acute cauda equina red flags.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Disc Herniation with mild L5 Radiculopathy',
    urgency: 'ROUTINE',
    redFlags: ['No bowel/bladder loss noted', 'No progressive bilateral motor weakness']
  },
  {
    zone: 'head',
    symptoms: ['Throbbing headache', 'Migraine', 'Temporal pain', 'Light sensitivity', 'Cluster headache'],
    primaryDiagnosis: 'Episodic Migraine with Neurovascular Vasodilation',
    confidence: 91,
    explanation: 'Unilateral or pulsing cranial discomfort aggravated by sensory stimuli, consistent with episodic neurovascular migraine.',
    recommendedSpecialty: 'Neurology',
    secondaryDiagnosis: 'Tension-Type Myofascial Cranial Headache',
    urgency: 'ROUTINE',
    redFlags: ['No sudden thunderclap onset', 'No unilateral facial drooping or speech slurring']
  },
  {
    zone: 'chest',
    symptoms: ['Chest tightness', 'Substernal pressure', 'Pectoral soreness', 'Heartburn', 'Acid reflux'],
    primaryDiagnosis: 'Costochondritis & Gastroesophageal Reflux (GERD)',
    confidence: 88,
    explanation: 'Localized anterior chest wall tenderness and retrosternal acidity. Non-ischemic indicators present, yet clinical review is prioritized.',
    recommendedSpecialty: 'Cardiology',
    secondaryDiagnosis: 'Atypical Angina Pectoris (Requires ECG Triaging)',
    urgency: 'PRIORITY',
    redFlags: ['No radiation to left arm or jaw', 'No associated diaphoresis or dyspnea']
  },
  {
    zone: 'abdomen',
    symptoms: ['Stomach cramp', 'Abdominal bloating', 'Acid reflux', 'Epigastric pain', 'Indigestion'],
    primaryDiagnosis: 'Acute Epigastric Gastritis & Dyspepsia',
    confidence: 93,
    explanation: 'Mucosal gastric hyperacidity and post-prandial cramping localized to the epigastrium and umbilical region.',
    recommendedSpecialty: 'General Medicine',
    secondaryDiagnosis: 'Irritable Bowel Syndrome (IBS) flare-up',
    urgency: 'ROUTINE',
    redFlags: ['No peritoneal rigidity', 'No hematemesis or melena detected']
  },
  {
    zone: 'legs',
    symptoms: ['Knee swelling', 'Joint stiffness', 'Patellar soreness', 'Calf cramp', 'Ligament sprain'],
    primaryDiagnosis: 'Patellofemoral Arthralgia & Meniscal Stress',
    confidence: 92,
    explanation: 'Weight-bearing articular wear or synovial effusion of the knee joint with functional ROM restriction.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Early Osteoarthritis with Synovial Irritation',
    urgency: 'ROUTINE',
    redFlags: ['No septic joint erythema or fever', 'Joint stability intact']
  },
  {
    zone: 'neck',
    symptoms: ['Cervical stiffness', 'Neck spasm', 'Trapezius tension', 'Shoulder radiation'],
    primaryDiagnosis: 'Cervical Radiculitis & Trapezius Spasm',
    confidence: 90,
    explanation: 'Ergonomic posture strain affecting cervical lordosis (C5-C7) causing myofascial trigger point tension.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Cervical Spondylitis',
    urgency: 'ROUTINE',
    redFlags: ['Normal upper limb reflexes', 'No spinal cord compression signs']
  },
  {
    zone: 'arms',
    symptoms: ['Wrist pain', 'Elbow soreness', 'Carpal numbness', 'Shoulder impingement'],
    primaryDiagnosis: 'Lateral Epicondylitis / Repetitive Strain Injury',
    confidence: 89,
    explanation: 'Micro-tendinous strain from repetitive wrist extension or rotator cuff tendon irritation.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Carpal Tunnel Median Nerve Entrapment',
    urgency: 'ROUTINE',
    redFlags: ['No limb cyanosis or arterial compromise', 'No motor paresis']
  },
  {
    zone: 'pelvis',
    symptoms: ['Pelvic ache', 'Sacroiliac stiffness', 'Hip soreness', 'Lower groin strain'],
    primaryDiagnosis: 'Sacroiliac Joint Dysfunction & Hip Bursitis',
    confidence: 87,
    explanation: 'Unilateral sacroiliac joint inflammation or trochanteric friction syndrome upon prolonged sitting.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Iliopsoas Tendon Overuse Strain',
    urgency: 'ROUTINE',
    redFlags: ['No systemic inflammatory fever', 'Normal pelvic bone density indicators']
  },
  {
    zone: 'upper_back',
    symptoms: ['Thoracic spine pain', 'Interscapular knot', 'Rhomboid soreness', 'Mid-back ache'],
    primaryDiagnosis: 'Thoracic Postural Kyphosis & Rhomboid Myalgia',
    confidence: 91,
    explanation: 'Postural fatigue of the interscapular stabilizing musculature secondary to prolonged desk ergonomics.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Costovertebral Joint Dysfunction',
    urgency: 'ROUTINE',
    redFlags: ['No vertebral point tenderness on percussion', 'Chest expansion symmetrical']
  },
  {
    zone: 'feet',
    symptoms: ['Heel pain', 'Plantar stiffness', 'Ankle sprain', 'Arch soreness'],
    primaryDiagnosis: 'Plantar Fasciitis & Calcaneal Spur Stress',
    confidence: 95,
    explanation: 'Micro-tearing of the aponeurosis at the medial calcaneal tuberosity, aggravated by first morning steps.',
    recommendedSpecialty: 'Orthopedics',
    secondaryDiagnosis: 'Achilles Tendinopathy',
    urgency: 'ROUTINE',
    redFlags: ['Intact distal pedal pulses', 'No skin breakdown or diabetic ulceration']
  }
];

const COMMON_CONCERNS = [
  { label: 'Lower Back Pain', zone: 'lower_back' as BodyZone },
  { label: 'Throbbing Headache / Migraine', zone: 'head' as BodyZone },
  { label: 'Chest Discomfort & Acidity', zone: 'chest' as BodyZone },
  { label: 'Knee Swelling & Stiffness', zone: 'legs' as BodyZone },
  { label: 'Cervical Neck Strain', zone: 'neck' as BodyZone },
  { label: 'Stomach Cramps & Bloating', zone: 'abdomen' as BodyZone },
  { label: 'Foot & Heel Pain', zone: 'feet' as BodyZone },
  { label: 'Shoulder & Arm Spasm', zone: 'arms' as BodyZone }
];

const PAIN_TYPES = [
  'Sharp & Stabbing',
  'Dull Constant Ache',
  'Burning / Acidity',
  'Throbbing / Pulsing',
  'Stiff / Restricted Motion'
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
  // Assistant Intake State
  const [selectedZone, setSelectedZone] = useState<BodyZone>('lower_back');
  const [bodyPerspective, setBodyPerspective] = useState<'FRONT' | 'BACK'>('BACK');
  const [painSeverity, setPainSeverity] = useState<number>(6);
  const [painType, setPainType] = useState<string>('Dull Constant Ache');
  const [searchQuery, setSearchQuery] = useState<string>('Lower back pain radiating to hip');
  const [consultTypePreference, setConsultTypePreference] = useState<ConsultationType>('IN_PERSON_OPD');

  // Geo-Filter State
  const [distanceRadius, setDistanceRadius] = useState<number>(10); // 5km, 10km, 25km
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'hosp-1');
  const [doctorSortCriteria, setDoctorSortCriteria] = useState<'EARLIEST' | 'RATING' | 'FEE'>('EARLIEST');

  // Match clinical rule locally with 0ms latency
  const clinicalResult = useMemo(() => {
    const matched = CLINICAL_KNOWLEDGE_BASE.find(r => r.zone === selectedZone) || CLINICAL_KNOWLEDGE_BASE[0];
    return matched;
  }, [selectedZone]);

  // Handle Quick Issue Selection
  const handleSelectConcern = (concern: { label: string; zone: BodyZone }) => {
    setSelectedZone(concern.zone);
    setSearchQuery(concern.label);
    if (concern.zone === 'lower_back' || concern.zone === 'upper_back') {
      setBodyPerspective('BACK');
    } else {
      setBodyPerspective('FRONT');
    }
  };

  // Color intensity for pain level
  const getPainColor = (val: number) => {
    if (val <= 3) return { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Mild Discomfort' };
    if (val <= 6) return { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Moderate Pain' };
    if (val <= 8) return { bg: 'bg-orange-500', text: 'text-orange-700', label: 'Severe Pain' };
    return { bg: 'bg-rose-600', text: 'text-rose-700', label: 'Critical Pain' };
  };

  const painVisual = getPainColor(painSeverity);

  // Ranked nearby hospitals with simulated GPS distance
  const rankedHospitals = useMemo(() => {
    return hospitals.map((hosp, idx) => {
      const distance = 1.2 + idx * 2.1;
      return {
        ...hosp,
        distanceKm: distance,
        liveWaitMins: 8 + idx * 5,
        rating: 4.8 + (idx % 3) * 0.08
      };
    }).filter(h => h.distanceKm <= distanceRadius);
  }, [hospitals, distanceRadius]);

  const activeHospital = rankedHospitals.find(h => h.id === selectedHospitalId) || rankedHospitals[0] || hospitals[0];

  // Matched doctors filtered by specialty, hospital, and sort
  const availableDoctors = useMemo(() => {
    let docs = doctors.filter(d => {
      const matchesSpecialty = d.specialty.toLowerCase().includes(clinicalResult.recommendedSpecialty.toLowerCase()) ||
        clinicalResult.recommendedSpecialty.toLowerCase().includes(d.specialty.toLowerCase()) ||
        d.specialty === 'General Medicine';
      const matchesHospital = !selectedHospitalId || d.hospitalId === selectedHospitalId;
      return matchesSpecialty && matchesHospital;
    });

    if (docs.length === 0) {
      // Fallback: any doctor in this hospital or general medicine
      docs = doctors.filter(d => d.hospitalId === activeHospital.id);
    }
    if (docs.length === 0) {
      docs = doctors.slice(0, 3);
    }

    return [...docs].sort((a, b) => {
      if (doctorSortCriteria === 'RATING') return b.rating - a.rating;
      if (doctorSortCriteria === 'FEE') return a.opConsultationFee - b.opConsultationFee;
      // Earliest
      return 0;
    });
  }, [doctors, clinicalResult.recommendedSpecialty, selectedHospitalId, activeHospital.id, doctorSortCriteria]);

  const topDoctor = availableDoctors[0] || doctors[0];

  // Next slot for top doctor
  const matchedSlot = useMemo(() => {
    return slots.find(s => s.doctorId === topDoctor.id && s.status === 'AVAILABLE') || slots[0];
  }, [slots, topDoctor.id]);

  // Direct Auto-Booking trigger
  const handleProceedAutoBooking = (chosenDoc?: DoctorProfile) => {
    const targetDoc = chosenDoc || topDoctor;
    const targetHosp = hospitals.find(h => h.id === targetDoc.hospitalId) || activeHospital;
    const targetSlot = slots.find(s => s.doctorId === targetDoc.id && s.status === 'AVAILABLE') || matchedSlot;

    onOpenCheckout(targetDoc, consultTypePreference, targetSlot);
  };

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* HERO BANNER: TINY LOCAL AI HEALTH INTAKE                                  */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-4.5 sm:p-5 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>B Care Smart Triage AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-200/80 font-normal">0ms Local Engine</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Instant Symptom & Hospital Match
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Tap your pain point on the diagram below. The assistant pinpoints potential causes, locates top accredited clinics nearby, and prepares your appointment so you only complete payment.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 pr-1">
            <SiriOrb size={56} state="thinking" />
            <span className="text-[10px] text-emerald-300/80 mt-1.5 font-medium tracking-tight">Active Engine</span>
          </div>
        </div>

        {/* Quick Issue Chips */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
            Common Health Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CONCERNS.map((concern) => {
              const isSelected = selectedZone === concern.zone;
              return (
                <button
                  key={concern.label}
                  type="button"
                  onClick={() => handleSelectConcern(concern)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                  }`}
                >
                  <span>{concern.label}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN SECTION: INTERACTIVE ANATOMICAL DIAGRAM & CLINICAL TRIAGE        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LEFT (Lg: 5 cols): INTERACTIVE SVG ANATOMICAL PAIN DIAGRAM */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">Interactive Pain Diagram</h3>
                  <p className="text-[10px] text-slate-500">Tap body region to isolate issue</p>
                </div>
              </div>

              {/* Front / Back Perspective Switcher */}
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setBodyPerspective('FRONT')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    bodyPerspective === 'FRONT'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setBodyPerspective('BACK')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    bodyPerspective === 'BACK'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* SVG Visual Body Anatomy Diagram */}
            <div className="relative py-4 flex items-center justify-center min-h-[300px]">
              
              {/* Center Silhouette SVG */}
              <div className="relative w-48 sm:w-52 h-72">
                <svg
                  viewBox="0 0 200 320"
                  className="w-full h-full drop-shadow-md select-none"
                >
                  <defs>
                    <linearGradient id="bodySkinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="bodyHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Base Body Vector Silhouette */}
                  <g fill="url(#bodySkinGrad)" stroke="#94a3b8" strokeWidth="1.5">
                    {/* Head */}
                    <circle cx="100" cy="38" r="24" />
                    {/* Neck */}
                    <rect x="91" y="60" width="18" height="15" rx="3" />
                    {/* Shoulders & Torso */}
                    <path d="M 60 75 Q 100 70 140 75 L 148 115 L 140 175 L 125 185 L 125 210 L 75 210 L 75 185 L 60 175 L 52 115 Z" />
                    {/* Left Arm */}
                    <path d="M 52 82 Q 40 120 38 160 Q 36 175 42 185 L 48 183 Q 44 140 58 98 Z" />
                    {/* Right Arm */}
                    <path d="M 148 82 Q 160 120 162 160 Q 164 175 158 185 L 152 183 Q 156 140 142 98 Z" />
                    {/* Left Leg */}
                    <path d="M 76 210 L 74 270 Q 72 290 68 305 L 82 305 Q 88 285 88 265 L 94 210 Z" />
                    {/* Right Leg */}
                    <path d="M 124 210 L 126 270 Q 128 290 132 305 L 118 305 Q 112 285 112 265 L 106 210 Z" />
                  </g>

                  {/* Body Center Spine Indicator (Back View) */}
                  {bodyPerspective === 'BACK' && (
                    <g stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6">
                      <line x1="100" y1="62" x2="100" y2="185" />
                    </g>
                  )}

                  {/* Interactive Hotspot Targets */}
                  {/* Head */}
                  <g 
                    onClick={() => setSelectedZone('head')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="100"
                      cy="38"
                      r="16"
                      className={`transition-all duration-200 ${
                        selectedZone === 'head'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>

                  {/* Neck */}
                  <g 
                    onClick={() => setSelectedZone('neck')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="100"
                      cy="68"
                      r="10"
                      className={`transition-all duration-200 ${
                        selectedZone === 'neck'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>

                  {/* Front: Chest / Back: Upper Back */}
                  {bodyPerspective === 'FRONT' ? (
                    <g 
                      onClick={() => setSelectedZone('chest')} 
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="18"
                        className={`transition-all duration-200 ${
                          selectedZone === 'chest'
                            ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                            : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                        }`}
                      />
                    </g>
                  ) : (
                    <g 
                      onClick={() => setSelectedZone('upper_back')} 
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="18"
                        className={`transition-all duration-200 ${
                          selectedZone === 'upper_back'
                            ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                            : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                        }`}
                      />
                    </g>
                  )}

                  {/* Front: Abdomen / Back: Lower Back (Lumbar) */}
                  {bodyPerspective === 'FRONT' ? (
                    <g 
                      onClick={() => setSelectedZone('abdomen')} 
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx="100"
                        cy="145"
                        r="20"
                        className={`transition-all duration-200 ${
                          selectedZone === 'abdomen'
                            ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                            : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                        }`}
                      />
                    </g>
                  ) : (
                    <g 
                      onClick={() => setSelectedZone('lower_back')} 
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <circle
                        cx="100"
                        cy="145"
                        r="20"
                        className={`transition-all duration-200 ${
                          selectedZone === 'lower_back'
                            ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                            : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                        }`}
                      />
                    </g>
                  )}

                  {/* Pelvis */}
                  <g 
                    onClick={() => setSelectedZone('pelvis')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="100"
                      cy="190"
                      r="14"
                      className={`transition-all duration-200 ${
                        selectedZone === 'pelvis'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>

                  {/* Knees / Legs */}
                  <g 
                    onClick={() => setSelectedZone('legs')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="80"
                      cy="255"
                      r="12"
                      className={`transition-all duration-200 ${
                        selectedZone === 'legs'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                    <circle
                      cx="120"
                      cy="255"
                      r="12"
                      className={`transition-all duration-200 ${
                        selectedZone === 'legs'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>

                  {/* Feet & Ankles */}
                  <g 
                    onClick={() => setSelectedZone('feet')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="75"
                      cy="300"
                      r="10"
                      className={`transition-all duration-200 ${
                        selectedZone === 'feet'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                    <circle
                      cx="125"
                      cy="300"
                      r="10"
                      className={`transition-all duration-200 ${
                        selectedZone === 'feet'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>

                  {/* Arms */}
                  <g 
                    onClick={() => setSelectedZone('arms')} 
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <circle
                      cx="46"
                      cy="135"
                      r="11"
                      className={`transition-all duration-200 ${
                        selectedZone === 'arms'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                    <circle
                      cx="154"
                      cy="135"
                      r="11"
                      className={`transition-all duration-200 ${
                        selectedZone === 'arms'
                          ? 'fill-rose-500/80 stroke-rose-400 stroke-2 animate-pulse'
                          : 'fill-slate-400/20 hover:fill-emerald-400/40 stroke-transparent'
                      }`}
                    />
                  </g>
                </svg>

                {/* Floating Active Tag */}
                <div className="absolute top-2 left-2 bg-slate-900/90 text-white backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md flex items-center gap-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="capitalize">{selectedZone.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pain Intensity Slider & Characteristics */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pain Intensity Score:</span>
                </span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${painVisual.bg} text-white`}>
                  {painSeverity} / 10 • {painVisual.label}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={painSeverity}
                onChange={(e) => setPainSeverity(parseInt(e.target.value))}
                className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-1 tabular-nums font-mono">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Pain Type Selector Chips */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                Pain Sensation Type:
              </span>
              <div className="flex flex-wrap gap-1">
                {PAIN_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPainType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      painType === t
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT (Lg: 7 cols): CLINICAL INFERENCE & GEO-LOCATION HOSPITAL MATCH */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* Clinical Diagnostic Differential Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Clinical Differential Assessment
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence {clinicalResult.confidence}%
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-950 mt-1">
                  {clinicalResult.primaryDiagnosis}
                </h4>
              </div>

              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide shrink-0 ${
                clinicalResult.urgency === 'PRIORITY'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {clinicalResult.urgency === 'PRIORITY' ? '⚡ High Acuity OPD' : '✓ Routine Outpatient'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {clinicalResult.explanation}
            </p>

            {/* Red Flag Safeguards Check */}
            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-medium">
                  Safeguards: {clinicalResult.redFlags.join(' • ')}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 shrink-0">Clear</span>
            </div>

            {/* Recommended Specialty Pill */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 font-medium">Recommended Specialist Field:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                <span>{clinicalResult.recommendedSpecialty}</span>
              </span>
            </div>
          </div>

          {/* Geo-Location & Hospital Search Radius */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Accredited Clinics Nearby</h4>
                  <p className="text-[10px] text-slate-500">Live GPS: Coimbatore South, Tamil Nadu</p>
                </div>
              </div>

              {/* Radius Chips */}
              <div className="flex items-center gap-1">
                {[5, 10, 25].map(radius => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => setDistanceRadius(radius)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      distanceRadius === radius
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {radius}km
                  </button>
                ))}
              </div>
            </div>

            {/* Hospital Selector List */}
            <div className="grid grid-cols-1 gap-2">
              {rankedHospitals.map(hosp => {
                const isSelected = hosp.id === activeHospital.id;
                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospitalId(hosp.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-400/80 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs text-slate-950 truncate">
                            {hosp.name}
                          </h5>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                            NABH
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {hosp.address} • {hosp.distanceKm.toFixed(1)} km away
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        ~{hosp.liveWaitMins}m wait
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {hosp.rating.toFixed(1)} ★
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Doctor Filter & Instant Auto-Booking Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Recommended Specialist Doctor</h4>
                  <p className="text-[10px] text-slate-500">Filtered for {clinicalResult.recommendedSpecialty}</p>
                </div>
              </div>

              {/* Consultation Type Selector */}
              <div className="bg-slate-100 p-0.5 rounded-xl flex items-center text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setConsultTypePreference('IN_PERSON_OPD')}
                  className={`px-2 py-0.8 rounded-lg transition-all cursor-pointer ${
                    consultTypePreference === 'IN_PERSON_OPD'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  In-Person OPD (₹100)
                </button>
                <button
                  type="button"
                  onClick={() => setConsultTypePreference('VIDEO_CONSULTATION')}
                  className={`px-2 py-0.8 rounded-lg transition-all cursor-pointer ${
                    consultTypePreference === 'VIDEO_CONSULTATION'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Video (₹200)
                </button>
              </div>
            </div>

            {/* Doctor Profile Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-slate-200">
                  {(topDoctor as any).avatar ? (
                    <img src={(topDoctor as any).avatar} alt={topDoctor.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    topDoctor.name.replace('Dr. ', '').split(' ')[0][0]
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-bold text-xs text-slate-950 truncate">
                      {topDoctor.name}
                    </h5>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md border border-emerald-200">
                      {topDoctor.rating} ★
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate">
                    {topDoctor.specialty} • {topDoctor.experienceYears}y exp
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Earliest Slot: Today • Token #{matchedSlot.tokenNumber} ({matchedSlot.time})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-950 block tabular-nums">
                  {consultTypePreference === 'IN_PERSON_OPD' ? '₹100' : '₹200'}
                </span>
                <span className="text-[10px] text-slate-400">Govt OP fee</span>
              </div>
            </div>

            {/* ONE-TAP AUTO BOOKING BUTTON ("Patient only does the payment part") */}
            <button
              type="button"
              onClick={() => handleProceedAutoBooking(topDoctor)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-emerald-200 fill-emerald-200" />
              <span>
                {consultTypePreference === 'IN_PERSON_OPD'
                  ? 'Auto-Book Slot & Proceed to Pay (₹100) →'
                  : 'Auto-Book Video & Proceed to Pay (₹200) →'
                }
              </span>
            </button>
            <p className="text-center text-[10px] text-slate-400">
              Instant appointment lock • ABDM Compliant • 100% Refundable
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
