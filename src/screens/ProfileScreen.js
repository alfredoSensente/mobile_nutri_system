import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.first_name} {user?.last_name}</Text>
      <Text style={styles.role}>{user?.role}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginBottom: 8 },
  role: { fontSize: 16, color: '#666', marginBottom: 4, textTransform: 'capitalize' },
  email: { fontSize: 14, color: '#999', marginBottom: 40 },
  button: { backgroundColor: '#d32f2f', padding: 14, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
