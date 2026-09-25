// User types
export type UserRole = 'BENEFICIARY' | 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  language: string;
  role: UserRole;
  location?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  mobile?: string;
  language?: string;
}

// Applicant Profile
export interface ApplicantProfile {
  id: string;
  user_id: string;
  annual_income: number;
  category: 'SC' | 'ST' | 'OBC' | 'GENERAL';
  age: number;
  occupation: string;
  education_status: string;
  district: string;
  state: string;
  pincode: string;
}

// Scheme types
export type SchemeType = 'TERM_LOAN' | 'MICRO_CREDIT' | 'EDUCATION_LOAN' | 'MUDRA' | 'PMEGP' | 'VENTURE_CAPITAL' | 'SUBSIDY' | 'OTHER';

export interface Scheme {
  id: string;
  name: string;
  scheme_type: SchemeType;
  description: string;
  min_income?: number;
  max_income?: number;
  min_loan: number;
  max_loan: number;
  interest_rate: number;
  interest_rate_max?: number;
  max_tenure: number;
  moratorium?: number;
  eligible_purposes: string[];
  eligible_categories: string[];
  min_age?: number;
  max_age?: number;
  min_education?: string;
  required_documents: string[];
  subsidy_info?: string;
  partner_types: string[];
  source_url?: string;
  last_verified?: string;
  data_status: 'VERIFIED' | 'DEMO';
  active: boolean;
  created_at: string;
}

// Eligibility types
export interface EligibilityInput {
  purpose: string;
  annual_income: number;
  loan_amount: number;
  age: number;
  category: string;
  education_status: string;
  state: string;
  district: string;
}

export interface EligibilityCheck {
  criterion: string;
  passed: boolean;
  detail: string;
}

export interface SchemeRecommendation {
  scheme_id: string;
  scheme_name: string;
  scheme_type: string;
  eligible: boolean;
  checks: EligibilityCheck[];
  passed_count: number;
  total_checks: number;
  max_loan: number;
  interest_rate: number;
  interest_rate_max?: number;
  max_tenure: number;
  description: string;
  required_documents: string[];
  subsidy_info?: string;
  source_url?: string;
  data_status: string;
}

export interface EligibilityResponse {
  input_summary: EligibilityInput;
  eligible_schemes: SchemeRecommendation[];
  ineligible_schemes: SchemeRecommendation[];
  total_schemes_checked: number;
}

// Partner types
export type PartnerType = 'SCA' | 'PSB' | 'RRB' | 'NBFC_MFI';

export interface ChannelPartner {
  id: string;
  name: string;
  type: PartnerType;
  address: string;
  state: string;
  district: string;
  pincode: string;
  latitude: number;
  longitude: number;
  supported_schemes: string[];
  active: boolean;
  capacity_status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  phone?: string;
  email?: string;
  distance?: number;
}

// EMI Calculator types
export interface EMIInput {
  principal: number;
  annual_interest_rate: number;
  tenure_months: number;
  moratorium_months?: number;
}

export interface EMIResult {
  emi: number;
  total_interest: number;
  total_payment: number;
  amortization_schedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

// Application types
export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Application {
  id: string;
  user_id: string;
  scheme_id: string;
  partner_id?: string;
  requested_amount: number;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
}
