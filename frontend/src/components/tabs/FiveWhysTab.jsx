import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  GitBranch, 
  ArrowDown, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Target, 
  ShieldCheck, 
  FileText,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  addWhyChainStep, 
  updateWhyChainStep, 
  deleteWhyChainStep, 
  setConfirmedRootCauseFromWhy 
} from '../../store/investigationSlice';

export default function FiveWhysTab() {
  const dispatch = useDispatch();
  const { why_chains, incident } = useSelector(state => state.investigation);

  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  const handleAddStep = () => {
    if (!newAnswer.trim()) return;
    dispatch(addWhyChainStep({
      question: newQuestion.trim() || `Why did condition occur at level ${why_chains.length + 1}?`,
      answer: newAnswer.trim(),
      evidence: newEvidence.trim(),
      verified: true
    }));
    setNewQuestion('');
    setNewAnswer('');
    setNewEvidence('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Logic Flow Guidance */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-sky-600" />
            5-Whys Systematic Causal Breakdown (ICH Q7 / cGMP)
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Progressively drill down from the observable CQA defect through process physics to the fundamental systemic root cause.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Chain Depth:</span>
          <span className="font-bold text-slate-700">{why_chains.length} Whys</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-semibold">
            {why_chains.filter(w => w.verified).length} Evidence-Verified
          </span>
        </div>
      </div>

      {/* 5 Whys Chain Sequence */}
      <div className="space-y-4 relative">
        {why_chains.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 text-xs">
            <GitBranch className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p>No 5-Whys steps configured yet.</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Use the AI Copilot on the right to extract and auto-populate the 5-Whys causal tree, or add steps manually below.
            </p>
          </div>
        ) : (
          why_chains.map((step, idx) => {
            const isLast = idx === why_chains.length - 1;
            const isConfirmed = incident.confirmed_root_cause === step.answer;

            return (
              <div key={step.id || idx} className="relative group">
                
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-6 top-full h-4 w-0.5 bg-slate-300 -translate-x-1/2 z-0"></div>
                )}

                <div className={`relative z-10 bg-white border rounded-xl p-5 shadow-sm transition text-xs ${
                  isConfirmed 
                    ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20' 
                    : isLast 
                    ? 'border-sky-300 bg-sky-50/10' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  
                  {/* Step Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isConfirmed 
                          ? 'bg-emerald-600 text-white' 
                          : isLast 
                          ? 'bg-sky-600 text-white' 
                          : 'bg-slate-800 text-slate-200'
                      }`}>
                        W{step.level || idx + 1}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {idx === 0 ? 'Direct Symptom / CQA Defect' :
                           idx === 1 ? 'Process Mechanism' :
                           idx === 2 ? 'Parameter / Equipment Excursion' :
                           idx === 3 ? 'Component / Physical Failure' :
                           'Systemic Quality System Root Cause'}
                        </span>
                        <input
                          type="text"
                          value={step.question}
                          onChange={(e) => dispatch(updateWhyChainStep({
                            id: step.id,
                            updates: { question: e.target.value }
                          }))}
                          className="font-bold text-slate-800 text-xs w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none py-0.5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(deleteWhyChainStep(step.id))}
                        className="text-slate-300 hover:text-red-500 p-1 rounded transition"
                        title="Delete step"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Causal Explanation / Answer */}
                  <div className="mb-3">
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Causal Finding / Answer:
                    </label>
                    <textarea
                      rows={2}
                      value={step.answer}
                      onChange={(e) => dispatch(updateWhyChainStep({
                        id: step.id,
                        updates: { answer: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white leading-relaxed font-sans"
                    />
                  </div>

                  {/* Supporting Physical Evidence */}
                  <div className="mb-3">
                    <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      Objective Supporting Evidence (SCADA, CoA, Work Orders):
                    </label>
                    <input
                      type="text"
                      value={step.evidence || ''}
                      onChange={(e) => dispatch(updateWhyChainStep({
                        id: step.id,
                        updates: { evidence: e.target.value }
                      }))}
                      placeholder="e.g. SCADA historian cooling ramp log TT-103A; Maintenance tear-down report WO-ENG-9941..."
                      className="w-full px-3 py-1.5 font-mono text-[11px] border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none bg-white text-slate-700"
                    />
                  </div>

                  {/* Actions & Verification */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={!!step.verified}
                        onChange={(e) => dispatch(updateWhyChainStep({
                          id: step.id,
                          updates: { verified: e.target.checked }
                        }))}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                      />
                      <span className={step.verified ? 'text-emerald-700 font-semibold' : ''}>
                        {step.verified ? 'Evidence Verified' : 'Evidence Pending'}
                      </span>
                    </label>

                    <button
                      onClick={() => dispatch(setConfirmedRootCauseFromWhy(step))}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        isConfirmed
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                      }`}
                    >
                      <Target className="h-3.5 w-3.5" />
                      {isConfirmed ? 'Confirmed Primary Root Cause' : 'Designate as Root Cause'}
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Step Addition Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-xs space-y-3">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <Plus className="h-4 w-4 text-sky-600" />
          Add Next Why in Causal Sequence
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Why Question:
            </label>
            <input
              type="text"
              placeholder={`Why did previous condition occur?`}
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Supporting Physical Evidence:
            </label>
            <input
              type="text"
              placeholder="Citation (BMR, SCADA log, CoA)..."
              value={newEvidence}
              onChange={(e) => setNewEvidence(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Causal Finding / Answer:
            </label>
            <textarea
              rows={2}
              placeholder="State the underlying technical or procedural factor..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAddStep}
            disabled={!newAnswer.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Why Step
          </button>
        </div>
      </div>

    </div>
  );
}
