import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileText, 
  Target, 
  GitBranch, 
  FileCheck2, 
  ShieldCheck, 
  Save, 
  Printer, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  setActiveTab, 
  setFullInvestigation, 
  resetInvestigation, 
  setSaveStatus 
} from '../store/investigationSlice';
import OverviewTab from './tabs/OverviewTab';
import FishboneTab from './tabs/FishboneTab';
import FiveWhysTab from './tabs/FiveWhysTab';
import EvidenceTab from './tabs/EvidenceTab';
import CapaTab from './tabs/CapaTab';
import SignOffTab from './tabs/SignOffTab';

export default function InvestigationWorkbench({ onOpenExportModal }) {
  const dispatch = useDispatch();
  const { incident, fishbone_nodes, why_chains, evidence_items, capa_items, activeTab, isDirty, saveStatus, saveError } = useSelector(state => state.investigation);

  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText, badge: null },
    { id: 'fishbone', name: 'Fishbone (6Ms)', icon: Target, badge: fishbone_nodes.length },
    { id: 'five_whys', name: '5-Whys', icon: GitBranch, badge: why_chains.length },
    { id: 'evidence', name: 'Evidence & Gaps', icon: FileCheck2, badge: evidence_items.filter(e => e.is_gap).length ? `${evidence_items.filter(e => e.is_gap).length} Gaps` : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'capa', name: 'CAPA Plan', icon: ShieldCheck, badge: capa_items.length },
    { id: 'sign_off', name: 'QP Sign-Off', icon: Award, badge: incident.qp_signed_off ? 'Signed' : null, badgeColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    dispatch(setSaveStatus({ status: 'saving' }));

    const payload = {
      title: incident.title || 'Untitled Investigation',
      incident_number: incident.incident_number,
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
      confirmed_root_cause: incident.confirmed_root_cause,
      root_cause_category: incident.root_cause_category,
      is_root_cause_confirmed: !!incident.is_root_cause_confirmed,
      qp_review_notes: incident.qp_review_notes,
      qp_signed_off: !!incident.qp_signed_off,
      qp_signed_by: incident.qp_signed_by,
      qp_signed_at: incident.qp_signed_at,
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

    try {
      let res;
      if (incident.id) {
        res = await fetch(`/api/investigations/${incident.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/investigations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Failed to save to database');
      const saved = await res.json();
      dispatch(setFullInvestigation(saved));
      dispatch(setSaveStatus({ status: 'saved' }));
      setTimeout(() => dispatch(setSaveStatus({ status: 'idle' })), 2500);
    } catch (err) {
      dispatch(setSaveStatus({ status: 'error', error: err.message }));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReport = () => {
    if (onOpenExportModal) {
      onOpenExportModal();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 min-w-0 h-[calc(100vh-4rem)] overflow-hidden">
      
      {/* Workbench Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => dispatch(setActiveTab(tab.id))}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-700 bg-sky-50/70 shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={`Open ${tab.name} Tab`}
              >
                <span className={`w-4 h-4 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                  isActive ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {idx + 1}
                </span>
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.name}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.badgeColor || (isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600')
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Save Indicator in Tab Bar */}
        <div className="flex items-center gap-2 pb-2 text-[11px] shrink-0">
          {isDirty && (
            <span className="text-amber-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Unsaved changes
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Active Tab Viewport */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'fishbone' && <FishboneTab />}
        {activeTab === 'five_whys' && <FiveWhysTab />}
        {activeTab === 'evidence' && <EvidenceTab />}
        {activeTab === 'capa' && <CapaTab />}
        {activeTab === 'sign_off' && <SignOffTab />}
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Investigation Record:</span>
          <span className="font-mono text-sky-700">{incident.incident_number || 'DRAFT-NEW'}</span>
          <span>•</span>
          <span>Status: <b className="text-slate-800">{incident.status}</b></span>
          <span>•</span>
          <span>Severity: <b className={incident.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}>{incident.severity}</b></span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset this entire investigation form?')) {
                dispatch(resetInvestigation());
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5 border border-slate-200"
            title="Export / Print GxP RCA Summary Report"
          >
            <Printer className="h-3.5 w-3.5 text-slate-600" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Investigation'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
