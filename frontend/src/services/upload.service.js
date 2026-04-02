import api from './api';
export const uploadImages = (formData, calendarId) => {
  formData.append('calendarId', calendarId);
  return api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteImage  = (filename, calendarId) => api.delete(`/upload/file/${filename}`, { data: { calendarId } });
export const getImageUrl  = filename => `/api/upload/${filename}`;
