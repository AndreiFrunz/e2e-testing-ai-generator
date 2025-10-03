'use client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import chatReducer from './chatSlice';
import testReducer from './testSlice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    test: testReducer,
  },
});

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
