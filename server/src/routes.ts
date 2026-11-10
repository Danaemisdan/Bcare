import { Router, Request, Response } from 'express';
import { store } from './store.js';
import { v4 as uuidv4 } from 'uuid';
import { 
  AiDiagnosticResult, 
  DigitalPrescription, 
  OpSlot, 
  PatientProfile,
  User,
  UserRole,
  DoctorProfile,
  NurseProfile,
  FranchiseTerritory,
  LoginRequest,
  SignUpRequest,
  AuthResponse
} from './types.js';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'B care API', timestamp: new Date().toISOString() });
});

// Helper to get profile by user and role
function getProfileForUser(user: User) {
  switch (user.role) {
    case 'PATIENT':
      return store.patientProfiles.get(user.id) || {
        userId: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: 30,
        dob: '1995-01-01',
        gender: 'MALE',
        profileCompletionPct: 60
      };
    case 'DOCTOR':
      return store.doctors.find(d => d.userId === user.id) || store.doctors[0];
    case 'NURSE':
      return store.nurses.find(n => n.userId === user.id) || store.nurses[0];
    case 'FRANCHISE_ADMIN':
      return store.franchises[0];
    case 'SUPER_ADMIN':
      return { id: user.id, name: user.name, role: 'SUPER_ADMIN', accessLevel: 'HQ_FULL_GOVERNANCE' };
    default:
      return null;
  }
}

// User List (for role switcher & auth simulation)
router.get('/users', (req: Request, res: Response) => {
  res.json(store.users);
});

// Login Endpoint (Credential, Role-based, or Instant Demo)
router.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password, role, isDemo } = req.body as LoginRequest;

  // 1. Demo One-Tap Login
  if (isDemo && role) {
    const user = store.users.find(u => u.role === role);
    if (!user) {
      return res.status(404).json({ error: `Demo user for role ${role} not found` });
    }
    const token = `bcare_tok_${user.id}_${Date.now()}`;
    const profile = getProfileForUser(user);
    const response: AuthResponse = {
      user,
      token,
      role: user.role,
      profile,
      message: `Logged in as demo ${role.toLowerCase().replace('_', ' ')}`
    };
    return res.json(response);
  }

  // 2. Standard Credential Login
  if (!identifier) {
    return res.status(400).json({ error: 'Phone number or email is required' });
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const user = store.users.find(u => 
    u.phone.replace(/\D/g, '') === cleanIdentifier.replace(/\D/g, '') ||
    u.email.toLowerCase() === cleanIdentifier
  );

  if (!user) {
    return res.status(401).json({ error: 'No account found with this phone number or email' });
  }

  // If a specific role was requested and user doesn't match
  if (role && user.role !== role) {
    return res.status(403).json({ 
      error: `This account is registered as ${user.role}. Please select the correct portal.` 
    });
  }

  const token = `bcare_tok_${user.id}_${Date.now()}`;
  const profile = getProfileForUser(user);

  const response: AuthResponse = {
    user,
    token,
    role: user.role,
    profile,
    message: 'Authentication successful'
  };

  res.json(response);
});

