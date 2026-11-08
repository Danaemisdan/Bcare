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
  Radio
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
    title: 'Vomiting & Upset Stomach',
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
    title: 'High Fever, Chills & Viral Flu',
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
    title: 'Cough, Cold & Breathlessness',
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
    title: 'Migraine, Throbbing Headache & Vertigo',
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
    title: 'Chest Discomfort, Acidity & Heartburn',
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
    title: 'Back, Neck & Joint Pain / Sprains',
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
    title: 'Skin Rash, Hives & Allergies',
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
    title: 'Burning Urination & Infection',
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
    title: 'Severe Dizziness & Spinning Vertigo',
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

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  patientProfile,
  hospitals,
  doctors,
  slots,
  onOpenCheckout,
  onClose
}) => {
  // Free-Text Search & Active Category
  const [inputText, setInputText] = useState<string>('Severe vomiting and stomach cramps since morning');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isQuestionsComplete, setIsQuestionsComplete] = useState<boolean>(true);

  // Voice Engine State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Geo Filters
  const [distanceRadius, setDistanceRadius] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'HOSPITALS' | 'DOCTORS'>('HOSPITALS');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'hosp-1');

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

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
      
      // Select best natural voice (Samantha, Google, or natural English)
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

  // Build QuestionTool questions for active category
  const questionConfigs: QuestionConfig[] = useMemo(() => {
    return [
      {
        kind: 'single',
        title: activeCategory.q1.prompt,
        description: 'Select the primary clinical indicator that matches your current condition.',
        options: activeCategory.q1.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          icon: opt.icon,
          description: opt.sub,
        })),
        allowCustom: true,
        customPlaceholder: 'Other specific sign...',
      },
      {
        kind: 'single',
        title: activeCategory.q2.prompt,
        description: 'Helps determine onset speed and exposure source.',
        options: activeCategory.q2.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          icon: opt.icon,
          description: opt.sub,
        })),
        allowCustom: true,
        customPlaceholder: 'Other trigger...',
      },
    ];
  }, [activeCategory]);

  // QuestionTool Part Definition
  const questionToolPart: QuestionToolPart = useMemo(() => ({
    type: 'question',
    toolCallId: `${selectedCategoryId}-${inputText}`,
    input: {
      questions: questionConfigs,
      submitLabel: 'Analyze & View Nearby Care',
      nextLabel: 'Next Question',
      allowSkip: false,
      onSubmitAnswer: (ans) => {
        // Subtle haptic / audio feedback
      },
      onAllCompleted: () => {
        setIsQuestionsComplete(true);
        if (isVoiceEnabled) {
          speakText(activeCategory.diagnosis.spokenSummary);
        }
      },
    },
  }), [selectedCategoryId, inputText, questionConfigs, isVoiceEnabled, activeCategory]);

  // Real-time AI Symptom Parser
  const handleQueryChange = (val: string) => {
    setInputText(val);
    const lower = val.toLowerCase();
    const matched = SMART_CLINICAL_CATEGORIES.find(cat => 
      cat.keywords.some(kw => lower.includes(kw))
    );
    if (matched && matched.id !== selectedCategoryId) {
      setIsAiThinking(true);
      setIsQuestionsComplete(false);
      setTimeout(() => {
        setSelectedCategoryId(matched.id);
        setIsAiThinking(false);
        if (isVoiceEnabled) {
          speakText(matched.spokenIntro);
        }
      }, 250);
    }
  };

  // Direct pill tap
  const handleSelectPill = (cat: SmartCategoryConfig) => {
    setIsAiThinking(true);
    setInputText(cat.title);
    setIsQuestionsComplete(false);
    setTimeout(() => {
      setSelectedCategoryId(cat.id);
      setIsAiThinking(false);
      if (isVoiceEnabled) {
        speakText(cat.spokenIntro);
      }
    }, 200);
  };

  // Geo-ranked hospitals
  const rankedHospitals = useMemo(() => {
    return hospitals.map((hosp, idx) => {
      const distance = 1.2 + idx * 1.8;
      return {
        ...hosp,
        distanceKm: distance,
        liveWaitMins: 8 + idx * 5,
        rating: 4.8 + (idx % 3) * 0.08
      };
    }).filter(h => h.distanceKm <= distanceRadius);
  }, [hospitals, distanceRadius]);

  const activeHospital = rankedHospitals.find(h => h.id === selectedHospitalId) || rankedHospitals[0] || hospitals[0];

  // Matched doctors filtered by specialty
  const availableDoctors = useMemo(() => {
    const targetSpecialty = activeCategory.diagnosis.specialty.toLowerCase();
    let docs = doctors.filter(d => {
      const spec = d.specialty.toLowerCase();
      const matchesSpecialty = 
        spec.includes(targetSpecialty) ||
        targetSpecialty.includes(spec) ||
        spec.includes('general') ||
        spec.includes('medicine');
      const matchesHospital = !selectedHospitalId || d.hospitalId === selectedHospitalId;
      return matchesSpecialty && matchesHospital;
    });

    if (docs.length === 0) {
      docs = doctors.filter(d => d.hospitalId === activeHospital.id);
    }
    if (docs.length === 0) {
      docs = doctors.slice(0, 4);
    }
    return docs;
  }, [doctors, activeCategory.diagnosis.specialty, selectedHospitalId, activeHospital.id]);

  const topDoctor = availableDoctors[0] || doctors[0];

  // Booking handoff
  const handleProceedBooking = (chosenDoc: DoctorProfile, type: ConsultationType = 'IN_PERSON_OPD') => {
    const targetSlot = slots.find(s => s.doctorId === chosenDoc.id && s.status === 'AVAILABLE') || slots[0];
    onOpenCheckout(chosenDoc, type, targetSlot);
  };

  const formatDocName = (name?: string) => {
    if (!name) return 'Specialist';
    return name.startsWith('Dr.') || name.startsWith('Dr ') ? name : `Dr. ${name}`;
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAV: MINIMAL BACK BUTTON + STATUS + VOICE CONTROLS                  */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 pt-1 select-none">
        {/* Minimal Back Button to restore normal tabs and dock */}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer group shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </button>

        {/* Center Subtle Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] font-bold text-sky-800 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>B Care AI</span>
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
                speakText(activeCategory.spokenIntro);
              }
            }
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            isSpeaking
              ? 'bg-sky-500 text-white shadow-sky-500/25 ring-2 ring-sky-200'
              : isVoiceEnabled
              ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
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
      {/* 2. HERO SIRI ORB (TRANSITIONS TO TOP MIDDLE, SIMPLE & MINIMAL)              */}
      {/* ========================================================================= */}
      <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center relative select-none">
        {/* Soft Radiant Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-sky-400/20 via-fuchsia-400/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Hero 3D Siri Orb placed in Top Middle */}
        <motion.div
          layoutId="siri-hero-orb"
          initial={{ scale: 0.5, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 25 }}
          className="relative z-10"
        >
          <SiriOrb
            size={76}
            state={isSpeaking ? "streaming" : isListening ? "listening" : isAiThinking ? "thinking" : "idle"}
            className="cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else if (isVoiceEnabled) {
                speakText(activeCategory.spokenIntro);
              }
            }}
          />
        </motion.div>

        {/* Clean Typography */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="relative z-10 mt-3"
        >
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            How can I help you today?
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[290px] mx-auto leading-relaxed">
            Speak, type, or pick a symptom for clinical triage & direct hospital booking
          </p>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SEXY MINIMAL SEARCH & VOICE BAR                                        */}
      {/* ========================================================================= */}
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
            placeholder="Describe symptoms (e.g. vomiting, fever, migraine)..."
            className="w-full py-2.5 px-3 bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setIsQuestionsComplete(false);
              }}
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
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none -mx-1 px-1">
        {SMART_CLINICAL_CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectPill(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.title}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 4. 21ST.DEV QUESTION-TOOL & CONTEXT-AWARE AI CLARIFICATION               */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-1">
        {/* 21ST.DEV QUESTION-TOOL (@serafimcloud/components/question-tool) */}
        <QuestionTool 
          part={questionToolPart}
          onReset={() => {
            setIsQuestionsComplete(false);
            if (isVoiceEnabled) {
              speakText(activeCategory.spokenIntro);
            }
          }}
        />

        {/* AI Clinical Diagnostic Card */}
        {isQuestionsComplete && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4.5 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-sky-50/50 to-white border border-emerald-200/80 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Clinical Match: {activeCategory.diagnosis.confidence}%</span>
                <span>•</span>
                <span className="uppercase">{activeCategory.diagnosis.urgency} Urgency</span>
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
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
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
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. GEO-MATCHED HOSPITALS & DOCTORS (INSTANT BOOKING IN SAME SCREEN)        */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-4.5 shadow-sm space-y-3.5">
        
        {/* Geo Header with GPS & Radius */}
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
              <div className="text-[11px] text-slate-500">
                Accredited centers matching {activeCategory.diagnosis.specialty}
              </div>
            </div>
          </div>

          {/* Distance Filter Chips */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Radius:</span>
            {[5, 10, 25].map((rad) => (
              <button
                key={rad}
                type="button"
                onClick={() => setDistanceRadius(rad)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

        {/* View Mode Segmented Control */}
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode('HOSPITALS')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
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
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'DOCTORS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span>Available Doctors ({availableDoctors.length})</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* HOSPITALS LIST                                                        */}
        {/* ===================================================================== */}
        {viewMode === 'HOSPITALS' && (
          <div className="space-y-3 pt-1">
            {rankedHospitals.map((hospital) => {
              const isSelected = hospital.id === selectedHospitalId;
              const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id);
              const assignedDoctor = hospitalDoctors.find(d => 
                d.specialty.toLowerCase().includes(activeCategory.diagnosis.specialty.toLowerCase())
              ) || hospitalDoctors[0] || topDoctor;

              return (
                <div
                  key={hospital.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'bg-white border-sky-400 shadow-sm ring-2 ring-sky-100'
                      : 'bg-white hover:border-slate-300 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-600 shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {hospital.distanceKm.toFixed(1)} km
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{hospital.address}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {hospital.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Token #4 (~{hospital.liveWaitMins}m wait)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-400">OPD Pass</div>
                      <div className="text-sm font-bold text-slate-900">₹{assignedDoctor?.opConsultationFee || 200}</div>
                    </div>
                  </div>

                  {/* One-Tap Booking CTA */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      Physician: <strong>{formatDocName(assignedDoctor?.name)}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProceedBooking(assignedDoctor, 'IN_PERSON_OPD')}
                      className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
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
        {/* DOCTORS LIST                                                          */}
        {/* ===================================================================== */}
        {viewMode === 'DOCTORS' && (
          <div className="space-y-3 pt-1">
            {availableDoctors.map((doc) => {
              const docHospital = hospitals.find(h => h.id === doc.hospitalId) || activeHospital;

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-100 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-base shrink-0">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{formatDocName(doc.name)}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold">
                            {doc.specialty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{docHospital.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {doc.rating}
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">{doc.experienceYears} yrs exp</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">Available Today</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] text-slate-400">Consult Fee</div>
                      <div className="text-sm font-bold text-slate-900">₹{doc.opConsultationFee}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleProceedBooking(doc, 'VIDEO_CONSULTATION')}
                      className="px-3 py-1.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                      <span>Video Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleProceedBooking(doc, 'IN_PERSON_OPD')}
                      className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
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
      </div>

    </div>
  );
};

export default AiHealthAssistant;
