import { 
  User, 
  PatientProfile, 
  DoctorProfile, 
  NurseProfile, 
  FranchiseTerritory, 
  Hospital, 
  OpSlot, 
  RevenueSplitConfig, 
  DigitalPrescription, 
  CommunityPost,
  PlatformSettings,
  VideoAppointment
} from './types.js';

export class AppDataStore {
  // Users
  users: User[] = [
    {
      id: 'user-patient-1',
      phone: '9876543210',
      email: 'ramesh.kumar@example.com',
      name: 'Ramesh Kumar',
      role: 'PATIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: '2026-01-15T09:00:00Z'
    },
    {
      id: 'user-doctor-1',
      phone: '9876543211',
      email: 'dr.ananya@apexheart.com',
      name: 'Dr. Ananya Sharma',
      role: 'DOCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1594824813580-e83cb49f3e46?w=150',
      createdAt: '2026-01-10T09:00:00Z'
    },
    {
      id: 'user-doctor-2',
      phone: '9876543215',
      email: 'dr.rajesh@apexhealth.com',
      name: 'Dr. Rajesh Verma',
      role: 'DOCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      createdAt: '2026-01-18T09:00:00Z'
    },
    {
      id: 'user-doctor-3',
      phone: '9876543216',
      email: 'dr.meera@kovairesearch.org',
      name: 'Dr. Meera Swaminathan',
      role: 'DOCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      createdAt: '2026-01-20T09:00:00Z'
    },
    {
      id: 'user-nurse-1',
      phone: '9876543212',
      email: 'nurse.priya@districtclinic.org',
      name: 'Priya Nair',
      role: 'NURSE',
      avatarUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=150',
      createdAt: '2026-01-12T09:00:00Z'
    },
    {
      id: 'user-franchise-1',
      phone: '9876543213',
      email: 'franchise.admin@apexcoimbatore.com',
      name: 'Vikas Patel (Apex Healthcare Ops)',
      role: 'FRANCHISE_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: '2026-01-05T09:00:00Z'
    },
    {
      id: 'user-franchise-2',
      phone: '9876543217',
      email: 'admin@kovaicentre.org',
      name: 'Kovai Trust Hospital Operations',
      role: 'FRANCHISE_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150',
      createdAt: '2026-01-08T09:00:00Z'
    },
    {
      id: 'user-admin-1',
      phone: '9876543214',
      email: 'admin@bcare.in',
      name: 'Chief Admin (HQ)',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      createdAt: '2025-12-01T09:00:00Z'
    }
  ];