// Sign Up / Registration Endpoint
router.post('/auth/signup', (req: Request, res: Response) => {
  const { 
    name, 
    phone, 
    email, 
    password, 
    role = 'PATIENT',
    age,
    gender,
    bloodGroup,
    abhaId,
    specialty,
    hospitalId,
    registrationNumber,
    referralCode,
    districtId,
    agencyName,
    districtName
  } = req.body as SignUpRequest;

  // Allow self-registration for Patients and Registered Doctors
  if (role && role !== 'PATIENT' && role !== 'DOCTOR') {
    return res.status(403).json({ 
      error: 'Self-registration is permitted for Patients and Doctors. Nurse and franchise administrative accounts must be provisioned by Network Administration.' 
    });
  }

  if (!name || !phone) {
    return res.status(400).json({ error: 'Full name and phone number are required' });
  }

  const cleanPhone = phone.replace(/\D/g, '');
  const existingUser = store.users.find(u => u.phone.replace(/\D/g, '') === cleanPhone);
  if (existingUser) {
    return res.status(409).json({ 
      error: 'An account with this phone number already exists. Please log in.' 
    });
  }

  const userId = `user-${role.toLowerCase().replace('_', '-')}-${Date.now()}`;
  const newUser: User = {
    id: userId,
    phone: cleanPhone,
    email: email?.trim().toLowerCase() || `${cleanPhone}@bcare.in`,
    name: name.trim(),
    role: role as UserRole,
    avatarUrl: role === 'DOCTOR' 
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150' 
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    createdAt: new Date().toISOString()
  };

  store.users.push(newUser);

  // Initialize Role-Specific Profile
  let profile: any = null;

  if (role === 'PATIENT') {
    const patientProfile: PatientProfile = {
      userId,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      age: Number(age) || 32,
      dob: '1994-05-12',
      gender: gender || 'MALE',
      bloodGroup: bloodGroup || undefined,
      languages: (req.body as any).languages || ['English', 'Tamil'],
      profileCompletionPct: bloodGroup ? 75 : 60
    };
    store.patientProfiles.set(userId, patientProfile);
    profile = patientProfile;
  } else if (role === 'DOCTOR') {
    const matchedHosp = store.hospitals.find(h => h.id === hospitalId) || store.hospitals[0];
    const docProfile: DoctorProfile = {
      id: `doc-${Date.now()}`,
      userId,
      name: newUser.name.startsWith('Dr.') ? newUser.name : `Dr. ${newUser.name}`,
      specialty: specialty || 'General Medicine',
      hospitalId: matchedHosp.id,
      hospitalName: matchedHosp.name,
      experienceYears: 8,
      opConsultationFee: 100,
      teleConsultationFee: 200,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      rating: 5.0,
      totalConsultations: 0,
      status: 'ACTIVE',
      distance: matchedHosp.distance || '1.2 km',
      nextAvailableToken: 1,
      roomNumber: '106',
      estimatedWaitMins: 5,
      videoAvailable: true,
      registrationNumber: registrationNumber || 'NMC-TN-88219',
      isAccountVerified: true
    };
    store.doctors.push(docProfile);
    profile = docProfile;

    // Seed slots for this new doctor today
    const today = new Date().toISOString().split('T')[0];
    const newDocTimes = ['10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM', '11:00 AM', '11:15 AM'];
    newDocTimes.forEach((t, i) => {
      store.opSlots.push({
        id: `slot-${docProfile.id}-${i + 1}`,
        doctorId: docProfile.id,
        doctorName: docProfile.name,
        hospitalId: docProfile.hospitalId,
        hospitalName: docProfile.hospitalName,
        specialty: docProfile.specialty,
        date: today,
        time: t,
        tokenNumber: i + 1,
        status: 'AVAILABLE',
        feePaid: 100,
        feeSplit: {
          doctor: store.revenueSplitConfig.doctorFee,
          nurse: 0,
          franchise: store.revenueSplitConfig.franchiseShare,
          platform: store.revenueSplitConfig.platformShare + store.revenueSplitConfig.nurseReferralCommission,
          gst: store.revenueSplitConfig.gstAmount
        }
      });
    });
  } else if (role === 'NURSE') {
    const defaultHosp = store.hospitals[0];
    const nurseCode = referralCode || `NURSE-${newUser.name.slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const nurseProf: NurseProfile = {
      id: `nurse-${Date.now()}`,
      userId,
      name: `Sister ${newUser.name}`,
      phone: newUser.phone,
      referralCode: nurseCode,
      districtId: districtId || 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      affiliatedHospitalId: defaultHosp.id,
      totalReferrals: 0,
      walletBalance: 0,
      totalEarnings: 0
    };
    store.nurses.push(nurseProf);
    profile = nurseProf;
  } else if (role === 'FRANCHISE_ADMIN') {
    const franchiseProf: FranchiseTerritory = {
      id: `franchise-${Date.now()}`,
      districtName: districtName || 'Coimbatore Rural',
      state: 'Tamil Nadu',
      agencyName: agencyName || `${newUser.name} Healthcare Logistics`,
      assignedAdminName: newUser.name,
      annualFranchiseFee: 50000,
      totalHospitals: 1,
      totalNurses: 3,
      monthlyRevenue: 0,
      cashCollectedToday: 0,
      cashDepositedToday: 0,
      pendingReconciliation: 0
    };
    store.franchises.push(franchiseProf);
    profile = franchiseProf;
  } else {
    profile = { id: userId, name: newUser.name, role: 'SUPER_ADMIN' };
  }

  const token = `bcare_tok_${userId}_${Date.now()}`;
  const response: AuthResponse = {
    user: newUser,
    token,
    role: newUser.role,
    profile,
    message: 'Account created successfully'
  };

  res.status(201).json(response);
});

// Check Session / Current User
router.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const userIdQuery = req.query.userId as string;

  let userId: string | null = null;
  if (token && token.startsWith('bcare_tok_')) {
    const parts = token.split('_');
    userId = parts.slice(2, -1).join('_');
  } else if (userIdQuery) {
    userId = userIdQuery;
  }

  if (!userId) {
    return res.status(401).json({ error: 'No active session or authorization token' });
  }

  const user = store.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User session expired or not found' });
  }

  const profile = getProfileForUser(user);
  res.json({
    user,
    role: user.role,
    profile
  });
});

// Logout Endpoint
router.post('/auth/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Quick Patient Onboarding (Legacy support)
router.post('/auth/quick-onboard', (req: Request, res: Response) => {
  const { name, phone, email, dob, age, gender } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required for quick onboarding' });
  }

  const userId = `user-patient-${Date.now()}`;
  const newUser = {
    id: userId,
    phone,
    email: email || '',
    name,
    role: 'PATIENT' as const,
    createdAt: new Date().toISOString()
  };
  store.users.push(newUser);

  const profile: PatientProfile = {
    userId,
    name,
    phone,
    email: email || '',
    age: Number(age) || 30,
    dob: dob || '1995-01-01',
    gender: gender || 'MALE',
    profileCompletionPct: 60 // Non-blocking initial completion
  };
  store.patientProfiles.set(userId, profile);

  res.status(201).json({ user: newUser, profile });
});

// Get Patient Profile (with progressive profiling status)
router.get('/patient/profile/:userId', (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const profile = store.patientProfiles.get(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }
  res.json(profile);
});

// Progressive Profiling: Update Medical History & Details
router.post('/patient/profile-update', (req: Request, res: Response) => {
  const { userId, bloodGroup, allergies, chronicConditions, emergencyContact } = req.body;
  const profile = store.patientProfiles.get(userId);
  if (!profile) {
    return res.status(404).json({ error: 'Patient profile not found' });
  }

  if (bloodGroup) profile.bloodGroup = bloodGroup;
  if (allergies) profile.allergies = Array.isArray(allergies) ? allergies : [allergies];
  if (chronicConditions) profile.chronicConditions = Array.isArray(chronicConditions) ? chronicConditions : [chronicConditions];
  if (emergencyContact) profile.emergencyContact = emergencyContact;

  // Calculate new completion percentage
  let completion = 60;
  if (profile.bloodGroup) completion += 15;
  if (profile.allergies && profile.allergies.length > 0) completion += 10;
  if (profile.chronicConditions && profile.chronicConditions.length > 0) completion += 10;
  if (profile.emergencyContact) completion += 5;

  profile.profileCompletionPct = Math.min(completion, 100);
  store.patientProfiles.set(userId, profile);

  res.json({ message: 'Profile updated successfully', profile });
});

// Hospitals & Specialties (Strictly Only Hospitals with Registered Verified Accounts)
router.get('/hospitals', (req: Request, res: Response) => {
  const { specialty, district } = req.query;

  // Filter to hospitals that have an active registered administrator account
  const validAdminUserIds = new Set(
    store.users.filter(u => u.role === 'FRANCHISE_ADMIN' || u.role === 'SUPER_ADMIN').map(u => u.id)
  );

  let list = store.hospitals.filter(h => h.adminUserId && validAdminUserIds.has(h.adminUserId));

  if (specialty) {
    list = list.filter(h => h.specialties.some(s => s.toLowerCase() === (specialty as string).toLowerCase()));
  }
  if (district) {
    list = list.filter(h => h.districtId === district || h.districtName.toLowerCase().includes((district as string).toLowerCase()));
  }
  res.json(list);
});

// Doctors (Strictly Only Doctors with Registered Signed-up Accounts)
router.get('/doctors', (req: Request, res: Response) => {
  const { hospitalId, specialty } = req.query;

  // Filter to doctors whose userId exists in store.users with DOCTOR role
  const doctorAccounts = new Map(
    store.users.filter(u => u.role === 'DOCTOR').map(u => [u.id, u])
  );

  let list = store.doctors.filter(d => doctorAccounts.has(d.userId));

  if (hospitalId) list = list.filter(d => d.hospitalId === hospitalId);
  if (specialty) list = list.filter(d => d.specialty.toLowerCase() === (specialty as string).toLowerCase());
  res.json(list);
});

// OP Slots for Doctor & Date
router.get('/op/slots', (req: Request, res: Response) => {
  const { doctorId } = req.query;
  let slots = store.opSlots;
  if (doctorId) {
    slots = slots.filter(s => s.doctorId === doctorId);
  }
  res.json(slots);
});

// Book Outpatient (OP) Token (Patient or Nurse-referred)
router.post('/op/book', (req: Request, res: Response) => {
  const { slotId, patientName, patientPhone, patientId, nurseReferralCode } = req.body;
  const slot = store.opSlots.find(s => s.id === slotId);

  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  if (slot.status !== 'AVAILABLE') {
    return res.status(400).json({ error: `Slot is already ${slot.status}` });
  }

  // Check if nurse referral is supplied
  let bookedByNurseId: string | undefined = undefined;
  if (nurseReferralCode) {
    const nurse = store.nurses.find(n => n.referralCode.trim().toUpperCase() === nurseReferralCode.trim().toUpperCase());
    if (nurse) {
      bookedByNurseId = nurse.id;
      nurse.totalReferrals += 1;
      nurse.walletBalance += store.revenueSplitConfig.nurseReferralCommission;
      nurse.totalEarnings += store.revenueSplitConfig.nurseReferralCommission;
    }
  }

  slot.status = 'BOOKED';
  slot.patientId = patientId;
  slot.patientName = patientName;
  slot.patientPhone = patientPhone;
  slot.bookedByNurseId = bookedByNurseId;
  slot.nurseReferralCode = nurseReferralCode;
  slot.bookedAt = new Date().toISOString();

  // Dynamic fee calculation
  slot.feeSplit = {
    doctor: store.revenueSplitConfig.doctorFee,
    nurse: bookedByNurseId ? store.revenueSplitConfig.nurseReferralCommission : 0,
    franchise: store.revenueSplitConfig.franchiseShare,
    platform: bookedByNurseId ? store.revenueSplitConfig.platformShare : (store.revenueSplitConfig.platformShare + store.revenueSplitConfig.nurseReferralCommission),
    gst: store.revenueSplitConfig.gstAmount
  };

  res.json({
    message: 'Token booked successfully!',
    tokenNumber: slot.tokenNumber,
    time: slot.time,
    slot,
    whatsAppNotificationSent: {
      to: patientPhone,
      text: `B care Alert: Your OP Token #${slot.tokenNumber} at ${slot.hospitalName} with ${slot.doctorName} is confirmed for ${slot.time}. Doctor Fee: ₹${slot.feeSplit.doctor}, GST: ₹${slot.feeSplit.gst}. Show this token at reception.`
    }
  });
});

