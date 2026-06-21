import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Download, 
  Share2, 
  ArrowRight,
  Info
} from 'lucide-react';

interface ClientTutorialProps {
  activeUser: any;
  triggerSuccess: (msg: string) => void;
}

const TOUR_VIDEO_SUBTITLES = [
  { time: 0, text: "Hello! I am Charlie Hughes, your Lead Fire Risk Assessor and safety consultant here at Aurelius." },
  { time: 5, text: "Welcome to your new, isolated digital compliance workspace built to satisfy UK FSO 2005 criteria." },
  { time: 10, text: "In this short video walkthrough, I will show you how to easily manage your site checks and stay audit-ready." },
  { time: 15, text: "First: make sure to inspect your One-Page Director Dashboard for active corrective actions and safety scores." },
  { time: 20, text: "Second: you can record physical weekly sounder alarm drill checks inside the Digital Logbook in two clicks." },
  { time: 25, text: "Third: if I identify deficiencies during my weekend visual surveys, they populate your Active Actions Ledger." },
  { time: 30, text: "To close out any action ticket, simple upload a contractor receipt or evidence photo. I will sign it off immediately." },
  { time: 35, text: "Fourth: use the Document Library to retrieve your statutory signed FRA reports and maintenance logs." },
  { time: 40, text: "For continuous care and support and to lock in your discounted loyalty rates, keep your BACS Direct Debit active." },
  { time: 45, text: "All audits can be exported to Excel or beautiful PDF business snippets for board presentation." },
  { time: 50, text: "Thank you for trusting Aurelius Fire Risk. Together, we preserve lives, protect assets, and remain fully compliant." }
];

