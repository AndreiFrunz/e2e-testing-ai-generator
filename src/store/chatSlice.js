'use client';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [
    { id: 'welcome', role: 'ai', text: 'Hi! Provide a URL and a scenario. I will generate Playwright tests and run them.' }
  ]
};

let idc = 0;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({ id: `m${idc++}`, ...action.payload });
    },
    resetChat: (state) => {
      state.messages = initialState.messages.slice();
    }
  }
});

export const { addMessage, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