// Cancel OP Token
router.post('/op/cancel', (req: Request, res: Response) => {
  const { slotId } = req.body;
  const slot = store.opSlots.find(s => s.id === slotId);
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }

  slot.status = 'AVAILABLE';
  slot.patientId = undefined;
  slot.patientName = undefined;
  slot.patientPhone = undefined;
  slot.bookedAt = undefined;
  slot.bookedByNurseId = undefined;
  slot.nurseReferralCode = undefined;

  res.json({
    message: 'Token cancelled successfully',
    slot
  });
});

// Nurse Portal: Bulk Slot Reservation (e.g. slots 11–15)
router.post('/nurse/bulk-reserve', (req: Request, res: Response) => {
  const { nurseId, startToken, endToken, doctorId } = req.body;
  const nurse = store.nurses.find(n => n.id === nurseId);
  if (!nurse) {
    return res.status(404).json({ error: 'Nurse not found' });
  }

  const batchId = `BATCH-${Date.now().toString().slice(-6)}`;
  let reservedCount = 0;

  store.opSlots.forEach(slot => {
    if (
      slot.doctorId === doctorId &&
      slot.tokenNumber >= Number(startToken) &&
      slot.tokenNumber <= Number(endToken) &&
      slot.status === 'AVAILABLE'
    ) {
      slot.status = 'RESERVED_BULK';
      slot.bookedByNurseId = nurse.id;
      slot.nurseReferralCode = nurse.referralCode;
      slot.bulkReservationBatchId = batchId;
      reservedCount++;
    }
  });

  res.json({
    message: `Successfully reserved ${reservedCount} slots under batch ${batchId}`,
    batchId,
    reservedCount,
    startToken,
    endToken
  });
});

