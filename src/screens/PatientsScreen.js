import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getPatients, deletePatient } from '../api/patients';

const GENDER_LABELS = { male: 'Masculino', female: 'Femenino', other: 'Otro' };

export default function PatientsScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los pacientes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchPatients(); }, []));

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (patient) => {
    Alert.alert(
      'Eliminar paciente',
      `¿Seguro que quieres eliminar a ${patient.first_name} ${patient.last_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await deletePatient(patient.id);
              fetchPatients();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el paciente');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar paciente..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay pacientes</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PatientDetail', { patient: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.first_name[0]}{item.last_name[0]}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.detail}>{GENDER_LABELS[item.gender] || '—'} · {item.phone || 'Sin teléfono'}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => navigation.navigate('PatientForm', { patient: item })}>
                <Ionicons name="create-outline" size={20} color="#4f46e5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 12 }}>
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Botón flotante para crear */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PatientForm', { patient: null })}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 10, paddingHorizontal: 12, elevation: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15 },
  list: { paddingHorizontal: 16, paddingBottom: 80 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  detail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#2e7d32', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});
