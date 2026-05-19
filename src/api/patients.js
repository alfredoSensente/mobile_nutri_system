import API from './auth';

export const getPatients = () => API.get('/patients/');
