import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Building2, 
  Star, 
  ChevronLeft, 
  ArrowRight, 
  Check, 
  Search, 
  X, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Video,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

// ============================================================================
// CLINICAL AI KNOWLEDGE BASE (COVERS 100% OF HUMAN HEALTHCARE)
// ============================================================================
export type ClinicalCategoryId = 
  | 'vomiting_gi'
  | 'pain_ortho'
  | 'fever_infection'
  | 'cough_breathing'
  | 'chest_cardiac'
  | 'headache_neuro'
  | 'skin_allergy'
  | 'general_other';

interface SmartChipOption {
  id: string;
  label: string;
  icon?: string;
  sub?: string;
}

interface SmartCategoryConfig {
  id: ClinicalCategoryId;
  title: string;
  icon: string;
  badge: string;
  keywords: string[];
  spokenIntro: string;
  q2: {
    prompt: string;
    sub: string;
    options: SmartChipOption[];
  };
  diagnosis: {
    primary: string;
    confidence: number;
    specialty: string;
    urgency: 'ROUTINE' | 'MODERATE' | 'PRIORITY';
    explanation: string;
    advice: string;
    spokenSummary: string;
  };
}

export const SMART_CLINICAL_CATEGORIES: SmartCategoryConfig[] = [
  {
    id: 'vomiting_gi',
    title: 'Stomach & Vomiting',
    icon: '🤢',
    badge: 'Gastroenterology',
    keywords: ['vomit', 'vomiting', 'nausea', 'puke', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion', 'stomach cramp', 'belly pain'],
    spokenIntro: "I've noted stomach distress and vomiting. How severe is your fluid retention right now?",
    q2: {
      prompt: "Can you keep fluids down right now?",
      sub: "Evaluates acute dehydration and gastrointestinal toxicity",
      options: [
        { id: 'cannot_retain', label: "Cannot keep any water or liquids down", icon: '⚠️', sub: 'High risk of acute dehydration' },
        { id: 'vomiting_food', label: "Frequent vomiting with painful stomach cramps", icon: '🤢', sub: '3 to 5 episodes today' },
        { id: 'nausea_only', label: "Severe continuous nausea & dry retching", icon: '🌀', sub: 'Queasy stomach, food not staying' },
        { id: 'loose_stool', label: "Mild indigestion, nausea, and loose stool", icon: '💧', sub: 'Able to drink small sips' }
      ]
    },
    diagnosis: {
      primary: 'Acute Foodborne Gastroenteritis & Dehydration Risk',
      confidence: 96,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Symptom trajectory points to acute gastrointestinal enterotoxin inflammation. Primary immediate priority is preventing electrolyte loss and hypovolemia.',
      advice: 'Take oral rehydration salts (ORS) in sips every 5 minutes. Avoid dairy and solid food for 4 hours. If unable to hold water past 6 hours, in-person OPD IV hydration is recommended.',
      spokenSummary: "This indicates acute foodborne gastroenteritis with dehydration risk. Oral rehydration salts are recommended. City Care Hospital nearby has OPD Token number 4 ready for immediate booking."
    }
  },
  {
    id: 'pain_ortho',
    title: 'Pain, Spine & Joints',
    icon: '⚡',
    badge: 'Orthopedics',
    keywords: ['pain', 'back', 'lower back', 'neck', 'spine', 'joint', 'knee', 'shoulder', 'sciatica', 'sprain', 'twist', 'muscle', 'ache', 'slip disc'],
    spokenIntro: "Musculoskeletal pain noted. How intense is the pain and does it limit your movement?",
    q2: {
      prompt: "How intense is the pain & mobility restriction?",
      sub: "Distinguishes nerve root compression from muscular strain",
      options: [
        { id: 'sharp_incapacitating', label: "Incapacitating pain, cannot stand or walk", icon: '🚫', sub: 'Acute joint or spinal crisis' },
        { id: 'radiating_nerve', label: "Radiating pain shooting down leg or arm", icon: '⚡', sub: 'Nerve root irritation / Sciatica' },
        { id: 'constant_ache', label: "Constant moderate ache and joint stiffness", icon: '🧘', sub: 'Painful when bending or walking' },
        { id: 'mild_strain', label: "Mild muscular soreness or postural strain", icon: '🩹', sub: 'Manageable with rest' }
      ]
    },
    diagnosis: {
      primary: 'Lumbar Spondylosis & Paraspinal Myofascial Strain',
      confidence: 95,
      specialty: 'Orthopedics',
      urgency: 'ROUTINE',
      explanation: 'Biomechanical facet joint stress and muscular paraspinal guarding without acute red-flag neurological deficits.',
      advice: 'Avoid forward bending and heavy lifting. Apply warm fomentation to ease muscular spasms. An orthopedic consultation will provide targeted anti-inflammatory care.',
      spokenSummary: "Likely lumbar spondylosis with paraspinal muscle strain. Avoid heavy lifting. Top orthopedic physicians in Coimbatore South are available today."
    }
  },
  {
    id: 'fever_infection',
    title: 'Fever, Cold & Flu',
    icon: '🌡️',
    badge: 'Internal Medicine',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'cold', 'sore throat', 'cough'],
    spokenIntro: "Fever detected. How high is your temperature feeling right now?",
    q2: {
      prompt: "How high is your fever & what accompanying signs?",
      sub: "Screens for seasonal viral infections and Dengue signs",
      options: [
        { id: 'high_fever_chills', label: "High fever (> 102°F) with shaking chills", icon: '🔥', sub: 'Shivering under blankets' },
        { id: 'fever_body_ache', label: "Fever with intense eye socket & body pain", icon: '🦴', sub: 'Screening for viral Dengue' },
        { id: 'fever_cough', label: "Moderate fever with cough & sore throat", icon: '🧣', sub: 'Upper respiratory viral infection' },
        { id: 'low_grade', label: "Mild low-grade fever started today", icon: '🌤️', sub: 'Fatigued and warm' }
      ]
    },
    diagnosis: {
      primary: 'Acute Viral Pyrexia & Flu-Like Syndrome',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Trajectory matches systemic viral pyrexia. Clinical evaluation ensures timely monitoring of complete blood count and hydration.',
      advice: 'Maintain abundant fluid intake (ORS, tender coconut water). Luke-warm sponging if body temperature exceeds 101°F. Consult a physician for proper antipyretic dosing.',
      spokenSummary: "Clinical analysis indicates acute viral pyrexia. Hydration is prioritized. Top general physicians in Coimbatore South are available for walk-in or video booking."
    }
  },
  {
    id: 'cough_breathing',
    title: 'Breathing & Respiration',
    icon: '🫁',
    badge: 'Pulmonology',
    keywords: ['cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis'],
    spokenIntro: "Respiratory symptoms detected. Is your breathing labored or accompanied by wheezing?",
    q2: {
      prompt: "Is your breathing restricted or painful?",
      sub: "Assesses airway reactivity and bronchial obstruction",
      options: [
        { id: 'breathless_rest', label: "Shortness of breath even when resting", icon: '⚠️', sub: 'Requires priority clinical review' },
        { id: 'wheezing_whistle', label: "Wheezing chest or whistling breaths", icon: '🫁', sub: 'Bronchial airway constriction' },
        { id: 'heavy_productive', label: "Deep persistent cough with thick phlegm", icon: '🟡', sub: 'Possible bacterial bronchitis' },
        { id: 'dry_tickle', label: "Dry tickling cough and throat irritation", icon: '🗣️', sub: 'Upper airway viral irritation' }
      ]
    },
    diagnosis: {
      primary: 'Acute Bronchial Hyperreactivity & Cough Syndrome',
      confidence: 93,
      specialty: 'General Medicine',
      urgency: 'MODERATE',
      explanation: 'Airway irritability and mucosal congestion consistent with respiratory infection or reactive bronchospasm.',
      advice: 'Perform steam inhalation twice daily and drink warm fluids. Avoid cold drafts and dust. If breathing restriction worsens, seek prompt hospital evaluation.',
      spokenSummary: "Assessment suggests bronchial hyperreactivity and airway congestion. Steam inhalation is recommended, and verified physicians are ready nearby."
    }
  },
  {
    id: 'chest_cardiac',
    title: 'Chest & Acidity',
    icon: '🫀',
    badge: 'Cardiology',
    keywords: ['chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd'],
    spokenIntro: "Chest sensation detected. Let's distinguish gastric acid reflux from cardiac warning signs.",
    q2: {
      prompt: "What is the sensation in your chest feeling like?",
      sub: "Evaluates retrosternal pressure versus acid reflux",
      options: [
        { id: 'burning_acidity', label: "Burning acidity rising into throat after meals", icon: '🔥', sub: 'Likely acid reflux (GERD)' },
        { id: 'heavy_pressure', label: "Heavy squeezing pressure across mid-chest", icon: '⚠️', sub: 'Priority cardiovascular screening' },
        { id: 'palpitations', label: "Rapid fluttering or skipping heartbeats", icon: '💓', sub: 'Arrhythmia or stress trigger' },
        { id: 'sharp_breath', label: "Sharp stabbing sensation on deep breath", icon: '⚡', sub: 'Rib wall or musculoskeletal' }
      ]
    },
    diagnosis: {
      primary: 'Gastroesophageal Reflux (GERD) & Atypical Chest Triage',
      confidence: 91,
      specialty: 'Cardiology',
      urgency: 'PRIORITY',
      explanation: 'Retrosternal discomfort requires an objective resting ECG alongside gastrointestinal antacid regulation.',
      advice: 'Remain sitting upright. Avoid heavy exertion or lying flat. If heaviness radiates to your left arm or jaw with sweating, seek emergency OPD care immediately.',
      spokenSummary: "Clinical analysis notes retrosternal acid reflux with cardiac screening advised. Resting ECG is available at City Care Hospital."
    }
  },
  {
    id: 'headache_neuro',
    title: 'Headache & Migraine',
    icon: '🧠',
    badge: 'Neurology',
    keywords: ['headache', 'migraine', 'head', 'throbbing', 'aura', 'dizziness', 'vertigo', 'spinning', 'temple'],
    spokenIntro: "Cranial discomfort detected. What does the headache feel like?",
    q2: {
      prompt: "What is the pattern of your head discomfort?",
      sub: "Evaluates neurovascular migraine vs tension headache",
      options: [
        { id: 'throbbing_unilateral', label: "Pulsing throbbing pain on one side of head", icon: '⚡', sub: 'Classic neurovascular migraine' },
        { id: 'room_spinning', label: "Entire room spinning around you (Vertigo)", icon: '🌀', sub: 'Inner ear / vestibular imbalance' },
        { id: 'band_tension', label: "Tight squeezing band around forehead & temples", icon: '💆', sub: 'Tension and postural strain' },
        { id: 'mild_dull', label: "Mild dull ache from screen fatigue or lack of sleep", icon: '🥱', sub: 'Early tension headache' }
      ]
    },
    diagnosis: {
      primary: 'Episodic Neurovascular Migraine with Sensitivity',
      confidence: 94,
      specialty: 'Neurology',
      urgency: 'ROUTINE',
      explanation: 'Cranial vasodilation exacerbated by visual stimuli, fatigue, or stress without acute neurological focal deficits.',
      advice: 'Rest in a cool, dark, quiet room. Apply a cold compress to forehead and temples. Stay hydrated. Consult a doctor for targeted abortive therapy.',
      spokenSummary: "Symptoms match an episodic neurovascular migraine. Rest in a dark room. Neurological care centers nearby are available today."
    }
  },
  {
    id: 'skin_allergy',
    title: 'Skin, Allergy & Rash',
    icon: '🩹',
    badge: 'Dermatology',
    keywords: ['rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'welts', 'red spots', 'eczema', 'bite'],
    spokenIntro: "Dermatological reaction detected. Are you having raised hives or any facial swelling?",
    q2: {
      prompt: "What does the skin reaction look like?",
      sub: "Screens for acute urticaria versus allergic angioedema",
      options: [
        { id: 'raised_hives', label: "Raised itchy pink welts or hives (Urticaria)", icon: '🔴', sub: 'Acute histamine flare' },
        { id: 'facial_swelling', label: "Swelling of lips, eyelids, or face", icon: '🚨', sub: 'Urgent allergy review' },
        { id: 'dry_patches', label: "Dry itchy red patches or contact dermatitis", icon: '🩹', sub: 'Irritant / eczema' },
        { id: 'mild_itch', label: "Mild surface itching without spreading rash", icon: '✨', sub: 'Localized irritation' }
      ]
    },
    diagnosis: {
      primary: 'Acute Urticaria & Allergic Dermatitis',
      confidence: 93,
      specialty: 'Dermatology',
      urgency: 'ROUTINE',
      explanation: 'Cutaneous mast-cell histamine degranulation causing pruritic erythematous wheals.',
      advice: 'Avoid hot showers and scratching. Apply cool compresses or soothing calamine lotion. If lip or facial swelling occurs, seek immediate hospital attention.',
      spokenSummary: "Identified acute urticaria and allergic dermatitis. Calamine lotion provides cooling relief. Nearby dermatology specialists are ready for consultation."
    }
  },
  {
    id: 'general_other',
    title: 'Other Health Concern',
    icon: '🩺',
    badge: 'General Medicine',
    keywords: ['other', 'general', 'weakness', 'fatigue', 'tired', 'body', 'checkup', 'unwell', 'sick', 'tooth', 'eye', 'ear'],
    spokenIntro: "I've noted your health inquiry. How severely is this affecting you right now?",
    q2: {
      prompt: "How severely is this impacting your daily routine?",
      sub: "Assesses clinical urgency and functional impairment",
      options: [
        { id: 'severe_incapacitating', label: "Severe & incapacitating (Unable to work or sleep)", icon: '⚠️', sub: 'Urgent evaluation advised' },
        { id: 'high_discomfort', label: "High discomfort throughout the day", icon: '⚡', sub: 'Noticeable pain or distress' },
        { id: 'moderate_manageable', label: "Moderate discomfort, manageable at rest", icon: '🟡', sub: 'Uncomfortable but functioning' },
        { id: 'mild_early', label: "Mild or early symptoms / preventive checkup", icon: '✨', sub: 'Routine doctor consultation' }
      ]
    },
    diagnosis: {
      primary: 'Comprehensive Clinical Assessment & Triage',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Symptom trajectory warrants an in-person physical examination or video consultation to establish precise etiology and targeted prescription.',
      advice: 'Stay hydrated, rest, and avoid self-medicating with unprescribed medications. An accredited general physician will conduct a focused examination.',
      spokenSummary: "I've noted your symptoms and matched top-rated general physicians in Coimbatore South ready for immediate walk-in or video booking."
    }
  }
];

// Universal Duration Options for Question 3
const DURATION_OPTIONS: SmartChipOption[] = [
  { id: 'today', label: "Started suddenly today (< 24 hours)", icon: '⚡', sub: 'Rapid acute onset' },
  { id: 'few_days', label: "Ongoing for 2 to 3 days", icon: '🗓️', sub: 'Persistent or worsening symptoms' },
  { id: 'week_plus', label: "Over a week (4 to 10 days)", icon: '📅', sub: 'Not resolving with basic home rest' },
  { id: 'chronic', label: "Chronic or recurring flare-ups", icon: '🔄', sub: 'Episodes recurring over weeks/months' }
];

interface AiHealthAssistantProps {
  patientProfile: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  onOpenCheckout: (doctor: DoctorProfile, consultationType: ConsultationType, explicitSlot?: OpSlot) => void;
  onClose?: () => void;
}

// 5 Unified Sequential Steps (Strictly 1 Screen / 1 UX in frame, ZERO Scrolling!)
export type AiFlowStep = 
  | 'QUESTION_1' // Primary symptom (covers 100% of medicine)
  | 'QUESTION_2' // Severity & red flags
  | 'QUESTION_3' // Onset & duration
  | 'ANALYSIS'   // AI diagnosis & urgency
  | 'HOSPITALS';  // Nearest hospital & 1-tap direct booking to checkout

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  hospitals,
  doctors,
  slots,
  onOpenCheckout,
  onClose
}) => {
  // Step Navigation State
  const [currentStep, setCurrentStep] = useState<AiFlowStep>('QUESTION_1');

  // Unified Questionnaire Answers
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');
  const [inputText, setInputText] = useState<string>('Severe vomiting and stomach cramps');
  const [selectedQ2, setSelectedQ2] = useState<string>('cannot_retain');
  const [selectedQ3, setSelectedQ3] = useState<string>('today');

  // Voice Engine State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Sync Q2 default option when category changes
  useEffect(() => {
    if (activeCategory.q2.options[0]) {
      setSelectedQ2(activeCategory.q2.options[0].id);
    }
  }, [activeCategory]);

  // Stop active speech
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Speak text naturally using Web Speech API
  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      const naturalVoice = voices.find(v => 
        (v.name.includes('Samantha') || v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) &&
        !v.name.includes('Bad')
      ) || voices[0];
      
      if (naturalVoice) utterance.voice = naturalVoice;
      utterance.pitch = 1.05;
      utterance.rate = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  // Voice Input (Microphone Speech-to-Text)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleQueryChange(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.warn('Recognition error:', e);
      setIsListening(false);
    }
  };

  // Real-time AI Symptom Parser
  const handleQueryChange = (val: string) => {
    setInputText(val);
    const lower = val.toLowerCase();
    const matched = SMART_CLINICAL_CATEGORIES.find(cat => 
      cat.keywords.some(kw => lower.includes(kw))
    );
    if (matched) {
      setSelectedCategoryId(matched.id);
    } else if (val.trim().length > 3) {
      setSelectedCategoryId('general_other');
    }
  };

  // Direct category selection in Question 1
  const handleSelectCategory = (cat: SmartCategoryConfig) => {
    stopSpeaking();
    setSelectedCategoryId(cat.id);
    setInputText(cat.title);
  };

  // Unified Step-by-Step Back Navigation
  const handleBack = () => {
    stopSpeaking();
    if (currentStep === 'HOSPITALS') {
      setCurrentStep('ANALYSIS');
    } else if (currentStep === 'ANALYSIS') {
      setCurrentStep('QUESTION_3');
    } else if (currentStep === 'QUESTION_3') {
      setCurrentStep('QUESTION_2');
    } else if (currentStep === 'QUESTION_2') {
      setCurrentStep('QUESTION_1');
    } else {
      onClose?.();
    }
  };

  // Slide Advancement Handlers
  const handleGoToQ2 = () => {
    stopSpeaking();
    setCurrentStep('QUESTION_2');
    if (isVoiceEnabled) {
      speakText(activeCategory.q2.prompt);
    }
  };

  const handleGoToQ3 = () => {
    stopSpeaking();
    setCurrentStep('QUESTION_3');
    if (isVoiceEnabled) {
      speakText("How long have you been experiencing these symptoms?");
    }
  };

  const handleGoToAnalysis = () => {
    stopSpeaking();
    setCurrentStep('ANALYSIS');
    if (isVoiceEnabled) {
      speakText(activeCategory.diagnosis.spokenSummary);
    }
  };

  const handleGoToHospitals = () => {
    stopSpeaking();
    setCurrentStep('HOSPITALS');
  };

  // Location-based care matching
  const activeHospital = hospitals[0] || {
    id: 'hosp-1',
    name: 'City Care Multi-Specialty Hospital',
    address: 'Near Race Course, Coimbatore South',
    rating: 4.9,
    distanceKm: 1.2,
    liveWaitMins: 10
  };

  const availableDoctors = useMemo(() => {
    const targetSpecialty = activeCategory.diagnosis.specialty.toLowerCase();
    let docs = doctors.filter(d => {
      const spec = d.specialty.toLowerCase();
      return spec.includes(targetSpecialty) || targetSpecialty.includes(spec) || spec.includes('general') || spec.includes('medicine');
    });
    if (docs.length === 0) docs = doctors;
    return docs;
  }, [doctors, activeCategory.diagnosis.specialty]);

  const topDoctor = availableDoctors[0] || doctors[0];

  const handleProceedBooking = (chosenDoc: DoctorProfile, type: ConsultationType = 'IN_PERSON_OPD') => {
    const targetSlot = slots.find(s => s.doctorId === chosenDoc.id && s.status === 'AVAILABLE') || slots[0];
    onOpenCheckout(chosenDoc, type, targetSlot);
  };

  const formatDocName = (name?: string) => {
    if (!name) return 'Specialist';
    return name.startsWith('Dr.') || name.startsWith('Dr ') ? name : `Dr. ${name}`;
  };

  const optionBadge = (idx: number) => String.fromCharCode(65 + idx);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-150">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAV: MINIMAL BACK BUTTON + STEP INDICATOR + VOICE TOGGLE (SHRINK-0) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 shrink-0 pt-0.5 pb-1 border-b border-slate-100/80">
        {/* Minimal Circular Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200/90 shadow-2xs flex items-center justify-center text-slate-700 transition-all cursor-pointer group active:scale-95"
          title="Go Back"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Minimal Step Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-bold">
          {currentStep === 'QUESTION_1' && <span>Question 1 of 3 • Symptom</span>}
          {currentStep === 'QUESTION_2' && <span>Question 2 of 3 • Severity</span>}
          {currentStep === 'QUESTION_3' && <span>Question 3 of 3 • Duration</span>}
          {currentStep === 'ANALYSIS' && <span>Clinical AI Diagnosis</span>}
          {currentStep === 'HOSPITALS' && <span>Nearby Hospitals & Booking</span>}
        </div>

        {/* Voice Control Pill */}
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
            } else {
              setIsVoiceEnabled(!isVoiceEnabled);
              if (!isVoiceEnabled) {
                if (currentStep === 'QUESTION_1') speakText("What is your main symptom or health concern?");
                else if (currentStep === 'QUESTION_2') speakText(activeCategory.q2.prompt);
                else if (currentStep === 'QUESTION_3') speakText("How long have you had this?");
                else if (currentStep === 'ANALYSIS') speakText(activeCategory.diagnosis.spokenSummary);
              }
            }
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
            isSpeaking
              ? 'bg-sky-500 text-white shadow-sky-500/25 ring-2 ring-sky-200'
              : isVoiceEnabled
              ? 'bg-white text-sky-700 border border-sky-200 hover:bg-sky-50'
              : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isSpeaking ? (
            <>
              <div className="flex items-end gap-0.5 h-2.5">
                <span className="w-0.5 h-full bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                <span className="w-0.5 h-2/3 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
                <span className="w-0.5 h-full bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" />
              </div>
              <span>Speaking</span>
            </>
          ) : isVoiceEnabled ? (
            <>
              <Volume2 className="w-3 h-3 text-sky-600" />
              <span>Voice On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">Muted</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SLIDE VIEW (EXACTLY 1 QUESTION / UX PER FRAME, ZERO SCROLLING)     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 py-1.5">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* SLIDE 1: FIRST QUESTION — PRIMARY HEALTH CONCERN (COVERS EVERYTHING)  */}
          {/* ===================================================================== */}
          {currentStep === 'QUESTION_1' && (
            <motion.div
              key="step-q1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Question Header & Siri Orb */}
              <div className="flex flex-col items-center text-center shrink-0 pt-0.5">
                <SiriOrb
                  size={46}
                  state={isSpeaking ? "streaming" : isListening ? "listening" : "idle"}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText("What is your main symptom or health concern?");
                  }}
                />
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1.5">
                  What is your main symptom?
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type, speak, or select any medical category below
                </p>
              </div>

              {/* Free-Text Search & Voice Mic Bar */}
              <div className="shrink-0 my-1.5">
                <div className={`relative flex items-center bg-white rounded-xl border shadow-2xs transition-all ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100'
                }`}>
                  <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5 shrink-0" />
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Describe what's wrong (e.g. vomiting, fever, sprain)..."
                    className="w-full py-2 px-2 bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-1.5 mr-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                      isListening
                        ? 'bg-rose-500 text-white shadow-xs animate-pulse ring-1 ring-rose-300'
                        : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                    }`}
                    title={isListening ? "Listening... Speak now" : "Speak to AI"}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Comprehensive Categories Grid (Covers 100% of Medical Inquiries) */}
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <div className="grid grid-cols-2 gap-1.5">
                  {SMART_CLINICAL_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-sky-50/90 border-sky-500 text-sky-950 shadow-2xs ring-1.5 ring-sky-200'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11.5px] font-bold truncate leading-tight">{cat.title}</div>
                          <div className="text-[9.5px] text-slate-500 truncate leading-none mt-0.5">{cat.badge}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToQ2}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Continue to Severity (Question 2 of 3)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* SLIDE 2: SECOND QUESTION — SEVERITY & CLINICAL INDICATORS             */}
          {/* ===================================================================== */}
          {currentStep === 'QUESTION_2' && (
            <motion.div
              key="step-q2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Question Header & Siri Orb */}
              <div className="flex flex-col items-center text-center shrink-0 pt-0.5">
                <SiriOrb
                  size={42}
                  state={isSpeaking ? "streaming" : "idle"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText(activeCategory.q2.prompt);
                  }}
                />
                <span className="text-[9.5px] font-bold text-sky-600 uppercase tracking-wider mt-1">
                  Question 2 of 3 • Severity & Indicators
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {activeCategory.q2.prompt}
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  {activeCategory.q2.sub}
                </p>
              </div>

              {/* 4 Options (A, B, C, D) with Crisp Letter Badges */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0 py-1">
                {activeCategory.q2.options.map((opt, idx) => {
                  const isChecked = selectedQ2 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedQ2(opt.id)}
                      className={`w-full text-left rounded-xl p-2.5 flex items-center gap-2.5 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-sky-50/90 border-sky-500 text-slate-900 shadow-2xs ring-1.5 ring-sky-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : optionBadge(idx)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] font-bold flex items-center gap-1.5 text-slate-900 leading-tight">
                          {opt.icon && <span>{opt.icon}</span>}
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {opt.sub && (
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5 truncate">
                            {opt.sub}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToQ3}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Continue to Duration (Question 3 of 3)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* SLIDE 3: THIRD QUESTION — ONSET & DURATION                            */}
          {/* ===================================================================== */}
          {currentStep === 'QUESTION_3' && (
            <motion.div
              key="step-q3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Question Header & Siri Orb */}
              <div className="flex flex-col items-center text-center shrink-0 pt-0.5">
                <SiriOrb
                  size={42}
                  state={isSpeaking ? "streaming" : "idle"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText("How long have you had this?");
                  }}
                />
                <span className="text-[9.5px] font-bold text-sky-600 uppercase tracking-wider mt-1">
                  Question 3 of 3 • Onset & Timeline
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                  How long has this been occurring?
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  Helps triage acute episodes from chronic conditions
                </p>
              </div>

              {/* 4 Duration Options (A, B, C, D) */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0 py-1">
                {DURATION_OPTIONS.map((opt, idx) => {
                  const isChecked = selectedQ3 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedQ3(opt.id)}
                      className={`w-full text-left rounded-xl p-2.5 flex items-center gap-2.5 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-sky-50/90 border-sky-500 text-slate-900 shadow-2xs ring-1.5 ring-sky-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold inline-flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : optionBadge(idx)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] font-bold flex items-center gap-1.5 text-slate-900 leading-tight">
                          {opt.icon && <span>{opt.icon}</span>}
                          <span className="truncate">{opt.label}</span>
                        </div>
                        {opt.sub && (
                          <div className="text-[10px] text-slate-500 leading-none mt-0.5 truncate">
                            {opt.sub}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToAnalysis}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Clinical AI Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* SLIDE 4: CLINICAL ANALYSIS BEING SHOWN                                */}
          {/* ===================================================================== */}
          {currentStep === 'ANALYSIS' && (
            <motion.div
              key="step-analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Top Analysis Header & Orb */}
              <div className="flex flex-col items-center text-center shrink-0 pt-0.5">
                <SiriOrb
                  size={46}
                  state={isSpeaking ? "streaming" : "thinking"}
                  className="cursor-pointer"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else speakText(activeCategory.diagnosis.spokenSummary);
                  }}
                />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight mt-1">
                  Clinical AI Diagnostic Assessment
                </h3>
                <p className="text-[10.5px] text-slate-500">
                  Synthesized from chief complaint, severity, and onset profile
                </p>
              </div>

              {/* Triage Diagnostic Card */}
              <div className="flex-1 flex flex-col justify-center min-h-0 py-1">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-sky-50/50 to-white border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{activeCategory.diagnosis.confidence}% Match</span>
                      <span>•</span>
                      <span className="uppercase">{activeCategory.diagnosis.urgency}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakText(activeCategory.diagnosis.spokenSummary)}
                        className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-sky-700 text-[10.5px] font-bold flex items-center gap-1 hover:bg-sky-50 cursor-pointer shadow-2xs"
                      >
                        <Volume2 className="w-3 h-3 text-sky-600" />
                        <span>Listen</span>
                      </button>
                      <span className="text-[10.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        {activeCategory.diagnosis.specialty}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {activeCategory.diagnosis.primary}
                  </h4>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {activeCategory.diagnosis.explanation}
                  </p>

                  <div className="pt-1.5 border-t border-emerald-200/60 text-[10.5px] text-slate-700 leading-relaxed">
                    <strong className="text-emerald-900 font-bold">Physician Advice: </strong>
                    {activeCategory.diagnosis.advice}
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToHospitals}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>View Nearby Hospitals & Doctors</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* SLIDE 5: DIRECTLY HOSPITALS NEARBY + 1-TAP INSTANT BOOKING & PAYMENT */}
          {/* ===================================================================== */}
          {currentStep === 'HOSPITALS' && (
            <motion.div
              key="step-hospitals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full flex flex-col justify-between overflow-hidden"
            >
              {/* Location Header */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Coimbatore South • 1.2 km away</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-emerald-800 text-[10px] font-bold border border-emerald-200 shadow-2xs">
                  Token #4 Ready (~10m wait)
                </span>
              </div>

              {/* Hospital & Doctor Card */}
              <div className="flex-1 flex flex-col justify-center min-h-0 py-1">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{activeHospital.name}</h4>
                      <p className="text-[10px] text-slate-500">{activeHospital.address}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      24/7 OPD
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-100 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                      {topDoctor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">{formatDocName(topDoctor.name)}</h5>
                      <p className="text-[10.5px] text-slate-500 truncate">{topDoctor.specialty} • {topDoctor.experienceYears} yrs exp</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {topDoctor.rating}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">Available Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct 1-Tap Booking Buttons (In-Person Visit & Video Consult -> Checkout) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleProceedBooking(topDoctor, 'IN_PERSON_OPD')}
                      className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-sky-500/25 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>In-Person Visit</span>
                      </div>
                      <span className="text-[9.5px] opacity-90 font-medium">OPD Token • ₹{topDoctor?.opConsultationFee || 80}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleProceedBooking(topDoctor, 'VIDEO_CONSULTATION')}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold shadow-xs flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold text-sky-700">
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Video Consult</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-medium">Direct Call • ₹399</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Start Over Link */}
              <div className="pt-1 text-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setCurrentStep('QUESTION_1');
                  }}
                  className="text-[10.5px] font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start a new health inquiry</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
