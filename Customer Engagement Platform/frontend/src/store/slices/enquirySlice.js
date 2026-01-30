import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  enquiries: [],
  selectedEnquiry: null,
  isLoading: false,
  error: null,
};

const enquirySlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    setEnquiries: (state, action) => {
      state.enquiries = action.payload;
    },
    setSelectedEnquiry: (state, action) => {
      state.selectedEnquiry = action.payload;
    },
    addEnquiry: (state, action) => {
      state.enquiries.push(action.payload);
    },
    updateEnquiry: (state, action) => {
      const index = state.enquiries.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.enquiries[index] = action.payload;
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
  setEnquiries, 
  setSelectedEnquiry, 
  addEnquiry,
  updateEnquiry,
  setLoading,
  setError 
} = enquirySlice.actions;

export default enquirySlice.reducer;
