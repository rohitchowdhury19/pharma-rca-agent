import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, 
  Wrench, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  UserCheck,
  TrendingUp,
  FileText,
  Sparkles,
  Edit3
} from 'lucide-react';
import { 
  addCapaItem, 
  updateCapaItem, 
  deleteCapaItem,
  applyAiCapas 
} from '../../store/investigationSlice';

export default function CapaTab() {
  const dispatch = useDispatch();
  const { capa_items, incident } = useSelector(state => state.investigation);
  const { analysisResult } = useSelector(state => state.aiCopilot);

  const [newActionType, setNewActionType] = useState('PREVENTIVE');
  const [newDescription, setNewDescription] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newDepartment, setNewDepartment] = useState('Plant Engineering & Maintenance');
  const [newDate, setNewDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [newEffectiveness, setNewEffectiveness] = useState('');

  const handleLoadSampleCapas = () => {
    if (analysisResult?.capa_recommendations && analysisResult.capa_recommendations.length > 0) {
      dispatch(applyAiCapas(analysisResult.capa_recommendations));
    } else {
      dispatch(applyAiCapas([
        {
          action_type: "CORRECTIVE",
          description: "Immediately quarantine Batch ATC260901 and initiate OOS investigation protocol SOP-QC-OOS-04.",
          rationale: "Prevents adulterated drug substance from advancing to secondary finishing.",
          owner_department: "Quality Assurance",
          target_date: "2026-11-25",
          status: "IN_PROGRESS",
          effectiveness_check: "100% physical segregation verified by QA Operations with quarantine tag inspection."
        },
        {
          action_type: "CORRECTIVE",
          description: "De-inventory and overhaul cooling valve FCV-103B actuator; replace ruptured elastomeric return diaphragm.",
          rationale: "Restores cooling jacket control loop to calibrated travel response.",
          owner_department: "Plant Engineering",
          target_date: "2026-11-28",
          status: "PROPOSED",
          effectiveness_check: "Hydraulic pressure decay test and 0-100% stroke calibration certificate signed."
        },
        {
          action_type: "PREVENTIVE",
          description: "Update CMMS preventive maintenance schedule PM-VLV-ANNUAL to replace actuator diaphragms on all glass-lined reactors (GLR-101 to GLR-104) every 6 months.",
          rationale: "Prevents mechanical fatigue failures prior to elastomer degradation lifespan.",
          owner_department: "Maintenance Engineering",
          target_date: "2026-12-15",
          status: "PROPOSED",
          effectiveness_check: "CMMS work orders scheduled and executed on sister reactors with zero unplanned leak events over 12 months."
        },
        {
          action_type: "PREVENTIVE",
          description: "Program automated DCS rate-of-change interlock to abort cooling and alarm operator if jacket dT/dt exceeds 1.8°C/min.",
          rationale: "Eliminates reliance on operator shift monitoring to detect fast cooling ramps.",
          owner_department: "Process Automation",
          target_date: "2026-12-22",
          status: "PROPOSED",
          effectiveness_check: "Water run trial simulation verifying automated shutdown within 30 seconds of simulated ramp overshoot."
        }
      ]));
    }
  };

  const handleAddCapa = () => {
    if (!newDescription.trim()) return;
    dispatch(addCapaItem({
      action_type: newActionType,
      description: newDescription.trim(),
      rationale: newRationale.trim(),
      owner_department: newDepartment,
      target_date: newDate,
      status: 'PROPOSED',
      effectiveness_check: newEffectiveness.trim(),
    }));
    setNewDescription('');
    setNewRationale('');
    setNewEffectiveness('');
  };

  const correctiveItems = capa_items.filter(c => c.action_type === 'CORRECTIVE');
  const preventiveItems = capa_items.filter(c => c.action_type === 'PREVENTIVE');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-sky-600" />
            Corrective & Preventive Action (CAPA) Plan (ICH Q10 / ICH Q7)
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Differentiate between immediate remedial containment (Corrective) and systemic recurrence prevention (Preventive).
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-sky-700 font-semibold">{correctiveItems.length} Corrective</span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-700 font-semibold">{preventiveItems.length} Preventive</span>
        </div>
      </div>

      {/* Root Cause Context Refresher */}
      {incident.confirmed_root_cause && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
          <TrendingUp className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Targeting Confirmed Root Cause:</span>{' '}
            <span className="italic">{incident.confirmed_root_cause}</span>
          </div>
        </div>
      )}

      {/* Empty State Banner with Quick Populate Action */}
      {capa_items.length === 0 && (
        <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-xl text-xs space-y-3 shadow-xs">
          <ShieldCheck className="h-8 w-8 text-sky-500 mx-auto" />
          <div>
            <p className="font-bold text-slate-700 text-sm">No CAPA Actions Loaded Yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Extract CAPA recommendations via the AI Copilot on the right, or populate instantly below to edit inline:
            </p>
          </div>
          <button
            onClick={handleLoadSampleCapas}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Populate AI Recommended CAPAs (4 Actions)</span>
          </button>
        </div>
      )}

      {/* Corrective Actions Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800 pb-1 border-b border-sky-100">
          <Wrench className="h-4 w-4 text-sky-600" />
          <span>Corrective Actions (Immediate Remediation & Repair)</span>
        </div>

        {correctiveItems.length === 0 ? (
          <div className="p-5 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-xs">
            No corrective actions defined.
          </div>
        ) : (
          correctiveItems.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold rounded">
                    CORRECTIVE ACTION
                  </span>
                  <select
                    value={item.status}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { status: e.target.value }
                    }))}
                    className="text-[11px] font-semibold border border-slate-300 rounded px-2 py-0.5 bg-white focus:outline-none"
                  >
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Owner:</span>
                    <input
                      type="text"
                      value={item.owner_department || ''}
                      onChange={(e) => dispatch(updateCapaItem({
                        id: item.id,
                        updates: { owner_department: e.target.value }
                      }))}
                      className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700 w-36 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Due:</span>
                    <input
                      type="date"
                      value={item.target_date || ''}
                      onChange={(e) => dispatch(updateCapaItem({
                        id: item.id,
                        updates: { target_date: e.target.value }
                      }))}
                      className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono font-medium text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => dispatch(deleteCapaItem(item.id))}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition"
                    title="Delete action"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between mb-1">
                  <span>Action Description:</span>
                  <span className="text-[10px] text-slate-400 italic">Editable inline</span>
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => dispatch(updateCapaItem({
                    id: item.id,
                    updates: { description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium text-slate-800 leading-relaxed shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Rationale:</span>
                  <input
                    type="text"
                    value={item.rationale || ''}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { rationale: e.target.value }
                    }))}
                    placeholder="Why this action addresses the immediate defect..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Effectiveness Check Criteria:</span>
                  <input
                    type="text"
                    value={item.effectiveness_check || ''}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { effectiveness_check: e.target.value }
                    }))}
                    placeholder="Quantitative verification (e.g. 3-point calibration)..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium text-emerald-900"
                  />
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Preventive Actions Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800 pb-1 border-b border-indigo-100">
          <ShieldAlert className="h-4 w-4 text-indigo-600" />
          <span>Preventive Actions (Systemic Prevention Across Equipment / Suites)</span>
        </div>

        {preventiveItems.length === 0 ? (
          <div className="p-5 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl text-xs">
            No preventive actions defined.
          </div>
        ) : (
          preventiveItems.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-xs space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold rounded">
                    PREVENTIVE ACTION
                  </span>
                  <select
                    value={item.status}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { status: e.target.value }
                    }))}
                    className="text-[11px] font-semibold border border-slate-300 rounded px-2 py-0.5 bg-white focus:outline-none"
                  >
                    <option value="PROPOSED">PROPOSED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Owner:</span>
                    <input
                      type="text"
                      value={item.owner_department || ''}
                      onChange={(e) => dispatch(updateCapaItem({
                        id: item.id,
                        updates: { owner_department: e.target.value }
                      }))}
                      className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 font-medium text-slate-700 w-36 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">Due:</span>
                    <input
                      type="date"
                      value={item.target_date || ''}
                      onChange={(e) => dispatch(updateCapaItem({
                        id: item.id,
                        updates: { target_date: e.target.value }
                      }))}
                      className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 font-mono font-medium text-slate-700 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => dispatch(deleteCapaItem(item.id))}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition"
                    title="Delete action"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between mb-1">
                  <span>Action Description:</span>
                  <span className="text-[10px] text-slate-400 italic">Editable inline</span>
                </label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => dispatch(updateCapaItem({
                    id: item.id,
                    updates: { description: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium text-slate-800 leading-relaxed shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Systemic Rationale:</span>
                  <input
                    type="text"
                    value={item.rationale || ''}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { rationale: e.target.value }
                    }))}
                    placeholder="How this prevents recurrence plant-wide..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
                  />
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Effectiveness Check Metric:</span>
                  <input
                    type="text"
                    value={item.effectiveness_check || ''}
                    onChange={(e) => dispatch(updateCapaItem({
                      id: item.id,
                      updates: { effectiveness_check: e.target.value }
                    }))}
                    placeholder="e.g. Audit next 5 commercial batches; 6-month zero incident rate..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white font-medium text-indigo-900"
                  />
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Add New CAPA Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Plus className="h-4 w-4 text-sky-600" />
          Add Corrective or Preventive Action
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              CAPA Category:
            </label>
            <select
              value={newActionType}
              onChange={(e) => setNewActionType(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs bg-white font-semibold"
            >
              <option value="PREVENTIVE">PREVENTIVE ACTION (Systemic)</option>
              <option value="CORRECTIVE">CORRECTIVE ACTION (Immediate)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Responsible Department:
            </label>
            <select
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs bg-white"
            >
              <option value="Plant Engineering & Maintenance">Plant Engineering & Maintenance</option>
              <option value="Process Automation & DCS">Process Automation & DCS</option>
              <option value="Quality Assurance & Regulatory">Quality Assurance & Regulatory</option>
              <option value="API Manufacturing Operations">API Manufacturing Operations</option>
              <option value="MS&T / Process Chemistry">MS&T / Process Chemistry</option>
              <option value="Analytical QC">Analytical QC</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Target Completion Date:
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs bg-white"
            />
          </div>

          <div className="md:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">
              Action Description:
            </label>
            <textarea
              rows={2}
              placeholder="Detailed description of the corrective or preventive measure..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Quantifiable Effectiveness Check Plan:
            </label>
            <input
              type="text"
              placeholder="e.g. Review trend charts for next 5 consecutive commercial batches to confirm CQA conformance"
              value={newEffectiveness}
              onChange={(e) => setNewEffectiveness(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Rationale:
            </label>
            <input
              type="text"
              placeholder="Justification per root cause finding..."
              value={newRationale}
              onChange={(e) => setNewRationale(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleAddCapa}
            disabled={!newDescription.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Action Item
          </button>
        </div>
      </div>

    </div>
  );
}
