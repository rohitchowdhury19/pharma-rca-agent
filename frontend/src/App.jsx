import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import InvestigationWorkbench from './components/InvestigationWorkbench';
import AiCopilotPanel from './components/AiCopilotPanel';
import SettingsModal from './components/SettingsModal';
import InvestigationsListModal from './components/InvestigationsListModal';
import ReportExportModal from './components/ReportExportModal';
import PrintableReport from './components/PrintableReport';
import { setInputText, setDocumentType, setUploadedFileName } from './store/aiCopilotSlice';

export default function App() {
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Auto-load sample-1 text into intake on first launch so user sees immediate content ready to analyze
  useEffect(() => {
    async function loadInitialSample() {
      try {
        const res = await fetch('/api/samples');
        if (res.ok) {
          const samples = await res.json();
          if (samples && samples.length > 0) {
            dispatch(setInputText(samples[0].full_text));
            dispatch(setDocumentType('text'));
            dispatch(setUploadedFileName('DEV-2026-0418_Atorvastatin_OOS_Impurity.txt'));
          }
        }
      } catch (e) {
        console.warn('Initial sample load skipped:', e);
      }
    }
    loadInitialSample();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Application Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Dual-Pane Body */}
      <main className="flex-1 flex flex-col lg:flex-row min-w-0 overflow-hidden">
        {/* Left / Center: Structured RCA Workbench Form */}
        <InvestigationWorkbench onOpenExportModal={() => setIsExportModalOpen(true)} />

        {/* Right: AI Copilot & Extraction Assistant */}
        <AiCopilotPanel />
      </main>

      {/* Global Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <InvestigationsListModal />
      <ReportExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />

      {/* Dedicated Print Report View: rendered only when printing (Ctrl+P or Print Button) */}
      <div className="hidden print:block">
        <PrintableReport forPrintOnly={true} />
      </div>
    </div>
  );
}
