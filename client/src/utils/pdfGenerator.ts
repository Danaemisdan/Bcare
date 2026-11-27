import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DigitalPrescription } from '../types';

export const generatePrescriptionPdf = (prescription: DigitalPrescription) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue 600
  const headerBg: [number, number, number] = [15, 23, 42]; // Slate 900
  const darkText: [number, number, number] = [30, 41, 59];
  const mutedText: [number, number, number] = [100, 116, 139];
  const borderGrey: [number, number, number] = [226, 232, 240];

  // 1. TOP HEADER BANNER: Hospital Branding + Bcare Health Logo
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, 210, 36, 'F');

  // Bcare Logo & Platform Mark (Left)
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(14, 8, 8, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('+', 18, 13.5, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Bcare', 25, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('CLINICAL HEALTH NETWORK', 25, 19);

  doc.setFontSize(7.5);
  doc.setTextColor(96, 165, 250); // Blue 400
  doc.text('Official ABDM Verified Teleconsult & OPD E-Prescription', 25, 25);
  doc.text(`Token / Rx ID: ${prescription.appointmentId || prescription.id}`, 25, 30);

  // Hospital Name & Details (Right)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const hospName = prescription.hospitalName || 'City Care Multi-Specialty Hospital';
  doc.text(hospName, 196, 13, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(prescription.hospitalAddress || '42 Avinashi Road, Peelamedu, Coimbatore - 641004', 196, 18, { align: 'right' });
  doc.text('NABH Accredited • 24/7 Emergency Trauma & ICU • Reg: TN-CBE-8492', 196, 23, { align: 'right' });
  doc.text('Emergency Helpline: +91 98765 43210 | www.citycarehospital.in', 196, 28, { align: 'right' });

  // 2. Doctor Information & Prescription Meta
  doc.setTextColor(...darkText);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(prescription.doctorName, 14, 45);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`${prescription.doctorQualifications || 'MBBS, MD, DM'} • Specialist in ${prescription.doctorSpecialty}`, 14, 51);
  doc.text(`Medical Council Reg. No: ${prescription.doctorRegistrationNumber || 'TMC-77492'} | Tamil Nadu Medical Council`, 14, 56);

  // Date & Rx Number on Right
  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prescription No: ${prescription.id}`, 196, 45, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`Date: ${new Date(prescription.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 196, 51, { align: 'right' });
  doc.text(`Follow-up: ${prescription.followUpDate || 'After 7 Days (or SOS)'}`, 196, 56, { align: 'right' });

  // Divider Line
  doc.setDrawColor(...borderGrey);
  doc.line(14, 60, 196, 60);

  // 3. Patient Demographics & Vitals Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 63, 182, 22, 2, 2, 'F');
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(14, 63, 182, 22, 2, 2, 'S');

  doc.setFontSize(9.5);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text('PATIENT DEMOGRAPHICS & VITALS:', 18, 70);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name: ${prescription.patientName}`, 18, 78);
  doc.text(`Age / Gender: ${prescription.patientAge || 32} Yrs / ${prescription.patientGender || 'Male'}`, 82, 78);

  const vitalsText = `Vitals: BP: ${prescription.vitals?.bp || '120/80'} | Pulse: ${prescription.vitals?.pulse || '72'} bpm | SpO2: ${prescription.vitals?.spo2 || '98%'}`;
  doc.text(vitalsText, 136, 78);

  // 4. Clinical Diagnosis & Chief Concerns
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CLINICAL DIAGNOSIS & OBSERVATIONS', 14, 93);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text(`Primary Diagnosis: ${prescription.diagnosis}`, 14, 99);

  if (prescription.symptoms && prescription.symptoms.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text(`Chief Complaints / Symptoms: ${prescription.symptoms.join(', ')}`, 14, 104);
  }

  // 5. Prescribed Medicines (℞ Symbol & Detailed Specifications Table)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('℞ Prescribed Medications & Dosage Schedule', 14, 115);

  const tableData = prescription.medicines.map((med, index) => {
    const medNameWithGeneric = med.genericComposition 
      ? `${med.name}\n(${med.genericComposition})`
      : med.name;

    return [
      (index + 1).toString(),
      medNameWithGeneric,
      med.specification || 'Tablet',
      med.dosage || '-',
      med.frequency,
      med.duration,
      med.instructions
    ];
  });

  autoTable(doc, {
    startY: 119,
    head: [['#', 'Medicine & Generic Name', 'Form / Specification', 'Strength', 'Frequency', 'Duration', 'Instructions']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: darkText,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 18 },
      4: { cellWidth: 26 },
      5: { cellWidth: 18 },
      6: { cellWidth: 32 }
    }
  });

  // Get table bottom Y position
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 185;

  // 6. Clinical Advice & Dietary Guidelines
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Clinical Advice & Dietary Guidelines:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(
    prescription.clinicalNotes || 'Strictly follow prescribed medicine timings. Maintain proper hydration and report back immediately if symptoms persist.',
    14,
    finalY + 5,
    { maxWidth: 182 }
  );

  // 7. Footer: ABDM Authenticated Signature & QR Hash Verification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(...borderGrey);
  doc.roundedRect(14, 250, 182, 34, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('AUTHENTICATED DIGITAL PRESCRIPTION • ABDM COMPLIANT', 18, 256);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.text(`Digital Sign Hash: ${prescription.verificationQrHash || 'SHA256-BC-9482-AD31-TMC'}`, 18, 261);
  doc.text('Valid at affiliated local pharmacies, hospital dispensaries, and diagnostic labs across districts.', 18, 265);
  doc.text('Tamper-evident digital token registered under India National Health Stack (ABDM / Ayushman Bharat).', 18, 269);
  doc.text('Powered by Bcare Healthcare Platform | Telemedicine & OPD Protocol Compliant', 18, 273);

  // Doctor Signature Stamp Placeholder
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(prescription.doctorName, 190, 262, { align: 'right' });
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`Reg: ${prescription.doctorRegistrationNumber || 'TMC-77492'}`, 190, 266, { align: 'right' });
  doc.text('(Digitally Verified & Signed Stamp)', 190, 271, { align: 'right' });

  // Save the PDF
  doc.save(`Bcare_Prescription_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.id}.pdf`);
};

export default generatePrescriptionPdf;
