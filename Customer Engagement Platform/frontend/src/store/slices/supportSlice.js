import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tickets: [],
  selectedTicket: null,
  isLoading: false,
  error: null,
};

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setTickets: (state, action) => {
      state.tickets = action.payload;
    },
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
    addTicket: (state, action) => {
      state.tickets.push(action.payload);
    },
    updateTicket: (state, action) => {
      const index = state.tickets.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
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
  setTickets, 
  setSelectedTicket, 
  addTicket,
  updateTicket,
  setLoading,
  setError 
} = supportSlice.actions;

export default supportSlice.reducer;
