import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SQLiteProvider } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";

// Importar las pantallas
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import GastosScreen from "./screens/GastosScreen";
import PresupuestosScreen from "./screens/PresupuestosScreen";

const Tab = createBottomTabNavigator();
const MenuStack = createStackNavigator();

function MenuStackScreen() {
  return (
    <MenuStack.Navigator>
      <MenuStack.Screen name="Menu" component={MenuScreen} />
      <MenuStack.Screen
        name="PresupuestosScreen"
        component={PresupuestosScreen}
        options={{ title: "Presupuestos" }}
      />
    </MenuStack.Navigator>
  );
}

export default function App() {
  // Abrir o crear la base de datos

  const crearDbsiNoExiste = async (db) => {
    // Crear la tabla de presupuestos si no existe
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ingreso REAL NOT NULL,
        categorias TEXT NOT NULL
      );
    `);

    // Crear la tabla de gastos si no existe
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS gastos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        presupuesto_id INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        monto REAL NOT NULL,
        fecha TEXT NOT NULL,
        FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id)
      );
    `);
  };

  return (
    <SQLiteProvider databaseName="presupuestosdb.db" onInit={crearDbsiNoExiste}>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Inicio") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Menu") {
              iconName = focused ? "menu" : "menu-outline";
            } else if (route.name === "Gastos") {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
          headerShown: false, 
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Menu" component={MenuStackScreen} />
        <Tab.Screen name="Gastos" component={GastosScreen} />
      </Tab.Navigator>
    </NavigationContainer>
    </SQLiteProvider>
  );
}
