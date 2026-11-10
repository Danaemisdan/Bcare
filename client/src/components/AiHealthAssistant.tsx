import { RealMapView } from './RealMapView';
import { UserLocationData, calculateDistanceKm, getGoogleMapsDirectionsUrl, detectCurrentLocation } from '../services/locationService';
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Globe,
  ChevronDown,
  Languages,
  Radio,
  LucideIcon
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

// ============================================================================
// ALL 10 INDIAN REGIONAL LANGUAGES (PREMIUM STT & TTS ENGINE)
// ============================================================================
export interface IndianLanguage {
  code: string;        // BCP-47 Speech Code (e.g. 'en-IN', 'ta-IN', 'hi-IN')
  name: string;        // Native Script
  englishName: string; // Common Display Name
  flag: string;
  placeholder: string;
  spokenIntro: string;
}

export const SUPPORTED_INDIAN_LANGUAGES: IndianLanguage[] = [
  { 
    code: 'en-IN', 
    name: 'English (India)', 
    englishName: 'English (IN)', 
    flag: '🇮🇳', 
    placeholder: 'Type or speak what\'s wrong (e.g. severe stomach pain, fever, migraine)...',
    spokenIntro: 'Please describe your symptoms. Our clinical AI will assess and match the right specialist.' 
  },
  { 
    code: 'ta-IN', 
    name: 'தமிழ்', 
    englishName: 'Tamil', 
    flag: '🇮🇳', 
    placeholder: 'உங்கள் அறிகுறிகளை தமிழில் தட்டச்சு செய்யவும் அல்லது பேசவும்...',
    spokenIntro: 'உங்கள் அறிகுறிகளைக் கூறுங்கள். எங்கள் மருத்துவ AI உடனே கணித்து சரியான மருத்துவரை பரிந்துரைக்கும்.' 
  },
  { 
    code: 'hi-IN', 
    name: 'हिन्दी', 
    englishName: 'Hindi', 
    flag: '🇮🇳', 
    placeholder: 'अपने लक्षण हिंदी में लिखें या बोलें, जैसे पेट दर्द, बुखार, सिरदर्द...',
    spokenIntro: 'कृपया अपने लक्षण बताएं। हमारा क्लिनिकल एआई तुरंत विशेषज्ञ डॉक्टर से मिलान करेगा।' 
  },
  { 
    code: 'te-IN', 
    name: 'తెలుగు', 
    englishName: 'Telugu', 
    flag: '🇮🇳', 
    placeholder: 'మీ లక్షణాలను తెలుగులో టైప్ చేయండి లేదా మాట్లాడండి...',
    spokenIntro: 'దయచేసి మీ లక్షణాలను వివరించండి. మా క్లినికల్ ఏఐ సరైన వైద్యుడిని సూచిస్తుంది.' 
  },
  { 
    code: 'kn-IN', 
    name: 'ಕನ್ನಡ', 
    englishName: 'Kannada', 
    flag: '🇮🇳', 
    placeholder: 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...',
    spokenIntro: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ. ನಮ್ಮ ಎಐ ಸರಿಯಾದ ವೈದ್ಯರನ್ನು ಶಿಫಾರಸು ಮಾಡುತ್ತದೆ.' 
  },
  { 
    code: 'ml-IN', 
    name: 'മലയാളം', 
    englishName: 'Malayalam', 
    flag: '🇮🇳', 
    placeholder: 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പറയുക...',
    spokenIntro: 'ദയവായി ലക്ഷണങ്ങൾ വ്യക്തമാക്കുക. ഞങ്ങളുടെ ക്ലിനിക്കൽ എഐ ശരിയായ ഡോക്ടറെ നിർദ്ദേശിക്കും.' 
  },
  { 
    code: 'mr-IN', 
    name: 'मराठी', 
    englishName: 'Marathi', 
    flag: '🇮🇳', 
    placeholder: 'आपली लक्षणे मराठीत टाइप करा किंवा बोला...',
    spokenIntro: 'कृपया आपली लक्षणे सांगा. आमचे क्लिनिकल एआय योग्य तज्ज्ञ डॉक्टर सुचवेल.' 
  },
  { 
    code: 'bn-IN', 
    name: 'বাংলা', 
    englishName: 'Bengali', 
    flag: '🇮🇳', 
    placeholder: 'আপনার লক্ষণগুলি বাংলায় টাইপ করুন বা বলুন...',
    spokenIntro: 'দয়া করে আপনার লক্ষণগুলি বলুন। আমাদের ক্লিনিক্যাল এআই সঠিক বিশেষজ্ঞ খুঁজে দেবে।' 
  },
  { 
    code: 'gu-IN', 
    name: 'ગુજરાતી', 
    englishName: 'Gujarati', 
    flag: '🇮🇳', 
    placeholder: 'તમારા લક્ષણો ગુજરાતીમાં લખો અથવા બોલો...',
    spokenIntro: 'કૃપા કરીને તમારા લક્ષણો જણાવો. અમારું ક્લિનિકલ એઆઈ યોગ્ય ડૉક્ટર પસંદ કરશે.' 
  },
  { 
    code: 'pa-IN', 
    name: 'ਪੰਜਾਬੀ', 
    englishName: 'Punjabi', 
    flag: '🇮🇳', 
    placeholder: 'ਆਪਣੇ ਲੱਛਣ ਪੰਜਾਬੀ ਵਿੱਚ ਟਾਈਪ ਕਰੋ ਜਾਂ ਬੋਲੋ...',
    spokenIntro: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ। ਸਾਡਾ ਕਲੀਨਿਕਲ ਏਆਈ ਸਹੀ ਡਾਕਟਰ ਨਾਲ ਮਿਲਾਏਗਾ।' 
  }
];

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
    keywords: [
      'vomit', 'vomiting', 'nausea', 'puke', 'food poison', 'loose motion', 'diarrhea', 'stomach bug', 'dehydration', 'acid reflux', 'indigestion', 'stomach cramp', 'belly pain', 'gastric', 'cramp', 'cramps', 'tummy', 'acidity', 'loose stool', 'dysentery', 'food poisoning', 'gas', 'bloating',
      'pet', 'pait', 'pet dard', 'ulti', 'dast', 'matli', 'kabz', 'marod', 'पेट', 'उल्टी', 'दस्त', 'मतली',
      'vayiru', 'vairu', 'vayiru vali', 'vaanthi', 'vanthi', 'bhedi', 'pedhi', 'seriyamai', 'வயிறு', 'வாந்தி', 'பேதி',
      'kadupu', 'kadupu noppi', 'vanthulu', 'virachanalu', 'కడుపు', 'వాంతులు',
      'hotte', 'hotte novu', 'vaanti', 'ಹೊಟ್ಟೆ', 'ವಾಂತಿ',
      'vayaru', 'vayaruvedhana', 'chardhi', 'ഛർദ്ദി', 'വയറു'
    ],
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
    keywords: [
      'pain', 'back', 'lower back', 'neck', 'spine', 'joint', 'knee', 'shoulder', 'sciatica', 'sprain', 'twist', 'muscle', 'ache', 'slip disc', 'cervical', 'lumbar', 'bone', 'fracture', 'ligament', 'ankle', 'wrist',
      'kamar dard', 'kamar', 'ghutna', 'ghutne', 'dard', 'कमर दर्द', 'घुटने', 'जोड़ों',
      'mudhugu', 'mudhugu vali', 'kaal vali', 'mottu vali', 'iduppu vali', 'elumbu', 'முதுகு வலி', 'மூட்டு வலி',
      'vennu', 'vennu noppi', 'kaalu noppi', 'mokkalilu', 'వెన్ను నొప్పి', 'మోకాలు నొప్పి',
      'kalu novu', 'mokaalu novu', 'bennu novu', 'ಕೀಲು ನೋವು', 'ಬೆನ್ನು ನೋವು'
    ],
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
    keywords: [
      'fever', 'temperature', 'chills', 'shivering', 'flu', 'viral', 'body ache', 'dengue', 'malaria', 'cold', 'sore throat', 'pyrexia', 'typhoid',
      'bukhar', 'tez bukhar', 'tap', 'taap', 'बुखार', 'ताप',
      'kaachal', 'kaaychal', 'kulir', 'udambu vali', 'காய்ச்சல்', 'குளிர்',
      'jwaram', 'jalubu', 'chali', 'జ్వరం', 'చలి',
      'jwara', 'pani', 'viral pani', 'ജ്വര', 'പനി'
    ],
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
    keywords: [
      'chest', 'chest pain', 'heart', 'heartburn', 'palpitation', 'racing heart', 'angina', 'acid', 'gerd', 'tightness', 'bp',
      'chhati', 'seena', 'seene me dard', 'dil', 'dhadkan', 'छाती', 'दिल', 'धड़कन',
      'marbu', 'marbu vali', 'nenju', 'nenju vali', 'நெஞ்சு வலி', 'இதயம்',
      'gunde', 'gunde noppi', 'ede novu', 'గుండె', 'ಎದೆ ನೋವು'
    ],
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
    keywords: [
      'headache', 'migraine', 'head', 'throbbing', 'aura', 'dizziness', 'vertigo', 'spinning', 'temple', 'balance', 'faint',
      'sar dard', 'sir dard', 'chakkar', 'सिर दर्द', 'चक्कर',
      'thala vali', 'thalavali', 'mayakkam', 'thala suthudhu', 'தலைவலி', 'மயக்கம்',
      'tala noppi', 'thala noppi', 'thale novu', 'thala vedhana', 'తల నొప్పి'
    ],
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
    keywords: [
      'tooth', 'teeth', 'dental', 'gum', 'dentist', 'toothache', 'molar', 'mouth', 'cavity', 'jaw', 'ulcer',
      'daant', 'daant dard', 'दांत दर्द', 'मसूड़े',
      'pallu', 'palla vali', 'pallu vali', 'பல் வலி',
      'panti noppi', 'hallu novu', 'పంటి నొప్పి'
    ],
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
    keywords: [
      'rash', 'itching', 'itch', 'hives', 'allergy', 'allergic', 'skin', 'welts', 'red spots', 'eczema', 'bite', 'dermatitis',
      'khujli', 'daane', 'खुजली', 'दाने',
      'arippu', 'thadipu', 'அரிப்பு',
      'durada', 'dhaddulu', 'దురద'
    ],
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
    keywords: [
      'cough', 'coughing', 'cold', 'breath', 'breathless', 'breathing', 'wheeze', 'wheezing', 'asthma', 'phlegm', 'sputum', 'bronchitis', 'congestion',
      'khansi', 'jukham', 'saans', 'balgam', 'खांसी', 'जुकाम',
      'irumal', 'sali', 'moochu', 'இருமல்', 'சளி',
      'daggu', 'jalubu', 'aayasam', 'kemmu', 'chuma', 'దగ్గు'
    ],
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
  userLocation?: UserLocationData | null;
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
  userLocation: propUserLocation,
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
  const [userLocation, setUserLocation] = useState<UserLocationData>(
    propUserLocation || {
      area: 'Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      displayName: 'Banjara Hills, Hyderabad',
      lat: 17.4156,
      lng: 78.4350,
      accuracyMeters: 20,
      isLiveGps: false,
      timestamp: Date.now()
    }
  );

  useEffect(() => {
    if (propUserLocation) {
      setUserLocation(propUserLocation);
    } else {
      detectCurrentLocation().then(loc => setUserLocation(loc));
    }
  }, [propUserLocation]);

  const handleSelectLocality = (loc: { name: string; city: string; state: string; lat: number; lng: number }) => {
    setUserLocation({
      area: loc.name,
      city: loc.city,
      state: loc.state,
      country: 'India',
      displayName: `${loc.name}, ${loc.city}`,
      lat: loc.lat,
      lng: loc.lng,
      isLiveGps: true,
      accuracyMeters: 15,
      timestamp: Date.now()
    });
    setShowLocationModal(false);
    if (isVoiceEnabled) {
      speakText(`Location set to ${loc.name}. Showing nearest verified hospitals on Google Maps.`);
    }
  };

  const requestUserLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await detectCurrentLocation(true);
      setUserLocation(loc);
      setIsDetectingLocation(false);
      setShowLocationModal(false);
      if (isVoiceEnabled) {
        speakText(`Live GPS location confirmed for ${loc.displayName}. Showing nearest verified hospital.`);
      }
    } catch (e) {
      setIsDetectingLocation(false);
    }
  };

  // Proximity sorted verified hospitals from props
  const sortedHospitals = useMemo(() => {
    return [...hospitals].sort((a, b) => {
      const distA = userLocation && a.latitude && a.longitude
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude)
        : 10;
      const distB = userLocation && b.latitude && b.longitude
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
        : 10;
      return distA - distB;
    });
  }, [hospitals, userLocation]);

  const nearbyHospitals = sortedHospitals;
  const selectedHospital = sortedHospitals[selectedHospitalIndex] || sortedHospitals[0] || hospitals[0];

  // Voice Engine State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [streamedInterim, setStreamedInterim] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>(SUPPORTED_INDIAN_LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Primary Doctor Match
  const matchedDoctor = useMemo(() => {
    return doctors.find(d => 
      d.specialty.toLowerCase().includes(activeCategory.diagnosis.specialty.toLowerCase()) ||
      activeCategory.diagnosis.specialty.toLowerCase().includes(d.specialty.toLowerCase())
    ) || doctors[0];
  }, [doctors, activeCategory]);

  // Extract detected clinical signals
  const detectedSignals = useMemo(() => {
    if (!inputText.trim()) return ['General Assessment'];
    const lower = inputText.toLowerCase();
    const signals: string[] = [];
    for (const kw of activeCategory.keywords) {
      if (lower.includes(kw.toLowerCase()) && !signals.includes(kw)) {
        signals.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        if (signals.length >= 3) break;
      }
    }
    return signals.length > 0 ? signals : [activeCategory.title];
  }, [inputText, activeCategory]);

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

  // Find premium Indian or natural voice
  const getIndianVoice = (langCode: string): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const code = langCode.toLowerCase().replace('_', '-');
    const prefix = code.split('-')[0];

    // 1. Natural / Google / Neural / Indian named voices matching code or prefix
    const naturalMatch = voices.find(v => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      return (vLang === code || vLang.startsWith(prefix)) && 
        (vName.includes('natural') || vName.includes('google') || vName.includes('neural') || vName.includes('premium') || vName.includes('enhanced') || vName.includes('rishi') || vName.includes('veena') || vName.includes('lekha') || vName.includes('valluvar') || vName.includes('chitra') || vName.includes('neerja'));
    });
    if (naturalMatch) return naturalMatch;

    // 2. Exact language match
    const exactMatch = voices.find(v => v.lang.toLowerCase().replace('_', '-') === code);
    if (exactMatch) return exactMatch;

    // 3. Prefix match
    const prefixMatch = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(prefix));
    if (prefixMatch) return prefixMatch;

    // 4. Fallback for Indian English
    if (code === 'en-in') {
      const inEn = voices.find(v => v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('veena') || v.name.toLowerCase().includes('rishi'));
      if (inEn) return inEn;
    }

    // 5. Default natural voice
    return voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.startsWith('en')) || voices[0] || null;
  };

  // Speak text naturally using Web Speech API with premium Indian voice cadence
  const speakText = (text: string, customLang?: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const targetLang = customLang || selectedLanguage.code;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;

      const voice = getIndianVoice(targetLang);
      if (voice) utterance.voice = voice;

      utterance.pitch = 1.0;
      utterance.rate = 0.96; // Smooth human clinical pacing

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  // Stop listening safely
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setStreamedInterim('');
  };

  // Live Streamed Voice Input (Continuous & Interim Speech-to-Text)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage.code;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setStreamedInterim('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let newlyFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            newlyFinal += text + ' ';
          } else {
            interim += text;
          }
        }

        if (newlyFinal) {
          setInputText(prev => {
            const next = (prev ? prev.trim() + ' ' : '') + newlyFinal.trim();
            handleQueryChange(next);
            return next;
          });
        }

        setStreamedInterim(interim);
        if (interim) {
          handleQueryChange(inputText + ' ' + interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Live STT error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          setStreamedInterim('');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setStreamedInterim('');
      };

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
      cat.keywords.some(kw => lower.includes(kw.toLowerCase()))
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
      {/* 1. TOP PROGRESS BAR: 3 MINIMALIST HAIRLINE SEGMENTS                       */}
      {/* ========================================================================= */}
      <div className="shrink-0 pt-1 pb-1">
        <div className="grid grid-cols-3 gap-1.5 px-1">
          {['Symptom', 'Severity', 'Duration'].map((label, idx) => {
            const stepNum = idx + 1;
            const currentStepNum = 
              currentStep === 'QUESTION_1' ? 1 : 
              currentStep === 'QUESTION_2' ? 2 : 
              currentStep === 'QUESTION_3' ? 3 : 4;
            const isCompleted = currentStepNum > stepNum;
            const isCurrent = currentStepNum === stepNum;

            return (
              <div key={label} className="space-y-1">
                <div className="h-1 rounded-full overflow-hidden bg-slate-200/80">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isCompleted || isCurrent ? 'bg-slate-950 w-full' : 'w-0'
                    }`} 
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-semibold">
                  <span className={isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-600' : 'text-slate-400'}>
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
        <button
          type="button"
          onClick={handleBack}
          className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Go Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-slate-900 tracking-tight">
          {currentStep === 'QUESTION_1' && 'Clinical Intake'}
          {currentStep === 'QUESTION_2' && 'Symptom Severity'}
          {currentStep === 'QUESTION_3' && 'Onset Profile'}
          {currentStep === 'ANALYSIS' && 'Diagnostic Synthesis'}
          {currentStep === 'HOSPITALS' && 'Direct Care & Booking'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Indian Regional Language Picker */}
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-[10.5px] font-bold text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="Choose Indian Language for STT & TTS"
          >
            <span>{selectedLanguage.flag}</span>
            <span>{selectedLanguage.englishName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              else setIsVoiceEnabled(!isVoiceEnabled);
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isSpeaking ? 'bg-emerald-500 text-white' : isVoiceEnabled ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={isVoiceEnabled ? "Voice Enabled" : "Voice Muted"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SLIDE VIEW (EXACTLY 1 QUESTION / UX PER FRAME, ZERO SCROLLING)     */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 py-1.5">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* SLIDE 1: QUESTION 1 — CONVERSATIONAL AI INTAKE WITH LIVE STREAMING STT */}
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
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText(selectedLanguage.spokenIntro);
                  }}
                />
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-1.5 leading-snug">
                  What are you experiencing?
                </h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5 max-w-xs">
                  Type or speak what's wrong in your own words — our clinical AI understands everyday symptoms
                </p>
              </div>

              {/* Conversational Typing & Live Streaming Box */}
              <div className="flex-1 flex flex-col justify-center min-h-0 py-1 space-y-2">
                <div className={`relative flex flex-col rounded-2xl border transition-all ${
                  isListening
                    ? 'border-emerald-500 ring-2 ring-emerald-100 bg-white shadow-sm'
                    : 'border-slate-200/90 bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 shadow-2xs'
                }`}>
                  {/* Text Input / Streaming Display */}
                  <div className="relative p-3">
                    <textarea
                      rows={3}
                      value={inputText}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      placeholder={selectedLanguage.placeholder}
                      className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none resize-none leading-relaxed font-sans"
                    />

                    {/* Live Streamed Interim Transcribe Overlay */}
                    {isListening && streamedInterim && (
                      <div className="text-xs font-bold text-emerald-600 italic mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                        <span className="truncate">{streamedInterim}</span>
                        <span className="inline-block w-1 h-3.5 bg-emerald-500 animate-pulse shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Micro-Actions Toolbar */}
                  <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLanguageModal(true)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200/80 hover:border-slate-300 text-[10.5px] font-bold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Globe className="w-3 h-3 text-emerald-600" />
                        <span>{selectedLanguage.flag} {selectedLanguage.englishName}</span>
                      </button>

                      {inputText && (
                        <button
                          type="button"
                          onClick={() => {
                            setInputText('');
                            setStreamedInterim('');
                          }}
                          className="text-[10.5px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Live Voice Mic Button & Oscillating Waveform */}
                    <div className="flex items-center gap-2">
                      {isListening && (
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                          <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-3.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="w-1 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                          <span className="w-1 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                          <span className="text-[10px] font-bold text-emerald-700 ml-1">Live Transcribing</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isListening
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm ring-2 ring-rose-200 animate-pulse'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Voice Mic</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-Time Clinical AI Detection Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9.5px] font-bold text-emerald-400 tracking-wider uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Live Clinical AI</span>
                    </div>
                    <span className="text-[10.5px] font-bold text-emerald-400">
                      {activeCategory.diagnosis.confidence}% Precision Match
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <activeCategory.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-tight">{activeCategory.title}</span>
                        <span className="text-[10px] font-semibold text-slate-400 px-1.5 py-0.2 rounded-md bg-white/5 border border-white/10">
                          {activeCategory.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                        {activeCategory.diagnosis.primary}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>Matched: <strong className="text-slate-200">{matchedDoctor.name}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">Available Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick-Tap Symptom Inspiration Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                  <span className="text-[10.5px] font-semibold text-slate-400 shrink-0">Try:</span>
                  {[
                    { label: 'Severe Vomiting & Cramps', catId: 'vomiting_gi', text: 'Severe vomiting and stomach cramps since morning' },
                    { label: 'Spine & Back Pain', catId: 'pain_ortho', text: 'Sharp lower back pain radiating down my leg' },
                    { label: 'High Fever & Chills', catId: 'fever_infection', text: 'High fever (>102F) with shivering and body aches' },
                    { label: 'Migraine & Dizziness', catId: 'headache_neuro', text: 'Pulsating migraine headache on one side with light sensitivity' },
                    { label: 'Chest Pressure & Acidity', catId: 'chest_cardiac', text: 'Heavy pressure in chest with acid reflux burn' },
                    { label: 'Cough & Wheezing', catId: 'cough_breathing', text: 'Persistent dry cough with shortness of breath' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        const targetCat = SMART_CLINICAL_CATEGORIES.find(c => c.id === chip.catId)!;
                        handleSelectCategory(targetCat);
                        setInputText(chip.text);
                        if (isVoiceEnabled) {
                          speakText(targetCat.spokenIntro);
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-[11px] font-semibold transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleGoToQ2}
                  className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Continue to Severity (Question 2 of 3)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
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
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText(activeCategory.q2.prompt);
                  }}
                />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">
                  {activeCategory.q2.prompt}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activeCategory.q2.sub}
                </p>
              </div>

              {/* 4 Clean Options (No exam letters) */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0 py-1">
                {activeCategory.q2.options.map((opt) => {
                  const isChecked = selectedQ2 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedQ2(opt.id)}
                      className={`w-full text-left rounded-2xl p-2.5 flex items-center gap-3 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-slate-950 border-slate-950 text-white shadow-sm ring-1 ring-slate-950'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300 bg-transparent'
                      }`}>
                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-[11.5px] font-bold leading-tight truncate ${isChecked ? 'text-white' : 'text-slate-900'}`}>
                          {opt.label}
                        </div>
                        {opt.sub && (
                          <div className={`text-[10px] leading-tight mt-0.5 truncate ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
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
                  className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>Continue to Duration</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
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
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else if (isVoiceEnabled) speakText("How long have you had this?");
                  }}
                />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">
                  How long has this been occurring?
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Helps triage acute episodes from chronic conditions
                </p>
              </div>

              {/* 4 Clean Duration Options */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0 py-1">
                {DURATION_OPTIONS.map((opt) => {
                  const isChecked = selectedQ3 === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedQ3(opt.id)}
                      className={`w-full text-left rounded-2xl p-2.5 flex items-center gap-3 border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-slate-950 border-slate-950 text-white shadow-sm ring-1 ring-slate-950'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isChecked ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300 bg-transparent'
                      }`}>
                        {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`text-[11.5px] font-bold leading-tight truncate ${isChecked ? 'text-white' : 'text-slate-900'}`}>
                          {opt.label}
                        </div>
                        {opt.sub && (
                          <div className={`text-[10px] leading-tight mt-0.5 truncate ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
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
                  className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Run Clinical AI Synthesis</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
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
              {/* Top Analysis Header & Siri Orb */}
              <div className="flex flex-col items-center text-center shrink-0 pt-0.5">
                <SiriOrb
                  size={46}
                  state={isSpeaking ? "streaming" : "thinking"}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  onClick={() => {
                    if (isSpeaking) stopSpeaking();
                    else speakText(activeCategory.diagnosis.spokenSummary);
                  }}
                />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight mt-1 leading-snug">
                  Clinical AI Diagnostic Synthesis
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Synthesized from chief complaint, severity, and onset profile
                </p>
              </div>

              {/* Triage Diagnostic Card */}
              <div className="flex-1 flex flex-col justify-center min-h-0 py-1">
                <div className="p-3.5 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{activeCategory.diagnosis.confidence}% Confidence</span>
                      <span>•</span>
                      <span className="uppercase">{activeCategory.diagnosis.urgency}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speakText(activeCategory.diagnosis.spokenSummary)}
                        className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10.5px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-400" />
                        <span>Listen</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Specialty: {activeCategory.diagnosis.specialty}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug mt-0.5">
                      {activeCategory.diagnosis.primary}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {activeCategory.diagnosis.explanation}
                  </p>

                  <div className="pt-2 border-t border-white/10 text-[11px] text-slate-200 leading-relaxed">
                    <strong className="text-emerald-400 font-bold">Physician Advice: </strong>
                    {activeCategory.diagnosis.advice}
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleGoToHospitals(false)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-slate-950" />
                  <span>View Nearby Hospitals & Doctors</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
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
                  <span className="text-[11px] font-bold text-slate-900 truncate">{userLocation.displayName || userLocation.area}</span>
                  <span className="text-[9.5px] text-slate-500 font-medium shrink-0">
                    ({userLocation && selectedHospital.latitude && selectedHospital.longitude ? `${calculateDistanceKm(userLocation.lat, userLocation.lng, selectedHospital.latitude, selectedHospital.longitude)} km away` : (selectedHospital.distance || 'Nearby')})
                  </span>
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

              {/* Real Interactive Google Maps & GPS View */}
              <RealMapView
                hospitals={nearbyHospitals}
                selectedHospitalIndex={selectedHospitalIndex}
                onSelectHospital={(idx) => setSelectedHospitalIndex(idx)}
                userLocation={userLocation}
                onRefreshGps={requestUserLocation}
              />

              {/* Proximity Hospital Selector Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 shrink-0 pt-1">
                {nearbyHospitals.map((hosp, idx) => {
                  const isSelected = selectedHospitalIndex === idx;
                  const dist = userLocation && hosp.latitude && hosp.longitude
                    ? `${calculateDistanceKm(userLocation.lat, userLocation.lng, hosp.latitude, hosp.longitude)} km`
                    : (hosp.distance || '1.5 km');
                  return (
                    <button
                      key={hosp.id}
                      type="button"
                      onClick={() => {
                        setSelectedHospitalIndex(idx);
                        if (isVoiceEnabled) {
                          speakText(`Selected ${hosp.name}. Distance is ${dist} with live OPD ready.`);
                        }
                      }}
                      className={`p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-slate-950 text-white shadow-sm ring-1 ring-slate-950'
                          : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>{hosp.name.split(' ')[0]}</span>
                        <span className={`text-[9px] font-bold ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>{dist}</span>
                      </div>
                      <div className={`text-[8.5px] font-semibold truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-emerald-600'}`}>Live OPD Open</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Hospital & Assigned Specialist Doctor Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs space-y-2 shrink-0">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{selectedHospital.name}</h4>
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 shrink-0">
                        {selectedHospital.emergencyAvailable ? '24/7 OPD' : 'OPD Open'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      {selectedHospital.address} • {userLocation && selectedHospital.latitude && selectedHospital.longitude ? `${calculateDistanceKm(userLocation.lat, userLocation.lng, selectedHospital.latitude, selectedHospital.longitude)} km away` : (selectedHospital.distance || '1.5 km')}
                    </p>
                  </div>
                  <span className="text-[10.5px] font-bold text-slate-900 flex items-center gap-1 shrink-0 pl-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    {selectedHospital.rating}
                  </span>
                </div>

                {/* Doctor Row */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {topDoctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11.5px] font-bold text-slate-900 truncate">{formatDocName(topDoctor.name)}</h5>
                      <span className="text-[9.5px] font-bold text-emerald-600">Token #{topDoctor?.nextAvailableToken || 3} Ready</span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{topDoctor.specialty} • {topDoctor.experienceYears} yrs exp</p>
                  </div>
                </div>

                {/* 1-Tap Modern Booking Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'IN_PERSON_OPD')}
                    className="py-2.5 px-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-semibold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">Visit • ₹{topDoctor?.opConsultationFee || 80}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'VIDEO_CONSULTATION')}
                    className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="text-[11px]">Video • ₹399</span>
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
                className="absolute inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end p-2"
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
                      Or Select Location Hub:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { name: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana', lat: 17.4156, lng: 78.4350 },
                        { name: 'Peelamedu', city: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0267, lng: 76.9945 },
                        { name: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
                        { name: 'Adyar', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 },
                        { name: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
                        { name: 'Connaught Place', city: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090 }
                      ].map((loc) => {
                        const isSelected = userLocation.city === loc.city;
                        return (
                          <button
                            key={loc.city}
                            type="button"
                            onClick={() => handleSelectLocality(loc)}
                            className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 border-sky-400 text-sky-950 ring-1 ring-sky-200'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate">{loc.city}</div>
                              <div className="text-[9.5px] text-slate-400 truncate">{loc.name}</div>
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

          {/* ========================================================================= */}
          {/* INDIAN REGIONAL LANGUAGES MODAL SELECTOR                                  */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {showLanguageModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex flex-col justify-end p-2.5"
                onClick={() => setShowLanguageModal(false)}
              >
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-200/90 max-h-[82%] flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Select Indian Language</h4>
                        <p className="text-[10px] text-slate-400">Live Speech-to-Text & Indian Voice Synthesis</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLanguageModal(false)}
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto no-scrollbar space-y-1.5 flex-1 pr-1">
                    {SUPPORTED_INDIAN_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguage.code === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setShowLanguageModal(false);
                            if (isVoiceEnabled) {
                              speakText(lang.spokenIntro, lang.code);
                            }
                          }}
                          className={`w-full p-2.5 rounded-2xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-200'
                              : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/70 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{lang.flag}</span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">{lang.name}</div>
                              <div className="text-[10px] text-slate-400">{lang.englishName} • {lang.code}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLanguageModal(false)}
                    className="w-full mt-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Confirm Language
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
