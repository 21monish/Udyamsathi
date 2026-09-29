/**
 * Statutory Document Specifications Registry
 * Comprehensive metadata for mandatory verification documents across NSFDC, Central & Gujarat state schemes.
 */

export interface DocumentDetail {
  id: string;
  name: string;
  aliases: string[];
  category: 'IDENTITY' | 'ELIGIBILITY' | 'INCOME' | 'PROJECT' | 'BANKING' | 'EDUCATION' | 'SECTOR_SPECIFIC';
  categoryLabel: string;
  issuingAuthority: string;
  statutoryPurpose: string;
  acceptableFormats: string;
  validityPeriod: string;
  copiesRequired: string;
  commonPitfalls: string;
  howToObtain: string;
  portalUrl?: string;
}

export const DOCUMENT_REGISTRY: Record<string, DocumentDetail> = {
  'aadhaar': {
    id: 'aadhaar',
    name: 'Aadhaar Card / Government Identity Proof',
    aliases: ['aadhaar', 'aadhaar card', 'identity proof', 'id proof', 'uidai'],
    category: 'IDENTITY',
    categoryLabel: 'Identity & Address Proof',
    issuingAuthority: 'Unique Identification Authority of India (UIDAI)',
    statutoryPurpose: 'Mandatory primary identifier for biometric e-KYC and Direct Benefit Transfer (DBT) subsidy credit.',
    acceptableFormats: 'Original PVC / e-Aadhaar printed copy or DigiLocker certified PDF with visible QR code.',
    validityPeriod: 'Permanent (Ensure linked mobile number is active for OTP verification)',
    copiesRequired: 'Original for desk verification + 2 self-attested photocopies.',
    commonPitfalls: 'Name or Date of Birth spelling discrepancy between Aadhaar and School Leaving / Caste Certificate.',
    howToObtain: 'Download verified e-Aadhaar from official UIDAI portal or nearest Aadhaar Seva Kendra.',
    portalUrl: 'https://myaadhaar.uidai.gov.in',
  },
  'caste': {
    id: 'caste',
    name: 'Caste / Community Certificate',
    aliases: ['caste', 'caste certificate', 'sc certificate', 'st certificate', 'community certificate', 'social category certificate'],
    category: 'ELIGIBILITY',
    categoryLabel: 'Statutory Eligibility Proof',
    issuingAuthority: 'Revenue Tahsildar / Taluka Development Officer (TDO) / Sub-Divisional Magistrate (SDM)',
    statutoryPurpose: 'Mandatory statutory proof establishing applicant belongs to Scheduled Caste (SC) or eligible target group for concessional lending rates.',
    acceptableFormats: 'Original digitally barcoded revenue certificate or gazetted attested copy.',
    validityPeriod: 'Lifetime validity (No re-issuance required unless specified by state government)',
    copiesRequired: 'Original for verification + 2 self-attested photocopies.',
    commonPitfalls: 'Handwritten certificates lacking official revenue seal or issued by non-competent local bodies.',
    howToObtain: 'Apply via Digital Gujarat Portal or visit the local Mamlatdar / Tehsil Citizen Service Center (Jan Seva Kendra).',
    portalUrl: 'https://www.digitalgujarat.gov.in',
  },
  'income': {
    id: 'income',
    name: 'Certified Family Income Certificate',
    aliases: ['income', 'income certificate', 'family income', 'salary certificate', 'income proof'],
    category: 'INCOME',
    categoryLabel: 'Financial Eligibility',
    issuingAuthority: 'Talati / Revenue Inspector / Mamlatdar / Executive Magistrate',
    statutoryPurpose: 'Validates that the applicant household meets the statutory income ceiling (e.g. ₹3.00 Lakh for NSFDC micro credit, ₹6.00 Lakh for MYSY).',
    acceptableFormats: 'Digital certificate issued with QR verification code and official revenue office dispatch number.',
    validityPeriod: 'Valid for 1 to 3 financial years depending on state government gazette.',
    copiesRequired: 'Original certificate + 1 self-attested copy.',
    commonPitfalls: 'Submitting expired income certificates or omitting secondary family income streams.',
    howToObtain: 'Apply online on State e-District portal or Digital Gujarat Jan Seva Kendra.',
    portalUrl: 'https://www.digitalgujarat.gov.in',
  },
  'dpr': {
    id: 'dpr',
    name: 'Detailed Project Report (DPR) / Business Proposal',
    aliases: ['dpr', 'project report', 'detailed project report', 'project proposal', 'business plan', 'activity details'],
    category: 'PROJECT',
    categoryLabel: 'Project & Viability',
    issuingAuthority: 'Self-prepared or certified by Chartered Accountant / District Industries Centre (DIC)',
    statutoryPurpose: 'Demonstrates commercial viability, technical feasibility, equipment breakdown, and cash-flow repayment capability.',
    acceptableFormats: 'Printed project dossier signed by the applicant detailing capital expenditure and working capital requirements.',
    validityPeriod: 'Current for the active loan appraisal cycle.',
    copiesRequired: '2 complete bound sets with applicant signatures on all pages.',
    commonPitfalls: 'Overestimating sales projections or failing to include vendor machinery quotations.',
    howToObtain: 'Prepare with assistance from DIC General Manager, MSME DFO, or authorized rural enterprise desk.',
    portalUrl: 'https://msme.gov.in',
  },
  'quotation': {
    id: 'quotation',
    name: 'Supplier Quotations & Proforma Invoices',
    aliases: ['quotation', 'supplier quotation', 'proforma invoice', 'vendor quote', 'equipment quotation', 'machinery invoice'],
    category: 'PROJECT',
    categoryLabel: 'Asset Verification',
    issuingAuthority: 'Authorized Commercial Vendor / Manufacturer with valid GSTIN',
    statutoryPurpose: 'Ensures bank/SCA disburses capital directly to suppliers for genuine equipment, vehicle, or livestock procurement.',
    acceptableFormats: 'Original printed quotation on vendor letterhead containing itemized specifications, tax rate, and valid GSTIN.',
    validityPeriod: 'Valid within 60 to 90 days from quotation date.',
    copiesRequired: 'Original quotation signed and stamped by the authorized dealer.',
    commonPitfalls: 'Submitting quotations from unregistered vendors or omitting GST component.',
    howToObtain: 'Request official proforma invoice from an empaneled machinery or commercial equipment dealer.',
  },
  'bank': {
    id: 'bank',
    name: 'Bank Passbook & 6-Month Account Statement',
    aliases: ['bank', 'bank passbook', 'bank statement', 'account details', 'cancelled cheque', 'bank account details'],
    category: 'BANKING',
    categoryLabel: 'Banking & Financial Conduct',
    issuingAuthority: 'Scheduled Commercial Bank / Regional Rural Bank (RRB) branch',
    statutoryPurpose: 'Verifies active savings account, IFSC routing, account holder name match, and past banking financial discipline.',
    acceptableFormats: 'First page of bank passbook with photograph and branch stamp, or recent 6 months computer-generated statement.',
    validityPeriod: 'Current (Last 6 months transaction history required).',
    copiesRequired: '1 copy of stamped passbook / statement + 1 original cancelled cheque leaf.',
    commonPitfalls: 'Dormant bank account, mismatched joint account names, or illegible IFSC branch stamp.',
    howToObtain: 'Collect from your bank home branch or download verified e-statement via net banking / mobile app.',
  },
  'vending': {
    id: 'vending',
    name: 'Vending Certificate / Urban Local Body (ULB) Identity Card',
    aliases: ['vending certificate', 'ulb identity card', 'street vendor card', 'vending id', 'vendor card'],
    category: 'SECTOR_SPECIFIC',
    categoryLabel: 'Sector Registration',
    issuingAuthority: 'Municipal Corporation / Nagar Palika Town Vending Committee (TVC)',
    statutoryPurpose: 'Mandatory statutory proof establishing the applicant is an active urban street vendor entitled to PM SVANidhi micro credit.',
    acceptableFormats: 'Original laminated ID card issued by Municipal Corporation or official Letter of Recommendation (LoR).',
    validityPeriod: 'Active / Valid throughout the lending period.',
    copiesRequired: 'Original for desk check + 1 photocopy.',
    commonPitfalls: 'Expired vending survey card or lack of TVC recommendation letter.',
    howToObtain: 'Register on PM SVANidhi portal or visit local Municipal Ward Urban Livelihood Cell.',
    portalUrl: 'https://pmsvanidhi.mohua.gov.in',
  },
  'education_marksheet': {
    id: 'education_marksheet',
    name: 'Academic Marksheets & Passing Certificates',
    aliases: ['marksheet', 'mark sheet', 'education certificate', '10th marksheet', '12th marksheet', 'degree certificate'],
    category: 'EDUCATION',
    categoryLabel: 'Academic Qualification',
    issuingAuthority: 'State Board of Education (GSEB/CBSE/ICSE) or Recognized University',
    statutoryPurpose: 'Confirms minimum education qualification (e.g. 8th for PMEGP, 80th percentile for MYSY, 12th for Professional Loans).',
    acceptableFormats: 'Original mark sheet / provisional degree or DigiLocker certified digital grade sheet.',
    validityPeriod: 'Permanent.',
    copiesRequired: 'Original + 2 self-attested photocopies of all semesters/standard exams.',
    commonPitfalls: 'Missing back pages or submission of unverifiable internet result printouts.',
    howToObtain: 'School / University Examination Branch or via DigiLocker National Academic Depository.',
    portalUrl: 'https://www.digilocker.gov.in',
  },
  'admission_letter': {
    id: 'admission_letter',
    name: 'University Admission Letter & Approved Fee Schedule',
    aliases: ['admission letter', 'college admission', 'fee structure', 'bonafide certificate', 'i-20', 'cas'],
    category: 'EDUCATION',
    categoryLabel: 'Course Verification',
    issuingAuthority: 'Head of Institution / Registrar / Dean of Recognized College or Foreign University',
    statutoryPurpose: 'Verifies bonafide admission in recognized degree/professional course and establishes statutory loan/subsidy eligibility.',
    acceptableFormats: 'Official admission letter on institution letterhead with college seal and detailed year-wise fee schedule.',
    validityPeriod: 'Active for the current academic admission session.',
    copiesRequired: 'Original admission allotment letter + 2 authenticated copies.',
    commonPitfalls: 'Unapproved course fee breakdown or unaccredited foreign colleges.',
    howToObtain: 'College Admissions Office / University International Students Cell.',
  },
  'land_records': {
    id: 'land_records',
    name: 'Agricultural Land Records (7/12 & 8A Extracts)',
    aliases: ['land record', 'land records', '7/12', '8a', 'khatiyan', 'revenue land extract'],
    category: 'SECTOR_SPECIFIC',
    categoryLabel: 'Agricultural Verification',
    issuingAuthority: 'Revenue Department / Talati / E-Dhara Kendra',
    statutoryPurpose: 'Mandatory proof of agricultural holding for Kisan Credit Card (KCC) and dairy / animal husbandry financing.',
    acceptableFormats: 'Digitally signed RoR (Record of Rights) extract with verified QR barcode from AnyRoR portal.',
    validityPeriod: 'Recent extract issued within the last 6 months.',
    copiesRequired: '1 certified copy with Talati signature.',
    commonPitfalls: 'Outdated land records not reflecting recent succession (Varasai) or land transfer.',
    howToObtain: 'Download certified 7/12 & 8A from Gujarat AnyRoR Portal or E-Dhara Gram Panchayat kiosk.',
    portalUrl: 'https://anyror.gujarat.gov.in',
  },
  'veterinary': {
    id: 'veterinary',
    name: 'Veterinary Certificate & Animal Health / Tagging Record',
    aliases: ['veterinary certificate', 'animal health certificate', 'cattle tagging', 'livestock certificate'],
    category: 'SECTOR_SPECIFIC',
    categoryLabel: 'Livestock Verification',
    issuingAuthority: 'Government Veterinary Officer (Veterinary Dispensary / Animal Husbandry Dept)',
    statutoryPurpose: 'Ensures milch animals/livestock are healthy, disease-free, vaccinated, and officially ear-tagged under INAPH.',
    acceptableFormats: 'Official health certificate with 12-digit ear tag UID barcode numbers.',
    validityPeriod: 'Issued within 30 days of loan application.',
    copiesRequired: 'Original certificate with Veterinary Officer signature and stamp.',
    commonPitfalls: 'Missing INAPH 12-digit ear tag numbers.',
    howToObtain: 'Contact the local Taluka Veterinary Dispensary or Mobile Animal Clinic.',
  },
  'passport_visa': {
    id: 'passport_visa',
    name: 'Valid Indian Passport & Student Visa',
    aliases: ['passport', 'visa', 'student visa', 'valid passport'],
    category: 'EDUCATION',
    categoryLabel: 'Overseas Travel & Identity',
    issuingAuthority: 'Ministry of External Affairs (Passport Seva) & Destination Country Embassy/Consulate',
    statutoryPurpose: 'Mandatory for Dr. Ambedkar Foreign Study Loan and NSFDC Abroad Education Loan disbursement.',
    acceptableFormats: 'Original passport booklet with valid student visa endorsement sticker (e.g. F-1, Tier-4, Subclass 500).',
    validityPeriod: 'Must have at least 12 months remaining validity beyond course completion.',
    copiesRequired: 'Original + 2 clear color photocopies of front, back, and visa endorsement pages.',
    commonPitfalls: 'Applying for loan before receiving official visa sanction.',
    howToObtain: 'Regional Passport Office via Passport Seva Kendra.',
    portalUrl: 'https://www.passportindia.gov.in',
  },
  'fssai': {
    id: 'fssai',
    name: 'FSSAI Registration / Food Business License',
    aliases: ['fssai', 'fssai registration', 'food license', 'food safety certificate'],
    category: 'SECTOR_SPECIFIC',
    categoryLabel: 'Statutory Food Compliance',
    issuingAuthority: 'Food Safety and Standards Authority of India (FSSAI)',
    statutoryPurpose: 'Mandatory legal requirement under Food Safety Act for establishing or upgrading food processing units (PMFME).',
    acceptableFormats: 'Official 14-digit FSSAI registration certificate with QR code.',
    validityPeriod: 'Valid for 1 to 5 years as per chosen license tenure.',
    copiesRequired: '1 clear printed copy.',
    commonPitfalls: 'Operating under generic shop license without food-specific FSSAI classification.',
    howToObtain: 'Apply online on the FoSCoS portal.',
    portalUrl: 'https://foscos.fssai.gov.in',
  },
  'udyam': {
    id: 'udyam',
    name: 'Udyam MSME Registration Certificate',
    aliases: ['udyam', 'udyam certificate', 'msme registration', 'udyam registration'],
    category: 'PROJECT',
    categoryLabel: 'Enterprise Legal Identity',
    issuingAuthority: 'Ministry of Micro, Small & Medium Enterprises (Govt. of India)',
    statutoryPurpose: 'Permanent digital identity proving enterprise MSME classification to claim capital subsidy under NSSH/PMEGP.',
    acceptableFormats: 'Directly verifiable digital certificate with official QR code.',
    validityPeriod: 'Permanent lifetime validity.',
    copiesRequired: '1 printed color copy.',
    commonPitfalls: 'Mismatched GSTIN/PAN between Udyam certificate and applicant enterprise.',
    howToObtain: 'Free online self-declaration on the official Udyam Registration portal.',
    portalUrl: 'https://udyamregistration.gov.in',
  },
};

