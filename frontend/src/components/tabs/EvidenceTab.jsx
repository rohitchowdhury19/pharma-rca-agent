import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FileCheck2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  HelpCircle,
  FileQuestion,
  Filter,
  Sparkles,
  Check
} from 'lucide-react';
import { 
  addEvidenceItem, 
  updateEvidenceItem, 
  deleteEvidenceItem,
  applyAiEvidenceGaps 
} from '../../store/investigationSlice';

export default function EvidenceTab() {
  const dispatch = useDispatch();
  const { evidence_items } = useSelector(state => state.investigation);
  const { analysisResult } = useSelector(state => state.aiCopilot);

  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, GAPS, CONFIRMED, PENDING
  const [newTitle, setNewTitle] = useState('');
  const [newSource, setNewSource] = useState('SCADA Trend Log');
  const [newStatus, setNewStatus] = useState('PENDING_LAB');
  const [newFindings, setNewFindings] = useState('');
  const [newIsGap, setNewIsGap] = useState(false);

  const handleToggleVerification = (id, currentStatus) => {
    const nextStatus = currentStatus === 'CONFIRMED' ? 'PENDING_LAB' : 'CONFIRMED';
    dispatch(updateEvidenceItem({
      id,
      updates: { 
        status: nextStatus,
        is_gap: nextStatus === 'CONFIRMED' ? false : true 
      }
    }));
  };

  const handleLoadSampleEvidence = () => {
    if (analysisResult?.evidence_gaps && analysisResult.evidence_gaps.length > 0) {
      dispatch(applyAiEvidenceGaps(analysisResult.evidence_gaps));
    } else {
      dispatch(applyAiEvidenceGaps([
        {
          title: "Secondary Chiller Glycol Supply Temperature Trend (BMS)",
          source: "BMS Utility Historian",
          status: "PENDING_LAB",
          findings: "Verify whether utility cooling header supply suffered flow restriction during the 03:00 - 04:00 AM crystallization window.",
          is_gap: true
        },
        {
          title: "Mother Liquor Wash HPLC Chromatogram Verification",
          source: "QC Analytical Lab",
          status: "PENDING_LAB",
          findings: "Inspect wash filtrate chromatograms to confirm if Impurity C was carried over from crystallization or precipitated during washing.",
          is_gap: true
        },
        {
          title: "FCV-103B Control Valve Calibration & Maintenance History",
          source: "CMMS Engineering Logs",
          status: "PENDING_LAB",
          findings: "Review annual preventive maintenance work orders and diaphragm replacement records for valve FCV-103B over the past 12 months.",
          is_gap: true
        },
        {
          title: "Raw Material KSM-2 Purity & Impurity Profile CoA",
          source: "Warehouse Vendor Lot",
          status: "CONFIRMED",
          findings: "Vendor Lot KSM-2-8841 conformed to all release specs (99.4% purity, Impurity C precursor < 0.05%).",
          is_gap: false
        }
      ]));
    }
  };

  const handleAddEvidence = () => {
    if (!newTitle.trim()) return;
    dispatch(addEvidenceItem({
      title: newTitle.trim(),
      source: newSource,
      status: newStatus,
      findings: newFindings.trim(),
      is_gap: newIsGap,
    }));
    setNewTitle('');
    setNewFindings('');
    setNewIsGap(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="h-3 w-3" /> CONFIRMED</span>;
      case 'CONTRADICTS':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200"><XCircle className="h-3 w-3" /> CONTRADICTS</span>;
      case 'INCONCLUSIVE':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><HelpCircle className="h-3 w-3" /> INCONCLUSIVE</span>;
      case 'PENDING_LAB':
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200"><Clock className="h-3 w-3" /> PENDING LAB</span>;
    }
  };

  const gapsCount = evidence_items.filter(e => e.is_gap).length;

  const filteredItems = evidence_items.filter(item => {
    if (activeFilter === 'GAPS') return item.is_gap;
    if (activeFilter === 'CONFIRMED') return item.status === 'CONFIRMED';
    if (activeFilter === 'PENDING') return item.status === 'PENDING_LAB';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Missing Gaps Alert */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-sky-600" />
            Evidence Verification & Investigative Gap Matrix
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Per ICH Q7 guidelines, root cause conclusions must be substantiated by verified physical logs, lab data, or maintenance records.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeFilter === 'ALL' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({evidence_items.length})
          </button>
          <button
            onClick={() => setActiveFilter('GAPS')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition ${
              activeFilter === 'GAPS' ? 'bg-amber-500 text-white font-bold' : 'text-amber-700 hover:bg-amber-100'
            }`}
          >
            <FileQuestion className="h-3 w-3" />
            Missing Gaps ({gapsCount})
          </button>
          <button
            onClick={() => setActiveFilter('CONFIRMED')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
              activeFilter === 'CONFIRMED' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Confirmed
          </button>
        </div>
      </div>

      {/* Missing Evidence Banner (if any gaps exist) */}
      {gapsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs text-amber-900">
            <span className="font-bold text-amber-950">
              {gapsCount} Investigative Gap{gapsCount === 1 ? '' : 's'} Highlighted by AI:
            </span>{' '}
            Additional analytical tests, calibration certificates, or utility trend logs are required to confirm or rule out potential root causes prior to formal QP sign-off.
          </div>
        </div>
      )}

      {/* Evidence Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-xs space-y-3">
            <FileCheck2 className="h-8 w-8 text-sky-500 mx-auto" />
            <div>
              <p className="font-bold text-slate-700 text-sm">No Evidence Items in Current View</p>
              <p className="text-slate-400 text-xs mt-1">
                Extract evidence from deviation reports via the AI Copilot on the right, or populate instantly below:
              </p>
            </div>
            <button
              onClick={handleLoadSampleEvidence}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Populate AI Evidence & Gap Items Now</span>
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white border rounded-xl p-4 shadow-sm text-xs transition ${
                item.is_gap 
                  ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/15' 
                  : item.status === 'CONFIRMED'
                  ? 'border-emerald-300 bg-emerald-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {item.is_gap && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" /> MISSING GAP
                    </span>
                  )}
                  <span className="font-semibold text-slate-800 text-xs">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Source: {item.source}
                  </span>
                  
                  {/* Prominent Verification Toggle Button */}
                  <button
                    onClick={() => handleToggleVerification(item.id, item.status)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      item.status === 'CONFIRMED'
                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 border border-amber-300'
                    }`}
                    title="Click to toggle verification status between Confirmed and Pending"
                  >
                    {item.status === 'CONFIRMED' ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Status: Verified & Confirmed ✓</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <span>Status: Pending Lab (Click to Verify)</span>
                      </>
                    )}
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={item.status || 'PENDING_LAB'}
                    onChange={(e) => dispatch(updateEvidenceItem({
                      id: item.id,
                      updates: { 
                        status: e.target.value,
                        is_gap: e.target.value === 'CONFIRMED' ? false : item.is_gap
                      }
                    }))}
                    className="text-[11px] font-semibold border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CONTRADICTS">CONTRADICTS</option>
                    <option value="INCONCLUSIVE">INCONCLUSIVE</option>
                    <option value="PENDING_LAB">PENDING LAB</option>
                  </select>

                  <button
                    onClick={() => dispatch(deleteEvidenceItem(item.id))}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Findings Content */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Investigation Findings & Lab Records:
                </label>
                <textarea
                  rows={2}
                  value={item.findings || ''}
                  onChange={(e) => dispatch(updateEvidenceItem({
                    id: item.id,
                    updates: { findings: e.target.value }
                  }))}
                  placeholder="Record analytical results, chromatogram IDs, SCADA timestamp correlations..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white leading-relaxed font-sans"
                />
              </div>

              {/* Gap Resolution Checkbox */}
              {item.is_gap && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-amber-900">
                  <span>Is this gap resolved by current lab testing?</span>
                  <button
                    onClick={() => dispatch(updateEvidenceItem({
                      id: item.id,
                      updates: { is_gap: false, status: 'CONFIRMED' }
                    }))}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-emerald-100 text-amber-800 hover:text-emerald-800 font-semibold rounded transition"
                  >
                    Mark Gap Resolved
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Evidence Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Plus className="h-4 w-4 text-sky-600" />
          Add Supporting Evidence or Missing Data Requirement
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Evidence Title / Inspection Target:
            </label>
            <input
              type="text"
              placeholder="e.g. In-process LC-MS mother liquor purity trace"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Evidence Source:
            </label>
            <select
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs bg-white"
            >
              <option value="SCADA Trend Log">SCADA Historian Log</option>
              <option value="Analytical QC CoA">Analytical QC CoA / HPLC</option>
              <option value="Maintenance CMMS Log">Maintenance CMMS / Work Order</option>
              <option value="BMR Review">Batch Manufacturing Record (BMR)</option>
              <option value="Facilities BMS">Facilities BMS (Chiller / HVAC)</option>
              <option value="Operator Logbook">Shift Handover Logbook</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">
              Verification Findings & Technical Summary:
            </label>
            <textarea
              rows={2}
              placeholder="State what was discovered or why this evidence is requested..."
              value={newFindings}
              onChange={(e) => setNewFindings(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-amber-900 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={newIsGap}
              onChange={(e) => setNewIsGap(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
            />
            <span>Flag as Missing Evidence Gap (Action Required)</span>
          </label>

          <button
            onClick={handleAddEvidence}
            disabled={!newTitle.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Evidence Item
          </button>
        </div>
      </div>

    </div>
  );
}
