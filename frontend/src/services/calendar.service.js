import api from './api';
export const getCalendarStats = ()         => api.get('/calendars/stats');
export const getCalendars     = ()         => api.get('/calendars');
export const getCalendarById  = id         => api.get(`/calendars/${id}`);
export const addCalendar      = data       => api.post('/calendars', data);
export const updateCalendar   = (id, data) => api.put(`/calendars/${id}`, data);
export const deleteCalendar   = id         => api.delete(`/calendars/${id}`);
