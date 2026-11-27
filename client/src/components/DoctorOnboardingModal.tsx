import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Award, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Stethoscope, 
  FileText, 
  Clock, 
  Video, 
  Sparkles,
  Phone,
  Calendar
} from 'lucide-react';
import { DoctorProfile } from '../types';

interface DoctorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
  onSaveDoctor: (updated: Partial<DoctorProfile>) => void;
}

const INDIAN_LANGUAGES = [
  'Tamil',
  'English',
  'Hindi',
  'Telugu',
  'Malayalam',
  'Kannada'
];

export const DoctorOnboardingModal: React.FC<DoctorOnboardingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSaveDoctor
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Doctor Personal & Language
  const [name, setName] = useState(doctor.name || 'Dr. Ananya Sharma');
  const [gender, setGender] = useState(doctor.gender || 'Female');
  const [phone, setPhone] = useState(doctor.phone || '+91 98422 10001');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    doctor.languages || ['English', 'Tamil', 'Hindi']
  );
  const [bio, setBio] = useState(
    doctor.bio || 'Consultant Interventional Cardiologist specializing in adult cardiac care, preventive cardiology, and non-invasive hemodynamic assessment.'
  );

  // Step 2: Qualifications & Medical Council
  const [specialty, setSpecialty] = useState(doctor.specialty || 'Cardiology');
  const [qualifications, setQualifications] = useState(doctor.qualifications || 'MBBS, MD (Medicine), DM (Cardiology)');
  const [regNumber, setRegNumber] = useState(doctor.registrationNumber || 'TNMC-77492');
  const [experienceYears, setExperienceYears] = useState(doctor.experienceYears || 14);

  // Step 3: OPD Chamber & Fees
  const [roomNumber, setRoomNumber] = useState(doctor.roomNumber || 'Room 204');
  const [opFee, setOpFee] = useState(doctor.opConsultationFee || 100);
  const [teleFee, setTeleFee] = useState(doctor.teleConsultationFee || 250);
  const [schedule, setSchedule] = useState(doctor.schedule || '09:00 AM - 01:00 PM & 04:00 PM - 07:00 PM');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleComplete = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveDoctor({
        name,
        gender,
        phone,
        languages: selectedLanguages,
        bio,
        specialty,
        qualifications,
        registrationNumber: regNumber,
        experienceYears,
        roomNumber,
        opConsultationFee: opFee,
        teleConsultationFee: teleFee,
        schedule,
        isProfileCompleted: true
      });
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Doctor Professional Onboarding</span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">
                3-Step Specialist Setup
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-blue-600' : ''}>1. Identity & Lang</span>
              <span className={step >= 2 ? 'text-blue-600' : ''}>2. Qualifications</span>
              <span className={step === 3 ? 'text-blue-600' : ''}>3. OPD & Fees</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-blue-600 h-full rounded-full"
                animate={{ width: step === 1 ? '33.3%' : step === 2 ? '66.6%' : '100%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* STEP 1: PERSONAL DETAILS */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Personal Information & Communication
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor Full Name (with prefix)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'Female' | 'Male' | 'Other')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Consultation Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDIAN_LANGUAGES.map(lang => {
                      const isSel = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}{lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Summary / Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short introduction about clinical focus and background"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: QUALIFICATIONS & COUNCIL REGISTRATION */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Award className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Medical Credentials & Council Registration
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Clinical Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Gastroenterology">Gastroenterology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medical Degrees & Fellowships
                  </label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. MBBS, MD (General Medicine), DM (Cardiology)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NMC / State Council Reg No.
                    </label>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="e.g. TNMC-77492"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: OPD CHAMBER & FEES */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    OPD Consultation & Telehealth Setup
                  </h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80">
                  <span className="text-[10px] font-black uppercase text-blue-700 block">
                    Hospital Affiliation
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">
                    City Care Multi-Specialty Hospital
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    42 Avinashi Road, Peelamedu, Coimbatore
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      OPD Room / Chamber
                    </label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g. Room 204"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Daily OPD Schedule
                    </label>
                    <input
                      type="text"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      placeholder="e.g. 09:00 AM - 01:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      In-Person OPD Token (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        value={opFee}
                        onChange={(e) => setOpFee(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Video Consultation (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                      <input
                        type="number"
                        value={teleFee}
                        onChange={(e) => setTeleFee(Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleComplete}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving Profile...' : 'Save & Activate Profile'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DoctorOnboardingModal;
