import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,
  stats: null,
};

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setPayments: (state, action) => {
      state.payments = action.payload;
    },
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    addPayment: (state, action) => {
      state.payments.push(action.payload);
    },
    updatePayment: (state, action) => {
      const index = state.payments.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.payments[index] = action.payload;
      }
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setPayments, 
  setSelectedPayment, 
  addPayment,
  updatePayment,
  setStats,
  setLoading,
  setError 
} = paymentSlice.actions;

export default paymentSlice.reducer;
