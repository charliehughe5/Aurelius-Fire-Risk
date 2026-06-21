import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Lock, 
  Menu, 
  X, 
  Sparkles, 
  LogOut, 
  Mail,
  Database, 
  Layers, 
  Eye, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Server,
  FileCode,
  Info,
  Users,
  CreditCard,
  FileText,
  Flame,
  Timer,
  Play,
  Square,
  RotateCcw,
  Activity,
  Scale
} from 'lucide-react';

import { User, Property, Asset, FirelogEntry, RemediationTask, DocumentRecord, FireDrillHistoryEntry } from './types';
import { POSTGRESQL_DDL } from './schemaDDL';

// Import our cohesive, customized modular components
import MarketingSite from './components/MarketingSite';
import DocumentIngestionHub from './components/DocumentIngestionHub';
import ActionTracker from './components/ActionTracker';
import DigitalLogbook from './components/DigitalLogbook';
import DocumentLibrary from './components/DocumentLibrary';
import AdminControl from './components/AdminControl';
import FireTraining from './components/FireTraining';
import FinanceHub from './components/FinanceHub';
import ClientTutorial from './components/ClientTutorial';
import ModernChecks from './components/ModernChecks';
import DashboardReports from './components/DashboardReports';
import ChatSupportPortal from './components/ChatSupportPortal';
import AureliusLogo from './components/AureliusLogo';

export interface Trainee {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Fire Warden' | 'Keyholder';
  siteName: string;
  trainingStatus: 'Not Started' | 'In Progress' | 'Certified';
  certifiedDate?: string;
  expiryDate?: string;
  completedVideo?: boolean;
  password?: string;
  certificateRef?: string;
}

export interface SimulatedEmail {
  id: string;
  timestamp: string;
  subject: string;
  to: string;
  body: string;
  category: 'onboarding' | 'dd_mandate' | 'contract' | 'drill_warning' | 'trainee_credentials' | 'lone_working_checkin' | 'lone_working_fra';
}

interface ClientSaaS {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  suspensionReason?: string;
  subType: 'Enterprise Elite' | 'Standard Professional' | 'Basic Care';
  paymentStatus: 'Paid' | 'Outstanding' | 'Suspended';
  agreedToTerms?: boolean;
  agreementDate?: string;
  password?: string;
}

const INITIAL_CLIENTS: ClientSaaS[] = [
  { id: 'client-1', name: 'Halifax Corporate Offices', contact: 'John Carter', email: 'j.carter@halifaxcorp.co.uk', phone: '020 7946 0912', status: 'Active', subType: 'Enterprise Elite', paymentStatus: 'Paid', agreedToTerms: true, agreementDate: '2026-03-10 11:24' },
  { id: 'client-2', name: 'Apex Managed Residential Block', contact: 'Sarah Jenkins', email: 's.jenkins@apexliving.com', phone: '0161 496 0341', status: 'Active', subType: 'Standard Professional', paymentStatus: 'Paid', agreedToTerms: false },
  { id: 'client-3', name: 'Vanguard Industrial Hubs', contact: 'David Croft', email: 'd.croft@vanguardind.com', phone: '0121 496 0725', status: 'Suspended', suspensionReason: 'Non-payment of annual BS5839 certification fees', subType: 'Basic Care', paymentStatus: 'Suspended', agreedToTerms: true, agreementDate: '2025-06-10 09:15' }
];

const INITIAL_SITES = [
  { id: 'site-1', clientId: 'client-1', name: 'Harlow Plaza - Sector 7C', address: 'Harlow Business Park, Essex, CM19 5QA', type: 'Commercial Office', riskRating: 'Medium', manager: 'John Carter', score: 92, lastAssessment: '2025-11-12', nextAssessment: '2026-11-12' },
  { id: 'site-2', clientId: 'client-1', name: 'Vast Tech Warehouse', address: 'Vanguard Industrial Estate, Leeds, LS10 1EP', type: 'Industrial Facility', riskRating: 'High', manager: 'Marcus Vane', score: 76, lastAssessment: '2025-08-20', nextAssessment: '2026-08-20' },
  { id: 'site-3', clientId: 'client-2', name: 'Apex Tower block A', address: '24 Skyhigh Ave, Manchester, M1 3BE', type: 'Residential Block', riskRating: 'Medium', manager: 'Sarah Jenkins', score: 96, lastAssessment: '2026-02-05', nextAssessment: '2027-02-05' },
  { id: 'site-4', clientId: 'client-2', name: 'Bespoke Mews Gardens', address: '46 Chelsea Mews, London, SW3 3HQ', type: 'Residential Block', riskRating: 'Low', manager: 'Albert Ross', score: 98, lastAssessment: '2026-03-15', nextAssessment: '2027-03-15' },
  { id: 'site-5', clientId: 'client-3', name: 'Vanguard Hangar & Assembly', address: 'Chemical Highway, Birmingham, B33 9JR', type: 'Industrial Facility', riskRating: 'High', manager: 'David Croft', score: 62, lastAssessment: '2025-06-10', nextAssessment: '2026-06-10' }
];

const INITIAL_ACTIONS: RemediationTask[] = [
  { id: 'act-1', propertyId: 'site-1', checkType: 'Emergency Lighting', severity: 'Urgent', status: 'Open', assignedTo: 'John Carter', loggedAt: '2026-06-18', details: 'Flickering backup battery detected in emergency bulkhead EL-04 in West Stairwell B.' },
  { id: 'act-2', propertyId: 'site-1', checkType: 'Fire Doors', severity: 'High', status: 'In Progress', assignedTo: 'John Carter', loggedAt: '2026-06-17', details: 'Intumescent strip on Ground Floor Main double doors has peeling adhesive.' },
  { id: 'act-3', propertyId: 'site-2', checkType: 'Fire Extinguisher', severity: 'Urgent', status: 'Open', assignedTo: 'Marcus Vane', loggedAt: '2026-06-19', details: 'High Pressure CO2 bottle is pressure-depleted (Red Gauge) in Assembly Area C.' },
  { id: 'act-4', propertyId: 'site-5', checkType: 'Fire Alarm Test', severity: 'Urgent', status: 'Open', assignedTo: 'David Croft', loggedAt: '2026-06-14', details: 'Main loading dock secondary horn fails to sound during master control tests.' }
];

const INITIAL_LOGS: FirelogEntry[] = [
  { id: 'log-1', propertyId: 'site-1', checkType: 'Weekly Fire Alarm Test', timestamp: '2026-06-19 11:30', userId: 'usr-1', userName: 'Charlie Hughes', status: 'Pass', notes: 'Routine break-glass weekly simulation passed in North office core. Reset healthy.' },
  { id: 'log-2', propertyId: 'site-1', checkType: 'Emergency Lighting Static Discharge', timestamp: '2026-06-18 10:15', userId: 'usr-2', userName: 'John Carter', status: 'Fail', notes: 'Emergency lighting system failed duration testing on backup cells.' },
  { id: 'log-3', propertyId: 'site-3', checkType: 'Emergency Escape Corridors Check', timestamp: '2026-06-16 09:00', userId: 'usr-3', userName: 'David Croft', status: 'Pass', notes: 'Checked self-closers on exit towers block A.' }
];

const INITIAL_DOCUMENTS: DocumentRecord[] = [
  { id: 'doc-1', title: 'Aurelius Fire Consultancy - Harlow Plaza FRA Assessment 2026.pdf', type: 'Risk Assessment', issueDate: '2026-06-20', expiryDate: '2027-06-20', status: 'Valid', fileSize: '4.2 MB' },
  { id: 'doc-2', title: 'Emergency Lighting Static Discharge Test Cert - Halifax.pdf', type: 'Maintenance Cert', issueDate: '2026-01-15', expiryDate: '2027-01-15', status: 'Valid', fileSize: '1.8 MB' },
  { id: 'doc-3', title: 'Fire Alarm System Commissioning Protocol (BS5839).pdf', type: 'Maintenance Cert', issueDate: '2025-06-10', expiryDate: '2026-06-10', status: 'Expired', fileSize: '8.4 MB' }
];

export interface FireDrillRecord {
  siteId: string;
  lastDrillDate: string;
  nextDrillDate: string;
  previousDuration: string;
  previousNotes: string;
}

const INITIAL_FIRE_DRILLS: Record<string, FireDrillRecord> = {
  'site-1': {
    siteId: 'site-1',
    lastDrillDate: '2026-01-10',
    nextDrillDate: '2026-07-10',
    previousDuration: '2 mins 45 seconds',
    previousNotes: 'Excellent performance by Liam Davies guiding Block B. One assembly zone speaker was quieter than usual but audibility maintained.'
  },
  'site-2': {
    siteId: 'site-2',
    lastDrillDate: '2026-02-15',
    nextDrillDate: '2026-08-15',
    previousDuration: '3 mins 12 seconds',
    previousNotes: 'High-density industrial assembly was slower due to heavy machinery shutdowns. Extinguisher bay 3 access cleared.'
  },
  'site-3': {
    siteId: 'site-3',
    lastDrillDate: '2026-05-12',
    nextDrillDate: '2026-11-12',
    previousDuration: '1 min 58 seconds',
    previousNotes: 'Residential muster points set. High density tower A cleared in record time. No residents remained inside.'
  },
  'site-4': {
    siteId: 'site-4',
    lastDrillDate: '2026-03-30',
    nextDrillDate: '2026-09-30',
    previousDuration: '2 mins 10 seconds',
    previousNotes: 'Automatic magnetic release doors functioned flawlessly. Assisted escape chair utilized on stairwell C without delay.'
  },
  'site-5': {
    siteId: 'site-5',
    lastDrillDate: '2025-12-05',
    nextDrillDate: '2026-06-05',
    previousDuration: '4 mins 20 seconds',
    previousNotes: 'Delays at final fire assembly because loading door shutter was half-closed. Action ticket was opened to remediate.'
  }
};

