import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { SQLiteProvider, openDatabaseAsync, execAsync } from "expo-sqlite";
import { SQLiteProvider } from "expo-sqlite";
import * as SQLite from "expo-sqlite";
import { createDrawerNavigator } from "@react-navigation/drawer";

// Crear el Tab Navigator
const Tab = createBottomTabNavigator();

// Crear el Drawer Navigator
const Drawer = createDrawerNavigator();

// Importar los componentes de las pantallas
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import GastosScreen from "./screens/GastosScreen";

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
        <Tab.Navigator initialRouteName="Inicio">
          <Tab.Screen name="Inicio" component={HomeScreen} />
          <Tab.Screen name="Menú" component={MenuScreen} />
          <Tab.Screen name="Gastos" component={GastosScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
