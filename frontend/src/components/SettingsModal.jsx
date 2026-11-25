import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Key, Cpu, CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { setGroqApiKey, setModelName } from '../store/aiCopilotSlice';

export default function SettingsModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { groqApiKey, modelName } = useSelector(state => state.aiCopilot);
  
  const [localKey, setLocalKey] = useState(groqApiKey);
  const [localModel, setLocalModel] = useState(modelName);
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    dispatch(setGroqApiKey(localKey.trim()));
    dispatch(setModelName(localModel));
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Engine Configuration</h2>
              <p className="text-xs text-slate-400">Groq LLM & LangGraph Multi-Agent Orchestration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-sm">
          
          {/* Groq API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Key className="h-4 w-4 text-sky-600" />
                Groq API Key
              </label>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {localKey ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Key provided. Requests will run directly through Groq + LangGraph.
                </span>
              ) : (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> No key provided. BioSynth is currently running in high-fidelity ICH Q7 heuristic simulation mode.
                </span>
              )}
            </p>
          </div>

          {/* Model Selector */}
          <div>
            <label className="font-semibold text-slate-800 mb-1.5 block">
              Groq LLM Model Selection
            </label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
            >
              <option value="llama-3.3-70b-versatile">
                Llama-3.3-70b-versatile (Recommended - Deep Causal & GxP Reasoning)
              </option>
              <option value="gemma2-9b-it">
                Gemma2-9b-it (Google Gemma 2 - Fast & Precise Extraction)
              </option>
              <option value="llama-3.1-8b-instant">
                Llama-3.1-8b-instant (Ultra-low Latency)
              </option>
            </select>
          </div>

          {/* Tech Stack Verification Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-700">Architecture & Compliance:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>• <b>Frontend:</b> React 18 + Redux Toolkit</div>
              <div>• <b>Backend:</b> Python + FastAPI</div>
              <div>• <b>Orchestration:</b> LangGraph StateGraph</div>
              <div>• <b>Database:</b> SQLAlchemy / SQLite / Postgres</div>
              <div>• <b>Guideline:</b> ICH Q7 / ICH Q10 / 21 CFR 211</div>
              <div>• <b>Engine:</b> 5-Whys & 6M Ishikawa Causal Matrix</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Saved!
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
