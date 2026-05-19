import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getAppointments } from '../api/appointments';
import { getPatients } from '../api/patients';

const STATUS_LABELS = {
  scheduled: 'Agendada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS = {
  scheduled: '#0891b2',
  completed: '#16a34a',
  cancelled: '#d32f2f',
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          getPatients(),
          getAppointments({ status: 'scheduled' }),
        ]);
        setPatients(pRes.data);
        const upcoming = aRes.data
          .filter(a => new Date(a.datetime) >= new Date())
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
          .slice(0, 5);
        setAppointments(upcoming);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Saludo */}
      <Text style={styles.greeting}>Hola, {user?.first_name} 👋</Text>
      <Text style={styles.subtitle}>Aquí tienes un resumen de tu consulta</Text>

      {/* Tarjetas de resumen */}
      <View style={styles.cards}>
        <View style={[styles.card, { borderLeftColor: '#4f46e5' }]}>
          <Ionicons name="people" size={28} color="#4f46e5" />
          <Text style={styles.cardNumber}>{patients.length}</Text>
          <Text style={styles.cardLabel}>Pacientes</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#0891b2' }]}>
          <Ionicons name="calendar" size={28} color="#0891b2" />
          <Text style={styles.cardNumber}>{appointments.length}</Text>
          <Text style={styles.cardLabel}>Citas próximas</Text>
        </View>
      </View>

      {/* Próximas citas */}
      <Text style={styles.sectionTitle}>Próximas citas</Text>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>No hay citas próximas agendadas</Text>
      ) : (
        appointments.map(a => (
          <View key={a.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentPatient}>{a.patient_name}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[a.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[a.status] }]}>
                  {STATUS_LABELS[a.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.appointmentDate}>
              {new Date(a.datetime).toLocaleString('es-MX', {
                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
            {a.reason ? <Text style={styles.appointmentReason}>{a.reason}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  cards: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, elevation: 1 },
  cardNumber: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginTop: 8 },
  cardLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
  appointmentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 1 },
  appointmentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  appointmentPatient: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  appointmentDate: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  appointmentReason: { fontSize: 12, color: '#94a3b8' },
});
