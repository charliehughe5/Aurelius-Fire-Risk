import { User, Property, Asset, FirelogEntry, RemediationTask, DocumentRecord, Organization } from './types';

export const MOCK_ORGANIZATION: Organization = {
  id: 'org-123',
  name: 'Aurelius Fire Protection',
  complianceTarget: 95
};

export const MOCK_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Marcus Aurelius',
    email: 'm.aurelius@aureliusfire.com',
    role: 'Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 's.jenkins@aureliusfire.com',
    role: 'Property Manager',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr-3',
    name: 'David Croft',
    email: 'd.croft@aureliusfire.com',
    role: 'Site Inspector',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    name: 'Aurelius HQ - Block A',
    address: '100 safety Crescent, London, EC1A 4HD',
    type: 'Commercial Office',
    floors: 6,
    yearBuilt: 2018,
    lastAssessment: '2025-11-12',
    nextAssessment: '2026-11-12',
    complianceScore: 92
  },
  {
    id: 'prop-2',
    name: 'The Zenith Residential Tower',
    address: '24 Skyhigh Avenue, Manchester, M1 3BE',
    type: 'Residential Block',
    floors: 22,
    yearBuilt: 2021,
    lastAssessment: '2026-02-05',
    nextAssessment: '2027-02-05',
    complianceScore: 96
  },
  {
    id: 'prop-3',
    name: 'Vanguard Assembly Hub',
    address: 'Unit 4, Industrial Zone 9, Birmingham, B33 9JR',
    type: 'Industrial Facility',
    floors: 2,
    yearBuilt: 2012,
    lastAssessment: '2025-08-20',
    nextAssessment: '2026-08-20',
    complianceScore: 88
  }
];

export const MOCK_ASSETS: Asset[] = [
  // Property 1 Assets
  { id: 'ast-101', propertyId: 'prop-1', name: 'FD30S Fire Door', type: 'Fire Door', location: 'Main Entrance Lobby', barcode: 'FD-101-LOBBY', status: 'Good', lastChecked: '2026-06-18' },
  { id: 'ast-102', propertyId: 'prop-1', name: 'Water Extinguisher 9L', type: 'Fire Extinguisher', location: 'Floor 1 Lift Lobby', barcode: 'EX-9W-F1LOB', status: 'Good', lastChecked: '2026-06-15' },
  { id: 'ast-103', propertyId: 'prop-1', name: 'Smoke Detector Head', type: 'Smoke Alarm', location: 'Server Room Main', barcode: 'SD-SR-M3', status: 'Good', lastChecked: '2026-06-19' },
  { id: 'ast-104', propertyId: 'prop-1', name: 'Emergency Exit LED Luminaire', type: 'Emergency Light', location: 'Stairwell West Core', barcode: 'EM-SW-W01', status: 'Requires Attention', lastChecked: '2026-06-10' },
  
  // Property 2 Assets
  { id: 'ast-201', propertyId: 'prop-2', name: 'FD60S Security Fire Door', type: 'Fire Door', location: 'Floor 10 Elevator Lobby', barcode: 'FD-201-F10L', status: 'Good', lastChecked: '2026-06-14' },
  { id: 'ast-202', propertyId: 'prop-2', name: 'CO2 Extinguisher 2kg', type: 'Fire Extinguisher', location: 'Electrical Intake Cupboard', barcode: 'EX-2C-ELEC', status: 'Good', lastChecked: '2026-06-08' },
  { id: 'ast-203', propertyId: 'prop-2', name: 'Heat Detector Head', type: 'Smoke Alarm', location: 'Penthouses Lobby', barcode: 'SD-PH-LBY', status: 'Good', lastChecked: '2026-06-12' },
  { id: 'ast-204', propertyId: 'prop-2', name: 'Emergency Luminaire Bulkhead', type: 'Emergency Light', location: 'Basement Parking Row B', barcode: 'EM-BP-RB04', status: 'Good', lastChecked: '2026-06-16' },

  // Property 3 Assets
  { id: 'ast-301', propertyId: 'prop-3', name: 'Double Overhead Fire Shutter', type: 'Fire Door', location: 'Loading Bay West Entrance', barcode: 'FD-301-LOBW', status: 'Critical Failure', lastChecked: '2026-06-11' },
  { id: 'ast-302', propertyId: 'prop-3', name: 'Dry Powder Extinguisher 9kg', type: 'Fire Extinguisher', location: 'Chemical Prep Room', barcode: 'EX-9DP-CHEM', status: 'Good', lastChecked: '2026-06-13' },
  { id: 'ast-303', propertyId: 'prop-3', name: 'Optical Beam Smoke Detector', type: 'Smoke Alarm', location: 'Main Hangar Gantry', barcode: 'SD-HG-GAN3', status: 'Requires Attention', lastChecked: '2026-06-05' },
];

