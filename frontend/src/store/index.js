import { configureStore } from '@reduxjs/toolkit';
import investigationReducer from './investigationSlice';
import aiCopilotReducer from './aiCopilotSlice';
import investigationsListReducer from './investigationsListSlice';

export const store = configureStore({
  reducer: {
    investigation: investigationReducer,
    aiCopilot: aiCopilotReducer,
    investigationsList: investigationsListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
