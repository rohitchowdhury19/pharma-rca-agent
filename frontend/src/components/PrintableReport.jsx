import React from 'react';
import { useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Building2, 
  Tag, 
  Activity,
  Layers,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function PrintableReport({ forPrintOnly = false }) {
  const { incident, fishbone_nodes, why_chains, evidence_items, capa_items, audit_logs } = useSelector(
    (state) => state.investigation
  );

  const categories = ['MAN', 'MACHINE', 'METHOD', 'MATERIAL', 'MEASUREMENT', 'MILIEU'];
  const categorizedFishbone = categories.reduce((acc, cat) => {
    acc[cat] = fishbone_nodes.filter((n) => n.category?.toUpperCase() === cat);
    return acc;
  }, {});

  const sortedWhys = [...why_chains].sort((a, b) => (a.level || 0) - (b.level || 0));

  return (
    <div 
      id="printable-gxp-report" 
      className={`bg-white text-slate-900 font-sans ${forPrintOnly ? 'print:block hidden' : 'p-6 sm:p-10 max-w-5xl mx-auto shadow-sm rounded-xl border border-slate-200'}`}
      style={{ minHeight: '100%' }}
    >
      {/* Formal GxP Document Header */}
      <div className="border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5 mb-1">
              <Building2 className="h-3.5 w-3.5 text-slate-700" />
              BioSynth API Manufacturing Facility • Quality Assurance Division
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Root Cause Analysis & CAPA Investigation Report
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Compliance Standard: ICH Q7 (Good Manufacturing Practice for Active Pharmaceutical Ingredients) & EU Annex 16
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="inline-block border-2 border-slate-900 px-3 py-1.5 rounded text-right bg-slate-50">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">Record Status</span>
              <span className={`text-xs font-black uppercase tracking-wide ${
                incident.qp_signed_off ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {incident.qp_signed_off ? '✓ QP AUTHORIZED & SIGNED' : 'UNDER INVESTIGATION'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block mt-1">
              Doc ID: {incident.incident_number || 'DRAFT-DEV'} | Rev: 01
            </span>
          </div>
        </div>

        {/* Master Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Deviation Number</span>
            <span className="font-mono font-bold text-slate-800">{incident.incident_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Impacted API Product</span>
            <span className="font-bold text-slate-800">{incident.api_product_name || 'Active Substance'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Batch Number</span>
            <span className="font-mono font-bold text-sky-800">{incident.batch_number || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Date of Occurrence</span>
            <span className="font-medium text-slate-800">{incident.date_of_incident || 'N/A'}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Manufacturing Stage</span>
            <span className="text-slate-800">{incident.manufacturing_stage || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Equipment ID</span>
            <span className="font-mono text-slate-800">{incident.equipment_id || 'N/A'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Incident Severity</span>
            <span className={`font-bold uppercase text-[11px] ${
              incident.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
            }`}>{incident.severity || 'MAJOR'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Investigator</span>
            <span className="text-slate-800">{incident.reported_by || 'Quality Operations Team'}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Problem Narrative & Immediate Containment */}
      <div className="space-y-4 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          1. Incident Description & Immediate Containment Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-600" />
              Deviation Narrative
            </h3>
            <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line">
              {incident.problem_description || 'No detailed description recorded.'}
            </p>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg">
            <h3 className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Immediate Containment & Quarantine
            </h3>
            <p className="text-slate-700 leading-relaxed text-[11px] whitespace-pre-line">
              {incident.immediate_containment || 'Batch isolated in QA quarantine under physical hold.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Critical Quality Attributes & Critical Process Parameters */}
      <div className="space-y-3 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          2. Critical Quality Attributes (CQAs) & Process Parameters (CPPs)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 border border-red-200 bg-red-50/30 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-red-700 block mb-1">Impacted Critical Quality Attribute (CQA)</span>
            <p className="font-semibold text-slate-800 text-[11px]">
              {incident.cqa_impacted || 'Out-of-Specification parameter detected during analytical release.'}
            </p>
          </div>

          <div className="p-3 border border-blue-200 bg-blue-50/30 rounded-lg">
            <span className="text-[10px] font-bold uppercase text-blue-700 block mb-1">Deviating Process Parameters (CPPs)</span>
            <p className="font-semibold text-slate-800 text-[11px]">
              {incident.cpp_parameters || 'Process parameter excursion logged during processing stage.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Ishikawa 6M Fishbone Analysis */}
      <div className="space-y-3 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          3. Ishikawa 6M Causal Analysis (ICH Q9 Quality Risk Management)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {categories.map((cat) => {
            const items = categorizedFishbone[cat] || [];
            return (
              <div key={cat} className="p-2.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block border-b border-slate-200 pb-1 mb-1.5">
                  {cat} ({items.length})
                </span>
                {items.length === 0 ? (
                  <span className="text-[10px] text-slate-400 italic">No contributing factors</span>
                ) : (
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="text-[10px] leading-tight">
                        <span className={`font-semibold block ${item.is_root_cause ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                          {item.cause} {item.is_root_cause && '★ [ROOT CAUSE]'}
                        </span>
                        {item.supporting_evidence && (
                          <span className="text-slate-500 text-[9px] block">Ev: {item.supporting_evidence}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: 5-Whys Root Cause Analysis */}
      <div className="space-y-3 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          4. 5-Whys Deep Causal Chain & Confirmed Root Cause
        </h2>

        {sortedWhys.length === 0 ? (
          <p className="text-xs text-slate-400 italic">5-Whys causal chain not populated.</p>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-2 px-3 w-16">Level</th>
                  <th className="py-2 px-3">Causal Question</th>
                  <th className="py-2 px-3">Answer / Determining Factor</th>
                  <th className="py-2 px-3">Physical Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {sortedWhys.map((why) => (
                  <tr key={why.id || why.level} className={why.level === 5 ? 'bg-amber-50/50 font-medium' : ''}>
                    <td className="py-2 px-3 font-mono font-bold text-slate-500">Why {why.level}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{why.question}</td>
                    <td className="py-2 px-3 text-slate-900 font-semibold">{why.answer}</td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">{why.evidence || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Primary Confirmed Root Cause Highlight Box */}
        <div className="p-3 bg-red-50/50 border-2 border-red-300 rounded-lg mt-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block mb-1">
            Formally Confirmed Root Cause (Root Category: {incident.root_cause_category || 'MACHINE'})
          </span>
          <p className="text-xs font-bold text-slate-900">
            {incident.confirmed_root_cause || 'Root cause substantiated by mechanical inspection and telemetry.'}
          </p>
        </div>
      </div>

      {/* Section 5: Evidence & Gap Analysis Matrix */}
      <div className="space-y-3 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          5. Supporting Evidence & Investigation Findings Matrix
        </h2>

        {evidence_items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No evidence items recorded.</p>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-2 px-3">Item / Target</th>
                  <th className="py-2 px-3">Evidence Source</th>
                  <th className="py-2 px-3">Verification Status</th>
                  <th className="py-2 px-3">Technical Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {evidence_items.map((ev, i) => (
                  <tr key={ev.id || i}>
                    <td className="py-2 px-3 font-semibold text-slate-800">{ev.title}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono text-[10px]">{ev.source}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        ev.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-700 text-[10px]">{ev.findings || 'Pending resolution'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 6: Corrective and Preventive Actions (CAPA) Plan */}
      <div className="space-y-3 mb-6 page-break-inside-avoid">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1.5 rounded border-l-4 border-slate-700">
          6. Corrective and Preventive Action (CAPA) Plan
        </h2>

        {capa_items.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No CAPA items defined.</p>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                  <th className="py-2 px-3 w-28">Type</th>
                  <th className="py-2 px-3">Action Description</th>
                  <th className="py-2 px-3">Owner Dept</th>
                  <th className="py-2 px-3">Target Date</th>
                  <th className="py-2 px-3">Effectiveness Verification Criteria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {capa_items.map((capa, i) => (
                  <tr key={capa.id || i}>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        capa.action_type === 'PREVENTIVE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {capa.action_type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 leading-snug">{capa.description}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{capa.owner_department}</td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{capa.target_date}</td>
                    <td className="py-2 px-3 text-slate-600 text-[10px]">{capa.effectiveness_check || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 7: Qualified Person (QP) Regulatory Attestation & Sign-Off */}
      <div className="space-y-4 mb-6 page-break-inside-avoid border-2 border-slate-900 rounded-xl p-5 bg-slate-50/70">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300">
          <div>
            <h2 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-700" />
              7. Qualified Person (QP) Formal Disposition & Attestation
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Authorized pursuant to EU Annex 16 / 21 CFR 211 / ICH Q7 Good Manufacturing Practice.
            </p>
          </div>
          <div className="text-right">
            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${
              incident.qp_signed_off ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {incident.qp_signed_off ? '✓ GxP Certified & Signed' : 'Pending Formal Sign-Off'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Qualified Person (QP) / QA Director</span>
            <span className="font-bold text-slate-900 text-sm block">
              {incident.qp_signed_by || 'Dr. Arthur Sterling, Lead Qualified Person (QP)'}
            </span>
            <span className="text-[11px] text-slate-500 block">Lead Regulatory Quality Signatory</span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Formal Batch Disposition</span>
            <span className="font-bold text-slate-900 text-xs block">
              Quarantine / Rework Evaluation per DMF Sec 3.2.S.2.5
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Timestamp: {incident.qp_signed_at || 'Pending electronic signature'}
            </span>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">QP Review Findings & Regulatory Disposition Remarks</span>
            <p className="text-slate-800 text-[11px] italic bg-white p-3 rounded border border-slate-200 leading-relaxed">
              "{incident.qp_review_notes || 'RCA causal chain substantiated by SCADA and teardown logs. CAPA actions approved for implementation per cGMP guidelines.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Section 8: Regulatory Audit Trail Excerpt (21 CFR Part 11) */}
      <div className="space-y-2 page-break-inside-avoid pt-2 border-t border-slate-200 text-[10px] text-slate-500">
        <span className="font-bold uppercase tracking-wider text-slate-600 block">
          21 CFR Part 11 Electronic Records Audit Log Excerpt
        </span>
        <div className="divide-y divide-slate-100">
          {audit_logs.slice(-4).map((log) => (
            <div key={log.id} className="py-1 flex justify-between gap-4 font-mono">
              <span><b>[{log.actor}]</b> {log.action}: {log.details}</span>
              <span className="text-slate-400 shrink-0">{new Date(log.timestamp).toUTCString()}</span>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-slate-400 text-center pt-3 border-t border-slate-100">
          *** END OF FORMAL GxP ROOT CAUSE ANALYSIS & CAPA INVESTIGATION REPORT ***
        </div>
      </div>
    </div>
  );
}
