import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SQLiteProvider } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

// Importar las pantallas
import MenuStackScreen from "./MenuStackScreen";
import HomeScreen from "./screens/HomeScreen";
import GastosScreen from "./screens/GastosScreen";

const Tab = createBottomTabNavigator();

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

    // Crear la tabla de categorías si no existe
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS categorias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          monto TEXT NOT NULL
      );
    `);

    // Crear la tabla de gastos si no existe
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL,
      presupuesto_id INTEGER NOT NULL,
      concepto TEXT NOT NULL,
      monto TEXT NOT NULL,
      descripcion TEXT,
      fecha TEXT NOT NULL CHECK (fecha LIKE '__/__/____'),
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id)
      );
    `);

    //Crear tabla presupuesto_categoria si no existe
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS presupuesto_categoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        presupuesto_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        FOREIGN KEY (presupuesto_id) REFERENCES presupuestos(id),
        FOREIGN KEY (categoria_id) REFERENCES categorias(id)
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
