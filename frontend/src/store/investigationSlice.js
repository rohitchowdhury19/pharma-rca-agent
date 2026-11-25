import { createSlice } from '@reduxjs/toolkit';

const initialIncidentState = {
  id: '',
  title: 'Untitled API Quality Investigation',
  incident_number: '',
  api_product_name: '',
  api_code: '',
  batch_number: '',
  manufacturing_stage: '',
  equipment_id: '',
  severity: 'MAJOR',
  status: 'UNDER_INVESTIGATION',
  date_of_incident: new Date().toISOString().split('T')[0],
  reported_by: '',
  immediate_containment: '',
  problem_description: '',
  cqa_impacted: '',
  cpp_parameters: '',
  confirmed_root_cause: '',
  root_cause_category: '',
  is_root_cause_confirmed: false,
  qp_review_notes: '',
  qp_signed_off: false,
  qp_signed_by: '',
  qp_signed_at: '',
};

export const investigationSlice = createSlice({
  name: 'investigation',
  initialState: {
    incident: { ...initialIncidentState },
    fishbone_nodes: [],
    why_chains: [],
    evidence_items: [],
    capa_items: [],
    audit_logs: [],
    activeTab: 'overview',
    isDirty: false,
    saveStatus: 'idle', // idle, saving, saved, error
    saveError: null,
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    updateIncidentField: (state, action) => {
      const { field, value } = action.payload;
      state.incident[field] = value;
      state.isDirty = true;
    },
    setFullInvestigation: (state, action) => {
      const data = action.payload;
      state.incident = {
        id: data.id || '',
        title: data.title || 'Untitled API Investigation',
        incident_number: data.incident_number || '',
        api_product_name: data.api_product_name || '',
        api_code: data.api_code || '',
        batch_number: data.batch_number || '',
        manufacturing_stage: data.manufacturing_stage || '',
        equipment_id: data.equipment_id || '',
        severity: data.severity || 'MAJOR',
        status: data.status || 'UNDER_INVESTIGATION',
        date_of_incident: data.date_of_incident || '',
        reported_by: data.reported_by || '',
        immediate_containment: data.immediate_containment || '',
        problem_description: data.problem_description || '',
        cqa_impacted: data.cqa_impacted || '',
        cpp_parameters: data.cpp_parameters || '',
        confirmed_root_cause: data.confirmed_root_cause || '',
        root_cause_category: data.root_cause_category || '',
        is_root_cause_confirmed: !!data.is_root_cause_confirmed,
        qp_review_notes: data.qp_review_notes || '',
        qp_signed_off: !!data.qp_signed_off,
        qp_signed_by: data.qp_signed_by || '',
        qp_signed_at: data.qp_signed_at || '',
      };
      state.fishbone_nodes = data.fishbone_nodes || [];
      state.why_chains = (data.why_chains || []).sort((a, b) => a.level - b.level);
      state.evidence_items = data.evidence_items || [];
      state.capa_items = data.capa_items || [];
      state.audit_logs = data.audit_logs || [];
      state.isDirty = false;
    },
    resetInvestigation: (state) => {
      state.incident = { ...initialIncidentState, date_of_incident: new Date().toISOString().split('T')[0] };
      state.fishbone_nodes = [];
      state.why_chains = [];
      state.evidence_items = [];
      state.capa_items = [];
      state.audit_logs = [];
      state.activeTab = 'overview';
      state.isDirty = false;
    },
    // Fishbone Actions
    addFishboneNode: (state, action) => {
      const newNode = {
        id: `FB-${Date.now().toString(36)}`,
        category: action.payload.category || 'MACHINE',
        cause: action.payload.cause || '',
        details: action.payload.details || '',
        likelihood: action.payload.likelihood || 'MEDIUM',
        is_verified: !!action.payload.is_verified,
        is_root_cause: !!action.payload.is_root_cause,
        supporting_evidence: action.payload.supporting_evidence || '',
      };
      state.fishbone_nodes.push(newNode);
      state.isDirty = true;
    },
    updateFishboneNode: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.fishbone_nodes.findIndex(n => n.id === id);
      if (index !== -1) {
        state.fishbone_nodes[index] = { ...state.fishbone_nodes[index], ...updates };
        state.isDirty = true;
      }
    },
    deleteFishboneNode: (state, action) => {
      state.fishbone_nodes = state.fishbone_nodes.filter(n => n.id !== action.payload);
      state.isDirty = true;
    },
    setPrimaryRootCauseFromFishbone: (state, action) => {
      const targetId = action.payload;
      state.fishbone_nodes.forEach(n => {
        if (n.id === targetId) {
          n.is_root_cause = true;
          n.is_verified = true;
          state.incident.confirmed_root_cause = n.cause + (n.details ? `: ${n.details}` : '');
          state.incident.root_cause_category = n.category;
          state.incident.is_root_cause_confirmed = true;
        } else {
          n.is_root_cause = false;
        }
      });
      state.isDirty = true;
    },
    // 5 Whys Actions
    addWhyChainStep: (state, action) => {
      const nextLevel = state.why_chains.length + 1;
      state.why_chains.push({
        id: `WHY-${Date.now().toString(36)}`,
        level: nextLevel,
        question: action.payload.question || `Why did condition occur at level ${nextLevel}?`,
        answer: action.payload.answer || '',
        evidence: action.payload.evidence || '',
        verified: !!action.payload.verified,
      });
      state.isDirty = true;
    },
    updateWhyChainStep: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.why_chains.findIndex(w => w.id === id);
      if (idx !== -1) {
        state.why_chains[idx] = { ...state.why_chains[idx], ...updates };
        state.isDirty = true;
      }
    },
    deleteWhyChainStep: (state, action) => {
      state.why_chains = state.why_chains.filter(w => w.id !== action.payload);
      // Re-index levels
      state.why_chains.forEach((w, i) => { w.level = i + 1; });
      state.isDirty = true;
    },
    setConfirmedRootCauseFromWhy: (state, action) => {
      const whyStep = action.payload;
      state.incident.confirmed_root_cause = whyStep.answer;
      state.incident.is_root_cause_confirmed = true;
      state.isDirty = true;
    },
    // Evidence Actions
    addEvidenceItem: (state, action) => {
      state.evidence_items.push({
        id: `EV-${Date.now().toString(36)}`,
        title: action.payload.title || '',
        source: action.payload.source || 'BMR Review',
        status: action.payload.status || 'PENDING_LAB',
        findings: action.payload.findings || '',
        is_gap: !!action.payload.is_gap,
      });
      state.isDirty = true;
    },
    updateEvidenceItem: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.evidence_items.findIndex(e => e.id === id);
      if (idx !== -1) {
        state.evidence_items[idx] = { ...state.evidence_items[idx], ...updates };
        state.isDirty = true;
      }
    },
    deleteEvidenceItem: (state, action) => {
      state.evidence_items = state.evidence_items.filter(e => e.id !== action.payload);
      state.isDirty = true;
    },
    // CAPA Actions
    addCapaItem: (state, action) => {
      state.capa_items.push({
        id: `CAPA-${Date.now().toString(36)}`,
        action_type: action.payload.action_type || 'PREVENTIVE',
        description: action.payload.description || '',
        rationale: action.payload.rationale || '',
        owner_department: action.payload.owner_department || 'Operations',
        target_date: action.payload.target_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: action.payload.status || 'PROPOSED',
        effectiveness_check: action.payload.effectiveness_check || '',
      });
      state.isDirty = true;
    },
    updateCapaItem: (state, action) => {
      const { id, updates } = action.payload;
      const idx = state.capa_items.findIndex(c => c.id === id);
      if (idx !== -1) {
        state.capa_items[idx] = { ...state.capa_items[idx], ...updates };
        state.isDirty = true;
      }
    },
    deleteCapaItem: (state, action) => {
      state.capa_items = state.capa_items.filter(c => c.id !== action.payload);
      state.isDirty = true;
    },
    // Bulk Apply AI Suggestions
    applyAiMetadata: (state, action) => {
      const meta = action.payload;
      if (!meta) return;
      Object.keys(meta).forEach(key => {
        if (state.incident[key] !== undefined && meta[key]) {
          state.incident[key] = meta[key];
        }
      });
      state.isDirty = true;
    },
    applyAiFishbone: (state, action) => {
      const categories = action.payload; // { MAN: [...], MACHINE: [...] }
      if (!categories) return;
      
      const newNodes = [];
      Object.keys(categories).forEach(cat => {
        const items = categories[cat] || [];
        items.forEach(item => {
          newNodes.push({
            id: `FB-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
            category: cat.toUpperCase(),
            cause: item.cause,
            details: item.details || '',
            likelihood: item.likelihood || 'MEDIUM',
            is_verified: !!item.is_verified,
            is_root_cause: !!item.is_root_cause,
            supporting_evidence: item.supporting_evidence || '',
          });
        });
      });
      state.fishbone_nodes = newNodes;
      state.isDirty = true;
    },
    applyAiFiveWhys: (state, action) => {
      const whys = action.payload;
      if (!Array.isArray(whys)) return;
      state.why_chains = whys.map((w, idx) => ({
        id: `WHY-${Date.now().toString(36)}-${idx}`,
        level: w.level || idx + 1,
        question: w.question,
        answer: w.answer,
        evidence: w.evidence || '',
        verified: !!w.verified,
      }));
      state.isDirty = true;
    },
    applyAiEvidenceGaps: (state, action) => {
      const gaps = action.payload;
      if (!Array.isArray(gaps)) return;
      const newItems = gaps.map((g, idx) => ({
        id: `EV-${Date.now().toString(36)}-${idx}`,
        title: g.title,
        source: g.source || 'Investigation Finding',
        status: g.status || 'PENDING_LAB',
        findings: g.findings || '',
        is_gap: true,
      }));
      state.evidence_items = [...state.evidence_items, ...newItems];
      state.isDirty = true;
    },
    applyAiCapas: (state, action) => {
      const capas = action.payload;
      if (!Array.isArray(capas)) return;
      state.capa_items = capas.map((c, idx) => ({
        id: `CAPA-${Date.now().toString(36)}-${idx}`,
        action_type: c.action_type || 'PREVENTIVE',
        description: c.description,
        rationale: c.rationale || '',
        owner_department: c.owner_department || 'QA & Operations',
        target_date: c.target_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'PROPOSED',
        effectiveness_check: c.effectiveness_check || '',
      }));
      state.isDirty = true;
    },
    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload.status;
      state.saveError = action.payload.error || null;
      if (action.payload.status === 'saved') {
        state.isDirty = false;
      }
    }
  }
});

export const {
  setActiveTab,
  updateIncidentField,
  setFullInvestigation,
  resetInvestigation,
  addFishboneNode,
  updateFishboneNode,
  deleteFishboneNode,
  setPrimaryRootCauseFromFishbone,
  addWhyChainStep,
  updateWhyChainStep,
  deleteWhyChainStep,
  setConfirmedRootCauseFromWhy,
  addEvidenceItem,
  updateEvidenceItem,
  deleteEvidenceItem,
  addCapaItem,
  updateCapaItem,
  deleteCapaItem,
  applyAiMetadata,
  applyAiFishbone,
  applyAiFiveWhys,
  applyAiEvidenceGaps,
  applyAiCapas,
  setSaveStatus,
} = investigationSlice.actions;

export default investigationSlice.reducer;
