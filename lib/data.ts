// lib/data.ts — All mock data for APAAR Setu prototype

export type Role = 'regulator' | 'superadmin' | 'institution' | 'operator' | 'student' | 'verifier';

export const ROLES: { id: Role; label: string; emoji: string }[] = [
  { id: 'regulator',   label: 'AICTE Regulator',    emoji: '👮' },
  { id: 'superadmin',  label: 'AICTE Super Admin',   emoji: '🔧' },
  { id: 'institution', label: 'Institution Admin',   emoji: '🏫' },
  { id: 'operator',    label: 'Data Operator',        emoji: '📋' },
  { id: 'student',     label: 'Student (Kavya)',      emoji: '👩‍🎓' },
  { id: 'verifier',    label: 'Employer/Verifier',    emoji: '🔍' },
];

export const NAV_ITEMS: Record<Role, { href: string; label: string; icon: string }[]> = {
  regulator:   [
    { href: '/',              label: 'Home',         icon: 'LayoutDashboard' },
    { href: '/alerts',        label: 'Alerts',       icon: 'AlertTriangle' },
    { href: '/institutions',  label: 'Institutions', icon: 'Building2' },
    { href: '/ask',           label: 'Ask',          icon: 'MessageSquare' },
    { href: '/reports',       label: 'Reports',      icon: 'BarChart3' },
    { href: '/audit',         label: 'Audit Log',    icon: 'Shield' },
  ],
  superadmin:  [
    { href: '/',              label: 'Home',         icon: 'LayoutDashboard' },
    { href: '/alerts',        label: 'Alerts',       icon: 'AlertTriangle' },
    { href: '/institutions',  label: 'Institutions', icon: 'Building2' },
    { href: '/ask',           label: 'Ask',          icon: 'MessageSquare' },
    { href: '/reports',       label: 'Reports',      icon: 'BarChart3' },
    { href: '/rules',         label: 'Rules',        icon: 'Settings' },
    { href: '/users',         label: 'Users & Keys', icon: 'Users' },
    { href: '/audit',         label: 'Audit Log',    icon: 'Shield' },
  ],
  institution: [
    { href: '/inst',          label: 'Home',         icon: 'LayoutDashboard' },
    { href: '/upload',        label: 'Upload',       icon: 'Upload' },
    { href: '/students',      label: 'Students',     icon: 'GraduationCap' },
    { href: '/corrections',   label: 'Corrections',  icon: 'ClipboardEdit' },
  ],
  operator:    [
    { href: '/upload',        label: 'Upload',       icon: 'Upload' },
    { href: '/students',      label: 'Students',     icon: 'GraduationCap' },
    { href: '/corrections',   label: 'Corrections',  icon: 'ClipboardEdit' },
  ],
  student:     [
    { href: '/my-record',     label: 'My Record',    icon: 'User' },
    { href: '/shares',        label: 'Shares',       icon: 'Share2' },
    { href: '/activity',      label: 'Activity',     icon: 'Activity' },
  ],
  verifier:    [],
};

// Institutions
export interface Institution {
  id: string;
  name: string;
  code: string;
  state: string;
  type: 'Engineering' | 'Management' | 'Pharmacy' | 'Architecture';
  trustScore: number;
  trustBand: 'High' | 'Medium' | 'Low' | 'Under Review';
  status: 'Student-Level Ready' | 'Aggregate Only' | 'Under Review';
  students: number;
  lastSubmission: string;
  programmes: number;
  anomalies: number;
}

