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
  ChevronLeft,
  AlertTriangle,
  Flame,
  Droplet
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

// ============================================================================
// SMART CLINICAL CATEGORIES (COMPREHENSIVE MULTI-SYMPTOM INTELLIGENCE)
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

interface SmartQuestionOption {
  id: string;
  label: string;
  icon?: string;
  sub?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface SmartCategoryConfig {
  id: ClinicalCategoryId;
  title: string;
  icon: string;
  badge: string;
  keywords: string[];
  // Dynamic Question 2: Clinical Assessment specific to this condition
  q2: {
    question: string;
    subtext: string;
    options: SmartQuestionOption[];
  };
  // Dynamic Question 3: Associated Signs & Red Flags
  q3: {
    question: string;
    subtext: string;
    options: SmartQuestionOption[];
  };
  // Dynamic Question 4: Onset, Duration & Triggers
  q4: {
    question: string;
    subtext: string;
    options: SmartQuestionOption[];
  };
  // Clinical diagnostic reasoning
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
    title: 'Vomiting, Nausea & Food Poisoning',
    icon: '🤢',
    badge: 'Gastroenterology & General Medicine',
    keywords: ['vomit', 'vomiting', 'nausea', 'puke', 'puking', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion'],
    q2: {
      question: 'How frequently are you vomiting, and can you keep liquids down?',
      subtext: 'Critical clinical triage for acute dehydration and electrolyte depletion.',
      options: [
        { id: 'cannot_retain', label: "Cannot keep any water or fluids down", icon: '⚠️', sub: 'High risk of acute dehydration', severity: 'CRITICAL' },
        { id: 'vomiting_bile', label: "Vomiting food & clear/yellowish bile", icon: '🤢', sub: '3 to 5 times today', severity: 'MEDIUM' },
        { id: 'nausea_dry_heave', label: "Severe nausea with dry retching", icon: '🌀', sub: 'Queasy stomach, no food staying', severity: 'LOW' },
        { id: 'dark_coffee', label: "Coffee-ground or dark blood-tinged vomit", icon: '🚨', sub: 'Requires immediate emergency review', severity: 'CRITICAL' }
      ]
    },
    q3: {
      question: 'Are you having any of these associated signs?',
      subtext: 'Helps distinguish acute foodborne bacterial toxins from viral gastroenteritis.',
      options: [
        { id: 'watery_stools', label: 'Frequent watery diarrhea / loose stools', icon: '💧' },
        { id: 'stomach_spasms', label: 'Severe cramping abdominal spasms', icon: '⚡' },
        { id: 'chills_fever', label: 'Fever, chills, and muscle shivering', icon: '🌡️' },
        { id: 'postural_dizzy', label: 'Dizziness and lightheadedness when standing', icon: '💫' },
        { id: 'none', label: 'None of these, just acute vomiting', icon: '✨' }
      ]
    },
    q4: {
      question: 'When did it start, and what was the likely trigger?',
      subtext: 'Determines incubation timeline and source of infection.',
      options: [
        { id: 'after_meal', label: 'Started 1 - 6 hrs after outside/restaurant food', sub: 'Classic acute food poisoning toxin', icon: '🍔' },
        { id: 'gradual_today', label: 'Started earlier today (< 24 hrs ago)', sub: 'Acute stomach irritation or viral bug', icon: '⏱️' },
        { id: 'few_days', label: 'Ongoing for 2 to 3 days', sub: 'Persistent infectious gastroenteritis', icon: '🗓️' },
        { id: 'chronic_flare', label: 'Recurrent nausea episodes over weeks', sub: 'Chronic gastritis, ulcer, or gall bladder', icon: '🔄' }
      ]
    },
    diagnosis: {
      primary: 'Acute Infectious Gastroenteritis & Dehydration Risk',
      confidence: 95,
      specialty: 'General Medicine',
      secondary: 'Foodborne Staphylococcal / Enterotoxin Triage',
      urgency: 'PRIORITY',
      explanation: 'Symptom profile indicates acute gastrointestinal mucosal inflammation. Immediate priority is preventing systemic electrolyte imbalance and hypovolemia.',
      advice: 'Take oral rehydration salts (ORS) in small sips every 5 minutes. Avoid milk, solid dairy, or oily foods. If unable to retain liquids for over 6 hours, an in-person OPD token is recommended for IV fluid hydration.'
    }
  },
  {
    id: 'fever_infection',
    title: 'High Fever, Chills & Viral Flu',
    icon: '🌡️',
    badge: 'Internal Medicine & Infectious Disease',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'shivers', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'pyrexia', 'sweat'],
    q2: {
      question: 'How high is your body temperature feeling or recorded?',
      subtext: 'Evaluates pyrexia grade and inflammatory response.',
      options: [
        { id: 'high_fever', label: "High fever (> 102°F) with intense chills", icon: '🔥', sub: 'Shivering under blankets, severe heat', severity: 'HIGH' },
        { id: 'moderate_fever', label: "Moderate fever (100°F - 102°F)", icon: '🌡️', sub: 'Noticeable heat with flushed face', severity: 'MEDIUM' },
        { id: 'low_grade', label: "Low-grade fever (99°F - 100°F)", icon: '🌤️', sub: 'Feeling warm, tired, and heavy-headed', severity: 'LOW' },
        { id: 'intermittent_spike', label: "Spiking fever with night sweats", icon: '⚡', sub: 'Comes in waves every 4-6 hours', severity: 'HIGH' }
      ]
    },
    q3: {
      question: 'What other symptoms accompany the fever?',
      subtext: 'Helps screen for Dengue, Influenza, or bacterial infection.',
      options: [
        { id: 'bone_joint_ache', label: 'Severe bone, joint, or eye socket aches', icon: '🦴' },
        { id: 'sore_throat_cough', label: 'Throat pain, dry cough, and runny nose', icon: '🧣' },
        { id: 'skin_petechiae', label: 'Skin rash, red spots, or easy bruising', icon: '🩹' },
        { id: 'vomit_nausea', label: 'Nausea, loss of appetite, or vomiting', icon: '🤢' },
        { id: 'none', label: 'None, isolated fever and weakness', icon: '✨' }
      ]
    },
    q4: {
      question: 'How many days have you had the fever?',
      subtext: 'Day 3 is a crucial clinical checkpoint for blood counts and platelet screening.',
      options: [
        { id: 'day_1', label: 'Day 1 (Started today)', sub: 'Early acute viral phase', icon: '⚡' },
        { id: 'days_2_3', label: 'Day 2 to 3', sub: 'Peak viral response, monitor platelets', icon: '🗓️' },
        { id: 'days_4_7', label: 'Day 4 to 7', sub: 'Prolonged pyrexia, CBC workup advised', icon: '📅' },
        { id: 'over_week', label: 'Over a week', sub: 'Persistent fever, requires lab investigation', icon: '🔄' }
      ]
    },
    diagnosis: {
      primary: 'Acute Viral Pyrexia & Flu-Like Syndrome',
      confidence: 93,
      specialty: 'General Medicine',
      secondary: 'Suspected Dengue / Viral Mononucleosis Protocol',
      urgency: 'PRIORITY',
      explanation: 'Symptom trajectory matches an acute systemic viral or infectious pathogen. Clinical oversight ensures timely monitoring of hematocrit and platelet counts.',
      advice: 'Maintain high fluid intake (coconut water, ORS, soups). Sponge with lukewarm water if fever exceeds 101°F. Avoid self-medicating with aspirin or NSAIDs; take paracetamol if prescribed. In-person OPD consult is advised if fever extends past 48 hours.'
    }
  },
  {
    id: 'cough_breathing',
    title: 'Cough, Cold & Breathlessness',
    icon: '🫁',
    badge: 'Pulmonology & Respiratory Medicine',
    keywords: ['cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis', 'chest congestion'],
    q2: {
      question: 'Is your breathing affected at rest or on walking?',
      subtext: 'Evaluates oxygenation reserve and airway resistance.',
      options: [
        { id: 'short_breath_rest', label: "Breathlessness even while resting or talking", icon: '⚠️', sub: 'High clinical priority', severity: 'CRITICAL' },
        { id: 'audible_wheeze', label: "Chest wheezing or whistling breath", icon: '🫁', sub: 'Bronchial airway constriction', severity: 'HIGH' },
        { id: 'normal_breath', label: "Breathing is normal, just persistent coughing", icon: '🗣️', sub: 'Upper airway irritation', severity: 'LOW' },
        { id: 'night_cough', label: "Worse when lying flat at night", icon: '🌙', sub: 'Post-nasal drip or asthma trigger', severity: 'MEDIUM' }
      ]
    },
    q3: {
      question: 'What kind of cough or sputum do you have?',
      subtext: 'Helps differentiate viral bronchitis from bacterial pneumonia.',
      options: [
        { id: 'dry_hacking', label: 'Dry, tickling, persistent hack', icon: '🌵' },
        { id: 'thick_yellow_phlegm', label: 'Productive with thick yellow/green phlegm', icon: '🟡' },
        { id: 'blood_tinged', label: 'Blood streaks in sputum [Urgent]', icon: '🚨' },
        { id: 'chest_soreness', label: 'Pain behind breastbone when coughing', icon: '🫀' },
        { id: 'none', label: 'Clear phlegm / simple cold', icon: '✨' }
      ]
    },
    q4: {
      question: 'How long has this respiratory issue been present?',
      subtext: 'Differentiates acute upper respiratory infection from chronic bronchospasm.',
      options: [
        { id: 'under_3_days', label: 'Under 3 days (Acute cold onset)', sub: 'Viral tracheobronchitis', icon: '⚡' },
        { id: 'one_two_weeks', label: '1 to 2 weeks', sub: 'Subacute bronchial congestion', icon: '🗓️' },
        { id: 'over_3_weeks', label: 'Over 3 weeks (Chronic cough)', sub: 'Allergic asthma, post-viral hyperreactivity', icon: '📅' },
        { id: 'known_asthma', label: 'Known asthmatic / seasonal flare', sub: 'Reactive airway bronchospasm', icon: '🔄' }
      ]
    },
    diagnosis: {
      primary: 'Acute Bronchial Hyperreactivity & Upper Respiratory Infection',
      confidence: 91,
      specialty: 'General Medicine',
      secondary: 'Asthmatic Bronchospasm vs Viral Bronchitis',
      urgency: 'ROUTINE',
      explanation: 'Airway irritability and mucosal congestion consistent with respiratory infection or allergic bronchospasm.',
      advice: 'Perform steam inhalation twice daily, drink warm ginger tea, and avoid exposure to cold air, smoke, and fine dust. If shortness of breath occurs at rest, proceed immediately to hospital OPD.'
    }
  },
  {
    id: 'headache_neuro',
    title: 'Throbbing Headache, Migraine & Dizziness',
    icon: '🧠',
    badge: 'Neurology & Headache Clinic',
    keywords: ['headache', 'migraine', 'head', 'temple', 'head hurts', 'throbbing', 'aura', 'cluster headache', 'tension headache', 'sinus head'],
    q2: {
      question: 'What does the headache feel like and where is it centered?',
      subtext: 'Pinpoints vascular vs muscular vs neurological etiology.',
      options: [
        { id: 'one_sided_pulse', label: "Throbbing / pulsing on one side of head", icon: '⚡', sub: 'Classic episodic neurovascular migraine', severity: 'MEDIUM' },
        { id: 'tight_band', label: "Tight vise-like band squeezing whole forehead", icon: '💆', sub: 'Tension-type myofascial strain', severity: 'LOW' },
        { id: 'thunderclap', label: "Sudden explosive 'worst headache of life'", icon: '🚨', sub: 'Immediate clinical priority', severity: 'CRITICAL' },
        { id: 'sinus_pressure', label: "Deep facial pressure behind eyes & cheeks", icon: '👃', sub: 'Sinus congestion / inflammation', severity: 'LOW' }
      ]
    },
    q3: {
      question: 'Are you experiencing sensory changes or nausea?',
      subtext: 'Evaluates neurological aura and autonomic migraine features.',
      options: [
        { id: 'light_sound_phobia', label: 'Sensitivity to light (photophobia) & sound', icon: '💡' },
        { id: 'nausea_vomiting', label: 'Queasy nausea or vomiting with the pain', icon: '🤢' },
        { id: 'visual_aura', label: 'Flashing zigzag lines or blind spots', icon: '✨' },
        { id: 'neck_stiffness', label: 'Severe neck stiffness when bending chin', icon: '🧣' },
        { id: 'none', label: 'None, just the head pain', icon: '✨' }
      ]
    },
    q4: {
      question: 'How often do these headaches occur?',
      subtext: 'Essential for distinguishing acute episodes from chronic migraine syndromes.',
      options: [
        { id: 'first_time', label: 'First severe episode like this', sub: 'Acute clinical evaluation advised', icon: '⚡' },
        { id: 'monthly_few', label: '1 to 2 times a month', sub: 'Recurrent episodic migraine', icon: '🗓️' },
        { id: 'frequent_weekly', label: 'Frequent (Multiple days every week)', sub: 'Chronic migraine / tension cycle', icon: '📅' },
        { id: 'screen_fatigue', label: 'After long computer/screen work sessions', sub: 'Digital eye strain and postural neck trigger', icon: '💻' }
      ]
    },
    diagnosis: {
      primary: 'Episodic Neurovascular Migraine with Photophobia',
      confidence: 94,
      specialty: 'Neurology',
      secondary: 'Tension-Type Myofascial Cephalea',
      urgency: 'ROUTINE',
      explanation: 'Unilateral or throbbing cranial vasodilation exacerbated by sensory stimuli and postural stress.',
      advice: 'Rest in a cool, quiet, dark room. Apply a cold gel compress to forehead and temples. Stay well hydrated with electrolytes. A neurology consultation will provide targeted abortive and preventive migraine therapy.'
    }
  },
  {
    id: 'chest_cardiac',
    title: 'Chest Discomfort, Pressure & Heartburn',
    icon: '🫀',
    badge: 'Cardiology & Emergency Triage',
    keywords: ['chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd', 'substernal'],
    q2: {
      question: 'What is the exact sensation in your chest?',
      subtext: 'Differentiates cardiac ischemic pressure from gastroesophageal reflux.',
      options: [
        { id: 'crushing_heaviness', label: "Crushing heaviness, tightness or squeezing", icon: '⚠️', sub: 'High clinical triage priority', severity: 'CRITICAL' },
        { id: 'burning_acidity', label: "Burning sensation rising into throat / heartburn", icon: '🔥', sub: 'Likely acid reflux (GERD)', severity: 'LOW' },
        { id: 'racing_palpitations', label: "Fluttering, racing or skipped heartbeats", icon: '💓', sub: 'Cardiac arrhythmia / anxiety', severity: 'MEDIUM' },
        { id: 'sharp_breath_pain', label: "Sharp stabbing pain when taking deep breaths", icon: '⚡', sub: 'Pleuritic or rib cartilage (costochondritis)', severity: 'LOW' }
      ]
    },
    q3: {
      question: 'Does the discomfort radiate to other areas?',
      subtext: 'Classical cardiac radiation pathways.',
      options: [
        { id: 'left_arm_jaw', label: 'Radiates to left arm, shoulder, or jaw', icon: '🚨' },
        { id: 'cold_sweat_breath', label: 'Cold sweats and shortness of breath', icon: '💧' },
        { id: 'center_only', label: 'Remains strictly in center of chest / stomach', icon: '🎯' },
        { id: 'back_shoulder_blade', label: 'Radiates through to upper back', icon: '🧘' },
        { id: 'none', label: 'No radiation or secondary signs', icon: '✨' }
      ]
    },
    q4: {
      question: 'When is the discomfort most pronounced?',
      subtext: 'Correlates exertional vs post-prandial triggers.',
      options: [
        { id: 'on_exertion', label: 'During physical exertion or brisk walking', sub: 'Exertional angina indicator', icon: '🏃' },
        { id: 'after_meals', label: '30 - 60 mins after heavy or spicy meals', sub: 'Acid peptic reflux', icon: '🍽️' },
        { id: 'stress_anxiety', label: 'During periods of acute stress or panic', sub: 'Adrenergic stress response', icon: '⚡' },
        { id: 'at_rest_random', label: 'Spontaneously while sitting or resting', sub: 'Requires resting 12-lead ECG review', icon: '🛋️' }
      ]
    },
    diagnosis: {
      primary: 'Gastroesophageal Reflux (GERD) & Atypical Cardiac Triage',
      confidence: 89,
      specialty: 'Cardiology',
      secondary: 'Costochondritis / Anterior Chest Wall Spasm',
      urgency: 'PRIORITY',
      explanation: 'Retrosternal discomfort requires objective cardiac baseline exclusion via ECG alongside gastrointestinal antacid regulation.',
      advice: 'Remain upright and avoid lying down. Do not exert physically. If heaviness spreads to the left arm or is accompanied by sweating, seek immediate hospital emergency care. A prompt OPD ECG offers complete reassurance.'
    }
  },
  {
    id: 'pain_ortho',
    title: 'Back, Neck & Joint Pain / Sprains',
    icon: '🧘',
    badge: 'Orthopedics & Spine Care',
    keywords: ['back', 'back pain', 'lower back', 'neck', 'cervical', 'knee', 'joint', 'spine', 'sciatica', 'shoulder', 'sprain', 'twist', 'muscle ache', 'slip disc'],
    q2: {
      question: 'Which specific joint or spinal area is affected?',
      subtext: 'Locates structural facet, disc, or ligament involvement.',
      options: [
        { id: 'lower_lumbar', label: "Lower back & lumbar spine (with/without sciatica)", icon: '🧘', sub: 'L4-L5/S1 spinal axis strain', severity: 'MEDIUM' },
        { id: 'knee_joint', label: "Knee joint with swelling, clicking or stiffness", icon: '🦵', sub: 'Meniscal or patellar stress', severity: 'MEDIUM' },
        { id: 'cervical_neck', label: "Neck and upper trapezius muscle spasm", icon: '🧣', sub: 'Ergonomic screen posture strain', severity: 'LOW' },
        { id: 'shoulder_arm', label: "Shoulder joint restriction or rotator cuff pain", icon: '🦾', sub: 'Impingement or tendonitis', severity: 'LOW' }
      ]
    },
    q3: {
      question: 'How is your mobility and weight bearing?',
      subtext: 'Assesses neurological nerve compromise and functional limitation.',
      options: [
        { id: 'radiating_leg', label: 'Pain shoots down leg with tingling / numbness', icon: '⚡' },
        { id: 'cannot_bear_weight', label: 'Cannot stand or bear weight on joint', icon: '🚫' },
        { id: 'morning_stiff', label: 'Stiff in morning, eases slightly with movement', icon: '🌅' },
        { id: 'local_ache_only', label: 'Dull muscular ache localized to one spot', icon: '🎯' },
        { id: 'none', label: 'Normal mobility, just painful to bend', icon: '✨' }
      ]
    },
    q4: {
      question: 'How did the pain start?',
      subtext: 'Identifies mechanical trauma versus gradual ergonomic overload.',
      options: [
        { id: 'lifting_twist', label: 'Sudden twist or lifting heavy object', sub: 'Acute ligament or paraspinal muscle tear', icon: '🏋️' },
        { id: 'sports_fall', label: 'Sports injury, slip, or fall', sub: 'Acute joint sprain or contusion', icon: '⚽' },
        { id: 'desk_posture', label: 'Gradual build-up from long desk/sitting hours', sub: 'Postural kyphosis and lordotic fatigue', icon: '🪑' },
        { id: 'woke_up', label: 'Woke up with it this morning', sub: 'Myofascial knot or sleeping posture', icon: '🛏️' }
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
    title: 'Skin Rash, Hives & Allergic Reactions',
    icon: '🩹',
    badge: 'Dermatology & Allergy Medicine',
    keywords: ['rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'blister', 'welts', 'red spots', 'eczema', 'dermatitis'],
    q2: {
      question: 'What does the skin irritation look like?',
      subtext: 'Identifies urticaria, contact dermatitis, or fungal infection.',
      options: [
        { id: 'raised_hives', label: "Raised, itchy pink wheals / hives that move", icon: '🔴', sub: 'Acute urticaria reaction', severity: 'MEDIUM' },
        { id: 'red_patchy_bumps', label: "Red patchy bumps or rough scaly eczema", icon: '🩹', sub: 'Contact dermatitis or irritation', severity: 'LOW' },
        { id: 'blisters_peeling', label: "Fluid-filled blisters or peeling skin", icon: '💧', sub: 'Requires specialized dermatological review', severity: 'HIGH' },
        { id: 'spreading_hot_rash', label: "Spreading warm red rash with fever", icon: '🔥', sub: 'Possible cellulitis / bacterial skin infection', severity: 'CRITICAL' }
      ]
    },
    q3: {
      question: 'Any facial or respiratory involvement?',
      subtext: 'Screens for anaphylaxis and angioedema.',
      options: [
        { id: 'lip_eye_swelling', label: 'Swelling of lips, tongue, or eyelids [Urgent]', icon: '🚨' },
        { id: 'throat_tightness', label: 'Difficulty breathing or swallowing [Urgent]', icon: '⚠️' },
        { id: 'body_itching_only', label: 'Intense itching confined purely to skin', icon: '✋' },
        { id: 'scalp_groin_itch', label: 'Itching mainly in skin folds or scalp', icon: '🧴' },
        { id: 'none', label: 'None, isolated rash without swelling', icon: '✨' }
      ]
    },
    q4: {
      question: 'What was the possible trigger or exposure?',
      subtext: 'Correlates allergen exposure and onset.',
      options: [
        { id: 'new_medication', label: 'Started a new medication, antibiotic or pill', sub: 'Drug-induced hypersensitivity', icon: '💊' },
        { id: 'food_allergy', label: 'Ate shellfish, nuts, eggs, or street food', sub: 'Food-triggered histamine release', icon: '🍤' },
        { id: 'insect_plant', label: 'Insect bite, plant contact, or new soap', sub: 'Contact dermatitis or bite reaction', icon: '🌿' },
        { id: 'unknown_trigger', label: 'Unknown, appeared suddenly out of nowhere', sub: 'Idiopathic acute urticaria', icon: '❓' }
      ]
    },
    diagnosis: {
      primary: 'Acute Urticaria & Allergic Contact Dermatitis',
      confidence: 92,
      specialty: 'Dermatology',
      secondary: 'Histaminergic Cutaneous Hypersensitivity',
      urgency: 'ROUTINE',
      explanation: 'Mast cell degranulation and cutaneous histamine release causing erythematous pruritic wheals.',
      advice: 'Do not scratch or apply hot water, which triggers further histamine release. Apply calamine lotion or cool compresses. If facial or lip swelling develops, seek urgent hospital attention immediately.'
    }
  },
  {
    id: 'urinary_kidney',
    title: 'Burning Urination, Flank Pain & UTI',
    icon: '💧',
    badge: 'Urology & Nephrology Care',
    keywords: ['urine', 'urination', 'burning', 'uti', 'kidney', 'flank', 'bladder', 'peeing', 'urinary', 'kidney stone'],
    q2: {
      question: 'What specific urinary discomfort are you experiencing?',
      subtext: 'Assesses lower urinary tract versus renal calculi involvement.',
      options: [
        { id: 'burning_pee', label: "Sharp burning sensation while passing urine", icon: '🔥', sub: 'Classic acute urethritis / cystitis', severity: 'MEDIUM' },
        { id: 'sharp_flank_pain', label: "Severe knife-like pain in lower back/flank", icon: '⚡', sub: 'Possible renal calculus (kidney stone)', severity: 'HIGH' },
        { id: 'frequent_urgency', label: "Urge to urinate every few minutes with tiny drops", icon: '⏱️', sub: 'Bladder tenesmus & irritation', severity: 'LOW' },
        { id: 'blood_in_urine', label: "Cloudy, foul-smelling, or reddish urine", icon: '🚨', sub: 'Hematuria / acute infection', severity: 'HIGH' }
      ]
    },
    q3: {
      question: 'Are you having any systemic symptoms?',
      subtext: 'Screens for upper kidney infection (pyelonephritis).',
      options: [
        { id: 'fever_with_shivers', label: 'High fever with uncontrollable shivering chills', icon: '🌡️' },
        { id: 'nausea_vomiting', label: 'Nausea and vomiting with back spasm', icon: '🤢' },
        { id: 'pelvic_heaviness', label: 'Heavy pressure / ache in lower pelvic area', icon: '🧘' },
        { id: 'none', label: 'None, just isolated burning sensation', icon: '✨' }
      ]
    },
    q4: {
      question: 'How long has this been present?',
      subtext: 'Essential for deciding between routine oral antibiotics and lab culture.',
      options: [
        { id: 'today_started', label: 'Started in the past 24 hours', sub: 'Acute lower UTI', icon: '⚡' },
        { id: 'few_days', label: '2 to 4 days of burning', sub: 'Progressing urinary infection', icon: '🗓️' },
        { id: 'recurrent_history', label: 'History of frequent kidney stones / UTIs', sub: 'Recurrent calculus or cystitis', icon: '🔄' },
        { id: 'post_travel', label: 'Started after travel or low water intake', sub: 'Concentrated urine / dehydration', icon: '🚗' }
      ]
    },
    diagnosis: {
      primary: 'Acute Lower Urinary Tract Infection (UTI) & Urethritis',
      confidence: 93,
      specialty: 'General Medicine',
      secondary: 'Suspected Micro-Calculus / Renal Gravel',
      urgency: 'ROUTINE',
      explanation: 'Bacterial colonization of the urothelium causing dysuria and bladder tenesmus.',
      advice: 'Significantly increase fluid intake (3+ liters of water daily). Avoid coffee, alcohol, and spicy spices that irritate the bladder lining. A urine routine and culture test at hospital OPD is recommended for targeted antibiotic clearance.'
    }
  },
  {
    id: 'dizziness_vertigo',
    title: 'Severe Dizziness, Vertigo & Fainting',
    icon: '💫',
    badge: 'Neurology & ENT Medicine',
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'faint', 'fainting', 'lightheaded', 'balance', 'unsteady', 'ear ring'],
    q2: {
      question: 'What is the sensation of dizziness feeling like?',
      subtext: 'Differentiates true vestibular vertigo from presyncope / low BP.',
      options: [
        { id: 'room_spinning', label: "The entire room is spinning around me", icon: '🌀', sub: 'Vestibular labyrinthitis / BPPV', severity: 'HIGH' },
        { id: 'blackout_standing', label: "Vision dims & feeling faint when standing up", icon: '🌑', sub: 'Orthostatic hypotension / low BP', severity: 'MEDIUM' },
        { id: 'floating_unsteady', label: "Off-balance, floating, walking like drunk", icon: '🚶', sub: 'Cerebellar or sensory ataxia', severity: 'MEDIUM' },
        { id: 'sudden_collapse', label: "Actual brief loss of consciousness / syncope", icon: '🚨', sub: 'Requires immediate medical evaluation', severity: 'CRITICAL' }
      ]
    },
    q3: {
      question: 'Are there any ear symptoms or ringing?',
      subtext: 'Pinpoints inner ear semicircular canal involvement.',
      options: [
        { id: 'tinnitus_ringing', label: 'Ringing, buzzing, or hissing in one ear', icon: '👂' },
        { id: 'ear_fullness', label: 'Clogged / blocked sensation in ear', icon: '🎧' },
        { id: 'intense_nausea', label: 'Severe motion sickness and vomiting', icon: '🤢' },
        { id: 'speech_arm_weak', label: 'Slurred speech or arm weakness [Immediate]', icon: '🚨' },
        { id: 'none', label: 'No ear signs, just lightheadedness', icon: '✨' }
      ]
    },
    q4: {
      question: 'When is the dizziness triggered?',
      subtext: 'Crucial for identifying Benign Paroxysmal Positional Vertigo (BPPV).',
      options: [
        { id: 'head_turning_bed', label: 'When rolling over in bed or looking up', sub: 'Classic positional canalithiasis (BPPV)', icon: '🛏️' },
        { id: 'prolonged_standing', label: 'After standing in queues or hot weather', sub: 'Vasovagal / dehydration pooling', icon: '☀️' },
        { id: 'continuous_days', label: 'Continuous spinning for hours or days', sub: 'Vestibular neuritis', icon: '🗓️' },
        { id: 'fasting_hunger', label: 'When skipping meals (low blood sugar)', sub: 'Hypoglycemic presyncope', icon: '🍽️' }
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
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Wizard Step: 1 = Category & Symptom Input, 2 = Clinical Assessment, 3 = Associated Signs, 4 = Triggers & Timing, 5 = Geo Results
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Smooth scroll to top when changing steps
  const goToStep = (step: number) => {
    setCurrentStep(step);
    if (containerRef.current) {
      let parent = containerRef.current.parentElement;
      while (parent) {
        if (parent.scrollHeight > parent.clientHeight) {
          parent.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        }
        parent = parent.parentElement;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDocName = (name?: string) => {
    if (!name) return 'Specialist';
    return name.startsWith('Dr.') || name.startsWith('Dr ') ? name : `Dr. ${name}`;
  };

  // Form State
  const [searchQuery, setSearchQuery] = useState<string>('Severe vomiting and stomach cramps since morning');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');

  // Dynamic Answers for Steps 2, 3, 4
  const [q2Answer, setQ2Answer] = useState<string>('');
  const [q3Answers, setQ3Answers] = useState<string[]>([]);
  const [q4Answer, setQ4Answer] = useState<string>('');

  // Geo & Filter State
  const [distanceRadius, setDistanceRadius] = useState<number>(10); // 5km, 10km, 25km
  const [viewMode, setViewMode] = useState<'HOSPITALS' | 'DOCTORS'>('HOSPITALS');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'hosp-1');

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Intelligent Free-Text Parser: parses typed text in real time to automatically select the right clinical category!
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    const lower = text.toLowerCase();
    const matched = SMART_CLINICAL_CATEGORIES.find(cat => 
      cat.keywords.some(kw => lower.includes(kw))
    );
    if (matched && matched.id !== selectedCategoryId) {
      setSelectedCategoryId(matched.id);
      // Reset subsequent questions for the new category
      setQ2Answer('');
      setQ3Answers([]);
      setQ4Answer('');
    }
  };

  // Select category chip directly
  const handleSelectCategory = (cat: SmartCategoryConfig) => {
    setSelectedCategoryId(cat.id);
    setSearchQuery(cat.title);
    setQ2Answer('');
    setQ3Answers([]);
    setQ4Answer('');
  };

  // Toggle multi-select signs in Question 3
  const handleToggleQ3 = (optionId: string) => {
    if (optionId === 'none') {
      setQ3Answers(['none']);
      return;
    }
    const filtered = q3Answers.filter(a => a !== 'none');
    if (filtered.includes(optionId)) {
      setQ3Answers(filtered.filter(a => a !== optionId));
    } else {
      setQ3Answers([...filtered, optionId]);
    }
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

  // Matched doctors filtered by recommended specialty
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

  return (
    <div ref={containerRef} className="space-y-4 pb-36 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* LIGHT & SMOOTH HEADER WITH ANIMATED SIRI ORB                              */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-4.5 sm:p-5 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/60 via-indigo-50/40 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-100/40 to-transparent rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Smart Clinical Triage AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 font-normal">Context-Aware Diagnostics</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {currentStep <= 4 ? "Adaptive Health Intake" : "Verified Clinical Matches"}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              {currentStep <= 4 
                ? "Unlike rigid questionnaires, our clinical engine adapts follow-up questions directly to your specific condition."
                : `Triaged for ${activeCategory.diagnosis.specialty} in Coimbatore. Choose an accredited hospital or doctor below.`}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0 pr-1">
            <SiriOrb size={52} state={currentStep <= 4 ? "thinking" : "idle"} />
            <span className="text-[10px] text-sky-600 font-medium mt-1 tracking-tight">
              {currentStep <= 4 ? "Active Engine" : "Ready to Book"}
            </span>
          </div>
        </div>

        {/* 4-Step Adaptive Progress Bar */}
        <div className="relative z-10 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between gap-1.5">
            {[
              { num: 1, label: 'Primary Issue' },
              { num: 2, label: 'Clinical Assessment' },
              { num: 3, label: 'Associated Signs' },
              { num: 4, label: 'Onset & Triggers' },
              { num: 5, label: 'Geo Match' }
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (isPast || currentStep === 5) goToStep(step.num);
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
      {/* STEP 1: WHAT'S THE PRIMARY PROBLEM? (FULL MULTI-SYMPTOM SUPPORT)           */}
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
                <h3 className="text-base sm:text-lg font-bold text-slate-900">What's your primary health issue?</h3>
                <p className="text-xs text-slate-500">Type what you feel or tap any clinical category below.</p>
              </div>
              <span className="text-2xl">{activeCategory.icon}</span>
            </div>

            {/* Natural Language Free-Text Symptom Input with Live AI Parser */}
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="e.g. Terrible vomiting since morning, high fever with shivers, knee swelling..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-slate-900 text-sm font-medium rounded-2xl border border-slate-200 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live Detected Clinical Branch Badge */}
              <div className="flex items-center gap-1.5 px-2 text-[11px] text-slate-600">
                <span>Detected Medical Branch:</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 font-bold flex items-center gap-1">
                  <span>{activeCategory.icon}</span>
                  <span>{activeCategory.title}</span>
                </span>
              </div>
            </div>

            {/* Broad Health Category Grid (Not Just Pain!) */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Or Select a Medical Category:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SMART_CLINICAL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/90 border-sky-300 text-sky-950 shadow-sm ring-1 ring-sky-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <span className="text-xl shrink-0">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{cat.title}</div>
                        <div className="text-[10px] text-slate-500">{cat.badge}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Continue to Tailored Question 2 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => goToStep(2)}
                disabled={!searchQuery.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue: Clinical Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: TAILORED CLINICAL ASSESSMENT (CONDITION-SPECIFIC)                 */}
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
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Question 2 of 4 • {activeCategory.title}</span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeCategory.q2.question}</h3>
                <p className="text-xs text-slate-500">{activeCategory.q2.subtext}</p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Smart Tailored Options for Question 2 */}
            <div className="space-y-2.5">
              {activeCategory.q2.options.map((opt) => {
                const isSelected = q2Answer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setQ2Answer(opt.id);
                      // Smooth auto-advance after quick tap
                      setTimeout(() => goToStep(3), 200);
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-sm ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                      {opt.sub && <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>}
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
                onClick={() => goToStep(1)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(3)}
                disabled={!q2Answer}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continue: Associated Signs</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: ASSOCIATED SIGNS & RED FLAGS (TAILORED)                           */}
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
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeCategory.q3.question}</h3>
                <p className="text-xs text-slate-500">{activeCategory.q3.subtext}</p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Smart Multi-Select Options for Question 3 */}
            <div className="space-y-2.5">
              {activeCategory.q3.options.map((opt) => {
                const isSelected = q3Answers.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleQ3(opt.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-sm ring-1 ring-sky-200 text-sky-950 font-bold'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-xl shrink-0">{opt.icon}</span>
                    <span className="flex-1 text-sm font-semibold">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation CTA */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(4)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Continue: Onset & Triggers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: ONSET, DURATION & TRIGGERS (TAILORED)                             */}
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
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{activeCategory.q4.question}</h3>
                <p className="text-xs text-slate-500">{activeCategory.q4.subtext}</p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* Smart Tailored Options for Question 4 */}
            <div className="space-y-2.5">
              {activeCategory.q4.options.map((opt) => {
                const isSelected = q4Answer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setQ4Answer(opt.id);
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 shadow-sm ring-2 ring-sky-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{opt.label}</div>
                      {opt.sub && <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 stroke-[3] shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation CTA: Lead to Geo Results */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep(3)}
                className="px-4 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => goToStep(5)}
                className="flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-600 hover:to-sky-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                <span>Find Accredited Care Nearby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: INTELLIGENT CLINICAL ASSESSMENT & GEO MATCH                       */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {/* Clinical Diagnostic Card */}
          <div className="bg-gradient-to-br from-white via-sky-50/40 to-emerald-50/30 rounded-3xl border border-sky-200/90 p-4.5 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical Match: {activeCategory.diagnosis.confidence}% Confidence</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700">{activeCategory.diagnosis.urgency} Urgency</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {activeCategory.diagnosis.primary}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeCategory.diagnosis.explanation}
                </p>
              </div>

              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-Triage
              </button>
            </div>

            {/* Doctor's Immediate Clinical Guidance */}
            <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200/80 text-xs text-sky-900 leading-relaxed">
              <strong className="text-sky-950 font-bold block mb-0.5">Clinical Protocol & Self-Care Advice:</strong>
              {activeCategory.diagnosis.advice}
            </div>

            <div className="pt-2 border-t border-sky-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Recommended Specialty:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                {activeCategory.diagnosis.specialty}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Protocol: <strong>{activeCategory.diagnosis.secondary}</strong></span>
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
                  <div className="text-[11px] text-slate-500">
                    Showing accredited facilities with available {activeCategory.diagnosis.specialty} slots
                  </div>
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
                  d.specialty.toLowerCase().includes(activeCategory.diagnosis.specialty.toLowerCase())
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
                        Physician: <strong>{formatDocName(assignedDoctor?.name)}</strong> ({assignedDoctor?.specialty})
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
                            <h4 className="text-sm font-bold text-slate-900">{formatDocName(doc.name)}</h4>
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
