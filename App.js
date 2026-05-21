import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PatientsScreen from './src/screens/PatientsScreen';
import PatientFormScreen from './src/screens/PatientFormScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import AppointmentFormScreen from './src/screens/AppointmentFormScreen';
import MealPlansScreen from './src/screens/MealPlansScreen';
import MealPlanFormScreen from './src/screens/MealPlanFormScreen';
import MealPlanDetailScreen from './src/screens/MealPlanDetailScreen';
import MealFormScreen from './src/screens/MealFormScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const PatientsStack = createNativeStackNavigator();
const AppointmentsStack = createNativeStackNavigator();
const PlansStack = createNativeStackNavigator();

const PatientsNavigator = () => (
  <PatientsStack.Navigator>
    <PatientsStack.Screen name="PatientList" component={PatientsScreen} options={{ title: 'Pacientes' }} />
    <PatientsStack.Screen name="PatientForm" component={PatientFormScreen}
      options={({ route }) => ({ title: route.params?.patient ? 'Editar paciente' : 'Nuevo paciente' })}
    />
  </PatientsStack.Navigator>
);

const AppointmentsNavigator = () => (
  <AppointmentsStack.Navigator>
    <AppointmentsStack.Screen name="AppointmentList" component={AppointmentsScreen} options={{ title: 'Citas' }} />
    <AppointmentsStack.Screen name="AppointmentForm" component={AppointmentFormScreen}
      options={({ route }) => ({ title: route.params?.appointment ? 'Editar cita' : 'Nueva cita' })}
    />
  </AppointmentsStack.Navigator>
);

const PlansNavigator = () => (
  <PlansStack.Navigator>
    <PlansStack.Screen name="MealPlanList" component={MealPlansScreen} options={{ title: 'Planes alimenticios' }} />
    <PlansStack.Screen name="MealPlanDetail" component={MealPlanDetailScreen}
      options={({ route }) => ({ title: route.params?.plan?.name || 'Plan' })}
    />
    <PlansStack.Screen name="MealPlanForm" component={MealPlanFormScreen}
      options={({ route }) => ({ title: route.params?.plan ? 'Editar plan' : 'Nuevo plan' })}
    />
    <PlansStack.Screen name="MealForm" component={MealFormScreen}
      options={({ route }) => ({ title: route.params?.meal ? 'Editar comida' : 'Nueva comida' })}
    />
  </PlansStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: '#2e7d32',
      tabBarInactiveTintColor: '#999',
      tabBarIcon: ({ color, size }) => {
        const icons = { Dashboard: 'home', Pacientes: 'people', Citas: 'calendar', Planes: 'restaurant', Perfil: 'person' };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Pacientes" component={PatientsNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Citas" component={AppointmentsNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Planes" component={PlansNavigator} options={{ headerShown: false }} />
    <Tab.Screen name="Perfil" component={ProfileScreen} />
  
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

const App = () => (
  <AuthProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </AuthProvider>
);

export default App;