export const INSTITUTIONS: Institution[] = [
  { id:'i001', name:'Rajiv Gandhi Institute of Technology', code:'AICTE-MH-ENG-001', state:'Maharashtra', type:'Engineering', trustScore:62, trustBand:'Medium', status:'Student-Level Ready', students:4820, lastSubmission:'22 Oct 2026', programmes:8, anomalies:3 },
  { id:'i002', name:'Delhi College of Engineering', code:'AICTE-DL-ENG-012', state:'Delhi', type:'Engineering', trustScore:91, trustBand:'High', status:'Student-Level Ready', students:6100, lastSubmission:'24 Oct 2026', programmes:12, anomalies:0 },
  { id:'i003', name:'IMS Business School', code:'AICTE-UP-MGT-007', state:'Uttar Pradesh', type:'Management', trustScore:48, trustBand:'Low', status:'Aggregate Only', students:1200, lastSubmission:'15 Oct 2026', programmes:3, anomalies:5 },
  { id:'i004', name:'Manipal Institute of Technology', code:'AICTE-KA-ENG-034', state:'Karnataka', type:'Engineering', trustScore:88, trustBand:'High', status:'Student-Level Ready', students:9200, lastSubmission:'25 Oct 2026', programmes:18, anomalies:1 },
  { id:'i005', name:'NIT Bhopal Affiliate College', code:'AICTE-MP-ENG-055', state:'Madhya Pradesh', type:'Engineering', trustScore:71, trustBand:'Medium', status:'Student-Level Ready', students:3400, lastSubmission:'20 Oct 2026', programmes:6, anomalies:2 },
  { id:'i006', name:'Amity University Noida', code:'AICTE-UP-ENG-102', state:'Uttar Pradesh', type:'Engineering', trustScore:85, trustBand:'High', status:'Student-Level Ready', students:11500, lastSubmission:'26 Oct 2026', programmes:22, anomalies:0 },
  { id:'i007', name:'Christ University', code:'AICTE-KA-MGT-019', state:'Karnataka', type:'Management', trustScore:79, trustBand:'High', status:'Student-Level Ready', students:5600, lastSubmission:'23 Oct 2026', programmes:10, anomalies:1 },
  { id:'i008', name:'Sharda University', code:'AICTE-UP-ENG-088', state:'Uttar Pradesh', type:'Engineering', trustScore:56, trustBand:'Medium', status:'Student-Level Ready', students:8900, lastSubmission:'18 Oct 2026', programmes:14, anomalies:4 },
  { id:'i009', name:'BITS Pilani Extension', code:'AICTE-RJ-ENG-003', state:'Rajasthan', type:'Engineering', trustScore:96, trustBand:'High', status:'Student-Level Ready', students:7200, lastSubmission:'26 Oct 2026', programmes:16, anomalies:0 },
  { id:'i010', name:'Mumbai Pharmacy College', code:'AICTE-MH-PHR-022', state:'Maharashtra', type:'Pharmacy', trustScore:44, trustBand:'Low', status:'Under Review', students:680, lastSubmission:'10 Oct 2026', programmes:4, anomalies:7 },
  { id:'i011', name:'VIT University Vellore', code:'AICTE-TN-ENG-009', state:'Tamil Nadu', type:'Engineering', trustScore:93, trustBand:'High', status:'Student-Level Ready', students:15200, lastSubmission:'26 Oct 2026', programmes:28, anomalies:0 },
  { id:'i012', name:'Jadavpur University Affiliate', code:'AICTE-WB-ENG-017', state:'West Bengal', type:'Engineering', trustScore:82, trustBand:'High', status:'Student-Level Ready', students:4100, lastSubmission:'24 Oct 2026', programmes:9, anomalies:1 },
  { id:'i013', name:'Goa Engineering College', code:'AICTE-GA-ENG-005', state:'Goa', type:'Engineering', trustScore:74, trustBand:'Medium', status:'Student-Level Ready', students:1800, lastSubmission:'21 Oct 2026', programmes:7, anomalies:2 },
  { id:'i014', name:'Punjab Technical University', code:'AICTE-PB-ENG-038', state:'Punjab', type:'Engineering', trustScore:59, trustBand:'Medium', status:'Aggregate Only', students:2900, lastSubmission:'12 Oct 2026', programmes:8, anomalies:3 },
  { id:'i015', name:'Anna University Regional Campus', code:'AICTE-TN-ENG-041', state:'Tamil Nadu', type:'Engineering', trustScore:87, trustBand:'High', status:'Student-Level Ready', students:5300, lastSubmission:'25 Oct 2026', programmes:11, anomalies:0 },
];

