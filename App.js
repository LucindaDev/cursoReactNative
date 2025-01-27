import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SQLiteProvider } from "expo-sqlite";

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


// Crear la base de datos si no existe
const crearDbsiNoExiste = async (db) => {
  db.transaction((tx) => {
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS presupuestos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, ingreso REAL, categorias TEXT)"
    );
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS gastos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, cantidad REAL, categoria TEXT)"
    );
  });
};

export default function App() {
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
