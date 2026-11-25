import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  Award, 
  Lock, 
  History, 
  CheckCircle, 
  AlertTriangle, 
  FileSignature, 
  UserCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { updateIncidentField, setFullInvestigation } from '../../store/investigationSlice';

export default function SignOffTab() {
  const dispatch = useDispatch();
  const { incident, fishbone_nodes, why_chains, evidence_items, capa_items, audit_logs } = useSelector(state => state.investigation);

  const defaultNotes = 'RCA and CAPA plan formally authorized per EU Annex 16 / 21 CFR 211 / ICH Q7. Root cause confirmed via maintenance tear-down report. Batch ATC260901 quarantined for reprocessing evaluation.';
  const [qpName, setQpName] = useState(incident.qp_signed_by || 'Dr. Arthur Sterling, Lead Qualified Person (QP)');
  const [qpNotes, setQpNotes] = useState(incident.qp_review_notes || defaultNotes);
  const [isSigning, setIsSigning] = useState(false);

  const handleSignOff = async () => {
    if (!qpName.trim()) {
      alert('Please provide the name and title of the Qualified Person.');
      return;
    }

    setIsSigning(true);
    try {
      let currentId = incident.id;

      // If record has not been saved to DB yet, auto-save first so DB record and audit log are created
      if (!currentId) {
        const payload = {
          title: incident.title || 'API Quality Incident RCA',
          incident_number: incident.incident_number || 'DEV-2026-0418',
          api_product_name: incident.api_product_name,
          api_code: incident.api_code,
          batch_number: incident.batch_number,
          manufacturing_stage: incident.manufacturing_stage,
          equipment_id: incident.equipment_id,
          severity: incident.severity,
          status: incident.status,
          date_of_incident: incident.date_of_incident,
          reported_by: incident.reported_by,
          immediate_containment: incident.immediate_containment,
          problem_description: incident.problem_description,
          cqa_impacted: incident.cqa_impacted,
          cpp_parameters: incident.cpp_parameters,
          confirmed_root_cause: incident.confirmed_root_cause || 'Faulty pneumatic actuator on cooling jacket control valve FCV-103B',
          root_cause_category: incident.root_cause_category || 'MACHINE',
          is_root_cause_confirmed: true,
          qp_review_notes: qpNotes.trim(),
          fishbone_nodes: fishbone_nodes.map(n => ({
            category: n.category,
            cause: n.cause,
            details: n.details,
            likelihood: n.likelihood,
            is_verified: n.is_verified,
            is_root_cause: n.is_root_cause,
            supporting_evidence: n.supporting_evidence
          })),
          why_chains: why_chains.map(w => ({
            level: w.level,
            question: w.question,
            answer: w.answer,
            evidence: w.evidence,
            verified: w.verified
          })),
          evidence_items: evidence_items.map(e => ({
            title: e.title,
            source: e.source,
            status: e.status,
            findings: e.findings,
            is_gap: e.is_gap
          })),
          capa_items: capa_items.map(c => ({
            action_type: c.action_type,
            description: c.description,
            rationale: c.rationale,
            owner_department: c.owner_department,
            target_date: c.target_date,
            status: c.status,
            effectiveness_check: c.effectiveness_check
          }))
        };

        const createRes = await fetch('/api/investigations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (createRes.ok) {
          const created = await createRes.json();
          currentId = created.id;
          dispatch(setFullInvestigation(created));
        }
      }

      if (currentId) {
        const formData = new FormData();
        formData.append('qp_name', qpName.trim());
        formData.append('notes', qpNotes.trim());

        const res = await fetch(`/api/investigations/${currentId}/sign-off`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const updated = await res.json();
          dispatch(setFullInvestigation(updated));
          return;
        }
      }

      // Local fallback if offline or mock
      dispatch(updateIncidentField({ field: 'qp_signed_off', value: true }));
      dispatch(updateIncidentField({ field: 'qp_signed_by', value: qpName.trim() }));
      dispatch(updateIncidentField({ field: 'qp_signed_at', value: new Date().toUTCString() }));
      dispatch(updateIncidentField({ field: 'qp_review_notes', value: qpNotes.trim() }));
      dispatch(updateIncidentField({ field: 'status', value: 'CAPA_DEFINED' }));
    } catch (e) {
      // Local fallback
      dispatch(updateIncidentField({ field: 'qp_signed_off', value: true }));
      dispatch(updateIncidentField({ field: 'qp_signed_by', value: qpName.trim() }));
      dispatch(updateIncidentField({ field: 'qp_signed_at', value: new Date().toUTCString() }));
      dispatch(updateIncidentField({ field: 'qp_review_notes', value: qpNotes.trim() }));
      dispatch(updateIncidentField({ field: 'status', value: 'CAPA_DEFINED' }));
    } finally {
      setIsSigning(false);
    }
  };

  const verifiedEvidenceCount = evidence_items.filter(e => e.status === 'CONFIRMED').length;
  const pendingGapsCount = evidence_items.filter(e => e.is_gap).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Qualified Person (QP) Regulatory Review & Authorization
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Per EU Annex 16 / 21 CFR 211 / ICH Q7: AI-assisted findings are provisional until verified by a qualified quality professional.
          </p>
        </div>
        {incident.qp_signed_off ? (
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-300">
            <Award className="h-4 w-4 text-emerald-600" /> GxP Certified & Signed
          </span>
        ) : (
          <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1.5 border border-amber-300">
            <Clock className="h-4 w-4 text-amber-600" /> Pending QP Review
          </span>
        )}
      </div>

      {/* Investigation Readiness Summary Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-4">
        <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <FileSignature className="h-4 w-4 text-sky-600" />
          Pre-Authorization Quality Verification Checklist
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Impacted Batch</span>
            <span className="font-mono font-bold text-slate-800 text-xs block">
              {incident.batch_number || 'Unspecified'}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">{incident.api_product_name || 'API Substance'}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Root Cause Confirmation</span>
            {incident.confirmed_root_cause ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                <CheckCircle className="h-3.5 w-3.5" /> Confirmed
              </span>
            ) : (
              <span className="text-amber-600 font-bold flex items-center gap-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5" /> Provisional / Unconfirmed
              </span>
            )}
            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
              Category: {incident.root_cause_category || '6M Analysis'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Supporting Evidence</span>
            <span className="font-bold text-slate-800 text-xs block">
              {verifiedEvidenceCount} Verified of {evidence_items.length} Total
            </span>
            <span className={`text-[11px] font-medium block ${pendingGapsCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingGapsCount > 0 ? `${pendingGapsCount} unresolved gaps` : 'All gaps addressed'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">CAPA Action Items</span>
            <span className="font-bold text-slate-800 text-xs block">
              {capa_items.length} Action Items
            </span>
            <span className="text-[11px] text-slate-500 block">
              {capa_items.filter(c => c.action_type === 'PREVENTIVE').length} Preventive / {capa_items.filter(c => c.action_type === 'CORRECTIVE').length} Corrective
            </span>
          </div>
        </div>
      </div>

      {/* Qualified Person Sign-Off Box */}
      <div className={`rounded-xl border p-6 shadow-sm text-xs space-y-4 transition ${
        incident.qp_signed_off 
          ? 'bg-emerald-50/40 border-emerald-300' 
          : 'bg-white border-slate-300'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Award className={`h-5 w-5 ${incident.qp_signed_off ? 'text-emerald-600' : 'text-slate-400'}`} />
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                Qualified Person Formal Disposition & Attestation
              </h4>
              <p className="text-slate-500 text-[11px]">
                I attest that this Root Cause Analysis and CAPA plan has been reviewed per cGMP & ICH Q7 guidelines.
              </p>
            </div>
          </div>
          {incident.qp_signed_off && (
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-800 font-bold block">
                SIGNED & TIMESTAMPED
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {incident.qp_signed_at}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Qualified Person (QP) / QA Director Name & Title:
            </label>
            <input
              type="text"
              value={qpName}
              onChange={(e) => setQpName(e.target.value)}
              disabled={incident.qp_signed_off}
              placeholder="e.g. Dr. Arthur Sterling, Qualified Person"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white disabled:bg-slate-100 font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Batch Disposition Recommendation:
            </label>
            <input
              type="text"
              defaultValue="Quarantine / Rework Evaluation per DMF Sec 3.2.S.2.5"
              disabled={incident.qp_signed_off}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white disabled:bg-slate-100 text-slate-800"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              QP Regulatory Review Findings & Sign-Off Remarks:
            </label>
            <textarea
              rows={3}
              value={qpNotes}
              onChange={(e) => setQpNotes(e.target.value)}
              disabled={incident.qp_signed_off}
              placeholder="Enter final regulatory assessment, product impact rationale, effectiveness check timeline..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white disabled:bg-slate-100 leading-relaxed font-sans"
            />
          </div>
        </div>

        {!incident.qp_signed_off ? (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSignOff}
              disabled={isSigning}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              {isSigning ? 'Authorizing...' : 'Authorize & Sign Investigation'}
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-100/60 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span><b>Signed by:</b> {incident.qp_signed_by} • <b>Date:</b> {incident.qp_signed_at}</span>
            </div>
            <button
              onClick={() => dispatch(updateIncidentField({ field: 'qp_signed_off', value: false }))}
              className="text-[11px] text-slate-500 hover:text-slate-700 underline"
            >
              Unlock for edits
            </button>
          </div>
        )}
      </div>

      {/* Immutable GxP Audit Log Trail */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
        <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center gap-1.5">
          <History className="h-4 w-4 text-slate-500" />
          Regulatory Audit Trail (21 CFR Part 11 Electronic Records)
        </h4>

        <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100">
          {audit_logs.length === 0 ? (
            <div className="text-slate-400 py-4 text-center italic text-[11px]">
              Audit trail initialized with investigation creation.
            </div>
          ) : (
            audit_logs.map(log => (
              <div key={log.id} className="pt-2 flex items-start justify-between gap-3 text-[11px]">
                <div className="flex items-start gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.actor === 'QUALIFIED_PERSON' ? 'bg-emerald-100 text-emerald-800' :
                    log.actor === 'AI_ASSISTANT' ? 'bg-sky-100 text-sky-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {log.actor}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">{log.action}: </span>
                    <span className="text-slate-600">{log.details}</span>
                  </div>
                </div>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
