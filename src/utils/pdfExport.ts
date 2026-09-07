import { jsPDF } from 'jspdf';
import { VetDiagnosisResponse, SupportedLanguage } from '../types';

export function downloadClinicalReportPdf(
  diagnosis: VetDiagnosisResponse,
  options?: {
    docketNumber?: string;
    animalType?: string;
    currentLang?: SupportedLanguage;
    symptomsText?: string;
  }
) {
  const docketNumber =
    options?.docketNumber ||
    `VET-BRM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = 14;

  // Header Banner
  doc.setFillColor(6, 78, 59); // Emerald 800
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('VET-MITRA AI - CLINICAL TRIAGE & PRESCRIPTION DOCKET', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'Taluka Veterinary Polyclinic & 1962 Mobile Veterinary Unit Telemedicine System',
    margin + 6,
    y + 16
  );
  doc.text(
    'Animal Husbandry & Dairy Development Emergency Response Network',
    margin + 6,
    y + 21
  );

  y += 28;

  // Docket metadata box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`DOCKET NO: ${docketNumber}`, margin + 5, y + 6);
  doc.text(`DATE: ${new Date().toLocaleDateString('en-IN')}`, margin + 5, y + 12);

  doc.text(`HELPLINE: 1962 (24x7 TOLL-FREE)`, margin + 95, y + 6);
  doc.text(`TIME: ${new Date().toLocaleTimeString('en-IN')}`, margin + 95, y + 12);

  y += 20;

  // Subject and Urgency Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('IDENTIFIED SUBJECT', margin + 5, y + 5.5);
  doc.text('URGENCY STATUS', margin + 68, y + 5.5);
  doc.text('DISPATCH ESCALATION', margin + 120, y + 5.5);

  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  const animal = diagnosis.animal_identified || options?.animalType || 'Livestock';
  doc.text(animal, margin + 5, y + 13);

  const urgency = diagnosis.urgency_badge || 'YELLOW (Caution)';
  if (urgency.includes('RED') || diagnosis.is_emergency_dispatch_needed) {
    doc.setTextColor(185, 28, 28);
  } else if (urgency.includes('YELLOW')) {
    doc.setTextColor(180, 83, 9);
  } else {
    doc.setTextColor(4, 120, 87);
  }
  doc.text(urgency, margin + 68, y + 13);

  doc.setTextColor(15, 23, 42);
  const dispatchAction = diagnosis.is_emergency_dispatch_needed
    ? '1962 Ambulance Alert'
    : 'Routine Home Care';
  doc.text(dispatchAction, margin + 120, y + 13);

  y += 23;

  // Suspected condition box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text('SUSPECTED PATHOLOGICAL CONDITION / DIAGNOSIS', margin + 5, y + 5.5);

  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  const conditionLines = doc.splitTextToSize(diagnosis.suspected_condition, contentWidth - 10);
  doc.text(conditionLines, margin + 5, y + 13);

  y += 24;

  // Doctor status note if present
  if (diagnosis.doctor_status) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const docNoteLines = doc.splitTextToSize(
      `VETERINARY STATUS: ${diagnosis.doctor_status}`,
      contentWidth
    );
    doc.text(docNoteLines, margin, y);
    y += docNoteLines.length * 4.5 + 4;
  }

  // Actionable First Aid Steps
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('ACTIONABLE FIRST AID PROTOCOLS (LOW-COST INDIGENOUS CARE):', margin, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);

  const steps = diagnosis.first_aid_steps || [];
  steps.slice(0, 5).forEach((step, idx) => {
    const stepText = `${idx + 1}. ${step}`;
    const lines = doc.splitTextToSize(stepText, contentWidth - 6);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.2 + 2;
  });

  y += 3;

  // What not to do (safety warning)
  if (diagnosis.what_not_to_do) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('CRITICAL SAFETY WARNING (WHAT NOT TO DO):', margin + 5, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(127, 29, 29);
    const warningLines = doc.splitTextToSize(diagnosis.what_not_to_do, contentWidth - 10);
    doc.text(warningLines, margin + 5, y + 11);

    y += 22;
  }

  // Recommended local product
  if (diagnosis.recommended_local_product) {
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('RECOMMENDED LOCAL CO-OP / DAIRY STORE PRODUCT:', margin + 5, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(diagnosis.recommended_local_product, margin + 5, y + 11.5);

    y += 20;
  }

  // Safety Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const disclaimer =
    'DISCLAIMER: Vet-Mitra AI provides preliminary triage and indigenous home first-aid guidance only. It NEVER prescribes antibiotic dosages or injectable medicines. Severe conditions require immediate physical examination by a registered Veterinary Officer. Emergency: Call 1962.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  doc.text(disclaimerLines, margin, y);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Official Clinical Paperwork • Sys ID: VM-${new Date().getFullYear()}-PV • Issued via Vet-Mitra AI (Toll-free 1962)`,
    margin,
    y
  );

  // Trigger instant download
  doc.save(`${docketNumber}_Clinical_Report.pdf`);
}
