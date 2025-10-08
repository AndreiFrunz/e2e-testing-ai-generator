'use client';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  code: '',
  filePath: '',
  results: null,
  loading: false,
  mode: 'azure', // 'mock' | 'azure'
};

const testSlice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setOutput: (state, action) => {
      if (action.payload.code) {
        state.code = action.payload.code;
      }
      if (action.payload.filePath) {
        state.filePath = action.payload.filePath;
      }
      if (action.payload.results) {
        state.results = action.payload.results;
      }
    },
    resetOutput: (state) => {
      state.code = '';
      state.filePath = '';
      state.results = null;
    },
  },
});

export const { setLoading, setMode, setOutput, resetOutput } =
  testSlice.actions;
export default testSlice.reducer;
