import api from './api';

const wikiService = {
  // Categories
  getCategories: async () => {
    const response = await api.get('/wiki/categories');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/wiki/categories', data);
    return response.data;
  },

  // Articles
  getArticles: async () => {
    const response = await api.get('/wiki/articles');
    return response.data;
  },
  getArticle: async (id) => {
    const response = await api.get(`/wiki/articles/${id}`);
    return response.data;
  },
  createArticle: async (data) => {
    const response = await api.post('/wiki/articles', data);
    return response.data;
  },
  updateArticle: async (id, data) => {
    const response = await api.put(`/wiki/articles/${id}`, data);
    return response.data;
  }
};

export default wikiService;
