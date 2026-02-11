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
    updateRace: async (data) => (await api.put(`/data/races/${data.nom}`, data)).data,
    updateClass: async (data) => (await api.put(`/data/classes/${data.nom}`, data)).data,
    updateItem: async (data) => (await api.put(`/data/items/${data.name}`, data)).data,
    updateSpell: async (data) => (await api.put(`/data/spells/${data.nom}`, data)).data,
    updateFeat: async (data) => (await api.put(`/data/feats/${data.nom}`, data)).data
};
