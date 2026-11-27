import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, Send, Image as ImageIcon, 
  X, SwitchCamera, CheckCircle2, ShieldCheck, Volume2, Sparkles, FileText,
  Subtitles, Globe, User, PhoneCall, Loader2, RefreshCw
} from 'lucide-react';
import { PhoneModalPortal } from './PhoneModalPortal';

// ============================================================================
// INDIAN REGIONAL CAPTION LANGUAGES
// ============================================================================
export interface CaptionLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const CAPTION_LANGUAGES: CaptionLanguage[] = [
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

// Contextual Doctor Dialogues with Clinical Translations
const CLINICAL_STATEMENTS = [
  {
    en: "Vanakkam! I am Dr. Ananya Sharma. I have your vitals on screen. How are you feeling right now?",
    te: "నమస్కారం! నేను డాక్టర్ అనన్య శర్మను. మీ ఆరోగ్య వివరాలు నా స్క్రీన్‌పై ఉన్నాయి. ఇప్పుడు మీకు ఎలా ఉంది?",
    hi: "नमस्ते! मैं डॉ. अनन्या शर्मा हूँ। आपके वाइटल्स मेरी स्क्रीन पर हैं। आप अभी कैसा महसूस कर रहे हैं?",
    ta: "வணக்கம்! நான் டாக்டர் அனன்யா சர்மா. உங்கள் உடல்நிலை விவரங்களை பார்க்கிறேன். இப்போது எப்படி உணர்கிறீர்கள்?",
    kn: "ನಮಸ್ಕಾರ! ನಾನು ಡಾ. ಅನನ್ಯ ಶರ್ಮಾ. ನಿಮ್ಮ ವೈಟಲ್ಸ್ ನನ್ನ ಪರದೆಯ ಮೇಲಿವೆ. ಈಗ ನಿಮಗೆ ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ?",
    ml: "നമസ്കാരം! ഞാൻ ഡോ. അനന്യ ശർമ്മയാണ്. നിങ്ങളുടെ വിവരങ്ങൾ ഞാൻ കാണുന്നുണ്ട്. ഇപ്പോൾ എങ്ങനെ തോന്നുന്നു?",
    mr: "नमस्कार! मी डॉ. अनन्या शर्मा. तुमचे व्हायटल्स स्क्रीनवर दिसत आहेत. तुम्हाला आता कसे वाटत आहे?",
    bn: "নমস্কার! আমি ডঃ অনন্যা শর্মা। আপনার ভাইটালস আমার স্ক্রিনে আছে। এখন কেমন বোধ করছেন?"
  },
  {
    en: "I am reviewing your heart rate and blood pressure. Everything looks steady at 120/80 mmHg.",
    te: "నేను మీ గుండె వేగం మరియు రక్తపోటును పరిశీలిస్తున్నాను. 120/80 వద్ద అంతా నిలకడగా ఉంది.",
    hi: "मैं आपकी हृदय गति और रक्तचाप देख रही हूँ। 120/80 पर सब कुछ स्थिर और सामान्य है।",
    ta: "உங்கள் இதய துடிப்பு மற்றும் இரத்த அழுத்தத்தை சரிபார்க்கிறேன். 120/80 என்ற அளவில் சீராக உள்ளது.",
    kn: "ನಾನು ನಿಮ್ಮ ಹೃದಯ ಬಡಿತ ಮತ್ತು ರಕ್ತದೊತ್ತಡವನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇನೆ. 120/80 ರಲ್ಲಿ ಎಲ್ಲವೂ ಸ್ಥಿರವಾಗಿದೆ.",
    ml: "ഞാൻ നിങ്ങളുടെ ഹൃദയമിടിപ്പും രക്തസമ്മർദ്ദവും പരിശോധിക്കുകയാണ്. 120/80 ൽ എല്ലാം സാധാരണമാണ്.",
    mr: "मी तुमचे हृदयाचे ठोके आणि रक्तदाब तपासत आहे. 120/80 वर सर्व स्थिर आहे.",
    bn: "আমি আপনার হার্ট রেট এবং রক্তচাপ পর্যালোচনা করছি। 120/80 এ সবকিছু স্বাভাবিক আছে।"
  },
  {
    en: "Can you describe the pain? Is it a burning sensation, or does it feel like heaviness?",
    te: "నొప్పి ఎలాంటిదో వివరించగలరా? మంటగా ఉందా లేక బరువుగా అనిపిస్తోందా?",
    hi: "क्या आप दर्द के बारे में बता सकते हैं? क्या जलन हो रही है या भारीपन महसूस हो रहा है?",
    ta: "வலியை பற்றி கூற முடியுமா? எரிச்சல் போல் உள்ளதா அல்லது பாரமாக உள்ளதா?",
    kn: "ನೋವಿನ ಬಗ್ಗೆ ವಿವರಿಸಬಹುದೇ? ಉರಿಯುವಂತಿದೆಯೇ ಅಥವಾ ಭಾರವಾಗಿ ಅನಿಸುತ್ತಿದೆಯೇ?",
    ml: "വേദനയെക്കുറിച്ച് പറയാമോ? എരിച്ചിലാണോ അതോ ഭാരം തോന്നുന്നുണ്ടോ?",
    mr: "तुम्ही वेदना सांगू शकता का? जळजळ होत आहे की जडपणा जाणवत आहे?",
    bn: "ব্যথাটা কেমন লাগছে বলবেন কি? জ্বালাপোড়া নাকি ভারী ভারী লাগছে?"
  },
  {
    en: "Understood. I am adding an antispasmodic and a protective antacid to your digital prescription.",
    te: "అర్థమైంది. నేను మీ డిజిటల్ ప్రిస్క్రిప్షన్‌లో ఎసిడిటీ మరియు నొప్పి నివారణ మందులను రాస్తున్నాను.",
    hi: "समझ गई। मैं आपके डिजिटल पर्चे में पेट दर्द निवारक और एंटासिड दवाएं लिख रही हूँ।",
    ta: "புரிந்தது. உங்கள் டிஜிட்டல் மருந்துச்சீட்டில் வலி நிவாரணி மற்றும் அமிலத்தன்மை மருந்துகளை சேர்க்கிறேன்.",
    kn: "ಅರ್ಥವಾಯಿತು. ನಿಮ್ಮ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ನಲ್ಲಿ ನಾನು ಅಗತ್ಯ ನೋವು ನಿವಾರಕ ಮತ್ತು ಆಸಿಡಿಟಿ ಔಷಧಿಯನ್ನು ಬರೆಯುತ್ತಿದ್ದೇನೆ.",
    ml: "മനസ്സിലായി. നിങ്ങളുടെ ഡിജിറ്റൽ കുറിപ്പടിയിൽ വേദന സംഹാരിയും അസിഡിറ്റി മരുന്നുകളും ചേർക്കുന്നു.",
    mr: "समजले. मी तुमच्या डिजिटल प्रिस्क्रिप्शनमध्ये वेदनाशामक आणि अँटासिड औषधे लिहीत आहे.",
    bn: "বুঝেছি। আমি আপনার ডিজিটাল প্রেসক্রিপশনে ব্যথানাশক এবং অ্যান্টাসিড ওষুধ যোগ করছি।"
  },
  {
    en: "Take these medications after food for 5 days. Drink warm water and follow up if needed.",
    te: "ఈ మందులను 5 రోజుల పాటు భోజనం తర్వాత తీసుకోండి. గోరువెచ్చని నీరు త్రాగండి, అవసరమైతే మళ్ళీ కలవండి.",
    hi: "यह दवाएं 5 दिनों तक भोजन के बाद लें। खूब गर्म पानी पिएं और जरूरत पड़ने पर दोबारा दिखाएं।",
    ta: "இந்த மருந்துகளை 5 நாட்களுக்கு உணவுக்குப் பின் எடுத்துக் கொள்ளுங்கள். வெதுவெதுப்பான நீர் அருந்தவும்.",
    kn: "ಈ ಔಷಧಿಗಳನ್ನು 5 ದಿನಗಳ ಕಾಲ ಊಟದ ನಂತರ ತೆಗೆದುಕೊಳ್ಳಿ. ಬಿಸಿ ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಅಗತ್ಯವಿದ್ದರೆ ಭೇಟಿ ನೀಡಿ.",
    ml: "ഈ മരുന്നുകൾ 5 ദിവസം ഭക്ഷണത്തിനു ശേഷം കഴിക്കുക. ചൂടുവെള്ളം കുടിക്കുകയും ആവശ്യമെങ്കിൽ ബന്ധപ്പെടുകയും ചെയ്യുക.",
    mr: "ही औषधे ५ दिवस जेवणानंतर घ्या. कोमट पाणी प्या आणि आवश्यक असल्यास पुन्हा भेटा.",
    bn: "এই ওষুধগুলি ৫ দিন খাবারের পরে খাবেন। উষ্ণ জল পান করবেন এবং প্রয়োজনে আবার যোগাযোগ করবেন।"
  }
];

interface TeleconsultRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  doctorName: string;
  specialty: string;
  currentRole?: 'PATIENT' | 'DOCTOR';
  patientLanguages?: string[];
  onPrescriptionGenerated?: (rx: any) => void;
}

