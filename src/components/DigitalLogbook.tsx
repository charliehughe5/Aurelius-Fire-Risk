import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Server, 
  Info, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ClipboardList,
  History,
  Trash2,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  RotateCcw,
  Flame,
  MessageSquare,
  PlusCircle,
  Activity,
  Timer
} from 'lucide-react';
import { FirelogEntry, FireDrillHistoryEntry } from '../types';

interface DigitalLogbookProps {
  logs: FirelogEntry[];
  onFirelogSubmit: (siteId: string, testName: string, status: 'Pass' | 'Fail', customNotes?: string) => void;
  onFirelogDelete?: (logId: string) => void;
  activeSite: any;
  activeUser: any;
  triggerSuccess: (msg: string) => void;
  fireDrillsHistory?: FireDrillHistoryEntry[];
  onAddFireDrill?: (siteId: string, durationStr: string, notesText: string, statusOverride?: 'Pass' | 'Fail', secondsVal?: number) => void;
  onDeleteFireDrill?: (drillId: string) => void;
  onAddDrillComment?: (drillId: string, text: string) => void;
  activeSubTab?: 'weekly' | 'monthly' | 'patrol' | 'drill' | 'history';
  onChangeSubTab?: (tab: 'weekly' | 'monthly' | 'patrol' | 'drill' | 'history') => void;
}

interface PatrolCheckpoint {
  id: string;
  name: string;
  desc: string;
  regulatoryCode: string;
  status: 'Pass' | 'Fail';
  notes: string;
}

interface BuildingPatrolReport {
  id: string;
  propertyId: string;
  timestamp: string;
  userName: string;
  overallStatus: 'Pass' | 'Fail';
  items: PatrolCheckpoint[];
}

const INITIAL_CHECKPOINTS: PatrolCheckpoint[] = [
  {
    id: 'pt-1',
    name: 'Escape Corridors & Exit Doors',
    desc: 'Verify all primary escape stairs, fire exits, and corridor pathways are free of stock, cardboard boxes, or secondary obstructions.',
    regulatoryCode: 'FSO 2005 Article 14',
    status: 'Pass',
    notes: 'Primary escape corridors checked: pathways are wide, clear, and doors open freely.'
  },
  {
    id: 'pt-2',
    name: 'Fire Door Closers & Intumescent Seals',
    desc: 'Ensure automatic fire doors close fully into their frame rebates and intumescent brush strips are intact.',
    regulatoryCode: 'BS 8214 Standard',
    status: 'Pass',
    notes: 'Tested self-closers on cross-corridor smoke barriers: reliable closure verified.'
  },
  {
    id: 'pt-3',
    name: 'Emergency Exit Lighting LEDs',
    desc: 'Confirm backup battery visual indicators are illuminated solid green; report localized dimming or bulb failures.',
    regulatoryCode: 'BS 5266-1 Code',
    status: 'Pass',
    notes: 'Emergency bulkheads scanned: green charge signals showing steady, no flickering.'
  },
  {
    id: 'pt-4',
    name: 'Central Fire Control Panel Standby',
    desc: 'Perform direct walk-past of main panel. Confirm green power status with zero yellow fault, alarm or silencing lamps lit.',
    regulatoryCode: 'BS 5839 Part 1',
    status: 'Pass',
    notes: 'Panel status healthy; loop controllers report normal standby with no faults active.'
  },
  {
    id: 'pt-5',
    name: 'Combustible Materials & External Bin Cages',
    desc: 'Confirm industrial external rubbish bins are closed, locked, and positioned safely away from perimeter structural walls.',
    regulatoryCode: 'Insurance Condition F1',
    status: 'Pass',
    notes: 'External refuse containers verified locked within designated steel pen enclosures.'
  },
  {
    id: 'pt-6',
    name: 'Weekly Sprinkler Pressure Logs & Tanks',
    desc: 'Verify main sprinkler water tank pressure, pipeline balance valves, and backflow preventers to ensure operational fire suppression.',
    regulatoryCode: 'BS 9251 Regulation',
    status: 'Pass',
    notes: 'Sprinkler pressure logs recorded within healthy ranges. Pump flow rate stable.'
  },
  {
    id: 'pt-7',
    name: 'Weekly Wet/Dry Riser Cabinets',
    desc: 'Verify dry riser inlet valves are sealed, cabinet glass is intact, and outlet landing valves are closed and fully operational.',
    regulatoryCode: 'BS 9990 Regulation',
    status: 'Pass',
    notes: 'Checked wet/dry risers: instantaneous coupling rings free of debris, valves fully shut.'
  },
  {
    id: 'pt-8',
    name: 'P50 Composite Extinguisher Gauges',
    desc: 'Audit the carbon-composite P50 extinguishers: verify dual-pointers are in the green, casings are scratch-free, and hose seals are intact.',
    regulatoryCode: 'P50 Standards',
    status: 'Pass',
    notes: 'Composite P50 extinguishers reviewed: primary/secondary gauges are in alignment.'
  },
  {
    id: 'pt-9',
    name: 'Weekly Passenger Lift Intercom & Auto-Grounding',
    desc: 'Confirm the lift cars drop automatically to ground level on fire alarm trip and that the emergency voice communications intercom functions.',
    regulatoryCode: 'EN 81 Standard',
    status: 'Pass',
    notes: 'Lift auto-descend fail-safes verified active. Emergency intercom crystal-clear.'
  },
  {
    id: 'pt-10',
    name: 'Monthly Escalator Automated Stop Buttons on Fire Line',
    desc: 'Verify the manual safety-stop switches deactivate the escalator immediately and respond safely on fire alarm control module trigger.',
    regulatoryCode: 'BS EN 115 Compliance',
    status: 'Pass',
    notes: 'Escalator trip relays checked and holding current; auto-braking is active.'
  },
  {
    id: 'pt-11',
    name: 'Monthly Disabled Refuge Evacuation Chairs Check',
    desc: 'Examine primary evac-sheets, safety locking mechanism hooks, and wheel treads for stair descent transit systems.',
    regulatoryCode: 'BS 9999 Annex G',
    status: 'Pass',
    notes: 'All refuge chairs inspected. Straps represent solid strength and tracks run clean.'
  },
  {
    id: 'pt-12',
    name: 'Monthly DDA Help Points Loop Communications',
    desc: 'Execute diagnostic loop calls to verify direct high-audibility voice intercom lines from absolute refuge zones to front-desk monitor panels.',
    regulatoryCode: 'Equality Act 2010',
    status: 'Pass',
    notes: 'DDA help panels tested: loop volume outputs exceed ambient noise thresholds.'
  }
];

