import api from './api';

const getClasses = async () => {
    const response = await api.get('/data/classes');
    return response.data;
};

const getRaces = async () => {
    const response = await api.get('/data/races');
    return response.data;
};

const getSpells = async () => {
    const response = await api.get('/data/spells');
    return response.data;
};

const getItems = async () => {
    const response = await api.get('/data/items');
    return response.data;
};

const getFeats = async () => {
    const response = await api.get('/data/feats');
    return response.data;
};

const getBackgrounds = async () => {
    const response = await api.get('/data/backgrounds');
    return response.data;
};

export default {
    getClasses,
    getRaces,
    getSpells,
    getItems,
    getFeats,
    getBackgrounds,
    updateRace: async (id, data) => (await api.put(`/data/races/${id}`, data)).data,
    updateClass: async (id, data) => (await api.put(`/data/classes/${id}`, data)).data,
    updateItem: async (id, data) => (await api.put(`/data/items/${id}`, data)).data,
    updateSpell: async (id, data) => (await api.put(`/data/spells/${id}`, data)).data,
    updateFeat: async (id, data) => (await api.put(`/data/feats/${id}`, data)).data
};
