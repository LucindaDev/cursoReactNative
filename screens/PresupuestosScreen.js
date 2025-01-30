import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";


export default function PresupuestosScreen({ navigation }) {
  const [presupuestos, setPresupuestos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState({
    id: null,
    nombre: "",
    ingreso: "",
    categorias: "",
  });

  const db = SQLite.useSQLiteContext();
  
  
  const obtenerPresupuestos = async () => {
    try {
      const result = await db.getAllAsync("SELECT id, nombre, ingreso, categorias FROM presupuestos");
      setPresupuestos(result);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
    }
  };

  // Obtener los presupuestos de la base de datos
  useFocusEffect(
    React.useCallback(() => {
      obtenerPresupuestos();
    }, [])
  );

  // Agregar un presupuesto a la base de datos
  const btnGuardar = async () => {
    if (
      !nuevoPresupuesto.nombre ||
      !nuevoPresupuesto.ingreso ||
      !nuevoPresupuesto.categorias
    ) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      if (nuevoPresupuesto.id) {
        await db.runAsync(
          "UPDATE presupuestos SET nombre = ?, ingreso = ?, categorias = ? WHERE id = ?",
          [
            nuevoPresupuesto.nombre,
            nuevoPresupuesto.ingreso,
            nuevoPresupuesto.categorias,
            nuevoPresupuesto.id,
          ]
        );
        console.log("Presupuesto actualizado correctamente");
      } else {
        await db.runAsync(
          "INSERT INTO presupuestos (nombre, ingreso, categorias) VALUES (?, ?, ?)",
          [
            nuevoPresupuesto.nombre,
            nuevoPresupuesto.ingreso,
            nuevoPresupuesto.categorias,
          ]
        );
        console.log("Presupuesto guardado correctamente");
      }

      setModalVisible(false);
      setNuevoPresupuesto({ id: null, nombre: "", ingreso: "", categorias: "" });
      await obtenerPresupuestos();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "No se pudo guardar/actualizar el presupuesto.");
    }
  };

  //Eliminar un presupuesto de la base de datos
  const eliminarPresupuesto = (id) => {
    Alert.alert(
      "Eliminar presupuesto",
      "¿Estás seguro que deseas eliminar este presupuesto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM presupuestos WHERE id = ?", [id]);
              console.log("Presupuesto eliminado correctamente");
              await obtenerPresupuestos();
            } catch (error) {
              console.error("Error al eliminar presupuesto:", error);
            }
          },
        },
      ]
    );
  };

  // Editar un presupuesto de la base de datos
  const editarPresupuesto = (id) => {
    setModalVisible(true);
    const presupuesto = presupuestos.find((p) => p.id === id);
    setNuevoPresupuesto({
      id: presupuesto.id,
      nombre: presupuesto.nombre,
      ingreso: presupuesto.ingreso.toString(), // Convertir ingreso a string
      categorias: presupuesto.categorias,
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Listado de Presupuestos */}
      <FlatList
        data={presupuestos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.presupuestoItem}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate("DetallesPresupuesto", {
                  presupuesto: item,
                })
              }
            >
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.ingreso}>Ingreso: ${item.ingreso}</Text>
            </TouchableOpacity>
            <View style={styles.iconosContainer}>
              <TouchableOpacity onPress={() => editarPresupuesto(item.id)}>
                <Icon
                  name="pencil"
                  size={20}
                  color="#007bff"
                  style={styles.icono}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarPresupuesto(item.id)}>
                <Icon
                  name="trash"
                  size={20}
                  color="#d9534f"
                  style={styles.icono}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Botón flotante */}
      <TouchableOpacity
        style={styles.botonFlotante}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome name="plus-circle" size={50} color="black" />
      </TouchableOpacity>

      {/* Modal de creación */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Nombre"
            placeholderTextColor={"#666"}
            style={styles.input}
            value={nuevoPresupuesto.nombre}
            onChangeText={(text) =>
              setNuevoPresupuesto({ ...nuevoPresupuesto, nombre: text })
            }
          />
          <TextInput
            placeholder="Ingreso Mensual"
            placeholderTextColor={"#666"}
            style={styles.input}
            keyboardType="numeric"
            value={nuevoPresupuesto.ingreso.toString()}
            onChangeText={(text) =>
              setNuevoPresupuesto({ ...nuevoPresupuesto, ingreso: text })
            }
          />
          <TextInput
            placeholder="Categorías (separadas por comas)"
            placeholderTextColor={"#666"}
            style={styles.input}
            value={nuevoPresupuesto.categorias}
            onChangeText={(text) =>
              setNuevoPresupuesto({ ...nuevoPresupuesto, categorias: text })
            }
          />
          <View style={styles.botonContainer}>
            <TouchableOpacity
              style={styles.botonGuardar}
              onPress={btnGuardar}
            >
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  presupuestoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  nombre: { fontSize: 16, fontWeight: "bold" },
  ingreso: { fontSize: 14, color: "#555" },
  iconosContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icono: {
    marginHorizontal: 8,
  },
  botonFlotante: {
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  botonFlotante2: {
    position: "absolute",
    bottom: 70,
    right: 16,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  botonTexto: { color: "white", fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: "center", padding: 16 },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  botonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  botonGuardar: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 8,
  },
  botonCancelar: {
    backgroundColor: "#d9534f",
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
});
