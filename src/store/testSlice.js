'use client';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  code: '',
  filePath: '',
  results: null,
  loading: false,
  mode: 'mock', // 'mock' | 'azure'
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setLoading: (state, action) => { state.loading = action.payload; },
    setMode: (state, action) => { state.mode = action.payload; },
    setOutput: (state, action) => {
      state.code = action.payload.code || '';
      state.filePath = action.payload.filePath || '';
      state.results = action.payload.results || null;
    },
    resetOutput: (state) => {
      state.code = ''; state.filePath = ''; state.results = null;
    }
  }
});

export const { setLoading, setMode, setOutput, resetOutput } = testSlice.actions;
export default testSlice.reducer;