// Anomalies / Alerts
export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  institution?: string;
  institutionCode?: string;
  rule: string;
  riskScore: number;
  age: string;
  status: 'open' | 'under_review' | 'resolved';
  affectedRows: number;
  evidence: { label: string; value: string; peer?: string; highlight?: boolean }[];
  comments: { author: string; text: string; time: string }[];
}

export const ALERTS: Alert[] = [
  {
    id: 'a001',
    severity: 'critical',
    title: 'Over-intake: B.Tech CSE exceeds approved seats',
    description: '143 students enrolled against 120 approved seats in B.Tech CSE at Rajiv Gandhi Institute of Technology.',
    institution: 'Rajiv Gandhi Institute of Technology',
    institutionCode: 'AICTE-MH-ENG-001',
    rule: 'SEAT-OVER-INTAKE',
    riskScore: 87,
    age: '2h ago',
    status: 'open',
    affectedRows: 23,
    evidence: [
      { label: 'Enrolled (Regular + NRI)', value: '143', peer: '112 (peer avg)', highlight: true },
      { label: 'Approved intake',          value: '120', peer: '', highlight: false },
      { label: 'Excess',                   value: '+23 seats (19.2%)', peer: '', highlight: true },
      { label: 'NRI quota used',           value: '18 / 12 (cap exceeded)', peer: '', highlight: true },
      { label: 'Institution trust score',  value: '62 / 100', peer: '78 (state avg)', highlight: false },
    ],
    comments: [],
  },
  {
    id: 'a002',
    severity: 'critical',
    title: '38 students enrolled at two institutions simultaneously',
    description: '38 students have Active status at two different AICTE-approved institutions in overlapping periods.',
    rule: 'DUP-CROSS-INSTITUTION',
    riskScore: 94,
    age: '4h ago',
    status: 'open',
    affectedRows: 38,
    evidence: [
      { label: 'Duplicate students found', value: '38', peer: '0 (expected)', highlight: true },
      { label: 'Institutions involved',    value: '11 pairs', peer: '', highlight: false },
      { label: 'Most common pattern',      value: 'Enrollment date overlap > 30 days', peer: '', highlight: false },
      { label: 'Possible transfers',       value: '4 (under review)', peer: '', highlight: false },
    ],
    comments: [],
  },
  {
    id: 'a003',
    severity: 'warning',
    title: '9 institutions with trust score drop > 10 pts',
    description: 'Nightly scoring detected significant trust score drops at 9 institutions compared to last cycle.',
    rule: 'TRUST-SCORE-DROP',
    riskScore: 61,
    age: '12h ago',
    status: 'open',
    affectedRows: 9,
    evidence: [
      { label: 'Avg score drop',           value: '-14.3 pts', peer: '-2.1 pts (normal)', highlight: true },
      { label: 'Worst drop',               value: 'Mumbai Pharmacy College: -22 pts', peer: '', highlight: true },
      { label: 'Primary signal',           value: 'ID validity rate declined', peer: '', highlight: false },
      { label: 'Secondary signal',         value: 'Late submissions', peer: '', highlight: false },
    ],
    comments: [{ author: 'Anita Sharma', text: 'Sending follow-up emails to all 9.', time: '6h ago' }],
  },
  {
    id: 'a004',
    severity: 'info',
    title: '4 correction requests awaiting your approval',
    description: 'Institutions have responded to correction requests. Review and approve or reject.',
    rule: 'CORRECTION-PENDING',
    riskScore: 30,
    age: '1d ago',
    status: 'under_review',
    affectedRows: 4,
    evidence: [
      { label: 'Oldest request',           value: '3 days ago — IMS Business School', peer: '', highlight: false },
      { label: 'Institutions',             value: '4 institutions responded', peer: '', highlight: false },
      { label: 'Records corrected',        value: '142 student records updated', peer: '', highlight: false },
    ],
    comments: [{ author: 'System', text: 'All 4 institutions have submitted corrections.', time: '1d ago' }],
  },
  {
    id: 'a005',
    severity: 'critical',
    title: 'Over-intake: B.Tech ECE at NIT Bhopal Affiliate',
    description: '92 students enrolled against 60 approved seats in B.Tech ECE.',
    institution: 'NIT Bhopal Affiliate College',
    institutionCode: 'AICTE-MP-ENG-055',
    rule: 'SEAT-OVER-INTAKE',
    riskScore: 91,
    age: '8h ago',
    status: 'open',
    affectedRows: 32,
    evidence: [
      { label: 'Enrolled (Regular)',       value: '92', peer: '58 (peer avg)', highlight: true },
      { label: 'Approved intake',          value: '60', peer: '', highlight: false },
      { label: 'Excess',                   value: '+32 seats (53.3%)', peer: '', highlight: true },
    ],
    comments: [],
  },
  {
    id: 'a006',
    severity: 'warning',
    title: 'High invalid APAAR ID rate at IMS Business School',
    description: '18% of submitted APAAR IDs failed format or registry validation.',
    institution: 'IMS Business School',
    institutionCode: 'AICTE-UP-MGT-007',
    rule: 'APAAR-INVALID',
    riskScore: 55,
    age: '1d ago',
    status: 'open',
    affectedRows: 216,
    evidence: [
      { label: 'Invalid IDs',              value: '216 / 1200 (18%)', peer: '1.2% (national avg)', highlight: true },
      { label: 'Most common error',        value: 'Check digit mismatch', peer: '', highlight: false },
      { label: 'Not-in-registry',          value: '47 IDs', peer: '', highlight: false },
    ],
    comments: [],
  },
];