export default function ClientTutorial({ activeUser, triggerSuccess }: ClientTutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState(0);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 55) {
            setIsPlaying(false);
            triggerSuccess("🎥 Client onboarding tour video fully viewed! You are now premium-certified.");
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const currentSubtitle = TOUR_VIDEO_SUBTITLES.reduce((acc, sub) => {
    if (videoProgress >= sub.time) {
      return sub.text;
    }
    return acc;
  }, TOUR_VIDEO_SUBTITLES[0].text);

  const handleSimulateReportDownload = (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      triggerSuccess("📥 Generated high-fidelity PDF business snippet dashboard report. Ready for print!");
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Aurelius Fire Risk - Business Snippet Report</title>
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1c1c1e; line-height: 1.5; }
                .header { border-bottom: 2px solid #1c1c1e; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: -0.5px; }
                .subtitle { font-size: 12px; color: #666; margin-top: 5px; font-family: monospace; }
                .badge { background: #f59e0b; color: #000; padding: 4px 8px; font-size: 10px; font-weight: bold; border-radius: 4px; display: inline-block; text-transform: uppercase; }
                .content { font-size: 14px; margin-bottom: 30px; }
                .table { w-full; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                .table th { background-color: #f5f5f7; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 11px; color: #888; text-align: center; margin-top: 50px; font-family: monospace; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="badge">AURELIUS STATE OF BUSINESS CONFORMANCE</div>
                <h1 class="title">Aurelius Fire Risk - Executive Compliance Snapshot</h1>
                <p class="subtitle">DATE OF ARCHIVE: 2026-06-20 | PRODUCED BY CHARLIE HUGHES (NEBOSH)</p>
              </div>
              <div class="content">
                <p>This statutory summary provides general estates management visibility for active gym and leisure premises under the UK Regulatory Reform (Fire Safety) Order 2005.</p>
                <table class="table" style="width: 100%;">
                  <thead>
                    <tr>
                      <th>Compliance Area</th>
                      <th>Operational Frequency</th>
                      <th>Current System Status</th>
                      <th>Legal Statutory Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Weekly Sounder tests</td>
                      <td>Every 7 Days</td>
                      <td>🔴 COMPLIANT PASS LOGGED</td>
                      <td>FSO 2005 Article 15</td>
                    </tr>
                    <tr>
                      <td>6-Month Evacuation Drills</td>
                      <td>Biannual</td>
                      <td>🟢 COMPLIANT DRILL LOGGED</td>
                      <td>BS 9999 Security Code</td>
                    </tr>
                    <tr>
                      <td>Asset Maintenance Checks</td>
                      <td>Monthly / Annual</td>
                      <td>🟢 ALL DEFICIENCIES CLEARED</td>
                      <td>BS 5839-1 / BS 5266</td>
                    </tr>
                    <tr>
                      <td>E-Learning Warden Academy</td>
                      <td>Annual Refreshers</td>
                      <td>🟢 STAFF PIPELINE ACTIVATED</td>
                      <td>Health & Safety at Work Act 1974</td>
                    </tr>
                  </tbody>
                </table>
                <p style="margin-top: 30px; font-style: italic; font-size: 13px; color: #555;">
                  "I certify under visual assessment bounds that the active site digital logbooks and remedial checklists maintain state compliance."<br>
                  <strong>— Charlie Hughes, Lead Fire Safety Assessor, NEBOSH Certified (AR-FRA-NEBOSH-2026)</strong>
                </p>
              </div>
              <div class="footer">
                © 2026 Aurelius Fire Risk Systems Ltd. All Rights Reserved. This document is a protected visual record.
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      triggerSuccess("📥 Downloaded compliance audit record list as Excel CSV data format catalog.");
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Check Type,Log Date,Logged By,Status,Notes,UK Statutory Reference\n"
        + "Weekly Alarm Test,2026-06-19 11:30,Charlie Hughes,Pass,Routine weekly test reset healthy,FSO 2005 Article 15\n"
        + "Emergency Lighting,2026-06-18 10:15,John Carter,Fail,Duration check battery cell replaced,BS 5266 Standard\n"
        + "Evacuation Drill,2026-06-12 14:00,Staff Marshall,Pass,Evacuated block in 1 min 58 secs,BS 9999 Code\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Aurelius_FireRisk_Audit_Ledger.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const walkthroughSteps = [
    {
      title: "1. Legal Workspace Activation",
      desc: "Client administrators must sign our Zero-Liability Hold-Harmless Terms and Conditions. This legally shields the software assistant and keeps you accountable.",
      tip: "Navigate to Dashboard → Tick Terms Checkbox and Sign your legal name as responsible manager."
    },
    {
      title: "2. Setting up BACS Direct Debit",
      desc: "Continuous software logs and emergency countdown timers require an active Direct Debit setup. Our standard rate is £49/month, discounted to £25/mo when bundling physical surveys.",
      tip: "Manage mandate accounts easily under the Finance & Billings section. Re-activation occurs instantly with one click."
    },
    {
      title: "3. Weekly Siren & Alarm Testing",
      desc: "UK statutes require logging alarm sounder drills weekly. If a sounder test fails, the Aurelius platform automatically generates an urgent Action Tracker ticket.",
      tip: "Press 'Log Pass Siren' on your overview widgets to log a weekly test instantly in the firelog."
    },
    {
      title: "4. Corrective Action Sign-Off",
      desc: "Outstanding visual deficiencies (E.g. fire door strip Peeling) must be closed out promptly. Simply upload a contractor certificate of proof, and Charlie signs it off.",
      tip: "Open the Action Tracker Ledger, click 'Ingest Evidence', fill out details and commit to resolve."
    },
    {
      title: "5. Downloading Compliance Reports",
      desc: "You can download full audit logs to Excel/CSV or generate beautiful executive client reports in high-fidelity PDF format for board reviews.",
      tip: "Use the Quick Export panel below to print dashboard reports or download CSV spreadsheets."
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn text-left text-slate-800">
      
      {/* Visual Header */}
      <div>
        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-slate-900 text-amber-400 rounded-md">
          Client Onboarding Tour
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
          Interactive Video Training & Website Tutorial
        </h2>
        <p className="text-xs text-slate-500">
          Learn how to easily satisfy United Kingdom safety regulations and extract maximum value from Aurelius.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE SCREENCAST VIDEO PLAYER WITH CHARLIE AVATAR */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Player container */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
            
            {/* Player Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                VIDEO BROADCAST: CLIENT TUTORIAL WALKTHROUGH
              </span>
              <span className="text-slate-500">AURELIUS-TOUR.MP4</span>
            </div>

            {/* Video Canvas holding portrait */}
            <div className="relative bg-slate-900 flex flex-col items-center justify-between p-6 h-[280px]">
              {/* Actual photo placeholder styled visually */}
              <div className="absolute inset-0 bg-cover bg-center brightness-[0.35]" style={{ backgroundImage: "url('/src/assets/images/charlie_hughes_1781988701562.jpg')" }} />
              
              {/* Watermark overlay */}
              <div className="absolute top-4 right-4 text-[9px] font-mono text-white/40 bg-black/40 px-2 py-0.5 rounded uppercase tracking-widest font-black pointer-events-none">
                Live AI Speaking Avatar
              </div>

              {/* Centered Avatar Frame */}
              <div className="my-auto z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg relative shrink-0">
                  <img 
                    src="/src/assets/images/charlie_hughes_1781988701562.jpg" 
                    alt="Charlie Hughes AI Avatar" 
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover grayscale-20 transition-all ${isPlaying ? 'scale-110 animate-pulse' : 'scale-100'}`}
                  />
                  {isPlaying && (
                    <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-955 animate-ping" />
                  )}
                </div>
                <p className="text-white font-extrabold text-xs mt-2 drop-shadow-md">Charlie Hughes, Lead Assessor</p>
                <p className="text-amber-400 font-mono text-[9px] mt-0.5 uppercase tracking-wider font-bold drop-shadow-md">NEBOSH Fire Safety Professional</p>
              </div>

              {/* Subtitles Overlay */}
              <div className="w-full bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/10 z-10 text-center min-h-[50px] flex items-center justify-center">
                <p className="text-xs text-slate-100 font-sans tracking-wide leading-relaxed font-medium">
                  {isPlaying ? currentSubtitle : '"Click Stream Video to watch Charlie explain how to get your Fire Safety certificates."'}
                </p>
              </div>
            </div>

            {/* Video Controllers */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 flex items-center gap-4 text-xs font-mono select-none">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[11px]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                <span>{isPlaying ? 'Pause Guide' : 'Stream Onboarding Video'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setVideoProgress(0);
                  triggerSuccess("Guide video slide re-wound.");
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-xl transition-colors"
                title="Rewind Tutorial"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Timeline duration bars */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[9px] text-slate-550">0:{(Math.floor(videoProgress)).toString().padStart(2, '0')}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 transition-all" style={{ width: `${(videoProgress / 55) * 100}%` }} />
                </div>
                <span className="text-[9px] text-slate-550">0:55</span>
              </div>
            </div>

          </div>

          {/* QUICK PRINT DISPATCH OR DOWNLOAD EXPORT DASHBOARD IN FILE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-xs space-y-4 text-left">
            <div>
              <h3 className="font-extrabold text-slate-900 uppercase tracking-tight">Quick Compliance Exports & Reports</h3>
              <p className="text-slate-500 mt-0.5">Need hardcopies or printable summaries? Print nice PDF booklet snippets or get CSV logs instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <button
                onClick={() => handleSimulateReportDownload('pdf')}
                className="p-3.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="space-y-0.5 text-left">
                  <p className="font-bold text-slate-800">Print Business Snippet</p>
                  <p className="text-[10px] text-slate-500">Perfect high-contrast PDF document</p>
                </div>
                <Download className="w-5 h-5 text-slate-700 shrink-0" />
              </button>

              <button
                onClick={() => handleSimulateReportDownload('excel')}
                className="p-3.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="space-y-0.5 text-left">
                  <p className="font-bold text-slate-800">Export Logs to Excel</p>
                  <p className="text-[10px] text-slate-500">Complete CSV firelog spreadsheet</p>
                </div>
                <Layers className="w-5 h-5 text-slate-700 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE DRILL TUTORIAL CHECKLIST */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 text-left">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4.5 h-4.5 text-amber-500" />
              Step-by-Step Interactive Guide
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any step below to reveal visual walkthrough advice and master the platform setup.
            </p>
          </div>

          <div className="space-y-3.5">
            {walkthroughSteps.map((step, idx) => {
              const isActive = activeWalkthroughStep === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setActiveWalkthroughStep(idx)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.01]' 
                      : 'bg-stone-50 hover:bg-stone-100 border-slate-205 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs">{step.title}</span>
                    {isActive ? (
                      <span className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded uppercase">
                        ACTIVE STEP
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 font-mono">Click to view</span>
                    )}
                  </div>

                  {isActive && (
                    <div className="mt-3 space-y-3 text-xs border-t border-slate-800 pt-3 animate-fadeIn">
                      <p className="text-slate-350 leading-relaxed font-sans">{step.desc}</p>
                      <div className="p-2.5 bg-slate-955 rounded-lg border border-slate-800 text-[11px] font-mono leading-relaxed text-amber-350">
                        💡 <strong>In-App Action Tip:</strong> {step.tip}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick SLA and support widget */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2 text-left text-xs leading-relaxed">
            <p className="font-bold text-amber-900 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-slate-905" />
              Professional Assessor Support
            </p>
            <p className="text-slate-600 font-sans text-[11px]">
              Need direct assistance with an upcoming local county fire inspector review? Contact Charlie Hughes directly via email: <strong className="text-neutral-900">aureliusfirerisk@consultant.com</strong>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
