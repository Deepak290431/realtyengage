import { axiosInstance } from './authService';

const projectService = {
  // Get all projects with filters
  getProjects: async (params = {}) => {
    const response = await axiosInstance.get('/projects', { params });
    return response.data;
  },

  // Get single project
  getProject: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  // Create new project (Admin only)
  createProject: async (projectData) => {
    const response = await axiosInstance.post('/projects', projectData);
    return response.data;
  },

  // Update project (Admin only)
  updateProject: async (id, projectData) => {
    const response = await axiosInstance.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project (Admin only)
  deleteProject: async (id) => {
    const response = await axiosInstance.delete(`/projects/${id}`);
    return response.data;
  },

  // Add images to project (Admin only)
  addImages: async (id, images) => {
    const response = await axiosInstance.post(`/projects/${id}/images`, { images });
    return response.data;
  },

  // Remove image from project (Admin only)
  removeImage: async (projectId, imageId) => {
    const response = await axiosInstance.delete(`/projects/${projectId}/images/${imageId}`);
    return response.data;
  },

  // Get project statistics (Admin only)
  getProjectStats: async () => {
    const response = await axiosInstance.get('/projects/stats/overview');
    return response.data;
  },

  // Search projects
  searchProjects: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    const response = await axiosInstance.get('/projects', { params });
    return response.data;
  },

  // Get featured projects
  getFeaturedProjects: async (limit = 6) => {
    const params = {
      status: 'completed',
      sort: '-views',
      limit
    };
    const response = await axiosInstance.get('/projects', { params });
    return response.data;
  }
};

export default projectService;
