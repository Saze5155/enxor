import api from './api';

const campaignService = {
  create: async (data) => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },
  getMyCampaigns: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },
  getPublicCampaigns: async () => {
    const response = await api.get('/campaigns/public');
    return response.data;
  },
  getOne: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  join: async (id) => {
    const response = await api.post(`/campaigns/${id}/join`);
    return response.data;
  },
  toggleSession: async (id) => {
    const response = await api.post(`/campaigns/${id}/toggle-session`);
    return response.data;
  }
};

export default campaignService;