  // Patient Profiles
  patientProfiles: Map<string, PatientProfile> = new Map([
    ['user-patient-1', {
      userId: 'user-patient-1',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      email: 'ramesh.kumar@example.com',
      age: 48,
      dob: '1978-06-14',
      gender: 'MALE',
      bloodGroup: 'B+',
      allergies: ['Penicillin'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      emergencyContact: '+91 98450 11223 (Wife - Sunita)',
      languages: ['English', 'Tamil'],
      profileCompletionPct: 60 // Progressive profiling demo
    }]
  ]);

  // Accredited Hospitals with Registered Accounts
  hospitals: Hospital[] = [
    {
      id: 'hosp-1',
      name: 'City Care Multi-Specialty Hospital',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      address: '42 Avinashi Road, Peelamedu, Coimbatore',
      rating: 4.8,
      specialties: ['Cardiology', 'Orthopedics', 'General Medicine'],
      baseOpFee: 100,
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
      emergencyAvailable: true,
      distance: '1.2 km',
      activeDoctorsCount: 2,
      adminUserId: 'user-franchise-1',
      isAccountVerified: true,
      latitude: 11.0267,
      longitude: 77.0089,
      phone: '+91 422 257 0108',
      emergencyPhone: '108',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=11.0267,77.0089'
    },
    {
      id: 'hosp-2',
      name: 'Kovai Medical & Research Centre',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      address: '15 Trichy Road, Singanallur, Coimbatore',
      rating: 4.6,
      specialties: ['Neurology', 'General Medicine'],
      baseOpFee: 100,
      imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
      emergencyAvailable: true,
      distance: '2.8 km',
      activeDoctorsCount: 1,
      adminUserId: 'user-franchise-2',
      isAccountVerified: true,
      latitude: 11.0016,
      longitude: 77.0253,
      phone: '+91 422 268 0100',
      emergencyPhone: '108',
      googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=11.0016,77.0253'
    }
  ];

  // Doctors Directory (Strictly Only Doctors with Registered Signed-up Accounts)
  doctors: DoctorProfile[] = [
    {
      id: 'doc-1',
      userId: 'user-doctor-1',
      name: 'Dr. Ananya Sharma, MD, DM',
      specialty: 'Cardiology',
      hospitalId: 'hosp-1',
      hospitalName: 'City Care Multi-Specialty Hospital',
      experienceYears: 14,
      opConsultationFee: 100,
      teleConsultationFee: 250,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      rating: 4.9,
      totalConsultations: 1420,
      status: 'ACTIVE',
      distance: '1.2 km',
      nextAvailableToken: 5,
      roomNumber: '204',
      estimatedWaitMins: 12,
      videoAvailable: true,
      registrationNumber: 'TMC-77492',
      isAccountVerified: true
    },
    {
      id: 'doc-2',
      userId: 'user-doctor-2',
      name: 'Dr. Rajesh Verma, MS (Ortho)',
      specialty: 'Orthopedics',
      hospitalId: 'hosp-1',
      hospitalName: 'City Care Multi-Specialty Hospital',
      experienceYears: 11,
      opConsultationFee: 100,
      teleConsultationFee: 200,
      availableDays: ['Mon', 'Wed', 'Fri'],
      rating: 4.7,
      totalConsultations: 980,
      status: 'ACTIVE',
      distance: '1.2 km',
      nextAvailableToken: 3,
      roomNumber: '108',
      estimatedWaitMins: 8,
      videoAvailable: true,
      registrationNumber: 'TMC-66291',
      isAccountVerified: true
    },
    {
      id: 'doc-3',
      userId: 'user-doctor-3',
      name: 'Dr. Meera Swaminathan, MD',
      specialty: 'Neurology',
      hospitalId: 'hosp-2',
      hospitalName: 'Kovai Medical & Research Centre',
      experienceYears: 16,
      opConsultationFee: 120,
      teleConsultationFee: 300,
      availableDays: ['Tue', 'Thu', 'Sat'],
      rating: 4.95,
      totalConsultations: 2100,
      status: 'ACTIVE',
      distance: '2.8 km',
      nextAvailableToken: 4,
      roomNumber: '302',
      estimatedWaitMins: 15,
      videoAvailable: true,
      registrationNumber: 'TMC-88102',
      isAccountVerified: true
    }
  ];

  // Nurses
  nurses: NurseProfile[] = [
    {
      id: 'nurse-1',
      userId: 'user-nurse-1',
      name: 'Sister Priya Nair',
      phone: '9876543212',
      referralCode: 'NURSE-PRIYA-782',
      districtId: 'dist-coimbatore-south',
      districtName: 'Coimbatore South',
      affiliatedHospitalId: 'hosp-1',
      totalReferrals: 138,
      walletBalance: 2070, // 138 * ₹15
      totalEarnings: 6450
    }
  ];

  // Franchises
  franchises: FranchiseTerritory[] = [
    {
      id: 'franchise-1',
      districtName: 'Coimbatore South & Rural',
      state: 'Tamil Nadu',
      agencyName: 'Apex Health District Franchise Agency',
      assignedAdminName: 'Vikas Patel',
      annualFranchiseFee: 50000,
      totalHospitals: 3,
      totalNurses: 18,
      monthlyRevenue: 148500, // Matching projected ₹1,00,000 - ₹2,00,000 ROI
      cashCollectedToday: 4500,
      cashDepositedToday: 4000,
      pendingReconciliation: 500
    }
  ];

  // Dynamic Revenue Split Configuration
  revenueSplitConfig: RevenueSplitConfig = {
    id: 'split-default-v1',
    tierName: 'Standard District Outpatient Split',
    baseOpFee: 100,
    doctorFee: 50,
    nurseReferralCommission: 15,
    franchiseShare: 10,
    platformShare: 20,
    gstAmount: 5
  };

  // Platform Feature Settings & Panel Controls
  platformSettings: PlatformSettings = {
    videoConsultationsEnabled: true,
    inPersonBookingEnabled: true,
    nurseBulkReservationEnabled: true,
    franchiseCashDeskEnabled: true,
    communityBoardActive: true,
    emergencySosActive: true,
    emergencyNumber: '108 / +91-98420-10800',
    broadcastBanner: {
      enabled: true,
      type: 'INFO',
      text: 'Specialist Cardiology, Orthopedic & Neurology Tokens available for today • ABDM Ayushman discounts applied'
    }
  };

  // Telehealth / Video Consultations
  videoAppointments: VideoAppointment[] = [
    {
      id: 'vid-apt-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      patientId: 'user-patient-1',
      patientName: 'Ramesh Kumar',
      patientPhone: '9876543210',
      date: new Date().toISOString().split('T')[0],
      time: '11:30 AM',
      meetingLink: 'https://meet.bcare.health/room/bc-vid-doc1-rk',
      feePaid: 250,
      status: 'SCHEDULED',
      paymentMethod: 'UPI',
      createdAt: '2026-11-03T09:00:00Z'
    }
  ];

  // OP Slots / Tokens for Today
  opSlots: OpSlot[] = [];

  // Prescriptions
  prescriptions: DigitalPrescription[] = [
    {
      id: 'rx-2026-001',
      appointmentId: 'slot-sample-1',
      patientId: 'user-patient-1',
      patientName: 'Ramesh Kumar',
      patientAge: 48,
      patientGender: 'Male',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      diagnosis: 'Essential Hypertension Stage 1 with Mild Exertional Tachycardia',
      vitals: {
        bp: '142/92 mmHg',
        pulse: '84 bpm',
        temperature: '98.4 F',
        spo2: '98%'
      },
      symptoms: ['Occasional morning headaches', 'Mild chest tightness upon climbing stairs'],
      medicines: [
        {
          id: 'med-1',
          name: 'Telmisartan 40mg',
          dosage: '1 tablet',
          frequency: '1-0-0 (Morning)',
          duration: '30 days',
          instructions: 'Take after breakfast'
        },
        {
          id: 'med-2',
          name: 'Metoprolol Succinate 25mg ER',
          dosage: '1 tablet',
          frequency: '0-0-1 (Night)',
          duration: '30 days',
          instructions: 'Take after dinner'
        }
      ],
      clinicalNotes: 'Maintain low sodium diet (<2g/day). 30 mins brisk walking. Review BP weekly.',
      followUpDate: '2026-11-30',
      issuedAt: '2026-10-28T11:45:00Z',
      verificationQrHash: 'VERIF-RX-2026-001-MEDCONNECT-AUTH'
    }
  ];

  // Community Forum
  communityPosts: CommunityPost[] = [
    {
      id: 'post-1',
      category: 'Cardiology',
      title: 'Managing Blood Pressure Naturally Along with Prescribed Medications',
      content: 'I was diagnosed with borderline hypertension 3 months ago. Regular morning walks and cutting out processed pickles helped bring systolic down by 8 points alongside my doctor\'s medication. What dietary habits worked for you?',
      authorId: 'user-patient-1',
      authorName: 'Ramesh Kumar',
      authorRole: 'PATIENT',
      upvotes: 24,
      commentCount: 3,
      createdAt: '2026-10-25T14:30:00Z',
      comments: [
        {
          id: 'c-1',
          authorName: 'Dr. Ananya Sharma',
          authorRole: 'DOCTOR',
          content: 'Excellent progress Ramesh! Potassium-rich foods like bananas, spinach, and coconut water also support vascular health, provided renal function is normal.',
          createdAt: '2026-10-25T16:00:00Z'
        },
        {
          id: 'c-2',
          authorName: 'Sister Priya Nair',
          authorRole: 'NURSE',
          content: 'Remember to check BP at resting state after sitting quietly for at least 5 minutes before recording.',
          createdAt: '2026-10-26T09:15:00Z'
        }
      ]
    },
    {
      id: 'post-2',
      category: 'Diabetes & Nutrition',
      title: 'Continuous Glucose Monitoring in Rural Camps: Observations and Insights',
      content: 'We ran a screening camp across 4 villages yesterday. Over 35% of people aged 45+ were unaware of elevated postprandial glucose. Early OP consultation tokens saved valuable travel time for them.',
      authorId: 'user-nurse-1',
      authorName: 'Sister Priya Nair',
      authorRole: 'NURSE',
      upvotes: 45,
      commentCount: 5,
      createdAt: '2026-10-28T10:15:00Z'
    }
  ];

  constructor() {
    this.seedTodaySlots();
  }

  // Seed initial OP token slots for today
  seedTodaySlots() {
    const today = new Date().toISOString().split('T')[0];
    const doc = this.doctors[0]; // Dr. Ananya Sharma
    const times = [
      '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
      '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
      '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
      '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
      '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
      '03:00 PM', '03:15 PM', '03:30 PM', '03:45 PM',
      '04:00 PM'
    ];

    this.opSlots = times.map((time, idx) => {
      const tokenNumber = idx + 1;
      let status: OpSlot['status'] = 'AVAILABLE';
      let patientId: string | undefined = undefined;
      let patientName: string | undefined = undefined;
      let patientPhone: string | undefined = undefined;
      let bookedByNurseId: string | undefined = undefined;
      let nurseReferralCode: string | undefined = undefined;
      let bulkReservationBatchId: string | undefined = undefined;

      // Token 1: Completed consultation earlier this morning for Ramesh Kumar
      if (tokenNumber === 1) {
        status = 'COMPLETED';
        patientId = 'user-patient-1';
        patientName = 'Ramesh Kumar';
        patientPhone = '9876543210';
      } 
      // Token 2: In Consultation right now
      else if (tokenNumber === 2) {
        status = 'IN_CONSULTATION';
        patientName = 'Meenakshi Sundaram';
        patientPhone = '9845023456';
      }
      // Token 3: Booked via Nurse Priya referral
      else if (tokenNumber === 3) {
        status = 'BOOKED';
        patientName = 'K. Arumugam';
        patientPhone = '9845034567';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
      }
      // Token 4: Active live token pass for Ramesh Kumar!
      else if (tokenNumber === 4) {
        status = 'BOOKED';
        patientId = 'user-patient-1';
        patientName = 'Ramesh Kumar';
        patientPhone = '9876543210';
      }
      // Tokens 11 to 15: Reserved in BULK by Nurse Priya for rural/walk-in patients!
      else if (tokenNumber >= 11 && tokenNumber <= 15) {
        status = 'RESERVED_BULK';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
        bulkReservationBatchId = 'BATCH-POLLACHI-VILLAGE-101';
      }

      return {
        id: `slot-${tokenNumber}`,
        doctorId: doc.id,
        doctorName: doc.name,
        hospitalId: doc.hospitalId,
        hospitalName: doc.hospitalName,
        specialty: doc.specialty,
        date: today,
        time,
        tokenNumber,
        status,
        patientId,
        patientName,
        patientPhone,
        bookedByNurseId,
        nurseReferralCode,
        bulkReservationBatchId,
        feePaid: 100,
        feeSplit: {
          doctor: this.revenueSplitConfig.doctorFee,
          nurse: bookedByNurseId ? this.revenueSplitConfig.nurseReferralCommission : 0,
          franchise: this.revenueSplitConfig.franchiseShare,
          platform: bookedByNurseId ? this.revenueSplitConfig.platformShare : (this.revenueSplitConfig.platformShare + this.revenueSplitConfig.nurseReferralCommission),
          gst: this.revenueSplitConfig.gstAmount
        }
      };
    });
  }
}

export const store = new AppDataStore();