const INITIAL_DRILLS_HISTORY: FireDrillHistoryEntry[] = [
  {
    id: 'drill-mock-1',
    siteId: 'site-1',
    timestamp: '2026-01-10 10:00',
    testerName: 'Liam Davies',
    durationStr: '2 mins 45 seconds',
    durationSeconds: 165,
    status: 'Pass',
    notes: 'Excellent performance by Liam Davies guiding Block B. One assembly zone speaker was quieter than usual but audibility maintained.',
    targetMusterTime: 180,
    comments: [
      { id: 'c1', userName: 'Charlie Hughes', timestamp: '2026-01-10 10:30', text: 'Confirmed speaker volume in Block B was fixed by onsite engineers.' }
    ]
  },
  {
    id: 'drill-mock-2',
    siteId: 'site-2',
    timestamp: '2026-02-15 14:00',
    testerName: 'Marcus Vane',
    durationStr: '3 mins 12 seconds',
    durationSeconds: 192,
    status: 'Fail',
    notes: 'High-density industrial assembly was slower due to heavy machinery shutdowns. Extinguisher bay 3 access cleared.',
    targetMusterTime: 180,
    comments: [
      { id: 'c2', userName: 'Marcus Vane', timestamp: '2026-02-15 14:45', text: 'Need secondary guidance route signage installed on the east wing.' }
    ]
  },
  {
    id: 'drill-mock-3',
    siteId: 'site-3',
    timestamp: '2026-05-12 11:15',
    testerName: 'Sophia Smith',
    durationStr: '2 mins 10 seconds',
    durationSeconds: 130,
    status: 'Pass',
    notes: 'Flawless execution. All escape stairs clear and marshals reported 100% staff roll count under 2.5 minutes.',
    targetMusterTime: 180,
    comments: []
  },
  {
    id: 'drill-mock-4',
    siteId: 'site-4',
    timestamp: '2026-03-30 09:30',
    testerName: 'Amelie Rogers',
    durationStr: '2 mins 10 seconds',
    durationSeconds: 130,
    status: 'Pass',
    notes: 'Automatic magnetic release doors functioned flawlessly. Assisted escape chair utilized on stairwell C without delay.',
    targetMusterTime: 180,
    comments: []
  },
  {
    id: 'drill-mock-5',
    siteId: 'site-5',
    timestamp: '2025-12-05 09:30',
    testerName: 'Jack Fletcher',
    durationStr: '4 mins 20 seconds',
    durationSeconds: 260,
    status: 'Fail',
    notes: 'Delays at final fire assembly because loading door shutter was half-closed. Action ticket was opened to remediate.',
    targetMusterTime: 180,
    comments: [
      { id: 'c3', userName: 'Jack Fletcher', timestamp: '2025-12-05 10:12', text: 'Action Tracker ID act-04 successfully closed - shutter latch lubricated.' }
    ]
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<'marketing' | 'portal'>('marketing');
  const [marketingSubPage, setMarketingSubPage] = useState<string>('home');
  
  // Dynamic States
  const [clients, setClients] = useState<ClientSaaS[]>(INITIAL_CLIENTS);
  const [sites, setSites] = useState<any[]>(INITIAL_SITES);
  const [actions, setActions] = useState<RemediationTask[]>(INITIAL_ACTIONS);
  const [logs, setLogs] = useState<FirelogEntry[]>(INITIAL_LOGS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  
  const [fireDrillsHistory, setFireDrillsHistory] = useState<FireDrillHistoryEntry[]>(() => {
    const saved = localStorage.getItem('aurelius_drill_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_DRILLS_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('aurelius_drill_history', JSON.stringify(fireDrillsHistory));
  }, [fireDrillsHistory]);

  const [logbookSubTab, setLogbookSubTab] = useState<'weekly' | 'monthly' | 'patrol' | 'drill' | 'history'>('weekly');

  const fireDrills = useMemo<Record<string, FireDrillRecord>>(() => {
    const recordMap: Record<string, FireDrillRecord> = {};
    for (const site of sites) {
      const siteDrills = fireDrillsHistory
        .filter(d => d.siteId === site.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (siteDrills.length > 0) {
        const newest = siteDrills[0];
        const lastDate = new Date(newest.timestamp.split(' ')[0]);
        const nextDate = new Date(lastDate.getTime() + 180 * 24 * 60 * 60 * 1000);
        const nextDateStr = nextDate.toISOString().split('T')[0];
        
        recordMap[site.id] = {
          siteId: site.id,
          lastDrillDate: newest.timestamp.split(' ')[0],
          nextDrillDate: nextDateStr,
          previousDuration: newest.durationStr,
          previousNotes: newest.notes
        };
      } else {
        recordMap[site.id] = {
          siteId: site.id,
          lastDrillDate: 'N/A',
          nextDrillDate: '2026-06-25',
          previousDuration: 'N/A',
          previousNotes: 'No previous records found.'
        };
      }
    }
    return recordMap;
  }, [fireDrillsHistory, sites]);

  // Interactive Drill Simulation States
  const [isSimulatingDrill, setIsSimulatingDrill] = useState(false);
  const [drillSeconds, setDrillSeconds] = useState(0);
  const [drillActive, setDrillActive] = useState(false);
  const [drillTimerId, setDrillTimerId] = useState<any>(null);
  const [drillNotes, setDrillNotes] = useState('');

  // Strict Login States (Multi-Tenant context)
  const [activeUser, setActiveUser] = useState<User>({
    id: 'usr-charlie',
    name: 'Charlie Hughes',
    email: 'charlie@aurelius.com',
    role: 'Admin'
  });
  const [activeSiteId, setActiveSiteId] = useState<string>('site-1');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Direct Debit Site-linked Continuous compliance plan subscription states
  const [ddSubscribedSites, setDdSubscribedSites] = useState<string[]>(['site-1', 'site-3']);
  
  // Nominated Warden rosters for the sites on the dashboard
  const [localWardens, setLocalWardens] = useState<Record<string, {name: string, role: string, cert: string}[]>>({
    'site-1': [
      { name: 'Liam Davies', role: 'Lead Fire Warden', cert: 'AR-FRA-5306-01' },
      { name: 'Isla Brown', role: 'Deputy Warden', cert: 'AR-FRA-5306-04' }
    ],
    'site-2': [
      { name: 'Marcus Vane', role: 'Site Fire Warden', cert: 'AR-FRA-9921-08' }
    ],
    'site-3': [
      { name: 'Sophia Smith', role: 'Lead Fire Warden', cert: 'AR-FRA-2005-02' }
    ],
    'site-5': [
      { name: 'Jack Fletcher', role: 'Keyholder Liaison', cert: 'AR-FRA-5839-01' }
    ]
  });

  const [newDashboardWardenName, setNewDashboardWardenName] = useState('');
  const [newDashboardWardenRole, setNewDashboardWardenRole] = useState<'Fire Warden' | 'Keyholder'>('Fire Warden');

  // Direct Debit Form inputs
  const [dashDdAccountName, setDashDdAccountName] = useState('');
  const [dashDdSortCode, setDashDdSortCode] = useState('');
  const [dashDdAccountNumber, setDashDdAccountNumber] = useState('');

  // Alert State Controllers
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [portalTab, setPortalTab] = useState<'overview' | 'ingestion' | 'actions' | 'logbook' | 'vault' | 'admin' | 'schema' | 'training' | 'billing' | 'tutorial' | 'inspections' | 'chat'>('overview');

  const [hasChatSupport, setHasChatSupport] = useState<boolean>(() => {
    return localStorage.getItem('aurelius_chat_support_bolt_on') === 'true';
  });

  const handleToggleChatSupport = (enabled: boolean) => {
    setHasChatSupport(enabled);
    localStorage.setItem('aurelius_chat_support_bolt_on', enabled ? 'true' : 'false');
  };

  // Real-time SMTP parameters backing state
  const [smtpSettings, setSmtpSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aurelius_smtp_settings');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      host: 'smtp.gmail.com',
      port: '587',
      secure: false,
      user: 'vacationvault1923@gmail.com',
      pass: '',
      from: 'vacationvault1923@gmail.com'
    };
  });

  const [showSmtpModal, setShowSmtpModal] = useState(false);

  // Live SMTP sender function
  const sendRealEmail = async (to: string, subject: string, body: string) => {
    if (!smtpSettings.pass) {
      console.log('No SMTP password configured. Simulation logs will hold the message.');
      return;
    }
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, body, smtpSettings })
      });
      const data = await res.json();
      if (data.success) {
        triggerSuccess(`Live BACS/SaaS Email dispatched securely via SMTP to ${to}!`);
      } else {
        triggerError(`SMTP Mail Server Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error('SMTP network failure:', err);
      triggerError(`Mail service offline: ${err.message || err}`);
    }
  };

  // Dynamic public subscription & instant automated client provisioning
  const handleSignUpClient = (
    newClient: ClientSaaS,
    newBuildingName: string,
    newBuildingAddress: string
  ) => {
    // 1. Add the client to database registry
    setClients(prev => [...prev, newClient]);

    // 2. Provision and wire corresponding dynamic property site
    const siteId = `site-${Date.now()}`;
    const newSite = {
      id: siteId,
      clientId: newClient.id,
      name: newBuildingName || `${newClient.name} Head Office`,
      address: newBuildingAddress || 'Registered UK Address Core',
      type: 'Commercial Office',
      riskRating: 'Medium' as const,
      manager: newClient.contact,
      score: 95,
      lastAssessment: new Date().toISOString().split('T')[0],
      nextAssessment: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
    };
    setSites(prev => [...prev, newSite]);

    // 3. Queue emails
    const mandateMailSubject = `Aurelius Subscription Activated & BACS Direct Debit Approved`;
    const mandateMailBody = `Dear ${newClient.contact},\n\nWelcome to your Aurelius Compliance Ecosystem!\n\nYour chosen subscription level [${newClient.subType}] has been enabled and authenticated.\n\n🛡️ PROPERTY REGISTERED:\n• Property Group: ${newClient.name}\n• Main Site Address: ${newSite.name} (${newSite.address})\n• Direct Debit Reference: AUR-BACS-REG-${Math.floor(100 + Math.random()*900)}\n\n🔒 SECURE CLIENT PORTAL LOGIN DETAILS:\n• Access Link: Open "Secure Compliance App Portal" inside the screen top boundary.\n• Client Username/Email: ${newClient.email}\n• Temporarily Provisioned Password: ${newClient.password || 'aur-temp-setup-pass'}\n\nThank you for choosing Aurelius. A standard 12-month tenure commitment applies under regional compliance standard FSO 2005.\n\nSincerely,\nCharlie Hughes, Lead Assessor (NEBOSH Cert)`;

    // Log internally
    handleTriggerEmail('onboarding', {
      contact: newClient.contact,
      name: newClient.name,
      subType: newClient.subType,
      email: newClient.email
    });

    handleTriggerEmail('dd_mandate', {
      clientName: newClient.name,
      bankName: 'Lloyds Central Bank',
      sortCode: '309121',
      accountNo: '88410291',
      email: newClient.email
    });

    // Fire real SMTP if credentials exist
    sendRealEmail(newClient.email, mandateMailSubject, mandateMailBody);
    triggerSuccess(`Account compiled! Credentials and BACS mandates issued securely to ${newClient.email}.`);
  };

  // Multi-Tenant Trainee e-learning states
  const [trainees, setTrainees] = useState<Trainee[]>([
    { id: 'trainee-1', name: 'Liam Davies', email: 'liam@halifaxcorp.co.uk', role: 'Fire Warden', siteName: 'Harlow Plaza - Sector 7C', trainingStatus: 'Certified', certifiedDate: '2026-03-10', expiryDate: '2027-03-10', completedVideo: true, password: 'AUR-401', certificateRef: 'AR-FRA-5306-01' },
    { id: 'trainee-2', name: 'Sophia Smith', email: 'sophia@apexliving.com', role: 'Fire Warden', siteName: 'Apex Tower block A', trainingStatus: 'Certified', certifiedDate: '2026-05-18', expiryDate: '2027-05-18', completedVideo: true, password: 'AUR-821', certificateRef: 'AR-FRA-2005-02' },
    { id: 'trainee-3', name: 'Jack Fletcher', email: 'jack@vanguard.com', role: 'Keyholder', siteName: 'Vanguard Hangar & Assembly', trainingStatus: 'In Progress', completedVideo: false, password: 'AUR-129' },
    { id: 'trainee-4', name: 'Isla Brown', email: 'isla@halifaxcorp.co.uk', role: 'Staff', siteName: 'Harlow Plaza - Sector 7C', trainingStatus: 'Not Started', completedVideo: false, password: 'AUR-449' }
  ]);

  // BACS Compliant Dispatched Email logs
  const [dispatchedEmails, setDispatchedEmails] = useState<SimulatedEmail[]>([
    {
      id: 'em-id-1',
      timestamp: '2026-06-20 09:30',
      subject: 'Halifax Corporate BACS Direct Debit Active Mandate Confirmation',
      to: 'liam@halifaxcorp.co.uk',
      category: 'dd_mandate',
      body: 'Welcome to the Aurelius secure compliance portal! We confirm that your active Lloyds Bank BACS Direct Debit instruction is officially active. BACS Mandate Reference: AUR-BACS-7401. Your minimum contract term is 12 months, with cancellation policy requiring 30 days written notice.'
    },
    {
      id: 'em-id-2',
      timestamp: '2026-06-20 10:15',
      subject: 'Aurelius Compliance Portal - Service Level Agreement Copy',
      to: 'sarah@apexliving.com',
      category: 'contract',
      body: 'Your choice of Standard Professional subscription package is active under UK Fire regulatory Order 2005. Payment terms are net-monthly £49.00. Automatic renewal occurs annually; 30-day notice applies prior to termination.'
    }
  ]);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  const handleTriggerEmail = (type: 'onboarding' | 'dd_mandate' | 'contract' | 'drill_warning' | 'trainee_credentials' | 'lone_working_checkin' | 'lone_working_fra', data: any) => {
    const emailId = `em-id-${Date.now()}`;
    const timestamp = '2026-06-20 13:28';
    let subject = '';
    let to = data.email || data.clientEmail || activeClient?.email || 'member@aurelius.co.uk';
    let body = '';

    if (type === 'trainee_credentials') {
      subject = `Urgent Action Required: Aurelius E-Learning Academy Access Credentials`;
      body = `Dear ${data.name},\n\nYou have been enrolled as a ${data.role} for property ${data.siteName}.\n\nTo satisfy BAFE auditing criteria under the UK Fire Safety Order 2005, you must sign into the compliance portal, watch the e-learning safety videos, and pass the 3-question exam.\n\n👤 Portal URL: https://aurelius-compliance.co.uk/academy\n👤 Your Username/Email: ${data.email}\n🔑 Your Temp Password: ${data.password}\n\nShould you have questions about regional drills or BS-standard compliance, contact assessor Charlie Hughes.`;
    } else if (type === 'dd_mandate') {
      subject = `BACS Direct Debit Mandate Confirmation - Aurelius Fire Systems`;
      body = `Dear ${data.clientName},\n\nThis certifies that a new BACS Direct Debit instruction has been successfully approved for your account.\n\n🏦 Financial Institution: ${data.bankName}\n👤 BACS Mandate Account: Sort Code ${data.sortCode} | Account No ****${data.accountNo.slice(-4)}\n\nYour continuous portal license has been authenticated. Terms of contract require 12 months minimum commitment. Cancellations require 30 days written notice. Early termination of portal licensing may attract structural administrative recovery fees of £95.00.`;
    } else if (type === 'contract') {
      const optionChoice = data.includePortal === 'yes' ? 'Loyalty Combo Bundle (£25/mo half-price portal)' : 'Standalone Physical Audit';
      subject = `Aurelius Regulatory Copy of Signed Contract - protective Terms`;
      body = `Dear ${data.clientName},\n\nWe confirm receipt of your order booking an in-person physical assessment on ${data.bookingDate}.\n\n🛡️ COMPLIANCE AGREEMENT DETAILS:\n• Chosen Package: ${optionChoice}\n• Monthly Portal Fee: ${data.monthlyFee}\n• Scheduled Annual Review Direct Debit Fee: ${data.oneOffAnnualFee}\n• Annual Billing Schedule Collection Date: ${data.oneOffAnnualFee !== '£0.00' ? data.scheduledDDDate : 'N/A'}\n• Legal Protection Safeguard: Charlie Hughes (NEBOSH Cert) will conduct the physical check. Detailed reports will be structured and uploaded to the portal and emailed to you within 5 working days.\n\n🔒 CONTRACT POLICY TERMINATION CLAUSAL NOTES:\nA statutory 12-month minimum commitment is mandated. Contract terminations require exactly 30 days notice. Refund requests subsequent to physical on-site surveys are void. Assessor\'s expert reports are executed under British Standard FSO 2005.`;
    } else if (type === 'onboarding') {
      subject = `Welcome to Aurelius Fire compliance Hub - Estate Onboarding Packet`;
      body = `Dear ${data.contact},\n\nWelcome to Aurelius Fire compliance Hub. Your organization ${data.name} has been provisioned successfully with the isolated ${data.subType} workspace model.\n\nEnsure you configure your bank's Direct Debit settings promptly in the Finance Hub to protect system up-time. Standard cancellation policies dictate a 30-day notice period. Minimum contract lifecycle: 12 months.\n\nSincerely,\nCharlie Hughes, Lead Assessor`;
    } else if (type === 'lone_working_checkin') {
      subject = `SAFETY HEARTBEAT: Lone Working Check-In notification for ${data.senderName}`;
      body = `Attention Colleague/Emergency Buddy,\n\nThis is a real-time safety notification dispatched from the Aurelius Digital compliance System.\n\nTrainee/Employee ${data.senderName} has registered an active Lone Working Shift Check-In.\n\n📍 Site Location/Area: ${data.siteLocation}\n📋 Active Task Description: ${data.taskDescription}\n🚨 Communications Verified: ${data.commsVerified ? 'YES (Active Mobile & Panic Alarm)' : 'PENDING'}\n🛡️ Fire Egress Audited (Level 1): ${data.egressChecked ? 'YES (All routes visually cleared)' : 'PENDING'}\n🧑‍🚒 Buddy Contact Interval: Every ${data.buddyFeedbackInterval}\n📞 Designated Buddy/Supervisor: ${data.buddyName} (${data.buddyEmail})\n\nUnder UK HSE guidelines, you are designated as their response contact. Ensure you establish regular contact. In the event of missed contact, initiate your corporate safety protocol immediately.`;
    } else if (type === 'lone_working_fra') {
      subject = `Aurelius Compliance Document: Authorized Lone Working Risk Assessment (FRA)`;
      body = `Dear Administrator,\n\nA new digital Lone Working Risk Assessment (FRA) has been generated and validated under our Level 1 Visual Scope criteria.\n\n📑 COMPILED BY: ${data.workerName}\n📍 SPECIALIST CLASSIFICATION: Gym & Leisure (Non-Sleeping Premises Only)\n🔍 SCOPE LIMIT: Visual checking of partition bounds and frame alignments. No ceiling voids or invasive cladding analysis.\n\nAssessment details:\n• Site sector: ${data.siteLocation}\n• Nature of lone work: ${data.taskDescription}\n• Periodic contact: Every ${data.buddyFeedbackInterval} with ${data.buddyName}.\n\nLead assessor Charlie Hughes (NEBOSH Fire Safety Certified) has registered this record to your site compliance folder.`;
    } else if (type === 'terms_agreement' as any) {
      subject = `Aurelius Legal Sign-off Copy: Hold Harmless Terms & Conditions`;
      body = `Dear ${data.clientName || 'Valued Client'},\n\nWe confirm and digitally log your agreement to the Aurelius Terms and Conditions (Zero Liability Agreement).\n\n⚖️ TERMS OF HOLD-HARMLESS COVENANT:\n\n1. PORTAL SOFTWARE MANAGEMENT OPERATIONS: You have explicitly agreed that Aurelius Fire Risk Systems Ltd, its developers, partners, and Lead Assessor Charlie Hughes bear EXACTLY ZERO LIABILITY (£0.00 general liability cap) for any digital registry errors, data corruption, lost logs, software failures, or missed fire alarm reminders inside this SaaS management portal. The responsibility to maintain weekly siren records and active warden cohorts under Section 15 of the FSO 2005 remains exclusively yours.\n\n2. PHYSICAL FIRE RISK ASSESSMENTS: Physical inspections are visual, non-invasive Level 1 audits of easy, commercial leisure/gym and low-risk premises only (strictly non-sleeping buildings). Standard assessor ownership and visual liabilities apply, limited strictly to the visual fee value.\n\nApproved on: ${data.agreementDate || '2026-06-20'}\nIP Signature: ${data.signatureName}\nStatus: SIGNED & SECURED IN PORTAL DIRECTORY`;
    } else {
      subject = `URGENT ALERT: UK Fire Marshal Refresher Cycle Expired`;
      body = `Dear Fire Warden / Staff Representative,\n\nOur system has parsed calendar markers. Your annual compliance training has officially expired.\n\nLead assessor Charlie Hughes has automatically re-assigned you the requisite classroom video and quiz models to preserve property safety marks. Access the e-learning workspace immediately.`;
    }

    const newEmail: SimulatedEmail = {
      id: emailId,
      timestamp,
      subject,
      to,
      body,
      category: type
    };

    setDispatchedEmails(prev => [newEmail, ...prev]);
  };

  const handlePassTraining = (traineeId: string, printedName: string) => {
    const today = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    setTrainees(prev => prev.map(t => {
      if (t.id === traineeId) {
        return {
          ...t,
          trainingStatus: 'Certified',
          certifiedDate: today,
          expiryDate: expiryStr,
          completedVideo: true,
          certificateRef: `AR-RRO-F-${Math.floor(1000 + Math.random()*9000)}`
        };
      }
      return t;
    }));

    // Generate simulated notification email for certified trainee
    const trainee = trainees.find(t => t.id === traineeId);
    if (trainee) {
      setDispatchedEmails(prev => [
        {
          id: `em-pass-${Date.now()}`,
          timestamp: '2026-06-20 13:28',
          subject: 'Aurelius Fire safety Academy Graduate Certificate Approved',
          to: trainee.email,
          category: 'trainee_credentials',
          body: `Congratulations ${trainee.name}!\n\nYou have passed the 3-question exam with a 100% score as part of your safety obligations for site ${trainee.siteName}.\n\nYour digital sign-off ("${printedName}") matches BACS compliance standards. Your official British certificate reference is recorded in the immutable directors portal logs.`
        },
        ...prev
      ]);
    }
  };

  const handleSimulateYearPassage = () => {
    // Force active expiry date to the past relative to 2026-06-20, thus triggering expiration countdown red flags!
    setTrainees(prev => prev.map(t => {
      if (t.trainingStatus === 'Certified') {
        return {
          ...t,
          trainingStatus: 'Not Started',
          certifiedDate: undefined,
          expiryDate: '2026-05-18', // ExpiredRelative to June 20th
          completedVideo: false
        };
      }
      return t;
    }));

    // Dispatch warnings
    setDispatchedEmails(prev => [
      {
        id: `em-[SimPass]-${Date.now()}`,
        timestamp: '2026-06-20 13:28',
        subject: `URGENT RE-ASSIGNMENT NOTICE: Annual Refresher Expired (UK Safety Standards)`,
        to: 'sophia@apexliving.com',
        category: 'drill_warning',
        body: `Dear Sophia Smith,\n\nOur system warns that your annual fire e-learning certification has lapsed (expired on 2026-05-18).\n\nCharlie Hughes has automatically re-assigned you interactive courses in your secure trainee portal. Watch the safety PASS video and recomplete the 3-question exam.`
      },
      ...prev
    ]);

    triggerSuccess('Simulated 12-Month Passage! All certified users expired. Refresher assigned and countdown flagged.');
  };

  const handleAddTrainee = (newTrainee: Trainee) => {
    setTrainees(prev => [...prev, newTrainee]);
  };

  // Determine active client isolation
  const activeClient = useMemo(() => {
    if (activeUser.role === 'Admin') {
      // Find the client organization the currently selected activeSite belongs to
      const currentSite = sites.find(s => s.id === activeSiteId);
      return clients.find(c => c.id === currentSite?.clientId) || clients[0];
    } else {
      // For Client Admins and Site Users, extract client based on their email context
      const isApex = activeUser.email.includes('apex') || activeUser.email.includes('sarah');
      const isVanguard = activeUser.email.includes('vanguard') || activeUser.email.includes('david');
      const targetId = isApex ? 'client-2' : isVanguard ? 'client-3' : 'client-1';
      return clients.find(c => c.id === targetId) || clients[0];
    }
  }, [activeUser, activeSiteId, clients, sites]);

  // Is current logged in client workspace suspended?
  const isSuspended = useMemo(() => {
    if (activeUser.role === 'Admin') return false;
    return activeClient?.status === 'Suspended';
  }, [activeUser, activeClient]);

  // Filter sites strictly for active role multi-tenancy
  const visibleSites = useMemo(() => {
    if (activeUser.role === 'Admin') {
      return sites;
    } else {
      // Filter sites that matches isolated active client ID
      return sites.filter(s => s.clientId === activeClient?.id);
    }
  }, [activeUser, sites, activeClient]);

  // Auto-calibrate active selected site upon user change
  const currentActiveSite = useMemo(() => {
    const found = visibleSites.find(s => s.id === activeSiteId);
    return found || visibleSites[0] || null;
  }, [visibleSites, activeSiteId]);

  const drillDaysLeft = useMemo(() => {
    const targetSiteId = currentActiveSite?.id || activeSiteId;
    if (!targetSiteId || !fireDrills[targetSiteId]) return 0;
    const nextDrill = fireDrills[targetSiteId].nextDrillDate;
    const ref = new Date('2026-06-20');
    const target = new Date(nextDrill);
    const diffTime = target.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [currentActiveSite, activeSiteId, fireDrills]);

  // Authenticate simulated user profile
  const handleSimulateLogin = (email: string, pass: string) => {
    const normEmail = email.trim().toLowerCase();
    
    // Intercept dynamic trainees first to locked Workspace
    const foundTrainee = trainees.find(t => t.email.toLowerCase() === normEmail);
    if (foundTrainee) {
      setActiveUser({
        id: foundTrainee.id,
        name: foundTrainee.name,
        email: foundTrainee.email,
        role: 'Trainee'
      });
      setIsLoggedIn(true);
      setCurrentView('portal');
      setPortalTab('training'); // Secure locked training tab
      
      // Auto-set matching site ID
      const matchingSite = sites.find(s => s.name === foundTrainee.siteName) || sites[0];
      if (matchingSite) {
        setActiveSiteId(matchingSite.id);
      }
      
      triggerSuccess(`Signed in as Trainee: ${foundTrainee.name}. Safety training academy locked mode active.`);
      return;
    }

    // Intercept dynamically signed-up SaaS Clients!
    const foundClient = clients.find(c => c.email.toLowerCase() === normEmail);
    if (foundClient) {
      setActiveUser({
         id: `usr-${foundClient.id}`,
         name: foundClient.contact,
         email: foundClient.email,
         role: 'Property Manager'
      });
      setIsLoggedIn(true);
      setCurrentView('portal');
      setPortalTab('overview');

      // Auto-set matching site ID
      const matchingSite = sites.find(s => s.clientId === foundClient.id) || sites[0];
      if (matchingSite) {
        setActiveSiteId(matchingSite.id);
      }
      triggerSuccess(`Successfully signed into secure workspace: ${foundClient.name}`);
      return;
    }

    const isCharlie = normEmail === 'charlie@aurelius.com';
    const isSarah = normEmail.includes('sarah') || normEmail.includes('apex');
    const isDavid = normEmail.includes('david') || normEmail.includes('vanguard');

    if (isCharlie) {
      setActiveUser({ id: 'usr-charlie', name: 'Charlie Hughes', email: 'charlie@aurelius.com', role: 'Admin' });
      const firstSite = sites[0]?.id || 'site-1';
      setActiveSiteId(firstSite);
    } else if (isSarah) {
      setActiveUser({ id: 'usr-sarah', name: 'Sarah Jenkins', email: 's.jenkins@apexliving.com', role: 'Property Manager' });
      const sarahFirstSite = sites.find(s => s.clientId === 'client-2')?.id || 'site-3';
      setActiveSiteId(sarahFirstSite);
    } else if (isDavid) {
      setActiveUser({ id: 'usr-david', name: 'David Croft', email: 'd.croft@vanguardind.com', role: 'Site Inspector' });
      setActiveSiteId('site-5');
    } else {
      setActiveUser({ id: 'usr-john', name: 'John Carter', email: 'j.carter@halifaxcorp.co.uk', role: 'Property Manager' });
      const johnFirstSite = sites.find(s => s.clientId === 'client-1')?.id || 'site-1';
      setActiveSiteId(johnFirstSite);
    }

    setIsLoggedIn(true);
    setCurrentView('portal');
    setPortalTab('overview');
    triggerSuccess(`Successfully signed into secure tenant workspace.`);
  };

  // Sign off Terms & Conditions with continuous hold-harmless protection
  const handleAgreeToTerms = (clientId: string, signatureName: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          agreedToTerms: true,
          agreementDate: '2026-06-20 13:50'
        };
      }
      return c;
    }));

    const clientName = activeClient ? activeClient.contact : signatureName;
    const clientEmail = activeClient ? activeClient.email : 'contact@client.co.uk';

    // Dispatch automated protective legal confirmation email copy
    handleTriggerEmail('terms_agreement' as any, {
      clientName,
      clientEmail,
      signatureName,
      agreementDate: '2026-06-20 13:50',
    });

    triggerSuccess(`Terms Approved! Hold-harmless certificate generated and backup auto-emailed to ${clientEmail}.`);
  };

  // State callbacks from modular child units
  const handleUpdateSiteCompliance = (siteId: string, updates: Partial<Property>) => {
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  const handleAddGeneratedActions = (newActions: RemediationTask[]) => {
    setActions(prev => [...newActions, ...prev]);
  };

  const handleToggleActionStatus = (
    taskId: string, 
    currentStatus: string, 
    forcedStatus?: 'Open' | 'In Progress' | 'Escrow Assigned' | 'Resolved',
    comments?: string,
    photoEvidence?: string
  ) => {
    setActions(prev => prev.map(act => {
      if (act.id === taskId) {
        const nextStatus = forcedStatus || (currentStatus === 'Open' ? 'In Progress' : currentStatus === 'In Progress' ? 'Resolved' : 'Open');
        return { 
          ...act, 
          status: nextStatus,
          resolvedAt: nextStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : undefined,
          comments: comments !== undefined ? comments : act.comments,
          photoEvidence: photoEvidence !== undefined ? photoEvidence : act.photoEvidence
        };
      }
      return act;
    }));
  };

  const handleDeleteLog = (logId: string) => {
    setLogs(prev => prev.filter(item => item.id !== logId));
    triggerSuccess('✅ Successfully deleted fire log entry from compliance history.');
  };

  const handleFirelogSubmit = (siteId: string, testName: string, status: 'Pass' | 'Fail', customNotes?: string) => {
    const logItem: FirelogEntry = {
      id: `log-${Date.now()}`,
      propertyId: siteId,
      checkType: testName,
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      userId: activeUser.id,
      userName: activeUser.name,
      status: status,
      notes: customNotes || (status === 'Pass' 
        ? `${testName} completed successfully. Alarm tones verified nominal.`
        : `CRITICAL TEST FAILURE: Fails core audibility. Prompt corrective action ticket issued.`)
    };

    setLogs(prev => [logItem, ...prev]);

    if (status === 'Fail') {
      // 2.2 Auto action generation under strict visual instruction
      const autoTask: RemediationTask = {
        id: `act-fail-${Date.now()}`,
        propertyId: siteId,
        checkType: testName,
        severity: 'Urgent',
        status: 'Open',
        assignedTo: 'Lead Safety Coordinator',
        loggedAt: new Date().toISOString().split('T')[0],
        details: `AUTOGEN: ${testName} failed during weekly manual check. Immediate specialist review required. Notes: ${customNotes || 'None'}`
      };

      setActions(prev => [autoTask, ...prev]);

      // Reduce safety score margins on active site
      setSites(prev => prev.map(s => {
        if (s.id === siteId) {
          return { ...s, score: Math.max(50, s.score - 10) };
        }
        return s;
      }));
    } else {
      // Slightly improve score metrics
      setSites(prev => prev.map(s => {
        if (s.id === siteId) {
          return { ...s, score: Math.min(100, s.score + 2) };
        }
        return s;
      }));
    }
  };

  const handleLogFireDrill = (siteId: string, durationStr: string, notesText: string, statusOverride?: 'Pass' | 'Fail', secondsVal?: number) => {
    const todayStr = '2026-06-20';
    const finalStatus = statusOverride || ((secondsVal && secondsVal > 180) ? 'Fail' : 'Pass');
    
    const newDrill: FireDrillHistoryEntry = {
      id: `drill-${Date.now()}`,
      siteId,
      timestamp: `${todayStr} 13:15`,
      testerName: activeUser.name,
      durationStr,
      durationSeconds: secondsVal || 120,
      status: finalStatus,
      notes: notesText || 'Biannual Fire Evacuation Drill completed.',
      targetMusterTime: 180,
      comments: []
    };

    setFireDrillsHistory(prev => [newDrill, ...prev]);

    const logItem: FirelogEntry = {
      id: `log-drill-${Date.now()}`,
      propertyId: siteId,
      checkType: '6-Month Evacuation Fire Drill',
      timestamp: `${todayStr} 13:15`,
      userId: activeUser.id,
      userName: activeUser.name,
      status: finalStatus,
      notes: `Biannual Fire Evacuation Drill completed (${finalStatus.toUpperCase()}). Response time: ${durationStr}. Remarks: ${notesText || 'Nominal clearance speed.'}`
    };

    setLogs(prev => [logItem, ...prev]);

    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        const scoreDiff = finalStatus === 'Pass' ? 15 : -10;
        return { ...s, score: Math.min(100, Math.max(50, s.score + scoreDiff)) };
      }
      return s;
    }));

    if (finalStatus === 'Fail') {
      const autoTask: RemediationTask = {
        id: `act-drill-fail-${Date.now()}`,
        propertyId: siteId,
        checkType: '6-Month Evacuation Fire Drill Deficit',
        severity: 'Urgent',
        status: 'Open',
        assignedTo: 'Lead Safety Coordinator',
        loggedAt: todayStr,
        details: `AUTOGEN: 6-Month Fire Drill failed clearance guidelines (${durationStr}). Remarks: ${notesText || 'Muster delay.'}`
      };
      setActions(prev => [autoTask, ...prev]);
      triggerSuccess(`🔴 Recorded drill failure. Corrective Action ticket created.`);
    } else {
      triggerSuccess(`🟢 Immutable 6-Month Fire Drill recorded successfully. Next check due in 6 months.`);
    }
  };

  const handleOnDeleteFireDrill = (drillId: string) => {
    setFireDrillsHistory(prev => prev.filter(item => item.id !== drillId));
    triggerSuccess('✅ Successfully wiped fire drill execution record from ledger.');
  };

  const handleOnAddDrillComment = (drillId: string, text: string) => {
    if (!text.trim()) return;
    setFireDrillsHistory(prev => prev.map(drill => {
      if (drill.id === drillId) {
        return {
          ...drill,
          comments: [
            ...(drill.comments || []),
            {
              id: `comment-${Date.now()}`,
              userName: activeUser.name,
              timestamp: '2026-06-20 13:20',
              text: text.trim()
            }
          ]
        };
      }
      return drill;
    }));
    triggerSuccess('💬 Appended follow-up audit comment successfully.');
  };


  const startDrillStopwatch = () => {
    if (drillActive) return;
    setDrillActive(true);
    const interval = setInterval(() => {
      setDrillSeconds(prev => prev + 1);
    }, 1000);
    setDrillTimerId(interval);
    triggerSuccess("Alarm sounders triggered! Evacuation timer is running live.");
  };

  const stopDrillStopwatch = () => {
    if (!drillActive) return;
    setDrillActive(false);
    if (drillTimerId) {
      clearInterval(drillTimerId);
      setDrillTimerId(null);
    }
    triggerSuccess("Evacuation completed and registered on stopwatch!");
  };

  const resetDrillStopwatch = () => {
    setDrillActive(false);
    if (drillTimerId) {
      clearInterval(drillTimerId);
      setDrillTimerId(null);
    }
    setDrillSeconds(0);
    setDrillNotes('');
  };

  React.useEffect(() => {
    return () => {
      if (drillTimerId) {
        clearInterval(drillTimerId);
      }
    };
  }, [drillTimerId]);

  // Admin provisioning tools
  const handleAddNewClient = (newCl: any) => {
    const clId = `client-${Date.now()}`;
    const mappedClient: ClientSaaS = {
      id: clId,
      name: newCl.name,
      contact: newCl.contact,
      email: newCl.email,
      phone: newCl.phone,
      status: 'Active',
      subType: newCl.subType,
      paymentStatus: 'Paid',
      agreedToTerms: !!newCl.agreedToTerms,
      agreementDate: newCl.agreedToTerms ? '2026-06-20 13:50' : undefined
    };

    const sId = `site-${Date.now()}`;
    const companionSite = {
      id: sId,
      clientId: clId,
      name: `Main Campus - Block ${newCl.name.slice(0,3).toUpperCase()}`,
      address: 'Industrial Crescent, London',
      type: 'Commercial Office',
      riskRating: 'Medium',
      manager: newCl.contact,
      score: 100, // Starts pristine
      lastAssessment: '2026-06-20',
      nextAssessment: '2027-06-20'
    };

    const templateAction: RemediationTask = {
      id: `act-temp-${Date.now()}`,
      propertyId: sId,
      checkType: 'Quarterly Fire Door Survey',
      severity: 'Medium',
      status: 'Open',
      assignedTo: newCl.contact,
      loggedAt: new Date().toISOString().split('T')[0],
      details: 'Template Action: Perform inspection of all interior double-leaf fire doors to align with Regulatory Reform Order 2005.'
    };

    setClients(prev => [...prev, mappedClient]);
    setSites(prev => [...prev, companionSite]);
    setActions(prev => [templateAction, ...prev]);

    // Fast trigger simulated onboarding packet dispatch
    handleTriggerEmail('onboarding', {
      name: newCl.name,
      contact: newCl.contact,
      email: newCl.email,
      subType: newCl.subType
    });
    
    triggerSuccess(`Successfully provisioned workspace, main site, and standard task templates for ${newCl.name}. Generated email contract notice.`);
  };

  const handleToggleSuspension = (clientId: string) => {
    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        const nextStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        return {
          ...c,
          status: nextStatus,
          suspensionReason: nextStatus === 'Suspended' ? 'Outstanding audit and system calibration fees past due' : undefined,
          paymentStatus: nextStatus === 'Suspended' ? 'Suspended' : 'Paid'
        };
      }
      return c;
    }));
    triggerSuccess('Client portal parameters toggled instantly.');
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    setSites(prev => prev.filter(s => s.clientId !== clientId));
    triggerSuccess('Organizational trace permanently deleted from client maps.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-slate-900 selection:text-white">
      
      {/* SUCCESS ALERTS DECK */}
      {successMsg && (
        <div className="fixed top-6 right-6 bg-white border border-slate-205 text-slate-800 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fadeIn max-w-sm">
          <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
          <span className="text-xs font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-6 right-6 bg-white border border-rose-300 text-slate-800 p-4 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fadeIn max-w-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="text-xs font-bold">{errorMsg}</span>
        </div>
      )}

      {/* PERSISTENT SANDBOX HOT-SWAP HEADER */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[10px] font-mono border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-800 text-orange-400 border border-slate-700 rounded font-bold uppercase tracking-wider text-[8px]">
            <Sparkles className="w-3 h-3 text-orange-400" />
            Aurelius SaaS Simulator Sandbox Mode
          </span>
          <span className="hidden lg:inline text-slate-400">Instantly toggle marketing views & simulated client spaces.</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSmtpModal(true)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center gap-1.5 text-[9px] uppercase tracking-wider transition-all cursor-pointer"
          >
            <Mail className="w-3 h-3" />
            SMTP Mail: {smtpSettings.pass ? "🟢 Live" : "🟠 Simulation"}
          </button>

          <button
            onClick={() => { setCurrentView('marketing'); setMarketingSubPage('home'); }}
            className={`px-2.5 py-1 rounded font-bold transition-all text-[10px] ${
              currentView === 'marketing'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Public B2B Marketing Site
          </button>
          
          <button
            onClick={() => { 
              if (!isLoggedIn) {
                handleSimulateLogin('charlie@aurelius.com', 'nebosh2026');
              } else {
                setCurrentView('portal');
              }
            }}
            className={`px-2.5 py-1 rounded font-bold transition-all text-[10px] ${
              currentView === 'portal'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Secure Compliance App Portal
          </button>
        </div>
      </div>

      {/* MARKETING HOME VIEW OR COMPLIANCE WORKSPACE APPARATUS */}
      {currentView === 'marketing' ? (
        <div className="flex-1 flex flex-col">
          {/* Apple-style minimalist B2B Head Banner */}
          <header className="bg-white/80 border-b border-slate-200/50 px-6 py-4 sticky top-0 backdrop-blur-md z-45">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AureliusLogo size={36} hideText={true} className="text-amber-500 hover:scale-105 transition-all" />
                <div>
                  <span className="font-extrabold text-xs tracking-tight text-slate-900 block uppercase">Aurelius Fire Risk</span>
                  <span className="text-[8px] font-mono tracking-widest text-slate-450 block uppercase font-bold">Compliance Systems</span>
                </div>
              </div>

              {/* Sub Pages Navigation */}
              <div className="hidden md:flex items-center gap-6 text-[11px] font-bold text-slate-500">
                <button onClick={() => setMarketingSubPage('home')} className={`hover:text-slate-900 transition-colors ${marketingSubPage === 'home' ? 'text-slate-900 border-b border-slate-900 pb-0.5' : ''}`}>Home</button>
                <button onClick={() => setMarketingSubPage('services')} className={`hover:text-slate-900 transition-colors ${marketingSubPage === 'services' ? 'text-slate-900 border-b border-slate-900 pb-0.5' : ''}`}>Consultancy Services</button>
                <button onClick={() => setMarketingSubPage('industries')} className={`hover:text-slate-900 transition-colors ${marketingSubPage === 'industries' ? 'text-slate-900 border-b border-slate-900 pb-0.5' : ''}`}>UK Industries</button>
                <button onClick={() => setMarketingSubPage('about')} className={`hover:text-slate-900 transition-colors ${marketingSubPage === 'about' ? 'text-slate-900 border-b border-slate-900 pb-0.5' : ''}`}>About Charlie</button>
                <button onClick={() => setMarketingSubPage('contact')} className={`hover:text-slate-900 transition-colors ${marketingSubPage === 'contact' ? 'text-slate-900 border-b border-slate-900 pb-0.5' : ''}`}>Contact Office</button>
                <button 
                  onClick={() => {
                    handleSimulateLogin('charlie@aurelius.com', 'nebosh2026');
                    setPortalTab('schema');
                  }} 
                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded font-mono text-[9px] font-bold flex items-center gap-1"
                >
                  <Database className="w-3 h-3 text-slate-900" /> DDL Schema
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateLogin('sarah@apexliving.com', 'apex2026')}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-all"
                >
                  Client Portal Sign In
                </button>
                <button
                  onClick={() => handleSimulateLogin('charlie@aurelius.com', 'nebosh2026')}
                  className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Launch Compliance Sandbox
                </button>
              </div>
            </div>
          </header>

          <MarketingSite 
            onLoginSimulate={handleSimulateLogin}
            triggerSuccess={triggerSuccess}
            currentMarketingSubPage={marketingSubPage}
            setMarketingSubPage={setMarketingSubPage}
            onSignUpClient={handleSignUpClient}
          />
        </div>
      ) : (
        /* PORTAL SYSTEM APP */
        <div className="flex-1 flex flex-col bg-slate-50">
          
          {/* SECURE BLOCK FOR SUSPENDED ACCOUNTS */}
          {isSuspended ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
              <div className="max-w-md w-full bg-white border border-rose-205 rounded-3xl p-8 space-y-6 text-center shadow-lg relative animate-fadeIn">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                
                <div className="space-y-2.5 pt-4">
                  <span className="text-[10px] font-mono text-rose-600 uppercase tracking-widest font-extrabold block">Compliance Access Blocked</span>
                  <h3 className="text-xl font-extrabold text-slate-950 tracking-tight">{activeClient?.name} Portal</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This compliance ecosystem directory is temporarily restricted under strict tenancy fee gates. 
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <p className="font-bold text-slate-800">Why did this happen?</p>
                  <p className="text-[11px]">
                    The annual BAFE structural survey fee and NEBOSH risk assessment calibration ledger for this client organization is currently <strong>past due</strong>.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-2">
                  <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    💳 Self-Service Settlement Gateway
                  </p>
                  <p className="text-[11px] text-emerald-800 leading-normal">
                    To immediately lift this regulatory suspension, authorize authorization for the past-due BAFE survey invoice of <strong>£195.00</strong> via GoCardless/BACS Direct Debit.
                  </p>
                  <button
                    onClick={() => {
                      if (activeClient) {
                        setClients(prev => prev.map(c => {
                          if (c.id === activeClient.id) {
                            return { ...c, status: 'Active', paymentStatus: 'Paid' };
                          }
                          return c;
                        }));
                      }
                      triggerSuccess("BACS Settlement Authorised! Payment processed via GoCardless. Your portal is now unlocked!");
                    }}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer text-center"
                  >
                    ⚡ Authorize £195 BACS Settlement & Unlock
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      // Hot-swap back to Admin to resolve or sign in as admin
                      setActiveUser({ id: 'usr-charlie', name: 'Charlie Hughes', email: 'charlie@aurelius.com', role: 'Admin' });
                      setPortalTab('admin');
                      triggerSuccess('Authenticated as super-admin: Suspension block override enabled.');
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all"
                  >
                    Authenticate as Chief Auditor Hughes (Override)
                  </button>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setCurrentView('marketing');
                      setMarketingSubPage('home');
                    }}
                    className="w-full py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase cursor-pointer rounded-lg transition-all"
                  >
                    Return to home directory
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE PORTAL MODULES WORKSPACE */
            <div className="flex-1 flex flex-col">
              
              {/* Premium Top Navigation header */}
              <header className="bg-white border-b border-slate-205 py-4 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left Metadata branding */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-105 rounded-xl border border-slate-200">
                      <Layers className="w-5 h-5 text-slate-850" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-950 tracking-tight uppercase leading-none">{activeClient?.name}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-450 rounded uppercase font-extrabold">
                          Isolated Space
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-450 mt-1">
                        Active User: <strong>{activeUser.name}</strong> ({activeUser.role}) • Security Token: SHA-256
                      </p>
                    </div>
                  </div>

                  {/* Right: Site Picker and Logout */}
                  <div className="flex flex-wrap items-center gap-3.5">
                    {/* Site selector picker - Hidden for Trainees to enforce isolation */}
                    {activeUser.role !== 'Trainee' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-550 font-mono">Viewing Site:</span>
                        <select
                          value={activeSiteId}
                          onChange={(e) => setActiveSiteId(e.target.value)}
                          className="bg-slate-50 border border-slate-250 text-xs text-slate-800 rounded-lg py-1.5 px-3 focus:outline-none focus:border-slate-850 font-bold"
                        >
                          {visibleSites.map((site) => (
                            <option key={site.id} value={site.id}>{site.name} • Score {site.score}%</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setCurrentView('marketing');
                        setMarketingSubPage('home');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </header>

              {/* Minimal horizontal Tabs row */}
              <div className="bg-white border-b border-neutral-200 px-6 py-1 shrink-0 text-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto text-xs font-bold font-sans">
                  {[
                    { id: 'overview', label: 'One-Page Director Panel' },
                    { id: 'ingestion', label: 'Document Ingestion Hub' },
                    { id: 'actions', label: 'Action Tracker Ledger' },
                    { id: 'logbook', label: 'Digital Fire Logbook' },
                    { id: 'vault', label: 'Document Library' },
                    { id: 'tutorial', label: 'Client Tutorial' },
                    { id: 'chat', label: 'Chat Support DM' },
                    { id: 'inspections', label: 'Tech Asset Checks' },
                    { id: 'training', label: 'Fire Training Academy' },
                    { id: 'billing', label: 'Finance & Subscriptions Hub' },
                    { id: 'admin', label: 'Admin Settings', adminOnly: true },
                    { id: 'schema', label: 'PostgreSQL Code Explorer' }
                  ].map((tab) => {
                    if (activeUser.role === 'Trainee') {
                      if (tab.id !== 'training') return null;
                    }
                    if (tab.adminOnly && activeUser.role !== 'Admin') return null;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setPortalTab(tab.id as any)}
                        className={`px-4 py-3 transition-all rounded-t-lg border-b-2 text-[11px] uppercase tracking-wider ${
                          portalTab === tab.id
                            ? 'border-neutral-900 text-neutral-900'
                            : 'border-transparent text-neutral-400 hover:text-neutral-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PORTAL INNER CONTAINER */}
              <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
                
                {/* PORTAL TAB 1: ONE-PAGE DIRECTOR INTEGRATED DASHBOARD */}
                {portalTab === 'overview' && (
                  <div className="space-y-8 animate-fadeIn text-left text-neutral-800">
                    
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900">One-Page Director Control Panel</h2>
                        <p className="text-xs text-neutral-500 font-sans">Corporate security governance monitoring, live drill registers, warden rosters, and BACS subscription streams.</p>
                      </div>

                      {/* Continuous BACS DD plan top badge */}
                      <div className="flex items-center gap-2">
                        {ddSubscribedSites.includes(activeSiteId) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Active BACS Direct Debit Plan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-250 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            Direct Debit Setup Required
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Terms & Conditions Agreement Status Panel */}
                    {activeClient?.agreedToTerms ? (
                      <div className="bg-emerald-50/60 border border-emerald-250 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-650 rounded-full flex items-center justify-center border border-emerald-200 shrink-0">
                            <Scale className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white uppercase px-1.5 py-0.2 rounded">LEGAL SIGN-OFF ACTIVE</span>
                              <span className="text-neutral-400 font-mono text-[9px]">Reference: AU-FSO-2026-HOLD-HARMLESS</span>
                            </div>
                            <h4 className="font-bold text-neutral-950 text-xs mt-1">Aurelius Liability Protection Agreement Approved</h4>
                            <p className="text-[11px] text-neutral-600 leading-normal mt-0.5 font-sans">
                              Your organization stands legally aligned with Lead Assessor Charlie Hughes’ zero-liability SaaS management covenant. Certified digital copy archived in local database and emailed to <strong>{activeClient?.email}</strong>. Approved by contact {activeClient?.contact} on {activeClient?.agreementDate || '2026-06-20'}.
                            </p>
                          </div>
                        </div>
                        <div className="p-2 py-1.5 bg-white border border-neutral-200 rounded-xl font-mono text-[10px] text-neutral-600 shrink-0">
                          📝 Signed: <strong>{activeClient?.contact}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50/50 border-2 border-amber-250 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center border border-amber-200 shrink-0 animate-pulse">
                            <Scale className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-900 uppercase">ACTION MANDATORY: Aurelius Zero-Liability Hold-Harmless Agreement</h3>
                            <p className="text-xs text-slate-500 mt-0.5 leading-normal">
                              Before taking ownership of your isolated digital logbooks under the UK Regulatory Reform Order 2005, your organization's legal representative (<strong>{activeClient?.contact}</strong>) must sign off our standard SaaS liability waiver.
                            </p>
                          </div>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4 text-xs leading-relaxed max-h-56 overflow-y-auto shadow-inner text-neutral-700">
                          <p className="font-extrabold text-neutral-900">AURELIUS FIRE SAFETY SYSTEMS LTD — TERMS OF USE & GENERAL INDEMNITY</p>
                          
                          <p>
                            <strong>1. STRICT ZERO LIABILITY ON MANAGEMENT SOFTWARE (HELD ACCOUNTABLE FOR NOTHING):</strong><br />
                            By registering or signing off these terms, the Client agrees that Aurelius Fire Risk Systems Ltd, its developers, partners, and Lead Assessor <strong>Charlie Hughes</strong> shall bear <strong>EXACTLY ZERO LIABILITY (£0.00 general liability cap)</strong> for any errors, accidental deletions, data losses, missed system synchronization events, or failure to flag maintenance alarms inside this SaaS digital management portal (including the Action Tracker, Digital Logbook, or Siren drill logs). 
                          </p>
                          <p>
                            The statutory "duty of care" and physical checking requirements under Section 15 of the Regulatory Reform (Fire Safety) Order 2005, the Fire Safety Act 2021, and the Building Safety Act 2022 rest <strong>strictly, exclusively, and continuously</strong> on the Client's nominated "Responsible Person" or "Competent Person". The software is a recording helper only and does not discharge any of your legal safety burdens.
                          </p>

                          <p>
                            <strong>2. PHYSICAL FIRE RISK ASSESSMENTS LIMITS (STANDARD COMPLIANCE ADVICE):</strong><br />
                            For physical site surveys booked through Aurelius on weekends, standard assessor consulting ownership applies under strict Level 1 non-destructive visual checks. Charlie Hughes completes fire risk assessment surveys <strong>strictly for easy, small-to-medium, low-risk commercial business settings only, such as gyms and leisure facilities. Charlie DOES NOT complete any fire risk assessments where people are sleeping (no hotels, no HMOs, no hostels, no care homes) and no highly complex large-scale high-rise residential properties.</strong>
                          </p>
                          <p>
                            Any reports issued target visual partition alignments and frame audits without destructive void analysis. Legal consulting liabilities are capped strictly at the physical visual fee value.
                          </p>
                        </div>

                        {/* Form fields for tick agreement and typing name signature */}
                        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          <div className="space-y-1 text-left">
                            <label htmlFor="terms-sig-input" className="text-[10px] font-mono font-bold text-stone-500 uppercase block pl-0.5">Type Legal Signature (Full Name)</label>
                            <input 
                              type="text"
                              id="terms-sig-input"
                              placeholder={activeClient?.contact || "Sarah Jenkins"}
                              className="w-full bg-white border border-neutral-300 rounded-lg py-2 px-3 text-xs font-bold font-mono focus:outline-none focus:border-stone-800"
                            />
                          </div>
                          <div className="flex flex-col gap-2 pt-2 md:pt-4">
                            <div className="flex items-center gap-2.5">
                              <input 
                                type="checkbox"
                                id="terms-agree-check"
                                className="w-4 h-4 accent-slate-900 border-stone-350 rounded cursor-pointer"
                              />
                              <label htmlFor="terms-agree-check" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                                I agree to the Zero-Liability SaaS terms and visual assessment scope.
                              </label>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const sigEl = document.getElementById('terms-sig-input') as HTMLInputElement;
                            const checkEl = document.getElementById('terms-agree-check') as HTMLInputElement;
                            if (!sigEl?.value.trim()) {
                              triggerSuccess('⚠️ Error: You must type your full name as a digital signature.');
                              return;
                            }
                            if (!checkEl?.checked) {
                              triggerSuccess('⚠️ Error: You must tick the box to explicitly agree to the terms.');
                              return;
                            }

                            // Call the parent agreement updater!
                            handleAgreeToTerms(activeClient.id, sigEl.value.trim());
                          }}
                          className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-extrabold text-xs uppercase rounded-xl shadow-sm tracking-wider transition-all w-full flex items-center justify-center gap-1.5"
                        >
                          ⚖️ Certify Zero-Liability Signature & Activate Workspace
                        </button>
                      </div>
                    )}

                    {/* Bento Score & Plan Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      
                      {/* Safety compliance percentage card */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">AURELIUS INDEX</span>
                          <h4 className="text-xs font-bold text-neutral-900 mt-1 uppercase">Compliance level</h4>
                        </div>
                        <div className="my-3 flex items-baseline gap-1.5">
                          <span className={`text-4xl font-extrabold font-mono ${
                            (currentActiveSite?.score || 100) >= 90 ? 'text-amber-605' : 'text-rose-700'
                          }`}>
                            {currentActiveSite?.score || 100}%
                          </span>
                          <span className="text-neutral-400 text-xs font-mono">/ 100 max</span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              (currentActiveSite?.score || 100) >= 90 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, currentActiveSite?.score || 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Site Address profiling */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs md:col-span-2 flex flex-col justify-between">
                        <div className="text-left">
                          <span className="inline-block text-[9px] font-mono text-white uppercase tracking-widest bg-neutral-900 px-2 py-0.5 rounded font-bold">Property profile</span>
                          <h4 className="text-base font-extrabold text-neutral-900 mt-2">{currentActiveSite?.name}</h4>
                          <p className="text-xs text-neutral-500 mt-1">{currentActiveSite?.address}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-400 pt-3 border-t border-neutral-100 mt-3">
                          <div>
                            <span>Last NEBOSH Survey:</span>
                            <span className="block text-neutral-800 font-bold">{currentActiveSite?.lastAssessment}</span>
                          </div>
                          <div>
                            <span>Continuous Renewal Target:</span>
                            <span className="block text-neutral-800 font-bold">{currentActiveSite?.nextAssessment}</span>
                          </div>
                        </div>
                      </div>

                      {/* Organization Account parameters */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Support Tier</span>
                          <h4 className="text-xs font-bold text-neutral-900 mt-1 uppercase">{activeClient?.subType}</h4>
                        </div>
                        <div className="text-[10px] text-neutral-500 space-y-1.5 leading-relaxed mt-2 animate-pulse">
                          <p>• Designated: <strong>{activeClient?.contact}</strong></p>
                          <p>• Region: Wirral / North West (UK)</p>
                        </div>
                        <span className="inline-block px-2.5 py-0.5 bg-neutral-50 border border-neutral-205 font-mono text-[9px] text-amber-700 rounded max-w-fit font-bold mt-2">
                          Multi-Tenant Isolated Space
                        </span>
                      </div>
                    </div>

                    {/* Year-on-Year Progress & NICE Report Exporters */}
                    <DashboardReports 
                      activeClient={activeClient}
                      activeSite={currentActiveSite}
                      triggerSuccess={triggerSuccess}
                      actions={actions}
                    />

                    {/* Integrated SaaS Bento Director Panel Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                      
                      {/* COLUMN 1: ACTIVE REMEDIATION TASKS & DIRECT DEBIT ENROLLMENT */}
                      <div className="space-y-6">
                        
                        {/* Task Remediations lists */}
                        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
                          <div className="border-b border-neutral-100 pb-2.5 flex justify-between items-center">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                              Required Actions
                            </h3>
                            <button onClick={() => setPortalTab('actions')} className="text-[10px] font-bold text-amber-600 hover:underline hover:text-amber-700 font-mono">
                              Full Ledger
                            </button>
                          </div>

                          <div className="divide-y divide-neutral-100 text-xs">
                            {actions.filter(t => t.propertyId === activeSiteId && t.status !== 'Resolved').length === 0 ? (
                              <div className="p-6 text-center text-neutral-400 text-[11px] italic">
                                Zero outstanding safety actions. Compliance healthy!
                              </div>
                            ) : (
                              actions.filter(t => t.propertyId === activeSiteId && t.status !== 'Resolved').map((act) => (
                                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 first:pt-0 text-left">
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="font-bold text-neutral-800 line-clamp-1">{act.checkType}</p>
                                    <p className="text-[11px] text-neutral-500 line-clamp-2">{act.details}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      handleToggleActionStatus(act.id, act.status);
                                      triggerSuccess(`Completed corrective action: ${act.checkType}`);
                                    }}
                                    className="p-1 px-1.5 bg-neutral-900 hover:bg-emerald-700 hover:text-white border border-neutral-800 text-[9px] text-amber-400 font-mono rounded font-bold transition-all shrink-0 uppercase"
                                    title="Click to mark action resolved instantly"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Direct Debit Setup Portal Inside Overview */}
                        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
                          <div className="border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-amber-600" />
                            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900">BACS Monthly Direct Debit</h3>
                          </div>

                          {ddSubscribedSites.includes(activeSiteId) ? (
                            <div className="p-3.5 bg-emerald-50 border border-emerald-205 text-emerald-800 rounded-xl space-y-2 text-xs">
                              <p className="font-bold flex items-center gap-1 text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Continuous Care Program Active
                              </p>
                              <p className="text-[10px] leading-relaxed text-emerald-800 font-sans">
                                Paid monthly (£49/mo) for remote compliance governance. Charlie's portal stays secure. Cancel at anytime.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3.5 text-xs">
                              <p className="text-[11px] text-neutral-505 leading-relaxed">
                                This site doesn't have an active physical FRA survey. Set up a secure monthly BACS Direct Debit for continuous portal support.
                              </p>

                              <div className="space-y-2 font-sans">
                                <input
                                  type="text"
                                  placeholder="Bank Account Name"
                                  value={dashDdAccountName}
                                  onChange={(e) => setDashDdAccountName(e.target.value)}
                                  className="w-full bg-stone-50 border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Sort Code"
                                    maxLength={6}
                                    value={dashDdSortCode}
                                    onChange={(e) => setDashDdSortCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-stone-50 border border-neutral-200 rounded-lg p-2 font-mono text-center text-xs tracking-wider focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Account Number"
                                    maxLength={8}
                                    value={dashDdAccountNumber}
                                    onChange={(e) => setDashDdAccountNumber(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-stone-50 border border-neutral-200 rounded-lg p-2 font-mono text-center text-xs tracking-wider focus:outline-none"
                                  />
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (!dashDdAccountName || !dashDdSortCode || !dashDdAccountNumber) {
                                    triggerError('Please fill bank details first.');
                                    return;
                                  }
                                  setDdSubscribedSites(prev => [...prev, activeSiteId]);
                                  triggerSuccess('Monthly BACS Direct Debit authorized. Remote compliance portal coverage activated.');
                                }}
                                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg transition-all"
                              >
                                Authorize Direct Debit (£49/mo)
                              </button>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* COLUMN 2: LOCAL FIRE WARDENS ROSTER & INSTANT DASHBOARD ONBOARDING */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-5">
                        <div className="border-b border-neutral-100 pb-2.5 flex justify-between items-center">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-amber-600 shrink-0" />
                            Site Fire Wardens
                          </h3>
                          <button onClick={() => setPortalTab('training')} className="text-[10px] font-bold text-amber-600 hover:underline hover:text-amber-700">
                            Training Hub
                          </button>
                        </div>

                        {/* List of active wardens */}
                        <div className="space-y-3">
                          {!(localWardens[activeSiteId]) || localWardens[activeSiteId].length === 0 ? (
                            <div className="p-4 p-y shadow-xs bg-stone-50 rounded-lg text-center text-[11px] text-neutral-500 italic">
                              No staff signed off as Warden yet. Please nominate/train someone.
                            </div>
                          ) : (
                            localWardens[activeSiteId].map((ward, i) => (
                              <div key={i} className="p-3 bg-stone-50 rounded-xl space-y-1.5 text-xs text-left">
                                <div className="flex justify-between items-center">
                                  <p className="font-extrabold text-neutral-900">{ward.name}</p>
                                  <span className="text-[8px] font-mono bg-neutral-900 text-white px-2 py-0.2 rounded uppercase font-bold tracking-wider">
                                    {ward.role}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-[9px] text-neutral-400 font-mono pt-1.5 border-t border-neutral-100/60">
                                  <span>State: Certified</span>
                                  <span className="text-neutral-600 font-bold">{ward.cert}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Fast nomination form */}
                        <div className="border-t border-neutral-100 pt-4 space-y-3 text-left p-0">
                          <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 font-mono">Nominate New Site Warden</h4>
                          
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={newDashboardWardenName}
                              onChange={(e) => setNewDashboardWardenName(e.target.value)}
                              className="w-full bg-stone-50 border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none"
                              placeholder="Staff name"
                            />

                            <select
                              value={newDashboardWardenRole}
                              onChange={(e) => setNewDashboardWardenRole(e.target.value as any)}
                              className="w-full bg-stone-50 border border-neutral-205 rounded-lg p-2 text-xs font-bold focus:outline-none"
                            >
                              <option value="Fire Warden">Physical Fire Warden (RRO 2005)</option>
                              <option value="Keyholder">Designated Out-of-Hours Keyholder</option>
                            </select>

                            <button
                              onClick={() => {
                                if (!newDashboardWardenName) {
                                  triggerError('Please enter the name of the warden candidate.');
                                  return;
                                }

                                const newWard = {
                                  name: newDashboardWardenName,
                                  role: newDashboardWardenRole,
                                  cert: `AR-DASH-${Math.floor(1000 + Math.random()*9000)}`
                                };

                                setLocalWardens(prev => {
                                  const list = prev[activeSiteId] || [];
                                  return {
                                    ...prev,
                                    [activeSiteId]: [...list, newWard]
                                  };
                                });

                                setNewDashboardWardenName('');
                                triggerSuccess(`Enlisted ${newDashboardWardenName} as ${newDashboardWardenRole}. Cert issued on training.`);
                              }}
                              className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg text-xs"
                            >
                              Appoint & Dispatch Certificate
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* COLUMN 3: BIANNUAL 6-MONTH FIRE DRILL STATUS & SIMULATOR */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-5 flex flex-col justify-between min-h-[460px]">
                        <div className="space-y-4">
                          <div className="border-b border-neutral-100 pb-2.5 flex justify-between items-center">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                              <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                              6-Month Fire Drill
                            </h3>
                            <span className="text-[9px] font-mono font-bold bg-[#FAF9F6] px-2 py-0.5 rounded text-neutral-500 border border-neutral-200">
                              Biannual
                            </span>
                          </div>

                          {/* Countdown Indicator */}
                          {(() => {
                            const days = drillDaysLeft;
                            let statusColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                            let statusText = `🟢 Compliant (${days} days remaining)`;
                            if (days < 0) {
                              statusColor = "bg-rose-50 text-rose-800 border-rose-200 animate-pulse";
                              statusText = `🔴 OVERDUE BY ${Math.abs(days)} DAYS!`;
                            } else if (days <= 30) {
                              statusColor = "bg-amber-50 text-amber-800 border-amber-200 animate-pulse";
                              statusText = `🟡 Nearing Target (${days} days remaining)`;
                            }
                            return (
                              <div className={`p-3 border rounded-xl text-center font-bold text-xs uppercase tracking-wider ${statusColor}`}>
                                {statusText}
                              </div>
                            );
                          })()}

                          {/* Prev Drill Results (Stopwatch time & notes) */}
                          <div className="p-3 bg-[#FAF9F6] border border-neutral-150 rounded-xl space-y-2 text-xs text-left">
                            <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                              <span className="font-mono text-[9px] uppercase text-neutral-400 font-bold">Previous stopwatch result:</span>
                              <div className="flex items-center gap-1 font-mono font-bold text-neutral-950">
                                <Timer className="w-3.5 h-3.5 text-amber-600" style={{ animationDuration: '6s' }} />
                                <span>{fireDrills[activeSiteId]?.previousDuration || 'N/A'}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Observations Notes:</p>
                              <p className="text-[11px] text-neutral-600 italic leading-relaxed line-clamp-4">
                                "{fireDrills[activeSiteId]?.previousNotes || 'No previous results logged.'}"
                              </p>
                            </div>
                            <div className="pt-1.5 border-t border-neutral-100/60 flex justify-between text-[10px] text-neutral-400 font-mono">
                              <span>Last Drill:</span>
                              <span className="text-neutral-750 font-bold">{fireDrills[activeSiteId]?.lastDrillDate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Direct link to Drill sub page on Digital Firelog */}
                        <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPortalTab('logbook');
                              setLogbookSubTab('drill');
                              window.scrollTo({ top: 100, behavior: 'smooth' });
                            }}
                            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
                          >
                            <Flame className="w-4 h-4 text-amber-500 animate-pulse animate-duration-1000" />
                            Launch Drill Simulator
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setPortalTab('logbook');
                              setLogbookSubTab('drill');
                              window.scrollTo({ top: 500, behavior: 'smooth' });
                            }}
                            className="w-full py-2 border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700 hover:text-neutral-900 font-semibold rounded-lg text-[11px] tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-neutral-400" />
                            Manage Drill History
                          </button>
                        </div>

                      </div>

                      {/* COLUMN 4: DIGITAL FIRELOG & INSTANT LOGGING ACTION */}
                      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-5">
                        <div className="border-b border-neutral-100 pb-2.5 flex justify-between items-center">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                            Digital Firelog test Feed
                          </h3>
                          <button onClick={() => setPortalTab('logbook')} className="text-[10px] font-bold text-amber-600 hover:underline hover:text-amber-700">
                            Logbook Tab
                          </button>
                        </div>

                        {/* Recent log entries */}
                        <div className="space-y-3 text-xs leading-relaxed">
                          {logs.filter(l => l.propertyId === activeSiteId).slice(0, 3).map((lh) => (
                            <div key={lh.id} className="p-3 bg-stone-50 rounded-xl space-y-1 block text-left">
                              <div className="flex justify-between items-start gap-1">
                                <p className="font-bold text-neutral-800">{lh.checkType}</p>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                                  lh.status === 'Pass' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {lh.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-505 leading-normal font-sans line-clamp-2">{lh.notes}</p>
                              <p className="text-[9px] text-neutral-400 font-mono pt-1 border-t border-neutral-100 mt-1">Logged: {lh.timestamp} by {lh.userName}</p>
                            </div>
                          ))}
                        </div>

                        {/* Quick log button widget */}
                        <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-left p-0">
                          <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 font-mono">Auditor Fast Sound test sounder Verification</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <button
                              onClick={() => {
                                handleFirelogSubmit(activeSiteId, 'Weekly Fire Alarm Test', 'Pass');
                                triggerSuccess('Alarm sounder PASS log recorded inside BACS ledger.');
                              }}
                              className="py-2.5 bg-emerald-50/50 hover:bg-emerald-100/60 border border-emerald-200 text-emerald-800 rounded-lg font-bold text-center flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-605" />
                              Log Pass Siren
                            </button>
                            <button
                              onClick={() => {
                                handleFirelogSubmit(activeSiteId, 'Weekly Fire Alarm Test', 'Fail');
                                triggerError('Alarm failure recorded. Severe action corrective mapped.');
                              }}
                              className="py-2.5 bg-rose-50/50 hover:bg-rose-100/60 border border-rose-200 text-rose-800 rounded-lg font-bold text-center flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Log Fail Siren
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Staged Regulatory Documents quick retrieval bar */}
                    <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
                      <div className="border-b border-neutral-100 pb-2.5 flex justify-between items-center">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-950 flex items-center gap-1.5 font-sans animate-pulse">
                          <BookOpen className="w-4 h-4 text-amber-600" />
                          Compliance Document Cabinet Quick Retrieval
                        </h3>
                        <button onClick={() => setPortalTab('vault')} className="text-[10px] font-bold text-amber-600 hover:underline hover:text-amber-700">
                          Library Vault
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs select-text">
                        {documents.slice(0, 3).map((dc) => (
                          <div key={dc.id} className="p-3 bg-stone-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-3 text-left">
                            <div className="min-w-0">
                              <p className="font-bold text-neutral-800 truncate" title={dc.title}>{dc.title}</p>
                              <p className="text-[10px] text-neutral-450 font-mono mt-0.5">{dc.type} • {dc.fileSize}</p>
                            </div>
                            <button
                              onClick={() => triggerSuccess(`Secure download dispatched for: ${dc.title}`)}
                              className="px-2 py-1 bg-white border border-neutral-200 hover:bg-[#1C1C1E] hover:text-white rounded text-[10px] font-mono font-bold transition-all shrink-0"
                            >
                              Get
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* PORTAL TAB 2: COMPLIANCE INGESTION HUB */}
                {portalTab === 'ingestion' && (
                  <DocumentIngestionHub 
                    activeSite={currentActiveSite}
                    onUpdateSiteCompliance={handleUpdateSiteCompliance}
                    onAddGeneratedActions={handleAddGeneratedActions}
                    triggerSuccess={triggerSuccess}
                  />
                )}

                {/* PORTAL TAB 3: ACTION TRACKER */}
                {portalTab === 'actions' && (
                  <ActionTracker 
                    tasks={actions}
                    onToggleStatus={handleToggleActionStatus}
                    activeUser={activeUser}
                    activeSite={currentActiveSite}
                    triggerSuccess={triggerSuccess}
                    onAddManualAction={(newAct) => setActions(prev => [newAct, ...prev])}
                  />
                )}

                {/* PORTAL TAB 4: DIGITAL LOGBOOK */}
                {portalTab === 'logbook' && (
                  <DigitalLogbook 
                    logs={logs}
                    onFirelogSubmit={handleFirelogSubmit}
                    onFirelogDelete={handleDeleteLog}
                    activeSite={currentActiveSite}
                    activeUser={activeUser}
                    triggerSuccess={triggerSuccess}
                    fireDrillsHistory={fireDrillsHistory}
                    onAddFireDrill={handleLogFireDrill}
                    onDeleteFireDrill={handleOnDeleteFireDrill}
                    onAddDrillComment={handleOnAddDrillComment}
                    activeSubTab={logbookSubTab}
                    onChangeSubTab={setLogbookSubTab}
                  />
                )}

                {/* PORTAL TAB 5: DOCUMENT LIBRARY */}
                {portalTab === 'vault' && (
                  <DocumentLibrary 
                    documents={documents}
                    activeSite={currentActiveSite}
                    activeUser={activeUser}
                    triggerSuccess={triggerSuccess}
                  />
                )}

                {/* PORTAL TAB 6: ADMIN CONTROL (Charlie only) */}
                {portalTab === 'admin' && activeUser.role === 'Admin' && (
                  <AdminControl 
                    clients={clients}
                    onToggleSuspension={handleToggleSuspension}
                    onDeleteClient={handleDeleteClient}
                    onAddClient={handleAddNewClient}
                    triggerSuccess={triggerSuccess}
                  />
                )}

                {/* PORTAL TAB 7: POSTGRESQL CODE EXPLORER */}
                {portalTab === 'schema' && (
                  <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <FileCode className="w-5 h-5 text-slate-700 animate-pulse" />
                          Enterprise DDL Database Representation
                        </h3>
                        <p className="text-xs text-slate-450 mt-1">Standard transactional SQL directives matching complete multi-tenant partitioning structures.</p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(POSTGRESQL_DDL);
                          triggerSuccess('SQL schema copied to your clipboard buffer.');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold font-sans rounded-md text-[10px] uppercase transition-all flex items-center gap-1"
                      >
                        Copy SQL
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-900 text-amber-400 font-mono text-[10px] leading-relaxed rounded-xl overflow-x-auto max-h-96">
                      {POSTGRESQL_DDL}
                    </pre>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-500 space-y-1.5">
                      <p className="font-bold text-slate-700">Multi-Tenancy Structural Execution:</p>
                      <p>
                        Our DDL establishes strict reference partitioning using UUID foreign keys targeting the <code>organizations</code> table. A PL/pgSQL trigger protects the <code>firelog_entries</code> table by raising exceptions if anyone attempts <code>UPDATE</code> or <code>DELETE</code> statements, creating an immutable audit trail.
                      </p>
                    </div>
                  </div>
                )}

                {portalTab === 'training' && (
                  <FireTraining 
                    activeUser={activeUser}
                    activeSite={currentActiveSite}
                    trainees={trainees}
                    onAddTrainee={handleAddTrainee}
                    onPassTraining={handlePassTraining}
                    onSimulateYearPassage={handleSimulateYearPassage}
                    triggerEmail={handleTriggerEmail}
                    triggerSuccess={triggerSuccess}
                  />
                )}

                {portalTab === 'billing' && (
                  <FinanceHub 
                    activeClient={activeClient}
                    activeSite={currentActiveSite}
                    triggerEmail={handleTriggerEmail as any}
                    ddSubscribedSites={ddSubscribedSites}
                    setDdSubscribedSites={setDdSubscribedSites}
                    sites={sites}
                    setSites={setSites}
                    triggerSuccess={triggerSuccess}
                    hasChatSupport={hasChatSupport}
                    onToggleChatSupport={handleToggleChatSupport}
                  />
                )}

                {portalTab === 'chat' && (
                  <ChatSupportPortal
                    activeUser={activeUser}
                    activeClient={activeClient}
                    triggerSuccess={triggerSuccess}
                    hasChatSupport={hasChatSupport}
                    onToggleChatSupport={handleToggleChatSupport}
                  />
                )}

                {portalTab === 'tutorial' && (
                  <ClientTutorial 
                    activeUser={activeUser}
                    triggerSuccess={triggerSuccess}
                  />
                )}

                {portalTab === 'inspections' && (
                  <ModernChecks 
                    activeSite={currentActiveSite}
                    triggerSuccess={triggerSuccess}
                    onAddManualAction={(task) => {
                      const newTask: RemediationTask = {
                        id: `act-check-${Date.now()}`,
                        propertyId: currentActiveSite?.id || 'site-1',
                        checkType: task.checkType,
                        severity: task.severity || 'Medium',
                        status: 'Open',
                        assignedTo: activeUser.name,
                        loggedAt: new Date().toISOString().split('T')[0],
                        details: task.details
                      };
                      setActions(prev => [newTask, ...prev]);
                    }}
                  />
                )}

              </main>

              {/* Minimal platform footer */}
              <footer className="bg-white border-t border-slate-200 py-6 text-center text-slate-400 text-xs mt-auto font-mono shrink-0">
                <p>© 2026 Aurelius Fire Risk Systems Ltd. NEBOSH Standards Inspected. London, United Kingdom.</p>
              </footer>

            </div>
          )}
        </div>
      )}

      {/* 📧 LIVE OUTBOUND SMTP INTEGRATION DIALOG */}
      {showSmtpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn text-left">
          <div className="bg-[#FAF9F6] border border-neutral-250 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-mono tracking-widest text-[#9A9084] uppercase font-bold bg-neutral-200 px-2 py-0.5 rounded">System Integration</span>
                <h3 className="text-xl font-bold font-display text-neutral-900">📧 SMTP Outbound Mail Configuration</h3>
                <p className="text-xs text-neutral-500">Configure your active mail server settings to send real-time Direct Debit notifications and training alerts directly to your customers' inbox.</p>
              </div>
              <button onClick={() => setShowSmtpModal(false)} className="p-1 text-neutral-450 hover:text-neutral-900 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9A9084]">SMTP Outbound Host</label>
                  <input
                    type="text"
                    value={smtpSettings.host}
                    onChange={(e) => {
                      const updated = { ...smtpSettings, host: e.target.value };
                      setSmtpSettings(updated);
                      localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                    }}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-white border border-neutral-250 rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-450"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9A9084]">Port</label>
                  <input
                    type="text"
                    value={smtpSettings.port}
                    onChange={(e) => {
                      const updated = { ...smtpSettings, port: e.target.value };
                      setSmtpSettings(updated);
                      localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                    }}
                    placeholder="587"
                    className="w-full bg-white border border-neutral-250 rounded-lg p-2 text-xs font-bold font-mono text-center focus:outline-none focus:ring-1 focus:ring-neutral-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9A9084]">SMTP Username / Email</label>
                  <input
                    type="email"
                    value={smtpSettings.user}
                    onChange={(e) => {
                      const updated = { ...smtpSettings, user: e.target.value };
                      setSmtpSettings(updated);
                      localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                    }}
                    placeholder="vacationvault1923@gmail.com"
                    className="w-full bg-white border border-neutral-250 rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-450"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9A9084]">Password / App Password</label>
                  <input
                    type="password"
                    value={smtpSettings.pass}
                    onChange={(e) => {
                      const updated = { ...smtpSettings, pass: e.target.value };
                      setSmtpSettings(updated);
                      localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                    }}
                    placeholder="••••••••••••••••"
                    className="w-full bg-white border border-neutral-250 rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-450"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[#9A9084]">Friendly Sender (From)</label>
                  <input
                    type="text"
                    value={smtpSettings.from}
                    onChange={(e) => {
                      const updated = { ...smtpSettings, from: e.target.value };
                      setSmtpSettings(updated);
                      localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                    }}
                    placeholder="vacationvault1923@gmail.com"
                    className="w-full bg-white border border-neutral-250 rounded-lg p-2 text-xs font-bold font-mono focus:outline-none focus:ring-1 focus:ring-neutral-450"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={smtpSettings.secure}
                      onChange={(e) => {
                        const updated = { ...smtpSettings, secure: e.target.checked };
                        setSmtpSettings(updated);
                        localStorage.setItem('aurelius_smtp_settings', JSON.stringify(updated));
                      }}
                      className="rounded border-neutral-250 text-neutral-900 focus:ring-neutral-450 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-neutral-600">Secure (SSL / TLS 465)</span>
                  </label>
                </div>
              </div>

              {/* INTEGRATION TESTING PANEL */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
                <p className="text-[10px] uppercase font-bold text-amber-500 font-mono tracking-wider flex items-center gap-1">⚡ Dynamic Outbound Diagnostics</p>
                <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">
                  To test connection, enter your target recipient email below and trigger a diagnostic packet. If mail successfully arrives, your credentials are valid.
                </p>
                <div className="flex gap-2">
                  <input
                    id="smtpTestEmail"
                    type="email"
                    placeholder="recipient@examplestore.com"
                    defaultValue={smtpSettings.user}
                    className="flex-1 bg-[#FAF9F6] border border-neutral-250 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:outline-none"
                  />
                  <button
                    onClick={async () => {
                      const emailInputValue = (document.getElementById('smtpTestEmail') as HTMLInputElement)?.value || smtpSettings.user;
                      if (!emailInputValue) {
                        triggerError('Please enter a test recipient email first.');
                        return;
                      }
                      triggerSuccess('Initiating SMTP handshake with server...');
                      await sendRealEmail(
                        emailInputValue,
                        'Aurelius Fire Risk Compliance - Active SMTP Test Hook',
                        `Dear Aurelius Operator,\n\nCongratulations! Your live SMTP outbound integration is now configured and speaking correctly.\n\n💼 METRICS CALIBRATED:\n• Host Transport Secured: Yes (${smtpSettings.host}:${smtpSettings.port})\n• Sender Authorized Profile: ${smtpSettings.from}\n\nAll subsequent automated customer invites and regulatory direct debit instructions built inside the browser will now dispatch actual outbound emails to customers.\n\nCharlie Hughes\nLead Fire Assessor, Aurelius Fire Safety Ltd.`
                      );
                    }}
                    className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Send Test Packet
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-mono">
                {smtpSettings.pass ? "🟢 Credentials Recorded" : "🟠 Operating in Sandbox Mock Mode"}
              </span>
              <button
                onClick={() => {
                  setShowSmtpModal(false);
                  triggerSuccess('Outbound SMTP settings updated and stored securely.');
                }}
                className="px-6 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Accept & Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
