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
  PhoneCall,
  LucideIcon 
} from 'lucide-react';
import { DoctorProfile, Hospital, OpSlot, PatientProfile } from '../types';
import { ConsultationType } from './BookingConsultationScreen';
import { SiriOrb } from './SiriOrb';

// ============================================================================
// ALL 10 INDIAN REGIONAL LANGUAGES (PREMIUM STT & TTS ENGINE)
// ============================================================================
export interface IndianLanguage {
  code: string;
  name: string;
  englishName: string;
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
    placeholder: 'Search symptoms, e.g. severe stomach pain, fever, back ache, knee swelling...',
    spokenIntro: 'Tell us what you are experiencing. We will guide you where to go and who to see.' 
  },
  { 
    code: 'ta-IN', 
    name: 'தமிழ்', 
    englishName: 'Tamil', 
    flag: '🇮🇳', 
    placeholder: 'உங்கள் அறிகுறிகளை தமிழில் தேடவும் அல்லது பேசவும்...',
    spokenIntro: 'உங்கள் பிரச்சனையை கூறுங்கள். நீங்கள் எந்த மருத்துவமனைக்கு செல்ல வேண்டும் என்று வழிகாட்டுகிறோம்.' 
  },
  { 
    code: 'hi-IN', 
    name: 'हिन्दी', 
    englishName: 'Hindi', 
    flag: '🇮🇳', 
    placeholder: 'अपने लक्षण लिखें या बोलें, जैसे पेट दर्द, बुखार, सिरदर्द...',
    spokenIntro: 'कृपया बताएं कि आपको क्या समस्या है। हम बताएंगे कि आपको किस अस्पताल या डॉक्टर के पास जाना चाहिए।' 
  },
  { 
    code: 'te-IN', 
    name: 'తెలుగు', 
    englishName: 'Telugu', 
    flag: '🇮🇳', 
    placeholder: 'మీ సమస్యను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...',
    spokenIntro: 'మీ లక్షణాలను తెలపండి. మీరు ఏ విభాగానికి లేదా ఆసుపత్రికి వెళ్లాలో మేము మార్గదర్శనం చేస్తాము.' 
  },
  { 
    code: 'kn-IN', 
    name: 'ಕನ್ನಡ', 
    englishName: 'Kannada', 
    flag: '🇮🇳', 
    placeholder: 'ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...',
    spokenIntro: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ. ನೀವು ಯಾವ ವೈದ್ಯರ ಬಳಿಗೆ ಹೋಗಬೇಕೆಂದು ನಾವು ತಿಳಿಸುತ್ತೇವೆ.' 
  },
  { 
    code: 'ml-IN', 
    name: 'മലയാളം', 
    englishName: 'Malayalam', 
    flag: '🇮🇳', 
    placeholder: 'ലക്ഷണങ്ങൾ മലയാളത്തിൽ തിരയുക അല്ലെങ്കിൽ പറയുക...',
    spokenIntro: 'നിങ്ങളുടെ ബുദ്ധിമുട്ട് വ്യക്തമാക്കുക. ഏത് ആശുപത്രിയിൽ പോകണമെന്ന് ഞങ്ങൾ വഴികാണിക്കാം.' 
  },
  { 
    code: 'mr-IN', 
    name: 'मराठी', 
    englishName: 'Marathi', 
    flag: '🇮🇳', 
    placeholder: 'आपली लक्षणे टाइप करा किंवा बोला...',
    spokenIntro: 'आपली लक्षणे सांगा. आपण कोणत्या डॉक्टरकडे जावे हे आम्ही सुचवू.' 
  },
  { 
    code: 'bn-IN', 
    name: 'বাংলা', 
    englishName: 'Bengali', 
    flag: '🇮🇳', 
    placeholder: 'আপনার লক্ষণগুলি বাংলায় লিখুন বা বলুন...',
    spokenIntro: 'আপনার সমস্যা জানান। কোন হাসপাতালে যাবেন তা আমরা বলে দেব।' 
  },
  { 
    code: 'gu-IN', 
    name: 'ગુજરાતી', 
    englishName: 'Gujarati', 
    flag: '🇮🇳', 
    placeholder: 'તમારા લક્ષણો લખો અથવા બોલો...',
    spokenIntro: 'તમારી તકલીફ જણાવો. કયા દવાખાને જવું તે અમે બતાવીશું.' 
  },
  { 
    code: 'pa-IN', 
    name: 'ਪੰਜਾਬੀ', 
    englishName: 'Punjabi', 
    flag: '🇮🇳', 
    placeholder: 'ਆਪਣੇ ਲੱਛਣ ਲਿਖੋ ਜਾਂ ਬੋਲੋ...',
    spokenIntro: 'ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ। ਅਸੀਂ ਦੱਸਾਂਗੇ ਕਿ ਤੁਹਾਨੂੰ ਕਿੱਥੇ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ।' 
  }
];

