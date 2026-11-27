import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartHandshake, Building2, Stethoscope, CheckCircle2, User, 
  Phone, Globe, Award, Image as ImageIcon, Plus, Trash2, X, ChevronRight, ChevronLeft, ArrowRight
} from 'lucide-react';
import { NurseProfile, Hospital, DoctorProfile } from '../types';
import confetti from 'canvas-confetti';

interface NurseOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nurse: NurseProfile;
  hospital: Hospital;
  doctors: DoctorProfile[];
  onSaveNurse: (updatedNurse: Partial<NurseProfile>) => void;
  onSaveHospital: (updatedHospital: Partial<Hospital>) => void;
  onAddDoctor: (newDoctor: DoctorProfile) => void;
}

const HOSPITAL_GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800'
];

const SPECIALTY_OPTIONS = [
  'Cardiology',
  'Gastroenterology',
  'Orthopedics',
  'General Medicine',
  'Dermatology',
  'Pediatrics',
  'Neurology'
];

export const NurseOnboardingModal: React.FC<NurseOnboardingModalProps> = ({
  isOpen,
  onClose,
  nurse,
  hospital,
  doctors,
  onSaveNurse,
  onSaveHospital,
  onAddDoctor
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Nurse Details
  const [nurseName, setNurseName] = useState(nurse.name || 'Nurse Priya');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>(nurse.gender || 'Female');
  const [phone, setPhone] = useState(nurse.phone || '+91 98765 43210');
  const [regNo, setRegNo] = useState(nurse.registrationNumber || 'TNC-NUR-9421');
  const [experience, setExperience] = useState<number>(nurse.experienceYears || 6);
  const [qualification, setQualification] = useState(nurse.qualification || 'B.Sc Nursing');
  const [languages, setLanguages] = useState<string[]>(nurse.languages || ['Tamil', 'English', 'Telugu']);

  // Step 2: Hospital Maintenance
  const [hospitalName, setHospitalName] = useState(hospital.name || 'City Care Multi-Specialty Hospital');
  const [hospitalAddress, setHospitalAddress] = useState(hospital.address || '42 Avinashi Road, Peelamedu, Coimbatore');
  const [hospitalPhone, setHospitalPhone] = useState(hospital.contactNumber || '+91 422 2570100');
  const [hospitalImage, setHospitalImage] = useState(hospital.image || HOSPITAL_GALLERY_IMAGES[0]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    hospital.facilities || ['24/7 Emergency ICU', 'NABH Accredited', 'Cardiac Care', 'Digital OPD Queue']
  );

  // Step 3: Doctors Management & New Doctor Add
  const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocGender, setNewDocGender] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [newDocSpecialty, setNewDocSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [newDocQualifications, setNewDocQualifications] = useState('MBBS, MD, DM');
  const [newDocExp, setNewDocExp] = useState(12);
  const [newDocReg, setNewDocReg] = useState('TMC-77492');
  const [newDocRoom, setNewDocRoom] = useState('Room 204');
  const [newDocImage, setNewDocImage] = useState('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200');

  const availableLanguages = ['Tamil', 'English', 'Telugu', 'Hindi', 'Kannada', 'Malayalam'];
  const allFacilities = [
    '24/7 Emergency ICU',
    'NABH Accredited',
    'Cardiac Care',
    'Digital OPD Queue',
    '24/7 Trauma Center',
    'In-House Diagnostics',
    'Advanced Pharmacy'
  ];

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => 
      prev.includes(lang) 
        ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) 
        : [...prev, lang]
    );
  };

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const handleAddNewDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const createdDoctor: DoctorProfile = {
      id: `doc-${Date.now()}`,
      userId: `user-doc-${Date.now()}`,
      hospitalId: hospital.id,
      hospitalName: hospital.name || 'City Care Multi-Specialty Hospital',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      name: newDocName.trim(),
      specialty: newDocSpecialty,
      opConsultationFee: 100, // Standard Bcare OPD fee
      teleConsultationFee: 250, // Standard Bcare Video fee
      experienceYears: newDocExp,
      rating: 4.8,
      totalConsultations: 120,
      image: newDocImage,
      roomNumber: newDocRoom,
      registrationNumber: newDocReg,
      qualifications: newDocQualifications,
      gender: newDocGender,
      languages: ['English', 'Tamil'],
      nextAvailableToken: 5,
      estimatedWaitMins: 10,
      videoAvailable: true,
      status: 'ACTIVE'
    };

    onAddDoctor(createdDoctor);
    setShowAddDoctorForm(false);
    setNewDocName('');
    alert(`Doctor ${createdDoctor.name} added under ${hospitalName}! Admin notified for password generation.`);
  };

  const handleCompleteSetup = () => {
    // 1. Save Nurse Profile
    onSaveNurse({
      name: nurseName,
      gender,
      phone,
      registrationNumber: regNo,
      experienceYears: experience,
      qualification,
      languages,
      isProfileCompleted: true
    });

    // 2. Save Hospital Details
    onSaveHospital({
      name: hospitalName,
      address: hospitalAddress,
      contactNumber: hospitalPhone,
      image: hospitalImage,
      facilities: selectedFacilities
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold">
              <HeartHandshake className="w-4 h-4 text-cyan-300" />
              <span>Nurse In-Charge Setup Wizard</span>
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              {currentStep === 1 && 'Step 1 of 3: Your Nurse Profile'}
              {currentStep === 2 && 'Step 2 of 3: Hospital Information & Images'}
              {currentStep === 3 && 'Step 3 of 3: Maintain Doctors & OPD Roster'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 border-b border-slate-200/80 text-center text-[11px] font-bold">
          <div className={`py-1 rounded-lg transition-colors ${currentStep === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}>
            1. Nurse Details
          </div>
          <div className={`py-1 rounded-lg transition-colors ${currentStep === 2 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}>
            2. Hospital & Images
          </div>
          <div className={`py-1 rounded-lg transition-colors ${currentStep === 3 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'}`}>
            3. Doctor List
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-800">
          {/* ========================================================================= */}
          {/* STEP 1: NURSE PERSONAL DETAILS                                            */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nurse Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={nurseName}
                    onChange={(e) => setNurseName(e.target.value)}
                    placeholder="e.g. Nurse Priya"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none font-semibold text-slate-900"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nursing Council Reg. No.</label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. TNC-NUR-9421"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. B.Sc Nursing / GNM"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  <span>Languages You Speak with Patients</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                        languages.includes(lang)
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {languages.includes(lang) && '✓ '} {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: HOSPITAL DETAILS & IMAGES MAINTENANCE                             */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  You are the verified In-Charge nurse maintaining the single real facility in the district network.
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Address & Locality</label>
                <input
                  type="text"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Emergency Desk Phone</label>
                <input
                  type="text"
                  value={hospitalPhone}
                  onChange={(e) => setHospitalPhone(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                />
              </div>

              {/* Hospital Cover Images Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Hospital Cover Image</span>
                  <span className="text-[10px] text-slate-400">Select or paste custom URL</span>
                </label>
                
                {/* Image Preview & Presets */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {HOSPITAL_GALLERY_IMAGES.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setHospitalImage(img)}
                      className={`relative h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        hospitalImage === img ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Hospital" className="w-full h-full object-cover" />
                      {hospitalImage === img && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={hospitalImage}
                  onChange={(e) => setHospitalImage(e.target.value)}
                  placeholder="Paste direct Image URL..."
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[11px] font-mono text-slate-700"
                />
              </div>

              {/* Facilities */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Accreditations & Key Facilities</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {allFacilities.map((fac) => (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => toggleFacility(fac)}
                      className={`p-2 rounded-xl border text-left text-[11px] font-semibold cursor-pointer transition-all ${
                        selectedFacilities.includes(fac)
                          ? 'bg-blue-50 border-blue-400 text-blue-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {selectedFacilities.includes(fac) ? '✓ ' : '+ '} {fac}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: DOCTOR LIST MAINTENANCE & ADD DOCTOR                             */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Hospital Doctors Roster</h4>
                  <p className="text-[11px] text-slate-500">Doctors practicing at {hospitalName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}
                  className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddDoctorForm ? 'Close Form' : 'Add Doctor'}</span>
                </button>
              </div>

              {/* Add Doctor Subform */}
              {showAddDoctorForm && (
                <form
                  onSubmit={handleAddNewDoctorSubmit}
                  className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 animate-in fade-in duration-200"
                >
                  <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5 pb-1 border-b border-blue-200">
                    <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                    <span>Create New Doctor Entry</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Doctor Name</label>
                      <input
                        type="text"
                        required
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="e.g. Dr. Ramesh V, MD"
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Specialty</label>
                      <select
                        value={newDocSpecialty}
                        onChange={(e) => setNewDocSpecialty(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                      >
                        {SPECIALTY_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Qualifications</label>
                      <input
                        type="text"
                        value={newDocQualifications}
                        onChange={(e) => setNewDocQualifications(e.target.value)}
                        placeholder="MBBS, MD"
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Reg. Number</label>
                      <input
                        type="text"
                        value={newDocReg}
                        onChange={(e) => setNewDocReg(e.target.value)}
                        placeholder="TMC-77492"
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">OPD Room</label>
                      <input
                        type="text"
                        value={newDocRoom}
                        onChange={(e) => setNewDocRoom(e.target.value)}
                        placeholder="Room 204"
                        className="w-full p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">Standard fees: OPD ₹100 • Video ₹250</span>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Save Doctor to Roster
                    </button>
                  </div>
                </form>
              )}

              {/* Current Doctors List */}
              <div className="space-y-2">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={doc.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'}
                        alt={doc.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h5 className="font-bold text-slate-900 truncate">{doc.name}</h5>
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium truncate">
                          {doc.specialty} • {doc.roomNumber || 'Room 204'} • Reg: {doc.registrationNumber || 'TMC-842'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        OPD ₹{doc.opConsultationFee || 100}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSetup}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Complete Setup</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default NurseOnboardingModal;