// Students
export interface Student {
  id: string;
  name: string;
  apaarId: string;
  programme: string;
  institution: string;
  year: string;
  seatType: string;
  status: 'Active' | 'Graduated' | 'Withdrawn' | 'Flagged' | 'Under Correction';
  admissionDate: string;
  gender: string;
  state: string;
}

export const STUDENTS: Student[] = [
  { id:'s001', name:'Kavya Sharma',     apaarId:'4821 7730 2915', programme:'B.Tech CSE',  institution:'Rajiv Gandhi Institute of Technology', year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Female', state:'Maharashtra' },
  { id:'s002', name:'Arjun Patel',      apaarId:'3912 6541 8820', programme:'B.Tech ECE',  institution:'Delhi College of Engineering',          year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Male',   state:'Delhi' },
  { id:'s003', name:'Priya Nair',       apaarId:'7234 1890 5567', programme:'MBA',          institution:'IMS Business School',                   year:'2025-26', seatType:'NRI',            status:'Flagged',          admissionDate:'15 Jul 2025', gender:'Female', state:'Uttar Pradesh' },
  { id:'s004', name:'Rohan Gupta',      apaarId:'5510 3322 7741', programme:'B.Pharm',      institution:'Mumbai Pharmacy College',               year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Male',   state:'Maharashtra' },
  { id:'s005', name:'Sneha Reddy',      apaarId:'8923 4411 0032', programme:'B.Tech CSE',   institution:'Manipal Institute of Technology',       year:'2024-25', seatType:'Regular',        status:'Graduated',        admissionDate:'01 Aug 2021', gender:'Female', state:'Karnataka' },
  { id:'s006', name:'Amit Singh',       apaarId:'6671 2290 8854', programme:'B.Tech ME',    institution:'Sharda University',                     year:'2025-26', seatType:'Regular',        status:'Under Correction', admissionDate:'05 Aug 2025', gender:'Male',   state:'Uttar Pradesh' },
  { id:'s007', name:'Deepika Menon',    apaarId:'2234 9988 1176', programme:'MCA',           institution:'Amity University Noida',               year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Female', state:'Uttar Pradesh' },
  { id:'s008', name:'Karan Mehta',      apaarId:'9087 5543 3310', programme:'B.Arch',        institution:'Goa Engineering College',              year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Male',   state:'Goa' },
  { id:'s009', name:'Anjali Verma',     apaarId:'1199 8876 4423', programme:'B.Tech ECE',   institution:'BITS Pilani Extension',                year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Female', state:'Rajasthan' },
  { id:'s010', name:'Suresh Kumar',     apaarId:'4456 2231 9987', programme:'MBA',           institution:'Christ University',                    year:'2025-26', seatType:'Supernumerary',  status:'Active',           admissionDate:'10 Aug 2025', gender:'Male',   state:'Karnataka' },
  { id:'s011', name:'Meera Iyer',       apaarId:'7762 3345 8809', programme:'B.Tech CSE',   institution:'VIT University Vellore',               year:'2025-26', seatType:'Regular',        status:'Active',           admissionDate:'01 Aug 2025', gender:'Female', state:'Tamil Nadu' },
  { id:'s012', name:'Rahul Banerjee',   apaarId:'3308 7712 5564', programme:'B.Tech ECE',   institution:'Jadavpur University Affiliate',        year:'2025-26', seatType:'Regular',        status:'Withdrawn',        admissionDate:'01 Aug 2025', gender:'Male',   state:'West Bengal' },
];

// Audit log entries
export interface AuditEntry {
  seq: number;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  digest: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { seq:1001, timestamp:'27 Oct 2026 21:14:33', actor:'anita.sharma@aicte.gov.in', role:'Regulator',   action:'VIEW_ANOMALY',        resource:'anomaly/a001',              digest:'a91f…c4d2' },
  { seq:1002, timestamp:'27 Oct 2026 21:12:10', actor:'rakesh.admin@aicte.gov.in',  role:'Super Admin', action:'UPDATE_RULE',          resource:'rule/SEAT-OVER-INTAKE v4',   digest:'b32e…9a11' },
  { seq:1003, timestamp:'27 Oct 2026 20:55:44', actor:'meera.reg@rgitech.ac.in',    role:'Inst Admin',  action:'SUBMIT_BATCH',         resource:'batch/batch-0193f',          digest:'c7a0…4f88' },
  { seq:1004, timestamp:'27 Oct 2026 20:30:12', actor:'anita.sharma@aicte.gov.in', role:'Regulator',   action:'NLQ_QUERY',            resource:'nlq/query-5512',            digest:'d44b…2c30' },
  { seq:1005, timestamp:'27 Oct 2026 19:45:00', actor:'system',                    role:'System',      action:'ML_SCORE_RUN',         resource:'anomaly-job/nightly-1027',  digest:'e91c…8b77' },
  { seq:1006, timestamp:'27 Oct 2026 18:22:38', actor:'kavya.sharma@student.id',   role:'Student',     action:'ISSUE_CREDENTIAL',     resource:'credential/cred-7821',      digest:'f203…5e19' },
  { seq:1007, timestamp:'27 Oct 2026 17:10:05', actor:'employer-verify',           role:'Verifier',    action:'VERIFY_CREDENTIAL',    resource:'credential/cred-7821',      digest:'g509…1d44' },
  { seq:1008, timestamp:'27 Oct 2026 16:55:20', actor:'anita.sharma@aicte.gov.in', role:'Regulator',   action:'REQUEST_CORRECTION',   resource:'anomaly/a003',              digest:'h672…7f90' },
  { seq:1009, timestamp:'27 Oct 2026 15:30:00', actor:'system',                    role:'System',      action:'BATCH_COMPLETED',      resource:'batch/batch-0191a',         digest:'i881…3c55' },
  { seq:1010, timestamp:'27 Oct 2026 14:00:45', actor:'rakesh.admin@aicte.gov.in',  role:'Super Admin', action:'KEY_ROTATION',         resource:'signing-key/v3',            digest:'j990…6a12' },
];

// NLQ pre-built answers
export const NLQ_ANSWERS: Record<string, { summary: string; rows: Record<string, string>[]; columns: string[]; interpretation: string; filters: string; rowCount: number }> = {
  'default_over_intake': {
    summary: '12 programmes across 8 institutions exceeded their approved intake in 2025-26.',
    columns: ['Institution', 'Programme', 'Approved', 'Enrolled', 'Excess'],
    rows: [
      { Institution: 'Rajiv Gandhi Institute of Technology', Programme: 'B.Tech CSE', Approved: '120', Enrolled: '143', Excess: '+23' },
      { Institution: 'NIT Bhopal Affiliate College',         Programme: 'B.Tech ECE', Approved: '60',  Enrolled: '92',  Excess: '+32' },
      { Institution: 'IMS Business School',                  Programme: 'MBA (FT)',   Approved: '120', Enrolled: '138', Excess: '+18' },
      { Institution: 'Sharda University',                    Programme: 'B.Tech ME',  Approved: '90',  Enrolled: '97',  Excess: '+7'  },
      { Institution: 'Mumbai Pharmacy College',              Programme: 'B.Pharm',    Approved: '100', Enrolled: '112', Excess: '+12' },
    ],
    interpretation: 'Programmes where (enrolled Regular + NRI + OCI + FN) > approved intake for academic year 2025-26.',
    filters: 'year = 2025-26 · status = Active · seat_type IN (Regular, NRI, OCI, FN)',
    rowCount: 12,
  },
  'default_duplicates': {
    summary: '38 students have Active enrolment at two institutions simultaneously in overlapping periods.',
    columns: ['Student Name', 'APAAR ID', 'Institution A', 'Institution B', 'Overlap'],
    rows: [
      { 'Student Name': 'Priya Nair',    'APAAR ID': '7234 1890 5567', 'Institution A': 'IMS Business School', 'Institution B': 'Amity University', 'Overlap': '45 days' },
      { 'Student Name': 'Amit Singh',    'APAAR ID': '6671 2290 8854', 'Institution A': 'Sharda University',   'Institution B': 'Punjab Technical',   'Overlap': '62 days' },
      { 'Student Name': 'Rohan Gupta',   'APAAR ID': '5510 3322 7741', 'Institution A': 'Mumbai Pharmacy',     'Institution B': 'Goa Engineering',    'Overlap': '30 days' },
    ],
    interpretation: 'Students with status=Active at two different institutions with overlapping enrolment periods and no Transferred record.',
    filters: 'status = Active · overlap_days > 0 · no transfer record',
    rowCount: 38,
  },
  'default_trust': {
    summary: 'Trust score distribution: 6,204 institutions High (≥75), 5,891 Medium (50–74), 2,218 Low (<50), 743 Under Review.',
    columns: ['Band', 'Count', 'Percentage'],
    rows: [
      { Band: 'High (≥75)',      Count: '6,204',  Percentage: '41.1%' },
      { Band: 'Medium (50–74)', Count: '5,891',  Percentage: '39.0%' },
      { Band: 'Low (<50)',       Count: '2,218',  Percentage: '14.7%' },
      { Band: 'Under Review',   Count: '743',    Percentage: '4.9%'  },
      { Band: 'Not scored yet', Count: '50',     Percentage: '0.3%'  },
    ],
    interpretation: 'Distribution of Institution Trust Scores across all 15,106 AICTE-approved institutions.',
    filters: 'All institutions · current cycle',
    rowCount: 5,
  },
};

// Credentials for verification page
export const DEMO_CREDENTIALS: Record<string, { result: 'verified' | 'revoked' | 'expired' | 'invalid'; claims?: Record<string, string>; issuedBy?: string; issuedOn?: string; offline?: boolean }> = {
  'demo-verified': {
    result: 'verified',
    claims: { Programme: 'B.Tech CSE', Status: 'Active', Year: '2025-26' },
    issuedBy: 'AICTE',
    issuedOn: '12 Aug 2026',
    offline: true,
  },
  'demo-revoked': {
    result: 'revoked',
  },
  'demo-expired': {
    result: 'expired',
    claims: { Programme: 'B.Tech CSE', Status: 'Active', Year: '2024-25' },
    issuedBy: 'AICTE',
    issuedOn: '10 Jan 2025',
  },
  'demo-invalid': {
    result: 'invalid',
  },
};