// ============================================================================
// CARE NAVIGATOR CATEGORIES (WHERE TO GO & SPECIALIST MATCHING)
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

export interface SmartCategoryConfig {
  id: ClinicalCategoryId;
  title: string;
  badge: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  keywords: string[];
  department: string;
  specialty: string;
  urgency: 'PRIORITY' | 'SAME_DAY' | 'ROUTINE';
  urgencyLabel: string;
  whereToGoAdvice: string;
  spokenSummary: string;
}

export const SMART_CLINICAL_CATEGORIES: SmartCategoryConfig[] = [
  {
    id: 'vomiting_gi',
    title: 'Stomach & Digestion',
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
    department: 'Department of Gastroenterology & General Medicine',
    specialty: 'Gastroenterology',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Visit Hospital OPD Today',
    whereToGoAdvice: 'Visit the Gastroenterology or General Medicine OPD for physical examination and rehydration. If vomiting is severe and you cannot keep fluids down, head directly to the 24/7 Emergency unit for IV fluids.',
    spokenSummary: 'For severe stomach pain or vomiting, visit the Gastroenterology department at City Care Hospital nearby. An outpatient queue token is available.'
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
    department: 'Department of Orthopedics & Joint Care',
    specialty: 'Orthopedics',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Consult Orthopedic Specialist',
    whereToGoAdvice: 'Visit an Orthopedic specialist at a hospital OPD for joint and spinal mobility testing. Avoid heavy lifting and apply warm compress. A video consultation is also available if travel is painful.',
    spokenSummary: 'For joint or back pain, visit the Orthopedic specialist at City Care Hospital.'
  },
  {
    id: 'fever_infection',
    title: 'Fever & Infection',
    badge: 'General Medicine',
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
    department: 'Department of General & Internal Medicine',
    specialty: 'General Medicine',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Visit General Physician Today',
    whereToGoAdvice: 'Visit a General Physician at the hospital OPD for vitals check, temperature assessment, and routine CBC screening. Keep well hydrated with water and electrolytes.',
    spokenSummary: 'Visit General Medicine at City Care Hospital for fever and infection evaluation.'
  },
  {
    id: 'chest_cardiac',
    title: 'Chest & Heart',
    badge: 'Cardiology (24/7)',
    icon: HeartPulse,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    keywords: [
      'chest', 'heart', 'palpitation', 'chest pain', 'cardiac', 'tightness', 'shortness of breath', 'left arm pain', 'pressure', 'angina', 'fluttering', 'racing heart',
      'seena dard', 'chaati dard', 'dil', 'सीना दर्द', 'छाती', 'दिल',
      'nenju', 'nenju vali', 'irudhayam', 'நெஞ்சு வலி', 'இதயம்',
      'gunde', 'gunde noppi', 'chaathi', 'గుండె నొప్పి',
      'ede novu', 'hrudaya', 'ಎದೆ ನೋವು', 'ഹൃദയം', 'നെഞ്ചുവേദന'
    ],
    department: 'Department of Cardiology & Emergency Care',
    specialty: 'Cardiology',
    urgency: 'PRIORITY',
    urgencyLabel: 'Priority 24/7 Emergency Care',
    whereToGoAdvice: 'Head directly to the nearest 24/7 Emergency Trauma or Cardiology OPD at a multi-specialty hospital for immediate ECG and physician evaluation. Do not delay or drive alone.',
    spokenSummary: 'For chest discomfort, go immediately to the Emergency or Cardiology department at City Care Hospital.'
  },
  {
    id: 'headache_neuro',
    title: 'Head & Neuro',
    badge: 'Neurology',
    icon: Brain,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    keywords: [
      'headache', 'migraine', 'dizziness', 'giddiness', 'vertigo', 'fainting', 'numbness', 'tingling', 'seizure', 'tremor', 'head ache',
      'sar dard', 'sir dard', 'chakkar', 'बेहोशी', 'सिरदर्द', 'चक्कर',
      'thalai vali', 'thalaivali', 'mayakkam', 'தலைவலி', 'மயக்கம்',
      'tala noppi', 'talanoppi', 'thirugudu', 'తల నొప్పి', 'కళ్ళు తిరగడం',
      'tale novu', 'taledhudhu', 'ತಲೆ ನೋವು', 'തലവേദന', 'തലകറക്കം'
    ],
    department: 'Department of Neurology & General Medicine',
    specialty: 'Neurology',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Consult Neurologist or Physician',
    whereToGoAdvice: 'Visit a Neurologist or Physician at the hospital OPD for neurological examination. If the headache started suddenly with vision change or numbness, visit Emergency immediately.',
    spokenSummary: 'Visit Neurology at City Care Hospital for neurological consultation.'
  },
  {
    id: 'cough_breathing',
    title: 'Cough & Lungs',
    badge: 'Pulmonology',
    icon: Wind,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    keywords: [
      'cough', 'breathing', 'wheezing', 'asthma', 'breathless', 'phlegm', 'sputum', 'bronchitis', 'dry cough', 'wet cough', 'chest congestion',
      'khaansi', 'saans', 'khasi', 'दमा', 'खांसी', 'सांस फूलना',
      'irumal', 'moochu', 'moochu thinaral', 'சளி', 'இருமல்', 'மூச்சுத்திணறல்',
      'daggulu', 'swasa', 'daggu', 'శ్వాస', 'దగ్గు',
      'kemmu', 'usiru', 'ಕೆಮ್ಮು', 'ചുമ', 'ശ്വാസംമുട്ടൽ'
    ],
    department: 'Department of Pulmonology & Respiratory Care',
    specialty: 'Pulmonology',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Visit Pulmonology OPD Today',
    whereToGoAdvice: 'Visit Pulmonology or General Medicine for chest auscultation and oxygen saturation testing. If you have resting breathlessness, go directly to the hospital Emergency room.',
    spokenSummary: 'Visit Pulmonology at City Care Hospital for respiratory examination.'
  },
  {
    id: 'skin_allergy',
    title: 'Skin & Allergy',
    badge: 'Dermatology',
    icon: Smile,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    keywords: [
      'skin', 'rash', 'itching', 'allergy', 'eczema', 'hives', 'pimple', 'acne', 'redness', 'boil', 'fungal', 'scalp', 'dermatitis', 'scabies',
      'khujli', 'daane', 'twacha', 'खुजली', 'दाने', 'त्वचा',
      'arippu', 'tholu', 'thol', 'அரிப்பு', 'தோல் நோய்',
      'durada', 'charma', 'దురద', 'చర్మ సమస్య',
      'tika', 'chaddi', 'ತುರಿಕೆ', 'ത്വക്ക്', 'ചൊറിച്ചിൽ'
    ],
    department: 'Department of Dermatology',
    specialty: 'Dermatology',
    urgency: 'ROUTINE',
    urgencyLabel: 'In-Person OPD or Video Call',
    whereToGoAdvice: 'Consult a Dermatologist either at an outpatient hospital clinic or through an instant video call from home for visual skin inspection and targeted topical treatment.',
    spokenSummary: 'Consult Dermatology at City Care Hospital or connect via video call.'
  },
  {
    id: 'pediatrics_child',
    title: 'Child & Infant',
    badge: 'Pediatrics',
    icon: Baby,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    keywords: [
      'child', 'baby', 'infant', 'toddler', 'kid', 'pediatric', 'vaccination', 'newborn', 'colic', 'feeding',
      'bacha', 'bacche', 'chota bacha', 'बच्चा', 'शिशु',
      'kuzhandhai', 'paapa', 'kulandhai', 'குழந்தை', 'பாப்பா',
      'pilla', 'biddalu', 'chinna pilla', 'పిల్లలు', 'పాప',
      'makkalu', 'magu', 'ಮಗು', 'കുഞ്ഞ്', 'പീഡിയാട്രിക്'
    ],
    department: 'Department of Pediatrics & Child Health',
    specialty: 'Pediatrics',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Consult Pediatric Specialist',
    whereToGoAdvice: 'Take your child to a specialist Pediatric OPD at a children\'s clinic or multi-specialty hospital with pediatric facilities for gentle vital checks and examination.',
    spokenSummary: 'Take your child to the Pediatric department at City Care Hospital.'
  },
  {
    id: 'eye_vision',
    title: 'Eye & Vision',
    badge: 'Ophthalmology',
    icon: Eye,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    keywords: [
      'eye', 'vision', 'blur', 'itchy eye', 'red eye', 'pain eye', 'watery eye', 'stye', 'conjunctivitis', 'spectacles',
      'aankh', 'dikhai', 'आंख', 'आंखों',
      'kann', 'kannu', 'parvai', 'கண்', 'பார்வை',
      'kallu', 'chupu', 'కన్ను', 'చూపు',
      'kannu novu', 'drushti', 'ಕಣ್ಣು', 'കണ്ണ്'
    ],
    department: 'Department of Ophthalmology (Eye Care)',
    specialty: 'Ophthalmology',
    urgency: 'ROUTINE',
    urgencyLabel: 'Visit Eye Specialist',
    whereToGoAdvice: 'Visit an Eye Care clinic or Ophthalmology department at a hospital for slit-lamp examination, vision assessment, and prescription eye drops.',
    spokenSummary: 'Visit the Ophthalmology department at City Care Hospital.'
  },
  {
    id: 'ent_throat',
    title: 'ENT & Throat',
    badge: 'ENT Specialist',
    icon: Ear,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    keywords: [
      'ear', 'nose', 'throat', 'sinus', 'tonsil', 'earache', 'ear pain', 'hearing', 'tinnitus', 'nasal', 'sneezing',
      'kaan', 'naak', 'gala', 'कान', 'नाक', 'गला',
      'kaadhu', 'mooku', 'thondai', 'காது', 'மூக்கு', 'தொண்டை',
      'chevi', 'mukku', 'gonthu', 'చెవి', 'ముక్కు', 'గొంతు',
      'kivi', 'moogu', 'gantalu', 'ಕಿವಿ', 'ಮೂಗು', 'గొంతు', 'ചെവി', 'മൂക്ക്'
    ],
    department: 'Department of ENT (Ear, Nose & Throat)',
    specialty: 'ENT',
    urgency: 'ROUTINE',
    urgencyLabel: 'Visit ENT Specialist',
    whereToGoAdvice: 'Visit an ENT specialist for otoscopic ear inspection, throat swab, or sinus evaluation.',
    spokenSummary: 'Visit the ENT department at City Care Hospital.'
  },
  {
    id: 'dental_oral',
    title: 'Dental & Oral',
    badge: 'Dentistry',
    icon: Droplets,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    keywords: [
      'tooth', 'teeth', 'dental', 'gum', 'bleeding gum', 'toothache', 'cavity', 'molar', 'mouth ulcer',
      'daant', 'masuda', 'दांत', 'मसूड़े',
      'pal', 'pallu', 'eeru', 'பல் வலி', 'ஈறு',
      'pallu noppi', 'చిగుళ్ళు', 'దంత సమస్య',
      'hallu', 'hallu novu', 'ಹಲ್ಲು ನೋವು', 'പല്ലുവേദന'
    ],
    department: 'Department of Dental & Oral Care',
    specialty: 'Dentistry',
    urgency: 'ROUTINE',
    urgencyLabel: 'Visit Dental Clinic',
    whereToGoAdvice: 'Visit a dental clinic or hospital dental wing for direct tooth examination and X-ray.',
    spokenSummary: 'Visit the Dental clinic at City Care Hospital.'
  },
  {
    id: 'urinary_kidney',
    title: 'Urinary & Kidney',
    badge: 'Nephrology / Urology',
    icon: FlaskConical,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    keywords: [
      'urine', 'urinary', 'burning', 'uti', 'kidney', 'stone', 'flank pain', 'blood urine', 'bladder',
      'peshab', 'jaln', 'पेशाब', 'गुर्दा',
      'siruneer', 'eriച്ചல்', 'சிறுநீர்',
      'muthram', 'manta', 'మూత్రం', 'కిడ్నీ',
      'moothra', 'ಉರಿ ಮೂತ್ರ', 'മൂത്രമൊഴിക്കുമ്പോൾ'
    ],
    department: 'Department of Urology & Nephrology',
    specialty: 'Urology',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Visit Urology / Nephrology OPD',
    whereToGoAdvice: 'Visit a Urologist or General Physician for urine analysis, hydration guidance, and ultrasound if flank pain is present.',
    spokenSummary: 'Visit Urology at City Care Hospital for urinary assessment.'
  },
  {
    id: 'womens_health',
    title: "Women's Health",
    badge: 'Gynecology & Obs',
    icon: HeartHandshake,
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    keywords: [
      'period', 'menstrual', 'cramp', 'pregnancy', 'pregnant', 'gynecology', 'pcos', 'pelvic', 'discharge', 'irregular period',
      'mahina', 'garbh', 'माहवारी', 'गर्भावस्था',
      'madhavi', 'karppam', 'மாதவிடாய்', 'கர்ப்பம்',
      'muttulu', 'garbham', 'పీరియడ్స్', 'గర్భం',
      'rutu', 'tumba', 'ಮುಟ್ಟು', 'ഗർഭം', 'ആർത്തവം'
    ],
    department: 'Department of Obstetrics & Gynecology',
    specialty: 'Gynecology',
    urgency: 'SAME_DAY',
    urgencyLabel: 'Consult Obstetrician / Gynecologist',
    whereToGoAdvice: 'Visit a Gynecologist at a maternity centre or multi-specialty hospital for confidential consultation and pelvic ultrasound.',
    spokenSummary: 'Visit Gynecology at City Care Hospital for consultation.'
  },
  {
    id: 'trauma_firstaid',
    title: 'Emergency & Trauma',
    badge: '24/7 Trauma Unit',
    icon: Bandage,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    keywords: [
      'accident', 'injury', 'bleed', 'bleeding', 'cut', 'fall', 'burn', 'fracture', 'wound', 'head injury', 'trauma', 'emergency',
      'chot', 'khoon', 'hadsa', 'चोट', 'खून', 'हादसा',
      'kaayam', 'ratham', 'விபத்து', 'காயம்', 'ரத்தம்',
      'gaayam', 'raktham', 'ప్రమాదం', 'గాయం',
      'gaaya', 'raktha', 'ಗಾಯ', 'രക്തസ്രാവം', 'അപകടം'
    ],
    department: '24/7 Emergency & Trauma Unit',
    specialty: 'Emergency Medicine',
    urgency: 'PRIORITY',
    urgencyLabel: 'Immediate 24/7 Trauma Visit',
    whereToGoAdvice: 'Head immediately to the nearest 24/7 Emergency Trauma center for wound dressing, suturing, or emergency stabilization. Dial 108 if ambulance transport is required.',
    spokenSummary: 'Go immediately to the 24/7 Trauma and Emergency Center at City Care Hospital.'
  },
  {
    id: 'diagnostics_lab',
    title: 'Lab Tests & Scans',
    badge: 'Diagnostic Centre',
    icon: Syringe,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    keywords: [
      'test', 'blood test', 'lab', 'ecg', 'x-ray', 'xray', 'scan', 'mri', 'ct scan', 'ultrasound', 'sugar test', 'thyroid', 'cbc',
      'jaanch', 'khoon jaanch', 'जांच', 'खून जांच',
      'parithanai', 'ratha parithanai', 'பரிசோதனை',
      'pariksha', 'raktha pariksha', 'పరీక్ష', 'ల్యాబ్',
      'raktha pareekshe', 'ಲ್ಯಾಬ್', 'രക്തപരിശോധന'
    ],
    department: 'Hospital Diagnostic Laboratory & Scans',
    specialty: 'General Medicine',
    urgency: 'ROUTINE',
    urgencyLabel: 'Visit Hospital Diagnostic Lab',
    whereToGoAdvice: 'Visit the hospital diagnostic lab for fasting or random blood samples, digital X-Ray, or ECG. Results are delivered digitally to your phone.',
    spokenSummary: 'Visit the Diagnostic Lab at City Care Hospital for tests.'
  },
  {
    id: 'general_other',
    title: 'General OPD',
    badge: 'Internal Medicine',
    icon: Stethoscope,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    keywords: [
      'weakness', 'fatigue', 'tired', 'general checkup', 'routine', 'health check', 'doctor', 'physician',
      'kamzori', 'thakan', 'कमजोरी', 'थकान',
      'aasai', 'sornvu', 'சோர்வு', 'உடல் சோர்வு',
      'neerasam', 'alasata', 'నీరసం', 'అలసట',
      'susthu', 'nissahukathe', 'ಸುಸ್ತು', 'ക്ഷീണം'
    ],
    department: 'Department of General Medicine & Outpatient Care',
    specialty: 'General Medicine',
    urgency: 'ROUTINE',
    urgencyLabel: 'Visit General OPD',
    whereToGoAdvice: 'Visit the General Medicine OPD at the nearest hospital for routine checkup, vitals examination, or health review.',
    spokenSummary: 'Visit General Medicine OPD at City Care Hospital.'
  }
];

