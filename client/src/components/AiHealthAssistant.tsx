import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronLeft,
  AlertTriangle,
  Flame,
  Droplet,
  Send,
  Bot,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Video
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';
import { QuestionTool, QuestionConfig, QuestionToolPart, QuestionAnswer } from './QuestionTool';

// ============================================================================
// CLINICAL AI KNOWLEDGE BASE (MULTI-SYMPTOM INTELLIGENCE)
// ============================================================================
export type ClinicalCategoryId = 
  | 'vomiting_gi'
  | 'fever_infection'
  | 'cough_breathing'
  | 'headache_neuro'
  | 'chest_cardiac'
  | 'pain_ortho'
  | 'skin_allergy'
  | 'urinary_kidney'
  | 'dizziness_vertigo';

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
  aiGreeting: string;
  spokenIntro: string;
  q1: {
    prompt: string;
    options: SmartChipOption[];
  };
  q2: {
    prompt: string;
    options: SmartChipOption[];
  };
  diagnosis: {
    primary: string;
    confidence: number;
    specialty: string;
    secondary: string;
    urgency: 'ROUTINE' | 'ELEVATED' | 'PRIORITY';
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
    keywords: ['vomit', 'vomiting', 'nausea', 'puke', 'puking', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion', 'stomach ache', 'belly pain'],
    aiGreeting: "I've noted acute vomiting and stomach distress. Let's evaluate your fluid retention and likely triggers with two quick clinical questions.",
    spokenIntro: "I've noted acute vomiting and stomach distress. Can you keep any water down right now?",
    q1: {
      prompt: "Can you keep fluids down right now?",
      options: [
        { id: 'cannot_retain', label: "Cannot keep any water or fluids down", icon: '⚠️', sub: 'High risk of acute dehydration' },
        { id: 'vomiting_food', label: "Throwing up food and clear bile", icon: '🤢', sub: '3 to 5 times today' },
        { id: 'nausea_only', label: "Severe nausea with dry retching", icon: '🌀', sub: 'Queasy stomach, no food staying' },
        { id: 'dark_blood', label: "Dark or blood-tinged vomit", icon: '🚨', sub: 'Requires immediate emergency review' }
      ]
    },
    q2: {
      prompt: "When did it start, and what was the likely trigger?",
      options: [
        { id: 'after_meal', label: "1 to 6 hours after outside restaurant food", icon: '🍔', sub: 'Classic foodborne enterotoxin' },
        { id: 'started_today', label: "Started suddenly earlier today", icon: '⏱️', sub: 'Acute stomach irritation' },
        { id: 'few_days', label: "Ongoing for 2 to 3 days", icon: '🗓️', sub: 'Persistent infectious gastroenteritis' },
        { id: 'chronic_flare', label: "Recurrent episodes over weeks", icon: '🔄', sub: 'Chronic acid peptic disorder' }
      ]
    },
    diagnosis: {
      primary: 'Acute Foodborne Gastroenteritis & Dehydration Risk',
      confidence: 95,
      specialty: 'General Medicine',
      secondary: 'Staphylococcal / Enterotoxin Triage',
      urgency: 'PRIORITY',
      explanation: 'Symptom profile indicates acute gastrointestinal mucosal inflammation. Immediate priority is preventing systemic electrolyte imbalance and hypovolemia.',
      advice: 'Take oral rehydration salts (ORS) in small sips every 5 minutes. Avoid milk, solid dairy, or oily foods. If unable to retain liquids for over 6 hours, an in-person OPD token is recommended for IV fluid hydration.',
      spokenSummary: "Based on your symptoms, this strongly points to acute foodborne gastroenteritis with dehydration risk. I've matched City Care Multi-Specialty Hospital 1.2 kilometers away with Token number 4 ready for booking."
    }
  },
  {
    id: 'fever_infection',
    title: 'High Fever & Chills',
    icon: '🌡️',
    badge: 'Internal Medicine',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'shivers', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'pyrexia', 'sweat'],
    aiGreeting: "Fever detected. Let's evaluate your temperature severity and check for Dengue or viral warning signs.",
    spokenIntro: "Fever detected. How high is your temperature feeling right now?",
    q1: {
      prompt: "How high is your body temperature feeling?",
      options: [
        { id: 'high_fever', label: "High fever (> 102°F) with intense chills", icon: '🔥', sub: 'Shivering under blankets' },
        { id: 'moderate_fever', label: "Moderate fever (100°F - 102°F)", icon: '🌡️', sub: 'Noticeable flushed heat' },
        { id: 'low_grade', label: "Low-grade fever (99°F - 100°F)", icon: '🌤️', sub: 'Feeling warm and fatigued' },
        { id: 'night_spikes', label: "Spiking fever with night sweats", icon: '⚡', sub: 'Comes in recurring waves' }
      ]
    },
    q2: {
      prompt: "Any secondary symptoms accompanying the fever?",
      options: [
        { id: 'severe_body_ache', label: "Severe eye socket and joint aches", icon: '🦴', sub: 'Screening for Dengue' },
        { id: 'throat_cough', label: "Sore throat, cough, and runny nose", icon: '🧣', sub: 'Viral influenza signs' },
        { id: 'skin_rash', label: "Red skin spots or easy bruising", icon: '🩹', sub: 'Platelet alert' },
        { id: 'none', label: "Isolated fever and weakness only", icon: '✨', sub: 'Pure pyrexia' }
      ]
    },
    diagnosis: {
      primary: 'Acute Viral Pyrexia & Flu-Like Syndrome',
      confidence: 93,
      specialty: 'General Medicine',
      secondary: 'Suspected Dengue / Viral Mononucleosis Protocol',
      urgency: 'PRIORITY',
      explanation: 'Symptom trajectory matches an acute systemic viral pathogen. Clinical oversight ensures timely monitoring of hematocrit and platelet counts.',
      advice: 'Maintain high fluid intake (coconut water, ORS, soups). Sponge with lukewarm water if fever exceeds 101°F. Avoid self-medicating with aspirin; take paracetamol if prescribed. In-person OPD consult is advised if fever extends past 48 hours.',
      spokenSummary: "Clinical analysis indicates acute viral pyrexia. Hydration and platelet monitoring are prioritized. I've located verified doctors nearby in Coimbatore South."
    }
  },
  {
    id: 'cough_breathing',
    title: 'Cough & Cold',
    icon: '🫁',
    badge: 'Pulmonology',
    keywords: ['cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis', 'chest congestion'],
    aiGreeting: "Respiratory symptoms detected. Let's evaluate your airway resistance and breathing comfort.",
    spokenIntro: "Respiratory symptoms detected. Is your breathing restricted at rest or while talking?",
    q1: {
      prompt: "Is your breathing restricted at rest or while talking?",
      options: [
        { id: 'breathless_rest', label: "Shortness of breath even at rest", icon: '⚠️', sub: 'High clinical priority' },
        { id: 'wheezing_whistle', label: "Chest wheezing or whistling breath", icon: '🫁', sub: 'Bronchial constriction' },
        { id: 'cough_only', label: "Breathing normal, just hacking cough", icon: '🗣️', sub: 'Upper airway irritation' },
        { id: 'night_cough', label: "Cough worsens when lying flat", icon: '🌙', sub: 'Post-nasal drip / allergy' }
      ]
    },
    q2: {
      prompt: "What kind of sputum or duration do you have?",
      options: [
        { id: 'dry_persistent', label: "Dry tickling persistent cough", icon: '🌵', sub: 'Post-viral or allergy' },
        { id: 'thick_yellow', label: "Productive yellow or green phlegm", icon: '🟡', sub: 'Bacterial bronchitis' },
        { id: 'asthma_history', label: "Known history of asthma or allergy", icon: '🔄', sub: 'Bronchial spasm flare' },
        { id: 'acute_few_days', label: "Started in last 2 to 3 days", icon: '⚡', sub: 'Early acute cold' }
      ]
    },
    diagnosis: {
      primary: 'Acute Bronchial Hyperreactivity & Respiratory Infection',
      confidence: 92,
      specialty: 'General Medicine',
      secondary: 'Asthmatic Bronchospasm vs Viral Bronchitis',
      urgency: 'ROUTINE',
      explanation: 'Airway irritability and mucosal congestion consistent with respiratory infection or allergic bronchospasm.',
      advice: 'Perform steam inhalation twice daily, drink warm fluids, and avoid cold air or dust exposure. If shortness of breath occurs at rest, proceed immediately to hospital OPD.',
      spokenSummary: "Assessment suggests bronchial hyperreactivity and airway congestion. Steam inhalation is recommended, and available pulmonology and general medicine slots are listed below."
    }
  },
  {
    id: 'headache_neuro',
    title: 'Migraine & Headache',
    icon: '🧠',
    badge: 'Neurology',
    keywords: ['headache', 'migraine', 'head', 'temple', 'head hurts', 'throbbing', 'aura', 'cluster headache', 'tension headache', 'dizziness', 'vertigo', 'spinning'],
    aiGreeting: "Cranial discomfort detected. Let's assess vascular vs tension factors and neurological aura.",
    spokenIntro: "Cranial discomfort detected. What does the headache feel like?",
    q1: {
      prompt: "What does the headache feel like?",
      options: [
        { id: 'one_sided_pulse', label: "Throbbing on one side of head", icon: '⚡', sub: 'Classic migraine' },
        { id: 'tight_band', label: "Tight squeezing band on forehead", icon: '💆', sub: 'Tension and stress strain' },
        { id: 'thunderclap', label: "Sudden explosive 'worst headache of life'", icon: '🚨', sub: 'Emergency triage' },
        { id: 'room_spinning', label: "The entire room is spinning (Vertigo)", icon: '🌀', sub: 'Inner ear / vestibular' }
      ]
    },
    q2: {
      prompt: "Are you sensitive to light, sound, or nausea?",
      options: [
        { id: 'light_sensitive', label: "Sensitivity to light and screen glare", icon: '💡', sub: 'Photophobia' },
        { id: 'nausea_queasy', label: "Queasy stomach or vomiting", icon: '🤢', sub: 'Autonomic migraine sign' },
        { id: 'zigzag_aura', label: "Flashing zigzag lines in vision", icon: '✨', sub: 'Visual migraine aura' },
        { id: 'none', label: "No sensory changes, just head pain", icon: '✨', sub: 'Isolated headache' }
      ]
    },
    diagnosis: {
      primary: 'Episodic Neurovascular Migraine with Photophobia',
      confidence: 94,
      specialty: 'Neurology',
      secondary: 'Tension-Type Myofascial Cephalea',
      urgency: 'ROUTINE',
      explanation: 'Unilateral or throbbing cranial vasodilation exacerbated by sensory stimuli and postural stress.',
      advice: 'Rest in a cool, quiet, dark room. Apply a cold compress to temples. Stay hydrated. A neurology consultation can provide targeted abortive and preventive migraine relief.',
      spokenSummary: "This matches an episodic neurovascular migraine with photophobia. Rest in a dark room. Nearby neurological care centers are ready for consultation."
    }
  },
  {
    id: 'chest_cardiac',
    title: 'Chest & Acidity',
    icon: '🫀',
    badge: 'Cardiology',
    keywords: ['chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd', 'substernal'],
    aiGreeting: "Chest sensation detected. Let's distinguish gastroesophageal acid reflux from cardiac signs.",
    spokenIntro: "Chest sensation detected. What is the sensation in your chest feeling like?",
    q1: {
      prompt: "What is the sensation in your chest?",
      options: [
        { id: 'burning_acidity', label: "Burning acidity rising into throat", icon: '🔥', sub: 'Likely acid reflux (GERD)' },
        { id: 'crushing_heaviness', label: "Crushing heaviness or squeezing", icon: '⚠️', sub: 'High cardiac priority' },
        { id: 'palpitations', label: "Racing or fluttering heartbeats", icon: '💓', sub: 'Arrhythmia / anxiety' },
        { id: 'sharp_breath', label: "Sharp stabbing on deep breaths", icon: '⚡', sub: 'Rib cartilage / pleuritic' }
      ]
    },
    q2: {
      prompt: "Does it radiate to your arm, neck, or jaw?",
      options: [
        { id: 'radiates_left_arm', label: "Radiates to left arm or jaw", icon: '🚨', sub: 'Cardiac radiation alert' },
        { id: 'center_chest_only', label: "Stays centered in middle of chest", icon: '🎯', sub: 'Retrosternal / GERD' },
        { id: 'after_heavy_meal', label: "Happens after heavy or spicy food", icon: '🍽️', sub: 'Gastric acid trigger' },
        { id: 'on_walking', label: "Triggers on walking or exertion", icon: '🏃', sub: 'Exertional angina sign' }
      ]
    },
    diagnosis: {
      primary: 'Gastroesophageal Reflux (GERD) & Atypical Cardiac Triage',
      confidence: 90,
      specialty: 'Cardiology',
      secondary: 'Costochondritis / Anterior Chest Wall Spasm',
      urgency: 'PRIORITY',
      explanation: 'Retrosternal discomfort requires objective cardiac baseline exclusion via ECG alongside gastrointestinal antacid regulation.',
      advice: 'Remain upright and avoid lying down. Do not exert physically. If heaviness spreads to the left arm or is accompanied by cold sweating, seek immediate emergency care. A prompt OPD ECG offers complete reassurance.',
      spokenSummary: "Clinical analysis notes retrosternal acid reflux with atypical cardiac screening advised. Resting 12-lead ECG is available at City Care Hospital."
    }
  },
  {
    id: 'pain_ortho',
    title: 'Back & Joint Pain',
    icon: '🧘',
    badge: 'Orthopedics',
    keywords: ['back', 'back pain', 'lower back', 'neck', 'cervical', 'knee', 'joint', 'spine', 'sciatica', 'shoulder', 'sprain', 'twist', 'muscle ache', 'slip disc'],
    aiGreeting: "Musculoskeletal pain detected. Let's isolate the spinal or joint stress point.",
    spokenIntro: "Musculoskeletal pain detected. Which joint or spinal area is affected?",
    q1: {
      prompt: "Which joint or spinal area is affected?",
      options: [
        { id: 'lower_lumbar', label: "Lower back and lumbar spine (Sciatica)", icon: '🧘', sub: 'L4-L5 lumbar strain' },
        { id: 'knee_joint', label: "Knee joint with swelling or clicking", icon: '🦵', sub: 'Patellar / meniscal strain' },
        { id: 'cervical_neck', label: "Neck and shoulder muscle spasm", icon: '🧣', sub: 'Desk posture strain' },
        { id: 'shoulder_arm', label: "Shoulder restriction or rotator cuff", icon: '🦾', sub: 'Tendon impingement' }
      ]
    },
    q2: {
      prompt: "How is your mobility and weight bearing?",
      options: [
        { id: 'sciatica_leg', label: "Pain shoots down leg with tingling", icon: '⚡', sub: 'Nerve root irritation' },
        { id: 'cannot_bear_weight', label: "Cannot stand or bear weight", icon: '🚫', sub: 'Acute joint stress' },
        { id: 'morning_stiff', label: "Stiff in morning, eases with walk", icon: '🌅', sub: 'Facet joint wear' },
        { id: 'lifting_trigger', label: "Started after heavy lifting or twist", icon: '🏋️', sub: 'Acute muscular sprain' }
      ]
    },
    diagnosis: {
      primary: 'Lumbar Spondylosis & Paraspinal Myofascial Strain',
      confidence: 95,
      specialty: 'Orthopedics',
      secondary: 'L4-L5 Postural Disc Overload',
      urgency: 'ROUTINE',
      explanation: 'Biomechanical lumbar facet joint stress and muscular paraspinal guarding without acute cauda equina red flags.',
      advice: 'Avoid forward bending and heavy lifting. Apply warm fomentation to ease muscle spasms. An orthopedic consultation and physical examination will guide core stabilization exercises.',
      spokenSummary: "Likely lumbar spondylosis and paraspinal muscle strain. Avoid heavy lifting. Top orthopedic physicians nearby are available today."
    }
  },
  {
    id: 'skin_allergy',
    title: 'Skin & Rash',
    icon: '🩹',
    badge: 'Dermatology',
    keywords: ['rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'blister', 'welts', 'red spots', 'eczema', 'dermatitis'],
    aiGreeting: "Dermatological reaction detected. Let's screen for hives and check for facial swelling.",
    spokenIntro: "Dermatological reaction detected. What does the skin reaction look like?",
    q1: {
      prompt: "What does the skin reaction look like?",
      options: [
        { id: 'raised_hives', label: "Raised itchy pink wheals or hives", icon: '🔴', sub: 'Acute urticaria reaction' },
        { id: 'red_patchy_bumps', label: "Red patchy bumps or rough eczema", icon: '🩹', sub: 'Contact irritation' },
        { id: 'blisters_peeling', label: "Fluid blisters or peeling skin", icon: '💧', sub: 'Dermatological review' },
        { id: 'spreading_hot', label: "Spreading warm red rash with fever", icon: '🔥', sub: 'Infection / cellulitis' }
      ]
    },
    q2: {
      prompt: "Any facial swelling or known allergen trigger?",
      options: [
        { id: 'lip_eye_swelling', label: "Swelling of lips, eyes, or face", icon: '🚨', sub: 'Urgent angioedema alert' },
        { id: 'new_medication', label: "Started new medicine or antibiotic", icon: '💊', sub: 'Drug hypersensitivity' },
        { id: 'food_insect', label: "After street food or insect bite", icon: '🍤', sub: 'Histaminergic reaction' },
        { id: 'none', label: "Isolated skin itch, no swelling", icon: '✨', sub: 'Pure cutaneous rash' }
      ]
    },
    diagnosis: {
      primary: 'Acute Urticaria & Allergic Contact Dermatitis',
      confidence: 93,
      specialty: 'Dermatology',
      secondary: 'Histaminergic Cutaneous Hypersensitivity',
      urgency: 'ROUTINE',
      explanation: 'Mast cell degranulation and cutaneous histamine release causing erythematous pruritic wheals.',
      advice: 'Do not scratch or apply hot water, which triggers further histamine release. Apply calamine lotion or cool compresses. If facial or lip swelling develops, seek urgent hospital attention immediately.',
      spokenSummary: "Identified acute urticaria and allergic dermatitis. Calamine lotion provides cooling relief. Available dermatology slots are ready below."
    }
  },
  {
    id: 'urinary_kidney',
    title: 'Urinary & Bladder',
    icon: '💧',
    badge: 'Urology',
    keywords: ['urine', 'urination', 'burning', 'uti', 'kidney', 'flank', 'bladder', 'peeing', 'urinary', 'kidney stone'],
    aiGreeting: "Urinary symptoms detected. Let's assess for UTI versus renal stone irritation.",
    spokenIntro: "Urinary symptoms detected. What specific urinary discomfort are you feeling?",
    q1: {
      prompt: "What specific urinary discomfort are you feeling?",
      options: [
        { id: 'burning_pee', label: "Sharp burning while passing urine", icon: '🔥', sub: 'Acute cystitis / UTI' },
        { id: 'flank_pain', label: "Severe sharp pain in lower flank/back", icon: '⚡', sub: 'Possible kidney stone' },
        { id: 'frequent_urge', label: "Urge every few minutes with drops", icon: '⏱️', sub: 'Bladder tenesmus' },
        { id: 'cloudy_urine', label: "Cloudy or reddish discolored urine", icon: '🚨', sub: 'Hematuria / infection' }
      ]
    },
    q2: {
      prompt: "Any fever or shivering chills?",
      options: [
        { id: 'fever_chills', label: "High fever with shaking chills", icon: '🌡️', sub: 'Upper kidney involvement' },
        { id: 'nausea_vomit', label: "Nausea and vomiting with back pain", icon: '🤢', sub: 'Renal colic sign' },
        { id: 'started_today', label: "Started in last 24 hours", icon: '⚡', sub: 'Early acute UTI' },
        { id: 'none', label: "Isolated burning, no fever", icon: '✨', sub: 'Uncomplicated dysuria' }
      ]
    },
    diagnosis: {
      primary: 'Acute Lower Urinary Tract Infection (UTI) & Urethritis',
      confidence: 94,
      specialty: 'General Medicine',
      secondary: 'Suspected Micro-Calculus / Renal Gravel',
      urgency: 'ROUTINE',
      explanation: 'Bacterial colonization of the urothelium causing dysuria and bladder tenesmus.',
      advice: 'Significantly increase fluid intake (3+ liters of water daily). Avoid coffee, alcohol, and spicy spices that irritate the bladder lining. A urine routine and culture test at hospital OPD is recommended for targeted antibiotic clearance.',
      spokenSummary: "Likely lower urinary tract infection. Increase water intake immediately. Urine culture and general medicine consultation are recommended."
    }
  },
  {
    id: 'dizziness_vertigo',
    title: 'Dizziness & Vertigo',
    icon: '💫',
    badge: 'Neurology & ENT',
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'faint', 'fainting', 'lightheaded', 'balance', 'unsteady', 'ear ring'],
    aiGreeting: "Dizziness detected. Let's distinguish inner-ear vertigo from low blood pressure.",
    spokenIntro: "Dizziness detected. What does the sensation feel like?",
    q1: {
      prompt: "What does the dizziness feel like?",
      options: [
        { id: 'room_spinning', label: "The whole room is spinning around me", icon: '🌀', sub: 'Vestibular vertigo / BPPV' },
        { id: 'faint_standing', label: "Vision dims & feeling faint on standing", icon: '🌑', sub: 'Low BP / orthostatic' },
        { id: 'unsteady_balance', label: "Off-balance, walking unsteadily", icon: '🚶', sub: 'Sensory / ataxia' },
        { id: 'ear_ringing', label: "Buzzing or ringing in one ear", icon: '👂', sub: 'Tinnitus / labyrinthitis' }
      ]
    },
    q2: {
      prompt: "When does it trigger most?",
      options: [
        { id: 'turning_in_bed', label: "When turning head or rolling in bed", icon: '🛏️', sub: 'Classic positional BPPV' },
        { id: 'hot_weather', label: "After standing long or skipping meals", icon: '☀️', sub: 'Dehydration / low sugar' },
        { id: 'constant_spinning', label: "Continuous spinning for hours", icon: '🗓️', sub: 'Vestibular neuritis' },
        { id: 'none', label: "Spontaneous random spikes", icon: '✨', sub: 'General lightheadedness' }
      ]
    },
    diagnosis: {
      primary: 'Benign Paroxysmal Positional Vertigo (BPPV) & Vestibulopathy',
      confidence: 91,
      specialty: 'Neurology',
      secondary: 'Orthostatic Presyncope & Inner Ear Canalithiasis',
      urgency: 'ROUTINE',
      explanation: 'Displaced otoconia within the inner ear semicircular canals triggering transient paroxysmal nystagmus and spinning vertigo.',
      advice: 'Avoid sudden head movements or quick turns in bed. Sit on edge of bed for 1 minute before standing. An OPD consultation with a neurologist or ENT specialist can perform the Epley canalith repositioning maneuver for instant relief.',
      spokenSummary: "Symptoms are consistent with benign paroxysmal positional vertigo. Avoid sudden head turns. Neurological and ENT care slots are ready."
    }
  }
];

