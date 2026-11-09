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
  RotateCcw,
  Waves,
  Bone,
  Thermometer,
  Wind,
  HeartPulse,
  Brain,
  Eye,
  Ear,
  Smile,
  Droplets,
  ShieldAlert,
  HeartHandshake,
  Baby,
  Syringe,
  Moon,
  FlaskConical,
  Bandage,
  Stethoscope,
  MoreHorizontal,
  Navigation,
  Crosshair,
  ExternalLink,
  Layers,
  Plus,
  Minus,
  LocateFixed,
  Car,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

// ============================================================================
// CLINICAL AI KNOWLEDGE BASE (18 COMPREHENSIVE MEDICAL SPECIALTIES)
// ============================================================================
export type ClinicalCategoryId = 
  | 'vomiting_gi'
  | 'pain_ortho'
  | 'fever_infection'
  | 'cough_breathing'
  | 'chest_cardiac'
  | 'headache_neuro'
  | 'eye_vision'
  | 'ent_throat'
  | 'dental_oral'
  | 'urinary_kidney'
  | 'skin_allergy'
  | 'womens_health'
  | 'pediatrics_child'
  | 'diabetes_endocrine'
  | 'mental_sleep'
  | 'trauma_firstaid'
  | 'diagnostics_lab'
  | 'general_other';

interface SmartChipOption {
  id: string;
  label: string;
  sub?: string;
}

