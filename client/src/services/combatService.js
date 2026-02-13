import api from './api';

const combatService = {
    // Combat Management
    startCombat: async (data) => {
        const response = await api.post('/combats/start', data);
        return response.data;
    },

    getCombat: async (id) => {
        const response = await api.get(`/combats/${id}`);
        return response.data;
    },

    endCombat: async (id) => {
        const response = await api.post(`/combats/${id}/end`);
        return response.data;
    },

    // Initiative
    rollInitiative: async (combatId, data) => {
        const response = await api.post(`/combats/${combatId}/initiative`, data);
        return response.data;
    },

    // Turns & Rounds
    nextTurn: async (combatId) => {
        const response = await api.post(`/combats/${combatId}/next-turn`);
        return response.data;
    },

    nextRound: async (combatId) => {
        const response = await api.post(`/combats/${combatId}/next-round`);
        return response.data;
    },

    // Actions
    executeAction: async (combatId, action) => {
        const response = await api.post(`/combats/${combatId}/action`, action);
        return response.data;
    },

    // Participants Management
    updateHP: async (combatId, participantId, data) => {
        const response = await api.patch(`/combats/${combatId}/participant/${participantId}/hp`, data);
        return response.data;
    },

    addCondition: async (combatId, participantId, condition) => {
        const response = await api.post(`/combats/${combatId}/participant/${participantId}/condition`, condition);
        return response.data;
    },

    removeCondition: async (combatId, participantId, conditionId) => {
        const response = await api.delete(`/combats/${combatId}/participant/${participantId}/condition/${conditionId}`);
        return response.data;
    },
};

export default combatService;
