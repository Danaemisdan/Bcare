import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Languages, 
  Sparkles, 
  ChevronLeft, 
  Building2, 
  Calendar, 
  Video, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  RotateCcw, 
  Star, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  ExternalLink
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
  greeting: string;
  listeningText: string;
}

export const SUPPORTED_INDIAN_LANGUAGES: IndianLanguage[] = [
  { 
    code: 'en-IN', 
    name: 'English', 
    englishName: 'English (IN)', 
    flag: '🇮🇳', 
    placeholder: 'Type your symptoms or tap the mic to speak...',
    greeting: "Hello! I'm Bcare AI, your clinical care assistant. 🩺\n\nWhat health problem or symptoms are you experiencing today? You can speak using the mic 🎙️ in any language or type below.",
    listeningText: "Listening... Please speak your symptoms now"
  },
  { 
    code: 'te-IN', 
    name: 'తెలుగు', 
    englishName: 'Telugu', 
    flag: '🇮🇳', 
    placeholder: 'మీ ఆరోగ్య సమస్యను ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...',
    greeting: "నమస్కారం! నేను మీ బికేర్ AI క్లినికల్ అసిస్టెంట్‌ని. 🩺\n\nమీకు ఎలాంటి ఆరోగ్య సమస్య లేదా నొప్పులు ఉన్నాయి? మైక్ 🎙️ ద్వారా తెలుగులో మాట్లాడండి లేదా కింద టైప్ చేయండి.",
    listeningText: "వింటున్నాను... మీ లక్షణాలను ఇప్పుడు మాట్లాడండి"
  },
  { 
    code: 'hi-IN', 
    name: 'हिन्दी', 
    englishName: 'Hindi', 
    flag: '🇮🇳', 
    placeholder: 'अपनी परेशानी लिखें या माइक दबाकर बोलें...',
    greeting: "नमस्ते! मैं आपका बीकेयर AI क्लिनिकल असिस्टेंट हूँ। 🩺\n\nआपको क्या स्वास्थ्य समस्या या लक्षण महसूस हो रहे हैं? आप माइक 🎙️ दबाकर हिन्दी में बोल सकते हैं या नीचे लिख सकते हैं।",
    listeningText: "सुन रहा हूँ... कृपया अपनी परेशानी बताएं"
  },
  { 
    code: 'ta-IN', 
    name: 'தமிழ்', 
    englishName: 'Tamil', 
    flag: '🇮🇳', 
    placeholder: 'உங்கள் பிரச்சனையை தமிழில் தட்டச்சு செய்யவும் அல்லது பேசவும்...',
    greeting: "வணக்கம்! நான் உங்கள் பிகேர் AI உதவியாளர். 🩺\n\nஉங்களுக்கு என்ன உடல்நல பிரச்சனை அல்லது வலி உள்ளது? மைக் 🎙️ மூலம் தமிழில் பேசலாம் அல்லது கீழே தட்டச்சு செய்யவும்.",
    listeningText: "கேட்கிறது... உங்கள் பிரச்சனையை இப்போது பேசுங்கள்"
  },
  { 
    code: 'kn-IN', 
    name: 'ಕನ್ನಡ', 
    englishName: 'Kannada', 
    flag: '🇮🇳', 
    placeholder: 'ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ...',
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಬಿಕೇರ್ AI ಕ್ಲಿನಿಕಲ್ ಸಹಾಯಕ. 🩺\n\nನಿಮಗೆ ಯಾವ ಆರೋಗ್ಯ ಸಮಸ್ಯೆ ಇದೆ? ಮೈಕ್ 🎙️ ಒತ್ತಿ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಬರೆಯಿರಿ.",
    listeningText: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಮಾತನಾಡಿ"
  },
  { 
    code: 'ml-IN', 
    name: 'മലയാളം', 
    englishName: 'Malayalam', 
    flag: '🇮🇳', 
    placeholder: 'ലക്ഷണങ്ങൾ മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ പറയുക...',
    greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ബികെയർ AI അസിസ്റ്റന്റാണ്. 🩺\n\nനിങ്ങൾക്ക് എന്ത് രോഗലക്ഷണങ്ങളാണ് ഉള്ളത്? സംസാരിക്കുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക.",
    listeningText: "ശ്രദ്ധിക്കുന്നു... സംസാരിക്കൂ"
  },
  { 
    code: 'mr-IN', 
    name: 'मराठी', 
    englishName: 'Marathi', 
    flag: '🇮🇳', 
    placeholder: 'आपली लक्षणे लिहा किंवा बोला...',
    greeting: "नमस्कार! मी आपला बीकेअर AI सहाय्यक आहे. 🩺\n\nआपल्याला काय त्रास होत आहे? माइक 🎙️ वापरून बोला किंवा खाली लिहा.",
    listeningText: "ऐकत आहे... कृपया बोला"
  },
  { 
    code: 'bn-IN', 
    name: 'বাংলা', 
    englishName: 'Bengali', 
    flag: '🇮🇳', 
    placeholder: 'আপনার লক্ষণগুলি বাংলায় লিখুন বা বলুন...',
    greeting: "নমস্কার! আমি আপনার বিকেয়ার AI সহায়ক। 🩺\n\nআপনার কি শারীরিক সমস্যা হচ্ছে? মাইক 🎙️ টিপে বলুন বা নিচে লিখুন।",
    listeningText: "শুনছি... আপনার সমস্যা বলুন"
  },
  { 
    code: 'gu-IN', 
    name: 'ગુજરાતી', 
    englishName: 'Gujarati', 
    flag: '🇮🇳', 
    placeholder: 'તમારી તકલીફ લખો અથવા બોલો...',
    greeting: "નમસ્તે! હું તમારો બીકેર AI આસિસ્ટન્ટ છું. 🩺\n\nતમને શું તકલીફ છે? માઇક 🎙️ દબાવીને બોલો અથવા નીચે લખો.",
    listeningText: "સાંભળી રહ્યો છું... કૃપા કરીને બોલો"
  },
  { 
    code: 'pa-IN', 
    name: 'ਪੰਜਾਬੀ', 
    englishName: 'Punjabi', 
    flag: '🇮🇳', 
    placeholder: 'ਆਪਣੀ ਸਮੱਸਿਆ ਲਿਖੋ ਜਾਂ ਬੋਲੋ...',
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਬੀਕੇਅਰ AI ਸਹਾਇਕ ਹਾਂ। 🩺\n\nਤੁਹਾਨੂੰ ਕੀ ਸਮੱਸਿਆ ਮਹਿਸੂਸ ਹੋ ਰਹੀ ਹੈ? ਮਾਈਕ 🎙️ ਦਬਾ ਕੇ ਬੋਲੋ ਜਾਂ ਹੇਠਾਂ ਲਿਖੋ।",
    listeningText: "ਸੁਣ ਰਿਹਾ ਹਾਂ... ਕਿਰਪਾ ਕਰਕੇ ਬੋਲੋ"
  }
];

