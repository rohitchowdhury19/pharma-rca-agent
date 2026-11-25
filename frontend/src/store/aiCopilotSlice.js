import { createSlice } from '@reduxjs/toolkit';

const initialStoredKey = localStorage.getItem('pharma_groq_api_key') || '';
const initialStoredModel = localStorage.getItem('pharma_groq_model') || 'llama-3.3-70b-versatile';

export const aiCopilotSlice = createSlice({
  name: 'aiCopilot',
  initialState: {
    inputText: '',
    documentType: 'text', // text, pdf, email
    uploadedFileName: '',
    groqApiKey: initialStoredKey,
    modelName: initialStoredModel,
    isAnalyzing: false,
    analysisResult: null,
    analysisError: null,
    chatMessages: [
      {
        role: 'assistant',
        content: 'Hello! I am your AI Quality Copilot for API Pharmaceutical Manufacturing (ICH Q7). Upload a deviation report (PDF), paste an incident email or lab record, or pick a sample scenario to extract root cause hypotheses, 5-Whys, missing evidence, and CAPAs.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ],
    isChatting: false,
    isCopilotOpen: true,
    appliedSections: {
      metadata: false,
      fishbone: false,
      whys: false,
      evidence: false,
      capa: false,
    }
  },
  reducers: {
    setInputText: (state, action) => {
      state.inputText = action.payload;
    },
    setDocumentType: (state, action) => {
      state.documentType = action.payload;
    },
    setUploadedFileName: (state, action) => {
      state.uploadedFileName = action.payload;
    },
    setGroqApiKey: (state, action) => {
      state.groqApiKey = action.payload;
      localStorage.setItem('pharma_groq_api_key', action.payload);
    },
    setModelName: (state, action) => {
      state.modelName = action.payload;
      localStorage.setItem('pharma_groq_model', action.payload);
    },
    setIsAnalyzing: (state, action) => {
      state.isAnalyzing = action.payload;
      if (action.payload) {
        state.analysisError = null;
      }
    },
    setAnalysisResult: (state, action) => {
      state.analysisResult = action.payload;
      state.isAnalyzing = false;
      state.analysisError = null;
      // Reset applied status for new analysis
      state.appliedSections = {
        metadata: false,
        fishbone: false,
        whys: false,
        evidence: false,
        capa: false,
      };
    },
    clearAnalysisResult: (state) => {
      state.analysisResult = null;
      state.analysisError = null;
      state.appliedSections = {
        metadata: false,
        fishbone: false,
        whys: false,
        evidence: false,
        capa: false,
      };
    },
    setAnalysisError: (state, action) => {
      state.analysisError = action.payload;
      state.isAnalyzing = false;
    },
    markSectionApplied: (state, action) => {
      const section = action.payload; // 'metadata', 'fishbone', 'whys', 'evidence', 'capa'
      if (state.appliedSections[section] !== undefined) {
        state.appliedSections[section] = true;
      }
    },
    markAllSectionsApplied: (state) => {
      state.appliedSections = {
        metadata: true,
        fishbone: true,
        whys: true,
        evidence: true,
        capa: true,
      };
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push({
        ...action.payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    },
    setIsChatting: (state, action) => {
      state.isChatting = action.payload;
    },
    toggleCopilot: (state) => {
      state.isCopilotOpen = !state.isCopilotOpen;
    },
    setCopilotOpen: (state, action) => {
      state.isCopilotOpen = action.payload;
    }
  }
});

export const {
  setInputText,
  setDocumentType,
  setUploadedFileName,
  setGroqApiKey,
  setModelName,
  setIsAnalyzing,
  setAnalysisResult,
  clearAnalysisResult,
  setAnalysisError,
  markSectionApplied,
  markAllSectionsApplied,
  addChatMessage,
  setIsChatting,
  toggleCopilot,
  setCopilotOpen,
} = aiCopilotSlice.actions;

export default aiCopilotSlice.reducer;
