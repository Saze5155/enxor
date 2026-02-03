import api from './api';

const characterService = {
    getAll: async () => {
        const response = await api.get('/characters');
        return response.data;
    },
    getOne: async (id) => {
        const response = await api.get(`/characters/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/characters', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await api.put(`/characters/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/characters/${id}`);
        return response.data;
    }
};

export default characterService;
