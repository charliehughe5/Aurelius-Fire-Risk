import React, { useState } from 'react';
import { 
  Wrench, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Zap, 
  FlameKindling,
  Maximize,
  HelpCircle,
  Plus,
  Compass,
  PowerOff,
  Music,
  Maximize2
} from 'lucide-react';

interface ModernChecksProps {
  activeSite: any;
  onAddManualAction: (newAction: any) => void;
  triggerSuccess: (msg: string) => void;
}

export default function ModernChecks({ activeSite, onAddManualAction, triggerSuccess }: ModernChecksProps) {
  const [selectedAssetLog, setSelectedAssetLog] = useState<string | null>(null);

  // Core asset status details inside state
  const [assets, setAssets] = useState([
    { id: 'ast-1', name: 'EICR (Fixed Wire Electrical Installation)', freq: '5-Yearly Statutory', lastCheck: '2023-04-12', nextCheck: '2028-04-12', status: 'Compliant' },
    { id: 'ast-2', name: 'PAT Testing (Portable Appliances)', freq: 'Annual Inspection', lastCheck: '2025-08-11', nextCheck: '2026-08-11', status: 'Compliant' },
    { id: 'ast-3', name: 'Commercial Boilers & Gas Supply', freq: 'Annual Certified Service', lastCheck: '2025-10-02', nextCheck: '2026-10-02', status: 'Compliant' },
    { id: 'ast-4', name: 'HVAC Air Purification Systems & Shutdown Fail-safes', freq: '6-Monthly Check', lastCheck: '2026-01-14', nextCheck: '2026-07-14', status: 'Pending Review' },
    { id: 'ast-5', name: 'Main Fire Sprinkler Pressure Gauges & Pumps', freq: 'Weekly Walkthrough', lastCheck: '2026-06-14', nextCheck: '2026-06-21', status: 'Compliant' },
    { id: 'ast-6', name: 'P50 Self-Service Extinguisher Stock (Kevlar composite)', freq: 'Annual Self-Certified Gauge Loop', lastCheck: '2025-07-20', nextCheck: '2026-07-20', status: 'Compliant' }
  ]);

  // Hardwired fire control triggers
  const [controlFailsafes, setControlFailsafes] = useState([
    { name: 'Lift Defend Auto-Grounding Fail-Safe', checked: 'Auto-Return Active', detail: 'All active lifts descend instantly to ground level when alarms sound, opening doors and isolating controls.' },
    { name: 'Siren Acoustic Music Cutoff Relay', checked: 'Relay Standard Armed', detail: 'Amplifiers and active PA systems cutoff audio feeds automatically on siren triggers to ensure alarm audibility.' },
    { name: 'Main Front Auto-doors & Speedgates Fail-Secure Auto-release', checked: 'Fail-Open Magnetic Lock verified', detail: 'Emergency doors and turnstile wings auto-open to prevent containment bottlenecks.' },
    { name: 'Boiler & Gas Fuel Supply Automatic Cutoff Solenoids', checked: 'Solenoid test success', detail: 'Gas valves trip on sounder link to isolate combustive fuel feeds immediately.' }
  ]);

  const handleUpdateAssetDate = (assetId: string, dateVal: string) => {
    if (!dateVal) return;
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const nextDate = new Date(new Date(dateVal).setFullYear(new Date(dateVal).getFullYear() + 1)).toISOString().split('T')[0];
        return {
          ...a,
          lastCheck: dateVal,
          nextCheck: nextDate,
          status: 'Compliant'
        }
      }
      return a;
    }));
    triggerSuccess("📅 Statutory asset certification date logged and aligned. Automatic intervals recalculated.");
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left text-neutral-800">
      
      {/* Header and overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-neutral-900 text-amber-400 rounded-md">
            M&E Infrastructure Monitoring
          </span>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight mt-2">
            Statutory Assets & Auxiliary Weekly/Monthly Registers
          </h2>
          <p className="text-xs text-neutral-500">
            Maintain compliance across electrical fixes (EICR), portable appliances (PAT), commercial boilers, wet risers, disabled refuges, and fail-safe magnetic locks.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: CRITICAL MECHANICAL & ELECTRICAL CERTIFICATION SCHEDULE (EICR, PAT, BOILERS, SPRINKLERS, P50) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
                <Wrench className="w-4 h-4 text-amber-500" />
                Electrical, Gas & Fixed Asset Compliance Log
              </h3>
              <span className="text-[9px] font-mono font-bold bg-neutral-100 border px-1.5 rounded text-neutral-500">
                UK Statutes ISO Standards
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              Record and schedules certifications for your physical assets below. Dates approaching overdue limits trigger instant warning matrices on the executive control panel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((ast) => (
                <div key={ast.id} className="p-4 bg-stone-50 border border-neutral-205 rounded-xl space-y-3.5 text-xs text-left">
                  <div className="flex justify-between items-start">
                    <p className="font-extrabold text-neutral-900 line-clamp-2 pr-2 leading-snug">{ast.name}</p>
                    <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded uppercase ${
                      ast.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'
                    }`}>
                      {ast.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-400">
                    <div>
                      <span>Last Certified Date:</span>
                      <span className="block text-neutral-800 font-bold">{ast.lastCheck}</span>
                    </div>
                    <div>
                      <span>Renewal Cadence:</span>
                      <span className="block text-neutral-800 font-bold">{ast.freq}</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border flex items-center justify-between gap-2">
                    <span className="text-[9px] text-neutral-450 font-bold uppercase font-mono">Log Certificate:</span>
                    <input 
                      type="date"
                      onChange={(e) => handleUpdateAssetDate(ast.id, e.target.value)}
                      className="bg-transparent text-[10px] font-mono text-neutral-700 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: P50 EXTINGUISHER EXPLANATIONS & AUTOMATED FAILSAFE TRIGGERS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* P50 CARBON COMPOSITE DEEP DIVE EXPLANATION CARD */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-850 text-white rounded-3xl p-5 shadow-md border border-neutral-800 text-xs space-y-4">
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-3">
              <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h4 className="font-extrabold uppercase text-[11px] tracking-wider text-amber-400">P50 Extinguishers Innovation</h4>
            </div>

            <div className="space-y-3 font-sans leading-relaxed text-neutral-350">
              <p>
                <strong>Aurelius strongly promotes Carbon-Kevlar Composite P50 extinguishers:</strong>
              </p>
              <p>
                Unlike traditional steel extinguishers which mandate costly 5-yearly discharge testing, refill bills, and annual technician callouts under BS 5306 regulations, **P50 extinguishers never require discharging or internal maintenance for 10 full years.**
              </p>
              <p className="bg-black/50 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-neutral-300">
                🛠️ <strong>Maintenance Guideline:</strong> Simply log an annual visual walkthrough inspection verifying:
                <br />• Intact outer composite casing
                <br />• Dual independent gauge needles resting cleanly in green margins
                <br />• Tamper-seal ring locking pin armed.
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold">
                ✓ Saves up to 70% in corporate fire safety equipment maintenance bills over 10 years!
              </p>
            </div>
          </div>

          {/* ACTIVE HARDWIRED SAFETY ALARM CONTROLS */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-neutral-100 pb-2.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <PowerOff className="w-4 h-4 text-rose-600 shrink-0" />
                Emergency Circuit Trip Failsafes
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              These digital automation fail-safes integrate directly with your central sounder systems to protect human lives during localized evacuation operations.
            </p>

            <div className="space-y-3">
              {controlFailsafes.map((cf, i) => (
                <div key={i} className="p-3 bg-[#FAF9F6] border border-neutral-200 rounded-xl space-y-1 block text-xs text-left">
                  <div className="flex justify-between items-start gap-1">
                    <p className="font-bold text-neutral-900 leading-snug">{cf.name}</p>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {cf.checked}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-neutral-500 leading-normal font-sans pt-1 border-t border-neutral-105/50 mt-1">{cf.detail}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-250 text-[10px] leading-relaxed text-amber-900 rounded-lg font-mono">
              ⚡ <strong>RRO Directive Checklist:</strong> Annual circuit load trips of magnetic escape gates are certified under BS 7273 Part 4 standards.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
