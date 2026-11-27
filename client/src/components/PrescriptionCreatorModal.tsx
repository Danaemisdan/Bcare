import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Plus, Trash2, CheckCircle2, ShieldCheck, 
  Printer, Download, Sparkles, Building2, User, Stethoscope, X, AlertCircle, Share2
} from 'lucide-react';
import { PrescriptionMedicine, DigitalPrescription, DoctorProfile, Hospital } from '../types';
import { searchIndianMedicines, IndianMedicineItem } from '../services/indianMedicinesService';
import { generatePrescriptionPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';

interface PrescriptionCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: DoctorProfile;
  hospital: Hospital;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  appointmentId?: string;
  onSavePrescription?: (prescription: DigitalPrescription) => void;
  onTriggerWhatsAppToast?: (title: string, message: string, type: 'PRESCRIPTION_READY') => void;
}

export const PrescriptionCreatorModal: React.FC<PrescriptionCreatorModalProps> = ({
  isOpen,
  onClose,
  doctor,
  hospital,
  patientName,
  patientAge = 32,
  patientGender = 'Male',
  patientPhone = '+91 98765 43210',
  appointmentId = `BC-OP-${Date.now().toString().slice(-4)}`,
  onSavePrescription,
  onTriggerWhatsAppToast
}) => {
  const [diagnosis, setDiagnosis] = useState('Acute Gastritis & Acid Peptic Disease (K29.7)');
  const [vitals, setVitals] = useState({
    bp: '120/80',
    pulse: '74',
    temperature: '98.4°F',
    spo2: '99%'
  });
  const [clinicalNotes, setClinicalNotes] = useState(
    'Strictly avoid spicy, oily food and carbonated drinks. Drink 3 liters of warm water daily. Follow up if abdominal pain persists.'
  );
  const [followUpDate, setFollowUpDate] = useState('After 7 Days (SOS)');

  // Prescribed Medicines list
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([
    {
      id: 'med-1',
      name: 'Pan-D',
      genericComposition: 'Pantoprazole 40mg + Domperidone 30mg SR',
      specification: 'Sustained-Release Capsule',
      dosage: '40mg / 30mg',
      frequency: '1-0-0 Before Food',
      duration: '14 Days',
      instructions: 'Take 30 mins before morning breakfast on empty stomach with water.',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80'
    },
    {
      id: 'med-2',
      name: 'Gelusil MPS Liquid',
      genericComposition: 'Aluminium Hydroxide + Magnesium Hydroxide',
      specification: 'Oral Suspension 200ml Bottle',
      dosage: '10ml',
      frequency: '1-1-1 After Meals',
      duration: '7 Days',
      instructions: 'Shake well. Take 2 spoonfuls after each meal.',
      image: 'https://images.unsplash.com/photo-1550572017-ed06509f6b52?w=300&auto=format&fit=crop&q=80'
    }
  ]);

  // Indian Medicines Search Typeahead State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IndianMedicineItem[]>(searchIndianMedicines(''));
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Custom Medicine Input Form
  const [showCustomMedForm, setShowCustomMedForm] = useState(false);
  const [customMedName, setCustomMedName] = useState('');
  const [customGeneric, setCustomGeneric] = useState('');
  const [customSpec, setCustomSpec] = useState('Tablet');
  const [customDosage, setCustomDosage] = useState('500mg');
  const [customFreq, setCustomFreq] = useState('1-0-1 After Food');
  const [customDuration, setCustomDuration] = useState('5 Days');
  const [customInstructions, setCustomInstructions] = useState('Take with water after food');

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setSearchResults(searchIndianMedicines(q));
    setShowSearchDropdown(true);
  };

  const handleSelectMedicineFromCatalog = (item: IndianMedicineItem) => {
    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: item.name,
      genericComposition: item.genericComposition,
      specification: item.specification,
      dosage: item.defaultDosage,
      frequency: item.defaultFrequency,
      duration: item.defaultDuration,
      instructions: item.instructions,
      image: item.image
    };

    setMedicines(prev => [...prev, newMed]);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleAddCustomMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMedName.trim()) return;

    const newMed: PrescriptionMedicine = {
      id: `med-${Date.now()}`,
      name: customMedName.trim(),
      genericComposition: customGeneric.trim() || undefined,
      specification: customSpec,
      dosage: customDosage,
      frequency: customFreq,
      duration: customDuration,
      instructions: customInstructions,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
    };

    setMedicines(prev => [...prev, newMed]);
    setCustomMedName('');
    setCustomGeneric('');
    setShowCustomMedForm(false);
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdateMedicine = (id: string, field: keyof PrescriptionMedicine, val: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  const buildDigitalPrescriptionObject = (): DigitalPrescription => {
    return {
      id: `RX-BC-${Date.now().toString().slice(-4)}`,
      appointmentId,
      patientId: 'patient-primary',
      patientName,
      patientAge,
      patientGender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorRegistrationNumber: doctor.registrationNumber || 'TMC-77492',
      doctorQualifications: doctor.qualifications || 'MBBS, MD, DM',
      hospitalName: hospital.name || 'City Care Multi-Specialty Hospital',
      hospitalAddress: hospital.address || '42 Avinashi Road, Peelamedu, Coimbatore',
      diagnosis,
      vitals,
      symptoms: ['Epigastric discomfort', 'Acid regurgitation', 'Postprandial bloating'],
      medicines,
      clinicalNotes,
      followUpDate,
      issuedAt: new Date().toISOString(),
      verificationQrHash: `SHA256-BC-ABDM-${Date.now()}`
    };
  };

  const handleDownloadPdf = () => {
    const rx = buildDigitalPrescriptionObject();
    generatePrescriptionPdf(rx);
  };

  const handleSignAndDispatch = () => {
    const rx = buildDigitalPrescriptionObject();
    if (onSavePrescription) onSavePrescription(rx);

    generatePrescriptionPdf(rx);

    if (onTriggerWhatsAppToast) {
      onTriggerWhatsAppToast(
        'Prescription Dispatched',
        `Official ABDM Prescription #${rx.id} sent to ${patientName}'s WhatsApp (+91 ${patientPhone.slice(-10)}).`,
        'PRESCRIPTION_READY'
      );
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.55 }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Top Header with Hospital Logo & Bcare Logo */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Hospital Logo Mark */}
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm border border-blue-400/40">
              CC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">
                  {hospital.name || 'City Care Multi-Specialty Hospital'}
                </h3>
                <span className="px-2 py-0.2 rounded-full bg-blue-950 border border-blue-500/40 text-[9.5px] font-bold text-cyan-300">
                  Bcare Clinical Rx
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">
                Dr. {doctor.name} ({doctor.specialty}) • Reg: {doctor.registrationNumber || 'TMC-77492'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Form Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-800">
          {/* Patient Details & Vitals Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-extrabold text-slate-900 text-xs">
                  {patientName} ({patientAge} Yrs / {patientGender})
                </span>
                <span className="text-[10px] text-slate-400">• Mobile: {patientPhone}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ABDM Token #{appointmentId}
              </span>
            </div>

            {/* Vitals Inputs */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block font-semibold">BP (mmHg)</span>
                <input
                  type="text"
                  value={vitals.bp}
                  onChange={(e) => setVitals(v => ({ ...v, bp: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs outline-none"
                />
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block font-semibold">Pulse (bpm)</span>
                <input
                  type="text"
                  value={vitals.pulse}
                  onChange={(e) => setVitals(v => ({ ...v, pulse: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs outline-none"
                />
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block font-semibold">Temp</span>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => setVitals(v => ({ ...v, temperature: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs outline-none"
                />
              </div>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[9.5px] text-slate-400 block font-semibold">SpO2</span>
                <input
                  type="text"
                  value={vitals.spo2}
                  onChange={(e) => setVitals(v => ({ ...v, spo2: e.target.value }))}
                  className="font-bold text-slate-900 w-full bg-transparent text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Definitive Clinical Diagnosis</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute Gastritis (K29.7) or Essential Hypertension (I10)"
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* ========================================================================= */}
          {/* INDIAN MEDICINES SEARCH & CATALOG                                         */}
          {/* ========================================================================= */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="text-base text-blue-600 font-black">℞</span>
                <span>Search & Prescribe Indian Medicines (Pan-India API Catalog)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowCustomMedForm(!showCustomMedForm)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {showCustomMedForm ? 'Close Custom Form' : '+ Add Custom Medicine'}
              </button>
            </div>

            {/* Live Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Type brand or generic (e.g. Dolo, Pan-D, Augmentin, Telma, Metformin...)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none transition-all"
              />

              {/* Instant Search Dropdown Results */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-56 overflow-y-auto z-50 p-1 space-y-1">
                  <div className="px-2.5 py-1 text-[9.5px] font-bold uppercase text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Indian Medicines Database ({searchResults.length} matches)</span>
                    <button
                      type="button"
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      Close ✕
                    </button>
                  </div>
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectMedicineFromCatalog(item)}
                      className="w-full p-2 rounded-xl text-left hover:bg-blue-50 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900 group-hover:text-blue-700">
                              {item.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600">
                              {item.specification}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {item.genericComposition} • {item.category}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] shrink-0 opacity-90 group-hover:opacity-100">
                        + Add Rx
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Medicine Subform */}
            {showCustomMedForm && (
              <form
                onSubmit={handleAddCustomMedicine}
                className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="font-bold text-xs text-indigo-950">Add Custom Formulated Medicine</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Telmisartan 40mg)"
                    value={customMedName}
                    onChange={(e) => setCustomMedName(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Generic Composition"
                    value={customGeneric}
                    onChange={(e) => setCustomGeneric(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Form (Tablet / Syrup)"
                    value={customSpec}
                    onChange={(e) => setCustomSpec(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (1-0-1)"
                    value={customFreq}
                    onChange={(e) => setCustomFreq(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Duration (5 Days)"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Add Custom Medicine to Prescription
                  </button>
                </div>
              </form>
            )}

            {/* Prescribed Medications Card List */}
            <div className="space-y-2 pt-1">
              {medicines.map((med, idx) => (
                <div
                  key={med.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {med.image ? (
                        <img
                          src={med.image}
                          alt={med.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-600 shrink-0 text-sm">
                          Rx
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-900 truncate">{med.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {med.specification || 'Tablet'}
                          </span>
                        </div>
                        {med.genericComposition && (
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            {med.genericComposition}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(med.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inline Dosage / Frequency / Duration Config */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Frequency</span>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedicine(med.id, 'frequency', e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Duration</span>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => handleUpdateMedicine(med.id, 'duration', e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 block mb-0.5">Instructions</span>
                      <input
                        type="text"
                        value={med.instructions}
                        onChange={(e) => handleUpdateMedicine(med.id, 'instructions', e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Advice & Follow Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Clinical Advice & Diet</label>
              <textarea
                rows={2}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Follow-Up Advisory</label>
              <input
                type="text"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                placeholder="e.g. After 7 Days (or SOS)"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions: Download PDF, WhatsApp Dispatch, Save */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Download & Print PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSignAndDispatch}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Digitally Sign & WhatsApp Rx</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
export default PrescriptionCreatorModal;
