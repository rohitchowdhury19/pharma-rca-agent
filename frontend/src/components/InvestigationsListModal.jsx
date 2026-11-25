import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  FolderOpen, 
  Trash2, 
  Search, 
  FileCheck, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  setInvestigationsModalOpen, 
  setInvestigationsList, 
  setInvestigationsLoading, 
  setInvestigationsError 
} from '../store/investigationsListSlice';
import { setFullInvestigation } from '../store/investigationSlice';

export default function InvestigationsListModal() {
  const dispatch = useDispatch();
  const { items, loading, isModalOpen } = useSelector(state => state.investigationsList);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInvestigations = async () => {
    dispatch(setInvestigationsLoading(true));
    try {
      const res = await fetch('/api/investigations');
      if (!res.ok) throw new Error('Failed to load investigations');
      const data = await res.json();
      dispatch(setInvestigationsList(data));
    } catch (err) {
      dispatch(setInvestigationsError(err.message));
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchInvestigations();
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleOpenRecord = async (invId) => {
    try {
      const res = await fetch(`/api/investigations/${invId}`);
      if (!res.ok) throw new Error('Failed to load investigation details');
      const data = await res.json();
      dispatch(setFullInvestigation(data));
      dispatch(setInvestigationsModalOpen(false));
    } catch (err) {
      alert('Error opening record: ' + err.message);
    }
  };

  const handleDeleteRecord = async (invId, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete investigation ${invId}?`)) return;
    try {
      const res = await fetch(`/api/investigations/${invId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchInvestigations();
    } catch (err) {
      alert('Error deleting record: ' + err.message);
    }
  };

  const filtered = items.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.incident_number || '').toLowerCase().includes(q) ||
      (item.batch_number || '').toLowerCase().includes(q) ||
      (item.api_product_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Saved Quality Investigations</h2>
              <p className="text-xs text-slate-400">Database Records • Complete RCA Trees & CAPA Plans</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchInvestigations}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Refresh List"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => dispatch(setInvestigationsModalOpen(false))}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Incident No, Product, Batch, or Keyword..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Body / List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {loading && items.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading investigations from database...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No investigations found. Use the AI Copilot to analyze an incident and click "Save Investigation".
            </div>
          ) : (
            filtered.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleOpenRecord(inv.id)}
                className="py-3 px-3 hover:bg-sky-50/60 rounded-lg cursor-pointer transition flex items-center justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      {inv.incident_number || inv.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      inv.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      inv.severity === 'MAJOR' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {inv.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {inv.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">
                      {inv.api_product_name || 'API Substance'}
                    </span>
                    {inv.batch_number && (
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        Batch: {inv.batch_number}
                      </span>
                    )}
                    <span>Stage: {inv.manufacturing_stage || 'Manufacturing'}</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(inv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inv.qp_signed_off ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="h-3.5 w-3.5" /> QP Approved
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {inv.status}
                    </span>
                  )}

                  <button
                    onClick={(e) => handleDeleteRecord(inv.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Click on any record to open in RCA Workbench</span>
          <button
            onClick={() => dispatch(setInvestigationsModalOpen(false))}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 font-medium text-slate-700 rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
