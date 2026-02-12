import api from './api';

const npcService = {
    // Get all NPCs
    async getNPCs() {
        const response = await api.get('/npcs');
        return response.data;
    },

    // Get single NPC
    async getNPC(id) {
        const response = await api.get(`/npcs/${id}`);
        return response.data;
    },

    // Create NPC
    async createNPC(npcData) {
        const response = await api.post('/npcs', npcData);
        return response.data;
    },

    // Update NPC
    async updateNPC(id, npcData) {
        const response = await api.put(`/npcs/${id}`, npcData);
        return response.data;
    },

    // Delete NPC
    async deleteNPC(id) {
        const response = await api.delete(`/npcs/${id}`);
        return response.data;
    },

    // Generate NPC with AI
    async generateWithAI(params) {
        const response = await api.post('/npcs/generate-ai', params);
        return response.data;
    }
};

export default npcService;
