import React, { useState } from "react";
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

const CategoriasScreen = () => {
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    id: null,
    nombre: "",
    monto: "",
  });


  const db = SQLite.useSQLiteContext();

  const obtenerCategorias = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT id, nombre, monto FROM categorias"
      );
      setCategorias(result);
    } catch (error) {
      console.error("Error al obtener categorias:", error);
    }
  };

  // Obtener las categorias de la base de datos
  useFocusEffect(
    React.useCallback(() => {
      obtenerCategorias();
    }, [])
  );

  // Agregar un categoria a la base de datos
  const btnGuardar = async () => {
    if (
      !nuevaCategoria.nombre ||
      !nuevaCategoria.monto
    ) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      if (nuevaCategoria.id) {
        await db.runAsync(
          "UPDATE categorias SET nombre = ?, monto = ? WHERE id = ?",
          [
            nuevaCategoria.nombre,
            nuevaCategoria.monto,
            nuevaCategoria.id,
          ]
        );
        console.log("Categoria actualizada correctamente");
      } else {
        await db.runAsync(
          "INSERT INTO categorias (nombre, monto) VALUES (?, ?)",
          [
            nuevaCategoria.nombre,
            nuevaCategoria.monto,
          ]
        );
        console.log("Categoria guardado correctamente");
      }

      setModalVisible(false);
      setNuevaCategoria({
        id: null,
        nombre: "",
        monto: "",
      });
      await obtenerCategorias();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "No se pudo guardar/actualizar la categoria.");
    }
  };

  //Eliminar categoria
  const eliminarCategoria = (id) => {
    Alert.alert(
      "Eliminar Categoría",
      "¿Estás seguro que deseas eliminar esta categoría?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM categorias WHERE id = ?", [id]);
              console.log("Categoría eliminada correctamente");
              await obtenerCategorias();
            } catch (error) {
              console.error("Error al eliminar categoría:", error);
            }
          },
        },
      ]
    );
  };

  // Editar categoría de la base de datos
  const editarCategoria = (id) => {
    setModalVisible(true);
    const categoria = categorias.find((p) => p.id === id);
    setNuevaCategoria({
      id: categoria.id,
      nombre: categoria.nombre,
      monto: categoria.monto,
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Listado de categorias */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.categoriaItem}>
            <TouchableOpacity style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.monto}>Monto: ${item.monto}</Text>
            </TouchableOpacity>
            <View style={styles.iconosContainer}>
              <TouchableOpacity onPress={() => editarCategoria(item.id)}>
                <Icon
                  name="pencil"
                  size={20}
                  color="#007bff"
                  style={styles.icono}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarCategoria(item.id)}>
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
            value={nuevaCategoria.nombre}
            onChangeText={(text) =>
              setNuevaCategoria({ ...nuevaCategoria, nombre: text })
            }
          />
          <TextInput
            placeholder="Monto"
            placeholderTextColor={"#666"}
            style={styles.input}
            keyboardType="numeric"
            value={nuevaCategoria.monto.toString()}
            onChangeText={(text) =>
              setNuevaCategoria({ ...nuevaCategoria, monto: text })
            }
          />
          <View style={styles.botonContainer}>
            <TouchableOpacity style={styles.botonGuardar} onPress={btnGuardar}>
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={() => {
                setModalVisible(false);
                setNuevaCategoria({
                  id: null,
                  nombre: "",
                  monto: "",
                });
              }}
            >
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  nombre: { fontSize: 16, fontWeight: "bold" },
  monto: { fontSize: 14, color: "#555" },
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

export default CategoriasScreen;
