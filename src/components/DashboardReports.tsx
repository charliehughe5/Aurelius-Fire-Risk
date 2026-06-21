import React, { useState } from 'react';
import { BarChart3, Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown, ShieldCheck, Scale, Award } from 'lucide-react';

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

interface DashboardReportsProps {
  activeClient: ClientSaaS | null;
  activeSite: any;
  triggerSuccess: (msg: string) => void;
  actions: any[];
}

export default function DashboardReports({
  activeClient,
  activeSite,
  triggerSuccess,
  actions
}: DashboardReportsProps) {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // YoY compliance categories
  const yoyMetrics = [
    { category: 'Fire Alarm System Checks', y25: 82, y26: 96 },
    { category: 'Emergency Lighting Tests', y25: 78, y26: 92 },
    { category: 'Extinguisher Servicing', y25: 90, y26: 100 },
    { category: 'Evacuation Drill Loop', y25: 60, y26: 95 },
    { category: 'Certification Logging', y25: 70, y26: 94 },
    { category: 'Hardwired Failsafes', y25: 85, y26: 100 }
  ];

  // Outstanding remediations for current site
  const outstandingCount = actions.filter(
    (a) => a.propertyId === activeSite?.id && a.status !== 'Resolved'
  ).length;

  const resolvedCount = actions.filter(
    (a) => a.propertyId === activeSite?.id && a.status === 'Resolved'
  ).length;

  const handleDownloadPDF = () => {
    setDownloadingFormat('PDF');
    
    // Simulate generation of nice printable compliance document
    setTimeout(() => {
      try {
        const reportTitle = `${activeSite?.name || 'Aurelius_Site'}_Corporate_Compliance_Report_2026`;
        const dateStr = new Date().toLocaleDateString('en-GB');

        const htmlContent = `
============================================================
           AURELIUS FIRE RISK SYSTEMS LTD (NEBOSH)
           Premium Fire Safety Compliance Certificate
============================================================
DOCUMENT ID: AU-RPT-2026-${Math.floor(100000 + Math.random() * 900000)}
CLIENT TIER: ${activeClient?.subType || 'VIP'} Isolated Enterprise Account
PROPERTY: ${activeSite?.name}
ADDRESS: ${activeSite?.address}
ASSESSMENT DATE: ${dateStr}
LEAD CONSULTANT: Charlie Hughes (Senior NEBOSH Fire Engineer)
============================================================

COMPLIANCE LEVEL: ${activeSite?.score}% SECURITY COMPLIANT

CORE AUDITED CATEGORIES SCORECARD:
1. Fire Alarm System Control Panel  : 96% Level (NEBOSH Approved)
2. Emergency Exit Signs & Lights    : 92% Level (BS-5266 Standards)
3. Extinguishers Patrol Register     : 100% Level (P50 Maintenance-Free)
4. Warden Emergency Response Drills : 95% Completion Level
5. Hardwired Plant Cut-off Relays  : 100% Installed

ACTION CLARIFICATIONS LEDGER:
- Total Actions Handled: ${actions.length}
- Actions pending correction: ${outstandingCount}
- Actions safely closed and resolved: ${resolvedCount}

============================================================
              LEGAL DISCLAIMER AND PROTECTION
============================================================
This report is generated strictly under the Aurelius Zero-Liability 
Hold-Harmless Agreement signed by ${activeClient?.contact || 'the Client representative'}. 
Charlie Hughes' safety findings represent Level 1 physical non-destructive 
visual audits. Operational emergency duties remain strictly, at all times, 
on the client's local designated Responsible Person.

For corporate security questions, contact aureliusfirerisk@consultant.com
============================================================
        `;

        const blob = new Blob([htmlContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadingFormat(null);
        triggerSuccess("📄 Nice corporate PDF-TXT compliance report generated and downloaded with genuine NEBOSH details.");
      } catch (err) {
        setDownloadingFormat(null);
        triggerSuccess("⚠️ Failed to export local file.");
      }
    }, 1200);
  };

  const handleDownloadExcel = () => {
    setDownloadingFormat('Excel');

    setTimeout(() => {
      try {
        const dateStr = new Date().toLocaleDateString('en-GB');
        const csvContent = 
          "Category,Year 2025 Score (%),Year 2026 Score (%),Status\n" +
          yoyMetrics.map(m => `${m.category},${m.y25}%,${m.y26}%,Reconciled`).join("\n") +
          `\n\nSite Score Overview\nProperty Name, ${activeSite?.name}\nSystem Score, ${activeSite?.score}%\nDate Exported, ${dateStr}\nDesignated Representative, ${activeClient?.contact}\nResponsible Email, aurelius_compliance@consultant.com\n`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeSite?.name || 'Aurelius_Site'}_YoY_Compliance_Metrics.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadingFormat(null);
        triggerSuccess("📊 Excel CSV spreadsheet containing YoY compliance indices generated successfully.");
      } catch (err) {
        setDownloadingFormat(null);
        triggerSuccess("⚠️ Spreadsheet export failed.");
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-text mb-6">
      
      {/* YEAR-ON-YEAR COMPLIANCE GRAPHS PANEL */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs lg:col-span-3 text-left space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Year-on-Year Performance Analysis
            </h3>
            <h4 className="text-sm font-bold text-neutral-900 font-sans tracking-tight">Compliance progression index (2025 vs 2026)</h4>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-neutral-300 rounded-xs inline-block" />
              <span className="text-neutral-500">2025 Audit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-600 rounded-xs inline-block" />
              <span className="text-neutral-900 font-bold">2026 Live Target</span>
            </div>
          </div>
        </div>

        {/* Bar charts loop */}
        <div className="space-y-3.5 pt-2">
          {yoyMetrics.map((met, idx) => {
            const growth = met.y26 - met.y25;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-neutral-800 text-[11px] font-sans">{met.category}</span>
                  <div className="font-mono text-[11px] flex items-center gap-2">
                    <span className="text-neutral-400">{met.y25}%</span>
                    <span className="text-neutral-300">&rarr;</span>
                    <strong className="text-emerald-700 font-bold">{met.y26}%</strong>
                    <span className="text-[9.5px] bg-[#E6F4EA] text-emerald-800 px-1 py-0.2 rounded font-bold flex items-center">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" />+{growth}%
                    </span>
                  </div>
                </div>

                {/* Progress bars stacking */}
                <div className="relative w-full h-3.5 bg-stone-100 rounded-sm overflow-hidden border border-neutral-150">
                  {/* 2025 underlying bar */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-stone-300 transition-all duration-700"
                    style={{ width: `${met.y25}%` }}
                    title={`2025 Achievement: ${met.y25}%`}
                  />
                  {/* 2026 overlapping active bar */}
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-emerald-650/90 transition-all duration-700"
                    style={{ width: `${met.y26}%` }}
                    title={`2026 Performance: ${met.y26}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPLIANCE REPORT EXPORT PANEL */}
      <div className="bg-gradient-to-br from-[#FAF9F6] to-stone-50 border border-neutral-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left">
        <div className="space-y-4">
          <div className="border-b border-stone-200/50 pb-2.5">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Aurelius Backup</span>
            <h4 className="text-xs uppercase font-extrabold text-[#9A3412] mt-0.5 flex items-center gap-1 font-sans">
              <Award className="w-4 h-4 text-amber-700" />
              NEBOSH Export Center
            </h4>
          </div>

          <p className="text-[11px] text-stone-550 leading-relaxed font-serif">
            Export a comprehensive ledger of digital check logs, active remediations, visual guidelines, and certified assessments for regional Wirral fire brigadiers.
          </p>

          <div className="p-3 bg-white border border-stone-200 rounded-xl text-[10px] font-mono text-stone-500 leading-tight space-y-1">
            <p>✔ Brand: <strong>Aurelius Fire Risk</strong></p>
            <p>✔ Active Site ID: <strong>{activeSite?.id || 'N/A'}</strong></p>
            <p>✔ Outstanding Tasks: <strong>{outstandingCount} Items</strong></p>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingFormat !== null}
            className="w-full py-2 bg-neutral-900 text-white font-mono font-bold uppercase text-[9.5px] rounded-lg shadow-xs hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            {downloadingFormat === 'PDF' ? 'Formatting PDF Report...' : 'Download Nice PDF Report'}
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={downloadingFormat !== null}
            className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-900 border border-neutral-250 font-mono font-bold uppercase text-[9.5px] rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {downloadingFormat === 'Excel' ? 'Structuring Sheets...' : 'Download Excel (CSV)'}
          </button>
        </div>
      </div>

    </div>
  );
}
