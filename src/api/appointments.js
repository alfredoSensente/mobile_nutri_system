import API from './auth';

export const getAppointments = (params) => API.get('/appointments/', { params });
export const createAppointment = (data) => API.post('/appointments/', data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}/`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}/`);
