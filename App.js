import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";

// Crear el Tab Navigator
const Tab = createBottomTabNavigator();

// Importar los componentes de las pantallas
import MisPresupuestosScreen from "./screens/MisPresupuestosScreen";


function GastosScreen() {
  return (
    <View style={styles.screen}>
      <Text>Gastos</Text>
    </View>
  );
}


export default function App() {

  const crearDbsiNoExiste = async (db) => {
    // Crear la tabla de presupuestos si no existe
    const presupuestos = await db.execAsync(`
      CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ingreso REAL NOT NULL,
        categorias TEXT NOT NULL
      );
    `);

    // Crear la tabla de gastos si no existe
    const gastos = await db.execAsync(`
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
    <SQLiteProvider databaseName="presupuestos.db" onInit={crearDbsiNoExiste}> 
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Mis Presupuestos" component={MisPresupuestosScreen} />
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
