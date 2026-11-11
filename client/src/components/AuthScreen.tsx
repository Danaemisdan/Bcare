import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BCareLogo } from './BCareLogo';
import { UserRole, User } from '../types';
import { 
  User as UserIcon, 
  Stethoscope, 
  HeartHandshake, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ScanFace,
  Lock,
  Phone,
  Mail,
  AlertCircle,
  KeyRound,
  Shield,
  Zap,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (data: { user: User; token: string; role: UserRole; profile: any }) => void;
  initialRole?: UserRole;
  isSimulator?: boolean;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialRole = 'PATIENT',
  isSimulator = false
}) => {
  // Screen views: Primary is SIGNIN. Only Patients can toggle to PATIENT_SIGNUP.
  const [view, setView] = useState<'SIGNIN' | 'PATIENT_SIGNUP'>('SIGNIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state (Patient & Doctor)
  const [signUpStep, setSignUpStep] = useState<'MOBILE' | 'OTP' | 'DETAILS'>('MOBILE');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Tamil']);
  const [doctorSpecialty, setDoctorSpecialty] = useState('General Medicine');
  const [doctorRegNo, setDoctorRegNo] = useState('');
  const [doctorHospitalId, setDoctorHospitalId] = useState('hosp-1');

  const availableLanguages = [
    { id: 'English', label: 'English', flag: '🇬🇧', native: 'English' },
    { id: 'Tamil', label: 'Tamil', flag: '🇮🇳', native: 'தமிழ்' },
    { id: 'Hindi', label: 'Hindi', flag: '🇮🇳', native: 'हिंदी' },
    { id: 'Telugu', label: 'Telugu', flag: '🇮🇳', native: 'తెలుగు' },
    { id: 'Kannada', label: 'Kannada', flag: '🇮🇳', native: 'ಕನ್ನಡ' },
    { id: 'Malayalam', label: 'Malayalam', flag: '🇮🇳', native: 'മലയാളം' },
    { id: 'Bengali', label: 'Bengali', flag: '🇮🇳', native: 'বাংলা' },
    { id: 'Marathi', label: 'Marathi', flag: '🇮🇳', native: 'मराठी' },
    { id: 'Gujarati', label: 'Gujarati', flag: '🇮🇳', native: 'ગુજરાતી' }
  ];

  const toggleLanguage = (langId: string) => {
    setSelectedLanguages(prev => 
      prev.includes(langId) 
        ? (prev.length > 1 ? prev.filter(l => l !== langId) : prev)
        : [...prev, langId]
    );
  };

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [faceIdActive, setFaceIdActive] = useState(false);

  const rolesConfig: { role: UserRole; label: string; icon: any; hint: string; demoUser: string }[] = [
    { role: 'PATIENT', label: 'Patient', icon: UserIcon, hint: 'OP tokens & video consults', demoUser: 'Ramesh Kumar' },
    { role: 'DOCTOR', label: 'Doctor', icon: Stethoscope, hint: 'Clinical OPD workstation', demoUser: 'Dr. Ananya' },
    { role: 'NURSE', label: 'Nurse', icon: HeartHandshake, hint: 'Community referral desk', demoUser: 'Nurse Priya' },
    { role: 'FRANCHISE_ADMIN', label: 'Franchise', icon: Building2, hint: 'District cash & logistics', demoUser: 'Apex Agency' },
    { role: 'SUPER_ADMIN', label: 'HQ Admin', icon: ShieldCheck, hint: 'System split & audit ledger', demoUser: 'HQ SuperAdmin' }
  ];

  // Quick 1-Touch Demo Login
  const handleDemoLogin = async (demoRole: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDemo: true, role: demoRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      setSuccessToast(`Signed in as ${demoRole.toLowerCase().replace('_', ' ')}`);
      setTimeout(() => {
        onSuccess(data);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to server. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Credential Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier) {
      setErrorMessage('Please enter your mobile number or registered email');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      setSuccessToast('Authentication successful!');
      setTimeout(() => {
        onSuccess(data);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Send OTP to Mobile
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMessage(null);
    setOtpInput('1234'); // Simulated OTP auto-fill for testing ease
    setSignUpStep('OTP');
    setSuccessToast(`OTP code sent to +91 ${clean.slice(0, 5)} ${clean.slice(5)}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length < 4) {
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }
    setErrorMessage(null);
    setSignUpStep('DETAILS');
  };

  // Step 3: Complete Sign Up with Name & Comfortable Languages
  const handlePatientSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }
    if (selectedLanguages.length === 0) {
      setErrorMessage("Please select at least one language you're comfortable speaking");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const isDoctor = selectedRole === 'DOCTOR';
      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        role: isDoctor ? 'DOCTOR' : 'PATIENT',
        languages: selectedLanguages,
        specialty: isDoctor ? doctorSpecialty : undefined,
        registrationNumber: isDoctor ? (doctorRegNo || 'NMC-TN-88219') : undefined,
        hospitalId: isDoctor ? doctorHospitalId : undefined
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to create ${isDoctor ? 'doctor' : 'patient'} account`);

      setSuccessToast(`Welcome, ${name.trim()}! Entering B Care...`);
      setTimeout(() => {
        onSuccess(data);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated 1-Touch Biometric Face ID
  const handleBiometricAuth = async () => {
    setFaceIdActive(true);
    setErrorMessage(null);
    setTimeout(async () => {
      setFaceIdActive(false);
      await handleDemoLogin(selectedRole);
    }, 850);
  };

  return (
    <div className="relative w-full min-h-full flex flex-col justify-between p-3 sm:p-6 bg-zinc-50/60 font-sans text-zinc-900 select-none overflow-y-auto">
      
      {/* ========================================================================= */}
      {/* 21ST.DEV AMBIENT BACKDROP & RADIAL GLOWS */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-bl from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-emerald-500/5 blur-3xl rounded-full" />
      </div>

      {/* ========================================================================= */}
      {/* MAIN GLASSMORPHISM CARD */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[460px] mx-auto my-auto z-10 py-2 sm:py-4">
        
        {/* Outer ambient backlight glow behind card */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/15 via-teal-400/15 to-indigo-500/15 rounded-[34px] blur-xl opacity-80 pointer-events-none -z-10" />

        {/* The Frosted Glass Container */}
        <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.06),0_1px_1px_rgba(255,255,255,0.9)_inset] p-5 sm:p-7">
          
          {/* Top Rim Shimmer Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent rounded-t-3xl" />

          {/* Top Brand & Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <BCareLogo size={42} variant="full" showGlow={true} />
            
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mt-2 font-sans">
              {view === 'SIGNIN' ? 'Sign In' : 'Create Patient Account'}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 max-w-xs font-normal">
              {view === 'SIGNIN' 
                ? 'Select your workspace and enter your credentials' 
                : 'Only patients can create an account online'}
            </p>
          </div>

          {/* Feedback & Error Alert Banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/90 flex items-start gap-2.5 text-rose-800 text-xs shadow-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </motion.div>
            )}

            {successToast && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center gap-2.5 text-emerald-800 text-xs shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{successToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* VIEW: SIGN IN ONLY */}
          {/* ========================================================================= */}
          {view === 'SIGNIN' ? (
            <div className="space-y-4">

              {/* ----------------------------------------------------------------- */}
              {/* SINGLE TOUCH SIGN IN OPTIONS ON TOP */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-3 rounded-2xl bg-zinc-100/80 border border-zinc-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 px-0.5">
                  <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    Single-Touch Sign In
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">1-Tap Instant</span>
                </div>

                {/* 1-Tap Role Demo Buttons with distinctive colorful healthcare tints */}
                <div className="grid grid-cols-5 gap-1.5 pt-2">
                  {rolesConfig.map((rc) => {
                    const Icon = rc.icon;
                    const getRoleBadgeColor = (role: UserRole) => {
                      switch (role) {
                        case 'PATIENT': return 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-200/80';
                        case 'DOCTOR': return 'bg-cyan-50 hover:bg-cyan-600 text-cyan-800 hover:text-white border-cyan-200/80';
                        case 'NURSE': return 'bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border-rose-200/80';
                        case 'FRANCHISE_ADMIN': return 'bg-indigo-50 hover:bg-indigo-600 text-indigo-800 hover:text-white border-indigo-200/80';
                        case 'SUPER_ADMIN': return 'bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white border-amber-200/80';
                        default: return 'bg-zinc-50 hover:bg-zinc-950 text-zinc-700 hover:text-white border-zinc-200/60';
                      }
                    };

                    return (
                      <button
                        key={rc.role}
                        type="button"
                        onClick={() => handleDemoLogin(rc.role)}
                        disabled={isLoading}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer group shadow-2xs ${getRoleBadgeColor(rc.role)}`}
                        title={`1-Tap Sign In as ${rc.demoUser} (${rc.label})`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-1 transition-colors" />
                        <span className="text-[9px] font-bold leading-none truncate max-w-full">
                          {rc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Face ID / Biometrics 1-Touch Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    disabled={faceIdActive || isLoading}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200/90 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <ScanFace className={`w-4 h-4 ${faceIdActive ? 'text-emerald-600 animate-pulse' : 'text-emerald-700'}`} />
                    <span>{faceIdActive ? 'Verifying Biometrics...' : 'Sign in with Face ID / Passkey'}</span>
                  </button>
                </div>
              </div>

              {/* Divider: Or sign in with credentials */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200/80" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-3 bg-white text-zinc-400 uppercase font-medium tracking-wider">
                    Or with credentials
                  </span>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* CREDENTIAL SIGN IN FORM */}
              {/* ----------------------------------------------------------------- */}
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                {/* Healthcare Workspace Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1 px-0.5">
                    <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-zinc-400" />
                      Select Workspace
                    </label>
                    <span className="text-[10px] text-zinc-400">
                      {rolesConfig.find(r => r.role === selectedRole)?.hint}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {rolesConfig.map((rc) => {
                      const Icon = rc.icon;
                      const isSelected = selectedRole === rc.role;
                      return (
                        <button
                          key={rc.role}
                          type="button"
                          onClick={() => setSelectedRole(rc.role)}
                          className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'border-zinc-950 bg-zinc-950 text-white shadow-sm ring-2 ring-emerald-500/20'
                              : 'border-zinc-200/80 bg-zinc-50/70 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 transition-colors ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                          <span className="text-[10px] font-medium leading-none truncate w-full">
                            {rc.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile / Email Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Mobile Number or Clinical Email
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'DOCTOR' 
                          ? 'dr.ananya@apexheart.com or 9876543211' 
                          : selectedRole === 'NURSE'
                          ? 'nurse.priya@districtclinic.org or 9876543212'
                          : selectedRole === 'FRANCHISE_ADMIN'
                          ? 'franchise.coimbatore@bcare.health'
                          : selectedRole === 'SUPER_ADMIN'
                          ? 'admin@bcare.health'
                          : '98765 43210 or ramesh.kumar@example.com'
                      }
                      className="w-full text-xs p-3 pl-9 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-zinc-900 placeholder:text-zinc-400"
                    />
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                </div>

                {/* Password / OTP Input */}
                {!useOtp ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-700">
                        Account Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseOtp(true)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                      >
                        Login with OTP instead
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter account password (or use instant demo above)"
                        className="w-full text-xs p-3 pl-9 pr-10 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-sans text-zinc-900 placeholder:text-zinc-400"
                      />
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-700">
                        4-Digit Verification OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseOtp(false)}
                        className="text-[11px] text-zinc-500 hover:text-zinc-800 font-medium cursor-pointer"
                      >
                        Use Password instead
                      </button>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="• • • •  (Default: 1234)"
                        className="w-full text-xs p-3 pl-9 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all tabular-nums text-center tracking-widest font-bold text-zinc-900"
                      />
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                )}

                {/* Primary Submit Button with Light Sweep Beam - Lush Emerald/Teal Gradient */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative group overflow-hidden w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In as {rolesConfig.find(r => r.role === selectedRole)?.label}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* ----------------------------------------------------------------- */}
              {/* ACCOUNT CREATION POLICY (PATIENTS ONLY) */}
              {/* ----------------------------------------------------------------- */}
              <div className="pt-3 border-t border-zinc-100 text-center">
                {selectedRole === 'PATIENT' || selectedRole === 'DOCTOR' ? (
                  <div className="text-xs text-zinc-600">
                    New {selectedRole === 'DOCTOR' ? 'Doctor' : 'Patient'}?{' '}
                    <button
                      type="button"
                      onClick={() => { setView('PATIENT_SIGNUP'); setErrorMessage(null); }}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                    >
                      Register as a {selectedRole === 'DOCTOR' ? 'Doctor' : 'Patient'}
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1.5 px-2 leading-relaxed">
                    <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>
                      {rolesConfig.find(r => r.role === selectedRole)?.label} accounts are provisioned by Network Administration.
                    </span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW: STREAMLINED PATIENT SIGN UP (MOBILE -> OTP -> NAME & LANGUAGES)    */
            /* ========================================================================= */
            <div className="space-y-4">
              {/* Back navigation & Step Badge */}
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-zinc-100">
                <button
                  type="button"
                  onClick={() => {
                    if (signUpStep === 'DETAILS') setSignUpStep('OTP');
                    else if (signUpStep === 'OTP') setSignUpStep('MOBILE');
                    else { setView('SIGNIN'); setErrorMessage(null); }
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  {signUpStep === 'MOBILE' ? 'Back to Sign In' : 'Back'}
                </button>
                <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0">
                  {signUpStep === 'MOBILE' && 'Step 1 of 3: Mobile'}
                  {signUpStep === 'OTP' && 'Step 2 of 3: OTP'}
                  {signUpStep === 'DETAILS' && 'Step 3 of 3: Profile'}
                </span>
              </div>

              {/* STEP 1: MOBILE NUMBER INPUT */}
              {signUpStep === 'MOBILE' && (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-bold text-zinc-900">Enter your mobile number</h3>
                    <p className="text-xs text-zinc-500">We will send a 4-digit verification code to verify your phone.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative flex items-center rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition-all overflow-hidden">
                      <span className="pl-3.5 pr-2 py-3 text-xs font-bold text-zinc-500 border-r border-zinc-200/80 bg-zinc-100/50 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="w-full text-xs p-3 focus:outline-none bg-transparent font-medium tabular-nums text-zinc-900 placeholder:text-zinc-400 tracking-wider"
                      />
                      <Phone className="w-4 h-4 text-zinc-400 mr-3 pointer-events-none shrink-0" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="relative group overflow-hidden w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: OTP VERIFICATION */}
              {signUpStep === 'OTP' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-bold text-zinc-900">Enter verification code</h3>
                    <p className="text-xs text-zinc-500">
                      Code sent to <strong className="text-zinc-800 font-mono">+91 {phone}</strong>.{' '}
                      <button 
                        type="button" 
                        onClick={() => setSignUpStep('MOBILE')} 
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      4-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • •"
                      className="w-full text-base p-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono tracking-widest text-center font-bold text-zinc-900"
                    />
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5 px-1">
                      <span>Auto-filled for testing: <strong>1234</strong></span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setOtpInput('1234');
                          setSuccessToast('OTP re-sent: 1234');
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="relative group overflow-hidden w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 3: NAME & COMFORTABLE LANGUAGES */}
              {signUpStep === 'DETAILS' && (
                <form onSubmit={handlePatientSignUpSubmit} className="space-y-3.5">
                  <div className="text-left space-y-1">
                    <h3 className="text-base font-bold text-zinc-900">What's your name?</h3>
                    <p className="text-xs text-zinc-500">Enter your name and the languages you feel comfortable speaking.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      {selectedRole === 'DOCTOR' ? 'Doctor Full Name & Degree' : 'Full Name'}
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === 'DOCTOR' ? 'e.g. Dr. Vikram Raman, MD' : 'e.g. Ramesh Kumar'}
                        className="w-full text-xs p-3 pl-9 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans text-zinc-900 placeholder:text-zinc-400 font-medium"
                      />
                      <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3.5 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                    </div>
                  </div>

                  {selectedRole === 'DOCTOR' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Clinical Specialty
                          </label>
                          <select
                            value={doctorSpecialty}
                            onChange={(e) => setDoctorSpecialty(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none text-zinc-900 font-medium cursor-pointer"
                          >
                            <option value="Cardiology">Cardiology</option>
                            <option value="Orthopedics">Orthopedics</option>
                            <option value="Neurology">Neurology</option>
                            <option value="General Medicine">General Medicine</option>
                            <option value="Pediatrics">Pediatrics</option>
                            <option value="Dermatology">Dermatology</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            NMC / Council Reg #
                          </label>
                          <input
                            type="text"
                            value={doctorRegNo}
                            onChange={(e) => setDoctorRegNo(e.target.value)}
                            placeholder="e.g. TMC-88219"
                            className="w-full text-xs p-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none text-zinc-900 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          Affiliated Accredited Hospital
                        </label>
                        <select
                          value={doctorHospitalId}
                          onChange={(e) => setDoctorHospitalId(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50/80 focus:bg-white focus:outline-none text-zinc-900 font-medium cursor-pointer"
                        >
                          <option value="hosp-1">City Care Multi-Specialty Hospital</option>
                          <option value="hosp-2">Kovai Medical & Research Centre</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                      <label className="block text-[11px] font-semibold text-zinc-700">
                        Comfortable Consultation Languages
                      </label>
                      <span className="text-[10px] text-blue-600 font-medium">Video call matching</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-0.5">
                      {availableLanguages.map(lang => {
                        const isSelected = selectedLanguages.includes(lang.id);
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => toggleLanguage(lang.id)}
                            className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-blue-50/90 border-blue-400 text-blue-900 shadow-2xs'
                                : 'bg-white border-zinc-200/80 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs">{lang.flag}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                              )}
                            </div>
                            <span className="text-[11px] font-bold mt-1 leading-none">{lang.label}</span>
                            <span className="text-[9.5px] text-zinc-400 font-normal mt-0.5">{lang.native}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10.5px] text-zinc-500 mt-1.5">
                      Selected: <strong className="text-zinc-800 font-semibold">{selectedLanguages.join(', ')}</strong>. Doctors will communicate with you in your chosen languages.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative group overflow-hidden w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Complete Sign Up & Enter B Care</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER / COMPLIANCE CREDITS */}
      {/* ========================================================================= */}
      <div className="pt-2 pb-1 text-center z-10">
        <p className="text-[11px] text-zinc-400 font-medium flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Protected by B care Universal Security • Privacy Policy • Clinical Terms</span>
        </p>
      </div>

    </div>
  );
};

export default AuthScreen;
