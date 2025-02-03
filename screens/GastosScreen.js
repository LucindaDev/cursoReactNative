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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GastosScreen() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    nombre: "",
    monto: "",
    lugarCompra: "",
    metodoPago: "",
    descripcion: "",
    fecha: new Date(), // Aseguramos que sea una fecha válida
    categoria: null,
    recurrente: false,
    frecuencia: "",
    unidadFrecuencia: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openMetodoPago, setOpenMetodoPago] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openFrecuencia, setOpenFrecuencia] = useState(false); // Estado para el Dropdown de frecuencia

  const [metodoPagoOptions] = useState([
    { label: "Efectivo", value: "Efectivo" },
    { label: "Crédito", value: "Credito" },
    { label: "Débito", value: "Debito" },
  ]);

  const [frecuenciaOptions] = useState([
    { label: "Días", value: "d" },
    { label: "Semanas", value: "s" },
    { label: "Meses", value: "m" },
  ]);

  const db = SQLite.useSQLiteContext();

  const obtenerGastos = async () => {
    try {
      const result = await db.getAllAsync("SELECT * FROM gastos");
      setGastos(result);
    } catch (error) {
      console.error("Error al obtener gastos:", error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || nuevoGasto.fecha;
    setShowDatePicker(false);
    setNuevoGasto({ ...nuevoGasto, fecha: currentDate });
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
      obtenerGastos();
      obtenerCategorias();
    }, [])
  );

  const btnGuardar = async () => {
    if (
      !nuevoGasto.nombre ||
      !nuevoGasto.monto ||
      !nuevoGasto.categoria ||
      !nuevoGasto.metodoPago ||
      !nuevoGasto.fecha
    ) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }
    try {
      // Aquí iría la lógica para guardar el gasto, incluyendo los campos de frecuencia si es recurrente
      await db.runAsync(
        "INSERT INTO gastos (nombre, monto, metodoPago, lugarCompra, descripcion, fecha, categoria, recurrente, frecuencia, unidadFrecuencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          nuevoGasto.nombre,
          nuevoGasto.monto,
          nuevoGasto.metodoPago,
          nuevoGasto.lugarCompra,
          nuevoGasto.descripcion,
          nuevoGasto.fecha,
          nuevoGasto.categoria,
          nuevoGasto.recurrente,
          nuevoGasto.frecuencia,
          nuevoGasto.unidadFrecuencia,
        ]
      );
      setModalVisible(false);
      setNuevoGasto({
        nombre: "",
        monto: "",
        lugarCompra: "",
        metodoPago: "",
        descripcion: "",
        fecha: "",
        categoria: null,
        recurrente: false,
        frecuencia: "",
        unidadFrecuencia: "",
      });
      await obtenerGastos();
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      Alert.alert("Error", "No se pudo guardar el gasto.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gastoItem}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.monto}>${item.monto}</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.botonFlotante}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="plus-circle" size={50} color="black" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss(); // Ocultar teclado
            setOpenMetodoPago(false); // Cerrar dropdown metodoPago
            setOpenCategoria(false); // Cerrar dropdown categoria
            setOpenFrecuencia(false); // Cerrar dropdown frecuencia
          }}
        >
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Nombre del gasto"
              placeholderTextColor={"#666"}
              style={styles.input}
              value={nuevoGasto.nombre}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, nombre: text })
              }
            />
            <DropDownPicker
              open={openMetodoPago}
              value={nuevoGasto.metodoPago}
              items={metodoPagoOptions}
              setOpen={setOpenMetodoPago}
              setValue={(value) =>
                setNuevoGasto({ ...nuevoGasto, metodoPago: value })
              }
              placeholder="Método de pago"
              placeholderStyle={{ color: "#666" }}
              style={styles.dropdown}
              zIndex={5000}
              zIndexInverse={1000}
            />
            <TextInput
              placeholder="Monto"
              placeholderTextColor={"#666"}
              style={styles.input}
              keyboardType="numeric"
              value={nuevoGasto.monto}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, monto: text })
              }
            />
            <TextInput
              placeholder="Lugar de compra"
              placeholderTextColor={"#666"}
              style={styles.input}
              value={nuevoGasto.lugarCompra}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, lugarCompra: text })
              }
            />
            <TextInput
              placeholder="Descripción"
              placeholderTextColor={"#666"}
              style={styles.input}
              value={nuevoGasto.descripcion}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, descripcion: text })
              }
            />
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {nuevoGasto.fecha instanceof Date
                  ? nuevoGasto.fecha.toLocaleDateString()
                  : "Selecciona una fecha"}
              </Text>
              <Icon name="calendar" size={20} color="black" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={nuevoGasto.fecha}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <DropDownPicker
              open={openCategoria}
              value={nuevoGasto.categoria}
              items={categorias}
              setOpen={setOpenCategoria}
              setValue={(value) =>
                setNuevoGasto({ ...nuevoGasto, categoria: value })
              }
              placeholder="Categoría"
              placeholderStyle={{ color: "#666" }}
              style={styles.dropdown}
              zIndex={4000}
              zIndexInverse={900}
            />

            {/* Checkbox para gasto recurrente */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() =>
                  setNuevoGasto({
                    ...nuevoGasto,
                    recurrente: !nuevoGasto.recurrente,
                  })
                }
              >
                <Icon
                  name={nuevoGasto.recurrente ? "check-square" : "square-o"}
                  size={20}
                  color="black"
                />
                <Text> Marcar como gasto recurrente</Text>
              </TouchableOpacity>
            </View>

            {nuevoGasto.recurrente && (
              <>
                <Text style={styles.inputLabel}>Frecuencia</Text>
                <TextInput
                  placeholder="Cada:"
                  placeholderTextColor={"#666"}
                  style={styles.input}
                  keyboardType="numeric"
                  value={nuevoGasto.frecuencia}
                  onChangeText={(text) =>
                    setNuevoGasto({ ...nuevoGasto, frecuencia: text })
                  }
                />
                <DropDownPicker
                  open={openFrecuencia}
                  value={nuevoGasto.unidadFrecuencia}
                  items={frecuenciaOptions}
                  setOpen={setOpenFrecuencia}
                  setValue={(value) =>
                    setNuevoGasto({ ...nuevoGasto, unidadFrecuencia: value })
                  }
                  placeholder="Unidad de frecuencia"
                  placeholderStyle={{ color: "#666" }}
                  style={styles.dropdown}
                  zIndex={3000}
                  zIndexInverse={900}
                />
              </>
            )}

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
  gastoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    marginVertical: 8,
    borderRadius: 8,
  },
  nombre: { fontSize: 16, fontWeight: "bold" },
  monto: { fontSize: 14, color: "#555" },
  botonFlotante: {
    position: "relative",
    top: 747,
    left: 355,
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
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginVertical: 8,
  },
  dateText: {
    flex: 1,
    color: "#666",
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
  },
});
