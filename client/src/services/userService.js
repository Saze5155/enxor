import api from './api';

const userService = {
    getAllPlayers: async () => {
        const response = await api.get('/users');
        return response.data;
    }
};

export default userService;