interface SmartCategoryConfig {
  id: ClinicalCategoryId;
  title: string;
  badge: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
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
    title: 'Stomach & GI',
    badge: 'Gastroenterology',
    icon: Waves,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    keywords: ['vomit', 'vomiting', 'nausea', 'puke', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion', 'stomach cramp', 'belly pain', 'gastric'],
    spokenIntro: "I have noted gastrointestinal distress. How severe is your fluid retention and vomiting right now?",
    q2: {
      prompt: "Can you keep fluids down right now?",
      sub: "Evaluates acute dehydration and gastrointestinal toxicity",
      options: [
        { id: 'cannot_retain', label: "Unable to keep any water or liquids down", sub: "High risk of acute dehydration and electrolyte loss" },
        { id: 'vomiting_food', label: "Frequent vomiting with acute abdominal spasms", sub: "Multiple episodes today with severe cramping" },
        { id: 'nausea_only', label: "Persistent continuous nausea and dry retching", sub: "Continuous queasiness, difficulty tolerating food" },
        { id: 'loose_stool', label: "Mild indigestion, nausea, and loose stool", sub: "Manageable discomfort, able to drink small sips" }
      ]
    },
    diagnosis: {
      primary: 'Acute Foodborne Gastroenteritis & Dehydration Risk',
      confidence: 96,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Symptom trajectory is consistent with acute infectious gastroenteritis or foodborne enterotoxin reaction with mucosal irritation. Primary immediate priority is preventing electrolyte loss and hypovolemia.',
      advice: 'Take oral rehydration salts (ORS) in small sips every 5 minutes. Avoid dairy and solid food for 4 hours. If unable to hold water past 6 hours, in-person OPD IV hydration is strongly advised.',
      spokenSummary: "This indicates acute foodborne gastroenteritis with dehydration risk. Oral rehydration salts are recommended. City Care Hospital nearby has OPD Token number 4 ready for immediate booking."
    }
  },
  {
    id: 'pain_ortho',
    title: 'Spine & Joints',
    badge: 'Orthopedics',
    icon: Bone,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    keywords: ['pain', 'back', 'lower back', 'neck', 'spine', 'joint', 'knee', 'shoulder', 'sciatica', 'sprain', 'twist', 'muscle', 'ache', 'slip disc', 'cervical', 'lumbar'],
    spokenIntro: "Musculoskeletal pain noted. How intense is the pain and does it limit your movement?",
    q2: {
      prompt: "How intense is the pain & mobility restriction?",
      sub: "Distinguishes acute nerve compression from postural muscular strain",
      options: [
        { id: 'sharp_incapacitating', label: "Severe pain, unable to bear weight or walk", sub: "Acute structural joint or lumbar spine distress" },
        { id: 'radiating_nerve', label: "Sharp radiating pain shooting down leg or arm", sub: "Suspected nerve root irritation or Sciatica" },
        { id: 'constant_ache', label: "Constant moderate ache and joint stiffness", sub: "Painful during bending, walking, or lifting" },
        { id: 'mild_strain', label: "Mild muscular soreness or postural strain", sub: "Low-level discomfort, manageable with rest" }
      ]
    },
    diagnosis: {
      primary: 'Lumbar Spondylosis & Paraspinal Myofascial Strain',
      confidence: 95,
      specialty: 'Orthopedics',
      urgency: 'ROUTINE',
      explanation: 'Biomechanical facet joint strain and muscular paraspinal guarding without acute cauda equina or progressive motor deficits.',
      advice: 'Avoid forward bending and heavy lifting. Apply warm fomentation to ease muscular spasms. An orthopedic consultation will provide targeted anti-inflammatory care.',
      spokenSummary: "Likely lumbar spondylosis with paraspinal muscle strain. Avoid heavy lifting. Top orthopedic physicians in Coimbatore South are available today."
    }
  },
  {
    id: 'fever_infection',
    title: 'Fever & Infection',
    badge: 'Internal Medicine',
    icon: Thermometer,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    keywords: ['fever', 'temperature', 'chills', 'shivering', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'cold', 'sore throat', 'cough', 'pyrexia'],
    spokenIntro: "Fever detected. How high is your temperature feeling right now?",
    q2: {
      prompt: "What is your temperature level and associated signs?",
      sub: "Screens for acute viral pyrexia, Dengue, and systemic infection",
      options: [
        { id: 'high_fever_chills', label: "High fever (> 102°F) with intense shaking chills", sub: "High-grade pyrexia with persistent rigors" },
        { id: 'fever_body_ache', label: "Fever with intense eye socket and joint aches", sub: "Screening indicator for Dengue / Chikungunya" },
        { id: 'fever_cough', label: "Moderate fever with cough and sore throat", sub: "Upper respiratory viral influenza signs" },
        { id: 'low_grade', label: "Mild low-grade fever started today", sub: "Feeling fatigued and warm (< 100°F)" }
      ]
    },
    diagnosis: {
      primary: 'Acute Viral Pyrexia & Flu-Like Syndrome',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Clinical trajectory indicates systemic viral pyrexia. Close clinical monitoring of hydration, complete blood count, and platelet levels is advised.',
      advice: 'Maintain aggressive oral hydration (coconut water, ORS, clear broth). Sponge with lukewarm water if temperature exceeds 101°F. Consult a physician for proper antipyretic dosing.',
      spokenSummary: "Clinical analysis indicates acute viral pyrexia. Hydration is prioritized. Top general physicians in Coimbatore South are available for walk-in or video booking."
    }
  },
  {
    id: 'chest_cardiac',
    title: 'Heart & Chest',
    badge: 'Cardiology',
    icon: HeartPulse,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    keywords: ['chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd'],
    spokenIntro: "Chest sensation detected. Let's distinguish gastric acid reflux from cardiac warning signs.",
    q2: {
      prompt: "What is the character of your chest discomfort?",
      sub: "Differentiates retrosternal acid reflux from cardiovascular indicators",
      options: [
        { id: 'burning_acidity', label: "Burning sensation rising into chest after meals", sub: "Classic gastroesophageal reflux (GERD)" },
        { id: 'heavy_pressure', label: "Heavy squeezing or crushing sensation across mid-chest", sub: "Priority cardiovascular baseline screening" },
        { id: 'palpitations', label: "Rapid fluttering or skipping heartbeats", sub: "Arrhythmia or adrenergic stress response" },
        { id: 'sharp_breath', label: "Sharp localized pain that changes with deep breaths", sub: "Costochondral or chest wall muscular discomfort" }
      ]
    },
    diagnosis: {
      primary: 'Gastroesophageal Reflux (GERD) & Cardiovascular Triage',
      confidence: 91,
      specialty: 'Cardiology',
      urgency: 'PRIORITY',
      explanation: 'Retrosternal discomfort requires an objective resting ECG alongside gastrointestinal antacid regulation to rule out atypical cardiac ischemia.',
      advice: 'Remain sitting upright. Avoid heavy exertion or lying flat. If heaviness radiates to your left arm or jaw with cold sweating, seek emergency OPD care immediately. A resting 12-lead ECG is recommended.',
      spokenSummary: "Clinical analysis notes retrosternal acid reflux with cardiac screening advised. Resting ECG is available at City Care Hospital."
    }
  },
  {
    id: 'headache_neuro',
    title: 'Brain & Headache',
    badge: 'Neurology',
    icon: Brain,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    keywords: ['headache', 'migraine', 'head', 'throbbing', 'aura', 'dizziness', 'vertigo', 'spinning', 'temple', 'balance'],
    spokenIntro: "Cranial discomfort detected. What does the headache feel like?",
    q2: {
      prompt: "What is the pattern of your head discomfort or balance?",
      sub: "Distinguishes neurovascular migraine from vestibular vertigo",
      options: [
        { id: 'throbbing_unilateral', label: "Pulsating throbbing pain on one side of head", sub: "Unilateral neurovascular migraine with light sensitivity" },
        { id: 'room_spinning', label: "Room spinning sensation or loss of balance (Vertigo)", sub: "Vestibular or benign positional inner-ear disturbance" },
        { id: 'band_tension', label: "Tight band-like squeezing pressure across forehead", sub: "Tension-type cephalea from screen strain and posture" },
        { id: 'mild_dull', label: "Mild dull ache with general fatigue", sub: "Low-grade tension or sleep deprivation" }
      ]
    },
    diagnosis: {
      primary: 'Episodic Neurovascular Migraine with Sensory Sensitivity',
      confidence: 94,
      specialty: 'Neurology',
      urgency: 'ROUTINE',
      explanation: 'Cranial vasodilation exacerbated by visual stimuli, fatigue, or stress without acute neurological focal deficits.',
      advice: 'Rest in a cool, dark, quiet room. Apply a cold compress to temples. Stay hydrated. Consult a doctor for targeted abortive therapy.',
      spokenSummary: "Symptoms match an episodic neurovascular migraine. Rest in a dark room. Neurological care centers nearby are available today."
    }
  },
  {
    id: 'dental_oral',
    title: 'Dental & Oral',
    badge: 'Dentistry',
    icon: Smile,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    keywords: ['tooth', 'teeth', 'dental', 'gum', 'dentist', 'toothache', 'molar', 'mouth', 'cavity', 'jaw', 'ulcer'],
    spokenIntro: "Dental discomfort noted. Is there constant throbbing pain or sensitivity to cold and heat?",
    q2: {
      prompt: "What is the nature of your tooth or gum discomfort?",
      sub: "Evaluates acute pulpitis, dental abscess, and gum infection",
      options: [
        { id: 'throbbing_toothache', label: "Continuous severe throbbing toothache with cheek swelling", sub: "Acute dental pulpitis or periapical abscess risk" },
        { id: 'cold_hot_sensitivity', label: "Sharp shooting pain when drinking cold, hot, or sweet", sub: "Dentin exposure, enamel decay, or deep cavity" },
        { id: 'bleeding_gums', label: "Swollen, tender, bleeding gums or painful mouth ulcers", sub: "Gingivitis or aphthous mucosal ulceration" },
        { id: 'chipped_molar', label: "Chipped or broken tooth edge causing cheek cuts", sub: "Mechanical dental fracture requiring restoration" }
      ]
    },
    diagnosis: {
      primary: 'Acute Dental Pulpitis & Periapical Inflammatory Protocol',
      confidence: 95,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Deep dentin or pulp canal inflammation resulting in localized periapical pressure and hypersensitivity.',
      advice: 'Rinse with warm salt water. Avoid very hot, cold, or sugary drinks. Do not apply aspirin directly to the gum. An immediate dental OPD token ensures pulp relief.',
      spokenSummary: "Identified acute dental pulpitis. Avoid cold liquids. City Care Hospital dental department has tokens open for walk-in treatment."
    }
  },
  {
    id: 'skin_allergy',
    title: 'Skin & Allergy',
    badge: 'Dermatology',
    icon: ShieldAlert,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    keywords: ['rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'welts', 'red spots', 'eczema', 'bite', 'dermatitis'],
    spokenIntro: "Dermatological reaction detected. Are you having raised hives or any facial swelling?",
    q2: {
      prompt: "What does the skin reaction look like?",
      sub: "Screens for acute urticaria versus systemic angioedema",
      options: [
        { id: 'raised_hives', label: "Raised itchy red welts or hives (Urticaria)", sub: "Acute cutaneous histamine flare" },
        { id: 'facial_swelling', label: "Swelling of lips, eyelids, or facial tissue", sub: "Urgent allergy review / potential angioedema" },
        { id: 'dry_patches', label: "Dry itchy red patches or contact dermatitis", sub: "Irritant or eczema flare" },
        { id: 'mild_itch', label: "Mild surface itching without spreading rash", sub: "Superficial irritant response" }
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
    id: 'cough_breathing',
    title: 'Lungs & Breathing',
    badge: 'Pulmonology',
    icon: Wind,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    keywords: ['cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis', 'congestion'],
    spokenIntro: "Respiratory symptoms detected. Is your breathing labored or accompanied by wheezing?",
    q2: {
      prompt: "Is your breathing restricted or labored?",
      sub: "Assesses airway resistance and bronchial hyperreactivity",
      options: [
        { id: 'breathless_rest', label: "Shortness of breath even while resting or speaking", sub: "Priority respiratory clinical review" },
        { id: 'wheezing_whistle', label: "Chest wheezing or whistling breath on exhale", sub: "Bronchial airway constriction or reactive disease" },
        { id: 'heavy_productive', label: "Deep persistent cough with thick sputum", sub: "Lower respiratory bronchial inflammation" },
        { id: 'dry_tickle', label: "Dry tickling cough without breathing restriction", sub: "Upper airway irritation or post-nasal drip" }
      ]
    },
    diagnosis: {
      primary: 'Acute Bronchial Hyperreactivity & Cough Syndrome',
      confidence: 93,
      specialty: 'General Medicine',
      urgency: 'MODERATE',
      explanation: 'Airway hyperresponsiveness and mucosal congestion consistent with respiratory infection or reactive bronchospasm.',
      advice: 'Perform steam inhalation twice daily and drink warm fluids. Avoid cold drafts, tobacco smoke, and dust. Seek urgent OPD evaluation if breathlessness worsens.',
      spokenSummary: "Assessment suggests bronchial hyperreactivity and airway congestion. Steam inhalation is recommended, and verified physicians are ready nearby."
    }
  },
  {
    id: 'eye_vision',
    title: 'Eye & Vision',
    badge: 'Ophthalmology',
    icon: Eye,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    keywords: ['eye', 'eyes', 'vision', 'red eye', 'blur', 'conjunctivitis', 'stye', 'itchy eye', 'tear', 'sight'],
    spokenIntro: "Eye discomfort detected. Are you experiencing redness, discharge, or blurry vision?",
    q2: {
      prompt: "What eye discomfort or visual changes are you having?",
      sub: "Evaluates acute conjunctivitis versus corneal abrasions",
      options: [
        { id: 'redness_discharge', label: "Severe eye redness with sticky or watery discharge", sub: "Classic acute conjunctivitis (Pink Eye)" },
        { id: 'foreign_body', label: "Sharp foreign body sensation or scratchy pain", sub: "Suspected corneal irritation or foreign particle" },
        { id: 'blur_halos', label: "Sudden blurred vision, floaters, or halos around light", sub: "Requires prompt ophthalmic evaluation" },
        { id: 'stye_lid', label: "Painful localized swelling on eyelid (Stye)", sub: "Blepharitis or meibomian gland inflammation" }
      ]
    },
    diagnosis: {
      primary: 'Acute Conjunctival Inflammation & Ophthalmic Triage',
      confidence: 93,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Surface ocular conjunctival hyperaemia without acute anterior chamber or retinal involvement.',
      advice: 'Do not rub eyes. Wash hands frequently. Avoid wearing contact lenses. If sharp pain or vision drop occurs, seek prompt ophthalmic care.',
      spokenSummary: "Analysis indicates acute conjunctival irritation. Avoid rubbing eyes. Accredited ophthalmic clinics are ready for consultation."
    }
  },
  {
    id: 'ent_throat',
    title: 'Ear, Nose & ENT',
    badge: 'ENT Specialist',
    icon: Ear,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    keywords: ['ear', 'nose', 'throat', 'ent', 'earache', 'sinus', 'sinusitis', 'tonsil', 'tonsillitis', 'swallow', 'hearing', 'nasal'],
    spokenIntro: "ENT symptoms detected. Where is the discomfort primarily localized?",
    q2: {
      prompt: "What specific ENT symptom is affecting you most?",
      sub: "Differentiates otitis media from acute suppurative sinusitis",
      options: [
        { id: 'ear_canal_pain', label: "Sharp throbbing ear canal pain or ear discharge", sub: "Acute otitis externa / middle ear effusion" },
        { id: 'sinus_pressure', label: "Intense facial pressure, nasal blockage, and brow pain", sub: "Maxillary / frontal sinus congestion" },
        { id: 'severe_throat', label: "Severe painful swallowing and swollen tonsils", sub: "Acute pharyngitis or bacterial tonsillitis" },
        { id: 'blocked_nasal', label: "Blocked nasal passages with clear watery drip", sub: "Allergic rhinitis or early cold" }
      ]
    },
    diagnosis: {
      primary: 'Acute Rhino-Sinusitis & Pharyngotonsillar Triage',
      confidence: 92,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Mucosal edema across the upper aerodigestive tract. Clinical inspection rules out suppurative middle ear infection.',
      advice: 'Gargle with warm salt water 3 times daily. Inhale warm steam to relieve sinus pressure. Consult an ENT specialist if ear pain is severe.',
      spokenSummary: "Assessment suggests acute rhino-sinusitis. Salt water gargles and steam inhalation are recommended. Nearby ENT care centers are available."
    }
  },
  {
    id: 'urinary_kidney',
    title: 'Kidney & Urinary',
    badge: 'Urology',
    icon: Droplets,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    keywords: ['urine', 'urination', 'pee', 'peeing', 'uti', 'kidney', 'bladder', 'flank', 'burning urine', 'stone', 'blood urine'],
    spokenIntro: "Urinary symptoms detected. Are you having sharp burning while passing urine or flank pain?",
    q2: {
      prompt: "What specific urinary or flank sensation are you having?",
      sub: "Screens for acute cystitis versus renal calculous colic",
      options: [
        { id: 'burning_dysuria', label: "Sharp burning or stinging while passing urine", sub: "Acute lower urinary tract infection (UTI)" },
        { id: 'flank_colic', label: "Severe knife-like flank pain radiating to groin", sub: "Classic presentation of suspected Kidney Stone" },
        { id: 'frequent_urgency', label: "Urgent bladder urge every few minutes with tiny drops", sub: "Bladder tenesmus and urethral irritation" },
        { id: 'cloudy_red', label: "Reddish, pink, or discolored cloudy urine", sub: "Hematuria indicator requiring urgent urinalysis" }
      ]
    },
    diagnosis: {
      primary: 'Acute Lower Urinary Tract Infection & Renal Calculi Triage',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'PRIORITY',
      explanation: 'Bacterial urothelium irritation or micro-calculus passage causing dysuria and muscular bladder irritability.',
      advice: 'Increase fluid intake to 3+ liters of water daily. Avoid caffeine, alcohol, and hot spices. A urine routine and culture test is recommended for targeted clearance.',
      spokenSummary: "Likely lower urinary tract infection. Increase water intake immediately. Urine culture and general medicine consultation are recommended."
    }
  },
  {
    id: 'womens_health',
    title: "Women's Health",
    badge: 'Gynecology',
    icon: HeartHandshake,
    iconBg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    keywords: ['women', 'female', 'period', 'menstrual', 'cramp', 'pcos', 'pregnancy', 'pregnant', 'bleeding', 'pelvic', 'uterus', 'gynecologist'],
    spokenIntro: "Gynecological symptoms noted. Are you having severe pelvic cramping or cycle irregularities?",
    q2: {
      prompt: "What is your primary gynecological concern?",
      sub: "Assesses spasmodic dysmenorrhea and pelvic reproductive health",
      options: [
        { id: 'severe_pelvic_cramp', label: "Severe incapacitating lower pelvic cramps and back pain", sub: "Acute spasmodic dysmenorrhea" },
        { id: 'irregular_cycle', label: "Irregular cycle, unusual bleeding, or delayed period", sub: "Hormonal ovulatory variation or PCOS check" },
        { id: 'pregnancy_consult', label: "Pregnancy inquiry, morning nausea, or prenatal care", sub: "Obstetric maternal checkup" },
        { id: 'pelvic_fullness', label: "Pelvic pressure, bloating, or unusual discharge", sub: "Benign pelvic floor or localized flora check" }
      ]
    },
    diagnosis: {
      primary: 'Acute Pelvic Spasmodic Dysmenorrhea & Hormonal Review',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Elevated uterine prostaglandin secretion resulting in myometrial contractions and lumbar referred pain.',
      advice: 'Apply warm heating pads over lower abdomen. Sip warm herbal teas and stay rested. An OPD gynecology consultation can evaluate hormonal balance and prescribe targeted relief.',
      spokenSummary: "Assessment points to spasmodic pelvic dysmenorrhea. Warm heating pads are advised, and certified gynecologists are available nearby."
    }
  },
  {
    id: 'pediatrics_child',
    title: 'Child & Pediatrics',
    badge: 'Pediatrics',
    icon: Baby,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    keywords: ['baby', 'child', 'infant', 'kid', 'pediatric', 'colic', 'newborn', 'toddler', 'vaccine', 'pediatrician'],
    spokenIntro: "Pediatric concern noted. What symptoms is the child experiencing?",
    q2: {
      prompt: "What symptoms is the child experiencing?",
      sub: "Evaluates pediatric pyrexia, feeding tolerance, and respiration",
      options: [
        { id: 'child_high_fever', label: "Spiking fever with lethargy and low energy in child", sub: "Acute pediatric febrile assessment" },
        { id: 'inconsolable_crying', label: "Inconsolable crying, abdominal colic, or refusing feed", sub: "Infantile colic or feeding distress" },
        { id: 'pediatric_cough', label: "Barking cough, noisy breathing, or chest retraction", sub: "Croup or reactive airway review" },
        { id: 'mild_rash_vaccine', label: "Mild skin bumps, loose stool, or routine vaccination", sub: "Routine pediatric health maintenance" }
      ]
    },
    diagnosis: {
      primary: 'Pediatric Acute Febrile & Viral Syndromic Protocol',
      confidence: 95,
      specialty: 'Pediatrics',
      urgency: 'PRIORITY',
      explanation: 'Acute pediatric immune activation. Timely evaluation ensures proper hydration, weight-based dosage, and otoscopic screening.',
      advice: 'Offer frequent sips of water or milk to keep child hydrated. Monitor temperature every 3 hours. Do not give adult medicines; an OPD pediatric specialist consultation is recommended.',
      spokenSummary: "Pediatric assessment indicates acute febrile monitoring. Frequent hydration is key. Dr. Shalini Sundaram in Kovai Medical Centre is available today."
    }
  },
  {
    id: 'diabetes_endocrine',
    title: 'Diabetes & Thyroid',
    badge: 'Endocrinology',
    icon: Syringe,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    keywords: ['diabetes', 'sugar', 'blood sugar', 'glucose', 'thyroid', 'insulin', 'endocrine', 'hba1c', 'hypo', 'hyper'],
    spokenIntro: "Endocrine indicators detected. Are you having blood sugar spikes or unexplained fatigue?",
    q2: {
      prompt: "What metabolic indicators are you experiencing?",
      sub: "Screens for acute glycemic imbalance and thyroid dysfunction",
      options: [
        { id: 'high_sugar_thirst', label: "High blood sugar spike with extreme thirst and urination", sub: "Acute hyperglycemia / insulin resistance" },
        { id: 'shaking_hypo', label: "Cold shakes, sweating, and dizziness (Low sugar)", sub: "Hypoglycemia risk requiring immediate fast sugars" },
        { id: 'weight_thyroid', label: "Unexplained weight change, hair thinning, or thyroid swelling", sub: "Thyroid hormone dysregulation (TSH)" },
        { id: 'routine_diabetic', label: "Routine HbA1c review and diabetic prescription check", sub: "Preventive metabolic chronic management" }
      ]
    },
    diagnosis: {
      primary: 'Metabolic Glycemic Dysregulation & Endocrine Review',
      confidence: 93,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Impaired carbohydrate metabolism and glycemic fluctuation requiring fasting plasma glucose and HbA1c tracking.',
      advice: 'Drink water and avoid refined carbohydrates. If experiencing sweating or shaking, take half a glass of juice or glucose tablet immediately. A physician consult will adjust dosage.',
      spokenSummary: "Clinical analysis notes glycemic dysregulation. Stay hydrated. General physicians and diabetologists in Coimbatore South are ready for booking."
    }
  },
  {
    id: 'mental_sleep',
    title: 'Mental & Sleep',
    badge: 'Psychiatry',
    icon: Moon,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
    keywords: ['mental', 'sleep', 'insomnia', 'anxiety', 'panic', 'stress', 'depress', 'depression', 'scared', 'worry', 'restless'],
    spokenIntro: "Mental wellness concern noted. Are you having acute anxiety or severe sleep loss?",
    q2: {
      prompt: "How are you feeling emotionally and physically?",
      sub: "Evaluates acute anxiety episodes and circadian sleep disruption",
      options: [
        { id: 'panic_racing_heart', label: "Acute panic attack with chest flutter and impending dread", sub: "Autonomic sympathetic fight-or-flight surge" },
        { id: 'chronic_insomnia', label: "Severe insomnia, unable to sleep for multiple nights", sub: "Circadian rhythm disorder or high cortisol" },
        { id: 'daily_anxiety', label: "Constant worry, muscle tension, and restlessness", sub: "Generalized anxiety and somatic strain" },
        { id: 'fatigue_low_mood', label: "Low mood, chronic exhaustion, and lack of interest", sub: "Depressive mood evaluation" }
      ]
    },
    diagnosis: {
      primary: 'Acute Stress Response & Circadian Sleep Disturbance',
      confidence: 92,
      specialty: 'Neurology',
      urgency: 'ROUTINE',
      explanation: 'Heightened hypothalamic-pituitary-adrenal axis activation causing sympathetic overdrive and fragmented sleep architecture.',
      advice: 'Practice deep 4-7-8 diaphragmatic breathing. Avoid screens and caffeine 3 hours before bed. A confidential medical consultation provides supportive therapy.',
      spokenSummary: "Identified acute stress response and sleep disturbance. Breathing exercises are recommended. Certified specialists are available for confidential consultation."
    }
  },
  {
    id: 'trauma_firstaid',
    title: 'Injury & First Aid',
    badge: 'Emergency / Trauma',
    icon: Bandage,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
    keywords: ['cut', 'wound', 'burn', 'injury', 'bleed', 'bleeding', 'hit', 'fall', 'first aid', 'accident', 'trauma', 'stitch'],
    spokenIntro: "Injury noted. Is there active bleeding, a deep cut, or a severe burn?",
    q2: {
      prompt: "What is the nature of your physical injury?",
      sub: "Screens for acute laceration, fracture, and burn severity",
      options: [
        { id: 'active_bleeding_cut', label: "Deep cut with continuous bleeding requiring stitches", sub: "Acute laceration needing sterile closure and tetanus" },
        { id: 'sprain_swelling', label: "Twisted limb with rapid swelling, unable to move joint", sub: "Ligamentous tear or hairline fracture risk" },
        { id: 'thermal_burn', label: "Skin burn with blisters, peeling, or hot oil contact", sub: "Partial-thickness thermal burn" },
        { id: 'minor_scrape', label: "Superficial scrape, abrasion, or minor blunt contusion", sub: "Manageable with antiseptic dressing" }
      ]
    },
    diagnosis: {
      primary: 'Acute Mechanical Soft Tissue Trauma & Wound Care',
      confidence: 96,
      specialty: 'Orthopedics',
      urgency: 'PRIORITY',
      explanation: 'Disruption of dermal or subcutaneous integrity with risk of hemorrhage, bacterial inoculate, or osseous strain.',
      advice: 'Apply direct clean pressure on bleeding areas. Do not burst blisters. Keep the area elevated. Walk-in to City Care Hospital OPD for sterile dressing and tetanus prophylaxis.',
      spokenSummary: "Identified acute soft tissue trauma. Apply direct clean pressure. City Care Hospital emergency OPD has tokens ready immediately."
    }
  },
  {
    id: 'diagnostics_lab',
    title: 'Lab Tests & Scans',
    badge: 'Diagnostics',
    icon: FlaskConical,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-700',
    keywords: ['test', 'lab', 'blood test', 'scan', 'xray', 'ultrasound', 'ecg', 'cbc', 'lipid', 'checkup', 'pathology', 'screening'],
    spokenIntro: "Diagnostic investigation requested. What type of lab test or scan are you looking to book?",
    q2: {
      prompt: "Which clinical investigation or health check do you need?",
      sub: "Connects with accredited pathology and diagnostic radiology",
      options: [
        { id: 'cbc_fever_panel', label: "Complete Blood Count (CBC) & Dengue / Malaria test", sub: "Immediate infectious biomarker screening" },
        { id: 'master_checkup', label: "Master Health Checkup with Lipid, Liver, and Kidney tests", sub: "Comprehensive preventive health profile" },
        { id: 'diabetes_thyroid_lab', label: "Fasting Blood Sugar, HbA1c, and Thyroid panel", sub: "Metabolic tracking and medication calibration" },
        { id: 'ecg_xray', label: "ECG, Chest X-Ray, or Ultrasound scan review", sub: "Cardiorespiratory and abdominal imaging" }
      ]
    },
    diagnosis: {
      primary: 'Diagnostic Laboratory Protocol & Health Screening',
      confidence: 95,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Objective biochemical and hematological profile provides definitive clinical baseline for physician diagnosis.',
      advice: 'Fast for 8 to 10 hours if booking blood sugar or lipid profile tests. Water is permitted. Walk-in tokens provide same-day digital reports via B Care.',
      spokenSummary: "Diagnostic lab profile ready. Fasting is recommended for lipid and glucose panels. Accredited diagnostic centers nearby are available."
    }
  },
  {
    id: 'general_other',
    title: 'General Wellness',
    badge: 'Primary Care',
    icon: Stethoscope,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    keywords: ['other', 'general', 'weakness', 'fatigue', 'tired', 'body', 'checkup', 'unwell', 'sick', 'tooth', 'eye', 'ear', 'faint'],
    spokenIntro: "I have noted your health inquiry. How severely is this affecting you right now?",
    q2: {
      prompt: "How severely is this condition impacting daily activities?",
      sub: "Assesses clinical urgency and functional impairment",
      options: [
        { id: 'severe_incapacitating', label: "Severe and incapacitating (Unable to work or sleep)", sub: "Requires prompt in-person medical evaluation" },
        { id: 'high_discomfort', label: "High discomfort that disrupts normal routines", sub: "Noticeable pain or persistent distress" },
        { id: 'moderate_manageable', label: "Moderate discomfort, manageable at rest", sub: "Uncomfortable but functioning" },
        { id: 'mild_early', label: "Mild or early-stage symptoms seeking doctor review", sub: "Routine consultation and health review" }
      ]
    },
    diagnosis: {
      primary: 'Comprehensive Clinical Assessment & Physician Triage',
      confidence: 94,
      specialty: 'General Medicine',
      urgency: 'ROUTINE',
      explanation: 'Symptom trajectory warrants an in-person physical examination or video consultation to establish precise etiology and targeted prescription.',
      advice: 'Stay hydrated, rest, and avoid self-medicating with unprescribed medications. An accredited general physician will conduct a focused examination.',
      spokenSummary: "I have noted your symptoms and matched top-rated general physicians in Coimbatore South ready for immediate walk-in or video booking."
    }
  }
];

// Universal Duration Options for Question 3 (Zero Emojis, Pure Clinical Precision)
const DURATION_OPTIONS: SmartChipOption[] = [
  { id: 'today', label: "Under 24 Hours", sub: "Sudden, rapid acute onset today" },
  { id: 'few_days', label: "2 to 3 Days", sub: "Persistent or gradually worsening symptoms" },
  { id: 'week_plus', label: "4 to 7 Days", sub: "Symptoms not resolving with basic home rest" },
  { id: 'chronic', label: "Over 1 Week or Chronic Flare-Up", sub: "Recurrent episodes or long-standing condition" }
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

  // "More Specialties" Modal Picker State
  const [showMoreModal, setShowMoreModal] = useState<boolean>(false);

  // Google Maps & Location Engine State
  const [showLocationModal, setShowLocationModal] = useState<boolean>(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState<number>(0);
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [locationSearchInput, setLocationSearchInput] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{
    area: string;
    landmark: string;
    lat: number;
    lng: number;
    isLiveGps: boolean;
    accuracyMeters: number;
    mapX: number;
    mapY: number;
  }>({
    area: 'Peelamedu, Coimbatore',
    landmark: 'Avinashi Road',
    lat: 11.0267,
    lng: 76.9945,
    isLiveGps: true,
    accuracyMeters: 10,
    mapX: 165,
    mapY: 105
  });

  // Preset Localities for quick location switching
  const PRESET_LOCALITIES = [
    { name: 'Peelamedu, Coimbatore', landmark: 'Avinashi Road', lat: 11.0267, lng: 76.9945, mapX: 165, mapY: 105 },
    { name: 'Coimbatore South', landmark: 'Race Course Ring', lat: 10.9980, lng: 76.9660, mapX: 140, mapY: 115 },
    { name: 'RS Puram, Coimbatore', landmark: 'DB Road Corridor', lat: 11.0090, lng: 76.9480, mapX: 95, mapY: 85 },
    { name: 'Gandhipuram, Coimbatore', landmark: 'Cross Cut Road', lat: 11.0180, lng: 76.9680, mapX: 155, mapY: 65 },
    { name: 'Singanallur, Coimbatore', landmark: 'Trichy Road Area', lat: 11.0020, lng: 77.0250, mapX: 290, mapY: 135 }
  ];

  const handleSelectLocality = (loc: typeof PRESET_LOCALITIES[0]) => {
    setUserLocation({
      area: loc.name,
      landmark: loc.landmark,
      lat: loc.lat,
      lng: loc.lng,
      isLiveGps: true,
      accuracyMeters: 15,
      mapX: loc.mapX,
      mapY: loc.mapY
    });
    setShowLocationModal(false);
    if (isVoiceEnabled) {
      speakText(`Location set to ${loc.name}. Showing nearest verified hospitals on Google Maps.`);
    }
  };

  const requestUserLocation = () => {
    setIsDetectingLocation(true);
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          const { latitude, longitude, accuracy } = pos.coords;
          setUserLocation({
            area: 'Peelamedu, Coimbatore (Live GPS)',
            landmark: 'Avinashi Road',
            lat: latitude,
            lng: longitude,
            isLiveGps: true,
            accuracyMeters: Math.round(accuracy || 12),
            mapX: 165,
            mapY: 105
          });
          setShowLocationModal(false);
          if (isVoiceEnabled) {
            speakText("Live GPS location confirmed. Found 3 hospitals within 2 kilometers on Google Maps.");
          }
        },
        (err) => {
          console.warn('Geolocation error or denied:', err);
          setIsDetectingLocation(false);
          // Gracefully fallback to detected area
          setUserLocation({
            area: 'Coimbatore South (GPS Fallback)',
            landmark: 'Near Race Course',
            lat: 10.9980,
            lng: 76.9660,
            isLiveGps: true,
            accuracyMeters: 25,
            mapX: 140,
            mapY: 115
          });
          setShowLocationModal(false);
          if (isVoiceEnabled) {
            speakText("Location set to Coimbatore South. Showing nearest hospitals on Google Maps.");
          }
        },
        { timeout: 6000, maximumAge: 60000, enableHighAccuracy: true }
      );
    } else {
      setIsDetectingLocation(false);
      setShowLocationModal(true);
    }
  };

  // Nearby Hospitals for Google Maps Integration (Proximity sorted)
  const nearbyHospitals = useMemo(() => {
    const baseOffset = userLocation.mapX === 165 ? 0 : userLocation.mapX === 140 ? 0.4 : userLocation.mapX === 95 ? 1.4 : userLocation.mapX === 290 ? 1.2 : 0.8;
    return [
      {
        id: 'hosp-1',
        name: 'City Care Multi-Specialty Hospital',
        address: '42 Avinashi Road, Peelamedu, Coimbatore',
        distanceKm: +(0.8 + baseOffset).toFixed(1),
        driveTime: `${Math.max(2, Math.round(3 + baseOffset * 2))} min drive`,
        liveWaitMins: 10,
        tokenReady: 4,
        rating: 4.9,
        mapX: 275,
        mapY: 55,
        is247: true,
        googleMapsQuery: 'City Care Multi-Specialty Hospital Avinashi Road Peelamedu Coimbatore'
      },
      {
        id: 'hosp-2',
        name: 'Kovai Medical & Research Centre',
        address: '15 Trichy Road, Singanallur, Coimbatore',
        distanceKm: +(1.9 + (userLocation.mapX === 290 ? -1.0 : baseOffset)).toFixed(1),
        driveTime: `${Math.max(4, Math.round(7 + baseOffset * 2))} min drive`,
        liveWaitMins: 18,
        tokenReady: 8,
        rating: 4.7,
        mapX: 325,
        mapY: 145,
        is247: true,
        googleMapsQuery: 'Kovai Medical Center and Hospital Trichy Road Singanallur Coimbatore'
      },
      {
        id: 'hosp-3',
        name: 'Royal Care Super Specialty Hospital',
        address: '1/520 L&T Bypass, Neelambur, Coimbatore',
        distanceKm: +(3.2 + baseOffset).toFixed(1),
        driveTime: `${Math.max(8, Math.round(11 + baseOffset * 2))} min drive`,
        liveWaitMins: 25,
        tokenReady: 12,
        rating: 4.8,
        mapX: 80,
        mapY: 130,
        is247: false,
        googleMapsQuery: 'Royal Care Super Speciality Hospital Neelambur Coimbatore'
      }
    ];
  }, [userLocation]);

  const selectedHospital = nearbyHospitals[selectedHospitalIndex] || nearbyHospitals[0];

  // Voice Engine State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Primary 7 Core Categories displayed in the clean, compact 2x4 grid
  const primaryCategories = useMemo(() => {
    const coreIds: ClinicalCategoryId[] = [
      'vomiting_gi',
      'pain_ortho',
      'fever_infection',
      'chest_cardiac',
      'headache_neuro',
      'dental_oral',
      'skin_allergy'
    ];
    return coreIds.map(id => SMART_CLINICAL_CATEGORIES.find(c => c.id === id)!);
  }, []);

  // Determine what to show in the 8th slot:
  // If the currently selected category is NOT in the core 7, show that selected specialty!
  // Otherwise, show "More Specialties" trigger card.
  const isSelectedInCore = useMemo(() => {
    const coreIds = ['vomiting_gi', 'pain_ortho', 'fever_infection', 'chest_cardiac', 'headache_neuro', 'dental_oral', 'skin_allergy'];
    return coreIds.includes(selectedCategoryId);
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

  // Real-time AI Symptom Parser & Voice Command Interceptor
  const handleQueryChange = (val: string) => {
    setInputText(val);
    const lower = val.toLowerCase();

    // Check if user is asking for nearby hospitals or doctors
    if (
      lower.includes('nearby') || 
      lower.includes('near me') || 
      lower.includes('near my location') || 
      lower.includes('hospital near') || 
      lower.includes('doctor near') ||
      lower.includes('closest hospital')
    ) {
      handleGoToHospitals(true);
      return;
    }

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
    setShowMoreModal(false);
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

  const handleGoToHospitals = (askLocation: boolean = false) => {
    stopSpeaking();
    setCurrentStep('HOSPITALS');
    if (askLocation) {
      setShowLocationModal(true);
      if (isVoiceEnabled) {
        speakText("Please confirm your location to locate nearby hospitals and doctors on Google Maps.");
      }
    } else {
      if (isVoiceEnabled) {
        speakText(`Displaying hospitals and doctors near ${userLocation.area} on Google Maps.`);
      }
    }
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

  // Rotate doctor or pick based on selected hospital
  const topDoctor = useMemo(() => {
    if (availableDoctors.length > selectedHospitalIndex) {
      return availableDoctors[selectedHospitalIndex];
    }
    return availableDoctors[0] || doctors[0];
  }, [availableDoctors, selectedHospitalIndex, doctors]);

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
    <div className="h-full flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-150 relative">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAV: MINIMAL BACK BUTTON + STEP INDICATOR + VOICE TOGGLE (SHRINK-0) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-2 shrink-0 pt-1 pb-1.5 border-b border-slate-100/80">
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 text-[11px] font-bold">
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
      <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 py-2">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* SLIDE 1: QUESTION 1 — COMPACT, NON-OVERWHELMING 8-CARD CLINICAL SUITE */}
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
              <div className="flex flex-col items-center text-center shrink-0 pt-1">
                <SiriOrb
                  size={46}
                  state={isSpeaking ? "streaming" : isListening ? "listening" : "idle"}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText("What is your main symptom or health concern?");
                  }}
                />
                <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1.5 leading-snug">
                  What is your main symptom?
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type, speak, or select a medical specialty below
                </p>
              </div>

              {/* Free-Text Search & Voice Mic Bar */}
              <div className="shrink-0 my-2">
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
                    placeholder="Describe symptoms (e.g. toothache, back pain, fever)..."
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

                {/* AI Detected Specialty Pill & Quick Nearby Button */}
                <div className="mt-1 flex items-center justify-between px-1">
                  <div className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-sky-700 min-w-0 truncate">
                    <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />
                    <span className="truncate">AI Matched: <strong className="font-bold text-slate-800">{activeCategory.title}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleGoToHospitals(true)}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-200 transition-all shadow-2xs"
                      title="Ask location & show nearby hospitals on Google Maps"
                    >
                      <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Nearby</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMoreModal(true)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      All Specialties +
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact, Stable 2x4 Grid (Never Collapses, Zero Empty Space!) */}
              <div className="flex-1 flex flex-col justify-center min-h-0 py-0.5">
                <div className="grid grid-cols-2 gap-1.5">
                  {/* First 7 Core Categories */}
                  {primaryCategories.map((cat) => {
                    const isSelected = selectedCategoryId === cat.id;
                    const IconComponent = cat.icon;
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
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11.5px] font-bold truncate leading-tight">{cat.title}</div>
                          <div className="text-[9.5px] text-slate-400 truncate leading-none mt-0.5">{cat.badge}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}

                  {/* 8th Slot: Either Active Specialty from More List, or "More Specialties..." */}
                  {!isSelectedInCore ? (
                    <button
                      type="button"
                      onClick={() => setShowMoreModal(true)}
                      className="p-2 rounded-xl text-left border border-sky-500 bg-sky-50/90 text-sky-950 shadow-2xs ring-1.5 ring-sky-200 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${activeCategory.iconBg} ${activeCategory.iconColor}`}>
                        <activeCategory.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold truncate leading-tight">{activeCategory.title}</div>
                        <div className="text-[9.5px] text-slate-400 truncate leading-none mt-0.5">{activeCategory.badge}</div>
                      </div>
                      <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 stroke-[2.5]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMoreModal(true)}
                      className="p-2 rounded-xl text-left border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-all cursor-pointer flex items-center gap-2 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11.5px] font-bold truncate leading-tight">More Specialties</div>
                        <div className="text-[9.5px] text-indigo-600 truncate leading-none mt-0.5">+ 11 clinical fields</div>
                      </div>
                    </button>
                  )}
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

              {/* ============================================================= */}
              {/* "MORE SPECIALTIES" MODAL PICKER OVERLAY                       */}
              {/* ============================================================= */}
              <AnimatePresence>
                {showMoreModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end p-2"
                  >
                    <motion.div
                      initial={{ y: 80, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 80, opacity: 0 }}
                      className="bg-white rounded-3xl p-3.5 shadow-xl border border-slate-200 max-h-[85%] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">All Clinical Specialties</h4>
                          <p className="text-[10px] text-slate-500">Select any medical department for intake</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMoreModal(false)}
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="overflow-y-auto max-h-[300px] py-2 grid grid-cols-2 gap-1.5 scrollbar-thin">
                        {SMART_CLINICAL_CATEGORIES.map((cat) => {
                          const isSelected = selectedCategoryId === cat.id;
                          const IconComp = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleSelectCategory(cat)}
                              className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-sky-50 border-sky-500 text-sky-950 ring-1 ring-sky-200'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-[11px] font-bold truncate leading-tight">{cat.title}</div>
                                <div className="text-[9px] text-slate-400 truncate leading-none mt-0.5">{cat.badge}</div>
                              </div>
                              {isSelected && <Check className="w-3 h-3 text-sky-600 shrink-0 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMoreModal(false)}
                        className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        Close
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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

              {/* 4 Options (A, B, C, D) with Crisp Letter Badges (Zero Emojis) */}
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
                        <div className="text-[11.5px] font-bold text-slate-900 leading-tight truncate">
                          {opt.label}
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

              {/* 4 Duration Options (A, B, C, D) (Zero Emojis) */}
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
                        <div className="text-[11.5px] font-bold text-slate-900 leading-tight truncate">
                          {opt.label}
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
                  onClick={() => handleGoToHospitals(false)}
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
          {/* SLIDE 5: NEARBY HOSPITALS & GOOGLE MAPS INTEGRATED ROUTE & BOOKING    */}
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
              {/* Location Status & Asking Header */}
              <div className="flex items-center justify-between gap-2 p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200/90 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-[11px] font-bold text-slate-900 truncate">{userLocation.area}</span>
                  <span className="text-[9.5px] text-slate-500 font-medium shrink-0">({selectedHospital.distanceKm} km away)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-sky-700 text-[10px] font-bold shadow-2xs flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95"
                  title="Detect GPS or Change Location"
                >
                  <LocateFixed className="w-3 h-3 text-sky-600" />
                  <span>Change</span>
                </button>
              </div>

              {/* Google Maps Integrated Container */}
              <div className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs shrink-0 select-none bg-[#f1f3f4]">
                {/* Google Maps Top Bar Badge & Controls */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-auto">
                  {/* Google Maps Pill */}
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs shadow-xs border border-slate-200/80">
                    <div className="flex items-center -space-x-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                      <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                      <span className="w-2 h-2 rounded-full bg-[#FBBC05]" />
                      <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 tracking-tight">Google Maps</span>
                    <span className="text-[8.5px] text-emerald-600 font-bold">• Live OPD</span>
                  </div>

                  {/* Mode / Recenter / Directions */}
                  <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xs p-0.5 rounded-full shadow-xs border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setMapMode(mapMode === 'map' ? 'satellite' : 'map')}
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold transition-all cursor-pointer ${
                        mapMode === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Toggle Satellite"
                    >
                      <Layers className="w-2.5 h-2.5 inline mr-0.5" />
                      <span>{mapMode === 'map' ? 'Satellite' : 'Map'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={requestUserLocation}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                      title="Recenter GPS"
                    >
                      <Crosshair className="w-3 h-3 text-sky-600" />
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedHospital.googleMapsQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 text-[9px] font-bold transition-all cursor-pointer"
                      title="Open in Google Maps"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* SVG Vector Map Rendering */}
                <svg
                  viewBox="0 0 400 190"
                  className="w-full h-full object-cover transition-colors duration-300"
                >
                  <defs>
                    <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Cartographic Base Layer */}
                  {mapMode === 'map' ? (
                    <g>
                      {/* Soft Grey Terrain */}
                      <rect width="400" height="190" fill="#f8fafc" />
                      {/* Water Body (Singanallur Canal) */}
                      <path d="M 0 160 Q 130 145 230 165 T 400 155 L 400 190 L 0 190 Z" fill="#dbeafe" />
                      <text x="240" y="180" fill="#93c5fd" fontSize="7" fontWeight="700" letterSpacing="0.8">SINGANALLUR WATERWAY</text>
                      {/* Green Parks */}
                      <rect x="25" y="25" width="85" height="42" rx="8" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="0.8" />
                      <text x="67" y="48" textAnchor="middle" fill="#15803d" fontSize="7.5" fontWeight="700" opacity="0.85">RACE COURSE</text>
                      <rect x="220" y="95" width="55" height="35" rx="6" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="0.8" />
                      <text x="247" y="115" textAnchor="middle" fill="#15803d" fontSize="7.5" fontWeight="700" opacity="0.85">VOC PARK</text>
                      {/* City Block Outlines */}
                      <rect x="130" y="25" width="60" height="30" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                      <rect x="130" y="65" width="60" height="28" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                      <rect x="300" y="25" width="75" height="40" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                      <rect x="25" y="80" width="85" height="42" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                      {/* Minor Streets */}
                      <path d="M 120 15 L 120 165 M 210 15 L 210 165 M 285 20 L 285 165 M 20 80 L 190 80 M 200 65 L 380 65" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                      {/* Avinashi Road (Major Arterial) */}
                      <path d="M 0 55 L 400 35" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 0 55 L 400 35" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                      <text x="175" y="44" fill="#64748b" fontSize="7" fontWeight="700" letterSpacing="0.4">AVINASHI RD (NH 544)</text>
                      {/* Trichy Road */}
                      <path d="M 0 145 L 400 135" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
                      <path d="M 0 145 L 400 135" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                      <text x="150" y="138" fill="#64748b" fontSize="7" fontWeight="700" letterSpacing="0.4">TRICHY ROAD</text>
                    </g>
                  ) : (
                    <g>
                      {/* Satellite Dark Map */}
                      <rect width="400" height="190" fill="#0f172a" />
                      <rect x="25" y="25" width="85" height="42" rx="8" fill="#14532d" opacity="0.6" />
                      <rect x="220" y="95" width="55" height="35" rx="6" fill="#14532d" opacity="0.6" />
                      <path d="M 0 160 Q 130 145 230 165 T 400 155 L 400 190 L 0 190 Z" fill="#1e3a8a" opacity="0.7" />
                      <path d="M 0 55 L 400 35 M 0 145 L 400 135" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 120 15 L 120 165 M 210 15 L 210 165 M 285 20 L 285 165" stroke="#334155" strokeWidth="3" />
                    </g>
                  )}

                  {/* Navigation Route Polyline from User to Selected Hospital */}
                  <g>
                    {/* White Outer Glow */}
                    <path
                      d={`M ${userLocation.mapX} ${userLocation.mapY} Q ${(userLocation.mapX + selectedHospital.mapX) / 2 + 15} ${(userLocation.mapY + selectedHospital.mapY) / 2 - 15} ${selectedHospital.mapX} ${selectedHospital.mapY}`}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    {/* Google Blue Route Line */}
                    <path
                      d={`M ${userLocation.mapX} ${userLocation.mapY} Q ${(userLocation.mapX + selectedHospital.mapX) / 2 + 15} ${(userLocation.mapY + selectedHospital.mapY) / 2 - 15} ${selectedHospital.mapX} ${selectedHospital.mapY}`}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.2"
                      strokeDasharray="5 3"
                      strokeLinecap="round"
                    />
                    {/* Floating Travel ETA Bubble */}
                    <g transform={`translate(${((userLocation.mapX + selectedHospital.mapX) / 2) - 36}, ${((userLocation.mapY + selectedHospital.mapY) / 2) - 18})`}>
                      <rect width="72" height="17" rx="8.5" fill="#ffffff" stroke="#2563eb" strokeWidth="1" filter="url(#mapShadow)" />
                      <text x="36" y="11.5" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="700">
                        🚗 {selectedHospital.distanceKm} km • {selectedHospital.driveTime.split(' ')[0]}m
                      </text>
                    </g>
                  </g>

                  {/* User "You Are Here" GPS Marker */}
                  <g>
                    {/* Pulsing Radar Ring */}
                    <circle cx={userLocation.mapX} cy={userLocation.mapY} r="16" className="animate-ping" fill="#3b82f6" opacity="0.35" />
                    {/* White Halo */}
                    <circle cx={userLocation.mapX} cy={userLocation.mapY} r="7" fill="#ffffff" filter="url(#mapShadow)" />
                    {/* Inner Core */}
                    <circle cx={userLocation.mapX} cy={userLocation.mapY} r="4.5" fill="#2563eb" />
                    {/* Floating Label */}
                    <g transform={`translate(${userLocation.mapX - 28}, ${userLocation.mapY - 22})`}>
                      <rect width="56" height="13" rx="6.5" fill="#1e293b" opacity="0.9" />
                      <text x="28" y="9.5" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="700">📍 You Are Here</text>
                    </g>
                  </g>

                  {/* Hospital Pins */}
                  {nearbyHospitals.map((hosp, idx) => {
                    const isSelected = selectedHospitalIndex === idx;
                    return (
                      <g
                        key={hosp.id}
                        onClick={() => setSelectedHospitalIndex(idx)}
                        className="cursor-pointer group"
                      >
                        {/* Teardrop Pin Marker */}
                        <path
                          d={`M ${hosp.mapX} ${hosp.mapY} C ${hosp.mapX - 9} ${hosp.mapY - 12} ${hosp.mapX - 9} ${hosp.mapY - 24} ${hosp.mapX} ${hosp.mapY - 24} C ${hosp.mapX + 9} ${hosp.mapY - 24} ${hosp.mapX + 9} ${hosp.mapY - 12} ${hosp.mapX} ${hosp.mapY} Z`}
                          fill={isSelected ? "#ea4335" : "#e11d48"}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? "2" : "1.2"}
                          filter="url(#mapShadow)"
                        />
                        {/* White Hospital Cross */}
                        <path
                          d={`M ${hosp.mapX - 3} ${hosp.mapY - 15} h 6 M ${hosp.mapX} ${hosp.mapY - 18} v 6`}
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        {isSelected ? (
                          /* Floating Callout for Selected Hospital */
                          <g transform={`translate(${hosp.mapX - 48}, ${hosp.mapY - 42})`}>
                            <rect width="96" height="16" rx="8" fill="#ffffff" stroke="#ea4335" strokeWidth="1.2" filter="url(#mapShadow)" />
                            <text x="48" y="11" textAnchor="middle" fill="#1e293b" fontSize="7.5" fontWeight="700">
                              {hosp.name.split(' ')[0]} • ~{hosp.liveWaitMins}m wait
                            </text>
                          </g>
                        ) : (
                          /* Distance Badge for Unselected */
                          <g transform={`translate(${hosp.mapX - 16}, ${hosp.mapY + 3})`}>
                            <rect width="32" height="12" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" opacity="0.95" />
                            <text x="16" y="8.5" textAnchor="middle" fill="#475569" fontSize="6.5" fontWeight="700">{hosp.distanceKm}km</text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Google Maps Attribution */}
                <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-medium bg-white/80 px-1 rounded select-none pointer-events-none">
                  Google Map Data © 2026
                </div>
              </div>

              {/* Proximity Hospital Selector Pills */}
              <div className="grid grid-cols-3 gap-1 shrink-0 pt-1">
                {nearbyHospitals.map((hosp, idx) => {
                  const isSelected = selectedHospitalIndex === idx;
                  return (
                    <button
                      key={hosp.id}
                      type="button"
                      onClick={() => {
                        setSelectedHospitalIndex(idx);
                        if (isVoiceEnabled) {
                          speakText(`Selected ${hosp.name}. Distance is ${hosp.distanceKm} kilometers with ~${hosp.liveWaitMins} minutes estimated wait.`);
                        }
                      }}
                      className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-300 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-900 truncate">{hosp.name.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-sky-600">{hosp.distanceKm}km</span>
                      </div>
                      <div className="text-[8.5px] text-emerald-600 font-semibold truncate mt-0.5">~{hosp.liveWaitMins}m wait</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hospital & Assigned Specialist Doctor Card */}
              <div className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-xs space-y-1.5 shrink-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[11.5px] font-bold text-slate-900 truncate">{selectedHospital.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 shrink-0">
                        {selectedHospital.is247 ? '24/7 OPD' : 'OPD Open'}
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 truncate">{selectedHospital.address} • {selectedHospital.driveTime}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5 shrink-0 pl-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {selectedHospital.rating}
                  </span>
                </div>

                {/* Doctor Row */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-100 to-indigo-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                    {topDoctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold text-slate-900 truncate">{formatDocName(topDoctor.name)}</h5>
                      <span className="text-[9px] font-bold text-emerald-600">Token #{selectedHospital.tokenReady} Ready</span>
                    </div>
                    <p className="text-[9.5px] text-slate-500 truncate">{topDoctor.specialty} • {topDoctor.experienceYears} yrs exp</p>
                  </div>
                </div>

                {/* 1-Tap Booking Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'IN_PERSON_OPD')}
                    className="py-2 px-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="text-[10.5px]">In-Person Visit • ₹{topDoctor?.opConsultationFee || 80}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'VIDEO_CONSULTATION')}
                    className="py-2 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-bold shadow-2xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="w-3 h-3 text-sky-600 shrink-0" />
                    <span className="text-[10.5px] text-sky-700">Video Call • ₹399</span>
                  </button>
                </div>
              </div>

              {/* Bottom Start Over Link */}
              <div className="pt-0.5 text-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setCurrentStep('QUESTION_1');
                  }}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Start a new health inquiry</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================================= */}
          {/* "SELECT LOCATION" GOOGLE MAPS PROMPT MODAL                    */}
          {/* ============================================================= */}
          <AnimatePresence>
            {showLocationModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end p-2"
              >
                <motion.div
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  className="bg-white rounded-3xl p-3.5 shadow-xl border border-slate-200 max-h-[85%] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Your Location</h4>
                        <p className="text-[10px] text-slate-500">Find nearest hospitals on Google Maps</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* GPS Detection CTA */}
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={requestUserLocation}
                      disabled={isDetectingLocation}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <LocateFixed className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>{isDetectingLocation ? 'Detecting Live GPS...' : 'Use My Current GPS Location'}</span>
                    </button>
                  </div>

                  {/* Quick Locality Options */}
                  <div className="pb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Or Select Coimbatore Area:
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {PRESET_LOCALITIES.map((loc) => {
                        const isSelected = userLocation.area.includes(loc.name.split(',')[0]);
                        return (
                          <button
                            key={loc.name}
                            type="button"
                            onClick={() => handleSelectLocality(loc)}
                            className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 border-sky-400 text-sky-950 ring-1 ring-sky-200'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate">{loc.name}</div>
                              <div className="text-[9.5px] text-slate-400 truncate">{loc.landmark}</div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="w-full mt-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </AnimatePresence>
      </div>

    </div>
  );
};