// Nurse Portal: Assign Bulk-Reserved Slot to Walk-in Patient
router.post('/nurse/assign-bulk-slot', (req: Request, res: Response) => {
  const { slotId, patientName, patientPhone, nurseId } = req.body;
  const slot = store.opSlots.find(s => s.id === slotId);

  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  if (slot.status !== 'RESERVED_BULK') {
    return res.status(400).json({ error: 'This slot is not in bulk reserved state' });
  }

  slot.status = 'BOOKED';
  slot.patientName = patientName;
  slot.patientPhone = patientPhone;
  slot.bookedAt = new Date().toISOString();

  // Credit referral commission to nurse
  const nurse = store.nurses.find(n => n.id === (nurseId || slot.bookedByNurseId));
  if (nurse) {
    nurse.totalReferrals += 1;
    nurse.walletBalance += store.revenueSplitConfig.nurseReferralCommission;
    nurse.totalEarnings += store.revenueSplitConfig.nurseReferralCommission;
  }

  res.json({
    message: `Assigned token #${slot.tokenNumber} to walk-in patient ${patientName}`,
    slot
  });
});

// Nurse Stats & Commission Ledger
router.get('/nurse/stats/:nurseId', (req: Request, res: Response) => {
  const nurse = store.nurses.find(n => n.id === req.params.nurseId);
  if (!nurse) {
    return res.status(404).json({ error: 'Nurse not found' });
  }

  const nurseSlots = store.opSlots.filter(s => s.bookedByNurseId === nurse.id);
  const activeBulkReservations = nurseSlots.filter(s => s.status === 'RESERVED_BULK');
  const bookedSlots = nurseSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED' || s.status === 'IN_CONSULTATION');

  res.json({
    nurse,
    totalBookings: bookedSlots.length,
    activeBulkTokens: activeBulkReservations.length,
    bulkTokensList: activeBulkReservations,
    recentReferrals: bookedSlots.slice(-10)
  });
});

