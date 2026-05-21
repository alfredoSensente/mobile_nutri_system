import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, Modal, FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createMealPlan, updateMealPlan } from '../api/mealPlans';
import { getPatients } from '../api/patients';

const toISODate = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDate = (date) =>
  date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

export default function MealPlanFormScreen({ route, navigation }) {
  const editing = route.params?.plan ?? null;

  const [form, setForm] = useState({
    patient: editing?.patient ?? '',
    name: editing?.name ?? '',
    description: editing?.description ?? '',
    plan_type: editing?.plan_type ?? 'weekly',
    rotation_days_count: editing ? String(editing.rotation_days_count ?? 7) : '7',
    calorie_goal: editing?.calorie_goal != null ? String(editing.calorie_goal) : '',
    protein_goal: editing?.protein_goal != null ? String(editing.protein_goal) : '',
    carb_goal: editing?.carb_goal != null ? String(editing.carb_goal) : '',
    fat_goal: editing?.fat_goal != null ? String(editing.fat_goal) : '',
    start_date: editing?.start_date ?? '',
    end_date: editing?.end_date ?? '',
    is_active: editing != null ? editing.is_active : true,
  });

  const [startDate, setStartDate] = useState(
    editing?.start_date ? new Date(editing.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState(
    editing?.end_date ? new Date(editing.end_date) : new Date()
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState(editing?.patient_name ?? '');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPatients().then(res => setPatients(res.data)).catch(() => {});
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const selectPatient = (patient) => {
    set('patient', patient.id);
    setPatientSearch(`${patient.first_name} ${patient.last_name}`);
    setPickerVisible(false);
  };

  const onStartDateChange = (event, date) => {
    setShowStartPicker(false);
    if (!date) return;
    setStartDate(date);
    set('start_date', toISODate(date));
  };

  const onEndDateChange = (event, date) => {
    setShowEndPicker(false);
    if (!date) return;
    setEndDate(date);
    set('end_date', toISODate(date));
  };

  const handleSave = async () => {
    if (!form.patient || !form.name.trim() || !form.start_date) {
      Alert.alert('Error', 'Paciente, nombre y fecha de inicio son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        rotation_days_count: Number(form.rotation_days_count) || 7,
        calorie_goal: form.calorie_goal === '' ? null : Number(form.calorie_goal),
        protein_goal: form.protein_goal === '' ? null : form.protein_goal,
        carb_goal: form.carb_goal === '' ? null : form.carb_goal,
        fat_goal: form.fat_goal === '' ? null : form.fat_goal,
        end_date: form.end_date === '' ? null : form.end_date,
      };
      if (editing) {
        await updateMealPlan(editing.id, payload);
      } else {
        await createMealPlan(payload);
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

      {/* Paciente */}
      <Text style={styles.label}>Paciente *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setPickerVisible(true)}>
        <Text style={form.patient ? styles.selectorText : styles.selectorPlaceholder}>
          {patientSearch || 'Seleccionar paciente...'}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#94a3b8" />
      </TouchableOpacity>

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

      {/* Nombre */}
      <Text style={styles.label}>Nombre del plan *</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={v => set('name', v)}
        placeholder="Ej. Plan semana 1"
      />

      {/* Descripción */}
      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={form.description}
        onChangeText={v => set('description', v)}
        placeholder="Descripción opcional..."
        multiline
        numberOfLines={3}
      />

      {/* Tipo de plan */}
      <Text style={styles.label}>Tipo de plan</Text>
      <View style={styles.optionsRow}>
        {[
          { value: 'weekly', label: 'Semanal (lun–dom)' },
          { value: 'rotating', label: 'Por días (Día 1, Día 2…)' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.option,
              form.plan_type === opt.value && styles.optionActive,
              !!editing && styles.optionDisabled,
            ]}
            onPress={() => !editing && set('plan_type', opt.value)}
          >
            <Text style={[styles.optionText, form.plan_type === opt.value && styles.optionTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!!editing && (
        <Text style={styles.hint}>El tipo no puede cambiarse después de crear el plan.</Text>
      )}

      {form.plan_type === 'rotating' && !editing && (
        <>
          <Text style={styles.label}>Número de días en la rotación (2–7)</Text>
          <TextInput
            style={styles.input}
            value={form.rotation_days_count}
            onChangeText={v => set('rotation_days_count', v)}
            keyboardType="numeric"
            placeholder="7"
          />
        </>
      )}

      {/* Metas nutricionales */}
      <Text style={styles.label}>Calorías/día</Text>
      <TextInput
        style={styles.input}
        value={form.calorie_goal}
        onChangeText={v => set('calorie_goal', v)}
        keyboardType="numeric"
        placeholder="Ej. 1800"
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Proteína (g)</Text>
          <TextInput style={styles.input} value={form.protein_goal} onChangeText={v => set('protein_goal', v)} keyboardType="numeric" placeholder="Ej. 120" />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Carbohidratos (g)</Text>
          <TextInput style={styles.input} value={form.carb_goal} onChangeText={v => set('carb_goal', v)} keyboardType="numeric" placeholder="Ej. 200" />
        </View>
      </View>

      <Text style={styles.label}>Grasas (g)</Text>
      <TextInput
        style={styles.input}
        value={form.fat_goal}
        onChangeText={v => set('fat_goal', v)}
        keyboardType="numeric"
        placeholder="Ej. 60"
      />

      {/* Fecha de inicio */}
      <Text style={styles.label}>Fecha de inicio *</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowStartPicker(true)}>
        <Text style={form.start_date ? styles.selectorText : styles.selectorPlaceholder}>
          {form.start_date ? formatDate(startDate) : 'Seleccionar fecha...'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker mode="date" value={startDate} onChange={onStartDateChange} />
      )}

      {/* Fecha de fin */}
      <Text style={styles.label}>Fecha de fin (opcional)</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setShowEndPicker(true)}>
        <Text style={form.end_date ? styles.selectorText : styles.selectorPlaceholder}>
          {form.end_date ? formatDate(endDate) : 'Sin fecha de fin...'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
      </TouchableOpacity>
      {form.end_date !== '' && (
        <TouchableOpacity onPress={() => set('end_date', '')}>
          <Text style={styles.clearDate}>✕ Quitar fecha de fin</Text>
        </TouchableOpacity>
      )}
      {showEndPicker && (
        <DateTimePicker mode="date" value={endDate} onChange={onEndDateChange} />
      )}

      {/* Estado (solo al editar) */}
      {editing && (
        <>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.optionsRow}>
            {[
              { value: true, label: 'Activo' },
              { value: false, label: 'Inactivo' },
            ].map(opt => (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.option, form.is_active === opt.value && styles.optionActive]}
                onPress={() => set('is_active', opt.value)}
              >
                <Text style={[styles.optionText, form.is_active === opt.value && styles.optionTextActive]}>
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
          : <Text style={styles.buttonText}>{editing ? 'Guardar cambios' : 'Crear plan'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 14 },
  hint: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  selector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12 },
  selectorText: { fontSize: 15, color: '#0f172a' },
  selectorPlaceholder: { fontSize: 15, color: '#94a3b8' },
  clearDate: { fontSize: 13, color: '#ef4444', marginTop: 6 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
  optionActive: { backgroundColor: '#0891b2', borderColor: '#0891b2' },
  optionDisabled: { opacity: 0.5 },
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