interface AiHealthAssistantProps {
  patientProfile: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  onOpenCheckout: (doctor: DoctorProfile, consultationType: ConsultationType, explicitSlot?: OpSlot) => void;
  onClose?: () => void;
}

export type AiFlowStep = 'ISSUE' | 'QUESTION_1' | 'QUESTION_2' | 'RESULTS';

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  patientProfile,
  hospitals,
  doctors,
  slots,
  onOpenCheckout,
  onClose
}) => {
  // Step-by-Step Slide State (Exactly 1 question in frame at a time)
  const [currentStep, setCurrentStep] = useState<AiFlowStep>('ISSUE');
  const [selectedQ1, setSelectedQ1] = useState<string>('');
  const [selectedQ2, setSelectedQ2] = useState<string>('');

  // Free-Text Search & Active Category
  const [inputText, setInputText] = useState<string>('Severe vomiting and stomach cramps');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Voice Engine State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Sync initial question choices when category changes
  useEffect(() => {
    if (activeCategory.q1.options[0]) {
      setSelectedQ1(activeCategory.q1.options[0].id);
    }
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
    if (matched && matched.id !== selectedCategoryId) {
      setIsAiThinking(true);
      setTimeout(() => {
        setSelectedCategoryId(matched.id);
        setIsAiThinking(false);
      }, 200);
    }
  };

  // Direct pill tap: selects category and slides to Q1 immediately
  const handleSelectPill = (cat: SmartCategoryConfig) => {
    stopSpeaking();
    setSelectedCategoryId(cat.id);
    setInputText(cat.title);
    if (cat.q1.options[0]) setSelectedQ1(cat.q1.options[0].id);
    if (cat.q2.options[0]) setSelectedQ2(cat.q2.options[0].id);
    setTimeout(() => {
      setCurrentStep('QUESTION_1');
      if (isVoiceEnabled) {
        speakText(cat.q1.prompt);
      }
    }, 200);
  };

  // Slide Navigation Handlers
  const handleBack = () => {
    stopSpeaking();
    if (currentStep === 'RESULTS') {
      setCurrentStep('QUESTION_2');
    } else if (currentStep === 'QUESTION_2') {
      setCurrentStep('QUESTION_1');
    } else if (currentStep === 'QUESTION_1') {
      setCurrentStep('ISSUE');
    } else {
      onClose?.();
    }
  };

  const handleGoToQ1 = () => {
    stopSpeaking();
    setCurrentStep('QUESTION_1');
    if (isVoiceEnabled) {
      speakText(activeCategory.q1.prompt);
    }
  };

  const handleGoToQ2 = () => {
    stopSpeaking();
    setCurrentStep('QUESTION_2');
    if (isVoiceEnabled) {
      speakText(activeCategory.q2.prompt);
    }
  };

  const handleGoToResults = () => {
    stopSpeaking();
    setCurrentStep('RESULTS');
    if (isVoiceEnabled) {
      speakText(activeCategory.diagnosis.spokenSummary);
    }
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
    <div className="space-y-4 pb-6 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAV: MINIMAL BACK BUTTON + STEP INDICATOR + VOICE TOGGLE            */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 pt-1 select-none">
        {/* Minimal Circular Back Button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-700 transition-all cursor-pointer group active:scale-95"
          title="Go Back"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Minimal Step Indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-semibold">
          {currentStep === 'ISSUE' && <span>Issue Triage</span>}
          {currentStep === 'QUESTION_1' && <span>Question 1 of 2</span>}
          {currentStep === 'QUESTION_2' && <span>Question 2 of 2</span>}
          {currentStep === 'RESULTS' && <span>Matched Care</span>}
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
                if (currentStep === 'ISSUE') speakText(activeCategory.spokenIntro);
                else if (currentStep === 'QUESTION_1') speakText(activeCategory.q1.prompt);
                else if (currentStep === 'QUESTION_2') speakText(activeCategory.q2.prompt);
                else speakText(activeCategory.diagnosis.spokenSummary);
              }
            }
          }}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            isSpeaking
              ? 'bg-sky-500 text-white shadow-sky-500/25 ring-2 ring-sky-200'
              : isVoiceEnabled
              ? 'bg-white/90 text-sky-700 border border-sky-200 hover:bg-sky-50'
              : 'bg-white/90 text-slate-500 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isSpeaking ? (
            <>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-full bg-white rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                <span className="w-0.5 h-2/3 bg-white rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.15s]" />
                <span className="w-0.5 h-full bg-white rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" />
                <span className="w-0.5 h-1/2 bg-white rounded-full animate-[bounce_0.7s_ease-in-out_infinite_0.1s]" />
              </div>
              <span className="text-[11px] font-bold">Speaking</span>
            </>
          ) : isVoiceEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-sky-600" />
              <span className="text-[11px] font-bold">Voice On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-medium">Muted</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. SLIDE CONTAINER (EXACTLY 1 QUESTION / UX IN FRAME AT A TIME)             */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        
        {/* ===================================================================== */}
        {/* SLIDE 0: PRIMARY ISSUE & SYMPTOMS                                    */}
        {/* ===================================================================== */}
        {currentStep === 'ISSUE' && (
          <motion.div
            key="slide-issue"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Centered Hero Siri Orb */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1 text-center relative select-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-gradient-to-tr from-sky-400/20 via-fuchsia-400/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

              <SiriOrb
                size={68}
                state={isSpeaking ? "streaming" : isListening ? "listening" : isAiThinking ? "thinking" : "idle"}
                className="cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  else if (isVoiceEnabled) speakText(activeCategory.spokenIntro);
                }}
              />

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-2.5">
                What are you experiencing?
              </h2>
              <p className="text-[11.5px] text-slate-500 mt-0.5 max-w-[280px] mx-auto leading-relaxed">
                Speak into the mic, type below, or tap a common symptom
              </p>
            </div>

            {/* Glass Symptom Search & Voice Pill */}
            <div className="relative">
              <div className={`relative flex items-center bg-white/95 backdrop-blur-md rounded-full border shadow-2xs transition-all ${
                isListening
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-200/90 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 hover:border-slate-300'
              }`}>
                <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Describe what's wrong (e.g. fever, vomiting, back pain)..."
                  className="w-full py-2.5 px-3 bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 mr-1 rounded-full transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-xs animate-pulse ring-2 ring-rose-200'
                      : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                  }`}
                  title={isListening ? "Listening... Speak now" : "Speak to AI"}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Common Categories:</span>
              <div className="flex flex-wrap gap-1.5 select-none">
                {SMART_CLINICAL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectPill(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/25 scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToQ1}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
              >
                <span>Continue to Clinical Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 1: CLINICAL QUESTION 1 (EXACTLY 1 QUESTION IN FRAME)            */}
        {/* ===================================================================== */}
        {currentStep === 'QUESTION_1' && (
          <motion.div
            key="slide-q1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Centered Hero Orb & Question Title */}
            <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center relative select-none">
              <SiriOrb
                size={56}
                state={isSpeaking ? "streaming" : "idle"}
                className="cursor-pointer"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  else if (isVoiceEnabled) speakText(activeCategory.q1.prompt);
                }}
              />

              <div className="mt-2 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                  Question 1 of 2 • Clinical Indicator
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {activeCategory.q1.prompt}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select the sign that best describes your situation
                </p>
              </div>
            </div>

            {/* Options List with Badges A, B, C, D */}
            <div className="space-y-2 select-none">
              {activeCategory.q1.options.map((opt, idx) => {
                const isChecked = selectedQ1 === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedQ1(opt.id)}
                    className={`w-full text-left rounded-2xl p-3 flex items-start gap-3 border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-sky-50/80 border-sky-500 text-slate-900 shadow-2xs ring-2 ring-sky-100'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                        isChecked
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : optionBadge(idx)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1.5 text-slate-900">
                        {opt.icon && <span className="text-base">{opt.icon}</span>}
                        <span>{opt.label}</span>
                      </div>
                      {opt.sub && (
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                          {opt.sub}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToQ2}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
              >
                <span>Next Question (2 of 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 2: CLINICAL QUESTION 2 (EXACTLY 1 QUESTION IN FRAME)            */}
        {/* ===================================================================== */}
        {currentStep === 'QUESTION_2' && (
          <motion.div
            key="slide-q2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Centered Hero Orb & Question Title */}
            <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center relative select-none">
              <SiriOrb
                size={56}
                state={isSpeaking ? "streaming" : "idle"}
                className="cursor-pointer"
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  else if (isVoiceEnabled) speakText(activeCategory.q2.prompt);
                }}
              />

              <div className="mt-2 text-center space-y-0.5">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                  Question 2 of 2 • Exposure & Onset
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {activeCategory.q2.prompt}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Helps identify triggers and triage urgency
                </p>
              </div>
            </div>

            {/* Options List with Badges A, B, C, D */}
            <div className="space-y-2 select-none">
              {activeCategory.q2.options.map((opt, idx) => {
                const isChecked = selectedQ2 === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedQ2(opt.id)}
                    className={`w-full text-left rounded-2xl p-3 flex items-start gap-3 border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-sky-50/80 border-sky-500 text-slate-900 shadow-2xs ring-2 ring-sky-100'
                        : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-2xs'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                        isChecked
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-transparent shadow-xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : optionBadge(idx)}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center gap-1.5 text-slate-900">
                        {opt.icon && <span className="text-base">{opt.icon}</span>}
                        <span>{opt.label}</span>
                      </div>
                      {opt.sub && (
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                          {opt.sub}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGoToResults}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
              >
                <span>Find Matched Hospitals & Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* SLIDE 3: LOCATION-BASED HOSPITALS & DOCS + 1-TAP BOOKING (LAST SLIDE)  */}
        {/* ===================================================================== */}
        {currentStep === 'RESULTS' && (
          <motion.div
            key="slide-results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3.5"
          >
            {/* AI Clinical Diagnostic Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-sky-50/50 to-white border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Match: {activeCategory.diagnosis.confidence}%</span>
                  <span>•</span>
                  <span className="uppercase">{activeCategory.diagnosis.urgency}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakText(activeCategory.diagnosis.spokenSummary)}
                    className="px-2 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold flex items-center gap-1 hover:bg-sky-100 cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3 text-sky-600" />
                    <span>Listen</span>
                  </button>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    {activeCategory.diagnosis.specialty}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {activeCategory.diagnosis.primary}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeCategory.diagnosis.explanation}
              </p>

              <div className="pt-2 border-t border-emerald-200/50 text-[11px] text-slate-700 leading-relaxed">
                <strong className="text-emerald-900 font-bold">Physician Advice: </strong>
                {activeCategory.diagnosis.advice}
              </div>
            </div>

            {/* Location-Based Hospital & Doctor Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coimbatore South • 1.2 km away</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  Token #4 Ready (~10m wait)
                </span>
              </div>

              <div className="flex items-start gap-3 pt-1 border-t border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-lg shrink-0">
                  {topDoctor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{formatDocName(topDoctor.name)}</h4>
                  <p className="text-xs text-slate-500 truncate">{topDoctor.specialty} • {activeHospital.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {topDoctor.rating}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">{topDoctor.experienceYears} yrs exp</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Available Today</span>
                  </div>
                </div>
              </div>

              {/* Direct Booking Actions (In-Person Visit or Video Consult -> Payment) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleProceedBooking(topDoctor, 'IN_PERSON_OPD')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-sky-500/25 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Building2 className="w-4 h-4" />
                    <span>In-Person Visit</span>
                  </div>
                  <span className="text-[10px] opacity-90 font-medium">OPD Token • ₹{topDoctor?.opConsultationFee || 200}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleProceedBooking(topDoctor, 'VIDEO_CONSULTATION')}
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold shadow-xs flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                    <Video className="w-4 h-4 text-sky-600" />
                    <span>Video Consult</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Direct Call • ₹399</span>
                </button>
              </div>
            </div>

            {/* Restart Triage Option */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setCurrentStep('ISSUE');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                ← Start another health inquiry
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default AiHealthAssistant;