export const MOCK_FIRELOGS: FirelogEntry[] = [
  {
    id: 'log-1',
    propertyId: 'prop-1',
    assetId: 'ast-103',
    checkType: 'Fire Alarm Test',
    timestamp: '2026-06-19T09:30:00Z',
    userId: 'usr-3',
    userName: 'David Croft',
    status: 'Pass',
    notes: 'Server room detector successfully tested using aerosol smoke simulation. Instantly triggered panel. Reset successful.'
  },
  {
    id: 'log-2',
    propertyId: 'prop-1',
    assetId: 'ast-104',
    checkType: 'Emergency Lighting',
    timestamp: '2026-06-10T14:15:00Z',
    userId: 'usr-2',
    userName: 'Sarah Jenkins',
    status: 'Fail',
    notes: 'Emergency exit bulkhead luminaire stairwell west core flickering. Fails secondary battery duration check (only held 12 mins current).'
  },
  {
    id: 'log-3',
    propertyId: 'prop-2',
    assetId: 'ast-201',
    checkType: 'Fire Door',
    timestamp: '2026-06-14T08:00:00Z',
    userId: 'usr-3',
    userName: 'David Croft',
    status: 'Pass',
    notes: 'Floor 10 Elevator Lobby double-action fire door checked. Intumescent strip completely intact, gaps within 3.5mm tolerance.'
  }
];

export const MOCK_REMEDIATIONS: RemediationTask[] = [
  {
    id: 'task-1',
    propertyId: 'prop-1',
    checkType: 'Emergency Lighting',
    severity: 'Medium',
    status: 'In Progress',
    assignedTo: 'Sarah Jenkins',
    loggedAt: '2026-06-10T14:15:00Z',
    details: 'Replace backup battery packs on LED exit signs in Stairwell West Core. Replacement kit ordered.'
  },
  {
    id: 'task-2',
    propertyId: 'prop-3',
    checkType: 'Fire Door',
    severity: 'Urgent',
    status: 'Open',
    assignedTo: 'Marcus Aurelius',
    loggedAt: '2026-06-11T16:22:00Z',
    details: 'Loading Bay West Entrance Overhead Fire Shutter failed drop-test. Safety mechanism locked. Requires emergency specialist contractor call-out.'
  },
  {
    id: 'task-3',
    propertyId: 'prop-1',
    checkType: 'Escape Route Inspections',
    severity: 'High',
    status: 'Open',
    assignedTo: 'Sarah Jenkins',
    loggedAt: '2026-06-19T11:45:00Z',
    details: 'Corridor obstruction logged adjacent to Main Communication closet. Fire exit pathway restricted by pallet delivery of hardware.'
  }
];

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-1',
    title: 'Annual Fire Risk Assessment (FRA) 2025',
    type: 'Risk Assessment',
    issueDate: '2025-11-12',
    expiryDate: '2026-11-12',
    status: 'Valid',
    fileSize: '4.2 MB'
  },
  {
    id: 'doc-2',
    title: 'Emergency Lighting Static Discharge Test Cert',
    type: 'Maintenance Cert',
    issueDate: '2026-01-15',
    expiryDate: '2027-01-15',
    status: 'Valid',
    fileSize: '1.8 MB'
  },
  {
    id: 'doc-3',
    title: 'Fire Alarm System Commissioning Protocol (BS5839)',
    type: 'Maintenance Cert',
    issueDate: '2025-06-10',
    expiryDate: '2026-06-10',
    status: 'Expired',
    fileSize: '8.4 MB'
  },
  {
    id: 'doc-4',
    title: 'Warden Internal Emergency Evacuation Register',
    type: 'Training Log',
    issueDate: '2026-03-01',
    expiryDate: '2027-03-01',
    status: 'Valid',
    fileSize: '840 KB'
  }
];
