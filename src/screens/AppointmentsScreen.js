import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getAppointments, deleteAppointment } from '../api/appointments';

const STATUS_LABELS = { scheduled: 'Agendada', completed: 'Completada', cancelled: 'Cancelada' };
const STATUS_COLORS = { scheduled: '#0891b2', completed: '#16a34a', cancelled: '#d32f2f' };
const FILTERS = [
  { label: 'Todas', value: '' },
  { label: 'Agendadas', value: 'scheduled' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Canceladas', value: 'cancelled' },
];

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async (status) => {
    setLoading(true);
    try {
      const params = status ? { status } : {};
      const res = await getAppointments(params);
      setAppointments(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las citas');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchAppointments(statusFilter); }, [statusFilter]));

  const handleDelete = (appt) => {
    Alert.alert(
      'Eliminar cita',
      `¿Seguro que quieres eliminar la cita de ${appt.patient_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(appt.id);
              fetchAppointments(statusFilter);
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la cita');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, statusFilter === f.value && styles.filterChipActive]}
            onPress={() => setStatusFilter(f.value)}
          >
            <Text style={[styles.filterText, statusFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#2e7d32" /></View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hay citas</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{item.patient_name}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text style={styles.datetime}>
                {new Date(item.datetime).toLocaleString('es-MX', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </Text>
              {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
              <Text style={styles.duration}>{item.duration_minutes} min</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('AppointmentForm', { appointment: item })}
                >
                  <Ionicons name="create-outline" size={18} color="#4f46e5" />
                  <Text style={[styles.actionText, { color: '#4f46e5' }]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                  <Text style={[styles.actionText, { color: '#d32f2f' }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AppointmentForm', { appointment: null })}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filters: { flexDirection: 'row', padding: 12, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  filterChipActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  filterText: { fontSize: 13, color: '#475569' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  patientName: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  datetime: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  reason: { fontSize: 13, color: '#475569', marginBottom: 2 },
  duration: { fontSize: 12, color: '#94a3b8', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 13, fontWeight: '500' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#2e7d32', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
