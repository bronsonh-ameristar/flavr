import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data.data;

            if (!token) {
                return { success: false, error: 'No token received from server' };
            }

            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    },

    register: async (username, email, password) => {
        try {
            const response = await api.post('/auth/register', { username, email, password });
            const { token, user } = response.data.data;

            if (!token) {
                return { success: false, error: 'No token received from server' };
            }

            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, error: message };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
        const token = get().token;

        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const response = await api.get('/auth/me');
            set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null })
}));

export default useAuthStore;