/**
 * Helper to resolve rich document details from any document string.
 */
export function resolveDocumentDetail(docName: string): DocumentDetail {
  const lower = docName.toLowerCase().trim();

  // Try exact key match
  for (const [key, detail] of Object.entries(DOCUMENT_REGISTRY)) {
    if (lower.includes(key)) return detail;
    for (const alias of detail.aliases) {
      if (lower.includes(alias.toLowerCase())) return detail;
    }
  }

  // Fallback for custom or unrecognized document names
  return {
    id: lower.replace(/[^a-z0-9]/g, '_'),
    name: docName,
    aliases: [docName],
    category: 'ELIGIBILITY',
    categoryLabel: 'Statutory Verification',
    issuingAuthority: 'Competent Authority / Authorized Body',
    statutoryPurpose: 'Required to satisfy statutory eligibility verification and documentation audit by the channel partner.',
    acceptableFormats: 'Original physical copy for verification + 2 self-attested photocopies.',
    validityPeriod: 'Current and valid as per relevant statutory notification.',
    copiesRequired: 'Original + 1 self-attested copy.',
    commonPitfalls: 'Document lacking official signature, seal, or having spelling mismatches.',
    howToObtain: 'Inquire with the assigned State Channelizing Agency or bank branch desk for guidance.',
  };
}
