import { createStackNavigator } from "@react-navigation/stack";
import PresupuestosScreen from "./screens/PresupuestosScreen";

const Stack = createStackNavigator();

function MenuStackScreen() {
  return (
    <Stack.Navigator>
      {/* Pantalla principal del menú */}
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        screenOptions={{
        headerShown: false,
        }}
      />

      <Stack.Screen name="Presupuestos" component={PresupuestosScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="HelpScreen" component={HelpScreen} />
      <Stack.Screen name="ShareScreen" component={ShareScreen} />
    </Stack.Navigator>
  );
}
