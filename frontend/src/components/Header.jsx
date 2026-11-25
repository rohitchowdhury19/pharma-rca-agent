import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Sparkles, 
  Settings, 
  FolderOpen, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle, 
  FileText,
  Activity,
  ChevronDown
} from 'lucide-react';
import { resetInvestigation, setFullInvestigation } from '../store/investigationSlice';
import { setInputText, setDocumentType, setUploadedFileName, clearAnalysisResult } from '../store/aiCopilotSlice';
import { toggleInvestigationsModal } from '../store/investigationsListSlice';

export default function Header({ onOpenSettings }) {
  const dispatch = useDispatch();
  const { groqApiKey, modelName } = useSelector(state => state.aiCopilot);
  const { incident, isDirty } = useSelector(state => state.investigation);

  const handleNewInvestigation = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Start a new investigation anyway?')) {
        return;
      }
    }
    dispatch(resetInvestigation());
  };

  const handleSelectSample = async (sampleId) => {
    try {
      const res = await fetch('/api/samples');
      const samples = await res.json();
      const sample = samples.find(s => s.id === sampleId);
      if (sample) {
        dispatch(resetInvestigation());
        dispatch(clearAnalysisResult());
        dispatch(setInputText(sample.full_text));
        dispatch(setDocumentType('text'));
        dispatch(setUploadedFileName(`${sample.incident_number}_Incident_Report.txt`));
      }
    } catch (e) {
      console.error('Error fetching sample:', e);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-sky-600 to-teal-400 flex items-center justify-center shadow-md shadow-sky-950">
            <Activity className="h-6 w-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                BioSynth <span className="text-sky-400 font-medium">Quality Copilot</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-sky-950 text-sky-400 border border-sky-800/60 rounded">
                ICH Q7 API RCA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Powered Root Cause Analysis & CAPA • Active Pharmaceutical Ingredients
            </p>
          </div>
        </div>

        {/* Current Incident Title Pill */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5 text-xs">
          <span className="text-slate-400 font-medium">Current Record:</span>
          <span className="text-white font-semibold flex items-center gap-1.5 max-w-xs truncate">
            {incident.incident_number && (
              <span className="text-sky-400 font-mono">{incident.incident_number}</span>
            )}
            {incident.title}
          </span>
          {incident.batch_number && (
            <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono text-[11px]">
              Batch {incident.batch_number}
            </span>
          )}
          {incident.qp_signed_off && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
              <ShieldCheck className="h-3 w-3" /> QP Signed
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Sample Loader Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              <span>Load Sample</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 hidden group-hover:block z-50">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                Select Pre-loaded API Deviations
              </div>
              <button
                onClick={() => handleSelectSample('sample-1')}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded text-xs flex flex-col gap-0.5 transition"
              >
                <span className="font-semibold text-slate-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  Atorvastatin: OOS Impurity C
                </span>
                <span className="text-[11px] text-slate-400">Batch ATC260901 • Cooling Ramp Failure</span>
              </button>
              <button
                onClick={() => handleSelectSample('sample-2')}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded text-xs flex flex-col gap-0.5 transition"
              >
                <span className="font-semibold text-slate-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Paracetamol: Form-II Polymorph
                </span>
                <span className="text-[11px] text-slate-400">Batch PCM-2611-04 • Mass Flow Meter Drift</span>
              </button>
              <button
                onClick={() => handleSelectSample('sample-3')}
                className="w-full text-left px-2.5 py-2 hover:bg-slate-800 rounded text-xs flex flex-col gap-0.5 transition"
              >
                <span className="font-semibold text-slate-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Azithromycin: Residual Solvent OOS
                </span>
                <span className="text-[11px] text-slate-400">Batch AZM-2603-09 • Vacuum Pump Seal Leak</span>
              </button>
            </div>
          </div>

          {/* Saved Records Button */}
          <button
            onClick={() => dispatch(toggleInvestigationsModal())}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Browse Saved Investigations"
          >
            <FolderOpen className="h-3.5 w-3.5 text-teal-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          {/* New Investigation Button */}
          <button
            onClick={handleNewInvestigation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Start New Investigation"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">New RCA</span>
          </button>

          {/* AI Settings / Groq Key Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Configure Groq AI Engine & Models"
          >
            <Sparkles className={`h-3.5 w-3.5 ${groqApiKey ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">AI Engine</span>
            <span className={`w-2 h-2 rounded-full ${groqApiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>
        </div>

      </div>
    </header>
  );
}
