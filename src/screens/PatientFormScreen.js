import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { createPatient, updatePatient } from '../api/patients';

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '', phone: '',
  birth_date: '', gender: '', height_cm: '', medical_notes: '',
};

const GENDER_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
];

export default function PatientFormScreen({ route, navigation }) {
  const editing = route.params?.patient ?? null;

  const [form, setForm] = useState(
    editing
      ? {
          first_name: editing.first_name,
          last_name: editing.last_name,
          email: editing.email || '',
          phone: editing.phone || '',
          birth_date: editing.birth_date || '',
          gender: editing.gender || '',
          height_cm: editing.height_cm ? String(editing.height_cm) : '',
          medical_notes: editing.medical_notes || '',
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      Alert.alert('Error', 'Nombre y apellido son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        height_cm: form.height_cm === '' ? null : Number(form.height_cm),
        birth_date: form.birth_date === '' ? null : form.birth_date,
      };
      if (editing) {
        await updatePatient(editing.id, payload);
      } else {
        await createPatient(payload);
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
      <Text style={styles.label}>Nombre *</Text>
      <TextInput style={styles.input} value={form.first_name} onChangeText={v => set('first_name', v)} placeholder="Nombre" />

      <Text style={styles.label}>Apellido *</Text>
      <TextInput style={styles.input} value={form.last_name} onChangeText={v => set('last_name', v)} placeholder="Apellido" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={form.email} onChangeText={v => set('email', v)} placeholder="email@ejemplo.com" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={form.phone} onChangeText={v => set('phone', v)} placeholder="Teléfono" keyboardType="phone-pad" />

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TextInput style={styles.input} value={form.birth_date} onChangeText={v => set('birth_date', v)} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Género</Text>
      <View style={styles.optionsRow}>
        {GENDER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, form.gender === opt.value && styles.optionActive]}
            onPress={() => set('gender', opt.value)}
          >
            <Text style={[styles.optionText, form.gender === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Altura (cm)</Text>
      <TextInput style={styles.input} value={form.height_cm} onChangeText={v => set('height_cm', v)} placeholder="Ej: 165" keyboardType="numeric" />

      <Text style={styles.label}>Notas médicas</Text>
      <TextInput style={[styles.input, styles.textarea]} value={form.medical_notes} onChangeText={v => set('medical_notes', v)} placeholder="Notas médicas..." multiline numberOfLines={4} />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{editing ? 'Guardar cambios' : 'Crear paciente'}</Text>}
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
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  optionActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  optionText: { fontSize: 13, color: '#475569' },
  optionTextActive: { color: '#fff' },
  button: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 28, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
