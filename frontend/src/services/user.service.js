import api from './api';
export const getUserStats   = ()            => api.get('/users/stats');
export const getUsers       = ()            => api.get('/users');
export const getUserById    = id            => api.get(`/users/${id}`);
export const addUser        = data          => api.post('/users', data);
export const updateUser     = (id, data)    => api.put(`/users/${id}`, data);
export const deleteUser     = id            => api.delete(`/users/${id}`);
export const toggleStatus   = id            => api.patch(`/users/${id}/toggle-status`);
export const searchUsers    = query         => api.post('/users/search', { query });
