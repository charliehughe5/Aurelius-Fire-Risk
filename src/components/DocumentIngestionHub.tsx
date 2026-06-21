import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Cpu, 
  Check, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  User, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Info,
  Clock
} from 'lucide-react';
import { RemediationTask, Property } from '../types';

interface DocumentIngestionHubProps {
  activeSite: any;
  onUpdateSiteCompliance: (siteId: string, updates: Partial<Property>) => void;
  onAddGeneratedActions: (newActions: RemediationTask[]) => void;
  triggerSuccess: (msg: string) => void;
}

export default function DocumentIngestionHub({
  activeSite,
  onUpdateSiteCompliance,
  onAddGeneratedActions,
  triggerSuccess
}: DocumentIngestionHubProps) {
  const [selectedDocType, setSelectedDocType] = useState<'fra' | 'policy' | 'plan'>('fra');
  const [selectedSample, setSelectedSample] = useState<string>('sample-1');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState(0);
  const [parseLogs, setParseLogs] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  const samples = {
    fra: [
      {
        id: 'sample-1',
        title: 'Harlow Plaza - Official 2026 FRA Report (Survey Core).pdf',
        size: '3.4 MB',
        date: '2026-06-20',
        contentSummary: 'Complete fire risk appraisal conducted under IFE and BAFE standards. Identifies fire doors, emergency lights, and escape route restrictions.'
      },
      {
        id: 'sample-2',
        title: 'Apex Tower Block A - High-Rise Quad FRA Review.pdf',
        size: '5.1 MB',
        date: '2026-05-18',
        contentSummary: 'Specialist residential block fire assessment focusing on dry risers, stay-put compartmentalisation, and escape signage.'
      }
    ],
    policy: [
      {
        id: 'sample-3',
        title: 'Aurelius Managed Group - General Fire Safety Policy 2026.pdf',
        size: '1.2 MB',
        date: '2026-03-10',
        contentSummary: 'Corporate directive lining out company obligations, training cadences, warden allocations, and contractor safety audits.'
      }
    ],
    plan: [
      {
        id: 'sample-4',
        title: 'Harlow Plaza Zone 7C Emergency Evacuation Plan.pdf',
        size: '2.2 MB',
        date: '2026-06-01',
        contentSummary: 'Site operational manual detailing emergency exit cores, evacuation coordinator roles, wheelchair evacuation, and car park assembly.'
      }
    ]
  };

  const handleStartParsing = () => {
    setIsParsing(true);
    setParseStep(1);
    setParseLogs(['Initiating optical character scanner...']);
    setExtractedData(null);

    // Dynamic processing stepper simulator
    setTimeout(() => {
      setParseStep(2);
      setParseLogs(prev => [...prev, 'Reading structural headers and layout regions (Regulatory Reform Order 2005)...']);
    }, 1000);

    setTimeout(() => {
      setParseStep(3);
      setParseLogs(prev => [...prev, 'Extracting site info, assessor credentials, and target dates...']);
    }, 2000);

    setTimeout(() => {
      setParseStep(4);
      setParseLogs(prev => [...prev, 'Parsing hazards and cross-referencing BS 5839 action thresholds...']);
    }, 3200);

    setTimeout(() => {
      setParseStep(5);
      setParseLogs(prev => [...prev, 'Auto-synthesizing vague-free client remediation actions and "Why this matters" plain English guidelines...']);
    }, 4500);

    setTimeout(() => {
      completeExtraction();
    }, 5500);
  };

  const completeExtraction = () => {
    setIsParsing(false);
    setParseLogs([]);
    setParseStep(0);

    if (selectedDocType === 'fra') {
      const isSample1 = selectedSample === 'sample-1';
      const siteName = isSample1 ? 'Harlow Plaza - Sector 7C' : 'Apex Tower block A';
      const assessor = isSample1 ? 'Charlie Hughes (NEBOSH Fire Safety)' : 'Sarah Jenkins (IFE Level 4)';
      const riskRating = isSample1 ? 'Medium' : 'Low';
      const scoreImpact = isSample1 ? 88 : 95;

      const generatedTasks: RemediationTask[] = isSample1 ? [
        {
          id: `act-auto-${Date.now()}-1`,
          propertyId: activeSite?.id || 'site-1',
          checkType: 'Fire Doors',
          severity: 'High',
          status: 'Open',
          assignedTo: activeSite?.manager || 'Charlie Hughes',
          loggedAt: '2026-06-20',
          details: 'Ground floor west exit fire door has worn intumescent smoke seal on head frame. The gap clearance exceeds 4.5mm.'
        },
        {
          id: `act-auto-${Date.now()}-2`,
          propertyId: activeSite?.id || 'site-1',
          checkType: 'Emergency Lighting',
          severity: 'Urgent',
          status: 'In Progress',
          assignedTo: activeSite?.manager || 'Charlie Hughes',
          loggedAt: '2026-06-20',
          details: 'Backup battery cells in stairwell West Core bulkhead EL-12 fail to illuminate after manual isolator key turn.'
        }
      ] : [
        {
          id: `act-auto-${Date.now()}-3`,
          propertyId: activeSite?.id || 'site-1',
          checkType: 'Housekeeping',
          severity: 'Medium',
          status: 'Open',
          assignedTo: activeSite?.manager || 'Sarah Jenkins',
          loggedAt: '2026-06-20',
          details: 'Boiler room floor contains combustible cardboard boxes stored adjacent to main electrical distribution chassis.'
        }
      ];

      const meta = {
        docType: 'Fire Risk Assessment (FRA)',
        siteName,
        assessmentDate: '2026-06-20',
        nextReviewDate: '2027-06-20',
        assessor,
        overallRiskRating: riskRating,
        significantFindings: isSample1 
          ? 'Intumescent strip failure on main stairwell exit doors. Secondary batteries on emergency bulkheads require full replacement cycles.'
          : 'Low general risk, minor storage issues identified in electrical plant spaces.',
        hazards: isSample1 
          ? ['Worn door heat/smoke seals', 'Dead emergency lights battery core']
          : ['Plant room storage combustibles'],
        createdActionsCount: generatedTasks.length,
        tasks: generatedTasks
      };

      setExtractedData(meta);

      // Perform state updates on the active site
      onUpdateSiteCompliance(activeSite?.id || 'site-1', {
        complianceScore: scoreImpact,
        lastAssessment: '2026-06-20',
        nextAssessment: '2027-06-20'
      });

      // Inject generated actions into main app state
      onAddGeneratedActions(generatedTasks);

      triggerSuccess(`Successfully parsed FRA PDF. Automated actions injected and safety score updated to ${scoreImpact}%.`);

    } else if (selectedDocType === 'policy') {
      const meta = {
        docType: 'Fire Safety Policy Record',
        evacuationStrategy: 'Simultaneous Evacuation',
        responsiblePersons: 'Charlie Hughes, John Carter',
        assemblyPoints: 'Assembly Point Alpha - Main East Car Park',
        trainingCadence: 'Warden refresher: every 6 months | General induction: on day one',
        staffDuties: 'Floor marshals are fully trained to isolate hazardous machinery, sweep core corridors, and report visual checks to Command Station.',
        evacuationRoutes: 'Primary: West Fire Escape; Secondary: Ground level reception double glass exits.',
        vulnerablePersons: 'Assigned PEEP checklist (Ref: VPR-04) in elevator lobbies. Custom tactile signage required Floor 1.',
        emergencyContact: 'Aurelius Command Deck (020 7946 0912), Fire Rescue Service (999)',
        gaps: [
          { item: 'No contractor hot-works permit template appended to policy.', severity: 'Medium' },
          { item: 'Missing detailed evacuation plan for third-party catering personnel.', severity: 'Low' }
        ],
        recommendations: 'Adopt BAFE standards for visiting contractors. Standardize contractor logbook sign-off.'
      };

      setExtractedData(meta);
      triggerSuccess('Fire Safety Policy parsed. Compliance gap checklist generated.');

    } else {
      // Emergency Plan Ingestion
      const meta = {
        docType: 'Emergency Evacuation Protocol',
        assemblyPoints: 'Assembly Area Gate B, South Crescent',
        routes: 'Dual stairways (North and South structural tubes)',
        responsiblePersons: 'Marcus Vane, David Croft',
        trainingRequirements: 'Quarterly fire drill, biannual mock alarm simulations',
        generalSummary: 'Comprehensive emergency procedures outlining alarm activation, evacuation dispatch sequences, roll calls, and emergency service handshake protocols.',
        gaps: [
          { item: 'PEEP template has not been reviewed since BSA 2022 high-rise regulations went live.', severity: 'High' }
        ],
        recommendations: 'Complete immediate Personal Emergency Evacuation Plan review with active leaseholders on high-rise residential core spaces.'
      };

      setExtractedData(meta);
      triggerSuccess('Emergency Evacuation Plan ingested. Primary strategy elements mapped.');
    }
  };

  return (
    <div id="ingestion-hub-widget" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Compliance Document Ingestion Hub</h2>
          <p className="text-xs text-slate-500">
            Aurelius Automated OCR Engine. Upload regulatory PDFs to populate metrics and auto-generate plain English actions.
          </p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1 text-slate-700 max-w-fit">
          <button 
            onClick={() => { setSelectedDocType('fra'); setExtractedData(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedDocType === 'fra' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
          >
            Fire Risk Assessment (FRA)
          </button>
          <button 
            onClick={() => { setSelectedDocType('policy'); setExtractedData(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedDocType === 'policy' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
          >
            Safety Policy
          </button>
          <button 
            onClick={() => { setSelectedDocType('plan'); setExtractedData(null); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${selectedDocType === 'plan' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
          >
            Emergency Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Column */}
        <div className="lg:col-span-5 bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Select Document to Ingest</h3>
            <p className="text-xs text-slate-400">Choose one of the corporate pre-scanned mock reports below to test simulated artificial intelligence processing.</p>
          </div>

          <div className="space-y-3">
            {samples[selectedDocType].map((docGroup) => (
              <button
                key={docGroup.id}
                onClick={() => { setSelectedSample(docGroup.id); setExtractedData(null); }}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  selectedSample === docGroup.id 
                    ? 'border-slate-800 bg-slate-50/50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2.5 rounded-lg ${selectedSample === docGroup.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-xs font-bold ${selectedSample === docGroup.id ? 'text-slate-900' : 'text-slate-700'}`}>{docGroup.title}</p>
                  <p className="text-[10px] text-slate-400">{docGroup.size} • Last Modified: {docGroup.date}</p>
                  <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 mt-1">{docGroup.contentSummary}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Drag and Drop Mock Element */}
          <div className="border border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/30 hover:bg-slate-50 transition-colors pointer-default">
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <span className="block text-xs font-bold text-slate-700">Drag alternative compliance PDF here</span>
            <span className="block text-[10px] text-slate-450 mt-1">Accepts PDF, DOCX, or scan images (max 15MB)</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>GDPR AES-256 encrypted storage</span>
            </div>
          </div>

          {!isParsing ? (
            <button
              onClick={handleStartParsing}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Cpu className="w-4 h-4 text-orange-400" />
              Analyze & Extract Compliance Data
            </button>
          ) : (
            <div className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                  Engineering Extraction Pipeline
                </span>
                <span className="font-mono text-orange-600">{parseStep * 20}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-slate-900 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${parseStep * 20}%` }}
                />
              </div>
              <div className="text-[10px] font-mono text-slate-500 space-y-1">
                {parseLogs.map((log, idx) => (
                  <p key={idx} className="flex items-start gap-1">
                    <span className="text-orange-500 shrink-0">›</span>
                    <span>{log}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {!extractedData && !isParsing && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-4">
              <Cpu className="w-10 h-10 text-slate-350 mx-auto" />
              <div className="max-w-sm mx-auto space-y-1.5">
                <h4 className="text-sm font-bold text-slate-800">Extraction Results Empty</h4>
                <p className="text-xs text-slate-450">
                  Select a BAFE/NEBOSH guideline document on the left and click "Analyze" to run the simulated structured parser. 
                </p>
              </div>
            </div>
          )}

          {isParsing && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-4">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-slate-800 animate-spin" />
              </div>
              <div className="max-w-sm mx-auto space-y-1.5">
                <h4 className="text-sm font-bold text-slate-700">Reading Legal Directives...</h4>
                <p className="text-xs text-slate-450">
                  Aurelius artificial intellect is classifying fire hazards, evaluating structural seals, and mapping compliance score margins...
                </p>
              </div>
            </div>
          )}

          {extractedData && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[9px] font-mono text-orange-500 uppercase tracking-widest font-extrabold">Aurelius Parsing Ledger</span>
                  <h3 className="text-base font-bold text-slate-800">{extractedData.docType}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  Successfully Mapped
                </div>
              </div>

              {/* FRA Specific Output */}
              {selectedDocType === 'fra' && (
                <div className="space-y-6">
                  {/* Metadata points */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Identified Site</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {extractedData.siteName}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Assessor Certified</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {extractedData.assessor}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 col-span-2 md:col-span-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Overall Risk Rating</span>
                      <p className={`font-bold flex items-center gap-1 ${
                        extractedData.overallRiskRating === 'High' ? 'text-rose-600' : 'text-amber-600'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {extractedData.overallRiskRating} Risk
                      </p>
                    </div>
                  </div>

                  {/* Significant findings */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      Extracted Significant Findings
                    </h4>
                    <p className="text-xs text-slate-600 leading-normal">{extractedData.significantFindings}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {extractedData.hazards.map((haz: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded px-2 py-0.5">
                          Hazard: {haz}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AUTO COMPLIANCE TASK GENERATION */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Generated Vague-Free Actions ({extractedData.createdActionsCount})</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">Automatic system upload</span>
                    </div>

                    <div className="space-y-3.5">
                      {extractedData.tasks.map((task: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white border border-slate-205 rounded-xl space-y-2.5 shadow-sm hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{task.checkType} Correction Required</span>
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-250 text-[10px] font-bold rounded-md">
                              {task.severity}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <strong>Manual Checklist findings:</strong> {task.details}
                          </p>

                          {/* NEBOSH Vague Free Critical Explanation Pattern */}
                          <div className="space-y-1 border-t border-slate-100 pt-2.5 grid grid-cols-1 md:grid-cols-12 gap-2">
                            <div className="md:col-span-4 flex items-start gap-1">
                              <Info className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                              <span className="text-[10px] uppercase font-bold text-orange-600 block">Why this matters:</span>
                            </div>
                            <div className="md:col-span-8">
                              <p className="text-xs text-slate-500 leading-normal italic">
                                {task.checkType === 'Fire Doors' 
                                  ? 'Fire doors secure emergency escape stairwells against smoke ingress and superheated toxic fumes. Restoring the intumescent seal ensures occupants have up to 60 minutes of breathing protection during building egress.'
                                  : task.checkType === 'Emergency Lighting'
                                  ? 'Emergency lighting provides visual escape path mapping during total mains power failures. Restoring backup battery functionality within 7 working days avoids sudden visual panic and crush casualties.'
                                  : 'Accumulated packaging and cardboard act as lightning points for initial ignition. Isolating electrical chassis boxes ensures clean air circulation and prevents electrical ignition of surrounding stock.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-450 font-mono pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Target Deadline: {task.checkType === 'Emergency Lighting' ? '14 Days' : '28 Days'}
                            </span>
                            <span>Assigned: {task.assignedTo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Policy/Emergency Plan Ingestion mapped */}
              {selectedDocType !== 'fra' && (
                <div className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Evacuation Strategy Mapped</h4>
                      <p className="font-bold text-slate-800 text-[13px]">{extractedData.evacuationStrategy || 'Immediate Simultaneous Evacuation'}</p>
                      <p className="text-slate-500 leading-relaxed">
                        The compliance framework is now calibrated to simultaneous alarm dispatch. Manual break glasses will prompt direct building evacuation.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Identified Assembly Point</h4>
                      <p className="font-bold text-slate-800 text-[13px]">{extractedData.assemblyPoints}</p>
                      <p className="text-slate-500 leading-relaxed">
                        Extracted coordinates and location keywords map this structure safely to outdoor safety grids.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Responsible Parties & Emergency Escalation</h4>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">Primary Evacuation Coordinators</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{extractedData.responsiblePersons}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 font-mono text-[10px] text-slate-600 rounded">Mapped</span>
                    </div>
                  </div>

                  {/* Operational Policy gaps */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Identified compliance gaps & recommended updates</h4>
                    <div className="space-y-2.5">
                      {extractedData.gaps.map((gap: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white border border-slate-205 rounded-xl flex items-start gap-3 shadow-sm">
                          <div className={`p-1 rounded ${
                            gap.severity === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Compliance Gap: {gap.item}</p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              <strong>Regulatory Danger:</strong> Fails direct auditing criteria. Assessor recommendation: {extractedData.recommendations}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
