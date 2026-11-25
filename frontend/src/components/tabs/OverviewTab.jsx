import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  FlaskConical, 
  Calendar, 
  User, 
  Layers, 
  Cpu, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { updateIncidentField } from '../../store/investigationSlice';

export default function OverviewTab() {
  const dispatch = useDispatch();
  const { incident } = useSelector(state => state.investigation);

  const handleChange = (field, value) => {
    dispatch(updateIncidentField({ field, value }));
  };

  return (
    <div className="space-y-6">
      
      {/* Root Cause Status Banner (if confirmed) */}
      {incident.confirmed_root_cause ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Primary Root Cause Identified & Confirmed
              </span>
              {incident.root_cause_category && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded">
                  Category: {incident.root_cause_category}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
              {incident.confirmed_root_cause}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold">Root Cause Under Investigation:</span> AI has proposed candidate causes in the Fishbone and 5-Whys tabs. Complete evidence verification to formally confirm the primary root cause.
          </div>
        </div>
      )}

      {/* Primary Incident Metadata Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <Info className="h-4 w-4 text-sky-600" />
          Incident Classification & Manufacturing Context
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Incident Number */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Deviation / Incident Number
            </label>
            <input
              type="text"
              value={incident.incident_number || ''}
              onChange={(e) => handleChange('incident_number', e.target.value)}
              placeholder="e.g. DEV-2026-0418"
              className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Severity */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Quality Severity Classification
            </label>
            <select
              value={incident.severity || 'MAJOR'}
              onChange={(e) => handleChange('severity', e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              <option value="CRITICAL" className="text-red-600 font-bold">CRITICAL (Direct CQA / Patient Impact)</option>
              <option value="MAJOR" className="text-amber-600 font-semibold">MAJOR (CPP / Process Excursion)</option>
              <option value="MINOR" className="text-slate-600">MINOR (Isolated Procedural Drift)</option>
            </select>
          </div>

          {/* Date of Incident */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Date of Occurrence
            </label>
            <input
              type="date"
              value={incident.date_of_incident || ''}
              onChange={(e) => handleChange('date_of_incident', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>

          {/* Reported By */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Reported By (Lead Investigator)
            </label>
            <input
              type="text"
              value={incident.reported_by || ''}
              onChange={(e) => handleChange('reported_by', e.target.value)}
              placeholder="e.g. Dr. Sarah Jenkins (QC Lead)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">
            Investigation Title
          </label>
          <input
            type="text"
            value={incident.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Concise, descriptive investigation title"
            className="w-full px-3 py-2 font-medium text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* API Product & Batch Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <FlaskConical className="h-4 w-4 text-teal-600" />
          Active Pharmaceutical Ingredient (API) & Equipment Traceability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* API Product Name */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              API Drug Substance Name
            </label>
            <input
              type="text"
              value={incident.api_product_name || ''}
              onChange={(e) => handleChange('api_product_name', e.target.value)}
              placeholder="e.g. Atorvastatin Calcium Trihydrate"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>

          {/* API Code */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              API Product Code
            </label>
            <input
              type="text"
              value={incident.api_code || ''}
              onChange={(e) => handleChange('api_code', e.target.value)}
              placeholder="e.g. API-ATC-03"
              className="w-full px-3 py-2 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>

          {/* Batch Number */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Impacted Batch Number(s)
            </label>
            <input
              type="text"
              value={incident.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              placeholder="e.g. ATC260901"
              className="w-full px-3 py-2 font-mono text-xs font-semibold text-sky-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-sky-50/50"
            />
          </div>

          {/* Manufacturing Stage */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Manufacturing Stage / Unit Operation
            </label>
            <input
              type="text"
              value={incident.manufacturing_stage || ''}
              onChange={(e) => handleChange('manufacturing_stage', e.target.value)}
              placeholder="e.g. Step-4 Condensation & Crystallization"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>

          {/* Critical Equipment */}
          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Equipment / Instrument Involved
            </label>
            <input
              type="text"
              value={incident.equipment_id || ''}
              onChange={(e) => handleChange('equipment_id', e.target.value)}
              placeholder="e.g. GLR-103 (5000L Glass Lined Reactor), FCV-103B Control Valve"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />
          </div>
        </div>
      </div>

      {/* Immediate Containment & Product Safety */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <ShieldAlert className="h-4 w-4 text-red-600" />
          Immediate Containment & Lot Quarantine
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Immediate Containment Actions Executed
            </label>
            <textarea
              rows={2}
              value={incident.immediate_containment || ''}
              onChange={(e) => handleChange('immediate_containment', e.target.value)}
              placeholder="Specify lot quarantine, equipment lockout, upstream hold, and sample custody..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Incident Detailed Description & Event Chronology
            </label>
            <textarea
              rows={3}
              value={incident.problem_description || ''}
              onChange={(e) => handleChange('problem_description', e.target.value)}
              placeholder="Detailed description of what occurred, symptoms observed, operator actions, and timeline..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>

      {/* CQA & CPP Impact Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CQA Impact */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Impacted Critical Quality Attributes (CQAs)
          </h4>
          <textarea
            rows={3}
            value={incident.cqa_impacted || ''}
            onChange={(e) => handleChange('cqa_impacted', e.target.value)}
            placeholder="e.g. Related Substance Impurity C: 0.28% (Spec Limit NMT 0.15%), Assay, Polymorphic Form..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-red-50/20"
          />
          <p className="text-[11px] text-slate-500">
            Per ICH Q7: Non-conforming API attributes that impact safety, potency, or purity.
          </p>
        </div>

        {/* CPP Impact */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            Impacted Critical Process Parameters (CPPs)
          </h4>
          <textarea
            rows={3}
            value={incident.cpp_parameters || ''}
            onChange={(e) => handleChange('cpp_parameters', e.target.value)}
            placeholder="e.g. Cooling ramp rate 3.1°C/min vs validated 1.2-1.5°C/min; crystallizer jacket temp..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-sky-50/20"
          />
          <p className="text-[11px] text-slate-500">
            Process telemetry, reactor parameters, and environmental trends outside the validated space.
          </p>
        </div>
      </div>

    </div>
  );
}
