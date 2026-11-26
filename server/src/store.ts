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
      id: 'user-franchise-hyd',
      phone: '9876543218',
      email: 'ops@apollohealthcity.org',
      name: 'Apollo Hospital Ops (Hyderabad)',
      role: 'FRANCHISE_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150',
      createdAt: '2026-01-09T09:00:00Z'
    },
    {
      id: 'user-doctor-hyd',
      phone: '9876543219',
      email: 'dr.vikram@apollohyderabad.org',
      name: 'Dr. Vikram Reddy',
      role: 'DOCTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
      createdAt: '2026-01-15T09:00:00Z'
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
      heightCm: 174,
      weightKg: 72,
      allergies: ['Penicillin'],
      chronicConditions: ['Type 2 Diabetes', 'Hypertension'],
      emergencyContact: '+91 98450 11223 (Wife - Sunita)',
      languages: ['English', 'Tamil'],
      profileCompletionPct: 60 // Progressive profiling demo
    }]
  ]);

  // Accredited Hospitals with Registered Accounts (Strictly the one active verified hospital)
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
    }
  ];

  // Doctors Directory (Strictly Only Doctors with Registered Signed-up Accounts at hosp-1)
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
      id: 'vid-demo-1',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      patientId: 'patient-vid-1',
      patientName: 'K. Sangeetha',
      patientPhone: '9845022334',
      date: new Date().toISOString().split('T')[0],
      time: '11:15 AM',
      meetingLink: 'https://meet.bcare.health/room/bc-tele-doc-1',
      feePaid: 250,
      status: 'IN_ROOM',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      bookedByNurseId: 'nurse-1',
      nurseId: 'nurse-1'
    },
    {
      id: 'vid-demo-2',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      patientId: 'patient-vid-2',
      patientName: 'V. Muruganathan',
      patientPhone: '9845033445',
      date: new Date().toISOString().split('T')[0],
      time: '11:45 AM',
      meetingLink: 'https://meet.bcare.health/room/bc-tele-doc-1',
      feePaid: 250,
      status: 'SCHEDULED',
      paymentMethod: 'ABDM Ayushman',
      createdAt: new Date().toISOString(),
      bookedByNurseId: 'nurse-1',
      nurseId: 'nurse-1'
    },
    {
      id: 'vid-demo-3',
      doctorId: 'doc-2',
      doctorName: 'Dr. Rajesh Verma, MS (Ortho)',
      doctorSpecialty: 'Orthopedics',
      hospitalName: 'City Care Multi-Specialty Hospital',
      patientId: 'patient-vid-3',
      patientName: 'Radha Krishnamoorthy',
      patientPhone: '9845044556',
      date: new Date().toISOString().split('T')[0],
      time: '10:30 AM',
      meetingLink: 'https://meet.bcare.health/room/bc-tele-doc-2',
      feePaid: 200,
      status: 'COMPLETED',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      bookedByNurseId: 'nurse-1',
      nurseId: 'nurse-1'
    },
    {
      id: 'vid-demo-4',
      doctorId: 'doc-1',
      doctorName: 'Dr. Ananya Sharma, MD, DM',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'City Care Multi-Specialty Hospital',
      patientId: 'patient-vid-4',
      patientName: 'D. Arunkumar',
      patientPhone: '9845055667',
      date: new Date().toISOString().split('T')[0],
      time: '02:00 PM',
      meetingLink: 'https://meet.bcare.health/room/bc-tele-doc-1',
      feePaid: 250,
      status: 'SCHEDULED',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      bookedByNurseId: 'nurse-1',
      nurseId: 'nurse-1'
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

  // Seed initial OP token slots for today & upcoming week across all doctors
  seedTodaySlots() {
    const today = new Date().toISOString().split('T')[0];
    const upcomingDates: string[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      upcomingDates.push(d.toISOString().split('T')[0]);
    }
    // Ensure hardcoded 2026-11-25 through 2026-11-29 are included
    ['2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'].forEach(d => {
      if (!upcomingDates.includes(d)) upcomingDates.push(d);
    });

    const doc1 = this.doctors[0]; // Dr. Ananya Sharma
    const timesDoc1 = [
      '08:30 AM', '08:40 AM', '08:50 AM', '09:00 AM', '09:10 AM',
      '09:20 AM', '09:30 AM', '09:40 AM', '09:50 AM', '10:00 AM',
      '10:10 AM', '10:20 AM', '10:30 AM', '10:40 AM', '10:50 AM',
      '11:00 AM', '11:10 AM', '11:20 AM', '11:30 AM', '11:40 AM',
      '11:50 AM', '12:00 PM', '12:15 PM', '12:30 PM', '12:45 PM',
      '02:00 PM', '02:10 PM', '02:20 PM', '02:30 PM', '02:40 PM',
      '02:50 PM', '03:00 PM', '03:10 PM', '03:20 PM', '03:30 PM',
      '03:40 PM', '03:50 PM', '04:00 PM', '04:10 PM', '04:20 PM',
      '04:30 PM', '04:40 PM', '04:50 PM', '05:00 PM', '05:10 PM',
      '05:20 PM', '05:30 PM', '05:45 PM', '06:00 PM', '06:15 PM'
    ];

    // Standard 20 session times for all doctors
    const standardTimes = [
      '08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM',
      '09:45 AM', '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
      '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM',
      '12:15 PM', '12:30 PM', '12:45 PM', '02:00 PM', '02:15 PM'
    ];

    // Exactly 30 tokens out of 50 are already booked for doc-1 today
    const bookedTokenNumbers = new Set([
      1, 2, 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 24, 25, 26, 27, 29, 30, 31, 33, 34, 36, 40, 44, 48
    ]);

    const samplePatients = [
      { name: 'P. Balakrishnan', phone: '9845045678' },
      { name: 'S. Vijayalakshmi', phone: '9845056789' },
      { name: 'M. Senthil Nathan', phone: '9845067890' },
      { name: 'R. Karpagam', phone: '9845078901' },
      { name: 'V. Murugesan', phone: '9845089012' },
      { name: 'D. Selvaraj', phone: '9845090123' },
      { name: 'A. Thangavelu', phone: '9845012345' },
      { name: 'N. Chitra Devi', phone: '9845023451' },
      { name: 'K. Somasundaram', phone: '9845034562' },
      { name: 'L. Revathi', phone: '9845045673' },
      { name: 'T. Manoharan', phone: '9845056784' },
      { name: 'C. Radhakrishnan', phone: '9845067895' },
      { name: 'S. Kavitha', phone: '9845078906' },
      { name: 'P. Muthusamy', phone: '9845089017' },
      { name: 'J. Ananthi', phone: '9845090128' },
      { name: 'B. Devarajan', phone: '9845012349' },
      { name: 'V. Gomathi', phone: '9845023450' }
    ];

    const allGeneratedSlots: OpSlot[] = [];

    // 1. Doc-1 for Today: 50 slots with backwards compatible IDs slot-1 to slot-50
    const doc1TodaySlots: OpSlot[] = timesDoc1.map((time, idx) => {
      const tokenNumber = idx + 1;
      let status: OpSlot['status'] = 'AVAILABLE';
      let patientId: string | undefined = undefined;
      let patientName: string | undefined = undefined;
      let patientPhone: string | undefined = undefined;
      let bookedByNurseId: string | undefined = undefined;
      let nurseReferralCode: string | undefined = undefined;
      let bulkReservationBatchId: string | undefined = undefined;

      if (tokenNumber === 1) {
        status = 'COMPLETED';
        patientId = 'user-patient-prev';
        patientName = 'G. Subramanian';
        patientPhone = '9845011111';
      } else if (tokenNumber === 2) {
        status = 'IN_CONSULTATION';
        patientName = 'Meenakshi Sundaram';
        patientPhone = '9845023456';
      } else if (tokenNumber === 3) {
        status = 'BOOKED';
        patientId = 'user-patient-1';
        patientName = 'Ramesh Kumar';
        patientPhone = '9876543210';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
      } else if (tokenNumber >= 11 && tokenNumber <= 15) {
        status = 'RESERVED_BULK';
        bookedByNurseId = 'nurse-1';
        nurseReferralCode = 'NURSE-PRIYA-782';
        bulkReservationBatchId = 'BATCH-POLLACHI-VILLAGE-101';
      } else if (bookedTokenNumbers.has(tokenNumber)) {
        status = 'BOOKED';
        const sample = samplePatients[tokenNumber % samplePatients.length];
        patientName = sample.name;
        patientPhone = sample.phone;
        patientId = `patient-walkin-${tokenNumber}`;
      }

      return {
        id: `slot-${tokenNumber}`,
        doctorId: doc1.id,
        doctorName: doc1.name,
        hospitalId: doc1.hospitalId,
        hospitalName: doc1.hospitalName,
        specialty: doc1.specialty,
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
    allGeneratedSlots.push(...doc1TodaySlots);

    // 2. All doctors across upcoming dates (including doc-1 for tomorrow onwards, and doc-2 for all dates)
    for (const doc of this.doctors) {
      for (const dStr of upcomingDates) {
        // Skip doc-1 on today because we already added doc1TodaySlots above
        if (doc.id === doc1.id && dStr === today) continue;

        const isTodayDate = dStr === today;
        const slotsForDate: OpSlot[] = standardTimes.map((time, idx) => {
          const tokenNumber = idx + 1;
          let status: OpSlot['status'] = 'AVAILABLE';
          let patientId: string | undefined = undefined;
          let patientName: string | undefined = undefined;
          let patientPhone: string | undefined = undefined;

          if (isTodayDate) {
            if (tokenNumber === 1) {
              status = 'COMPLETED';
              patientName = 'K. Ramanathan';
              patientPhone = '9845012341';
            } else if (tokenNumber === 2) {
              status = 'IN_CONSULTATION';
              patientName = 'S. Meena';
              patientPhone = '9845012342';
            } else if (tokenNumber === 3) {
              status = 'BOOKED';
              patientName = 'M. Karthik';
              patientPhone = '9845012343';
            }
          } else {
            // Tomorrow and future dates: tokens 1 & 2 booked, tokens 3-20 available
            if (tokenNumber === 1) {
              status = 'BOOKED';
              patientName = 'R. Soundararajan';
              patientPhone = '9845022221';
            } else if (tokenNumber === 2) {
              status = 'BOOKED';
              patientName = 'P. Nithya';
              patientPhone = '9845022222';
            }
          }

          return {
            id: `slot-${doc.id}-${dStr}-${tokenNumber}`,
            doctorId: doc.id,
            doctorName: doc.name,
            hospitalId: doc.hospitalId,
            hospitalName: doc.hospitalName,
            specialty: doc.specialty,
            date: dStr,
            time,
            tokenNumber,
            status,
            patientId,
            patientName,
            patientPhone,
            feePaid: doc.opConsultationFee || 100,
            feeSplit: {
              doctor: this.revenueSplitConfig.doctorFee,
              nurse: 0,
              franchise: this.revenueSplitConfig.franchiseShare,
              platform: this.revenueSplitConfig.platformShare + this.revenueSplitConfig.nurseReferralCommission,
              gst: this.revenueSplitConfig.gstAmount
            }
          };
        });

        allGeneratedSlots.push(...slotsForDate);
      }
    }

    this.opSlots = allGeneratedSlots;
  }
}

export const store = new AppDataStore();
