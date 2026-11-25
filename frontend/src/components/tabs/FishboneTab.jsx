import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  XCircle, 
  Star, 
  Target, 
  ShieldAlert, 
  Sparkles,
  Edit2
} from 'lucide-react';
import { 
  addFishboneNode, 
  updateFishboneNode, 
  deleteFishboneNode, 
  setPrimaryRootCauseFromFishbone 
} from '../../store/investigationSlice';

const CATEGORIES = [
  { id: 'MAN', name: 'Man (Personnel)', color: 'border-indigo-400 bg-indigo-50/40 text-indigo-900', badge: 'bg-indigo-100 text-indigo-700' },
  { id: 'MACHINE', name: 'Machine (Equipment)', color: 'border-sky-400 bg-sky-50/40 text-sky-900', badge: 'bg-sky-100 text-sky-700' },
  { id: 'MATERIAL', name: 'Material (Raw & Solvents)', color: 'border-emerald-400 bg-emerald-50/40 text-emerald-900', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'METHOD', name: 'Method (Process / SOPs)', color: 'border-amber-400 bg-amber-50/40 text-amber-900', badge: 'bg-amber-100 text-amber-700' },
  { id: 'MEASUREMENT', name: 'Measurement (Testing)', color: 'border-purple-400 bg-purple-50/40 text-purple-900', badge: 'bg-purple-100 text-purple-700' },
  { id: 'MILIEU', name: 'Milieu (Environment / Utilities)', color: 'border-teal-400 bg-teal-50/40 text-teal-900', badge: 'bg-teal-100 text-teal-700' },
];

export default function FishboneTab() {
  const dispatch = useDispatch();
  const { fishbone_nodes, incident } = useSelector(state => state.investigation);
  
  const [activeAddCategory, setActiveAddCategory] = useState(null);
  const [newCauseText, setNewCauseText] = useState('');
  const [newCauseDetails, setNewCauseDetails] = useState('');
  const [newCauseLikelihood, setNewCauseLikelihood] = useState('HIGH');
  const [newCauseEvidence, setNewCauseEvidence] = useState('');

  const handleAddCause = (category) => {
    if (!newCauseText.trim()) return;
    dispatch(addFishboneNode({
      category,
      cause: newCauseText.trim(),
      details: newCauseDetails.trim(),
      likelihood: newCauseLikelihood,
      supporting_evidence: newCauseEvidence.trim(),
      is_verified: false,
      is_root_cause: false,
    }));
    setNewCauseText('');
    setNewCauseDetails('');
    setNewCauseEvidence('');
    setActiveAddCategory(null);
  };

  const getLikelihoodBadge = (likelihood) => {
    switch (likelihood) {
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">LOW</span>;
      case 'RULED_OUT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 line-through">RULED OUT</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview & Guidance Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-sky-600" />
            Ishikawa 6Ms Root Cause Analysis Matrix
          </h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Identify and verify hypotheses across the 6 GxP manufacturing dimensions. Highlighted cards designate verified root causes.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-slate-500">Total Hypotheses:</span>
          <span className="font-bold text-slate-700">{fishbone_nodes.length}</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700 font-semibold">
            {fishbone_nodes.filter(n => n.is_verified).length} Verified
          </span>
        </div>
      </div>

      {/* Visual Ishikawa Spine & Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => {
          const nodes = fishbone_nodes.filter(n => n.category === cat.id);
          const isAdding = activeAddCategory === cat.id;

          return (
            <div 
              key={cat.id}
              className={`rounded-xl border p-4 shadow-sm flex flex-col justify-between transition ${cat.color}`}
            >
              <div>
                {/* Category Header */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${cat.badge}`}>
                    {cat.name}
                  </span>
                  <button
                    onClick={() => setActiveAddCategory(isAdding ? null : cat.id)}
                    className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white/80 transition flex items-center gap-1 text-[11px] font-medium"
                    title="Add hypothesis to this category"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Inline Add Form */}
                {isAdding && (
                  <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-sm mb-3 space-y-2 text-xs">
                    <div>
                      <input
                        type="text"
                        placeholder="Hypothesis / Potential Cause..."
                        value={newCauseText}
                        onChange={(e) => setNewCauseText(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Details & technical mechanism..."
                        value={newCauseDetails}
                        onChange={(e) => setNewCauseDetails(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Supporting log or analytical evidence..."
                        value={newCauseEvidence}
                        onChange={(e) => setNewCauseEvidence(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <select
                        value={newCauseLikelihood}
                        onChange={(e) => setNewCauseLikelihood(e.target.value)}
                        className="text-[11px] border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="HIGH">High Likelihood</option>
                        <option value="MEDIUM">Medium Likelihood</option>
                        <option value="LOW">Low Likelihood</option>
                        <option value="RULED_OUT">Ruled Out</option>
                      </select>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setActiveAddCategory(null)}
                          className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddCause(cat.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded shadow-sm"
                        >
                          Add Cause
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nodes List */}
                <div className="space-y-2.5">
                  {nodes.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[11px] italic">
                      No factors identified under {cat.id}.
                    </div>
                  ) : (
                    nodes.map(node => (
                      <div
                        key={node.id}
                        className={`bg-white rounded-lg p-3 border text-xs shadow-xs transition ${
                          node.is_root_cause 
                            ? 'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/20' 
                            : node.likelihood === 'RULED_OUT' 
                            ? 'border-slate-200 opacity-60' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Cause Header */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="font-semibold text-slate-800 leading-snug flex-1">
                            {node.cause}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {getLikelihoodBadge(node.likelihood)}
                            <button
                              onClick={() => dispatch(deleteFishboneNode(node.id))}
                              className="text-slate-300 hover:text-red-500 p-0.5 rounded transition"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        {node.details && (
                          <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
                            {node.details}
                          </p>
                        )}

                        {/* Supporting Evidence */}
                        {node.supporting_evidence && (
                          <div className="bg-slate-50 border border-slate-200/70 rounded px-2 py-1 text-[10px] text-slate-600 font-mono mb-2">
                            <span className="font-semibold text-slate-700 font-sans">Evidence:</span> {node.supporting_evidence}
                          </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                          {/* Verified Checkbox */}
                          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none">
                            <input
                              type="checkbox"
                              checked={!!node.is_verified}
                              onChange={(e) => dispatch(updateFishboneNode({
                                id: node.id,
                                updates: { is_verified: e.target.checked }
                              }))}
                              className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                            />
                            <span className={node.is_verified ? 'text-emerald-700 font-semibold' : ''}>
                              {node.is_verified ? 'Verified' : 'Unverified'}
                            </span>
                          </label>

                          {/* Set as Primary Root Cause */}
                          <button
                            onClick={() => dispatch(setPrimaryRootCauseFromFishbone(node.id))}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                              node.is_root_cause
                                ? 'bg-emerald-600 text-white font-bold'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800'
                            }`}
                            title="Designate this cause as confirmed primary root cause"
                          >
                            <Target className="h-3 w-3" />
                            {node.is_root_cause ? 'Primary Root Cause' : 'Confirm Root Cause'}
                          </button>
                        </div>

                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