export const TeleconsultRoomModal: React.FC<TeleconsultRoomModalProps> = ({
  isOpen,
  onClose,
  patientName,
  doctorName,
  specialty,
  currentRole = 'PATIENT',
  patientLanguages = ['English', 'Telugu'],
  onPrescriptionGenerated
}) => {
  // Call Lifecycle States
  const [callState, setCallState] = useState<'CONNECTING' | 'WAITING' | 'CONNECTED' | 'ENDED'>('CONNECTING');
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [callDuration, setCallDuration] = useState(0);

  // Live Auto-Translated Captions State
  const [showCaptions, setShowCaptions] = useState(true);
  const [selectedCaptionLang, setSelectedCaptionLang] = useState<CaptionLanguage>(CAPTION_LANGUAGES[0]); // Default Telugu
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeCaption, setActiveCaption] = useState<{
    speaker: string;
    role: 'DOCTOR' | 'PATIENT';
    originalText: string;
    translatedText: string;
    timestamp: number;
  }>({
    speaker: doctorName,
    role: 'DOCTOR',
    originalText: CLINICAL_STATEMENTS[0].en,
    translatedText: CLINICAL_STATEMENTS[0].te,
    timestamp: Date.now()
  });

  const [statementIndex, setStatementIndex] = useState(0);
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);

  // Media Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // In-Call Clinical Chat Messages
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string; image?: string }[]>([
    {
      sender: 'Doctor',
      text: `Vanakkam ${patientName}! I am ${doctorName}. I have your symptoms and vitals on screen. How are you feeling right now?`,
      time: 'Just now'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Web Audio Harmonic Sound Generator
  const playSoundChime = (type: 'connected' | 'ringing' | 'ended') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'connected') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime + 0.12);
        osc1.stop(ctx.currentTime + 0.3);
        osc2.stop(ctx.currentTime + 0.6);
      } else if (type === 'ringing') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  // 1. Connection & Waiting Lifecycle
  useEffect(() => {
    if (!isOpen) return;

    // Reset to CONNECTING
    setCallState('CONNECTING');
    setCallDuration(0);

    const connectTimer = setTimeout(() => {
      setCallState('WAITING');
      playSoundChime('ringing');
    }, 1200);

    // Cross-tab room signaling via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('bcare_teleconsult_room');
      
      // Announce presence
      bc.postMessage({
        type: 'PEER_ENTERED',
        role: currentRole,
        name: currentRole === 'DOCTOR' ? doctorName : patientName
      });

      bc.onmessage = (e) => {
        if (e.data?.type === 'PEER_ENTERED' || e.data?.type === 'CALL_ACCEPTED') {
          // Both peers are in the room -> Connect immediately!
          setCallState('CONNECTED');
          playSoundChime('connected');
        } else if (e.data?.type === 'CHAT_MSG' && e.data.msg) {
          setMessages(prev => [...prev, e.data.msg]);
        }
      };
    } catch {}

    // In single-tab preview, automatically simulate doctor answering after 5 seconds
    const autoAnswerTimer = setTimeout(() => {
      setCallState((current) => {
        if (current === 'WAITING' || current === 'CONNECTING') {
          playSoundChime('connected');
          return 'CONNECTED';
        }
        return current;
      });
    }, 5500);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(autoAnswerTimer);
      if (bc) bc.close();
    };
  }, [isOpen, currentRole, doctorName, patientName]);

  // 2. Initialize Real Camera & Microphone
  useEffect(() => {
    if (!isOpen || callState === 'ENDED') return;

    let isMounted = true;

    async function startMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera not supported');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: true
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }
        setCameraError(null);

        // Web Audio Volume Analyzer for mic indicator
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch {}
      } catch (err: any) {
        console.warn('Real camera not available or permission denied:', err);
        if (isMounted) {
          setCameraError(err.message || 'Camera permission denied');
        }
      }
    }

    startMedia();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isOpen, cameraFacing, callState]);

  // 3. Call Duration Timer (Ticks when CONNECTED)
  useEffect(() => {
    if (callState !== 'CONNECTED') return;

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // 4. Live Speech Recognition & Continuous Captioning
  useEffect(() => {
    if (callState !== 'CONNECTED' || !micActive) {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedCaptionLang.code === 'te' ? 'te-IN' : selectedCaptionLang.code === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          // Display live speech as captions
          setActiveCaption({
            speaker: currentRole === 'DOCTOR' ? doctorName : patientName,
            role: currentRole === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
            originalText: transcript,
            translatedText: transcript, // Real spoken text
            timestamp: Date.now()
          });
        }
      };

      recognition.onerror = () => {};
      speechRecognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {}
    } catch {}

    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, [callState, micActive, selectedCaptionLang, currentRole, doctorName, patientName]);

  // 5. Contextual Doctor Speech Dialogue Simulation with Multi-Language Captions
  useEffect(() => {
    if (callState !== 'CONNECTED') return;

    const interval = setInterval(() => {
      setStatementIndex(prev => {
        const nextIdx = (prev + 1) % CLINICAL_STATEMENTS.length;
        const stmt = CLINICAL_STATEMENTS[nextIdx];
        const langKey = selectedCaptionLang.code as keyof typeof stmt;
        const translated = (stmt[langKey] as string) || stmt.en;

        setDoctorSpeaking(true);
        setActiveCaption({
          speaker: doctorName,
          role: 'DOCTOR',
          originalText: stmt.en,
          translatedText: translated,
          timestamp: Date.now()
        });

        setTimeout(() => setDoctorSpeaking(false), 4500);
        return nextIdx;
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [callState, selectedCaptionLang, doctorName]);

  // Update active caption translated text when language switch is tapped
  const handleSelectLanguage = (lang: CaptionLanguage) => {
    setSelectedCaptionLang(lang);
    setShowLangMenu(false);

    // Re-translate current active caption
    const stmt = CLINICAL_STATEMENTS[statementIndex];
    const langKey = lang.code as keyof typeof stmt;
    const translated = (stmt[langKey] as string) || stmt.en;

    setActiveCaption(prev => ({
      ...prev,
      translatedText: translated
    }));
  };

  // Mute / Unmute Mic
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  // Video On / Off
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !videoActive;
      });
    }
    setVideoActive(!videoActive);
  };

  // Switch Camera Front / Back
  const switchCameraFacing = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setCameraFacing(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Send In-Call Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() && !selectedImage) return;

    const senderRole = currentRole === 'DOCTOR' ? 'Doctor' : 'Patient';
    const newM = {
      sender: senderRole,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined
    };
    setMessages(prev => [...prev, newM]);

    try {
      const bc = new BroadcastChannel('bcare_teleconsult_room');
      bc.postMessage({ type: 'CHAT_MSG', msg: newM });
      setTimeout(() => bc.close(), 400);
    } catch {}

    setInputMsg('');
    setSelectedImage(null);
  };

  const handleEndCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setCallState('ENDED');
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <PhoneModalPortal>
      <div className="absolute inset-0 z-50 flex flex-col justify-end sm:justify-center bg-slate-950/90 backdrop-blur-md pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="bg-slate-950 rounded-t-[32px] sm:rounded-[32px] w-full h-[95%] sm:h-[92%] border border-white/15 shadow-2xl overflow-hidden flex flex-col relative text-white"
        >
          {/* Top Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${callState === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-white">Live Teleconsultation</span>
                  {callState === 'CONNECTED' ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded-full tabular-nums whitespace-nowrap shrink-0">
                      {formatDuration(callDuration)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-500/30 px-1.5 py-0.2 rounded-full whitespace-nowrap shrink-0">
                      {callState === 'CONNECTING' ? 'Connecting...' : 'Waiting for Peer...'}
                    </span>
                  )}
                  <span className="text-[10px] text-blue-300 bg-blue-950/80 border border-blue-500/40 px-2 py-0.2 rounded-full font-medium whitespace-nowrap shrink-0">
                    CC Subtitles: {selectedCaptionLang.flag} {selectedCaptionLang.nativeName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {doctorName} ({specialty}) ↔ {patientName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentRole === 'DOCTOR' && callState === 'CONNECTED' && (
                <button
                  type="button"
                  onClick={() => {
                    const rx = {
                      id: `rx-${Date.now()}`,
                      patientName,
                      doctorName,
                      diagnosis: 'Acute Symptomatic Care (I20.9)',
                      medicines: [
                        { id: 'med-1', name: 'Telmisartan 40mg', dosage: '40mg', frequency: '1-0-0', duration: '14 Days' },
                        { id: 'med-2', name: 'Atorvastatin 20mg', dosage: '20mg', frequency: '0-0-1', duration: '14 Days' }
                      ],
                      issuedAt: new Date().toISOString()
                    };
                    if (onPrescriptionGenerated) onPrescriptionGenerated(rx);
                    setMessages(prev => [
                      ...prev,
                      {
                        sender: 'Doctor',
                        text: `📋 Digital Prescription Signed & Dispatched for ${patientName}. Saved to records and sent via WhatsApp.`,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                  title="Issue Digital Prescription Now"
                >
                  <FileText className="w-3 h-3" />
                  <span>Issue Rx</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN ROOM BODY */}
          {callState === 'CONNECTING' ? (
            /* 1. INITIAL CONNECTING HANDSHAKE */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40 animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Securing ABDM Telehealth Room</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Generating end-to-end encrypted medical peer connection for {patientName}...
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-[11px] text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Room ID: #BC-VID-{Date.now().toString().slice(-4)}</span>
              </div>
            </div>
          ) : callState === 'WAITING' ? (
            /* 2. REALISTIC WAITING ROOM ("WAITING FOR THE OTHER PERSON") */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-radial from-slate-900 to-slate-950">
              {/* Doctor Avatar with Pulsing Calling Waves */}
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2.5s' }} />
                <div className="absolute -inset-3 rounded-full bg-blue-500/10 animate-pulse" />
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
                  alt={doctorName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-2xl relative z-10"
                />
                <div className="absolute bottom-0 right-0 z-20 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-white">
                  <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>

              <div className="space-y-1.5 max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Waiting for Doctor to Join</span>
                </div>
                <h3 className="text-lg font-black text-white">{doctorName}</h3>
                <p className="text-xs text-slate-300 font-medium">
                  {specialty} • City Care Multi-Specialty Hospital
                </p>
                <p className="text-[11.5px] text-slate-400 leading-relaxed pt-2">
                  📲 Notification dispatched to Doctor's mobile. Dr. Ananya Sharma is completing consultation with previous token and connecting in ~5 seconds...
                </p>
              </div>

              {/* Self Video & Mic Hardware Check While Waiting */}
              <div className="mt-6 w-full max-w-xs bg-slate-900/90 rounded-2xl p-3 border border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-1 border-b border-slate-800">
                  <span>Hardware & Preview Check</span>
                  <span className="text-[10px] text-emerald-400">Camera & Mic Live</span>
                </div>

                <div className="relative h-28 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                  {videoActive && !cameraError ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <VideoOff className="w-6 h-6 mb-1" />
                      <span>Camera Preview Off</span>
                    </div>
                  )}

                  {/* Mic Level Visualizer */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
                    <span className="text-slate-300">Speak to test mic:</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, (micVolume / 100) * 14)}px` }} />
                      <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, (micVolume / 100) * 18)}px` }} />
                      <span className="w-1 bg-emerald-400 rounded-full transition-all" style={{ height: `${Math.max(4, (micVolume / 100) * 12)}px` }} />
                    </div>
                  </div>
                </div>

                {/* Quick Toggle Controls */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      micActive ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{micActive ? 'Mic On' : 'Mic Muted'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      videoActive ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {videoActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                    <span>{videoActive ? 'Video On' : 'Video Off'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    title="Switch Front/Back Camera"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instant Connect Shortcut */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    playSoundChime('connected');
                    setCallState('CONNECTED');
                  }}
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Admit Doctor & Start Call Now</span>
                </button>
              </div>
            </div>
          ) : callState === 'CONNECTED' ? (
            /* 3. ACTIVE CONNECTED VIDEO CONSULTATION */
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-0 relative">
              {/* Doctor Main Video Stream Screen */}
              <div className="lg:col-span-2 relative bg-black flex items-center justify-center overflow-hidden">
                <div className="w-full h-full relative flex items-center justify-center">
                  <img
                    src={currentRole === 'DOCTOR' 
                      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000"
                      : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1000"
                    }
                    alt={currentRole === 'DOCTOR' ? 'Patient Stream' : 'Doctor Stream'}
                    className="w-full h-full object-cover filter brightness-95"
                  />

                  {/* Doctor Info Floating Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs">
                    <span className={`w-2.5 h-2.5 rounded-full ${doctorSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                    <span className="font-extrabold text-white">
                      {currentRole === 'DOCTOR' ? patientName : doctorName}
                    </span>
                    <span className="text-[10.5px] text-slate-300">
                      • {currentRole === 'DOCTOR' ? 'Patient' : specialty}
                    </span>
                  </div>

                  {/* ========================================================================= */}
                  {/* AUTO-TRANSLATED LIVE CAPTIONS DOCKED DOWN BELOW ON VIDEO CALL            */}
                  {/* ========================================================================= */}
                  {showCaptions && activeCaption && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-16 inset-x-3 sm:inset-x-6 z-30 pointer-events-auto"
                    >
                      <div className="bg-slate-950/90 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col gap-1 text-left">
                        {/* Speaker tag & Live translation language selector pill */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-400 truncate">
                              {activeCaption.speaker} {activeCaption.role === 'DOCTOR' ? '(Speaking)' : '(You)'}
                            </span>
                          </div>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => setShowLangMenu(!showLangMenu)}
                              className="px-2 py-0.5 rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-[10px] font-bold text-blue-200 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Change Caption Subtitle Language"
                            >
                              <Globe className="w-3 h-3 text-cyan-300" />
                              <span>CC: {selectedCaptionLang.flag} {selectedCaptionLang.nativeName}</span>
                            </button>

                            {/* Dropdown Menu for Caption Languages */}
                            {showLangMenu && (
                              <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 max-h-56 overflow-y-auto">
                                <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase text-slate-400 border-b border-slate-800">
                                  Translate Captions To:
                                </div>
                                {CAPTION_LANGUAGES.map((l) => (
                                  <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => handleSelectLanguage(l)}
                                    className={`w-full px-2.5 py-1.5 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                      selectedCaptionLang.code === l.code ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                                    }`}
                                  >
                                    <span>{l.flag} {l.nativeName}</span>
                                    <span className="text-[10px] opacity-75">{l.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Large, high-contrast translated subtitles */}
                        <p className="text-xs sm:text-sm font-bold text-amber-300 leading-snug drop-shadow-sm">
                          "{activeCaption.translatedText}"
                        </p>

                        {/* Original audio transcription */}
                        {selectedCaptionLang.code !== 'en' && activeCaption.originalText !== activeCaption.translatedText && (
                          <p className="text-[10.5px] text-slate-400 italic">
                            Original: "{activeCaption.originalText}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Local Self-View (Picture-in-Picture - Clean Top-Right Position) */}
                  <div className="absolute top-14 right-3 w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-emerald-400/90 shadow-2xl bg-slate-900 group z-20">
                    {videoActive && !cameraError ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-1.5 text-center">
                        <VideoOff className="w-5 h-5 mb-1 text-slate-500" />
                        <span className="text-[9px] font-medium leading-tight">
                          {cameraError ? 'Camera in use' : 'Camera off'}
                        </span>
                      </div>
                    )}

                    {/* Local Label & Real-time Mic Level */}
                    <div className="absolute bottom-1 inset-x-1 flex items-center justify-between bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[8.5px]">
                      <span className="font-bold text-white truncate">
                        {currentRole === 'DOCTOR' ? 'You (Dr)' : 'You'}
                      </span>
                      {micActive && (
                        <div className="flex items-center gap-0.5">
                          <span
                            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(3, (micVolume / 100) * 10)}px` }}
                          />
                          <span
                            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(3, (micVolume / 100) * 12)}px` }}
                          />
                          <span
                            className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(3, (micVolume / 100) * 8)}px` }}
                          />
                        </div>
                      )}
                      {!micActive && <MicOff className="w-2.5 h-2.5 text-rose-400" />}
                    </div>

                    {/* Switch Camera Button on PiP */}
                    <button
                      type="button"
                      onClick={switchCameraFacing}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      title="Switch Camera"
                    >
                      <SwitchCamera className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Bottom Floating Glass Action Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 shadow-2xl select-none z-40">
                  {/* Mute Mic Toggle */}
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-md'
                    }`}
                    title={micActive ? 'Mute Mic' : 'Unmute Mic'}
                  >
                    {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>

                  {/* Stop Video Toggle */}
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      videoActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-md'
                    }`}
                    title={videoActive ? 'Stop Video' : 'Start Video'}
                  >
                    {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>

                  {/* Toggle Captions / Subtitles Button */}
                  <button
                    type="button"
                    onClick={() => setShowCaptions(!showCaptions)}
                    className={`p-2.5 rounded-full transition-all cursor-pointer ${
                      showCaptions ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={showCaptions ? "Hide Subtitles" : "Show Translated Subtitles"}
                  >
                    <Subtitles className="w-4 h-4" />
                  </button>

                  {/* End Call Button */}
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PhoneOff className="w-3.5 h-3.5 shrink-0" />
                    <span>End Consult</span>
                  </button>
                </div>
              </div>

              {/* Side Consultation Chat */}
              <div className="bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col min-h-0 text-xs">
                <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 text-xs font-bold text-slate-300">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">In-Call Clinical Chat</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    ABDM Encrypted
                  </span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {messages.map((m, idx) => {
                    const isMe = (currentRole === 'DOCTOR' && m.sender === 'Doctor') || (currentRole === 'PATIENT' && m.sender === 'Patient');
                    const senderLabel = m.sender === 'Doctor'
                      ? (currentRole === 'DOCTOR' ? 'You (Doctor)' : doctorName)
                      : (currentRole === 'PATIENT' ? 'You' : patientName);

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5">
                          {senderLabel} • {m.time}
                        </span>
                        <div
                          className={`p-2.5 rounded-2xl max-w-[88%] leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700/80'
                          }`}
                        >
                          <p>{m.text}</p>
                          {m.image && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-700">
                              <img src={m.image} alt="Symptom" className="w-full h-28 object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedImage('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=300')}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Attach Symptom Photo"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder={currentRole === 'DOCTOR' ? 'Type clinical advice or questions...' : 'Describe symptoms to doctor...'}
                    className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-full border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* 4. CONSULTATION COMPLETED SUMMARY SCREEN */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Consultation Completed</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Session with {doctorName} ({specialty}) has ended. Duration: {formatDuration(callDuration)}.
                </p>
              </div>

              <div className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Diagnosis:</span>
                  <span className="font-bold text-white">Acute Symptomatic Care</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Prescription ID:</span>
                  <span className="font-bold text-emerald-400">RX-BC-2026-9041</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ABDM Sync:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Linked to ABHA
                  </span>
                </div>
              </div>

              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Close & Return
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Prescription</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </PhoneModalPortal>
  );
};
export default TeleconsultRoomModal;