// Doctor Queue & Live Consultation Desk
router.get('/doctor/queue/:doctorId', (req: Request, res: Response) => {
  const doctor = store.doctors.find(d => d.id === req.params.doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const doctorSlots = store.opSlots.filter(s => s.doctorId === doctor.id);
  const currentConsultation = doctorSlots.find(s => s.status === 'IN_CONSULTATION');
  const upcomingQueue = doctorSlots.filter(s => s.status === 'BOOKED');
  const completedToday = doctorSlots.filter(s => s.status === 'COMPLETED');

  const todayEarnings = completedToday.length * store.revenueSplitConfig.doctorFee;

  res.json({
    doctor,
    currentConsultation: currentConsultation || null,
    upcomingQueue,
    completedToday,
    totalTodayConsultations: completedToday.length,
    todayEarnings,
    slots: doctorSlots
  });
});

// Doctor Action: Advance / Call Next Patient
router.post('/doctor/queue/call-next', (req: Request, res: Response) => {
  const { doctorId } = req.body;
  const doctorSlots = store.opSlots.filter(s => s.doctorId === doctorId);

  // Complete current if any
  const current = doctorSlots.find(s => s.status === 'IN_CONSULTATION');
  if (current) {
    current.status = 'COMPLETED';
  }

  // Call next booked
  const nextBooked = doctorSlots.find(s => s.status === 'BOOKED');
  if (nextBooked) {
    nextBooked.status = 'IN_CONSULTATION';
  }

  res.json({
    message: nextBooked ? `Now calling Token #${nextBooked.tokenNumber}` : 'No more waiting patients in queue',
    currentConsultation: nextBooked || null,
    completedToken: current ? current.tokenNumber : null
  });
});

// AI-Assisted Diagnostics Engine (Clinical Differential Diagnosis)
router.post('/ai/diagnose', (req: Request, res: Response) => {
  const { age, gender, symptoms, vitals, medicalHistory } = req.body;

  const symptomText = (Array.isArray(symptoms) ? symptoms.join(' ') : String(symptoms || '')).toLowerCase();

  // Intelligent Clinical Rule-Based Simulation with real medical differential diagnosis
  let diagnoses: AiDiagnosticResult['possibleDiagnoses'] = [];
  let urgency: AiDiagnosticResult['urgencyLevel'] = 'ROUTINE';
  let investigations: string[] = [];
  let precaution = 'Check patient vitals and allergy history before prescribing.';

  if (symptomText.includes('chest') || symptomText.includes('heart') || symptomText.includes('palpitation') || symptomText.includes('breath')) {
    diagnoses = [
      {
        condition: 'Essential Hypertension with Hypertensive Heart Disease',
        probability: 'HIGH',
        icd10Code: 'I11.9',
        rationale: 'Patient presents with exertional discomfort and elevated systemic vascular resistance indicators.'
      },
      {
        condition: 'Angina Pectoris / Stable Coronary Artery Disease',
        probability: 'MODERATE',
        icd10Code: 'I20.9',
        rationale: 'Substernal chest tightness with relation to physical effort.'
      },
      {
        condition: 'Costochondritis / Musculoskeletal Chest Wall Strain',
        probability: 'LOW',
        icd10Code: 'M94.0',
        rationale: 'Palpatory tenderness over parasternal costochondral junctions.'
      },
      {
        condition: 'Gastroesophageal Reflux Disease (GERD) with Pseudoangina',
        probability: 'LOW',
        icd10Code: 'K21.9',
        rationale: 'Acid regurgitation presenting with substernal burn mimicry.'
      }
    ];
    urgency = 'ELEVATED';
    investigations = ['12-Lead Electrocardiogram (ECG)', 'Serum Troponin-I / CK-MB', 'Echocardiogram (2D-Echo)', 'Lipid Profile'];
    precaution = 'Rule out acute coronary syndrome if radiating pain to left arm or diaphoresis develops.';
  } else if (symptomText.includes('sugar') || symptomText.includes('thirst') || symptomText.includes('urine') || symptomText.includes('fatigue')) {
    diagnoses = [
      {
        condition: 'Type 2 Diabetes Mellitus Uncontrolled',
        probability: 'HIGH',
        icd10Code: 'E11.65',
        rationale: 'Osmotic diuresis, polydipsia, and unexplained asthenia.'
      },
      {
        condition: 'Metabolic Syndrome with Insulin Resistance',
        probability: 'MODERATE',
        icd10Code: 'E88.81',
        rationale: 'Co-occurrence of dyslipidemia, central adiposity, and borderline glycemia.'
      },
      {
        condition: 'Diabetic Peripheral Neuropathy (Early)',
        probability: 'LOW',
        icd10Code: 'E11.40',
        rationale: 'Distal symmetrical tingling or burning sensations in lower extremities.'
      },
      {
        condition: 'Primary Hypothyroidism',
        probability: 'LOW',
        icd10Code: 'E03.9',
        rationale: 'Generalized sluggishness, cold sensitivity, and weight gain.'
      }
    ];
    urgency = 'ROUTINE';
    investigations = ['Fasting & Postprandial Blood Glucose', 'HbA1c', 'Serum Creatinine & eGFR', 'Urine Microalbuminuria'];
    precaution = 'Review renal function before initiating or adjusting Metformin dosage.';
  } else {
    diagnoses = [
      {
        condition: 'Acute Viral Upper Respiratory Tract Infection',
        probability: 'HIGH',
        icd10Code: 'J06.9',
        rationale: 'Diffuse respiratory mucosal inflammation with systemic constitutional symptoms.'
      },
      {
        condition: 'Acute Bronchitis',
        probability: 'MODERATE',
        icd10Code: 'J20.9',
        rationale: 'Productive bronchial irritation following prodromal coryza.'
      },
      {
        condition: 'Allergic Rhinitis with Bronchial Hyperresponsiveness',
        probability: 'LOW',
        icd10Code: 'J30.9',
        rationale: 'Atopic history with seasonal exposure exacerbation.'
      },
      {
        condition: 'Mild Bacterial Pharyngitis',
        probability: 'LOW',
        icd10Code: 'J02.9',
        rationale: 'Throat erythema requiring Centor score clinical assessment.'
      }
    ];
    investigations = ['Complete Blood Count (CBC) with ESR', 'CRP Quantitative'];
  }

  const result: AiDiagnosticResult = {
    possibleDiagnoses: diagnoses,
    urgencyLevel: urgency,
    recommendedInvestigations: investigations,
    clinicalPrecaution: precaution
  };

  res.json(result);
});

// Digital Prescription Creation
router.post('/doctor/prescription/create', (req: Request, res: Response) => {
  const { appointmentId, patientId, patientName, patientAge, patientGender, doctorId, doctorName, doctorSpecialty, hospitalName, diagnosis, vitals, symptoms, medicines, clinicalNotes, followUpDate } = req.body;

  const prescriptionId = `RX-${Date.now().toString().slice(-6)}`;
  const newRx: DigitalPrescription = {
    id: prescriptionId,
    appointmentId: appointmentId || `slot-live-${Date.now()}`,
    patientId: patientId || 'user-patient-1',
    patientName: patientName || 'Ramesh Kumar',
    patientAge: Number(patientAge) || 48,
    patientGender: patientGender || 'Male',
    doctorId: doctorId || 'doc-1',
    doctorName: doctorName || 'Dr. Ananya Sharma, MD',
    doctorSpecialty: doctorSpecialty || 'Cardiology',
    hospitalName: hospitalName || 'City Care Multi-Specialty Hospital',
    diagnosis: diagnosis || 'Clinical Consultation',
    vitals: vitals || { bp: '130/85', pulse: '78' },
    symptoms: symptoms || [],
    medicines: medicines || [],
    clinicalNotes: clinicalNotes || 'Continue prescribed doses as directed.',
    followUpDate: followUpDate || 'After 2 weeks',
    issuedAt: new Date().toISOString(),
    verificationQrHash: `VERIF-${prescriptionId}-MEDCONNECT-DIGITAL-SIGN`
  };

  store.prescriptions.unshift(newRx);

  res.status(201).json({
    message: 'Prescription generated and signed successfully',
    prescription: newRx
  });
});

// Get Prescriptions for Patient
router.get('/prescriptions/patient/:patientId', (req: Request, res: Response) => {
  const list = store.prescriptions.filter(p => p.patientId === req.params.patientId);
  res.json(list);
});

// District Franchise Dashboard
router.get('/franchise/dashboard/:franchiseId', (req: Request, res: Response) => {
  const franchise = store.franchises[0]; // Active franchise
  const hospitalsInDistrict = store.hospitals.filter(h => h.districtId.includes('coimbatore'));
  const districtNurses = store.nurses.filter(n => n.districtId.includes('coimbatore'));

  // Calculate district financials
  const districtSlots = store.opSlots;
  const bookedSlots = districtSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED');
  const districtFranchiseEarnings = bookedSlots.length * store.revenueSplitConfig.franchiseShare;

  res.json({
    franchise,
    affiliatedHospitals: hospitalsInDistrict,
    activeNurses: districtNurses,
    totalConsultationsToday: bookedSlots.length,
    districtFranchiseEarnings,
    targetMonthlyRoi: 150000,
    progressTowardsRoi: Math.round((franchise.monthlyRevenue / 150000) * 100),
    cashReconciliation: {
      collected: franchise.cashCollectedToday,
      deposited: franchise.cashDepositedToday,
      pending: franchise.pendingReconciliation
    }
  });
});

// Reconcile Franchise Cash
router.post('/franchise/reconcile-cash', (req: Request, res: Response) => {
  const { amount } = req.body;
  const franchise = store.franchises[0];
  const deposit = Number(amount) || 0;

  franchise.cashDepositedToday += deposit;
  franchise.pendingReconciliation = Math.max(0, franchise.cashCollectedToday - franchise.cashDepositedToday);

  res.json({
    message: `Cash of ₹${deposit} reconciled and bank deposit verified`,
    franchise
  });
});

// Super Admin: Dynamic Revenue Split Configuration
router.get('/admin/revenue-split', (req: Request, res: Response) => {
  res.json(store.revenueSplitConfig);
});

router.post('/admin/revenue-split', (req: Request, res: Response) => {
  const { baseOpFee, doctorFee, nurseReferralCommission, franchiseShare, platformShare, gstAmount } = req.body;

  store.revenueSplitConfig = {
    ...store.revenueSplitConfig,
    baseOpFee: Number(baseOpFee) || store.revenueSplitConfig.baseOpFee,
    doctorFee: Number(doctorFee) || store.revenueSplitConfig.doctorFee,
    nurseReferralCommission: Number(nurseReferralCommission) || store.revenueSplitConfig.nurseReferralCommission,
    franchiseShare: Number(franchiseShare) || store.revenueSplitConfig.franchiseShare,
    platformShare: Number(platformShare) || store.revenueSplitConfig.platformShare,
    gstAmount: Number(gstAmount) || store.revenueSplitConfig.gstAmount
  };

  res.json({
    message: 'Revenue split parameters dynamically updated across all zones',
    config: store.revenueSplitConfig
  });
});

// Super Admin: Global Platform Settings & Panel Controls
router.get('/admin/settings', (req: Request, res: Response) => {
  res.json(store.platformSettings);
});

router.post('/admin/settings', (req: Request, res: Response) => {
  store.platformSettings = {
    ...store.platformSettings,
    ...req.body,
    broadcastBanner: {
      ...store.platformSettings.broadcastBanner,
      ...(req.body.broadcastBanner || {})
    }
  };
  res.json({
    message: 'Platform settings and panel controls updated',
    settings: store.platformSettings
  });
});

// Super Admin: Doctor Directory Management (Edit fees, status, hospital)
router.post('/admin/doctors', (req: Request, res: Response) => {
  const newDoc = {
    id: `doc-${Date.now()}`,
    userId: `user-doc-${Date.now()}`,
    name: req.body.name || 'Dr. New Specialist',
    specialty: req.body.specialty || 'General Medicine',
    hospitalId: req.body.hospitalId || 'hosp-1',
    hospitalName: req.body.hospitalName || 'City Care Multi-Specialty Hospital',
    experienceYears: Number(req.body.experienceYears) || 5,
    opConsultationFee: Number(req.body.opConsultationFee) || 100,
    teleConsultationFee: Number(req.body.teleConsultationFee) || 200,
    availableDays: req.body.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    rating: 4.8,
    totalConsultations: 0,
    status: req.body.status || 'ACTIVE',
    distance: req.body.distance || '1.5 km',
    videoAvailable: req.body.videoAvailable ?? true
  };
  store.doctors.push(newDoc);
  res.status(201).json(newDoc);
});

router.put('/admin/doctors/:id', (req: Request, res: Response) => {
  const doc = store.doctors.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  Object.assign(doc, req.body);
  res.json({ message: 'Doctor profile and fees updated', doctor: doc });
});

// Super Admin: Hospital Directory Management
router.post('/admin/hospitals', (req: Request, res: Response) => {
  const newHosp = {
    id: `hosp-${Date.now()}`,
    name: req.body.name,
    districtId: req.body.districtId || 'dist-coimbatore-south',
    districtName: req.body.districtName || 'Coimbatore South',
    address: req.body.address || 'District Road, Coimbatore',
    rating: 4.5,
    specialties: req.body.specialties || ['General Medicine'],
    baseOpFee: Number(req.body.baseOpFee) || 100,
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
    emergencyAvailable: req.body.emergencyAvailable ?? true,
    distance: req.body.distance || '2.0 km',
    activeDoctorsCount: 5
  };
  store.hospitals.push(newHosp);
  res.status(201).json(newHosp);
});

router.put('/admin/hospitals/:id', (req: Request, res: Response) => {
  const hosp = store.hospitals.find(h => h.id === req.params.id);
  if (!hosp) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  Object.assign(hosp, req.body);
  res.json({ message: 'Hospital details updated', hospital: hosp });
});

// Telehealth: Video Consultations
router.get('/telehealth/appointments', (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;
  let list = store.videoAppointments;
  if (patientId) list = list.filter(v => v.patientId === patientId);
  if (doctorId) list = list.filter(v => v.doctorId === doctorId);
  res.json(list);
});

router.post('/telehealth/book', (req: Request, res: Response) => {
  const {
    doctorId,
    patientId,
    patientName,
    patientPhone,
    date,
    time,
    paymentMethod,
    feePaid
  } = req.body;

  const doc = store.doctors.find(d => d.id === doctorId);
  if (!doc) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  const newAppointment = {
    id: `vid-${Date.now()}`,
    doctorId: doc.id,
    doctorName: doc.name,
    doctorSpecialty: doc.specialty,
    hospitalName: doc.hospitalName,
    patientId: patientId || 'user-patient-1',
    patientName: patientName || 'Ramesh Kumar',
    patientPhone: patientPhone || '9876543210',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '11:00 AM',
    meetingLink: `https://meet.bcare.health/room/bc-vid-${doc.id.slice(-4)}-${Date.now().toString().slice(-4)}`,
    feePaid: Number(feePaid) || doc.teleConsultationFee,
    status: 'SCHEDULED' as const,
    paymentMethod: paymentMethod || 'UPI',
    createdAt: new Date().toISOString()
  };

  store.videoAppointments.unshift(newAppointment);

  res.status(201).json({
    message: 'HD Video Consultation scheduled successfully!',
    appointment: newAppointment,
    whatsAppNotificationSent: {
      to: newAppointment.patientPhone,
      text: `B care Video Teleconsult Confirmed with ${doc.name} (${doc.specialty}) for ${newAppointment.time} on ${newAppointment.date}. Room Link: ${newAppointment.meetingLink}. Fee Paid: ₹${newAppointment.feePaid} via ${newAppointment.paymentMethod}.`
    }
  });
});

// Super Admin: Global Ledger & Financial Transparency Audit
router.get('/admin/ledger', (req: Request, res: Response) => {
  const allBooked = store.opSlots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED');
  
  const totalVolume = allBooked.reduce((acc, s) => acc + s.feePaid, 0);
  const totalDoctorPayout = allBooked.reduce((acc, s) => acc + s.feeSplit.doctor, 0);
  const totalNurseCommission = allBooked.reduce((acc, s) => acc + s.feeSplit.nurse, 0);
  const totalFranchisePayout = allBooked.reduce((acc, s) => acc + s.feeSplit.franchise, 0);
  const totalPlatformGross = allBooked.reduce((acc, s) => acc + s.feeSplit.platform, 0);
  const totalGstCollected = allBooked.reduce((acc, s) => acc + s.feeSplit.gst, 0);

  res.json({
    summary: {
      totalBookedTokens: allBooked.length,
      totalVolume,
      totalDoctorPayout,
      totalNurseCommission,
      totalFranchisePayout,
      totalPlatformGross,
      totalGstCollected
    },
    splitConfig: store.revenueSplitConfig,
    recentTransactions: allBooked
  });
});

// Community Health Boards
router.get('/community/posts', (req: Request, res: Response) => {
  const { category } = req.query;
  let posts = store.communityPosts;
  if (category && category !== 'All') {
    posts = posts.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  res.json(posts);
});

router.post('/community/posts', (req: Request, res: Response) => {
  const { category, title, content, authorName, authorRole, authorId } = req.body;
  const newPost = {
    id: `post-${Date.now()}`,
    category: category || 'General Health',
    title,
    content,
    authorId: authorId || 'user-patient-1',
    authorName: authorName || 'Anonymous Patient',
    authorRole: authorRole || 'PATIENT',
    upvotes: 1,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    comments: []
  };

  store.communityPosts.unshift(newPost);
  res.status(201).json(newPost);
});

router.post('/community/posts/:id/comments', (req: Request, res: Response) => {
  const { authorName, authorRole, content } = req.body;
  const post = store.communityPosts.find(p => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const newComment = {
    id: `c-${Date.now()}`,
    authorName: authorName || 'Healthcare Member',
    authorRole: authorRole || 'PATIENT',
    content,
    createdAt: new Date().toISOString()
  };

  if (!post.comments) post.comments = [];
  post.comments.push(newComment);
  post.commentCount += 1;

  res.status(201).json(newComment);
});

export default router;
