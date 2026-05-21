import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getMealPlans, deleteMealPlan } from '../api/mealPlans';

export default function MealPlansScreen({ navigation }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMealPlans();
      setPlans(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleDelete = (plan) => {
    Alert.alert(
      'Eliminar plan',
      `¿Eliminar "${plan.name}" de ${plan.patient_name}? También se eliminarán todas sus comidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteMealPlan(plan.id);
              load();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el plan');
            }
          },
        },
      ]
    );
  };

  const renderPlan = ({ item: plan }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MealPlanDetail', { plan })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.patientName}>{plan.patient_name}</Text>
        </View>
        <View style={[styles.badge, plan.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{plan.is_active ? 'Activo' : 'Inactivo'}</Text>
        </View>
      </View>

      <View style={styles.cardInfo}>
        {plan.calorie_goal ? (
          <Text style={styles.infoText}>
            <Ionicons name="flame-outline" size={13} color="#64748b" /> {plan.calorie_goal} kcal/día
          </Text>
        ) : null}
        <Text style={styles.infoText}>
          <Ionicons name="calendar-outline" size={13} color="#64748b" /> Desde {plan.start_date}
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => navigation.navigate('MealPlanForm', { plan })}>
          <Ionicons name="pencil-outline" size={20} color="#0891b2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(plan)}>
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={plans}
          keyExtractor={item => String(item.id)}
          renderItem={renderPlan}
          contentContainerStyle={plans.length === 0 ? styles.emptyContainer : styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay planes alimenticios</Text>}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('MealPlanForm', {})}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16, paddingBottom: 80 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardLeft: { flex: 1 },
  planName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  patientName: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 8 },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeInactive: { backgroundColor: '#f1f5f9' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  cardInfo: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  infoText: { fontSize: 13, color: '#64748b' },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#2e7d32', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
