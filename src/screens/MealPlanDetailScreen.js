import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMealPlanById, deleteMeal } from '../api/mealPlans';

const MEAL_TYPE_LABELS = {
  breakfast: 'Desayuno',
  morning_snack: 'Colación matutina',
  lunch: 'Comida',
  afternoon_snack: 'Colación vespertina',
  dinner: 'Cena',
  other: 'Otro',
};

const MEAL_TYPE_ICONS = {
  breakfast: 'sunny-outline',
  morning_snack: 'cafe-outline',
  lunch: 'restaurant-outline',
  afternoon_snack: 'nutrition-outline',
  dinner: 'moon-outline',
  other: 'ellipsis-horizontal-outline',
};

const DAY_LABELS = {
  mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue', fri: 'Vie', sat: 'Sáb', sun: 'Dom',
  d1: 'Día 1', d2: 'Día 2', d3: 'Día 3', d4: 'Día 4', d5: 'Día 5', d6: 'Día 6', d7: 'Día 7',
};

export default function MealPlanDetailScreen({ route, navigation }) {
  const { plan: initialPlan } = route.params;
  const [plan, setPlan] = useState(initialPlan);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMealPlanById(plan.id);
      setPlan(res.data);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el plan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleDeleteMeal = (meal) => {
    Alert.alert(
      'Eliminar comida',
      `¿Eliminar "${MEAL_TYPE_LABELS[meal.meal_type] || meal.meal_type}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(plan.id, meal.id);
              load();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la comida');
            }
          },
        },
      ]
    );
  };

  const getDayLabel = (meal) => {
    if (!meal.days || meal.days.length === 0) return 'Todos los días';
    return meal.days.map(d => DAY_LABELS[d] || d).join(', ');
  };

  if (loading && !plan.meals) {
    return <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Encabezado del plan */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.patientName}>{plan.patient_name}</Text>
            </View>
            <TouchableOpacity
              style={styles.editPlanBtn}
              onPress={() => navigation.navigate('MealPlanForm', { plan })}
            >
              <Ionicons name="pencil-outline" size={20} color="#0891b2" />
            </TouchableOpacity>
          </View>

          {plan.description ? <Text style={styles.description}>{plan.description}</Text> : null}

          <View style={styles.headerMeta}>
            <Text style={styles.metaText}>
              <Ionicons name="calendar-outline" size={13} color="#64748b" />{' '}
              {plan.start_date}{plan.end_date ? ` → ${plan.end_date}` : ''}
            </Text>
            <View style={[styles.badge, plan.is_active ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>{plan.is_active ? 'Activo' : 'Inactivo'}</Text>
            </View>
          </View>

          {(plan.calorie_goal || plan.protein_goal || plan.carb_goal || plan.fat_goal) && (
            <View style={styles.macros}>
              {plan.calorie_goal ? (
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.calorie_goal}</Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
              ) : null}
              {plan.protein_goal ? (
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.protein_goal}g</Text>
                  <Text style={styles.macroLabel}>Proteína</Text>
                </View>
              ) : null}
              {plan.carb_goal ? (
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.carb_goal}g</Text>
                  <Text style={styles.macroLabel}>Carbos</Text>
                </View>
              ) : null}
              {plan.fat_goal ? (
                <View style={styles.macroItem}>
                  <Text style={styles.macroVal}>{plan.fat_goal}g</Text>
                  <Text style={styles.macroLabel}>Grasas</Text>
                </View>
              ) : null}
            </View>
          )}
        </View>

        {/* Comidas */}
        <Text style={styles.sectionTitle}>
          Comidas ({plan.meals?.length ?? 0})
        </Text>

        {plan.meals?.length === 0 && (
          <Text style={styles.emptyText}>No hay comidas aún. Toca + para agregar.</Text>
        )}

        {plan.meals?.map(meal => (
          <View key={meal.id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Ionicons
                name={MEAL_TYPE_ICONS[meal.meal_type] || 'ellipsis-horizontal-outline'}
                size={18}
                color="#0891b2"
              />
              <Text style={styles.mealType}>
                {MEAL_TYPE_LABELS[meal.meal_type] || meal.meal_type}
              </Text>
              {meal.name ? <Text style={styles.mealName}> — {meal.name}</Text> : null}
              <View style={styles.mealActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('MealForm', {
                    planId: plan.id,
                    planType: plan.plan_type,
                    rotationDaysCount: plan.rotation_days_count,
                    meal,
                  })}
                >
                  <Ionicons name="pencil-outline" size={18} color="#0891b2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteMeal(meal)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.mealDescription}>{meal.description}</Text>
            <Text style={styles.mealDays}>{getDayLabel(meal)}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MealForm', {
          planId: plan.id,
          planType: plan.plan_type,
          rotationDaysCount: plan.rotation_days_count,
        })}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 80 },
  header: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  headerLeft: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  patientName: { fontSize: 14, color: '#64748b', marginTop: 2 },
  editPlanBtn: { padding: 4 },
  description: { fontSize: 14, color: '#475569', marginBottom: 10 },
  headerMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metaText: { fontSize: 13, color: '#64748b' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeInactive: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  macros: { flexDirection: 'row', gap: 20, backgroundColor: '#f8fafc', borderRadius: 8, padding: 12 },
  macroItem: { alignItems: 'center' },
  macroVal: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  macroLabel: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10 },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },
  mealCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  mealType: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginLeft: 6 },
  mealName: { fontSize: 14, color: '#64748b', flex: 1 },
  mealActions: { flexDirection: 'row', gap: 14, marginLeft: 'auto' },
  mealDescription: { fontSize: 14, color: '#475569', marginBottom: 4 },
  mealDays: { fontSize: 12, color: '#94a3b8' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#0891b2', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
