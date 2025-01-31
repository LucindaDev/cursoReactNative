import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const MenuScreen = ({ navigation }) => {
  const options = [
    { name: "Mi perfil", screen: "Profile" }, // Nombre de la pantalla a la que redirige
    { name: "Presupuestos", screen: "PresupuestosScreen" },
    { name: "Categorías", screen: "CategoriasScreen" },
    { name: "Configuración", screen: "Settings" },
    { name: "Ayuda", screen: "Help" },
    { name: "Compartir", screen: "Share" },
  ];

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => navigation.navigate(option.screen)}
        >
          <Text style={styles.optionText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
  },
});

export default MenuScreen;
