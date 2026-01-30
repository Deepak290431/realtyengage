import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  filters: {
    status: '',
    minPrice: '',
    maxPrice: '',
    area: '',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
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
  setProjects, 
  setSelectedProject, 
  setFilters, 
  setPagination,
  setLoading,
  setError 
} = projectSlice.actions;

export default projectSlice.reducer;
