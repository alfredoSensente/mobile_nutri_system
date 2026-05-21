import API from './auth';

export const getMealPlans = () => API.get('/meal-plans/');
export const getMealPlanById = (id) => API.get(`/meal-plans/${id}/`);
export const createMealPlan = (data) => API.post('/meal-plans/', data);
export const updateMealPlan = (id, data) => API.put(`/meal-plans/${id}/`, data);
export const deleteMealPlan = (id) => API.delete(`/meal-plans/${id}/`);

export const createMeal = (planId, data) => API.post(`/meal-plans/${planId}/meals/`, data);
export const updateMeal = (planId, mealId, data) => API.put(`/meal-plans/${planId}/meals/${mealId}/`, data);
export const deleteMeal = (planId, mealId) => API.delete(`/meal-plans/${planId}/meals/${mealId}/`);
