import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Send, 
  Check, 
  CheckCheck, 
  ChevronRight, 
  ChevronDown, 
  AlertCircle, 
  Target, 
  GitBranch, 
  FileQuestion, 
  ShieldCheck, 
  Layers, 
  Bot, 
  User, 
  Loader2,
  FileCheck2,
  Cpu,
  ChevronLeft
} from 'lucide-react';
import { 
  setInputText, 
  setDocumentType, 
  setUploadedFileName, 
  setIsAnalyzing, 
  setAnalysisResult, 
  clearAnalysisResult,
  setAnalysisError,
  markSectionApplied,
  markAllSectionsApplied,
  addChatMessage,
  setIsChatting,
  toggleCopilot
} from '../store/aiCopilotSlice';
import { 
  applyAiMetadata, 
  applyAiFishbone, 
  applyAiFiveWhys, 
  applyAiEvidenceGaps, 
  applyAiCapas,
  setActiveTab 
} from '../store/investigationSlice';

export default function AiCopilotPanel() {
  const dispatch = useDispatch();
  const { 
    inputText, 
    documentType, 
    uploadedFileName, 
    groqApiKey, 
    modelName, 
    isAnalyzing, 
    analysisResult, 
    analysisError, 
    chatMessages, 
    isChatting, 
    appliedSections,
    isCopilotOpen
  } = useSelector(state => state.aiCopilot);
  const { incident } = useSelector(state => state.investigation);

  const [activeTab, setActiveTabLocal] = useState('intake'); // Default to 'intake' so user reviews input before running AI
  const [isExtractingDoc, setIsExtractingDoc] = useState(false);
  const [userChatInput, setUserChatInput] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    metadata: true,
    causes: true,
    whys: true,
    gaps: true,
    capa: true,
  });

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to latest message
  React.useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatting, activeTab]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Run LangGraph + Groq Extraction
  const handleRunAnalysis = async () => {
    if (!inputText || inputText.trim().length < 10) {
      alert('Please paste incident text, select a sample, or upload a document first.');
      return;
    }

    dispatch(setIsAnalyzing(true));
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          document_type: documentType,
          groq_api_key: groqApiKey || undefined,
          model_name: modelName || 'llama-3.3-70b-versatile',
          focus_mode: 'full'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis request failed');
      }

      const data = await res.json();
      dispatch(setAnalysisResult(data));
      // Transition to AI suggestions tab ONLY after explicitly running analysis
      setActiveTabLocal('inspector');
    } catch (err) {
      dispatch(setAnalysisError(err.message));
    }
  };

  // File Upload Handler (PDF or Text): ONLY extracts text into the intake box; does NOT run analysis early!
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(setUploadedFileName(file.name));
    dispatch(setDocumentType(file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'text'));
    dispatch(clearAnalysisResult());

    const formData = new FormData();
    formData.append('file', file);
    if (groqApiKey) formData.append('groq_api_key', groqApiKey);
    if (modelName) formData.append('model_name', modelName);

    setIsExtractingDoc(true);
    try {
      const res = await fetch('/api/ai/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'File upload and extraction failed');
      }

      const data = await res.json();
      // Populate raw extracted text into intake textarea
      dispatch(setInputText(data.extracted_text));
      // Explicitly stay on intake tab so user can inspect document and click "Run LangGraph AI Analysis"
      setActiveTabLocal('intake');
    } catch (err) {
      dispatch(setAnalysisError(err.message));
    } finally {
      setIsExtractingDoc(false);
    }
  };

  // Selective Apply Handlers
  const handleApplyMetadata = () => {
    if (!analysisResult?.incident_info) return;
    dispatch(applyAiMetadata(analysisResult.incident_info));
    dispatch(markSectionApplied('metadata'));
    dispatch(setActiveTab('overview'));
  };

  const handleApplyFishbone = () => {
    if (!analysisResult?.fishbone_categories) return;
    dispatch(applyAiFishbone(analysisResult.fishbone_categories));
    dispatch(markSectionApplied('fishbone'));
    dispatch(setActiveTab('fishbone'));
  };

  const handleApplyWhys = () => {
    if (!analysisResult?.five_whys) return;
    dispatch(applyAiFiveWhys(analysisResult.five_whys));
    dispatch(markSectionApplied('whys'));
    dispatch(setActiveTab('five_whys'));
  };

  const handleApplyEvidence = () => {
    if (!analysisResult?.evidence_gaps) return;
    dispatch(applyAiEvidenceGaps(analysisResult.evidence_gaps));
    dispatch(markSectionApplied('evidence'));
    dispatch(setActiveTab('evidence'));
  };

  const handleApplyCapas = () => {
    if (!analysisResult?.capa_recommendations) return;
    dispatch(applyAiCapas(analysisResult.capa_recommendations));
    dispatch(markSectionApplied('capa'));
    dispatch(setActiveTab('capa'));
  };

  // Apply ALL Suggestions at Once
  const handleApplyAll = () => {
    if (!analysisResult) return;
    if (analysisResult.incident_info) dispatch(applyAiMetadata(analysisResult.incident_info));
    if (analysisResult.fishbone_categories) dispatch(applyAiFishbone(analysisResult.fishbone_categories));
    if (analysisResult.five_whys) dispatch(applyAiFiveWhys(analysisResult.five_whys));
    if (analysisResult.evidence_gaps) dispatch(applyAiEvidenceGaps(analysisResult.evidence_gaps));
    if (analysisResult.capa_recommendations) dispatch(applyAiCapas(analysisResult.capa_recommendations));
    dispatch(markAllSectionsApplied());
    dispatch(setActiveTab('overview'));
  };

  // Copilot Chat Handler
  const executeChat = async (messageText) => {
    if (!messageText.trim() || isChatting) return;

    dispatch(addChatMessage({ role: 'user', content: messageText }));
    dispatch(setIsChatting(true));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          context: {
            incident: incident,
            analysisResult: analysisResult,
          },
          groq_api_key: groqApiKey || undefined,
          model_name: modelName || 'llama-3.3-70b-versatile'
        })
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      dispatch(addChatMessage({
        role: 'assistant',
        content: data.reply,
        suggested_actions: data.suggested_actions || []
      }));
    } catch (err) {
      dispatch(addChatMessage({
        role: 'assistant',
        content: 'I encountered an error connecting to the reasoning service. Please check your Groq API key or try again.'
      }));
    } finally {
      dispatch(setIsChatting(false));
    }
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!userChatInput.trim() || isChatting) return;
    const query = userChatInput.trim();
    setUserChatInput('');
    executeChat(query);
  };

  if (!isCopilotOpen) {
    return (
      <button
        onClick={() => dispatch(toggleCopilot())}
        className="fixed right-0 top-24 bg-slate-900 text-sky-400 p-2.5 rounded-l-xl shadow-xl border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1.5 z-30"
        title="Open AI Quality Copilot Panel"
      >
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span className="text-xs font-bold [writing-mode:vertical-rl] rotate-180">AI COPILOT</span>
      </button>
    );
  }

  return (
    <aside className="w-full lg:w-[460px] xl:w-[500px] bg-white border-l border-slate-200 flex flex-col h-[calc(100vh-4rem)] shrink-0 shadow-lg z-20">
      
      {/* Panel Top Header */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              AI Quality Copilot
              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-sky-950 text-sky-300 border border-sky-800 rounded font-mono">
                LangGraph + Groq
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Extraction • 5-Whys • 6M Fishbone • CAPA Recommendations
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleCopilot())}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
          title="Collapse Copilot Panel"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-1 text-xs shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTabLocal('intake')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'intake'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            1. Document Intake
          </button>
          <button
            onClick={() => setActiveTabLocal('inspector')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              activeTab === 'inspector'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>2. AI Suggestions</span>
            {analysisResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTabLocal('chat')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            3. Chat Copilot
          </button>
        </div>
      </div>

      {/* Tab 1: Document Intake */}
      {activeTab === 'intake' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-sky-600" />
              Upload Investigation Document (PDF, Email, or Text)
            </h3>
            <p className="text-slate-500 text-[11px] mb-3">
              Upload an official GxP deviation report PDF or paste an incident notification. AI will parse equipment, CQAs, and batch data.
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.doc,.docx,.eml"
              className="hidden"
            />

            {/* Drag & Drop Trigger Area */}
            <div
              onClick={() => !isExtractingDoc && fileInputRef.current?.click()}
              className={`border-2 border-dashed ${isExtractingDoc ? 'border-sky-400 bg-sky-50/50' : 'border-slate-300 hover:border-sky-500 bg-slate-50/60 hover:bg-sky-50/30'} rounded-xl p-5 text-center cursor-pointer transition group`}
            >
              {isExtractingDoc ? (
                <div className="flex flex-col items-center justify-center py-1">
                  <Loader2 className="h-6 w-6 text-sky-600 animate-spin mb-2" />
                  <span className="font-semibold text-slate-700 text-xs">Extracting text from document via PyPDF...</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Please wait while document text is parsed</span>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-sky-600 mx-auto mb-2 transition" />
                  <div className="font-semibold text-slate-700 text-xs">
                    {uploadedFileName ? (
                      <span className="text-sky-700 font-mono font-bold">{uploadedFileName}</span>
                    ) : (
                      'Click to upload deviation report (PDF, EML, TXT)'
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Supports PyPDF extraction of tables, batches, and signatures
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Or Paste Raw Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">
                Or Paste Incident Narrative / Lab Deviation:
              </label>
              {inputText && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {inputText.length} chars
                </span>
              )}
            </div>
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => dispatch(setInputText(e.target.value))}
              placeholder="Paste deviation report, QC OOS notice, crystallization thermal logs, or operator shift email..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50/50 font-mono text-slate-700 leading-relaxed"
            />
          </div>

          {/* Run Analysis Action Button */}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || isExtractingDoc || !inputText.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-sky-700 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg hover:shadow-sky-500/25 transition-all flex flex-col items-center justify-center gap-1 text-xs group"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2 py-0.5">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span className="font-semibold text-xs tracking-wide">Running LangGraph RCA Reasoning Graph...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky-200 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-bold tracking-wide">Run LangGraph AI Analysis</span>
                </div>
                <span className="text-[10px] text-sky-100 font-normal">
                  Extracts Metadata • 6M Fishbone • 5-Whys • Gaps • CAPA
                </span>
              </>
            )}
          </button>

          {/* Quick Pre-loaded Samples Helper */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-700">Need a sample to test immediately?</div>
            <p className="text-slate-500">
              Select one of the pre-loaded API deviations from the "Load Sample" menu in the top bar, or click below:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={async () => {
                  const res = await fetch('/api/samples');
                  const samples = await res.json();
                  dispatch(resetInvestigation());
                  dispatch(clearAnalysisResult());
                  dispatch(setInputText(samples[0].full_text));
                  dispatch(setUploadedFileName('DEV-2026-0418_Atorvastatin_OOS.txt'));
                  setActiveTabLocal('intake');
                }}
                className="px-2 py-1 bg-white border border-slate-300 hover:border-sky-500 rounded text-slate-700 font-medium transition"
              >
                Atorvastatin OOS Impurity
              </button>
              <button
                onClick={async () => {
                  const res = await fetch('/api/samples');
                  const samples = await res.json();
                  dispatch(resetInvestigation());
                  dispatch(clearAnalysisResult());
                  dispatch(setInputText(samples[1].full_text));
                  dispatch(setUploadedFileName('DEV-2026-0522_Paracetamol_Polymorph.txt'));
                  setActiveTabLocal('intake');
                }}
                className="px-2 py-1 bg-white border border-slate-300 hover:border-sky-500 rounded text-slate-700 font-medium transition"
              >
                Paracetamol Polymorph
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Suggestions Inspector (The primary workflow) */}
      {activeTab === 'inspector' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Analysis Banner */}
          {analysisResult ? (
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  AI Investigation Synthesized
                </span>
                <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                  {Math.round((analysisResult.confidence_score || 0.9) * 100)}% Confidence
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                {analysisResult.summary_narrative}
              </p>
              <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-sky-100">
                Model: <b>{analysisResult.model_used}</b>
              </div>

              {/* Master Apply All Button */}
              <button
                onClick={handleApplyAll}
                className="w-full mt-2 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 text-xs"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Apply All Suggestions to Form</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bot className="h-8 w-8 mx-auto text-slate-300" />
              <p className="font-medium text-slate-600">No AI analysis active yet.</p>
              <p className="text-[11px] text-slate-400">
                Go to the "Document Intake" tab to upload or paste a deviation report and click "Extract & Analyze".
              </p>
              <button
                onClick={() => setActiveTabLocal('intake')}
                className="mt-2 px-3 py-1.5 bg-sky-50 text-sky-700 font-semibold rounded-lg hover:bg-sky-100 transition inline-block text-xs"
              >
                Go to Document Intake
              </button>
            </div>
          )}

          {/* Section 1: Extracted Incident Metadata */}
          {analysisResult?.incident_info && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleSection('metadata')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    Incident Metadata & CQAs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApplyMetadata(); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      appliedSections.metadata 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {appliedSections.metadata ? <Check className="h-3 w-3" /> : null}
                    {appliedSections.metadata ? 'Applied' : 'Apply to Form'}
                  </button>
                  {expandedSections.metadata ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {expandedSections.metadata && (
                <div className="p-3.5 space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div><b>Product:</b> {analysisResult.incident_info.api_product_name}</div>
                    <div><b>Batch:</b> <span className="font-mono">{analysisResult.incident_info.batch_number}</span></div>
                    <div><b>Stage:</b> {analysisResult.incident_info.manufacturing_stage}</div>
                    <div><b>Equipment:</b> {analysisResult.incident_info.equipment_id}</div>
                    <div><b>Severity:</b> <span className="font-bold text-red-600">{analysisResult.incident_info.severity}</span></div>
                    <div><b>Incident ID:</b> <span className="font-mono">{analysisResult.incident_info.incident_number}</span></div>
                  </div>
                  {analysisResult.incident_info.cqa_impacted && (
                    <div className="p-2 bg-red-50/50 rounded border border-red-100 text-red-900">
                      <b>CQA Impacted:</b> {analysisResult.incident_info.cqa_impacted}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Identified Causes & 6M Fishbone */}
          {analysisResult?.potential_root_causes && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleSection('causes')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-teal-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    Ishikawa 6Ms & Root Causes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApplyFishbone(); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      appliedSections.fishbone 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {appliedSections.fishbone ? <Check className="h-3 w-3" /> : null}
                    {appliedSections.fishbone ? 'Applied' : 'Apply to Fishbone'}
                  </button>
                  {expandedSections.causes ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {expandedSections.causes && (
                <div className="p-3.5 space-y-2.5">
                  {analysisResult.potential_root_causes.map((rc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                          {rc.cause}
                        </span>
                        <span className="px-1.5 py-0.2 rounded font-bold text-[9px] bg-sky-100 text-sky-800">
                          {rc.category} • {Math.round((rc.confidence || 0.9) * 100)}%
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {rc.justification}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => dispatch(setActiveTab('fishbone'))}
                    className="w-full mt-2 py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Target className="h-3.5 w-3.5 text-teal-600" />
                    <span>View in Fishbone Tab (2. Fishbone) →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 3: 5-Whys Causal Sequence */}
          {analysisResult?.five_whys && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleSection('whys')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    5-Whys Causal Tree ({analysisResult.five_whys.length} Whys)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApplyWhys(); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      appliedSections.whys 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {appliedSections.whys ? <Check className="h-3 w-3" /> : null}
                    {appliedSections.whys ? 'Applied' : 'Apply to 5-Whys'}
                  </button>
                  {expandedSections.whys ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {expandedSections.whys && (
                <div className="p-3.5 space-y-2">
                  {analysisResult.five_whys.map((w, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px]">
                      <div className="font-bold text-slate-700">W{w.level || idx + 1}: {w.question}</div>
                      <div className="text-slate-600 mt-0.5 font-medium">↳ {w.answer}</div>
                      {w.evidence && (
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Evidence: {w.evidence}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => dispatch(setActiveTab('five_whys'))}
                    className="w-full mt-2 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <GitBranch className="h-3.5 w-3.5 text-indigo-600" />
                    <span>View in 5-Whys Tab (3. 5-Whys) →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 4: Missing Evidence & Follow-up Gaps */}
          {analysisResult?.evidence_gaps && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleSection('gaps')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition"
              >
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-amber-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    Investigative Gaps ({analysisResult.evidence_gaps.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApplyEvidence(); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      appliedSections.evidence 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {appliedSections.evidence ? <Check className="h-3 w-3" /> : null}
                    {appliedSections.evidence ? 'Applied' : 'Add to Evidence'}
                  </button>
                  {expandedSections.gaps ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {expandedSections.gaps && (
                <div className="p-3.5 space-y-2">
                  {analysisResult.evidence_gaps.map((gap, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">{gap.title}</span>
                        <span className="text-[9px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                          {gap.source}
                        </span>
                      </div>
                      <p className="text-amber-900 text-[11px]">
                        {gap.findings}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => dispatch(setActiveTab('evidence'))}
                    className="w-full mt-2 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <FileQuestion className="h-3.5 w-3.5 text-amber-600" />
                    <span>View in Evidence Tab (4. Evidence) →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section 5: Recommended CAPAs */}
          {analysisResult?.capa_recommendations && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div 
                onClick={() => toggleSection('capa')}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between border-b border-slate-200 select-none transition"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-xs">
                    Recommended CAPAs ({analysisResult.capa_recommendations.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApplyCapas(); }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      appliedSections.capa 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                  >
                    {appliedSections.capa ? <Check className="h-3 w-3" /> : null}
                    {appliedSections.capa ? 'Applied' : 'Apply to CAPA'}
                  </button>
                  {expandedSections.capa ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {expandedSections.capa && (
                <div className="p-3.5 space-y-2">
                  {analysisResult.capa_recommendations.map((capa, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          capa.action_type === 'CORRECTIVE' ? 'bg-sky-100 text-sky-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {capa.action_type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Owner: {capa.owner_department}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {capa.description}
                      </p>
                      {capa.effectiveness_check && (
                        <div className="text-[10px] text-slate-600 bg-white p-1 rounded border border-slate-200">
                          <b>Verification:</b> {capa.effectiveness_check}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => dispatch(setActiveTab('capa'))}
                    className="w-full mt-2 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>View in CAPA Tab (5. CAPA Plan) →</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Tab 3: Interactive Copilot Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {chatMessages.map((msg, idx) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={idx}
                  className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`rounded-xl p-3 max-w-[85%] text-xs shadow-sm leading-relaxed ${
                    isAssistant 
                      ? 'bg-white border border-slate-200 text-slate-800' 
                      : 'bg-sky-600 text-white'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-[9px] mt-1 text-right font-mono ${
                      isAssistant ? 'text-slate-400' : 'text-sky-200'
                    }`}>
                      {msg.timestamp}
                    </div>
                  </div>
                  {!isAssistant && (
                    <div className="h-6 w-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            {isChatting && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                <span>Quality Copilot reasoning with Groq...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 shrink-0 text-[10px]">
            <button
              type="button"
              onClick={() => executeChat('What missing evidence is needed to confirm this root cause?')}
              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg whitespace-nowrap cursor-pointer transition font-medium"
            >
              🔍 Check Missing Evidence
            </button>
            <button
              type="button"
              onClick={() => executeChat('Draft a more stringent effectiveness check for CAPA actions.')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg whitespace-nowrap cursor-pointer transition font-medium"
            >
              🛡️ Refine CAPA Check
            </button>
            <button
              type="button"
              onClick={() => executeChat('Explain the crystallization kinetics that caused the impurity.')}
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg whitespace-nowrap cursor-pointer transition font-medium"
            >
              ⚗️ Crystallization Physics
            </button>
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={userChatInput}
              onChange={(e) => setUserChatInput(e.target.value)}
              placeholder="Ask Quality Copilot (e.g. explain 4th why, propose CAPA)..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatting || !userChatInput.trim()}
              className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-lg transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

    </aside>
  );
}
