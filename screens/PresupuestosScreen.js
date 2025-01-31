import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";

export default function PresupuestosScreen({ navigation }) {
  const [presupuestos, setPresupuestos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoPresupuesto, setNuevoPresupuesto] = useState({
    id: null,
    nombre: "",
    ingreso: "",
    categorias: [],
  });

  const [open, setOpen] = useState(false);
  const [selectedCategorias, setSelectedCategorias] = useState([]);

  const db = SQLite.useSQLiteContext();

  const obtenerPresupuestos = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT p.id, p.nombre, p.ingreso, 
               GROUP_CONCAT(c.nombre, ', ') AS categorias
        FROM presupuestos p
        LEFT JOIN categorias c ON INSTR(p.categorias, c.id) > 0
        GROUP BY p.id
      `);
      setPresupuestos(result);
    } catch (error) {
      console.error("Error al obtener presupuestos:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const result = await db.getAllAsync("SELECT id, nombre FROM categorias");
      const formattedCategories = result.map((cat) => ({
        label: cat.nombre,
        value: cat.id,
      }));
      setCategorias(formattedCategories);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      obtenerPresupuestos();
      obtenerCategorias();
    }, [])
  );

  const btnGuardar = async () => {
    if (
      !nuevoPresupuesto.nombre ||
      !nuevoPresupuesto.ingreso ||
      selectedCategorias.length === 0
    ) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const categoriasString = selectedCategorias.join(",");
      if (nuevoPresupuesto.id) {
        await db.runAsync(
          "UPDATE presupuestos SET nombre = ?, ingreso = ?, categorias = ? WHERE id = ?",
          [
            nuevoPresupuesto.nombre,
            nuevoPresupuesto.ingreso,
            categoriasString,
            nuevoPresupuesto.id,
          ]
        );
      } else {
        await db.runAsync(
          "INSERT INTO presupuestos (nombre, ingreso, categorias) VALUES (?, ?, ?)",
          [nuevoPresupuesto.nombre, nuevoPresupuesto.ingreso, categoriasString]
        );
      }

      setModalVisible(false);
      setNuevoPresupuesto({
        id: null,
        nombre: "",
        ingreso: "",
        categorias: [],
      });
      setSelectedCategorias([]);
      await obtenerPresupuestos();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "No se pudo guardar/actualizar el presupuesto.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={presupuestos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.presupuestoItem}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.ingreso}>Ingreso: ${item.ingreso}</Text>
            <Text style={styles.categorias}>Categorías: {item.categorias}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.botonFlotante}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus-circle" size={50} color="black" />
      </TouchableOpacity>

      {/* Modal para agregar/editar presupuesto */}

      <Modal visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss(); // Ocultar teclado
            setOpen(false); // Cerrar dropdown
          }}
        >
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
              value={nuevoPresupuesto.ingreso}
              onChangeText={(text) =>
                setNuevoPresupuesto({ ...nuevoPresupuesto, ingreso: text })
              }
            />
            <DropDownPicker
              open={open}
              value={selectedCategorias}
              items={categorias}
              setOpen={setOpen}
              setValue={setSelectedCategorias}
              setItems={setCategorias}
              multiple={true}
              mode="BADGE"
              placeholder="Selecciona categorías"
              placeholderStyle={{ color: "#666" }}
              style={styles.dropdown}
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
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  presupuestoItem: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginVertical: 8,
    borderRadius: 8,
  },
  nombre: { fontSize: 16, fontWeight: "bold" },
  ingreso: { fontSize: 14, color: "#555" },
  categorias: { fontSize: 14, color: "#777" },
  botonFlotante: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  modalContainer: { flex: 1, justifyContent: "center", padding: 16 },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  dropdown: {
    marginBottom: 20,
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
    marginRight: 8,
    alignItems: "center",
  },
  botonCancelar: {
    backgroundColor: "#d9534f",
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  botonTexto: { color: "white", fontSize: 18 },
});
