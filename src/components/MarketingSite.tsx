import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Building2, 
  BookOpen, 
  Send, 
  ChevronRight, 
  FileText, 
  Lock, 
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  CreditCard,
  Sparkles,
  Info
} from 'lucide-react';

interface MarketingSiteProps {
  onLoginSimulate: (email: string, pass: string) => void;
  triggerSuccess: (msg: string) => void;
  currentMarketingSubPage: string;
  setMarketingSubPage: (page: string) => void;
  onSignUpClient: (
    newClient: any,
    newBuildingName: string,
    newBuildingAddress: string
  ) => void;
}

export default function MarketingSite({
  onLoginSimulate,
  triggerSuccess,
  currentMarketingSubPage,
  setMarketingSubPage,
  onSignUpClient
}: MarketingSiteProps) {
  
  // Interactive Assessment & Quoting Engine
  const [propertyType, setPropertyType] = useState('Commercial Office');
  const [numDoors, setNumDoors] = useState(12);
  const [numExtinguishers, setNumExtinguishers] = useState(6);
  const [postcode, setPostcode] = useState('');

  // Subscription Enrollment Wizard States
  const [signupStep, setSignupStep] = useState(1); // 1: Package, 2: Company Info, 3: BACS bank, 4: Receipt & Login
  const [signUpPackage, setSignUpPackage] = useState<'Standard Professional' | 'Enterprise Elite' | 'Basic Care'>('Standard Professional');
  const [signUpCompanyName, setSignUpCompanyName] = useState('');
  const [signUpBuildingName, setSignUpBuildingName] = useState('');
  const [signUpBuildingAddress, setSignUpBuildingAddress] = useState('');
  const [signUpPostcode, setSignUpPostcode] = useState('');
  const [signUpContactName, setSignUpContactName] = useState('');
  const [signUpContactEmail, setSignUpContactEmail] = useState('');
  const [signUpContactPhone, setSignUpContactPhone] = useState('');
  const [signUpBankName, setSignUpBankName] = useState('');
  const [signUpDdAccountName, setSignUpDdAccountName] = useState('');
  const [signUpDdSortCode, setSignUpDdSortCode] = useState('');
  const [signUpDdAccountNumber, setSignUpDdAccountNumber] = useState('');
  const [signUpDdAgreed, setSignUpDdAgreed] = useState(false);
  const [signUpPassword, setSignUpPassword] = useState(() => 'aur-' + Math.floor(1000 + Math.random() * 9000));
  
  // Service mode selection inside the quote tool
  const [serviceMode, setServiceMode] = useState<'in_person' | 'remote_dd'>('in_person');
  
  // Quote Response State
  const [quoteOutput, setQuoteOutput] = useState<{
    eligible: boolean;
    distanceHours: number;
    oneOffFee: string;
    monthlyFee: string;
    scoreProjection: number;
    breachPredictors: string[];
    bacsActive: boolean;
  } | null>(null);

  // Direct Debit Form State
  const [ddAccountName, setDdAccountName] = useState('');
  const [ddSortCode, setDdSortCode] = useState('');
  const [ddAccountNumber, setDdAccountNumber] = useState('');
  const [ddConfirmed, setDdConfirmed] = useState(false);
  const [ddApprovedTransaction, setDdApprovedTransaction] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Business quick-enroll state
  const [b2bCompanyName, setB2bCompanyName] = useState('');
  const [b2bSortCode, setB2bSortCode] = useState('');
  const [b2bAccountNumber, setB2bAccountNumber] = useState('');
  const [b2bCompleted, setB2bCompleted] = useState(false);
  const [b2bReferenceId, setB2bReferenceId] = useState('');

  // GDPR status controls state
  const [gdprToken, setGdprToken] = useState('DPA_SHA256_ACTIVE_SECURE_TOKEN_AUR_982');
  const [rotated, setRotated] = useState(false);

  // Drive-Time postcode verifier based on CH48 5HP (Wirral, UK)
  const evaluatePostcodeEligibility = (code: string): { eligible: boolean, hours: number } => {
    const formatted = code.trim().toUpperCase().replace(/\s+/g, '');
    if (!formatted) return { eligible: false, hours: 999 };

    // Common Postcode prefixes within a ~2-hour driving window of Wirral (CH48 5HP):
    // CH (Chester/Wirral), L (Liverpool), WA (Warrington), WN (Wigan), M (Manchester), CW (Crewe), SK (Stockport),
    // LL (North Wales near Flintshire/Wrexham), BL (Bolton), OL (Oldham), PR (Preston), FY (Blackpool),
    // BB (Blackburn), ST (Stoke on Trent), TF (Telford), SY (Shrewsbury), LA (Lancaster)
    const validAreaPrefixes = [
      'CH', 'L', 'WA', 'WN', 'M', 'CW', 'SK', 'LL', 'BL', 'OL', 'PR', 'FY', 'BB', 'ST', 'TF', 'SY', 'LA'
    ];

    // Extract characters before the first digit
    const match = formatted.match(/^([A-Z]+)/);
    if (match) {
      const prefix = match[1];
      if (validAreaPrefixes.includes(prefix)) {
        // Generate simulated realistic travel time between 0.3 hrs (on the Wirral) and 1.8 hrs (Lancaster/Shropshire)
        let timeHours = 0.5;
        if (prefix === 'CH') timeHours = 0.3;
        else if (['L', 'WA'].includes(prefix)) timeHours = 0.6;
        else if (['M', 'CW', 'WN', 'BL'].includes(prefix)) timeHours = 1.1;
        else timeHours = 1.6;

        return { eligible: true, hours: timeHours };
      }
    }

    return { eligible: false, hours: 3.5 }; // Defaults as too far (e.g. London EC/SW, Edinburgh EH)
  };

  const handleCreateAIQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode) {
      triggerSuccess('Please enter a target property postcode first.');
      return;
    }

    const locVer = evaluatePostcodeEligibility(postcode);
    
    // Core safety pricing formulas (UK commercial standards)
    const baseSurveyPrice = propertyType === 'Gym / Leisure Facility' ? 395 : propertyType === 'Retail / Clinic' ? 295 : 320;
    const computedOneOff = baseSurveyPrice + (numDoors * 14) + (numExtinguishers * 12);
    
    const projectedScore = Math.max(68, Math.min(98, 100 - (numDoors * 0.4) - (numExtinguishers * 0.2)));

    // Specific UK Fire Reg predictors & indicators
    const predictions = [
      `Potential breach under BS 5839: Part 1 if manual break-glass alerts lack 30-meter proximity sweeps.`,
      `Fire Door intumescent gasket seal tolerances require at least ${Math.ceil(numDoors * 0.2)} retrofitted cold-smoke blocks.`,
      `Estimated water loads dictate Class A dry powder extinguisher redundancy across main circulation zones.`
    ];

    setQuoteOutput({
      eligible: locVer.eligible,
      distanceHours: locVer.hours,
      oneOffFee: `£${computedOneOff}`,
      monthlyFee: serviceMode === 'remote_dd' ? '£49' : '£89',
      scoreProjection: Math.round(projectedScore),
      breachPredictors: predictions,
      bacsActive: false
    });

    if (locVer.eligible) {
      triggerSuccess(`Aurelius AI Quote calibrated. Site is inside the 2-hour field survey zone.`);
    } else {
      triggerSuccess(`Postcode verified outside 2-hour radius. Prompting remote compliance Direct Debit setup.`);
    }
  };

  const handleActivateDirectDebit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ddAccountName || !ddSortCode || !ddAccountNumber) {
      triggerSuccess('Please fill all banking fields to sign up.');
      return;
    }

    setDdApprovedTransaction(true);
    triggerSuccess('Direct Debit verified. BACS Instruction dispatched successfully to your bank.');
    if (quoteOutput) {
      setQuoteOutput(prev => prev ? { ...prev, bacsActive: true } : null);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    triggerSuccess('Inquiry received. Lead Assessor Charlie Hughes (NEBOSH Cert) will review details shortly.');
    setTimeout(() => {
      setContactSent(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 4000);
  };

  // Outbound Subscription signup submit handler
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpDdAgreed) {
      triggerSuccess('Please agree to the BACS Direct Debit guarantee terms.');
      return;
    }
    if (!signUpCompanyName || !signUpBuildingName || !signUpPostcode || !signUpContactName || !signUpContactEmail) {
      triggerSuccess('Please fill in your complete business and contact credentials.');
      return;
    }
    if (!signUpDdSortCode || !signUpDdAccountNumber) {
      triggerSuccess('Please fill in your BACS bank account details.');
      return;
    }

    const clientId = `client-dyn-${Date.now()}`;
    const newClientObj = {
      id: clientId,
      name: signUpCompanyName,
      contact: signUpContactName,
      email: signUpContactEmail,
      phone: signUpContactPhone,
      status: 'Active' as const,
      subType: signUpPackage,
      paymentStatus: 'Paid' as const,
      agreedToTerms: true,
      agreementDate: new Date().toISOString().split('T')[0],
      password: signUpPassword
    };

    onSignUpClient(newClientObj, signUpBuildingName, `${signUpBuildingAddress} ${signUpPostcode}`);
    setSignupStep(4);
  };

  const simulatedCredentials = [
    {
      label: 'Super Admin - Lead Assessor',
      name: 'Charlie Hughes (Aurelius)',
      email: 'charlie@aurelius.com',
      pass: 'nebosh2026',
      desc: 'Supervise all accounts, verify digital firelogs, generate AI assessments, and toggle client states.'
    },
    {
      label: 'Client Admin - Estate Manager',
      name: 'Sarah Jenkins (Apex Managed)',
      email: 'sarah@apexliving.com',
      pass: 'apex2026',
      desc: 'Manage isolated multi-family blocks. Respond to actions, download certificates, review invoices.'
    },
    {
      label: 'E-Learning Trainee - Employee',
      name: 'Sophia Smith (Apex Staff)',
      email: 'sophia@apexliving.com',
      pass: 'sophia2026',
      desc: 'E-Learning access only. View interactive PASS video, complete 3-question exam, and sign off.'
    }
  ];

  return (
    <div className="flex-1 bg-[#FAF9F6] font-sans text-[#1C1C1E] flex flex-col selection:bg-amber-600 selection:text-white">
      
      {/* HOME TAB - APPLE MINIMALIST SCREEN */}
      {currentMarketingSubPage === 'home' && (
        <div className="space-y-16 py-10 md:py-16">
          
          {/* Hero Header */}
          <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-mono tracking-wider uppercase">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>Charlie Hughes • NEBOSH Certificated</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium tracking-tight text-neutral-900 leading-none">
                Simplicity in design. <br />
                <span className="text-neutral-500">Certainty in fire safety.</span>
              </h1>
              
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                Aurelius represents the premium standard in elite fire compliance. Led by <strong>Charlie Hughes (NEBOSH Fire Safety Certificate)</strong>, we merge rigorous physical survey expertise with a hyper-focused multi-tenant digital control system to safeguard your commercial estates.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setMarketingSubPage('demo-estimator')}
                  className="px-5 py-3 bg-neutral-900 border border-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5"
                >
                  Configure AI Compliance Quote
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onLoginSimulate('charlie@aurelius.com', 'nebosh2026')}
                  className="px-5 py-3 bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Explore Sandbox Portal
                </button>
              </div>
            </div>

            {/* Simulated Clean Tablet Device preview */}
            <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-3xl p-6 shadow-sm text-left space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">Digital Firelog Compliance</span>
                </div>
                <span className="px-2 py-0.5 bg-neutral-100 text-[9px] font-mono rounded text-stone-500">RRO 2005</span>
              </div>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">Compliance</span>
                    <p className="text-lg font-bold font-mono text-neutral-900">98%</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">Warden Sign-Off</span>
                    <p className="text-lg font-bold font-mono text-emerald-700">Fully Certified</p>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F6] border border-neutral-150 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-amber-700">Assointed Remediation</span>
                    <span className="px-1.5 py-0.2 bg-rose-50 text-[8px] font-bold text-rose-700 rounded">Urgent</span>
                  </div>
                  <p className="font-bold text-neutral-800 text-[11px]">Install double-leaf acoustic safety fire-door seals</p>
                  <p className="text-[10px] text-neutral-500 leading-normal italic">
                    "Intumescent gaskets form critical flame blocks, securing escape corridors under BS 5839 standards."
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Philosophy Banner */}
          <section className="bg-white border-y border-neutral-200/50 py-12">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B45309] block font-bold">Risk Assessor Scope & Training</span>
              <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 text-xs font-medium text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                  <span>NEBOSH Fire Safety Certified Only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                  <span>Gym & Leisure Specialist Focus</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                  <span>Level 1 Visual Inspection Only</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                  <span>Strictly Non-Sleeping Properties</span>
                </div>
              </div>
            </div>
          </section>

          {/* Three Minimal Pillars */}
          <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">01</div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-950 uppercase">Automated Document Parsing</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Directly drag and drop PDFs of manual building surveys. Our secure engine translates raw compliance scans into active, trackable safety indicators.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">02</div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-950 uppercase">Digital Evacuation Logs</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Log weekly break-glass alarm soundings, emergency lighting discharge tests, and physical escape route clearances with permanent BAFE signatures.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center font-bold">03</div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-950 uppercase">Staff Training Onboarding</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Provide on-site personnel with interactive e-learning and sign-offs for extinguisher handling, warden obligations, and keyholder procedures.
              </p>
            </div>
          </section>

          {/* NEW SECTION 1: GET QUOTE AND PORTAL MEMBERSHIP PLATFORM */}
          <section className="bg-white border-y border-neutral-200/50 py-16">
            <div className="max-w-7xl mx-auto px-6 text-left space-y-10">
              
              <div className="border-b border-stone-200 pb-5 max-w-2xl">
                <span className="text-[10px] font-mono uppercase bg-neutral-900 text-white px-2.5 py-0.5 rounded font-bold">Transparent B2B Pricing & Portals</span>
                <h2 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-2">
                  Choose a Path to Certify Your Business
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Get a full regulatory compliance quote or instantly unlock a B2B Portal Membership to self-manage safety checks, alarm tests, and staff certifications with BACS guarantee.
                </p>
              </div>

              {b2bCompleted ? (
                <div className="bg-emerald-50 border border-emerald-250 p-6 rounded-2xl max-w-xl space-y-3 animate-scaleUp">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-emerald-950 text-sm uppercase">B2B Portal Activation Complete</h4>
                  </div>
                  <div className="text-xs text-emerald-800 space-y-1.5 leading-relaxed">
                    <p>
                      Thank you for enrolling <strong>{b2bCompanyName}</strong> in the Aurelius Pro Compliance Membership!
                    </p>
                    <p>
                      Your BACS Direct Debit setup was approved. Your unique login is now active. Use the 
                      <strong className="text-neutral-900"> Sandbox Portal</strong> launcher below to instantly simulate managing safety diaries as sarah@apexliving.com or your certified firewardens.
                    </p>
                    <p className="font-mono text-[10px] text-emerald-700 bg-white/60 p-2 rounded border border-emerald-100">
                      BACS Registration ID: {b2bReferenceId} | Monthly rate: £49 | Status: Active Secure
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  
                  {/* Option 1 Card: Self-Service B2B Portal Membership */}
                  <div className="lg:col-span-5 bg-neutral-900 text-white border border-neutral-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-black">MEMBERSHIP MODEL</span>
                          <h3 className="text-lg font-bold uppercase tracking-tight mt-1 text-white">B2B Pro Compliance Portal</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-white text-neutral-900 rounded-full font-mono text-xs font-bold">
                          £49/mo
                        </span>
                      </div>
                      
                      <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                        Perfect for businesses that just want to use the premium digital dashboard to run, schedule, and record their weekly/monthly safety check logs.
                      </p>

                      <ul className="text-xs text-neutral-200 space-y-2 font-mono">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Unlimited weekly sounder alarms & escape trace logs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Digital Fire Warden training checklists & sign-offs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Interactive compliance ledger under RRO 2005</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Full client file vault (with up to 5 GB storage)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-6 pt-5 border-t border-neutral-800 space-y-3">
                      <p className="text-[10px] text-amber-300 font-mono">⚡ Instant Setup Form via Secure BACS Direct Debit</p>
                      
                      <div className="space-y-2 text-neutral-905 text-neutral-900 text-xs">
                        <input
                          type="text"
                          placeholder="Your Business Name (e.g. Hot Tubs Liverpool)"
                          value={b2bCompanyName}
                          onChange={(e) => setB2bCompanyName(e.target.value)}
                          className="w-full bg-neutral-800 text-white placeholder-neutral-405 border border-neutral-700 rounded-lg p-2 focus:outline-none focus:border-amber-400 font-sans"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Sort Code (6-dig)"
                            maxLength={6}
                            value={b2bSortCode}
                            onChange={(e) => setB2bSortCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-neutral-800 text-white placeholder-neutral-405 border border-neutral-700 rounded-lg p-2 font-mono text-center tracking-wider text-xs focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            placeholder="Account No (8-dig)"
                            maxLength={8}
                            value={b2bAccountNumber}
                            onChange={(e) => setB2bAccountNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-neutral-800 text-white placeholder-neutral-405 border border-neutral-700 rounded-lg p-2 font-mono text-center tracking-wider text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!b2bCompanyName || !b2bSortCode || !b2bAccountNumber) {
                            triggerSuccess('Please fill in your Business Name and Bank details.');
                            return;
                          }
                          setB2bReferenceId(`BACS-AUR-${Math.floor(1000 + Math.random() * 9000)}`);
                          setB2bCompleted(true);
                          triggerSuccess(`Business portal membership unlocked for ${b2bCompanyName}!`);
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold uppercase rounded-lg text-xs tracking-wider transition-all"
                      >
                        Enroll Business & Access Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Option 2 Card: Dynamic AI Quote and Physical Walkthrough Bundle */}
                  <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between">
                    <div className="max-y-full space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">WALKTHROUGH DESIGN</span>
                          <h3 className="text-lg font-bold uppercase tracking-tight mt-1 text-neutral-950">In-Person Audit + Pro Portal bundle</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-[#FAF9F6] border border-neutral-200 text-neutral-800 rounded-full font-mono text-xs font-bold">
                          From £320 one-off
                        </span>
                      </div>

                      <p className="text-xs text-neutral-505 text-neutral-500 leading-relaxed">
                        Need Charlie Hughes to physically walk your building? Input your metrics to generate an audit estimate, discover regional travel availability, and establish the custom B2B portal.
                      </p>

                      <div className="p-3.5 bg-[#FAF9F6] border border-neutral-200 rounded-xl space-y-3 text-xs">
                        <div className="flex justify-between font-mono text-[10px] text-neutral-400 uppercase">
                          <span>Postcode Eligibility</span>
                          <span>Within 2-hours of CH48 5HP</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-neutral-600">
                          We safely service the entire North West region, including Liverpool, Chester, Crewe, Wrexham, Manchester, and Preston. 
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="text-[10px] font-mono text-neutral-400 uppercase">Dynamic AI Quotation tool</p>
                        <p className="text-xs font-bold text-neutral-800">Calibrate survey pricing and check road distance metrics.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMarketingSubPage('demo-estimator')}
                        className="px-5 py-2.5 bg-neutral-900 border border-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        Launch Estimator Tool
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </section>

          {/* NEW SECTION 2: GDPR SECURITY AND DATA PROTECTION CABINET */}
          <section className="bg-neutral-50 border-b border-neutral-200 py-16">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              
              <div className="lg:col-span-4 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-950 text-white rounded-full text-[9px] font-mono uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>GDPR & UK DPA 2018 certified</span>
                </div>
                <h2 className="text-2xl font-display font-medium text-neutral-900 tracking-tight leading-tight uppercase">
                  Absolute Discretion & Guarded Data Vault
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                  We safeguard critical architectural files, exit blueprints, and safety check history with extreme, high-security B2B isolation protocols. Absolute confidentiality is guaranteed under standard Crown-vetted clearances and strict non-disclosure contracts.
                </p>
              </div>

              <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  <div className="p-4 bg-[#FAF9F6] border border-neutral-150 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                      <Lock className="w-4 h-4 text-neutral-700" />
                      <span className="uppercase text-[11px]">No Cross-Leakage</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      Each B2B cohort database is strictly segmented with hardware isolation parameters. Neighbors have zero insight.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FAF9F6] border border-neutral-150 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                      <FileText className="w-4 h-4 text-neutral-700" />
                      <span className="uppercase text-[11px]">Instant NDA Issued</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      Charlie Hughes issues binding Non-Disclosure Agreements with every safety contract, maintaining absolute enterprise discretion.
                    </p>
                  </div>

                  <div className="p-[#FAF9F6] p-4 bg-[#FAF9F6] border border-neutral-150 rounded-2xl space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-[#1C1C1E] font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="uppercase text-[11px]">Forgotten Rights</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">
                      GDPR Article 17 self-service wipe is directly embedded in your corporate cabinet, removing logs on request.
                    </p>
                  </div>

                </div>

                {/* Interactive GDPR Tool Simulator */}
                <div className="p-4 bg-neutral-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  
                  <div className="space-y-1 text-left">
                    <p className="text-[10px] font-mono text-amber-400 uppercase font-black uppercase">Live GDPR Key Rotation Desk</p>
                    <p className="text-[11px] text-neutral-300 font-sans">
                      {rotated 
                        ? '✓ SHA256 Key successfully rotated. Logs isolated and secure.' 
                        : 'Audit your security key dynamically or simulate GDPR Article 17 compliance.'}
                    </p>
                    <p className="text-[9px] font-mono text-neutral-400 bg-neutral-800 p-1.5 rounded border border-neutral-800 line-clamp-1 block">
                      Active Crypt Token: {gdprToken}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setGdprToken(`DPA_SHA256_AUR_ROTATED_${Math.floor(1000 + Math.random() * 9000)}_SECURE`);
                        setRotated(true);
                        triggerSuccess('Discretion token rotated. Security protocols refreshed.');
                      }}
                      className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-mono text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                    >
                      Rotate Key
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRotated(false);
                        setGdprToken('DPA_SHA256_ACTIVE_SECURE_TOKEN_AUR_982');
                        triggerSuccess('Data protection clearance downloaded as ZIP. Compliance trace matches GDPR requirements.');
                      }}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-mono text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                    >
                      Simulate Log Export
                    </button>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* NEW SECTION 3: CLIENT REVIEWS */}
          <section className="bg-white py-16 border-b border-neutral-200">
            <div className="max-w-7xl mx-auto px-6 text-left space-y-10">
              
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-[9px] font-mono uppercase bg-neutral-900 text-white px-2.5 py-0.5 rounded font-black tracking-widest">Verified Partner Reviews</span>
                <h2 className="text-2xl sm:text-3xl font-display font-medium text-neutral-900 uppercase">
                  Endorsed by Liverpool & North West Business Leaders
                </h2>
                <p className="text-xs text-neutral-500">
                  See how dynamic logbook management and Charlie's NEBOSH assessments maintain structural safety and compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Review 1: Hot Tubs Liverpool - Daniel Johnson */}
                <div className="p-6 bg-[#FAF9F6] border border-neutral-205 rounded-2xl flex flex-col justify-between space-y-6">
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans italic">
                    "Managing safety across multiple showrooms and warehouse sites was a nightmare under standard binders. Charlie's digital portal with continuous care is phenomenal — we log our weekly sounder siren tests on our phones in 10 seconds. Strict discretion is maintained across all locations. Perfect!"
                  </p>
                  <div className="flex items-center gap-3 border-t border-stone-150 pt-4 progress-badge">
                    <div className="w-10 h-10 bg-neutral-900 text-amber-400 rounded-full flex items-center justify-center font-bold text-xs uppercase font-mono shadow-xs shrink-0">
                      DJ
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#1C1C1E] text-xs">Daniel Johnson</h4>
                      <p className="text-[10px] font-mono text-neutral-400">Founder, Hot Tubs Liverpool</p>
                    </div>
                  </div>
                </div>

                {/* Review 2: Sarah Jenkins - Apex Managed Living */}
                <div className="p-6 bg-[#FAF9F6] border border-neutral-205 rounded-2xl flex flex-col justify-between space-y-6">
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans italic">
                    "Fully compliant with the 2022 Building Safety Act. The remote Direct Debit care allowed us to immediately centralize 18 of our North West properties. Charlie's system has saved our team hundreds of hours and guaranteed complete data protection."
                  </p>
                  <div className="flex items-center gap-3 border-t border-stone-150 pt-4">
                    <div className="w-10 h-10 bg-neutral-900 text-amber-400 rounded-full flex items-center justify-center font-bold text-xs uppercase font-mono shadow-xs shrink-0">
                      SJ
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#1C1C1E] text-xs">Sarah Jenkins</h4>
                      <p className="text-[10px] font-mono text-neutral-400">Portfolio Director, Apex Residential</p>
                    </div>
                  </div>
                </div>

                {/* Review 3: David Croft - Vanguard Assembly & Logistics */}
                <div className="p-6 bg-[#FAF9F6] border border-neutral-205 rounded-2xl flex flex-col justify-between space-y-6">
                  <p className="text-xs text-neutral-600 leading-relaxed font-sans italic">
                    "The digital training tracker certified our primary keyholders in under a weekend. The strict multi-tenant isolate space works beautifully. Extremely professional, fast, and GDPR compliant. Highly recommended."
                  </p>
                  <div className="flex items-center gap-3 border-t border-stone-150 pt-4">
                    <div className="w-10 h-10 bg-neutral-900 text-amber-400 rounded-full flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0">
                      DC
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-900 text-xs">David Croft</h4>
                      <p className="text-[10px] font-mono text-neutral-400">Lead Warden, Vanguard Logistics</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        </div>
      )}

      {/* SERVICES TAB */}
      {currentMarketingSubPage === 'services' && (
        <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-12">
          <div className="space-y-2 border-b border-neutral-200 pb-5">
            <span className="text-[10px] font-mono uppercase bg-neutral-900 text-white px-2 py-0.5 rounded font-bold">Consultancy Architecture</span>
            <h1 className="text-3xl font-display font-medium text-neutral-900">Our Services & Solutions</h1>
            <p className="text-xs text-neutral-500">Every audit maps directly to BS 5839 (System Test Standards) and Regulatory Reform (Fire Safety) Order 2005.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-3">
              <Award className="w-8 h-8 text-amber-600" />
              <h3 className="font-bold text-sm uppercase">In-Person Fire Risk Assessments (FRA)</h3>
              <p className="text-neutral-500 leading-relaxed">
                A physical, comprehensive walkthrough and audit of fire door closing tolerances, emergency exit bulkheads, safety extinguishers, and hazard boundaries. 
              </p>
              <p className="text-[10px] text-neutral-400 italic">
                *Strictly available for sites situated within a 2-hour drive radius of Charlie's base postcode (CH48 5HP).
              </p>
            </div>

            <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-3">
              <Sparkles className="w-8 h-8 text-amber-600 animate-pulse" />
              <h3 className="font-bold text-sm uppercase">Remote Continuous Compliance Portal</h3>
              <p className="text-neutral-500 leading-relaxed">
                Enable properties without a recent physical assessment to subscribe to our Continuous Care plan via monthly Direct Debit. Access digital logbooks, Warden checklists, and mock safety training.
              </p>
              <p className="text-[10px] text-neutral-400 italic">
                *Available nationwide. Instant activation upon setting up BACS Direct Debit authority (£49/mo).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INDUSTRIES TAB */}
      {currentMarketingSubPage === 'industries' && (
        <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-8">
          <div className="space-y-2 border-b border-neutral-200 pb-4">
            <h1 className="text-2xl font-display font-semibold text-neutral-900">Commercial Sectors Served</h1>
            <p className="text-xs text-slate-500">We construct tailored safety rosters based on the occupancy profiles and height classes of your properties.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 bg-white border border-[#B45309]/20 rounded-xl space-y-2 ring-1 ring-amber-500/10">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Gyms & Leisure Facilities
              </h4>
              <p className="text-neutral-500"><strong>Our specialist focus area.</strong> Standard visual risk inspection rules tailored for sports halls, health clubs, public swimming blocks, saunas, weights arenas, and studios.</p>
            </div>
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-900">Small-to-Medium Offices</h4>
              <p className="text-neutral-500">Clear egress route mapping, visible compartmentation reports, manual sounder tests, escape path clearance assessments, and staff warden refresher exercises.</p>
            </div>
            <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-2">
              <h4 className="font-bold text-neutral-900">Retail & High Street Premises</h4>
              <p className="text-neutral-500">Straightforward visual-only assessments of basic exit routes, single-block storefront corridors, and local therapy or consulting clinics.</p>
            </div>
          </div>

          <div className="p-6 bg-amber-50/50 border border-amber-250 rounded-2xl space-y-3.5 text-amber-900">
            <h3 className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-mono text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Independent Inspection Parameters (Visual Level 1 Only, No Sleeping)
            </h3>
            <div className="text-[11.5px] leading-relaxed text-neutral-700 space-y-2">
              <p>
                To maintain full transparency and absolute compliance, please note the strict technical boundaries of Charlie Hughes' risk assessment service:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[11px]">
                <li><strong>Strictly Non-Sleeping Properties:</strong> We do NOT complete fire risk assessments for hotels, boarding houses, hostels, HMOs, student housing blocks, or flat residential blocks of any kind. We perform audits solely in easy, commercial, wakeful occupancy settings.</li>
                <li><strong>Level 1 Visual Inspections Only:</strong> Our assessment checks only visible compartmentation. We do not access voids, evaluate dynamic exterior cladding materials, or carry out complex invasive opening of structure. It is non-invasive and non-destructive.</li>
                <li><strong>Basic Door & Framework Checklist:</strong> We test existing door margins, self-closing mechanisms, and basic frame alignment. We are <strong>not manual door installation specialists</strong>, but report visible alignment issues for client records.</li>
                <li><strong>Independent Consultant:</strong> Lead Assessor Charlie Hughes is solely <strong>NEBOSH Fire Safety Certified</strong>. He operates as an independent advisor and does not claim any corporate memberships or state register enrollments.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT TAB */}
      {currentMarketingSubPage === 'about' && (
        <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-8">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h1 className="text-3xl font-display font-medium text-neutral-950 uppercase tracking-tight">Our Assessor Story</h1>
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Bridging Physical Fire Auditing & Digital Compliance Streams</p>
          </div>

          <div className="p-8 bg-white border border-neutral-200 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-xs shadow-xs">
            <div className="md:col-span-4 space-y-4 text-center md:border-r md:border-stone-150 pb-6 md:pb-0 pr-0 md:pr-8">
              <div className="w-40 h-40 rounded-2xl overflow-hidden mx-auto shadow-md border-2 border-stone-200 relative group transition-all duration-300">
                <img 
                  src="/src/assets/images/charlie_hughes_1781988701562.jpg" 
                  alt="Charlie Hughes, Lead Assessor" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight">Charlie Hughes</h4>
                <p className="text-[10px] uppercase font-mono text-neutral-450 font-bold">Chief NEBOSH Fire Advisor</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E6F4EA] text-emerald-800 text-[9px] font-mono font-bold rounded-full border border-emerald-250 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  NEBOSH Qualified
                </div>
              </div>
            </div>
            <div className="md:col-span-8 space-y-4 text-sm text-neutral-700 font-serif leading-relaxed">
              <p className="text-neutral-900 font-sans font-semibold text-sm italic leading-normal border-l-4 border-amber-500 pl-4 py-1">
                "Commercial compliance shouldn't be governed by cumbersome 300-page binders stored in a dusty corridor cabinet. Assuring building safety requires real-time, lightweight access."
              </p>
              <p>
                With my deep physical auditing background under the <strong className="text-stone-900">NEBOSH Fire Safety Certificate</strong> framework, I founded Aurelius Fire Risk to combine practical field assessment with clean digital logging.
              </p>
              <p>
                This ensures our valued Merseyside and Wirral partners can display their required physical marks instantly to visiting fire brigadiers without administrative delay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT TAB */}
      {currentMarketingSubPage === 'contact' && (
        <div className="max-w-md mx-auto px-6 py-12 text-left">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-5 text-xs shadow-xs">
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Get in Touch</h1>
              <p className="text-[11px] text-neutral-500">Contact Charlie's office for private audits or general compliance queries.</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              {contactSent && (
                <div className="p-3.5 bg-emerald-50 text-emerald-850 border border-emerald-200 rounded-xl font-mono text-[10px] font-bold">
                  Success! Charlie will correspond within 24 working hours.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-stone-500">Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-lg p-2 focus:outline-none focus:border-neutral-800"
                  placeholder="e.g. Charlie"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-stone-500">Corporate Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-lg p-2 focus:outline-none"
                  placeholder="e.g. charlie@company.co.uk"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-stone-500">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-lg p-2 focus:outline-none"
                  rows={3}
                  placeholder="Tell us about your properties..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg transition-all"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}

      {/* JOIN & SUBSCRIBE MULTI-STEP REGISTRATION WIZARD */}
      {currentMarketingSubPage === 'join' && (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 text-left animate-fadeIn">
          <div className="space-y-4 border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded">
                Aurelius Subscription & Enrollment Suite
              </span>
              <h1 className="text-3xl font-display font-medium text-[#1C1C1E] tracking-tight mt-1.5 font-bold">
                Join Aurelius Compliance Network
              </h1>
              <p className="text-xs text-neutral-500">
                Register company accounts, secure login details, and establish dynamic BACS Direct Debit protection under standard Crown safety mandates.
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-slate-400 text-[10px] font-mono font-bold">Step {signupStep} of 4</span>
              <div className="flex gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${signupStep >= 1 ? 'bg-amber-500' : 'bg-stone-200'}`} />
                <span className={`w-2 h-2 rounded-full ${signupStep >= 2 ? 'bg-amber-500' : 'bg-stone-200'}`} />
                <span className={`w-2 h-2 rounded-full ${signupStep >= 3 ? 'bg-amber-500' : 'bg-stone-200'}`} />
                <span className={`w-2 h-2 rounded-full ${signupStep >= 4 ? 'bg-amber-500' : 'bg-stone-200'}`} />
              </div>
            </div>
          </div>

          {/* STEP 1: PACKAGE SELECTOR */}
          {signupStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-neutral-900 uppercase font-mono tracking-wider">Select Corporate Protection Tier</h3>
                <p className="text-xs text-neutral-500 font-sans">Select the certification level requested by your regional board or legal trustees.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Basic Care */}
                <div 
                  onClick={() => setSignUpPackage('Basic Care')}
                  className={`border rounded-2xl p-5 hover:border-neutral-400 transition-all cursor-pointer flex flex-col justify-between ${
                    signUpPackage === 'Basic Care' 
                      ? 'border-neutral-950 bg-white shadow-md ring-1 ring-neutral-950' 
                      : 'border-neutral-200 bg-[#FAF9F6] h-full shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase bg-neutral-200 px-2 py-0.5 rounded font-extrabold text-[#1C1C1E]">Basic Care</span>
                    <h4 className="text-2xl font-bold font-display text-neutral-900">£19<span className="text-xs font-normal text-neutral-400 font-sans">/mo</span></h4>
                    <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">Essential compliance tools for isolated and simple premises.</p>
                  </div>
                  <ul className="text-[10px] text-neutral-500 space-y-1.5 mt-4 text-left font-sans font-normal">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-450" /> 1 Isolated Property</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-450" /> Standard Digital Logbook</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-450" /> Academy for 3 Trainees</li>
                  </ul>
                  <div className="mt-6 border-t border-stone-100 pt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className={signUpPackage === 'Basic Care' ? 'text-amber-600' : 'text-neutral-400'}>
                      {signUpPackage === 'Basic Care' ? 'Selected' : 'Select Package'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">12-mo min</span>
                  </div>
                </div>

                {/* Standard Professional */}
                <div 
                  onClick={() => setSignUpPackage('Standard Professional')}
                  className={`border rounded-2xl p-5 hover:border-neutral-400 transition-all cursor-pointer flex flex-col justify-between relative ${
                    signUpPackage === 'Standard Professional' 
                      ? 'border-neutral-950 bg-white shadow-md ring-1 ring-neutral-950' 
                      : 'border-neutral-200 bg-[#FAF9F6] h-full shadow-sm'
                  }`}
                >
                  <span className="absolute -top-2.5 right-4 bg-amber-500 text-[#1C1C1E] text-[8px] font-sans font-bold uppercase py-0.5 px-2 rounded-full">POPULAR</span>
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded font-extrabold">Professional</span>
                    <h4 className="text-2xl font-bold font-display text-neutral-900 font-extrabold">£49<span className="text-xs font-normal text-neutral-400 font-sans">/mo</span></h4>
                    <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">Complete continuous care, actions trackers, and active warden lists.</p>
                  </div>
                  <ul className="text-[10px] text-neutral-500 space-y-1.5 mt-4 text-left font-sans font-normal font-medium">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500" /> Up to 3 Isolated Sites</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500" /> Complete Digital Logbook</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500" /> Warden Checklists</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500" /> Academy for 10 Trainees</li>
                  </ul>
                  <div className="mt-6 border-t border-stone-100 pt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className={signUpPackage === 'Standard Professional' ? 'text-amber-600' : 'text-neutral-400'}>
                      {signUpPackage === 'Standard Professional' ? 'Selected' : 'Select Package'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">12-mo min</span>
                  </div>
                </div>

                {/* Enterprise Elite */}
                <div 
                  onClick={() => setSignUpPackage('Enterprise Elite')}
                  className={`border rounded-2xl p-5 hover:border-neutral-400 transition-all cursor-pointer flex flex-col justify-between ${
                    signUpPackage === 'Enterprise Elite' 
                      ? 'border-neutral-950 bg-white shadow-md ring-1 ring-neutral-950' 
                      : 'border-neutral-200 bg-[#FAF9F6] h-full shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase bg-neutral-905 bg-neutral-900 text-white px-2 py-0.5 rounded font-extrabold">Enterprise</span>
                    <h4 className="text-2xl font-bold font-display text-neutral-900">£99<span className="text-xs font-normal text-neutral-400 font-sans">/mo</span></h4>
                    <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">Rigorous multi-site control for extensive commercial estates.</p>
                  </div>
                  <ul className="text-[10px] text-neutral-500 space-y-1.5 mt-4 text-left font-sans font-normal">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-900" /> Unlimited Isolated Sites</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-900" /> Custom Schema Viewers</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-900" /> Priority Auditor Chat Direct</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-900" /> Infinite Academy Users</li>
                  </ul>
                  <div className="mt-6 border-t border-stone-100 pt-3 flex items-center justify-between text-[11px] font-bold">
                    <span className={signUpPackage === 'Enterprise Elite' ? 'text-amber-600' : 'text-neutral-400'}>
                      {signUpPackage === 'Enterprise Elite' ? 'Selected' : 'Select Package'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">12-mo min</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  onClick={() => setSignupStep(2)}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg text-xs tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                >
                  Confirm Package <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COMPANY & BUILDING DETAILS */}
          {signupStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#1C1C1E] uppercase font-mono tracking-wider">Company, Building & Credentials</h3>
                <p className="text-xs text-neutral-500">Provide full property details to automatically generate your secure client portal workspace.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Business / Company Name</label>
                    <input
                      type="text"
                      value={signUpCompanyName}
                      onChange={(e) => setSignUpCompanyName(e.target.value)}
                      placeholder="e.g. Acme Commercial Ltd"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 font-sans font-medium focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Primary Property Building Name</label>
                    <input
                      type="text"
                      value={signUpBuildingName}
                      onChange={(e) => setSignUpBuildingName(e.target.value)}
                      placeholder="e.g. Sovereign Tower Block B"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 font-sans font-medium focus:outline-none focus:ring-1 focus:ring-neutral-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Main Building Address</label>
                    <input
                      type="text"
                      value={signUpBuildingAddress}
                      onChange={(e) => setSignUpBuildingAddress(e.target.value)}
                      placeholder="e.g. 102 Sovereign Way, Chester"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Postcode</label>
                    <input
                      type="text"
                      value={signUpPostcode}
                      onChange={(e) => setSignUpPostcode(e.target.value.toUpperCase())}
                      placeholder="e.g. CH48 5HP"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none text-center font-mono font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-stone-200/60 my-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2 font-mono">Person Responsible & Login Profile</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Contact Person Name</label>
                    <input
                      type="text"
                      value={signUpContactName}
                      onChange={(e) => setSignUpContactName(e.target.value)}
                      placeholder="e.g. David Tenant"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Contact Phone Number</label>
                    <input
                      type="tel"
                      value={signUpContactPhone}
                      onChange={(e) => setSignUpContactPhone(e.target.value)}
                      placeholder="e.g. 07912 345678"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Building Portal Email *</label>
                    <input
                      type="email"
                      value={signUpContactEmail}
                      onChange={(e) => setSignUpContactEmail(e.target.value)}
                      placeholder="e.g. manager@acmedesign.com"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none font-bold"
                      required
                    />
                    <p className="text-[9px] text-[#9A9084] font-medium leading-normal">Used to instantly access your compliance portal.</p>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Choose Portal Access Password</label>
                    <input
                      type="text"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none font-mono font-bold"
                      required
                    />
                    <p className="text-[9px] text-[#9A9084] font-medium leading-normal">Write this down! Your login credentials are created instantly.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-stone-200">
                <button
                  onClick={() => setSignupStep(1)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold uppercase rounded-lg text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!signUpCompanyName || !signUpBuildingName || !signUpPostcode || !signUpContactName || !signUpContactEmail) {
                      triggerSuccess('Please complete all property and profile credentials form fields.');
                      return;
                    }
                    setSignupStep(3);
                  }}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  Continue to Direct Debit <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DIRECT DEBIT & BANK DETAILS */}
          {signupStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-[#1C1C1E] uppercase font-mono tracking-wider">GoCardless BACS Direct Debit</h3>
                <p className="text-xs text-neutral-500">Set up your compliant BACS Direct Debit instructions to enable your continuous portal license.</p>
              </div>

              <div className="p-5 bg-white border border-neutral-250 rounded-3xl space-y-4">
                <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                  <CreditCard className="w-8 h-8 text-neutral-900" />
                  <div className="text-left">
                    <h4 className="font-extrabold text-[#1C1C1E] uppercase text-xs">Direct Debit Mandate Registration</h4>
                    <p className="text-[10px] text-neutral-400">Securely processed in conformance with UK Direct Debit regulations.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Bank Name</label>
                    <input
                      type="text"
                      value={signUpBankName}
                      onChange={(e) => setSignUpBankName(e.target.value)}
                      placeholder="e.g. Lloyds Bank plc"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none font-bold text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">Bank Account Holder Name</label>
                    <input
                      type="text"
                      value={signUpDdAccountName}
                      onChange={(e) => setSignUpDdAccountName(e.target.value)}
                      placeholder="e.g. ACME STORES LTD"
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 focus:outline-none font-bold text-left text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">6-Digit Sort Code (Numbers only)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={signUpDdSortCode}
                      onChange={(e) => setSignUpDdSortCode(e.target.value.replace(/\D/g,''))}
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 font-mono font-bold tracking-widest text-center text-xs"
                      placeholder="309121"
                      required
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[9px] uppercase font-bold text-stone-500">8-Digit Account Number (Numbers only)</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={signUpDdAccountNumber}
                      onChange={(e) => setSignUpDdAccountNumber(e.target.value.replace(/\D/g,''))}
                      className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2.5 font-mono font-bold tracking-widest text-center text-xs"
                      placeholder="88410291"
                      required
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-neutral-200 text-[10px] text-stone-500 leading-relaxed text-left space-y-2">
                  <p className="font-extrabold text-[#1C1C1E]">The Guarantee of Direct Debit</p>
                  <p className="font-normal font-sans text-neutral-500">
                    This Guarantee is offered by all banks and building societies that accept instructions to pay Direct Debits. If an error is made, you are guaranteed a full and immediate refund from your branch of the amount paid.
                  </p>
                  <label className="flex items-start gap-2 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={signUpDdAgreed}
                      onChange={(e) => setSignUpDdAgreed(e.target.checked)}
                      className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-450 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-extrabold text-neutral-700 leading-tight">
                      Yes, I agree to the Direct Debit Guarantee terms and authorise payments of £{signUpPackage === 'Enterprise Elite' ? '99' : signUpPackage === 'Standard Professional' ? '49' : '19'} monthly until revoked.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-stone-200">
                <button
                  onClick={() => setSignupStep(2)}
                  className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold uppercase rounded-lg text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleSignUpSubmit}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-rose-50 hover:text-white font-bold uppercase rounded-lg text-xs tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  Activate License Plan & Establish DD <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RECEIPT & INSTANT PORTAL ACCESS */}
          {signupStep === 4 && (
            <div className="space-y-6">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 font-bold shrink-0" />
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-extrabold">AUTHENTICATION SUCCESS</span>
                    <h3 className="text-2xl font-extrabold text-stone-900 tracking-tight font-display">Active Aurelius Membership Set</h3>
                  </div>
                </div>

                <p className="text-xs text-emerald-800 leading-relaxed text-left font-sans font-normal">
                  Success! Your BACS Direct Debit instruction has been successfully approved via GoCardless. Your isolated tenant workspace is now fully provisioned and securely registered.
                </p>

                <div className="bg-white border border-emerald-150 rounded-2xl p-4 md:p-5 space-y-3.5 text-left">
                  <div className="border-b border-stone-100 pb-2 flex justify-between">
                    <span className="text-[10px] font-mono text-stone-400 uppercase font-bold">Secure Portal Login Credentials</span>
                    <span className="text-[10px] text-amber-600 font-mono font-bold font-extrabold">Plan: {signUpPackage}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-150">
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block font-bold">Email / Username</span>
                        <span className="text-xs font-mono font-bold text-neutral-900 break-all">{signUpContactEmail}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#FAF9F6] p-2.5 rounded-lg border border-neutral-150">
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 block font-bold">Access Password</span>
                        <span className="text-xs font-mono font-bold text-neutral-900">{signUpPassword}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-neutral-500 leading-normal font-sans font-normal italic">
                      Copy the credentials block below and send it directly to your employee to grant them immediate academy access!
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const credentialsBlock = `👤 Aurelius Compliance Client Portal Credentials\n\n🔗 portal: Open "Secure Compliance App Portal" button in sandbox\n📧 Username/Email: ${signUpContactEmail}\n🔑 Password: ${signUpPassword}\n🛡️ Plan Registered: ${signUpPackage}\n🏢 Main Site: ${signUpBuildingName}`;
                      navigator.clipboard.writeText(credentialsBlock);
                      triggerSuccess('Credentials copied securely to your clipboard! Send this to your employee.');
                    }}
                    className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider transition-colors border border-neutral-250 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Copy Credentials to Clipboard 📋 (Send to Employee)
                  </button>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-neutral-200 rounded-3xl p-5 text-left space-y-2.5 shadow-sm">
                <h4 className="text-xs font-bold text-neutral-950 uppercase font-mono">🚀 Enter Premium Client Portal Now</h4>
                <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">
                  Your tenant isolation is fully mapped. Click below to bypass sandbox screens and directly authenticate into your new custom dashboard as administrator <strong>{signUpContactName}</strong>.
                </p>
                <button
                  onClick={() => onLoginSimulate(signUpContactEmail, signUpPassword)}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 text-xs tracking-widest font-bold uppercase rounded-lg shadow-md transition-all cursor-pointer text-center"
                >
                  Enter Client Portal Dashboard Instantly 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {currentMarketingSubPage === 'demo-estimator' && (
        <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 text-left animate-fadeIn">
          
          <div className="space-y-2 border-b border-stone-200 pb-4">
            <span className="text-[10px] uppercase font-mono font-bold bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded">
              Premium Aurelius AI Quoting & DD Enrollment Engine
            </span>
            <h1 className="text-3xl font-display font-medium text-neutral-900 tracking-tight">
              Calibrate Property Compliance
            </h1>
            <p className="text-xs text-neutral-500">
              Select your safety tier, verify travel eligibility within 2 hours of **CH48 5HP**, compute immediate quotes, and activate Direct Debit continuity plans instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold font-mono">
            
            {/* Step 1 Selector */}
            <button
              onClick={() => {
                setServiceMode('in_person');
                setQuoteOutput(null);
              }}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                serviceMode === 'in_person'
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-slate-350'
              }`}
            >
              <div className="p-1.5 bg-amber-600 rounded-lg text-white">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs uppercase">Option A: In-Person FRA Survey</p>
                <p className="text-[10px] font-normal leading-relaxed mt-1 text-slate-400">
                  Charlie walks your site. High-fidelity logbooks & task managers. *CH48 5HP postcode zone limits apply.*
                </p>
              </div>
            </button>

            {/* Step 2 Selector */}
            <button
              onClick={() => {
                setServiceMode('remote_dd');
                setQuoteOutput(null);
              }}
              className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                serviceMode === 'remote_dd'
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-slate-350'
              }`}
            >
              <div className="p-1.5 bg-emerald-600 rounded-lg text-white animate-pulse">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs uppercase">Option B: Continuous Remote Care</p>
                <p className="text-[10px] font-normal leading-relaxed mt-1 text-slate-400">
                  Continuous portal licensing. Self-service digital firelog and staff warden certifications via £49/mo Direct Debit.
                </p>
              </div>
            </button>
          </div>

          {/* Core Quoting Form */}
          <form onSubmit={handleCreateAIQuote} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5 text-xs text-left">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2.5">
                1. MAPPED PROPERTY CLASSIFICATION
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {['Gym / Leisure Facility', 'Small-to-Medium Office', 'Retail / Clinic'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setPropertyType(type); setQuoteOutput(null); }}
                    className={`p-3 rounded-lg border text-center font-bold transition-all ${
                      propertyType === type
                        ? 'bg-neutral-950 border-neutral-950 text-white'
                        : 'bg-stone-50 border-neutral-200 text-neutral-600 hover:border-neutral-350'
                    }`}
                  >
                    <span className="text-[11px]">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Fire Doors Count</label>
                  <span className="font-mono font-bold text-neutral-900">{numDoors} doors</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="120"
                  value={numDoors}
                  onChange={(e) => { setNumDoors(parseInt(e.target.value)); setQuoteOutput(null); }}
                  className="w-full accent-neutral-900"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Safety Extinguishers</label>
                  <span className="font-mono font-bold text-neutral-900">{numExtinguishers} Cylinders</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={numExtinguishers}
                  onChange={(e) => { setNumExtinguishers(parseInt(e.target.value)); setQuoteOutput(null); }}
                  className="w-full accent-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Building Postcode</label>
                <span className="text-[10px] text-neutral-400 font-mono">Driving comparison base: CH48 5HP</span>
              </div>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="Enter UK Postcode (e.g. CH48 5HP, L3 4FP, M2 3BF, EC1A 1BB)"
                className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-neutral-800 font-bold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all"
            >
              Calibrate AI Compliance Quote
            </button>
          </form>

          {/* Quote Calibrated Outputs */}
          {quoteOutput && (
            <div className="space-y-6">
              
              <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 text-xs animate-scaleUp text-left">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <span className="font-bold text-neutral-700 uppercase">Aurelius Assessor Determination:</span>
                  <span className="font-mono font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Calibrated
                  </span>
                </div>

                {/* POSTCODE ZONE EVALUATION DETAILS */}
                {serviceMode === 'in_person' && (
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    quoteOutput.eligible 
                      ? 'bg-emerald-50/50 border-emerald-250 text-emerald-800' 
                      : 'bg-amber-50 border-amber-250 text-amber-800'
                  }`}>
                    {quoteOutput.eligible ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-emerald-950">✅ Eligible for In-Person Surveying!</p>
                          <p className="text-[11px] mt-0.5 leading-relaxed">
                            Your building postcode ({postcode.toUpperCase()}) is approximately <strong>{quoteOutput.distanceHours} hours</strong> drive from Charlie's office near CH48 5HP. Charlie Hughes can handle your physical FRA walkthrough on-site.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-950">⚠️ Out-of-Zone travel comparison warning</p>
                          <p className="text-[11px] mt-0.5 leading-relaxed">
                            Your postcode is outside Charlie's strict 2-hour driving window of Wirral (CH48 5HP). In-person surveying is restricted, <strong>but you can fully enroll in Option B: Continuous Nationwide Remote Access via Direct Debit (£49/mo) below!</strong>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {serviceMode === 'remote_dd' && (
                  <div className="p-4 bg-emerald-50/30 border border-emerald-200 text-emerald-900 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">✅ Remote continuous Care Enabled (Nationwide)</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed">
                        Setting up a monthly direct debit secures complete round-the-clock compliance, weekly alarm testing logs, document library access, and certified warden onboarding. No physical inspection required.
                      </p>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-450 block">Assisted Subscription Plan</span>
                    <p className="text-xl font-extrabold font-mono text-neutral-900">
                      {serviceMode === 'in_person' && quoteOutput.eligible ? quoteOutput.oneOffFee : 'Remote Only'}
                      <span className="text-xs font-normal text-stone-500 font-sans ml-1">
                        {serviceMode === 'in_person' && quoteOutput.eligible ? 'one-off survey' : 'N/A'}
                      </span>
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-450 block">Monthly Digital License</span>
                    <p className="text-xl font-extrabold font-mono text-neutral-900">
                      £49 <span className="text-xs font-normal text-stone-500 font-sans ml-1">/ month Direct Debit</span>
                    </p>
                  </div>
                </div>

                {/* AI Law Predictor Indicators */}
                <div className="p-4 bg-stone-50 border border-neutral-150 rounded-xl space-y-2">
                  <p className="font-bold text-neutral-750 text-[10px] uppercase block tracking-wider">Aurelius AI Regulatory Analysis & Forecast:</p>
                  <div className="space-y-1.5 text-[11px] text-neutral-600">
                    {quoteOutput.breachPredictors.map((p, i) => (
                      <p key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold leading-none shrink-0">•</span>
                        <span>{p}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* BACS DIRECT DEBIT GATEWAY INTERACTIVITY FORM */}
              {(!quoteOutput.eligible && serviceMode === 'in_person') || serviceMode === 'remote_dd' ? (
                <div className="bg-white border-2 border-neutral-900 rounded-2xl p-6 shadow-md space-y-5 text-xs text-left">
                  <div className="flex items-center gap-2 border-b border-stone-105 pb-3">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-extrabold text-neutral-900 uppercase">Aurelius Continuous Care DD Setup</h4>
                      <p className="text-[10px] text-neutral-450">Authorize BACS Direct Debit to claim nationwide compliant digital dashboard services.</p>
                    </div>
                  </div>

                  {ddApprovedTransaction ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Monthly Direct Debit Set Up Complete!
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        Your account <strong>**{ddAccountNumber.slice(-4)}</strong> has been registered with BACS reference <strong>AUR-DD-{Math.floor(10000 + Math.random()*90000)}</strong>. Compliance Portal access is now unlocked. Let's authenticate inside the portal!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleActivateDirectDebit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-stone-500">Bank Account Holder Name</label>
                        <input
                          type="text"
                          value={ddAccountName}
                          onChange={(e) => setDdAccountName(e.target.value)}
                          className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2 font-bold"
                          placeholder="e.g. HALIFAX LTD"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-500">6-Digit Sort Code</label>
                          <input
                            type="text"
                            maxLength={6}
                            value={ddSortCode}
                            onChange={(e) => setDdSortCode(e.target.value.replace(/\D/g,''))}
                            className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2 font-mono font-bold tracking-widest text-center"
                            placeholder="010203"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-stone-500">8-Digit Account Number</label>
                          <input
                            type="text"
                            maxLength={8}
                            value={ddAccountNumber}
                            onChange={(e) => setDdAccountNumber(e.target.value.replace(/\D/g,''))}
                            className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2 font-mono font-bold tracking-widest text-center"
                            placeholder="12345678"
                            required
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-lg border border-neutral-150 leading-relaxed text-[10px] text-stone-500 space-y-1 text-left">
                        <p className="font-bold text-neutral-800">The Direct Debit Guarantee contract</p>
                        <p>
                          This Guarantee is offered by all banks and building societies that accept instructions to pay Direct Debits. If an error is made, you are guaranteed a full and immediate refund from your branch.
                        </p>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase rounded-lg transition-all"
                      >
                        Authorize & Establish Direct Debit (£49/mo)
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-left text-xs space-y-2">
                  <p className="font-bold">Next Steps for In-Person FRA Audit:</p>
                  <p className="text-[11px] leading-relaxed">
                    Since you are fully eligible for in-person inspection, Charlie Hughes can perform on-site assessment at your postcode <strong>{postcode.toUpperCase()}</strong>. Use the **Contact Us** tab to book your survey day!
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* TENANT MATRIX QUICK SANDBOX ACCESSIBILITY */}
      <section className="bg-white border-t border-neutral-150 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-450 block font-bold">Simulated B2B Tenant Sandbox</span>
            <h3 className="text-xl font-bold font-display text-neutral-900">Sandbox Fast Authentication Desk</h3>
            <p className="text-xs text-neutral-500">Select any pre-configured profile below to enter his direct compliance workspace and test strict client segregation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {simulatedCredentials.map((cred, i) => (
              <div key={i} className="bg-[#FAF9F6] border border-neutral-200 rounded-2xl p-5 space-y-3 transition-colors hover:border-neutral-350 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-wide text-neutral-500 font-bold bg-neutral-200/50 px-2 py-0.5 rounded">
                      {cred.label}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-emerald-605 bg-emerald-505 bg-emerald-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{cred.name}</h4>
                    <p className="text-[10px] font-mono text-neutral-450 mt-0.5">{cred.email}</p>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal font-sans font-normal">{cred.desc}</p>
                </div>
                <button
                  onClick={() => onLoginSimulate(cred.email, cred.pass)}
                  className="w-full mt-3 py-1.5 bg-white border border-neutral-250 rounded font-mono text-[10px] font-bold text-neutral-700 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all flex items-center justify-center gap-1 scroll-smooth"
                >
                  <Lock className="w-3 h-3" />
                  Sign In as {cred.email.split('@')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