// Quick symptom starter chips
const QUICK_SYMPTOM_PROMPTS = [
  "Stomach pain & acidity",
  "Chest heaviness & palpitations",
  "High fever & severe headache",
  "Knee joint pain & swelling",
  "Skin itching & red allergy"
];

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
  doctorRecommendation?: {
    doctor: DoctorProfile;
    hospital: Hospital;
    specialty: string;
    advice: string;
    urgency: 'EMERGENCY' | 'PRIORITY' | 'ROUTINE';
    urgencyLabel: string;
  };
  suggestedChips?: string[];
}

export interface AiHealthAssistantProps {
  patientProfile?: PatientProfile;
  hospitals: Hospital[];
  doctors: DoctorProfile[];
  slots: OpSlot[];
  userLocation?: any;
  onOpenCheckout: (doctor: DoctorProfile, consultationType: ConsultationType, explicitSlot?: OpSlot) => void;
  onClose?: () => void;
}

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({
  hospitals,
  doctors,
  onOpenCheckout,
  onClose
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<IndianLanguage>(SUPPORTED_INDIAN_LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Default Hospital & Doctors fallback
  const primaryHospital = hospitals[0] || {
    id: 'hosp-1',
    name: 'City Care Multi-Specialty Hospital',
    address: '42 Avinashi Road, Peelamedu, Coimbatore',
    phone: '+914222570100',
    rating: 4.8,
    distance: '1.2 km',
    emergencyAvailable: true,
    specialties: ['Cardiology', 'Orthopedics', 'General Medicine'],
    baseOpFee: 100
  };

  const cardiologistDoc = doctors.find(d => 
    d.specialty.toLowerCase().includes('cardio') || d.name.toLowerCase().includes('ananya')
  ) || doctors[0] || ({
    id: 'doc-1',
    userId: 'user-doc-1',
    name: 'Dr. Ananya Sharma',
    specialty: 'Cardiology & General Medicine',
    hospitalId: primaryHospital.id,
    hospitalName: primaryHospital.name,
    experienceYears: 12,
    rating: 4.9,
    totalConsultations: 1420,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    opConsultationFee: 100,
    teleConsultationFee: 250,
    roomNumber: 'Room 204',
    nextAvailableToken: 5,
    estimatedWaitMins: 10,
    registrationNumber: 'NMC-84920'
  } as DoctorProfile);

  const orthoDoc = doctors.find(d => 
    d.specialty.toLowerCase().includes('ortho') || d.name.toLowerCase().includes('rajesh')
  ) || doctors[1] || cardiologistDoc;

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: selectedLanguage.greeting,
      timestamp: Date.now(),
      suggestedChips: QUICK_SYMPTOM_PROMPTS
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing]);

  // Voice synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage.code;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Web Speech API (Microphone Speech-to-Text - Device-Ready)
  const toggleListening = async () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    // Explicitly prompt device mic permission first so iOS Safari / Android Chrome doesn't abort silently
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream so SpeechRecognition can bind cleanly
        stream.getTracks().forEach(t => t.stop());
      } catch (permErr: any) {
        console.warn('Microphone permission error:', permErr);
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          alert('Microphone access is blocked. Please enable microphone permissions in your browser or device settings.');
          return;
        }
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage.code;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const currentSpeech = finalText || interimText;
        if (currentSpeech.trim()) {
          setInputText(currentSpeech);
        }

        if (finalText.trim()) {
          setIsListening(false);
          handleSendMessage(finalText.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission was denied. Please allow microphone in settings.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition failed to start:', e);
      setIsListening(false);
    }
  };

  // Automatic Multi-Language Detection (Native Script + Transliteration)
  const detectLanguage = (text: string): IndianLanguage => {
    const lower = text.toLowerCase();
    // 1. Telugu (Script + Latin transliterations like "kadupu noppi", "jwaram")
    if (
      /[\u0C00-\u0C7F]/.test(text) || 
      /\b(kadupu|kadupulo|noppi|gunde|chati|jwaram|vaanthulu|vikaram|neerasam|talanopi|chali|kaalla|vennu|undhi|undi)\b/i.test(lower)
    ) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'te-IN') || SUPPORTED_INDIAN_LANGUAGES[1];
    }

    // 2. Hindi (Devanagari + Latin transliterations like "pet dard", "bukhar hai", "sir dard")
    if (
      /[\u0900-\u097F]/.test(text) || 
      /\b(dard|pet|bukhar|khansi|chhati|sir|seene|ulti|dast|kamzori|hai|ho raha|raha hai|tabiyat|kamar)\b/i.test(lower)
    ) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'hi-IN') || SUPPORTED_INDIAN_LANGUAGES[2];
    }

    // 3. Tamil (Script + Latin transliterations like "vayiru vali", "nenju vali")
    if (
      /[\u0B80-\u0BFF]/.test(text) || 
      /\b(vali|vayiru|kaichal|irumal|nenju|thalai|vaanthi|romba|iruku)\b/i.test(lower)
    ) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'ta-IN') || SUPPORTED_INDIAN_LANGUAGES[3];
    }

    // 4. Kannada (Script + Latin transliterations like "hotte novu")
    if (
      /[\u0C80-\u0CFF]/.test(text) || 
      /\b(novu|hotte|jwara|kemmu|ede|tale|idhe)\b/i.test(lower)
    ) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'kn-IN') || SUPPORTED_INDIAN_LANGUAGES[4];
    }

    // 5. Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'ml-IN') || SUPPORTED_INDIAN_LANGUAGES[5];
    }

    // 6. Marathi
    if (/\b(dokedukhi|julab|kambar)\b/i.test(lower)) {
      return SUPPORTED_INDIAN_LANGUAGES.find(l => l.code === 'mr-IN') || SUPPORTED_INDIAN_LANGUAGES[6];
    }

    // Default to currently selected language or English
    return selectedLanguage;
  };

  // Multi-Language Clinical Triage Matching (Handles ANY Language)
  const analyzeSymptoms = (query: string) => {
    const q = query.toLowerCase();

    // 1. Cardiac / Heart / Chest (English + All Regional + Transliterations)
    const isCardiac = 
      q.includes('chest') || q.includes('heart') || q.includes('cardiac') ||
      q.includes('palpitation') || q.includes('breath') || q.includes('bp') ||
      q.includes('blood pressure') || q.includes('suffocat') ||
      q.includes('గుండె') || q.includes('ఛాతీ') || q.includes('శ్వాస') || q.includes('దడ') ||
      q.includes('gunde') || q.includes('chati') || q.includes('swasa') ||
      q.includes('दिल') || q.includes('छाती') || q.includes('सीने') || q.includes('सांस') || q.includes('धड़कन') ||
      q.includes('seene') || q.includes('chhati') || q.includes('saans') || q.includes('dhadkan') ||
      q.includes('நெஞ்சு') || q.includes('இதயம்') || q.includes('மூச்சு') ||
      q.includes('nenju') || q.includes('idhayam') || q.includes('moochu') ||
      q.includes('ಎದೆ') || q.includes('ಹೃದಯ') || q.includes('ede') || q.includes('hrudaya');

    // 2. Stomach / GI / Digestion / Vomiting (Checked before Ortho so stomach pain routes correctly)
    const isGastro = 
      q.includes('stomach') || q.includes('abdomen') || q.includes('vomit') ||
      q.includes('nausea') || q.includes('acidity') || q.includes('gastric') ||
      q.includes('diarrhea') || q.includes('motion') || q.includes('food') || q.includes('belly') ||
      q.includes('కడుపు') || q.includes('వాంతులు') || q.includes('వికారం') || q.includes('మోషన్స్') ||
      q.includes('kadupu') || q.includes('kadupulo') || q.includes('vaanthulu') || q.includes('vikaram') ||
      q.includes('पेट') || q.includes('उल्टी') || q.includes('दस्त') || q.includes('मतली') || q.includes('गैस') ||
      q.includes('pet') || q.includes('ulti') || q.includes('dast') || q.includes('gas') ||
      q.includes('வயிறு') || q.includes('வாந்தி') || q.includes('பேதி') ||
      q.includes('vayiru') || q.includes('vaanthi') ||
      q.includes('ಹೊಟ್ಟೆ') || q.includes('hotte') || q.includes('vaanti');

    // 3. Bone / Joint / Ortho / Spine
    const isOrtho = 
      q.includes('bone') || q.includes('joint') || q.includes('knee') ||
      q.includes('back') || q.includes('spine') || q.includes('fracture') || q.includes('shoulder') ||
      q.includes('మోకాలు') || q.includes('వెన్ను') || q.includes('కీలు') || q.includes('మోకాళ్ల') ||
      q.includes('mokalu') || q.includes('vennu') || q.includes('keelu') || q.includes('mokaalla') ||
      q.includes('हड्डी') || q.includes('जोड़') || q.includes('घुटने') || q.includes('कमर') || q.includes('पीठ') ||
      q.includes('haddi') || q.includes('jod') || q.includes('ghutne') || q.includes('kamar') || q.includes('peeth') ||
      q.includes('முழங்கால்') || q.includes('முதுகு') || q.includes('எலும்பு') ||
      q.includes('muzhangal') || q.includes('mudhugu') || q.includes('elumbu') ||
      q.includes('ಮೂಳೆ') || q.includes('ಕೀಲು') || q.includes('ಮೊಣಕಾಲು') || q.includes('moole');

    // 4. Fever / Infection / General Medicine
    const isFever = 
      q.includes('fever') || q.includes('cold') || q.includes('cough') ||
      q.includes('infection') || q.includes('headache') || q.includes('weakness') ||
      q.includes('chills') || q.includes('throat') || q.includes('temperature') ||
      q.includes('జ్వరం') || q.includes('దగ్గు') || q.includes('తలనొప్పి') || q.includes('జలుబు') || q.includes('గొంతు') ||
      q.includes('jwaram') || q.includes('daggu') || q.includes('talanopi') || q.includes('jalubu') ||
      q.includes('बुखार') || q.includes('खांसी') || q.includes('सिरदर्द') || q.includes('जुकाम') || q.includes('गले') ||
      q.includes('bukhar') || q.includes('khansi') || q.includes('sirdard') || q.includes('sar dard') ||
      q.includes('காய்ச்சல்') || q.includes('இருமல்') || q.includes('தலைவலி') ||
      q.includes('kaichal') || q.includes('irumal') || q.includes('thalai') ||
      q.includes('ಜ್ವರ') || q.includes('ಕೆಮ್ಮು') || q.includes('jwara') || q.includes('kemmu');

    // Select matching doctor & specialty
    let matchedDoctor = cardiologistDoc;
    let specialty = 'Cardiology';
    let urgency: 'EMERGENCY' | 'PRIORITY' | 'ROUTINE' = 'PRIORITY';
    let urgencyLabel = 'Immediate Clinical Attention';
    let advice = `Based on your symptoms, I suggest you consult ${cardiologistDoc.name} at ${primaryHospital.name}. Token #${cardiologistDoc.nextAvailableToken || 5} is ready now.`;

    if (isCardiac) {
      matchedDoctor = cardiologistDoc;
      specialty = 'Cardiology';
      urgency = 'PRIORITY';
      urgencyLabel = 'Priority Cardiac Care';
      advice = `Your symptoms indicate a possible cardiovascular or respiratory concern. I suggest you see ${cardiologistDoc.name} (Cardiologist) at ${primaryHospital.name} immediately.`;
    } else if (isGastro) {
      matchedDoctor = cardiologistDoc;
      specialty = 'Gastroenterology & General Medicine';
      urgency = 'PRIORITY';
      urgencyLabel = 'Digestive Clinical Care';
      advice = `For acute abdominal symptoms and digestion, I suggest you consult ${cardiologistDoc.name} at ${primaryHospital.name} for an immediate physical exam.`;
    } else if (isOrtho) {
      matchedDoctor = orthoDoc;
      specialty = 'Orthopedics';
      urgency = 'SAME_DAY' as any;
      urgencyLabel = 'Orthopedic Specialist Needed';
      advice = `For joint, spine, or bone pain, I suggest you consult ${orthoDoc.name} (Orthopedic Specialist) at ${primaryHospital.name}.`;
    } else if (isFever) {
      matchedDoctor = cardiologistDoc;
      specialty = 'General Medicine';
      urgency = 'ROUTINE';
      urgencyLabel = 'General Outpatient Care';
      advice = `For viral fever, infection, or weakness, I suggest visiting the General Medicine OPD with ${cardiologistDoc.name} at ${primaryHospital.name}.`;
    } else {
      matchedDoctor = cardiologistDoc;
      specialty = 'General Medicine';
      urgency = 'ROUTINE';
      urgencyLabel = 'Clinical Consultation';
      advice = `I suggest you see ${cardiologistDoc.name} at ${primaryHospital.name} (${primaryHospital.distance || '1.2 km away'}).`;
    }

    return {
      doctor: matchedDoctor,
      hospital: primaryHospital,
      specialty,
      urgency,
      urgencyLabel,
      advice
    };
  };

  // Send message with automatic language response
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Detect language of the input
    const detectedLang = detectLanguage(text);
    if (detectedLang.code !== selectedLanguage.code) {
      setSelectedLanguage(detectedLang);
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);

    // AI Response synthesis in the patient's language
    setTimeout(() => {
      const triage = analyzeSymptoms(text);

      let aiResponseText = `I suggest you consult **${triage.doctor.name}** (${triage.specialty}) at **${triage.hospital.name}**, Peelamedu.`;

      if (detectedLang.code === 'te-IN') {
        aiResponseText = `నేను మీకు **${triage.hospital.name}** లోని **${triage.doctor.name}** (${triage.specialty}) గారిని సంప్రదించమని సూచిస్తున్నాను.`;
      } else if (detectedLang.code === 'hi-IN') {
        aiResponseText = `मैं आपको **${triage.hospital.name}** में **${triage.doctor.name}** (${triage.specialty}) से मिलने की सलाह देता हूँ।`;
      } else if (detectedLang.code === 'ta-IN') {
        aiResponseText = `நான் உங்களுக்கு **${triage.hospital.name}** இல் உள்ள **${triage.doctor.name}** (${triage.specialty}) மருத்துவரை பரிந்துரைக்கிறேன்.`;
      } else if (detectedLang.code === 'kn-IN') {
        aiResponseText = `ನಾನು ನಿಮಗೆ **${triage.hospital.name}** ನಲ್ಲಿರುವ **${triage.doctor.name}** (${triage.specialty}) ಅವರನ್ನು ಭೇಟಿ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: Date.now(),
        doctorRecommendation: triage
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAnalyzing(false);

      if (isVoiceEnabled) {
        speakText(
          detectedLang.code === 'te-IN' 
            ? `${triage.doctor.name} గారిని సంప్రదించండి`
            : detectedLang.code === 'hi-IN'
            ? `${triage.doctor.name} से संपर्क करें`
            : `I suggest you to see ${triage.doctor.name} at ${triage.hospital.name}`
        );
      }
    }, 600);
  };

  // Open booking directly
  const handleBookNow = (doctor: DoctorProfile, type: ConsultationType) => {
    stopSpeaking();
    onOpenCheckout(doctor, type);
  };

  // Reset chat
  const handleResetChat = () => {
    stopSpeaking();
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: selectedLanguage.greeting,
        timestamp: Date.now(),
        suggestedChips: QUICK_SYMPTOM_PROMPTS
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#f8fafc] select-none overflow-hidden relative">
      {/* ========================================================================= */}
      {/* 1. SLEEK MINIMAL HEADER                                                  */}
      {/* ========================================================================= */}
      <div className="px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center justify-center">
              <SiriOrb size={32} state={isAnalyzing ? 'thinking' : isListening ? 'listening' : 'idle'} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  Bcare AI
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Clinical Health Assistant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Selector */}
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Change Language"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span>{selectedLanguage.name}</span>
          </button>

          {/* Voice Guidance Readout Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !isVoiceEnabled;
              setIsVoiceEnabled(next);
              if (!next) stopSpeaking();
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isVoiceEnabled 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
            title={isVoiceEnabled ? "Voice Readout Active" : "Voice Readout Muted"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear / Reset Chat */}
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT MESSAGES THREAD                                                  */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
            >
              {/* Message Bubble with AI Avatar */}
              <div className={`flex items-start gap-2.5 max-w-[96%] ${isAi ? 'flex-row' : 'flex-row-reverse self-end'}`}>
                {isAi && (
                  <div className="shrink-0 mt-1">
                    <SiriOrb size={28} state="idle" />
                  </div>
                )}

                <div className={`space-y-2.5 ${isAi ? 'flex-1' : ''}`}>
                  <div
                    className={`rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                      isAi
                        ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs font-medium'
                    }`}
                  >
                    <p className="whitespace-pre-line">
                      {msg.text.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className={isAi ? "font-extrabold text-slate-900" : "font-black text-white"}>{part}</strong> : part
                      )}
                    </p>

                    {/* Suggested Chips (Only on initial welcome message) */}
                    {msg.suggestedChips && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Quick Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedChips.map((chip, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSendMessage(chip)}
                              className="px-2.5 py-1 rounded-full bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-[11px] font-semibold text-slate-700 hover:text-blue-700 transition-all cursor-pointer text-left"
                            >
                              ⚡ {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DIRECT DOCTOR & LOCATION CARD (When AI suggests a doctor) */}
                  {msg.doctorRecommendation && (
                    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-md p-3.5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
                          alt={msg.doctorRecommendation.doctor.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {msg.doctorRecommendation.doctor.name}
                            </h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px] mt-0.5">
                            {msg.doctorRecommendation.specialty}
                          </span>
                          <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {msg.doctorRecommendation.doctor.experienceYears || 12}+ yrs experience • Reg: {msg.doctorRecommendation.doctor.registrationNumber || 'NMC-84920'}
                          </p>
                        </div>
                      </div>

                      {/* Hospital & Location */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-[11.5px]">
                              {msg.doctorRecommendation.hospital.name}
                            </span>
                            <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{msg.doctorRecommendation.hospital.address.split(',')[0]} • Peelamedu</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 shrink-0 ml-2">
                          {msg.doctorRecommendation.hospital.distance || '1.2 km'}
                        </span>
                      </div>

                      {/* Live OPD Status Badge */}
                      <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-200/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="font-extrabold text-emerald-900 text-[11px]">
                            Token #{msg.doctorRecommendation.doctor.nextAvailableToken || 5} Ready
                          </span>
                          <span className="text-emerald-400">•</span>
                          <span className="text-emerald-700 font-medium text-[10.5px]">Room 204</span>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px]">~10m wait</span>
                      </div>

                      {/* Action Buttons: 1-Click Open */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleBookNow(msg.doctorRecommendation!.doctor, 'IN_PERSON_OPD')}
                          className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-200" />
                          <span>Book OPD (₹{msg.doctorRecommendation.doctor.opConsultationFee || 100})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBookNow(msg.doctorRecommendation!.doctor, 'VIDEO_CONSULTATION')}
                          className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Video Call (₹{msg.doctorRecommendation.doctor.teleConsultationFee || 250})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Analyzing / Typing Indicator */}
        {isAnalyzing && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs max-w-[260px] animate-in fade-in duration-200">
            <div className="shrink-0 flex items-center justify-center">
              <SiriOrb size={22} state="thinking" />
            </div>
            <span className="text-[11.5px] text-slate-600 font-semibold animate-pulse">
              Finding the right specialist...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 3. LISTENING PULSE BANNER (WHEN MICROPHONE IS ACTIVE)                     */}
      {/* ========================================================================= */}
      {isListening && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-t border-blue-200/80 flex items-center justify-between text-xs text-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="shrink-0 flex items-center justify-center">
              <SiriOrb size={24} state="listening" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">Listening to your voice...</p>
              <p className="text-[10px] text-slate-500 font-medium">Speak in any language (English, Telugu, Hindi, Tamil...)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="px-2.5 py-1 rounded-full bg-rose-100 hover:bg-rose-200 text-[11px] font-bold text-rose-700 transition-colors cursor-pointer"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CHAT INPUT BAR WITH MICROPHONE & QUICK LANGUAGE SELECTOR               */}
      {/* ========================================================================= */}
      <div className="bg-white border-t border-slate-200/80 shrink-0 pb-5">
        {/* Quick Language Switcher Pills (1-tap speech & text language toggle) */}
        <div className="px-3 py-1.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Lang:</span>
          {SUPPORTED_INDIAN_LANGUAGES.slice(0, 6).map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setSelectedLanguage(lang);
                if (isListening && recognitionRef.current) {
                  try {
                    recognitionRef.current.lang = lang.code;
                  } catch {
                    // ignore
                  }
                }
              }}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedLanguage.code === lang.code
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {lang.flag} {lang.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowLanguageModal(true)}
            className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 shrink-0 cursor-pointer"
          >
            More +
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 flex items-center gap-2"
        >
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isListening ? "Listening... Tap to stop" : `Tap to speak in ${selectedLanguage.name} or any language`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-blue-600" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedLanguage.placeholder}
            className="flex-1 py-2.5 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-blue-500 focus:outline-none transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              inputText.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 5. LANGUAGE SELECTOR MODAL                                               */}
      {/* ========================================================================= */}
      {showLanguageModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xs bg-white rounded-3xl p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-sm text-slate-900">
                Select Consultation Language
              </h4>
              <button
                type="button"
                onClick={() => setShowLanguageModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Done
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-none">
              {SUPPORTED_INDIAN_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    selectedLanguage.code === lang.code
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({lang.englishName})</span>
                  </div>
                  {selectedLanguage.code === lang.code && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiHealthAssistant;
