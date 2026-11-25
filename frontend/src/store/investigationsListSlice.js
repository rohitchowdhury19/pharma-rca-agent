import { createSlice } from '@reduxjs/toolkit';

export const investigationsListSlice = createSlice({
  name: 'investigationsList',
  initialState: {
    items: [],
    loading: false,
    error: null,
    isModalOpen: false,
  },
  reducers: {
    setInvestigationsList: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setInvestigationsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setInvestigationsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    toggleInvestigationsModal: (state) => {
      state.isModalOpen = !state.isModalOpen;
    },
    setInvestigationsModalOpen: (state, action) => {
      state.isModalOpen = action.payload;
    }
  }
});

export const {
  setInvestigationsList,
  setInvestigationsLoading,
  setInvestigationsError,
  toggleInvestigationsModal,
  setInvestigationsModalOpen,
} = investigationsListSlice.actions;

export default investigationsListSlice.reducer;
