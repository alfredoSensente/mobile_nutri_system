import API from './auth';

export const getPatients = () => API.get('/patients/');
export const getPatientById = (id) => API.get(`/patients/${id}/`);
export const createPatient = (data) => API.post('/patients/', data);
export const updatePatient = (id, data) => API.put(`/patients/${id}/`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}/`);
