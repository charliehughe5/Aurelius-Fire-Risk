export type UserRole = 'Admin' | 'Property Manager' | 'Site Inspector';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  complianceTarget: number; // e.g. 95 for 95%
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: 'Commercial Office' | 'Residential Block' | 'Industrial Facility';
  floors: number;
  yearBuilt: number;
  lastAssessment: string;
  nextAssessment: string;
  complianceScore: number;
}

export interface Asset {
  id: string;
  propertyId: string;
  name: string;
  type: 'Fire Door' | 'Fire Extinguisher' | 'Smoke Alarm' | 'Emergency Light' | 'Hose Reel';
  location: string;
  barcode: string;
  status: 'Good' | 'Requires Attention' | 'Critical Failure';
  lastChecked: string;
}

export interface FirelogEntry {
  id: string;
  propertyId: string;
  assetId?: string; // Optional if general check
  checkType: string; // e.g. "Fire Alarm Test", "Emergency Lighting", "Escape Route Inspection"
  timestamp: string;
  userId: string;
  userName: string;
  status: 'Pass' | 'Fail';
  notes: string;
}

export interface RemediationTask {
  id: string;
  propertyId: string;
  checkType: string;
  severity: 'Urgent' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Escrow Assigned' | 'Resolved';
  assignedTo: string;
  loggedAt: string;
  resolvedAt?: string;
  details: string;
  comments?: string;
  photoEvidence?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: 'Risk Assessment' | 'Maintenance Cert' | 'Training Log' | 'Regulatory Approval';
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
  fileSize: string;
}

export interface FireDrillHistoryEntry {
  id: string;
  siteId: string;
  timestamp: string;
  testerName: string;
  durationStr: string;
  durationSeconds: number;
  status: 'Pass' | 'Fail';
  notes: string;
  targetMusterTime: number; // e.g., 180 (3 mins)
  comments: {
    id: string;
    userName: string;
    timestamp: string;
    text: string;
  }[];
}
