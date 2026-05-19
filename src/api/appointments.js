import API from './auth';

export const getAppointments = (params) => API.get('/appointments/', { params });