export interface AiHealthAssistantProps {
  patientProfile?: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  userLocation?: UserLocationData | null;
  onOpenCheckout: (doctor: DoctorProfile, consultationType: ConsultationType, explicitSlot?: OpSlot) => void;
  onClose?: () => void;
}

// 2 Simple, Direct Steps: 1. Select / Type Symptom -> 2. Where You Should Go
export type AiFlowStep = 'SYMPTOM_INPUT' | 'WHERE_TO_GO';

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  hospitals,
  doctors,
  slots,
  userLocation: propUserLocation,
  onOpenCheckout,
  onClose
}) => {
  // 2-Step Flow
  const [currentStep, setCurrentStep] = useState<AiFlowStep>('SYMPTOM_INPUT');
  const [selectedCategoryId, setSelectedCategoryId] = useState<ClinicalCategoryId>('vomiting_gi');
  const [inputText, setInputText] = useState<string>('');
  const [showMoreModal, setShowMoreModal] = useState<boolean>(false);
  const [selectedHospitalIndex, setSelectedHospitalIndex] = useState<number>(0);

  // Voice & Language State
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>(SUPPORTED_INDIAN_LANGUAGES[0]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // User Location
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

  // Proximity sorted hospitals
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

  const selectedHospital = sortedHospitals[selectedHospitalIndex] || sortedHospitals[0] || hospitals[0];

  // Active Category Config
  const activeCategory = useMemo(() => {
    return SMART_CLINICAL_CATEGORIES.find(c => c.id === selectedCategoryId) || SMART_CLINICAL_CATEGORIES[0];
  }, [selectedCategoryId]);

  // Primary Doctor Match
  const availableDoctors = useMemo(() => {
    const targetSpecialty = activeCategory.specialty.toLowerCase();
    let docs = doctors.filter(d => {
      const spec = d.specialty.toLowerCase();
      return spec.includes(targetSpecialty) || targetSpecialty.includes(spec) || spec.includes('general') || spec.includes('medicine');
    });
    if (docs.length === 0) docs = doctors;
    return docs;
  }, [doctors, activeCategory.specialty]);

  const topDoctor = useMemo(() => {
    if (availableDoctors.length > selectedHospitalIndex) {
      return availableDoctors[selectedHospitalIndex];
    }
    return availableDoctors[0] || doctors[0];
  }, [availableDoctors, selectedHospitalIndex, doctors]);

  // Automatically detect category when user types
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) return;

    const lower = text.toLowerCase();
    for (const cat of SMART_CLINICAL_CATEGORIES) {
      for (const kw of cat.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          setSelectedCategoryId(cat.id);
          return;
        }
      }
    }
  };

  // Select category and immediately guide where to go
  const handleSelectCategory = (catId: ClinicalCategoryId) => {
    setSelectedCategoryId(catId);
    stopSpeaking();
    setCurrentStep('WHERE_TO_GO');
    const matched = SMART_CLINICAL_CATEGORIES.find(c => c.id === catId);
    if (matched && isVoiceEnabled) {
      speakText(matched.spokenSummary);
    }
  };

  // Find natural speech voice
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string, customLang?: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const targetLang = customLang || selectedLanguage.code;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Speech Recognition (STT)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type your symptoms.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      stopSpeaking();
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = selectedLanguage.code;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleInputChange(transcript);
          // Directly guide where to go with spoken query
          setTimeout(() => {
            setCurrentStep('WHERE_TO_GO');
          }, 400);
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

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

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    const scrollContainers = document.querySelectorAll("div[class*='overflow-y-auto']");
    scrollContainers.forEach(c => { c.scrollTop = 0; });
  }, [currentStep]);

  // Core 8 categories for clean grid display
  const coreCategories = useMemo(() => {
    const coreIds: ClinicalCategoryId[] = [
      'vomiting_gi',
      'pain_ortho',
      'fever_infection',
      'chest_cardiac',
      'headache_neuro',
      'pediatrics_child',
      'skin_allergy',
      'trauma_firstaid'
    ];
    return coreIds.map(id => SMART_CLINICAL_CATEGORIES.find(c => c.id === id)!);
  }, []);

  return (
    <div className="min-h-full flex flex-col select-none animate-in fade-in duration-150 relative bg-slate-50 text-slate-900 pb-28">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: BCARE AI                                                   */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 shadow-2xs shrink-0">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (currentStep === 'WHERE_TO_GO') {
                setCurrentStep('SYMPTOM_INPUT');
              } else {
                onClose?.();
              }
            }}
            className="flex items-center gap-1 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-4 h-4 shrink-0 text-slate-600" />
            <span>{currentStep === 'WHERE_TO_GO' ? 'Change Concern' : 'Exit'}</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <h2 className="text-sm font-black text-slate-950 tracking-tight whitespace-nowrap">
              Bcare AI
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={() => setShowLanguageModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10.5px] font-bold transition-colors cursor-pointer shrink-0"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{selectedLanguage.englishName.split(' ')[0]}</span>
            </button>

            {/* Voice Readout Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !isVoiceEnabled;
                setIsVoiceEnabled(nextState);
                if (!nextState) stopSpeaking();
                else speakText(activeCategory.spokenSummary);
              }}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                isVoiceEnabled 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
              }`}
              title="Voice Guidance"
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BODY CONTENT: STEP 1 (INPUT) vs STEP 2 (WHERE TO GO)                   */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">

          {/* ===================================================================== */}
          {/* STEP 1: TELL US WHAT'S WRONG / SELECT CARE CONCERN                   */}
          {/* ===================================================================== */}
          {currentStep === 'SYMPTOM_INPUT' && (
            <motion.div
              key="step-input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Apple Intelligence Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1322] via-[#0f1b2d] to-[#0a1827] text-white p-4.5 shadow-md border border-blue-500/30 space-y-3">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <SiriOrb size={44} state={isListening ? 'listening' : 'idle'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                        Bcare Clinical AI
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-white mt-0.5 leading-snug">
                      What symptoms are you experiencing?
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5">
                      We'll assess your concern and book the right hospital specialist.
                    </p>
                  </div>
                </div>

                {/* Input & Voice Bar */}
                <div className="relative flex items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && inputText.trim()) {
                          setCurrentStep('WHERE_TO_GO');
                        }
                      }}
                      placeholder={selectedLanguage.placeholder}
                      className="w-full py-3 pl-10 pr-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 focus:bg-white focus:text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-semibold text-white placeholder:text-slate-400 outline-none transition-all shadow-inner"
                    />
                    <Search className="w-4 h-4 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    {inputText && (
                      <button
                        type="button"
                        onClick={() => setInputText('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer shrink-0 shadow-sm active:scale-95 ${
                      isListening
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                        : 'bg-white hover:bg-slate-100 text-slate-900 border-white'
                    }`}
                    title={isListening ? 'Listening... Tap to stop' : 'Tap to speak your symptoms'}
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-blue-600" />}
                  </button>
                </div>

                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep('WHERE_TO_GO')}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Assess Symptoms with Bcare AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Care Category Tiles (Vertical Cards: ZERO TRUNCATION) */}
              <div>
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Or Select Primary Concern:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMoreModal(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    View All (18) →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {coreCategories.map((cat) => {
                    const IconComponent = cat.icon;
                    return (
                      <motion.div
                        whileTap={{ scale: 0.97 }}
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer shadow-2xs flex flex-col justify-between min-h-[96px] group"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                            <IconComponent className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                            Select →
                          </span>
                        </div>
                        <div className="mt-2 w-full">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                            {cat.title}
                          </h4>
                          <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                            {cat.badge}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Ribbon */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-extrabold text-rose-950 text-xs">
                      Life-Threatening Emergency?
                    </h5>
                    <p className="text-[10.5px] text-rose-700 truncate">
                      Head to the nearest trauma unit or call 108 immediately
                    </p>
                  </div>
                </div>

                <a
                  href="tel:108"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shrink-0 flex items-center gap-1 shadow-2xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 108</span>
                </a>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: BCARE AI CLINICAL ASSESSMENT & DIRECT BOOKING FORM TYPE       */}
          {/* ===================================================================== */}
          {currentStep === 'WHERE_TO_GO' && (
            <motion.div
              key="step-where-to-go"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {/* Card 1: Bcare AI Clinical Assessment */}
              <div className="p-4.5 rounded-3xl bg-slate-900 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300">
                      Bcare AI Assessment
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    activeCategory.urgency === 'PRIORITY'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {activeCategory.urgencyLabel}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommended Department & Specialist
                  </span>
                  <h3 className="text-base font-black text-white leading-tight mt-0.5">
                    {activeCategory.department}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-cyan-300">
                      Attending: {topDoctor.name} ({topDoctor.specialty})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                    {activeCategory.whereToGoAdvice}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Specialist: <strong className="text-white font-bold">{activeCategory.specialty}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={() => speakText(activeCategory.spokenSummary)}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Listen</span>
                  </button>
                </div>
              </div>

              {/* Card 2: CHOOSE CONSULTATION FORMAT (BOOKING UI FORM TYPE) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Choose Booking Format
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select your preferred way to consult with {topDoctor.name}
                    </p>
                  </div>
                </div>

                {/* Option 1: In-Person Hospital OPD Pass */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:border-blue-400 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                            In-Person OPD Pass
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            Live Queue
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 mt-1 truncate">
                          {selectedHospital.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {selectedHospital.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-slate-900 block">
                        ₹{topDoctor.opConsultationFee || 100}
                      </span>
                      <span className="text-[10px] text-slate-400">ABDM Pass</span>
                    </div>
                  </div>

                  {/* Status Strip */}
                  <div className="py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-extrabold text-slate-900">
                        Token #{topDoctor.nextAvailableToken || 5} Ready
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">Room 204</span>
                    </div>
                    <span className="text-emerald-700 font-bold text-[11px]">~10m wait</span>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'IN_PERSON_OPD')}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-200" />
                      <span>Book In-Person OPD Token</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-100">
                      <span>From ₹{topDoctor.opConsultationFee || 100}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
                    </div>
                  </motion.button>
                </div>

                {/* Option 2: HD Video Call (Integrated Real-time Teleconsult) */}
                <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 shadow-sm hover:border-emerald-400 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                            HD Video Telehealth
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-white text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                            Zero Travel
                          </span>
                        </div>
                        <h4 className="font-black text-sm text-slate-900 mt-1 truncate">
                          Online Video Consultation
                        </h4>
                        <p className="text-[11px] text-emerald-800/80 font-medium truncate mt-0.5">
                          Consult {topDoctor.name} live from your phone
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-emerald-900 block">
                        ₹{topDoctor.teleConsultationFee || 250}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Video + Rx</span>
                    </div>
                  </div>

                  {/* Video Feature Bullets */}
                  <div className="py-2 px-3 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Ready in ~10m • 10 Indian Regional Languages</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live two-way camera, mic visualizer, doctor chat & instant digital Rx</span>
                    </div>
                  </div>

                  {/* Video Action Button */}
                  <motion.button
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => handleProceedBooking(topDoctor, 'VIDEO_CONSULTATION')}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-200" />
                      <span>Schedule Video Consultation</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-100">
                      <span>₹{topDoctor.teleConsultationFee || 250}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-200" />
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Directions Link (Clean & Simple) */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedHospital.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {selectedHospital.address}
                    </span>
                  </div>
                </div>

                <a
                  href={getGoogleMapsDirectionsUrl(
                    userLocation.lat,
                    userLocation.lng,
                    selectedHospital.latitude || 11.0168,
                    selectedHospital.longitude || 76.9558,
                    selectedHospital.name
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                  <span>Google Maps</span>
                </a>
              </div>

              {/* Bottom Action: Check Another Symptom */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('SYMPTOM_INPUT')}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Check Another Symptom or Concern</span>
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: ALL 18 SPECIALTY CARE CATEGORIES                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showMoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">All Care Departments</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Select your primary symptom or specialty</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2">
                {SMART_CLINICAL_CATEGORIES.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setShowMoreModal(false);
                        handleSelectCategory(cat.id);
                      }}
                      className="p-3 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.iconBg} ${cat.iconColor}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">{cat.title}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{cat.badge} • {cat.urgencyLabel}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MODAL: REGIONAL LANGUAGE SELECTOR                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Choose Language / भाषा चुनें</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Voice guidance and speech recognition support</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLanguageModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2">
                {SUPPORTED_INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = lang.code === selectedLanguage.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageModal(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-2xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <span className="font-extrabold text-xs block">{lang.name}</span>
                          <span className="text-[10px] text-slate-500">{lang.englishName}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default AiHealthAssistant;