export default function DigitalLogbook({
  logs,
  onFirelogSubmit,
  onFirelogDelete,
  activeSite,
  activeUser,
  triggerSuccess,
  fireDrillsHistory = [],
  onAddFireDrill,
  onDeleteFireDrill,
  onAddDrillComment,
  activeSubTab,
  onChangeSubTab
}: DigitalLogbookProps) {
  // Tabs
  // Separate sub pages for Weekly and Monthly checks so people understand the frequency!
  const [internalTab, setInternalTab] = useState<'weekly' | 'monthly' | 'patrol' | 'drill' | 'history'>('weekly');
  
  const activeTab = activeSubTab || internalTab;
  const setActiveTab = (tab: 'weekly' | 'monthly' | 'patrol' | 'drill' | 'history') => {
    if (onChangeSubTab) {
      onChangeSubTab(tab);
    } else {
      setInternalTab(tab);
    }
  };
  
  // Local Fire Drill Simulation Tab States
  const [drillSeconds, setDrillSeconds] = useState(0);
  const [drillActive, setDrillActive] = useState(false);
  const [drillTimerId, setDrillTimerId] = useState<any>(null);
  const [drillNotes, setDrillNotes] = useState('');
  const [selectedPassFail, setSelectedPassFail] = useState<'Pass' | 'Fail'>('Pass');
  const [newDrillComment, setNewDrillComment] = useState<Record<string, string>>({}); // mapped by drillId
  const [expandedDrillId, setExpandedDrillId] = useState<string | null>(null);

  // Clean timer cleanup on unmount
  useEffect(() => {
    return () => {
      if (drillTimerId) {
        clearInterval(drillTimerId);
      }
    };
  }, [drillTimerId]);

  const startDrillStopwatch = () => {
    if (drillActive) return;
    setDrillActive(true);
    const id = setInterval(() => {
      setDrillSeconds(prev => prev + 1);
    }, 1000);
    setDrillTimerId(id);
  };

  const stopDrillStopwatch = () => {
    if (!drillActive) return;
    setDrillActive(false);
    if (drillTimerId) {
      clearInterval(drillTimerId);
      setDrillTimerId(null);
    }
    // Auto-detect status but user can override:
    // Standard UK threshold is 180 seconds (3 mins). If longer, warn or pre-fail
    if (drillSeconds > 180) {
      setSelectedPassFail('Fail');
    } else {
      setSelectedPassFail('Pass');
    }
  };

  const resetDrillStopwatch = () => {
    setDrillActive(false);
    if (drillTimerId) {
      clearInterval(drillTimerId);
      setDrillTimerId(null);
    }
    setDrillSeconds(0);
    setSelectedPassFail('Pass');
  };

  const commitDrillRecord = () => {
    if (onAddFireDrill) {
      const mins = Math.floor(drillSeconds / 60);
      const secs = drillSeconds % 60;
      const formattedDuration = `${mins} min${mins !== 1 ? 's' : ''} ${secs} second${secs !== 1 ? 's' : ''}`;
      
      onAddFireDrill(
        activeSite?.id || 'site-1',
        formattedDuration,
        drillNotes,
        selectedPassFail,
        drillSeconds
      );
      
      // Reset simulator state
      resetDrillStopwatch();
      setDrillNotes('');
      triggerSuccess('📝 Dynamic 6-Month Fire Drill recorded in Compliance History!');
    }
  };
  
  // Site check state (individual)
  const [selectedCheckType, setSelectedCheckType] = useState<string>('Friday Fire Alarm Testing');
  const [testNotes, setTestNotes] = useState<string>('');

  // Building Patrol Checklist state
  const [checkpointState, setCheckpointState] = useState<PatrolCheckpoint[]>(INITIAL_CHECKPOINTS);
  
  // Expandable patrol reports mapping
  const [expandedPatrolId, setExpandedPatrolId] = useState<string | null>(null);

  // Load / Sync Patrol Reports with localStorage
  const [patrolReports, setPatrolReports] = useState<BuildingPatrolReport[]>(() => {
    const saved = localStorage.getItem('aurelius_patrol_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Return mock initial patrol report matching the history
    return [
      {
        id: 'pat-mock-1',
        propertyId: 'site-1',
        timestamp: '2026-06-20 09:15',
        userName: 'Charlie Hughes',
        overallStatus: 'Pass',
        items: [
          { id: 'pt-1', name: 'Escape Corridors & Exit Doors', desc: '', regulatoryCode: 'FSO 2005 Article 14', status: 'Pass', notes: 'Corridors swept: broad, clean and unobstructed.' },
          { id: 'pt-2', name: 'Fire Door Closers & Intumescent Seals', desc: '', regulatoryCode: 'BS 8214 Standard', status: 'Pass', notes: 'Closures tested in main block.' },
          { id: 'pt-3', name: 'Emergency Exit Lighting LEDs', desc: '', regulatoryCode: 'BS 5266-1 Code', status: 'Pass', notes: 'LED indicator checks pass.' },
          { id: 'pt-4', name: 'Central Fire Control Panel Standby', desc: '', regulatoryCode: 'BS 5839 Part 1', status: 'Pass', notes: 'Standby armed normal.' },
          { id: 'pt-5', name: 'Combustible Materials & External Bin Cages', desc: '', regulatoryCode: 'Insurance Condition F1', status: 'Pass', notes: 'Bins caged.' }
        ]
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('aurelius_patrol_reports', JSON.stringify(patrolReports));
  }, [patrolReports]);

  const checklistOptions = [
    { name: 'Friday Fire Alarm Testing', desc: 'Weekly break-glass trigger simulator. Check audibility on all floors and panel reset clearance.' },
    { name: 'Emergency Escape Corridors Check', desc: 'Daily inspection of primary stairs to ensure zero obstruction from palleted supplies.' },
    { name: 'Emergency Lighting Static Discharge', desc: 'Monthly test on emergency battery bulkheads to confirm discharge holds at full luminosity.' },
    { name: 'Deployable Esters & Extinguisher Seals', desc: 'Quarterly check of CO2 and pressure gauges to ensure standard charge limits are valid.' }
  ];

  // Submit standard single check
  const handleCreateCheck = (status: 'Pass' | 'Fail') => {
    const finalNotes = testNotes.trim() 
      ? testNotes 
      : (status === 'Pass' 
          ? `Routine ${selectedCheckType} verified nominal by ${activeUser.name}.` 
          : `CRITICAL FAULT DETECTED during ${selectedCheckType}: Immediate attention required.`);
    
    onFirelogSubmit(activeSite?.id || 'site-1', selectedCheckType, status, finalNotes);
    triggerSuccess(`Successfully recorded a ${status.toUpperCase()} check for ${selectedCheckType}.`);
    setTestNotes('');
  };

  // Changing status of a particular checkpoint in the Patrol Checklist
  const handleCheckpointStatusChange = (id: string, status: 'Pass' | 'Fail') => {
    setCheckpointState(prev => prev.map(item => {
      if (item.id === id) {
        // Generate pre-populated sensible defaults depending on status
        let defaultNotes = '';
        if (status === 'Pass') {
          if (item.id === 'pt-1') defaultNotes = 'Primary escape corridors checked: pathways are wide, clear, and doors open freely.';
          if (item.id === 'pt-2') defaultNotes = 'Tested self-closers on cross-corridor smoke barriers: reliable closure verified.';
          if (item.id === 'pt-3') defaultNotes = 'Emergency bulkheads scanned: green charge signals showing steady, no flickering.';
          if (item.id === 'pt-4') defaultNotes = 'Panel status healthy; loop controllers report normal standby with no faults active.';
          if (item.id === 'pt-5') defaultNotes = 'External refuse containers verified locked within designated steel pen enclosures.';
          if (item.id === 'pt-6') defaultNotes = 'Sprinkler pressure logs recorded within healthy ranges. Pump flow rate stable.';
          if (item.id === 'pt-7') defaultNotes = 'Checked wet/dry risers: instantaneous coupling rings free of debris, valves fully shut.';
          if (item.id === 'pt-8') defaultNotes = 'Composite P50 extinguishers reviewed: primary/secondary gauges are in alignment.';
          if (item.id === 'pt-9') defaultNotes = 'Lift auto-descend fail-safes verified active. Emergency intercom crystal-clear.';
          if (item.id === 'pt-10') defaultNotes = 'Escalator trip relays checked and holding current; auto-braking is active.';
          if (item.id === 'pt-11') defaultNotes = 'All refuge chairs inspected. Straps represent solid strength and tracks run clean.';
          if (item.id === 'pt-12') defaultNotes = 'DDA help panels tested: loop volume outputs exceed ambient noise thresholds.';
        } else {
          if (item.id === 'pt-1') defaultNotes = 'CORRIDOR FAULT: Box containers identified blocks the 2nd-floor fire exit stairway! Recurrence flagged.';
          if (item.id === 'pt-2') defaultNotes = 'FAILING CLOSURE: Room 104 smoke door binding on standard carpet margin. Needs warden alignment.';
          if (item.id === 'pt-3') defaultNotes = 'EMERGENCY FAULT: Lobby light fail signals observed. Battery cell requires backup check.';
          if (item.id === 'pt-4') defaultNotes = 'FAULT LAMP: Panel indicates loop 2 earth fault error. Urgent call-out scheduled.';
          if (item.id === 'pt-5') defaultNotes = 'UNLOCKED BIN: Main rubbish bin found unlocked next to intake ventilation zone.';
          if (item.id === 'pt-6') defaultNotes = 'LOW PRESSURE: Sprinkler system pressure registered warning line at level 1 gauge.';
          if (item.id === 'pt-7') defaultNotes = 'CABINET FAULT: Wet/dry riser cabinet door hinges rusted shut. Jammed latch hinders access.';
          if (item.id === 'pt-8') defaultNotes = 'GAUGE DEVIATION: P50 composite pressure needle slipped outside the standard compliance boundaries.';
          if (item.id === 'pt-9') defaultNotes = 'COMMUNICATION BREAKDOWN: Elevator emergency microphone reports severe signal noise/no connection.';
          if (item.id === 'pt-10') defaultNotes = 'RELAY FAILURE: Fire loop solenoid failed to drop auxiliary control power from main escalator terminal.';
          if (item.id === 'pt-11') defaultNotes = 'MISSING RESTRAINT: Refuge chair #1 harness clip broken. Unsafe for emergency transit stair-descent.';
          if (item.id === 'pt-12') defaultNotes = 'FEEDBACK FAIL: Induction loop amplifier dead in level 2 disability sanctuary station check.';
        }

        return { ...item, status, notes: defaultNotes };
      }
      return item;
    }));
  };

  // Changing notes text for a particular checkpoint
  const handleCheckpointNotesChange = (id: string, notes: string) => {
    setCheckpointState(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  // Save the full Building Patrol Checklist Report
  const handleSavePatrolReport = (e: React.FormEvent) => {
    e.preventDefault();
    const siteId = activeSite?.id || 'site-1';
    
    // An overall patrol fails if ANY single item fails
    const hasAnyFailure = checkpointState.some(item => item.status === 'Fail');
    const overallStatus = hasAnyFailure ? 'Fail' : 'Pass';

    const newReport: BuildingPatrolReport = {
      id: `patrol-${Date.now()}`,
      propertyId: siteId,
      timestamp: new Date().toISOString().substring(0, 16).replace('T', ' '),
      userName: activeUser.name,
      overallStatus: overallStatus,
      items: [...checkpointState]
    };

    // 1. Add to local patrol reports history
    setPatrolReports(prev => [newReport, ...prev]);

    // 2. Submit summarized action to standard logs so it affects overall site scoreboard / compliant stats!
    const summaryNotes = checkpointState.map(item => `[${item.status.toUpperCase()}] ${item.name}: ${item.notes}`).join('\n');
    onFirelogSubmit(
      siteId, 
      'Full Building Patrol Audit', 
      overallStatus, 
      `Compiled visual walkthrough audit completed on current site shift.\n${summaryNotes}`
    );

    triggerSuccess(`📝 Saved Complete Building Patrol Checklist Report! Overall status: ${overallStatus.toUpperCase()}`);
    
    // Reset inputs but keep structure
    setCheckpointState(INITIAL_CHECKPOINTS.map(item => ({ ...item, notes: item.notes })));
    setActiveTab('history');
  };

  // Deletion logic
  const handleDeletePatrolReport = (id: string) => {
    setPatrolReports(prev => prev.filter(report => report.id !== id));
    triggerSuccess('✅ Successfully deleted the building patrol record from ledger history.');
  };

  const handleDeleteIndividualLog = (id: string) => {
    if (onFirelogDelete) {
      onFirelogDelete(id);
    }
  };

  // Only display logs/patrols corresponding to active site
  const siteIdFilter = activeSite?.id || 'site-1';
  const siteLogs = logs.filter(log => log.propertyId === siteIdFilter);
  const sitePatrols = patrolReports.filter(pat => pat.propertyId === siteIdFilter);

  return (
    <div className="space-y-6 text-left">
      
      {/* Title & Navigation Tabs Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            Digital Fire Logbook & Building Patrols
          </h2>
          <p className="text-xs text-slate-500">
            Fulfill FSO 2005 obligations securely. Log standard Friday alarms, perform deep building patrol walkthroughs, and audit historic records.
          </p>
        </div>

        <div className="flex bg-stone-100/80 border border-stone-200 p-1 rounded-xl text-stone-700 max-w-fit flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('weekly');
              setSelectedCheckType('Friday Fire Alarm Testing');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'weekly' ? 'bg-amber-500 text-neutral-950 shadow-sm border border-amber-300' : 'hover:text-slate-900'}`}
          >
            <span className="text-amber-600 font-extrabold pb-0.5">🗓️</span>
            Weekly Sub-Page (7-Day Audits)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('monthly');
              setSelectedCheckType('Emergency Lighting Static Discharge');
            }}
            className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-sm border border-blue-400 font-black' : 'hover:text-slate-900'}`}
          >
            <span className="text-blue-200 font-extrabold pb-0.5">📋</span>
            Monthly Sub-Page (30-Day Audits)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('patrol')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'patrol' 
                ? 'bg-neutral-900 text-white shadow-sm font-bold border border-neutral-800' 
                : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Building Patrol (Daily Required)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drill')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'drill' 
                ? 'bg-orange-500 text-neutral-950 shadow-sm font-extrabold' 
                : 'hover:text-slate-900 font-bold'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-neutral-950 animate-pulse" />
            6-Month Fire Drill
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${activeTab === 'history' ? 'bg-white text-slate-900 shadow-sm border border-stone-200' : 'hover:text-slate-900'}`}
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            Registry ({siteLogs.length + sitePatrols.length + fireDrillsHistory.filter(d => d.siteId === siteIdFilter).length})
          </button>
        </div>
      </div>

      {/* TAB: WEEKLY TESTS */}
      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* New test generator */}
          <div className="lg:col-span-12 bg-amber-500/10 border-2 border-dashed border-amber-400 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
            <div>
              <span className="px-2 py-1 bg-amber-400 text-neutral-950 rounded text-[10px] font-mono font-black uppercase tracking-widest">
                ⏱️ WEEKLY COMPLIANCE SUB-PAGE (7-DAY CADENCE)
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-2">Mandatory 7-Day Routine Audits</h4>
              <p className="text-xs text-slate-600">
                Weekly tests are safety requirements to be conducted every 7 days, focusing on Break-Glass Callpoint triggers, Fire Door closures, and corridor clearances.
              </p>
            </div>
            <div className="text-[10px] bg-amber-500 text-neutral-950 font-mono font-black px-3 py-2 rounded-lg border border-amber-300 uppercase tracking-wider text-center shrink-0">
              Target Frequency: Every 7 Days
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <span className="text-[9px] font-mono text-amber-600 uppercase tracking-widest block font-bold">Weekly Checkpoint Select</span>
              <h3 className="text-base font-bold text-slate-805 mt-1">Select Check Directive</h3>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Friday Fire Alarm Testing', desc: 'Weekly break-glass trigger simulator. Check audibility on all floors and panel reset clearance.' },
                { name: 'Emergency Escape Corridors Check', desc: 'Verify escape stairways, corridors and fire door pathways of designated escape routes are free of obstruction.' },
                { name: 'Fire Door Auto-Closers Check', desc: 'Weekly examination to confirm all designated fire doors close tightly and seals are in sound order.' }
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedCheckType(opt.name)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    selectedCheckType === opt.name
                      ? 'border-slate-800 bg-slate-50/50 shadow-xs ring-1 ring-slate-800'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded shrink-0 ${selectedCheckType === opt.name ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className={`text-xs font-bold ${selectedCheckType === opt.name ? 'text-slate-900' : 'text-slate-705'}`}>{opt.name}</p>
                    <p className="text-[10px] text-slate-450 leading-normal">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-bold text-slate-550 block">Log Notes / Inspector Action Comments</label>
              <textarea
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="Leave empty for system standard pass notation or describe findings..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800 focus:bg-white transition-all text-neutral-800 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateCheck('Fail')}
                  className="flex-1 py-3 bg-rose-50 hover:bg-rose-100/75 border border-rose-300 text-rose-850 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Log Check FAIL
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateCheck('Pass')}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Log Check PASS
                </button>
              </div>
              <span className="block text-center text-[10px] text-slate-400 mt-3 font-mono">
                Signing logs binds records cryptographically to: <strong>{activeUser?.name}</strong> ({activeUser?.role})
              </span>
            </div>
          </div>

          {/* Guidelines Pane */}
          <div className="lg:col-span-7 bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850">Aurelius Compliance Safety Responses</h3>
              <p className="text-xs text-slate-455">How log system decisions modify your live scorecard parameters and target deadlines:</p>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3.5">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850">Fails Trigger Immediate Action Tracker Cards</h4>
                  <p className="text-slate-500">
                    When you click "Log Check FAIL", the system generates a high-severity action explaining exactly <strong>why this matters</strong> to property insurance audits.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3.5">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850">Passes Maintain High Compliance Score</h4>
                  <p className="text-slate-500">
                    Regular passing checks maintain scoreboards above the compliance target of {activeSite?.score || 95}%. It signals standard landlord care to visiting safety marshals.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/45 rounded-xl border border-amber-200 flex items-start gap-3 text-[11px] font-mono text-amber-850">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>UK LEGISLATION WARNING:</strong> Falsifying logging records is an indictable offence under section 32 of the Regulatory Reform (Fire Safety) Order 2005. Complete honest manual checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: MONTHLY AUDITS */}
      {activeTab === 'monthly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-12 bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fadeIn">
            <div>
              <span className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-mono font-black uppercase tracking-widest">
                ⏱️ MONTHLY COMPLIANCE SUB-PAGE (30-DAY CADENCE)
              </span>
              <h4 className="text-base font-extrabold text-slate-900 mt-2">Deep Statutory Equipment Inspections</h4>
              <p className="text-xs text-slate-600">
                Monthly audits are scheduled deep-level inspections conducted at standard 30-day offsets to verify crucial hardware backups.
              </p>
            </div>
            <div className="text-[10px] bg-blue-605 bg-blue-600 text-white font-mono font-black px-3 py-2 rounded-lg border border-blue-400 uppercase tracking-wider text-center shrink-0">
              Target Frequency: Every 30 Days
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
            <div>
              <span className="text-[9px] font-mono text-blue-600 uppercase tracking-widest block font-bold">Monthly Checkpoint Select</span>
              <h3 className="text-base font-bold text-slate-805 mt-1">Select Check Directive</h3>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Emergency Lighting Static Discharge', desc: 'Monthly test on emergency battery bulkheads to confirm discharge holds at full luminosity.' },
                { name: 'P50 Composite Extinguisher Gauges', desc: 'Monthly audit of P50 extinguishers: verify dual-pointers are in the green, casings are safe.' },
                { name: 'Disabled Refuge Evacuation Chairs Check', desc: 'Monthly check of refuge sheets, belts, and stair runner treads.' },
                { name: 'Escalator Automated Stop Buttons', desc: 'Monthly test confirming manual safety-stop switches de-energise escalator systems on fire line.' },
                { name: 'DDA Help Points Loop Communications', desc: 'Monthly diagnostic loop call verifying active audio link from refuge cells.' }
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedCheckType(opt.name)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                    selectedCheckType === opt.name
                      ? 'border-blue-600 bg-blue-50/30 shadow-xs ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-1.5 rounded shrink-0 ${selectedCheckType === opt.name ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className={`text-xs font-bold ${selectedCheckType === opt.name ? 'text-blue-900' : 'text-slate-705'}`}>{opt.name}</p>
                    <p className="text-[10px] text-slate-450 leading-normal">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-[10px] uppercase font-bold text-slate-550 block">Log Notes / Inspector Action Comments</label>
              <textarea
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                placeholder="Leave empty for system standard pass notation or describe findings..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-neutral-800 placeholder:text-slate-400"
              />
            </div>

            <div className="pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateCheck('Fail')}
                  className="flex-1 py-3 bg-rose-50 hover:bg-rose-100/75 border border-rose-300 text-rose-850 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Log Check FAIL
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateCheck('Pass')}
                  className="flex-1 py-3 bg-neutral-950 hover:bg-neutral-850 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Log Check PASS
                </button>
              </div>
              <span className="block text-center text-[10px] text-slate-400 mt-3 font-mono">
                Signing logs binds records cryptographically to: <strong>{activeUser?.name}</strong> ({activeUser?.role})
              </span>
            </div>
          </div>

          {/* Guidelines Pane */}
          <div className="lg:col-span-7 bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-850">Aurelius compliance Safety Responses</h3>
              <p className="text-xs text-slate-455">How log system decisions modify your live scorecard parameters and target deadlines:</p>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3.5">
                <div className="p-1.5 bg-rose-50 text-rose-600 rounded shrink-0">
                  <XCircle className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850">Fails Trigger Immediate Action Tracker Cards</h4>
                  <p className="text-slate-500">
                    When you click "Log Check FAIL", the system generates a high-severity action explaining exactly <strong>why this matters</strong> to property insurance audits.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3.5">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-850">Passes Maintain High Compliance Score</h4>
                  <p className="text-slate-500">
                    Regular passing checks maintain scoreboards above the compliance target of {activeSite?.score || 95}%. It signals standard landlord care to visiting safety marshals.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-250 flex items-start gap-3 text-[11px] font-mono text-stone-705">
                <Info className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>UK LEGISLATION WARNING:</strong> Falsifying logging records is an indictable offence under section 32 of the Regulatory Reform (Fire Safety) Order 2005. Complete honest manual checks.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUILDING PATROL CHECKLIST (THE USER REQUESTED THIS) */}
      {activeTab === 'patrol' && (
        <form onSubmit={handleSavePatrolReport} className="space-y-6 animate-fadeIn">
          <div className="bg-gradient-to-r from-neutral-900 via-stone-900 to-neutral-850 text-white rounded-2xl p-6 shadow-md border border-neutral-800 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-52 h-52 bg-white/5 rounded-full blur-2xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-mono font-bold tracking-widest uppercase">
                  DAILY ADVISORY ROUTINE
                </span>
                <span className="px-2 py-0.5 bg-amber-400 text-neutral-950 rounded text-[10px] font-mono font-bold tracking-widest uppercase">
                  WEEKLY MINIMUM REQUIRED
                </span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                  Key Holder Building Patrol Walkthrough Checklist
                </h3>
                <p className="text-xs text-neutral-400">
                  Execute comprehensive, high-resolution physical property inspections across all safety corridors.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-stone-300">
                <div className="space-y-1">
                  <p className="font-extrabold text-amber-400 text-xs">⏱️ Recommended Cadence: DAILY</p>
                  <p className="leading-relaxed">
                    A key holder or duty manager is strongly advised to visually inspect the building's escape pathways <strong>daily</strong> to secure rapid egress safety.
                  </p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/10 pt-2.5 md:pt-0 md:pl-4">
                  <p className="font-extrabold text-rose-400 text-xs">⚠️ Legal Minimum Cadence: WEEKLY</p>
                  <p className="leading-relaxed">
                    Under the RRO directive guidelines, unified patrol inspections MUST be checked, recorded, and cached in compliance logs at a <strong>minimum of once per week</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {checkpointState.map((pt, idx) => (
              <div key={pt.id} className="bg-white border border-stone-200 hover:border-slate-300 transition-all rounded-xl p-5 space-y-4 text-left shadow-xs">
                
                {/* Checkpoint row header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-stone-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">{pt.name}</h4>
                      <span className="px-2 py-0.5 border border-stone-200 bg-stone-50 font-mono text-[9px] text-stone-450 uppercase rounded tracking-wide font-bold">
                        {pt.regulatoryCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-8 leading-normal">{pt.desc}</p>
                  </div>

                  {/* Pass Fail Selector buttons (The user asked for pass fail notes for each one!) */}
                  <div className="flex items-center gap-2 pl-8 sm:pl-0">
                    <button
                      type="button"
                      onClick={() => handleCheckpointStatusChange(pt.id, 'Pass')}
                      className={`px-3 py-1.5 text-[10px] font-mono font-extrabold uppercase rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        pt.status === 'Pass' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-400' 
                          : 'bg-white border-stone-200 hover:border-stone-350 text-stone-600'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Pass
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCheckpointStatusChange(pt.id, 'Fail')}
                      className={`px-3 py-1.5 text-[10px] font-mono font-extrabold uppercase rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                        pt.status === 'Fail' 
                          ? 'bg-rose-50 border-rose-300 text-rose-800 ring-1 ring-rose-400 animate-pulse' 
                          : 'bg-white border-stone-200 hover:border-stone-350 text-stone-600'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Fail
                    </button>
                  </div>
                </div>

                {/* Notes Input for each check (The user asked for notes for each one!) */}
                <div className="pl-8 space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Checkpoint Notes / Findings</label>
                  <input
                    type="text"
                    value={pt.notes}
                    onChange={(e) => handleCheckpointNotesChange(pt.id, e.target.value)}
                    placeholder="Provide comments for inspector review..."
                    className="w-full bg-slate-50/60 hover:bg-slate-50 border border-slate-200 focus:bg-white focus:border-neutral-900 rounded-lg px-3.5 py-2 text-xs focus:outline-none transition-all placeholder:text-stone-400 text-slate-800"
                  />
                  <p className="text-[9.5px] text-stone-400 italic">
                    {pt.status === 'Pass' 
                      ? '✓ Automated compliance assurance tags appended.' 
                      : '⚠ Failing this category will schedule an alert in the Action Tracker on save.'}
                  </p>
                </div>

              </div>
            ))}
          </div>

          {/* Submission Commit */}
          <div className="bg-stone-50 border border-stone-200 p-5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-xs font-extrabold text-stone-850">Commit Walkthrough Patrol</h4>
              <p className="text-[11px] text-stone-500">
                Saves a unified Building Patrol report to the secure system cache and appends items to compliance tracking scores.
              </p>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto py-2.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase rounded-xl tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              Save & Commit Building Patrol
            </button>
          </div>
        </form>
      )}

      {/* TAB: BIANNUAL 6-MONTH FIRE DRILL SIMULATOR AND AUDIT HISTORY PANEL */}
      {activeTab === 'drill' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn text-left">
          
          {/* SIMULATION OPERATOR WIDGET (Left Column: cols 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <span className="text-[9px] font-mono text-amber-600 font-bold uppercase tracking-widest block font-bold">Operational Safety Tool</span>
                <h3 className="text-base font-bold text-slate-800 mt-0.5">Muster Stopwatch & Simulator</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Physically execute your required 6-month fire response drill. Press "Trigger Alarms" to begin evacuation timing, then "Stop Muster" when all building tenants are secure at assembly zones.
                </p>
              </div>

              {/* Big Digital Display displaying stopwatch */}
              <div className={`p-5 rounded-2xl text-center border font-mono transition-all duration-300 ${
                drillActive 
                  ? 'bg-rose-950 border-rose-500 ring-2 ring-rose-600 animate-pulse' 
                  : 'bg-neutral-900 border-neutral-700 text-white'
              }`}>
                <p className={`text-[9.5px] uppercase tracking-widest font-extrabold ${drillActive ? 'text-rose-400' : 'text-neutral-400'}`}>
                  {drillActive ? '🔴 LIVE MUSTER RUNNING' : '⏱️ STEADY STATE STANDBY'}
                </p>
                <p className="text-4xl font-extrabold tracking-widest text-white mt-2">
                  {Math.floor(drillSeconds / 60)}m {(drillSeconds % 60).toString().padStart(2, '0')}s
                </p>
                <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                  Standard evacuation guide target: <span className="font-bold text-amber-400">3 mins (180s)</span>
                </p>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                {!drillActive && drillSeconds === 0 ? (
                  <button
                    type="button"
                    onClick={startDrillStopwatch}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold uppercase rounded-xl text-center text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-current text-stone-955" />
                    Trigger Alarms
                  </button>
                ) : drillActive ? (
                  <button
                    type="button"
                    onClick={stopDrillStopwatch}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase rounded-xl text-center text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Square className="w-4 h-4 fill-current text-white" />
                    Stop Muster
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetDrillStopwatch}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold uppercase rounded-xl text-center text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Time
                  </button>
                )}
              </div>

              {/* Timer Outcome Selector (Pass/Fail) */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="text-[10px] font-mono font-extrabold uppercase text-slate-500 block font-bold">
                  Select Evacuation Outcome
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPassFail('Pass')}
                    className={`p-3 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPassFail === 'Pass'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    Passed Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPassFail('Fail')}
                    className={`p-3 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedPassFail === 'Fail'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    Failed Check
                  </button>
                </div>
                {drillSeconds > 0 && (
                  <p className="text-[10px] text-stone-400 italic">
                    {drillSeconds > 180 
                      ? "⚠️ Warning: Elapsed time exceeds standard 3-minute clearance limit! Fail is preset." 
                      : "🎉 Congratulations: Muster cleared within standard 3-minute limits."}
                  </p>
                )}
              </div>

              {/* Remarks/Notes Textarea */}
              <div className="space-y-1.5 text-slate-700 text-xs text-left">
                <label className="text-[10px] font-mono font-extrabold uppercase text-slate-500 block font-bold">
                  Drill Observations & Marshall Remarks
                </label>
                <textarea
                  value={drillNotes}
                  onChange={(e) => setDrillNotes(e.target.value)}
                  placeholder="E.g. Speed observed, Block B stairway partially congested, fire marshals successfully verified headcount lists, etc..."
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-stone-800 placeholder-stone-400 focus:bg-white transition-colors"
                />
              </div>

              {/* Save Trigger */}
              <button
                type="button"
                onClick={commitDrillRecord}
                disabled={drillSeconds === 0}
                className={`w-full py-3 font-bold uppercase rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                  drillSeconds === 0
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                    : 'bg-stone-900 border border-stone-950 hover:bg-stone-800 text-white hover:shadow-md'
                }`}
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                Commit Fire Drill Record
              </button>
            </div>
            
            {/* Quick Stat Indicators */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-3">
              <span className="text-[9.5px] uppercase font-mono font-extrabold text-stone-500 block font-bold">Property Compliance Target</span>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Statutory Standard:</span>
                <span className="font-bold text-slate-900">BS5839 / FSO Article 15</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-stone-100 font-bold">
                <span className="text-slate-500 font-medium">Regularity Check:</span>
                <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">6 Months (Biannual)</span>
              </div>
            </div>
          </div>

          {/* DRILL HISTORICAL AUDIT LIST (Right Column: cols 7) */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <span className="text-[10px] uppercase font-mono font-extrabold text-stone-500 block font-bold">
              Biannual Evacuation Drill Ledger History ({fireDrillsHistory.filter(d => d.siteId === siteIdFilter).length})
            </span>

            {fireDrillsHistory.filter(d => d.siteId === siteIdFilter).length === 0 ? (
              <div className="p-12 text-center text-xs text-stone-400 bg-white border border-stone-200 rounded-2xl shadow-xs">
                No 6-Month Fire evacuation drills archived for this site. Run your stopwatch and submit to create the first record!
              </div>
            ) : (
              <div className="space-y-4">
                {fireDrillsHistory
                  .filter(d => d.siteId === siteIdFilter)
                  .map((drill) => {
                    const isExpanded = expandedDrillId === drill.id;
                    const commentCount = drill.comments?.length || 0;

                    return (
                      <div 
                        key={drill.id} 
                        className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-stone-300 transition-colors"
                      >
                        {/* Summary Header */}
                        <div className="p-4 bg-stone-50/75 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                                drill.status === 'Pass'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                STATUS: {drill.status.toUpperCase()}
                              </span>
                              <span className="text-slate-500 text-[10px] font-mono font-bold">⏱️ {drill.durationStr}</span>
                            </div>
                            <p className="text-xs text-stone-700">
                              Logged by: <strong className="font-bold">{drill.testerName}</strong> • {drill.timestamp}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => setExpandedDrillId(isExpanded ? null : drill.id)}
                              className="px-2.5 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-[9.5px] uppercase font-mono rounded-lg flex items-center gap-1 cursor-pointer transition-colors font-bold"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                              Comments ({commentCount}) {isExpanded ? '▲' : '▼'}
                            </button>

                            {onDeleteFireDrill && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Are you absolutely sure you want to delete this fire drill compliance record from statutory history? This action is permanent.")) {
                                    onDeleteFireDrill(drill.id);
                                  }
                                }}
                                className="p-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                title="Wipe statutory record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Observations Block */}
                        <div className="p-4 space-y-3 bg-white text-xs">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-mono text-stone-400 font-bold">Evacuation Marshall Observations:</p>
                            <p className="text-stone-700 font-serif leading-relaxed italic bg-stone-50/55 p-3 rounded-xl border border-stone-100">
                              "{drill.notes || 'No specific hazard remarks logged.'}"
                            </p>
                          </div>
                          
                          {/* Expanded Comments Thread Section */}
                          {isExpanded && (
                            <div className="pt-3 border-t border-stone-100 space-y-4 animate-fadeIn">
                              <p className="text-[10px] uppercase font-mono text-stone-400 font-bold flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                                Audit Remarks Ledger Thread:
                              </p>

                              {/* Comment List */}
                              {(!drill.comments || drill.comments.length === 0) ? (
                                <p className="text-[11px] text-stone-400 italic pl-1">
                                  No internal audit annotations recorded for this compliance point yet. Add one below!
                                </p>
                              ) : (
                                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                  {drill.comments.map((comment) => (
                                    <div key={comment.id} className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1 block text-left">
                                      <div className="flex justify-between text-[9.5px] text-stone-400 font-mono font-medium">
                                        <span className="font-bold">{comment.userName}</span>
                                        <span>{comment.timestamp}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-700 leading-normal pl-0.5">
                                        {comment.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Comment Submit bar */}
                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={newDrillComment[drill.id] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setNewDrillComment(prev => ({ ...prev, [drill.id]: val }));
                                  }}
                                  placeholder="Type audit comment, clearance confirmation, follow-up..."
                                  className="flex-1 bg-stone-50 border border-stone-200 focus:bg-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-400 text-slate-800 placeholder-stone-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const text = newDrillComment[drill.id];
                                    if (!text || !text.trim()) return;
                                    if (onAddDrillComment) {
                                      onAddDrillComment(drill.id, text.trim());
                                      setNewDrillComment(prev => ({ ...prev, [drill.id]: '' }));
                                    }
                                  }}
                                  className="py-2 px-3 border border-neutral-900 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1 hover:shadow cursor-pointer transition-all"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                                  Add
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: REGISTRY COMPLIANCE HISTORY & PURGING DELETION */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SECTION A: THE BUILDING PATROL REPORTS LEDGER (Our new unified reports) */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-extrabold text-stone-500 block">
              Historic Building Patrol Walkthrough Reports ({sitePatrols.length})
            </span>

            {sitePatrols.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 bg-white border border-stone-150 rounded-xl">
                No unified Building Patrol checklists recorded yet. Choose the 'Building Patrol Checklist' tab to log your first round.
              </div>
            ) : (
              <div className="space-y-3">
                {sitePatrols.map((report) => {
                  const isExpanded = expandedPatrolId === report.id;
                  const totalFailures = report.items.filter(i => i.status === 'Fail').length;

                  return (
                    <div 
                      key={report.id} 
                      className={`bg-white border rounded-2xl overflow-hidden transition-all text-left shadow-xs ${
                        report.overallStatus === 'Fail' ? 'border-rose-250 bg-rose-50/10' : 'border-stone-200'
                      }`}
                    >
                      {/* Accordion Header row */}
                      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-stone-50/50 border-b border-stone-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold border ${
                              report.overallStatus === 'Pass'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-250'
                                : 'bg-rose-50 text-rose-800 border-rose-250'
                            }`}>
                              PATROL STATUS: {report.overallStatus.toUpperCase()}
                            </span>
                            <span className="text-xs text-stone-400 font-mono">ID: {report.id}</span>
                          </div>
                          
                          <p className="text-[11px] text-stone-700">
                            Logged by: <strong>{report.userName}</strong> • Completed time: <strong>{report.timestamp}</strong>
                          </p>

                          {totalFailures > 0 && (
                            <p className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1 font-mono">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {totalFailures} Compliance fault{totalFailures > 1 ? 's' : ''} detected on this patrol round
                            </p>
                          )}
                        </div>

                        {/* Control buttons */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => setExpandedPatrolId(isExpanded ? null : report.id)}
                            className="px-2.5 py-1.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-750 font-mono text-[9.5px] uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>Collapse Details <ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                              <>View Checkpoints <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </button>

                          {/* PURGING DELETION BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeletePatrolReport(report.id)}
                            className="p-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/80 rounded-lg transition-all cursor-pointer"
                            title="Delete patrol record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Accordion Expander: Checkpoints detailed status */}
                      {isExpanded && (
                        <div className="p-4 bg-white divide-y divide-stone-100 text-xs space-y-3.5 animate-fadeIn">
                          {report.items.map((item, idx) => (
                            <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <p className="font-extrabold text-neutral-900 flex items-center gap-1.5">
                                  <span className="text-[9px] text-stone-400 font-mono font-bold">#{idx+1}</span>
                                  {item.name}
                                  <span className="text-[8.5px] font-mono text-stone-400">({item.regulatoryCode})</span>
                                </p>

                                <span className={`px-2 py-0.2 rounded font-mono text-[8.5px] font-bold ${
                                  item.status === 'Pass' 
                                    ? 'bg-emerald-50 text-emerald-800' 
                                    : 'bg-rose-50 text-rose-800'
                                }`}>
                                  {item.status.toUpperCase()}
                                </span>
                              </div>

                              <p className="text-stone-605 italic pl-4 border-l border-stone-200 bg-stone-50/50 p-2.5 rounded-r-lg">
                                "{item.notes || 'No specific checkpoint findings logged.'}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: INDIVIDUAL STANDARD FIRELOG ENTRIES */}
          <div className="space-y-3 pt-4">
            <span className="text-[10px] uppercase font-mono font-extrabold text-stone-500 block">
              Historic Standalone Fire logs & Weekly Drills Registry ({siteLogs.length})
            </span>

            <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-stone-150 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Standard Single Testing Trail</span>
                <span className="text-[10px] text-slate-450 font-mono flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" /> Drizzle ID Node: ISO-9001-A
                </span>
              </div>

              <div className="divide-y divide-stone-105 text-xs">
                {siteLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-450">
                    No individual standalone check logs recorded yet. Navigate to 'Record Standalone Check' to submit.
                  </div>
                ) : (
                  siteLogs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/40 transition-colors text-left">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <p className="font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                          {log.checkType}
                          <span className={`px-2 py-0.2 rounded font-mono text-[8px] font-bold ${
                            log.checkType.includes('Walkthrough') || log.checkType.includes('Patrol')
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {log.checkType.includes('Patrol') ? 'Walkthrough Patrol summary' : 'Direct Test'}
                          </span>
                        </p>
                        
                        <p className="text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line font-serif pl-3 border-l-2 border-stone-250 italic">
                          {log.notes || 'Routine check results uploaded: general standards confirmed within parameters.'}
                        </p>
                        
                        <p className="text-[10px] text-slate-400 font-mono">
                          Logged by: <strong>{log.userName}</strong> • Registered: {log.timestamp}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          log.status === 'Pass' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                            : 'bg-rose-50 text-rose-700 border-rose-250'
                        }`}>
                          {log.status === 'Pass' ? 'PASS' : 'CRITICAL FAIL'}
                        </span>

                        {/* DELETIBILITY BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleDeleteIndividualLog(log.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Purge log record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
