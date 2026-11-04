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
  const primaryColor: [number, number, number] = [5, 150, 105]; // #059669
  const darkText: [number, number, number] = [30, 41, 59];
  const mutedText: [number, number, number] = [100, 116, 139];

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('B care Healthcare', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Digital Outpatient & Telehealth Platform | District Health Network', 14, 22);
  doc.text(`Official Rx Token ID: ${prescription.appointmentId}`, 14, 27);

  // Hospital Name on Right
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(prescription.hospitalName, 196, 16, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Clinical Facility', 196, 23, { align: 'right' });

  // 2. Doctor Information
  doc.setTextColor(...darkText);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(prescription.doctorName, 14, 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`Specialist in ${prescription.doctorSpecialty}`, 14, 48);
  doc.text(`Reg. Medical Practitioner | Tamil Nadu Medical Council`, 14, 53);

  // Date & Rx Number on Right
  doc.setTextColor(...darkText);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prescription No: ${prescription.id}`, 196, 42, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(`Date of Issue: ${new Date(prescription.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, 196, 48, { align: 'right' });
  doc.text(`Follow-up Date: ${prescription.followUpDate || 'After 2 weeks'}`, 196, 53, { align: 'right' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 57, 196, 57);

  // 3. Patient Details Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 61, 182, 22, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(...darkText);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information:', 18, 68);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${prescription.patientName}`, 18, 76);
  doc.text(`Age / Gender: ${prescription.patientAge} Yrs / ${prescription.patientGender}`, 80, 76);
  
  const vitalsText = `Vitals: BP: ${prescription.vitals.bp || '120/80'} | Pulse: ${prescription.vitals.pulse || '72'} bpm`;
  doc.text(vitalsText, 140, 76);

  // 4. Clinical Diagnosis & Chief Symptoms
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Clinical Diagnosis & Observations', 14, 91);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text(`Diagnosis: ${prescription.diagnosis}`, 14, 98);

  if (prescription.symptoms && prescription.symptoms.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedText);
    doc.text(`Reported Symptoms: ${prescription.symptoms.join(', ')}`, 14, 104);
  }

  // 5. Prescribed Medicines (Rx Symbol & Table)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('℞ Prescribed Medicines', 14, 116);

  const tableData = prescription.medicines.map((med, index) => [
    (index + 1).toString(),
    med.name,
    med.dosage,
    med.frequency,
    med.duration,
    med.instructions
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['#', 'Medicine Name', 'Strength', 'Frequency', 'Duration', 'Instructions']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: darkText
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25 },
      5: { cellWidth: 37 }
    }
  });

  // Get table bottom Y position
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 180;

  // 6. Clinical Advice & Notes
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkText);
  doc.text('Clinical Advice & Dietary Guidelines:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text(prescription.clinicalNotes || 'Adhere strictly to prescribed medicine timings. Contact clinic immediately if symptoms worsen.', 14, finalY + 6, {
    maxWidth: 182
  });

  // 7. Footer: Digital Signature & Verification Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, 250, 182, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('AUTHENTICATED DIGITAL PRESCRIPTION • ABDM COMPLIANT', 18, 257);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);
  doc.text(`Digital Sign Hash: ${prescription.verificationQrHash}`, 18, 263);
  doc.text('Accepted at affiliated local pharmacies, franchise dispensaries, and diagnostic centers across districts.', 18, 268);
  doc.text(`Generated on B care Cloud Platform | Telemedicine & OPD Protocol Compliant`, 18, 273);

  // Doctor Signature Stamp Placeholder
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(prescription.doctorName, 190, 262, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedText);
  doc.text('(Digitally Verified & Signed)', 190, 267, { align: 'right' });

  // Save the PDF
  doc.save(`B_care_Rx_${prescription.patientName.replace(/\s+/g, '_')}_${prescription.id}.pdf`);
};
