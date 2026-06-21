import React, { useState } from 'react';
import { 
  CreditCard, 
  Tag, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  BadgeHelp,
  Building2,
  Clock,
  Send,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';

interface ClientSaaS {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  subType: string;
  paymentStatus: string;
}

interface FinanceHubProps {
  activeClient: ClientSaaS | null;
  activeSite: any;
  triggerSuccess: (msg: string) => void;
  triggerEmail: (type: 'onboarding' | 'dd_mandate' | 'contract' | 'drill_warning', data: any) => void;
  ddSubscribedSites: string[];
  setDdSubscribedSites: React.Dispatch<React.SetStateAction<string[]>>;
  sites: any[];
  setSites: React.Dispatch<React.SetStateAction<any[]>>;
  hasChatSupport?: boolean;
  onToggleChatSupport?: (enabled: boolean) => void;
}

export default function FinanceHub({
  activeClient,
  activeSite,
  triggerSuccess,
  triggerEmail,
  ddSubscribedSites,
  setDdSubscribedSites,
  sites,
  setSites,
  hasChatSupport = false,
  onToggleChatSupport
}: FinanceHubProps) {
  // Direct Debit secure bank state
  const [bankName, setBankName] = useState('Lloyds Bank');
  const [sortCode, setSortCode] = useState('309481');
  const [accountNo, setAccountNo] = useState('74019283');
  const [isEditingBank, setIsEditingBank] = useState(false);

  // Subscription Cancellation & Notice parameters
  const [subscriptionStatus, setSubscriptionStatus] = useState<'Active' | 'Cancelled' | 'ReinstateBlocked'>('Active');
  const [simulatedDay, setSimulatedDay] = useState(12); // Test any day of the month 1-31
  const [terminationNoticeDaysLeft, setTerminationNoticeDaysLeft] = useState(30);

  // £0.01 Live Direct Debit Mandate sandbox validator states
  const [sandboxSortCode, setSandboxSortCode] = useState('089022');
  const [sandboxAccountNo, setSandboxAccountNo] = useState('44019201');
  const [sandboxAccountName, setSandboxAccountName] = useState('SaaS Test Gym');
  const [sandboxTransId, setSandboxTransId] = useState('');

  // Company Bank Details state
  const [companyBankName, setCompanyBankName] = useState('Barclays Bank Plc');
  const [companySortCode, setCompanySortCode] = useState('204579');
  const [companyAccountNo, setCompanyAccountNo] = useState('83920184');

  // Promotions and codes state
  const [activeCode, setActiveCode] = useState<string | null>('LOYALTY25');
  const [promoInput, setPromoInput] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(25); // Starts discounted because of loyalty25 promo

  // Real-time Booking wizard states for physical FRA
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState('2026-07-15');
  const [includePortal, setIncludePortal] = useState<'yes' | 'no'>('yes');
  const [scheduledDirectDebitDate, setScheduledDirectDebitDate] = useState('');

  // Payment logs
  const [payments, setPayments] = useState([
    { id: 'pay-1', description: 'Monthly Compliance Licensing Portal', amount: '£25.00', status: 'Settled via DD', date: '2026-06-01' },
    { id: 'pay-2', description: 'Biannual Multi-Tenant Security Survey', amount: '£395.00', status: 'Settled via DD', date: '2026-02-15' },
    { id: 'pay-3', description: 'Warden Classroom Pipeline Activation', amount: '£50.00', status: 'Promo Waived', date: '2026-01-10' },
  ]);

  const handleUpdateBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (sortCode.length !== 6 || accountNo.length !== 8) {
      triggerSuccess('Sort code must be 6 digits and Account number must be 8 digits.');
      return;
    }
    setIsEditingBank(false);
    triggerSuccess('BACS Direct Debit secure banking mandate parameters updated successfully.');
    
    // Dispatch instant email update
    triggerEmail('dd_mandate', {
      bankName,
      sortCode,
      accountNo,
      clientName: activeClient?.name || 'Active Member',
      clientEmail: activeClient?.email || 'direct@member.co.uk'
    });
  };

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = promoInput.trim().toUpperCase();
    if (formatted === 'LOYALTY25') {
      setActiveCode('LOYALTY25');
      setMonthlyFee(25);
      triggerSuccess('Loyalty half-price Applied! Portal reduced from £49 to £25/month.');
    } else if (formatted === 'FREEASSESS') {
      setActiveCode('FREEASSESS');
      triggerSuccess('Promo applied: In-classroom warden onboarding course activation fees now waived.');
    } else if (formatted === 'SAVE10') {
      setActiveCode('SAVE10');
      triggerSuccess('Promotional 10% discount verified across physical engineering audits.');
    } else {
      triggerSuccess('Promotional code not recognized in British compliance framework directory.');
    }
    setPromoInput('');
  };

  const handleConfirmFRABooking = () => {
    if (!bookingDate) {
      triggerSuccess("⚠️ Please select a booking date first.");
      return;
    }

    // Weekend Validation Check (Saturdays & Sundays only)
    const parts = bookingDate.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const date = parseInt(parts[2], 10);
    const day = new Date(year, month, date).getDay();
    const isWeekend = day === 0 || day === 6; // Sunday is 0, Saturday is 6

    if (!isWeekend) {
      triggerSuccess("⚠️ Booking restricted: Charlie is ONLY available for surveys on weekends (Saturdays & Sundays). Please select a weekend date.");
      return;
    }

    // Direct Debit and price computations based on loyalty selection
    let finalizedAmount = "£0.00";
    let alertMsg = "";
    const today = new Date('2026-06-20');
    const futureDate = new Date(today.setFullYear(today.getFullYear() + 1));
    const formattedFutureDate = futureDate.toISOString().split('T')[0];

    if (includePortal === 'yes') {
      setMonthlyFee(25); // loyal partner rate
      finalizedAmount = "£25.00 / month";
      alertMsg = "Loyalty Physical FRA package accepted! Monthly Portal set to £25 half-price.";
      // Ensure site is registered in the list
      if (activeSite && !ddSubscribedSites.includes(activeSite.id)) {
        setDdSubscribedSites(prev => [...prev, activeSite.id]);
      }
    } else {
      setMonthlyFee(0); // portal deactivated
      finalizedAmount = "£149.00 once in 12 months";
      alertMsg = "Standalone physical review booked! Portal closed. £149 fee schedules on Direct Debit in 12 months.";
      setScheduledDirectDebitDate(formattedFutureDate);
      if (activeSite) {
        setDdSubscribedSites(prev => prev.filter(id => id !== activeSite.id));
      }
    }

    setBookingConfirmed(true);
    triggerSuccess(alertMsg);

    // Send contract, terms, and onboarding notifications
    triggerEmail('contract', {
      clientName: activeClient?.name || 'Client Corp',
      clientEmail: activeClient?.email || '',
      bookingDate,
      includePortal,
      monthlyFee: includePortal === 'yes' ? '£25.00' : '£0.00',
      oneOffAnnualFee: includePortal === 'no' ? '£149.00' : '£0.00',
      scheduledDDDate: formattedFutureDate,
      sortCode,
      accountNo
    });

    // Record the physical booking on payments ledger
    const newLog = {
      id: `pay-${Date.now()}`,
      description: `Physical In-Person FRA Audit Booking (${bookingDate})`,
      amount: includePortal === 'yes' ? '£25.00/mo' : '£149.00 DD (Deferred 12m)',
      status: 'Mandate Active',
      date: '2026-06-20'
    };
    setPayments(prev => [newLog, ...prev]);

    // Extend next assessment date in state for the site
    if (activeSite) {
      setSites(prev => prev.map(s => {
        if (s.id === activeSite.id) {
          return {
            ...s,
            nextAssessment: bookingDate,
            score: Math.min(100, s.score + 5) // compliance boost on booking
          };
        }
        return s;
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div>
        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-neutral-900 text-amber-500 rounded border border-neutral-800">
          Secure Direct Debit Ledger & Billings Panel
        </span>
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-2">
          Finance & Subscriptions Portal
        </h2>
        <p className="text-neutral-500 text-xs mt-1">
          Manage BACS Direct Debit mandates, apply regulatory promotion keys, book physical Fire Risk Assessments, and review contract protection shields.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ACTIVE SUBSCRIPTIONS & PHYSICAL ASSESSMENT WIZARD */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PHYSICAL SURVEY WIZARD WITH COMBOS */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 animate-pulse" />
                Book In-Person Physical Fire Risk Assessment
              </h3>
              <span className="text-[9px] font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-505 border border-neutral-200">
                UK Fire Safety Order 2005 Compliant
              </span>
            </div>

            {bookingConfirmed ? (
              <div className="p-5 bg-stone-50 border border-neutral-150 rounded-xl space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase bg-emerald-50 max-w-fit px-3 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Physical Assessment Reserved
                </div>
                
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Charlie Hughes (NEBOSH Cert) is confirmed to evaluate property <strong>{activeSite?.name || 'Main Office'}</strong> physically on <strong>{bookingDate}</strong>.
                </p>

                <div className="text-[11px] bg-neutral-950 text-neutral-100 p-4 rounded-lg space-y-2.5 font-mono">
                  <p className="font-bold text-amber-400">🛡️ STRICT LEGAL BINDING AGREEMENT DETAILS:</p>
                  <p className="text-neutral-350 text-[10px] leading-relaxed">
                    • <strong>Membership Chosen</strong>: {includePortal === 'yes' ? 'Loyalty Portal Combo (£25.00/mo)' : 'Annual Standalone Review Only (£149.00/yr)'}<br />
                    • {includePortal === 'no' && `• <strong>Direct Debit collection rescheduled</strong>: £149.00 to charge on BACS in 12 months' time on ${scheduledDirectDebitDate}.<br />`}
                    • <strong>UK Safety Compliance Stamp</strong>: Assessment satisfies the full legal terms of the UK Regulatory Reform Order 2005.<br />
                    • <strong>Delivery Assurance</strong>: Comprehensive physical report will be structured, signed by Charlie, and uploaded directly to your portal and corporate inbox within 5 working days of the physical inspection date.
                  </p>
                </div>

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="px-3.5 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold text-[10px] uppercase rounded-lg transition-all"
                  >
                    Adjust Booking
                  </button>
                  <span className="text-[11px] text-neutral-400 italic">Dispatched secure contracts to your email.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <p className="text-neutral-600 leading-relaxed font-sans">
                  Under the <strong>Regulatory Reform (Fire Safety) Order 2005</strong>, all non-sleeping commercial business and leisure premises (like gyms) must maintain a suitable and sufficient Fire Risk Assessment (FRA).
                </p>

                {/* Turnaround Time SLA and availability banner */}
                <div id="sla-guidelines-banner" className="p-3.5 bg-neutral-950 text-neutral-100 rounded-xl space-y-2 text-[11px] font-mono leading-relaxed">
                  <p className="text-amber-400 font-bold">🛡️ AURELIUS WEEKEND & TURNAROUND SLA ASSURANCES</p>
                  <p className="text-[10px]">
                    • <strong>Weekend walk-throughs only</strong>: Charlie operates independent Level 1 commercial audits strictly on Saturdays and Sundays (to avoid disrupting corporate gym operations).<br />
                    • <strong>Speedy Visit SLA</strong>: Physical inspection guaranteed within <strong>14 days</strong> of reservation.<br />
                    • <strong>Portal delivery SLA</strong>: Fully compiled digital and legal FRA report submitted back to your secure dashboard and inbox inside <strong>7 days</strong> of the on-site visit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Desired In-Person Assessment Target Date (Weekend Only)</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBookingDate(val);
                        if (val) {
                          const parts = val.split('-');
                          const yr = parseInt(parts[0], 10);
                          const mt = parseInt(parts[1], 10) - 1;
                          const dt = parseInt(parts[2], 10);
                          const day = new Date(yr, mt, dt).getDay();
                          if (day !== 0 && day !== 6) {
                            triggerSuccess("⚠️ Warning: Selected date is a weekday. Charlie is only available on Saturdays and Sundays.");
                          }
                        }
                      }}
                      className="w-full bg-stone-50 border border-neutral-250 rounded-lg p-2.5 font-bold focus:outline-none focus:border-neutral-800 focus:bg-white text-xs text-neutral-800 font-mono"
                    />
                    <span className="text-[9px] text-amber-700 block italic mt-1 font-sans">
                      *Please select a Saturday or Sunday. Visit within 14 days, report back in 7 days.*
                    </span>
                  </div>

                  {/* Pricing Bundle Combo Question */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Include active Monthly Compliance Portal?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIncludePortal('yes')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                          includePortal === 'yes'
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'bg-stone-50 border-neutral-200 text-neutral-600 hover:border-neutral-350'
                        }`}
                      >
                        <span className="font-bold block">YES (Recommend)</span>
                        <span className="text-[9px] text-left block opacity-85">Loyalty Price: £25/mo half-price!</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setIncludePortal('no')}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                          includePortal === 'no'
                            ? 'bg-neutral-900 border-neutral-900 text-white'
                            : 'bg-stone-50 border-neutral-200 text-neutral-600 hover:border-neutral-350'
                        }`}
                      >
                        <span className="font-bold block">NO (Review Only)</span>
                        <span className="text-[9px] block opacity-85">£149 annual review DD due in 12 months</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clear pricing dynamic preview */}
                <div className="p-4 bg-stone-50 border border-neutral-150 rounded-xl space-y-3">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-neutral-450">Calculated Service Agreement:</p>
                  
                  {includePortal === 'yes' ? (
                    <div className="space-y-1">
                      <p className="text-[11px] text-neutral-800">
                        • <strong>Physical On-Site inspection</strong>: Quoted as part of the Loyalty Care plan<br />
                        • <strong>Portal Access License</strong>: Half Price loyalty price applied at <strong className="text-neutral-950">£25.00 / month</strong> (originally £49/mo).
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold font-mono">✓ Promotion code LOYALTY25 is locked in.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[11px] text-neutral-800">
                        • <strong>Standalone Physical Audit Fee</strong>: £0.00 today!<br />
                        • <strong>BACS Mandate Deferred collection value</strong>: <strong className="text-neutral-950">£149.00</strong> billed automatically via Direct Debit precisely in 12 months' time on <strong>2027-06-20</strong>.<br />
                        • <strong>Portal Status</strong>: No active monthly portal license (restricted dashboard access after this assessment completes).
                      </p>
                      <p className="text-[10px] text-amber-700 font-bold font-mono">⚠️ Requires an active Direct Debit to execute scheduled annual payment.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg text-[10.5px] leading-relaxed text-neutral-750 font-serif">
                  <strong>UK Legal Disclosure Protection Policy:</strong> By proceeding, you agree to an annual commitment. Standalone memberships trigger an automatic renewal Direct Debit collection in 12 months. Early structural contract terminations within 30 days are subject to standard administration audit recovery charges of £95.00. Assessor's reports satisfy statutory burdens under the <em>Regulatory Reform order 2005.</em>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmFRABooking}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-xs uppercase font-extrabold tracking-wider rounded-xl transition-all"
                >
                  Authorize Mandate & Book Physical Assessment
                </button>
              </div>
            )}
          </div>

          {/* MEMORIAL/LEGAL CONTRACT SHIELD */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-red-800 flex items-center gap-1.5 border-b border-neutral-100 pb-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-900" />
              Written Legal Contract & Protective Cancellation Clauses
            </h3>
            
            <div className="text-[11px] leading-relaxed text-neutral-600 max-h-56 overflow-y-auto pr-2 space-y-3 font-serif">
              <div>
                <p className="font-sans font-bold text-neutral-800 uppercase text-[9px] tracking-wider mb-1">SECTION 1: STRUCTURAL COMPLIANCE OBLIGATIONS</p>
                <p>
                  This service agreement is entered into with <strong>Aurelius Fire Risk Systems Ltd</strong>, represented by Lead Auditor Charlie Hughes (NEBOSH Fire Safety). Assessment notes, digital checklists, and remedial directives are drafted under the strict auspices of the <strong>Regulatory Reform (Fire Safety) Order 2005 (FSO 2005)</strong> as applicable within the United Kingdom England & Wales jurisdictions.
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-neutral-800 uppercase text-[9px] tracking-wider mb-1">SECTION 2: AUTOMATIC 12-MONTH RE-ENGAGEMENT FEES</p>
                <p>
                  For clients opting for the standalone assessment package, a mandatory regulatory review fee of <strong>£149.00</strong> will be collected securely on the active BACS Direct Debit exactly 12 months subsequent to booking. Complete compliance reporting binds automatically. No individual intervention remains necessary.
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-neutral-800 uppercase text-[9px] tracking-wider mb-1">SECTION 3: ROBUST CANCELLATION & DISPUTE POLICIES</p>
                <p>
                  Clients retain a statutory right of termination subject to <strong>30 days written notice</strong> submitted directly via the compliance portal registry or corporate mailroom lines. Physical assessments booked are non-refundable once site engineers arrive. If premium site-isolated licenses are terminated mid-sentence, Aurelius reserves the right to capture out-of-pocket scheduling restoration fees of £95 before discharging the corporate mandate logbook records.
                </p>
              </div>

              <div>
                <p className="font-sans font-bold text-neutral-800 uppercase text-[9px] tracking-wider mb-1">SECTION 4: LIABILITY PROTECTIONS</p>
                <p>
                  Aurelius Fire Risk Systems holds comprehensive Professional Indemnity coverage. Charlie Hughes' expert opinions are constrained to the physical visual parameters of the sites. Ultimate fire regulatory authority lies with regional UK fire wardens and county brigadiers.
                </p>
              </div>
            </div>
            <p className="text-[9px] text-neutral-400 font-mono italic">
              *Full legal draft calibrated for corporate protection. Document verified by Aurelius Legal Counsel, Temple Chambers, London.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: BANKING DIRECT DEBIT MANAGEMENT & PROMOTIONS */}
        <div className="lg:col-span-4 space-y-6">

          {/* PREMIUM CHAT SUPPORT BOLT-ON DECK */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="border-b border-amber-200 pb-2 flex justify-between items-center text-left">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-900 flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-amber-600 fill-amber-300 animate-pulse" />
                Specialist Chat Support
              </h3>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                hasChatSupport ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {hasChatSupport ? 'Active (£20.00/mo)' : 'Available (£20.00/mo)'}
              </span>
            </div>

            <div className="text-xs text-left leading-relaxed text-slate-700 space-y-2">
              <p className="font-serif">
                Add the premium digital consultation bolt-on for <strong>£20.00 per month</strong> to directly dialogue with Lead Assessor <strong>Charlie Hughes (NEBOSH)</strong> about physical safety guidelines or BS-5839 loops.
              </p>

              {hasChatSupport ? (
                <div className="space-y-2 pt-1 font-sans">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-250 text-[10px] text-emerald-800 font-mono flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Support Subscription Active!
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onToggleChatSupport) onToggleChatSupport(false);
                      triggerSuccess("🛑 Premium Chat Support bolt-on deactivated from billing schedule.");
                    }}
                    className="w-full py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono font-bold uppercase text-[9px] rounded-lg transition-all cursor-pointer text-center"
                  >
                    Deactivate Support Plan
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleChatSupport) onToggleChatSupport(true);
                    triggerSuccess("✨ Premium Chat Support activated! £20.00/mo added to direct debit mandate.");
                  }}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold uppercase text-[10px] rounded-lg tracking-wider transition-all cursor-pointer text-center font-sans font-bold"
                >
                  🚀 Activate Support Bolt-on (£20.00/mo)
                </button>
              )}
            </div>
          </div>
          
          {/* CLIENT ACTIVE SUBSCRIPTION CONTROLLER */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-2 flex justify-between items-center text-left">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-900">
                Subscription Status
              </h3>
              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                subscriptionStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
              }`}>
                {subscriptionStatus === 'Active' ? 'Live Plan' : 'Notice Pending'}
              </span>
            </div>

            {/*notice status descriptions */}
            <div className="text-xs text-left leading-relaxed text-neutral-600 space-y-2.5">
              <p>
                Authorized continuous care membership is currently <strong className="text-neutral-950">{subscriptionStatus === 'Active' ? 'ACTIVE & FULLY AUDITED' : 'UNDER 30-DAY NOTICE PERIOD'}</strong>.
              </p>
              
              {subscriptionStatus === 'Active' ? (
                <div className="p-2.5 bg-neutral-50 rounded-lg border text-[11px] text-neutral-500 font-mono">
                  💡 <strong>Notice Policy:</strong> 30 Days Notice required on all subscription deactivations.
                </div>
              ) : (
                <div className="p-3 bg-amber-50/50 border border-amber-205 rounded-xl space-y-2">
                  <p className="font-extrabold text-amber-900 text-[11px]">⏳ Notice Period Active: {terminationNoticeDaysLeft} Days Remaining</p>
                  <p className="text-[10px] text-stone-500 font-sans leading-normal">
                    All compliance certificates and previous log exports have been automatically compiled and sent via a shared link to <strong>{activeClient?.email}</strong>. Download files before termination.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubscriptionStatus('Active');
                      triggerSuccess("✨ Membership successfully reinstated! Your continuous care plan has been re-activated with zero gaps in safety accountability.");
                    }}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold uppercase text-[9px] rounded transition-all cursor-pointer text-center font-sans font-bold"
                  >
                    🔄 Re-activate Live Membership Now
                  </button>
                </div>
              )}

              {/* Day of Month Selector to test the 5-day bank DD collection lock rule */}
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-stone-200/60 space-y-2">
                <span className="block text-[9px] font-mono font-bold uppercase text-neutral-400">Sandbox Calendar Tester (Day of Month)</span>
                
                <div className="flex items-center justify-between font-mono text-[10.5px] text-stone-700">
                  <span>Current Date: Day {simulatedDay}</span>
                  <span className="text-neutral-400">DD Collection: Day 28</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={simulatedDay}
                  onChange={(e) => setSimulatedDay(parseInt(e.target.value))}
                  className="w-full accent-neutral-800 cursor-pointer"
                />

                <p className="text-[9.5px] leading-normal text-stone-500 font-sans">
                  *DD collected monthly on the 28th. Cancellations are blocked 5 days before collection (Days 23 to 27) to avoid double banking fees.*
                </p>

                {subscriptionStatus === 'Active' && (
                  (() => {
                    const isWithin5DaysOfDD = simulatedDay >= 23 && simulatedDay <= 27;
                    if (isWithin5DaysOfDD) {
                      return (
                        <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[9.5px] font-mono leading-relaxed">
                          🚫 <strong>Cancel Button Disabled:</strong> BACS collection lock active. You cannot cancel within 5 days of your Direct Debit collection on the 28th.
                        </div>
                      );
                    } else {
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            setSubscriptionStatus('Cancelled');
                            setTerminationNoticeDaysLeft(30);
                            triggerSuccess(`🛑 30-Day Cancellation Notice Logged. All historic safety logs and audit vault documents have been auto-archived and emailed to ${activeClient?.email || 'client@firm.com'} in a shared link.`);
                          }}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold uppercase text-[10px] rounded-lg tracking-wider transition-all cursor-pointer text-center text-xs"
                        >
                          Cancel Subscription & Email Logs
                        </button>
                      );
                    }
                  })()
                )}
              </div>
            </div>
          </div>

          {/* SECURED BACS DIRECT DEBIT MANDATE CARD */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5 font-sans">
              <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Direct Debit Mandate
              </h3>
              <span className="text-[8px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                BACS Authorized
              </span>
            </div>

            {isEditingBank ? (
              <form onSubmit={handleUpdateBankDetails} className="space-y-3.5 text-xs text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Bank Institute Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-stone-50 border border-neutral-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-800 font-bold text-xs"
                    placeholder="Lloyds, HSBC, NatWest..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Sort Code (6-dig)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={sortCode}
                      onChange={(e) => setSortCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-stone-50 border border-neutral-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-800 text-center font-mono font-bold"
                      placeholder="e.g. 010203"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 font-mono">Account No (8-dig)</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-stone-50 border border-neutral-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-800 text-center font-mono font-bold"
                      placeholder="e.g. 12345678"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(false)}
                    className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-neutral-700 font-bold rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-neutral-900 hover:bg-neutral-850 text-white font-bold rounded cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-xs text-left">
                <div className="p-3 bg-[#FAF9F6] border border-neutral-250 rounded-xl space-y-2.5 font-mono">
                  <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
                    <span className="text-neutral-450 text-[10px]">ORGANIZATION:</span>
                    <span className="text-neutral-900 font-bold">{activeClient?.name || 'Correlative tenant'}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
                    <span className="text-neutral-450 text-[10px]">BANK:</span>
                    <span className="text-neutral-900 font-bold">{bankName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-200/50 pb-1.5">
                    <span className="text-neutral-450 text-[10px]">SORT CODE:</span>
                    <span className="text-neutral-905 font-bold">{sortCode.slice(0,2)}-{sortCode.slice(2,4)}-{sortCode.slice(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-450 text-[10px]">ACCOUNT NO:</span>
                    <span className="text-neutral-905 font-bold">****{accountNo.slice(-4)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingBank(true)}
                  className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-neutral-805 border border-stone-205 font-bold uppercase text-[10px] rounded-lg transition-all text-center cursor-pointer"
                >
                  Update Direct Debit details
                </button>
              </div>
            )}
          </div>

          {/* £0.01 MANDATE SANDBOX LIVE TESTER */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="border-b border-stone-100 pb-2 text-left">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-emerald-800 flex items-center gap-1 font-sans">
                ⚡ £0.01 Mandate Live Sandbox Tester
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Test GoCardless / Banking automation loop with a minimal microcharge.</p>
            </div>

            <div className="space-y-2 text-xs text-left">
              <input
                type="text"
                placeholder="Sort Code"
                maxLength={6}
                value={sandboxSortCode}
                onChange={(e) => setSandboxSortCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2 font-mono text-center text-xs tracking-wider focus:outline-none"
              />
              <input
                type="text"
                placeholder="Account Number"
                maxLength={8}
                value={sandboxAccountNo}
                onChange={(e) => setSandboxAccountNo(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FAF9F6] border border-neutral-250 rounded-lg p-2 font-mono text-center text-xs tracking-wider focus:outline-none"
              />
              
              <button
                type="button"
                onClick={() => {
                  if (sandboxSortCode.length !== 6 || sandboxAccountNo.length !== 8) {
                    triggerSuccess("⚠️ Input complete 6-digit sort code and 8-digit account number.");
                    return;
                  }
                  const testId = `BACS-TX-${Math.floor(100000 + Math.random() * 900000)}`;
                  setSandboxTransId(testId);
                  
                  // Record to payments ledger
                  const testLog = {
                    id: `pay-test-${Date.now()}`,
                    description: `Aurelius Fire Risk - Micropayment DD Test (Auth: ${testId})`,
                    amount: '£0.01',
                    status: 'Reconciled',
                    date: new Date().toISOString().split('T')[0]
                  };
                  payments.unshift(testLog);

                  triggerSuccess(`✅ Micro-mandate test successful! Dispatched £0.01 collection from account. Transaction ${testId} registered and confirmation email sent via aureliusfirerisk@consultant.com.`);
                }}
                className="w-full py-2 bg-[#E6F4EA] hover:bg-[#D4EDDA] text-emerald-900 border border-emerald-300 font-bold uppercase rounded-lg text-xs cursor-pointer text-center"
              >
                Trigger Micro-Mandate Test (£0.01)
              </button>

              {sandboxTransId && (
                <div className="p-2.5 bg-neutral-900 rounded-xl space-y-1 text-[10px] font-mono text-amber-400">
                  <p>✔ TEST PIPELINE REGISTERED</p>
                  <p className="text-white">Transaction: {sandboxTransId}</p>
                  <p className="text-neutral-400">Trading Name: "Aurelius Fire Risk"</p>
                </div>
              )}
            </div>
          </div>

          {/* CORPORATE SETTLEMENT BANK DETAILS FOR DIRECT TRANSFERS */}
          <div className="bg-gradient-to-br from-neutral-50 to-stone-100 border border-neutral-250 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-stone-200/60 pb-2 font-sans text-left">
              🏛️ Aurelius Fire Risk Settlement Bank
            </h3>

            <div className="text-[11px] leading-relaxed text-slate-705 space-y-2 text-left font-mono">
              <div className="flex justify-between border-b border-stone-200/50 pb-1 font-sans">
                <span>ACCOUNT NAME:</span>
                <strong className="text-black font-sans text-[10px]">Aurelius Fire Risk Systems Ltd</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200/50 pb-1">
                <span>BANKING CENTER:</span>
                <strong className="text-stone-900">{companyBankName}</strong>
              </div>
              <div className="flex justify-between border-b border-stone-200/50 pb-1">
                <span>SORT CODE:</span>
                <strong className="text-stone-900">{companySortCode.slice(0,2)}-{companySortCode.slice(2,4)}-{companySortCode.slice(4)}</strong>
              </div>
              <div className="flex justify-between">
                <span>ACCOUNT NUMBER:</span>
                <strong className="text-stone-900">{companyAccountNo}</strong>
              </div>
              <div className="p-2 bg-stone-300/30 text-[9.5px] rounded border font-sans text-neutral-600 mt-2 leading-relaxed">
                ⚠ Under strict compliance regulations, all payments are taken as **"Aurelius Fire Risk"** on banking streams.
              </div>
            </div>
          </div>

          {/* ACTIVE PROMOTIONS / CODE REWARD SYSTEM */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-900 flex items-center gap-1.5 border-b border-neutral-100 pb-2.5">
              <Tag className="w-4 h-4 text-amber-600" />
              Corporate Compliance Promos
            </h3>

            {activeCode && (
              <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg flex items-center justify-between text-xs font-mono font-bold">
                <span>🎫 ACTIVE: {activeCode}</span>
                <span className="text-[10px] uppercase text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {activeCode === 'LOYALTY25' ? '£25/mo Active' : 'Active Applied'}
                </span>
              </div>
            )}

            <form onSubmit={handleApplyPromoCode} className="flex gap-2 text-xs">
              <input
                type="text"
                placeholder="e.g. LOYALTY25"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="flex-1 bg-stone-50 border border-neutral-250 rounded-lg px-2.5 py-1.5 font-bold uppercase focus:outline-none focus:border-neutral-800"
              />
              <button
                type="submit"
                className="px-3.5 bg-neutral-900 hover:bg-neutral-850 text-white font-bold rounded-lg transition-all"
              >
                Apply
              </button>
            </form>

            <div className="p-3 bg-stone-50 rounded-lg border border-neutral-150 text-[11px] leading-relaxed text-stone-550 space-y-1 select-text">
              <p className="font-bold text-neutral-700">Available Promo Codes:</p>
              <p>• <strong className="font-mono text-neutral-800">LOYALTY25</strong>: Reduces monthly license to £25/mo companion half-price rate with any physical assessment bundle.</p>
              <p>• <strong className="font-mono text-neutral-800">FREEASSESS</strong>: Waives the standard BACS trainee onboarding fees completely.</p>
            </div>
          </div>

          {/* TRANSACTIONAL COMPLIANCE CASHFLOW LEDGER */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-900 flex items-center gap-1.5 border-b border-neutral-100 pb-2.5">
              <Clock className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              Licensing Cashflow Ledger
            </h3>

            <div className="divide-y divide-neutral-100 text-xs space-y-2.5 pt-1">
              {hasChatSupport && (
                <div className="pt-2 flex justify-between items-start gap-1 bg-amber-50/40 p-2.5 rounded-lg border border-amber-200/50 mb-2">
                  <div>
                    <p className="font-extrabold text-amber-900 text-[11px] leading-tight flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600 fill-amber-300" />
                      Premium Specialist Chat Support Bolt-on
                    </p>
                    <p className="text-[10px] text-amber-700 font-mono mt-0.5">Recurring Monthly SLA • Active (Settled via DD)</p>
                  </div>
                  <span className="font-mono font-bold text-amber-950 shrink-0 text-right">
                    £20.00
                  </span>
                </div>
              )}

              {payments.map((p) => (
                <div key={p.id} className="pt-2 flex justify-between items-start gap-1">
                  <div>
                    <p className="font-bold text-neutral-800 text-[11px] leading-tight">{p.description}</p>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{p.date} • {p.status}</p>
                  </div>
                  <span className="font-mono font-bold text-neutral-900 shrink-0 text-right">
                    {p.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
