import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Modal, FlatList, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createAppointment, updateAppointment } from '../api/appointments';
import { getPatients } from '../api/patients';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Agendada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const toISOLocal = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplay = (date) =>
  date.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AppointmentFormScreen({ route, navigation }) {
  const editing = route.params?.appointment ?? null;
  const initialDate = editing ? new Date(editing.datetime) : new Date();

  const [form, setForm] = useState({
    patient: editing?.patient ?? '',
    datetime: editing ? toISOLocal(new Date(editing.datetime)) : toISOLocal(initialDate),
    duration_minutes: editing ? String(editing.duration_minutes) : '60',
    reason: editing?.reason ?? '',
    notes: editing?.notes ?? '',
    status: editing?.status ?? 'scheduled',
  });

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState(editing?.patient_name ?? '');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPatients().then(res => setPatients(res.data)).catch(() => {});
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (!date) return;
    const updated = new Date(date);
    updated.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    setSelectedDate(updated);
    setShowTimePicker(true);
  };

  const onTimeChange = (event, date) => {
    setShowTimePicker(false);
    if (!date) return;
    const updated = new Date(selectedDate);
    updated.setHours(date.getHours(), date.getMinutes());
    setSelectedDate(updated);
    set('datetime', toISOLocal(updated));
  };

  const selectPatient = (patient) => {
    set('patient', patient.id);
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setPickerVisible(false);
  };

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.patient || !form.datetime) {
      Alert.alert('Error', 'Paciente y fecha son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, duration_minutes: Number(form.duration_minutes) };
      if (editing) {
        await updateAppointment(editing.id, payload);
      } else {
        await createAppointment(payload);
      }
      navigation.goBack();
    } catch (err) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Error al guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Selector de paciente */}
      <Text style={styles.label}>Paciente *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setPickerVisible(true)}>
        <Text style={form.patient ? styles.selectorText : styles.selectorPlaceholder}>
          {patientSearch || 'Seleccionar paciente...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94a3b8" />
      </TouchableOpacity>

      {/* Modal selector de paciente */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar paciente</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={24} color="#475569" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalSearch}
              placeholder="Buscar..."
              value={patientSearch}
              onChangeText={setPatientSearch}
            />
            <FlatList
              data={filteredPatients}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => selectPatient(item)}>
                  <Text style={styles.modalItemText}>{item.first_name} {item.last_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Fecha y hora *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowDatePicker(true)}>
        <Text style={form.datetime ? styles.selectorText : styles.selectorPlaceholder}>
          {form.datetime ? formatDisplay(selectedDate) : 'Seleccionar fecha y hora...'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker mode="date" value={selectedDate} onChange={onDateChange} />
      )}
      {showTimePicker && (
        <DateTimePicker mode="time" value={selectedDate} onChange={onTimeChange} is24Hour />
      )}

      <Text style={styles.label}>Duración (minutos)</Text>
      <TextInput
        style={styles.input}
        value={form.duration_minutes}
        onChangeText={v => set('duration_minutes', v)}
        keyboardType="numeric"
        placeholder="60"
      />

      <Text style={styles.label}>Motivo</Text>
      <TextInput
        style={styles.input}
        value={form.reason}
        onChangeText={v => set('reason', v)}
        placeholder="Motivo de la cita"
      />

      <Text style={styles.label}>Notas</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={form.notes}
        onChangeText={v => set('notes', v)}
        placeholder="Notas adicionales..."
        multiline
        numberOfLines={4}
      />

      {editing && (
        <>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.optionsRow}>
            {STATUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, form.status === opt.value && styles.optionActive]}
                onPress={() => set('status', opt.value)}
              >
                <Text style={[styles.optionText, form.status === opt.value && styles.optionTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{editing ? 'Guardar cambios' : 'Crear cita'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12 },
  selectorText: { fontSize: 15, color: '#0f172a' },
  selectorPlaceholder: { fontSize: 15, color: '#94a3b8' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  optionActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  optionText: { fontSize: 13, color: '#475569' },
  optionTextActive: { color: '#fff' },
  button: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 28, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '75%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  modalSearch: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 15 },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemText: { fontSize: 15, color: '#0f172a' },
});
