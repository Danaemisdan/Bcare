export type UserRole = 'PATIENT' | 'DOCTOR' | 'NURSE' | 'FRANCHISE_ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface PatientProfile {
  userId: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContact?: string;
  languages?: string[];
  profileCompletionPct: number;
}

export interface Hospital {
  id: string;
  name: string;
  districtId: string;
  districtName: string;
  address: string;
  rating: number;
  specialties: string[];
  baseOpFee: number;
  imageUrl?: string;
  emergencyAvailable?: boolean;
  distance?: string;
  activeDoctorsCount?: number;
  latitude?: number;
  longitude?: number;
  phone?: string;
  emergencyPhone?: string;
  googleMapsUrl?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  experienceYears: number;
  opConsultationFee: number;
  teleConsultationFee: number;
  availableDays: string[];
  rating: number;
  totalConsultations: number;
  status?: 'ACTIVE' | 'ON_LEAVE' | 'OFFLINE';
  distance?: string;
  nextAvailableToken?: number;
  estimatedWaitMins?: number;
  videoAvailable?: boolean;
  roomNumber?: string;
}

export interface NurseProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  referralCode: string;
  districtId: string;
  districtName: string;
  affiliatedHospitalId: string;
  totalReferrals: number;
  walletBalance: number;
  totalEarnings: number;
}

export interface FranchiseTerritory {
  id: string;
  districtName: string;
  state: string;
  agencyName: string;
  assignedAdminName: string;
  annualFranchiseFee: number;
  totalHospitals: number;
  totalNurses: number;
  monthlyRevenue: number;
  cashCollectedToday: number;
  cashDepositedToday: number;
  pendingReconciliation: number;
}

export interface RevenueSplitConfig {
  id: string;
  tierName: string;
  baseOpFee: number;
  doctorFee: number;
  nurseReferralCommission: number;
  franchiseShare: number;
  platformShare: number;
  gstAmount: number;
}

export type SlotStatus = 'AVAILABLE' | 'RESERVED_BULK' | 'BOOKED' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';

export interface OpSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  specialty: string;
  date: string;
  time: string;
  tokenNumber: number;
  status: SlotStatus;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  bookedByNurseId?: string;
  nurseReferralCode?: string;
  bulkReservationBatchId?: string;
  bookedAt?: string;
  feePaid: number;
  feeSplit: {
    doctor: number;
    nurse: number;
    franchise: number;
    platform: number;
    gst: number;
  };
}

export interface PrescriptionMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DigitalPrescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  diagnosis: string;
  vitals: {
    bp?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
  };
  symptoms: string[];
  medicines: PrescriptionMedicine[];
  clinicalNotes: string;
  followUpDate?: string;
  issuedAt: string;
  verificationQrHash: string;
}

export interface AiDiagnosticResult {
  possibleDiagnoses: {
    condition: string;
    probability: 'HIGH' | 'MODERATE' | 'LOW';
    icd10Code: string;
    rationale: string;
  }[];
  urgencyLevel: 'ROUTINE' | 'ELEVATED' | 'EMERGENT';
  recommendedInvestigations: string[];
  clinicalPrecaution: string;
}

export interface CommunityPost {
  id: string;
  category: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  upvotes: number;
  commentCount: number;
  createdAt: string;
  comments?: {
    id: string;
    authorName: string;
    authorRole: UserRole;
    content: string;
    createdAt: string;
  }[];
}

export interface LoginRequest {
  identifier: string; // phone or email
  password?: string;
  role?: UserRole;
  isDemo?: boolean;
}

export interface SignUpRequest {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: UserRole;
  // Patient specific
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  abhaId?: string;
  // Doctor specific
  specialty?: string;
  hospitalId?: string;
  registrationNumber?: string;
  // Nurse specific
  referralCode?: string;
  districtId?: string;
  // Franchise specific
  agencyName?: string;
  districtName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  role: UserRole;
  profile?: any;
  message?: string;
}

export interface PlatformSettings {
  videoConsultationsEnabled: boolean;
  inPersonBookingEnabled: boolean;
  nurseBulkReservationEnabled: boolean;
  franchiseCashDeskEnabled: boolean;
  communityBoardActive: boolean;
  emergencySosActive: boolean;
  emergencyNumber: string;
  broadcastBanner: {
    enabled: boolean;
    type: 'INFO' | 'WARNING' | 'ALERT';
    text: string;
  };
}

export interface VideoAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  meetingLink: string;
  feePaid: number;
  status: 'SCHEDULED' | 'IN_ROOM' | 'COMPLETED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
}
