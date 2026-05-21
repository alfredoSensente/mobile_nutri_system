import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { createMeal, updateMeal } from '../api/mealPlans';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'morning_snack', label: 'Col. matutina' },
  { value: 'lunch', label: 'Comida' },
  { value: 'afternoon_snack', label: 'Col. vespertina' },
  { value: 'dinner', label: 'Cena' },
  { value: 'other', label: 'Otro' },
];

const WEEKLY_DAYS = [
  { value: 'mon', label: 'Lun' },
  { value: 'tue', label: 'Mar' },
  { value: 'wed', label: 'Mié' },
  { value: 'thu', label: 'Jue' },
  { value: 'fri', label: 'Vie' },
  { value: 'sat', label: 'Sáb' },
  { value: 'sun', label: 'Dom' },
];

const ALL_ROTATION_DAYS = [
  { value: 'd1', label: 'Día 1' },
  { value: 'd2', label: 'Día 2' },
  { value: 'd3', label: 'Día 3' },
  { value: 'd4', label: 'Día 4' },
  { value: 'd5', label: 'Día 5' },
  { value: 'd6', label: 'Día 6' },
  { value: 'd7', label: 'Día 7' },
];

export default function MealFormScreen({ route, navigation }) {
  const { planId, planType, rotationDaysCount, meal: editing } = route.params;

  const [form, setForm] = useState({
    meal_type: editing?.meal_type ?? 'breakfast',
    name: editing?.name ?? '',
    description: editing?.description ?? '',
    days: editing?.days ?? [],
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const availableDays = planType === 'rotating'
    ? ALL_ROTATION_DAYS.slice(0, Number(rotationDaysCount) || 7)
    : WEEKLY_DAYS;

  const toggleDay = (day) => {
    setForm(prev => {
      const days = prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day];
      return { ...prev, days };
    });
  };

  const handleSave = async () => {
    if (!form.description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateMeal(planId, editing.id, form);
      } else {
        await createMeal(planId, form);
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

  const dayLabel = form.days.length === 0
    ? 'Aplica todos los días'
    : `Aplica: ${form.days.map(d => availableDays.find(a => a.value === d)?.label || d).join(', ')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <Text style={styles.label}>Tipo de comida</Text>
      <View style={styles.optionsRow}>
        {MEAL_TYPES.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, form.meal_type === opt.value && styles.optionActive]}
            onPress={() => set('meal_type', opt.value)}
          >
            <Text style={[styles.optionText, form.meal_type === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Nombre (opcional)</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={v => set('name', v)}
        placeholder="Ej. Avena con fruta"
      />

      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={form.description}
        onChangeText={v => set('description', v)}
        placeholder="Describe los alimentos y cantidades..."
        multiline
        numberOfLines={5}
      />

      <Text style={styles.label}>Días que aplica (vacío = todos los días)</Text>
      <View style={styles.daysRow}>
        {availableDays.map(day => (
          <TouchableOpacity
            key={day.value}
            style={[styles.dayChip, form.days.includes(day.value) && styles.dayChipActive]}
            onPress={() => toggleDay(day.value)}
          >
            <Text style={[styles.dayText, form.days.includes(day.value) && styles.dayTextActive]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>{dayLabel}</Text>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>{editing ? 'Guardar cambios' : 'Agregar comida'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 14 },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { height: 120, textAlignVertical: 'top' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  optionActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  optionText: { fontSize: 13, color: '#475569' },
  optionTextActive: { color: '#fff' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  dayChipActive: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  dayText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  dayTextActive: { color: '#fff' },
  button: { backgroundColor: '#2e7d32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 28, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
