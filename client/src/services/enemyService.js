import api from './api';

const enemyService = {
  // --- Enemy Types ---
  getEnemyTypes: async () => {
    const response = await api.get('/enemies/types');
    return response.data;
  },

  getEnemyType: async (id) => {
    const response = await api.get(`/enemies/types/${id}`);
    return response.data;
  },

  createEnemyType: async (data) => {
    const response = await api.post('/enemies/types', data);
    return response.data;
  },

  updateEnemyType: async (id, data) => {
    const response = await api.put(`/enemies/types/${id}`, data);
    return response.data;
  },

  deleteEnemyType: async (id) => {
    const response = await api.delete(`/enemies/types/${id}`);
    return response.data;
  },

  importEnemyType: async (jsonData) => {
    const response = await api.post('/enemies/types/import', { jsonData });
    return response.data;
  },

  // --- Enemy Instances ---
  getEnemyInstances: async (campaignId) => {
    const url = campaignId ? `/enemies/instances?campaignId=${campaignId}` : '/enemies/instances';
    const response = await api.get(url);
    return response.data;
  },

  createEnemyInstances: async (data) => {
    const response = await api.post('/enemies/instances', data); // Handles quantity on backend
    return response.data;
  },

  updateEnemyInstance: async (id, data) => {
    const response = await api.put(`/enemies/instances/${id}`, data);
    return response.data;
  },

  deleteEnemyInstance: async (id) => {
    const response = await api.delete(`/enemies/instances/${id}`);
    return response.data;
  },

  // AI Generation
  generateWithAI: async (formData) => {
    const response = await api.post('/enemies/generate-ai', formData);
    return response.data;
  }
};

export default enemyService;
