import api from './api';
export const loginUser    = (usr_id, usr_pass) => api.post('/auth/login',    { usr_id, usr_pass });
export const registerUser = (data)             => api.post('/auth/register', data);
