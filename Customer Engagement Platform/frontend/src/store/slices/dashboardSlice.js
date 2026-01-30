import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    projects: 0,
    enquiries: 0,
    payments: 0,
    support: 0,
    revenue: 0,
    customers: 0,
  },
  charts: {
    revenue: [],
    enquiries: [],
    projects: [],
  },
  recentActivity: [],
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setCharts: (state, action) => {
      state.charts = { ...state.charts, ...action.payload };
    },
    setRecentActivity: (state, action) => {
      state.recentActivity = action.payload;
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
  setStats, 
  setCharts, 
  setRecentActivity,
  setLoading,
  setError 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
