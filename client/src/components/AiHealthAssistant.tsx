import React, { useState, useMemo, useRef } from 'react';
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
  Bot
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

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
  };
}

export const SMART_CLINICAL_CATEGORIES: SmartCategoryConfig[] = [
  {
    id: 'vomiting_gi',
    title: 'Vomiting & Upset Stomach',
    icon: '🤢',
    badge: 'Gastroenterology',
    keywords: ['vomit', 'vomiting', 'nausea', 'puke', 'puking', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion', 'stomach ache', 'belly pain'],
    aiGreeting: "I've analyzed your vomiting & gastrointestinal distress. Let's quickly assess your dehydration risk and possible triggers:",
    q1: {
      prompt: "Can you keep fluids down right now?",
      options: [
        { id: 'cannot_retain', label: "Cannot keep water down", icon: '⚠️', sub: 'High dehydration risk' },
        { id: 'vomiting_food', label: "Throwing up food / bile", icon: '🤢', sub: '3 to 5 times today' },
        { id: 'nausea_only', label: "Severe nausea & dry retching", icon: '🌀', sub: 'Queasy stomach' },
        { id: 'dark_blood', label: "Dark or blood-tinged vomit", icon: '🚨', sub: 'Needs urgent review' }
      ]
    },
    q2: {
      prompt: "When did it start, and what was the likely trigger?",
      options: [
        { id: 'after_meal', label: "1-6 hrs after restaurant food", icon: '🍔', sub: 'Likely foodborne toxin' },
        { id: 'started_today', label: "Started suddenly today", icon: '⏱️', sub: 'Acute stomach irritation' },
        { id: 'few_days', label: "Ongoing for 2 to 3 days", icon: '🗓️', sub: 'Persistent gastroenteritis' },
        { id: 'chronic_flare', label: "Recurrent episodes over weeks", icon: '🔄', sub: 'Chronic acid peptic issue' }
      ]
    },
    diagnosis: {
      primary: 'Acute Foodborne Gastroenteritis & Dehydration Risk',
      confidence: 95,
      specialty: 'General Medicine',
      secondary: 'Staphylococcal / Enterotoxin Triage',
      urgency: 'PRIORITY',
      explanation: 'Symptom profile indicates acute gastrointestinal mucosal inflammation. Immediate priority is preventing systemic electrolyte imbalance and hypovolemia.',
      advice: 'Take oral rehydration salts (ORS) in small sips every 5 minutes. Avoid milk, solid dairy, or oily foods. If unable to retain liquids for over 6 hours, an in-person OPD token is recommended for IV fluid hydration.'
    }
  },
  {
    id: 'fever_infection',
    title: 'High Fever, Chills & Viral Flu',
    icon: '🌡️',
    badge: 'Internal Medicine',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'shivers', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'pyrexia', 'sweat'],
    aiGreeting: "Fever detected. Let's check your temperature severity and screen for Dengue or viral infections:",
    q1: {
      prompt: "How high is your temperature feeling?",
      options: [
        { id: 'high_fever', label: "High fever (> 102°F) with intense chills", icon: '🔥', sub: 'Shivering under blankets' },
        { id: 'moderate_fever', label: "Moderate fever (100°F - 102°F)", icon: '🌡️', sub: 'Noticeable flushed heat' },
        { id: 'low_grade', label: "Low-grade fever (99°F - 100°F)", icon: '🌤️', sub: 'Warm and tired' },
        { id: 'night_spikes', label: "Spiking fever with night sweats", icon: '⚡', sub: 'Comes in waves' }
      ]
    },
    q2: {
      prompt: "Any secondary symptoms accompanying the fever?",
      options: [
        { id: 'severe_body_ache', label: "Severe eye socket & joint aches", icon: '🦴', sub: 'Screening for Dengue' },
        { id: 'throat_cough', label: "Sore throat, cough & runny nose", icon: '🧣', sub: 'Viral influenza signs' },
        { id: 'skin_rash', label: "Red skin spots or bruising", icon: '🩹', sub: 'Platelet alert' },
        { id: 'none', label: "Isolated fever & weakness only", icon: '✨', sub: 'Pure pyrexia' }
      ]
    },
    diagnosis: {
      primary: 'Acute Viral Pyrexia & Flu-Like Syndrome',
      confidence: 93,
      specialty: 'General Medicine',
      secondary: 'Suspected Dengue / Viral Mononucleosis Protocol',
      urgency: 'PRIORITY',
      explanation: 'Symptom trajectory matches an acute systemic viral pathogen. Clinical oversight ensures timely monitoring of hematocrit and platelet counts.',
      advice: 'Maintain high fluid intake (coconut water, ORS, soups). Sponge with lukewarm water if fever exceeds 101°F. Avoid self-medicating with aspirin; take paracetamol if prescribed. In-person OPD consult is advised if fever extends past 48 hours.'
    }
  },
  {
    id: 'cough_breathing',
    title: 'Cough, Cold & Breathlessness',
    icon: '🫁',
    badge: 'Pulmonology',
    keywords: ['cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis', 'chest congestion'],
    aiGreeting: "Respiratory symptoms detected. Let's evaluate your airway resistance and breathing comfort:",
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
        { id: 'thick_yellow', label: "Productive yellow / green phlegm", icon: '🟡', sub: 'Bacterial bronchitis' },
        { id: 'asthma_history', label: "Known history of asthma / allergy", icon: '🔄', sub: 'Bronchial spasm flare' },
        { id: 'acute_few_days', label: "Started in last 2-3 days", icon: '⚡', sub: 'Early acute cold' }
      ]
    },
    diagnosis: {
      primary: 'Acute Bronchial Hyperreactivity & Respiratory Infection',
      confidence: 92,
      specialty: 'General Medicine',
      secondary: 'Asthmatic Bronchospasm vs Viral Bronchitis',
      urgency: 'ROUTINE',
      explanation: 'Airway irritability and mucosal congestion consistent with respiratory infection or allergic bronchospasm.',
      advice: 'Perform steam inhalation twice daily, drink warm fluids, and avoid cold air or dust exposure. If shortness of breath occurs at rest, proceed immediately to hospital OPD.'
    }
  },
  {
    id: 'headache_neuro',
    title: 'Migraine, Throbbing Headache & Vertigo',
    icon: '🧠',
    badge: 'Neurology',
    keywords: ['headache', 'migraine', 'head', 'temple', 'head hurts', 'throbbing', 'aura', 'cluster headache', 'tension headache', 'dizziness', 'vertigo', 'spinning'],
    aiGreeting: "Cranial discomfort detected. Let's assess vascular vs tension factors and neurological aura:",
    q1: {
      prompt: "What does the headache feel like?",
      options: [
        { id: 'one_sided_pulse', label: "Throbbing on one side of head", icon: '⚡', sub: 'Classic migraine' },
        { id: 'tight_band', label: "Tight squeezing band on forehead", icon: '💆', sub: 'Tension / stress strain' },
        { id: 'thunderclap', label: "Sudden explosive 'worst headache'", icon: '🚨', sub: 'Emergency triage' },
        { id: 'room_spinning', label: "The entire room is spinning (Vertigo)", icon: '🌀', sub: 'Inner ear / vestibular' }
      ]
    },
    q2: {
      prompt: "Are you sensitive to light, sound, or nausea?",
      options: [
        { id: 'light_sensitive', label: "Sensitivity to light & screen glare", icon: '💡', sub: 'Photophobia' },
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
      advice: 'Rest in a cool, quiet, dark room. Apply a cold compress to temples. Stay hydrated. A neurology consultation can provide targeted abortive and preventive migraine relief.'
    }
  },
  {
    id: 'chest_cardiac',
    title: 'Chest Discomfort, Acidity & Heartburn',
    icon: '🫀',
    badge: 'Cardiology',
    keywords: ['chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd', 'substernal'],
    aiGreeting: "Chest sensation detected. Let's distinguish gastroesophageal acid reflux from cardiac signs:",
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
        { id: 'after_heavy_meal', label: "Happens after heavy/spicy food", icon: '🍽️', sub: 'Gastric acid trigger' },
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
      advice: 'Remain upright and avoid lying down. Do not exert physically. If heaviness spreads to the left arm or is accompanied by cold sweating, seek immediate emergency care. A prompt OPD ECG offers complete reassurance.'
    }
  },
  {
    id: 'pain_ortho',
    title: 'Back, Neck & Joint Pain / Sprains',
    icon: '🧘',
    badge: 'Orthopedics',
    keywords: ['back', 'back pain', 'lower back', 'neck', 'cervical', 'knee', 'joint', 'spine', 'sciatica', 'shoulder', 'sprain', 'twist', 'muscle ache', 'slip disc'],
    aiGreeting: "Musculoskeletal pain detected. Let's isolate the spinal or joint stress point:",
    q1: {
      prompt: "Which joint or spinal area is affected?",
      options: [
        { id: 'lower_lumbar', label: "Lower back / spine (Sciatica)", icon: '🧘', sub: 'L4-L5 lumbar strain' },
        { id: 'knee_joint', label: "Knee joint with swelling/clicking", icon: '🦵', sub: 'Patellar / meniscal strain' },
        { id: 'cervical_neck', label: "Neck & shoulder spasm", icon: '🧣', sub: 'Desk posture strain' },
        { id: 'shoulder_arm', label: "Shoulder restriction / rotator cuff", icon: '🦾', sub: 'Tendon impingement' }
      ]
    },
    q2: {
      prompt: "How is your mobility and weight bearing?",
      options: [
        { id: 'sciatica_leg', label: "Pain shoots down leg / tingling", icon: '⚡', sub: 'Nerve root irritation' },
        { id: 'cannot_bear_weight', label: "Cannot stand or bear weight", icon: '🚫', sub: 'Acute joint stress' },
        { id: 'morning_stiff', label: "Stiff in morning, eases with walk", icon: '🌅', sub: 'Facet joint wear' },
        { id: 'lifting_trigger', label: "Started after heavy lifting/twist", icon: '🏋️', sub: 'Acute muscular sprain' }
      ]
    },
    diagnosis: {
      primary: 'Lumbar Spondylosis & Paraspinal Myofascial Strain',
      confidence: 95,
      specialty: 'Orthopedics',
      secondary: 'L4-L5 Postural Disc Overload',
      urgency: 'ROUTINE',
      explanation: 'Biomechanical lumbar facet joint stress and muscular paraspinal guarding without acute cauda equina red flags.',
      advice: 'Avoid forward bending and heavy lifting. Apply warm fomentation to ease muscle spasms. An orthopedic consultation and physical examination will guide core stabilization exercises.'
    }
  },
  {
    id: 'skin_allergy',
    title: 'Skin Rash, Hives & Allergies',
    icon: '🩹',
    badge: 'Dermatology',
    keywords: ['rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'blister', 'welts', 'red spots', 'eczema', 'dermatitis'],
    aiGreeting: "Dermatological reaction detected. Let's screen for hives and ensure no facial swelling:",
    q1: {
      prompt: "What does the skin reaction look like?",
      options: [
        { id: 'raised_hives', label: "Raised itchy pink wheals / hives", icon: '🔴', sub: 'Acute urticaria reaction' },
        { id: 'red_patchy_bumps', label: "Red patchy bumps or eczema", icon: '🩹', sub: 'Contact irritation' },
        { id: 'blisters_peeling', label: "Fluid blisters or peeling skin", icon: '💧', sub: 'Dermatological review' },
        { id: 'spreading_hot', label: "Spreading warm red rash with fever", icon: '🔥', sub: 'Infection / cellulitis' }
      ]
    },
    q2: {
      prompt: "Any facial swelling or known allergen trigger?",
      options: [
        { id: 'lip_eye_swelling', label: "Swelling of lips, eyes or face", icon: '🚨', sub: 'Urgent angioedema alert' },
        { id: 'new_medication', label: "Started new medicine / antibiotic", icon: '💊', sub: 'Drug hypersensitivity' },
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
      advice: 'Do not scratch or apply hot water, which triggers further histamine release. Apply calamine lotion or cool compresses. If facial or lip swelling develops, seek urgent hospital attention immediately.'
    }
  },
  {
    id: 'urinary_kidney',
    title: 'Burning Urination & Infection',
    icon: '💧',
    badge: 'Urology',
    keywords: ['urine', 'urination', 'burning', 'uti', 'kidney', 'flank', 'bladder', 'peeing', 'urinary', 'kidney stone'],
    aiGreeting: "Urinary symptoms detected. Let's assess for UTI versus renal stone irritation:",
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
      advice: 'Significantly increase fluid intake (3+ liters of water daily). Avoid coffee, alcohol, and spicy spices that irritate the bladder lining. A urine routine and culture test at hospital OPD is recommended for targeted antibiotic clearance.'
    }
  },
  {
    id: 'dizziness_vertigo',
    title: 'Severe Dizziness & Spinning Vertigo',
    icon: '💫',
    badge: 'Neurology & ENT',
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'faint', 'fainting', 'lightheaded', 'balance', 'unsteady', 'ear ring'],
    aiGreeting: "Dizziness detected. Let's distinguish inner-ear vertigo from low blood pressure:",
    q1: {
      prompt: "What does the dizziness feel like?",
      options: [
        { id: 'room_spinning', label: "The whole room is spinning around me", icon: '🌀', sub: 'Vestibular vertigo / BPPV' },
        { id: 'faint_standing', label: "Vision dims & feeling faint on standing", icon: '🌑', sub: 'Low BP / orthostatic' },
        { id: 'unsteady_balance', label: "Off-balance, walking unsteadily", icon: '🚶', sub: 'Sensory / ataxia' },
        { id: 'ear_ringing', label: "Buzzing / ringing in one ear", icon: '👂', sub: 'Tinnitus / labyrinthitis' }
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
      advice: 'Avoid sudden head movements or quick turns in bed. Sit on edge of bed for 1 minute before standing. An OPD consultation with a neurologist or ENT specialist can perform the Epley canalith repositioning maneuver for instant relief.'
    }
  }
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
  // Free-Text Search & Active Category
  const [inputText, setInputText] = useState<string>('Severe vomiting and stomach cramps since morning');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Dynamic Selected Chips for Q1 and Q2
  const [selectedQ1, setSelectedQ1] = useState<string>('cannot_retain');
  const [selectedQ2, setSelectedQ2] = useState<string>('after_meal');

  // Geo Filters
  const [distanceRadius, setDistanceRadius] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'HOSPITALS' | 'DOCTORS'>('HOSPITALS');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'hosp-1');

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

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
        setSelectedQ1(matched.q1.options[0]?.id || '');
        setSelectedQ2(matched.q2.options[0]?.id || '');
        setIsAiThinking(false);
      }, 250);
    }
  };

  // Direct pill tap
  const handleSelectPill = (cat: SmartCategoryConfig) => {
    setIsAiThinking(true);
    setInputText(cat.title);
    setTimeout(() => {
      setSelectedCategoryId(cat.id);
      setSelectedQ1(cat.q1.options[0]?.id || '');
      setSelectedQ2(cat.q2.options[0]?.id || '');
      setIsAiThinking(false);
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

  return (
    <div className="space-y-4 pb-36 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. SEAMLESS AI HEADER & INPUT (CLEAN, SUBTLE, SINGLE-SCREEN)               */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-44 bg-gradient-to-br from-sky-100/50 via-indigo-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Animated Siri Orb & Friendly Status */}
        <div className="flex items-center gap-3.5">
          <SiriOrb size={54} state={isAiThinking ? "thinking" : "idle"} />
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60">
              <Sparkles className="w-3 h-3 text-sky-500 animate-pulse" />
              <span>B Care Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-slate-500 font-normal">Active Local Triage</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
              How can I help you feel better, {patientProfile.name.split(' ')[0] || 'Ramesh'}?
            </h2>
            <p className="text-xs text-slate-500 truncate">
              Describe any symptom, illness, or discomfort below.
            </p>
          </div>
        </div>

        {/* Free-Text Symptom Prompt Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={inputText}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="e.g. Throwing up food, high fever with chills, acute knee pain..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm font-medium rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Subtle Horizontal Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
          {SMART_CLINICAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectPill(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/25 scale-[1.02]'
                    : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC AI CLINICAL INTERACTION & SMART CHIPS (ONE SEAMLESS STREAM)    */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        
        {/* AI Greeting Message Bubble */}
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex-1 bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-0.5">Clinical Assistant:</span>
            {activeCategory.aiGreeting}
          </div>
        </div>

        {/* AI Smart Question 1 Chips */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>{activeCategory.q1.prompt}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeCategory.q1.options.map((opt) => {
              const isSelected = selectedQ1 === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedQ1(opt.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-xs ring-1 ring-sky-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xl shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.sub && <div className="text-[10px] text-slate-500 font-normal">{opt.sub}</div>}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Smart Question 2 Chips */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>{activeCategory.q2.prompt}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeCategory.q2.options.map((opt) => {
              const isSelected = selectedQ2 === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedQ2(opt.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-200'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="text-xl shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.sub && <div className="text-[10px] text-slate-500 font-normal">{opt.sub}</div>}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 stroke-[3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Clinical Diagnostic Card (Right here in the stream) */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-sky-50/50 to-white border border-emerald-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Clinical Match: {activeCategory.diagnosis.confidence}%</span>
                <span>•</span>
                <span className="uppercase">{activeCategory.diagnosis.urgency} Urgency</span>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {activeCategory.diagnosis.specialty}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900">
              {activeCategory.diagnosis.primary}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeCategory.diagnosis.explanation}
            </p>

            <div className="pt-1.5 border-t border-emerald-200/50 text-[11px] text-slate-700 leading-relaxed">
              <strong className="text-emerald-900 font-bold">Physician Advice: </strong>
              {activeCategory.diagnosis.advice}
            </div>
          </div>
        </div>
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
