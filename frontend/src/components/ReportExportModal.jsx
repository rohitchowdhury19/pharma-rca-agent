import React from 'react';
import { useSelector } from 'react-redux';
import { Printer, X, Download, FileCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import PrintableReport from './PrintableReport';

export default function ReportExportModal({ isOpen, onClose }) {
  const { incident } = useSelector((state) => state.investigation);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm print:hidden">
      {/* Top Modal Control Bar */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
            <FileCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                GxP Quality Investigation & RCA Report
              </h2>
              <span className="text-xs font-mono text-sky-400 font-semibold">
                {incident.incident_number || 'DRAFT-DEV'}
              </span>
              {incident.qp_signed_off && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  QP Signed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              ICH Q7 / EU Annex 16 Compliant Final Investigation Record
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg shadow transition flex items-center gap-2"
            title="Print to physical printer or save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Close Preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Document Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-800/60 flex justify-center">
        <div className="w-full max-w-4xl">
          <PrintableReport forPrintOnly={false} />
        </div>
      </div>
    </div>
  );
}
