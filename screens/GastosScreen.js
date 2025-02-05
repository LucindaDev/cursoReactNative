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
import DateTimePicker from "@react-native-community/datetimepicker";

export default function GastosScreen() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    id: null,
    concepto: "",
    monto: "",
    lugar_compra: "",
    metodo_pago: "Efectivo",
    descripcion: "",
    fecha: new Date(),
    categoria: null,
    recurrente: false,
    frecuencia: "",
    unidadFrecuencia: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openMetodoPago, setOpenMetodoPago] = useState(false);
  const [openCategoria, setOpenCategoria] = useState(false);
  const [openFrecuencia, setOpenFrecuencia] = useState(false);

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
      const result = await db.getAllAsync(
        "SELECT id, concepto, monto, metodo_pago, descripcion, fecha, unidad_frecuencia, frecuencia, categoria_id FROM gastos"
      );
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
      if (result.length > 0) {
        const formattedCategories = result.map((cat) => ({
          label: cat.nombre,
          value: cat.id.toString(),
        }));
        setCategorias(formattedCategories);
      } else {
        setCategorias([]);
      }
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      setCategorias([]);
    }
  };

  const btnGuardar = async () => {
    const formatDateToDisplay = (date) => {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const fechaDisplay = formatDateToDisplay(nuevoGasto.fecha);
    const esRecurrente = nuevoGasto.recurrente ? 1 : 0;

    if (!nuevoGasto.concepto || !nuevoGasto.monto || !nuevoGasto.categoria) {
      Alert.alert(
        "Error",
        "Por favor, completa todos los campos obligatorios."
      );
      return;
    }

    try {
      if (nuevoGasto.id) {
        await db.runAsync(
          `UPDATE gastos SET 
            concepto = ?, 
            monto = ?, 
            metodo_pago = ?, 
            lugar_compra = ?, 
            descripcion = ?, 
            fecha = ?,
            categoria_id = ?, 
            recurrente = ?, 
            frecuencia = ?, 
            unidad_frecuencia = ? 
          WHERE id = ?`,
          [
            nuevoGasto.concepto,
            nuevoGasto.monto,
            nuevoGasto.metodo_pago,
            nuevoGasto.lugar_compra,
            nuevoGasto.descripcion,
            fechaDisplay,
            nuevoGasto.categoria,
            esRecurrente,
            nuevoGasto.frecuencia || null,
            nuevoGasto.unidadFrecuencia || null,
            nuevoGasto.id,
          ]
        );
      } else {
        await db.runAsync(
          `INSERT INTO gastos (
            concepto, 
            monto, 
            metodo_pago, 
            lugar_compra, 
            descripcion, 
            fecha,
            categoria_id, 
            recurrente, 
            frecuencia, 
            unidad_frecuencia
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nuevoGasto.concepto,
            nuevoGasto.monto,
            nuevoGasto.metodo_pago,
            nuevoGasto.lugar_compra,
            nuevoGasto.descripcion,
            fechaDisplay,
            nuevoGasto.categoria,
            esRecurrente,
            nuevoGasto.frecuencia || null,
            nuevoGasto.unidadFrecuencia || null,
          ]
        );
      }

      setModalVisible(false);
      setNuevoGasto({
        ...nuevoGasto,
        id: null,
        concepto: "",
        monto: "",
        lugar_compra: "",
        metodo_pago: "Efectivo",
        descripcion: "",
        fecha: new Date(),
        categoria: null,
        recurrente: false,
        frecuencia: "",
        unidadFrecuencia: "",
      });
      await obtenerGastos();
    } catch (error) {
      console.error("Error al guardar gasto:", error);
      Alert.alert("Error", "No se pudo guardar el gasto: " + error.message);
    }
  };

  const eliminarGasto = async (id) => {
    Alert.alert(
      "Eliminar Gasto",
      "¿Estás seguro que deseas eliminar este gasto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await db.runAsync("DELETE FROM gastos WHERE id = ?", [id]);
              console.log("Gasto eliminado correctamente");
              await obtenerCategorias();
            } catch (error) {
              console.error("Error al eliminar gasto:", error);
            }
          },
        },
      ]
    );
  };

  const editarGasto = async (id) => {
    const gasto = gastos.find((p) => p.id === id);
    if (!gasto) {
      Alert.alert("Error", "No se encontró el gasto seleccionado.");
      return;
    }

    setModalVisible(true);
    setNuevoGasto({
      id: gasto.id,
      concepto: gasto.concepto,
      monto: gasto.monto,
      lugar_compra: gasto.lugar_compra,
      metodo_pago: gasto.metodo_pago,
      descripcion: gasto.descripcion,
      fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(), // Convierte a Date si es necesario
      categoria: gasto.categoria,
      recurrente: gasto.recurrente,
      frecuencia: gasto.frecuencia,
      unidadFrecuencia: gasto.unidadFrecuencia,
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      obtenerGastos();
      obtenerCategorias();
    }, [])
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gastoItem}>
            <TouchableOpacity style={{ flex: 1 }}>
              <Text style={styles.concepto}>{item.concepto}</Text>
              <Text style={styles.monto}>Monto: ${item.monto}</Text>
              <Text style={styles.metodo_pago}>
                Método de pago: {item.metodo_pago}
              </Text>
              <Text style={styles.fecha}>Fecha: {item.fecha}</Text>
              <Text style={styles.frecuencia}>
                {item.unidad_frecuencia && item.frecuencia
                  ? `Cada: ${item.frecuencia} ${frecuenciaOptions.find((option) => option.value === item.unidad_frecuencia)?.label}`
                  : ""}
              </Text>
            </TouchableOpacity>
            <View style={styles.iconosContainer}>
              <TouchableOpacity onPress={() => editarGasto(item.id)}>
                <Icon
                  name="pencil"
                  size={25}
                  color="#007bff"
                  style={styles.icono}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarGasto(item.id)}>
                <Icon
                  name="trash"
                  size={25}
                  color="#d9534f"
                  style={styles.icono}
                />
              </TouchableOpacity>
            </View>
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
            Keyboard.dismiss();
            setOpenMetodoPago(false);
            setOpenCategoria(false);
            setOpenFrecuencia(false);
          }}
        >
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Concepto"
              placeholderTextColor={"#666"}
              style={styles.input}
              value={nuevoGasto.concepto}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, concepto: text })
              }
            />
            <DropDownPicker
              open={openMetodoPago}
              value={nuevoGasto.metodo_pago}
              items={metodoPagoOptions}
              setOpen={setOpenMetodoPago}
              setValue={(callback) =>
                setNuevoGasto((prevState) => ({
                  ...prevState,
                  metodo_pago: callback(prevState.metodo_pago),
                }))
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
              value={nuevoGasto.monto.toString()}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, monto: text })
              }
            />
            <TextInput
              placeholder="Lugar de compra"
              placeholderTextColor={"#666"}
              style={styles.input}
              value={nuevoGasto.lugar_compra}
              onChangeText={(text) =>
                setNuevoGasto({ ...nuevoGasto, lugar_compra: text })
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
                {nuevoGasto.fecha.toLocaleDateString()}
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
              setValue={(callback) =>
                setNuevoGasto((prevState) => ({
                  ...prevState,
                  categoria: callback(prevState.categoria),
                }))
              }
              placeholder="Selecciona una categoría"
              placeholderStyle={{ color: "#666" }}
              style={styles.dropdown}
              zIndex={3000}
              zIndexInverse={1000}
            />

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                onPress={() =>
                  setNuevoGasto({
                    ...nuevoGasto,
                    recurrente: !nuevoGasto.recurrente,
                  })
                }
                style={styles.checkboxTouchable} // Estilo para el TouchableOpacity
              >
                <View style={styles.iconTextContainer}>
                  {/* Contenedor para ícono y texto */}
                  <Icon
                    name={nuevoGasto.recurrente ? "check-square" : "square-o"}
                    size={20}
                    color="black"
                  />
                  <Text style={styles.checkboxText}>
                    Marcar como gasto recurrente
                  </Text>
                </View>
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
                  setValue={(callback) =>
                    setNuevoGasto((prevState) => ({
                      ...prevState,
                      unidadFrecuencia: callback(prevState.unidadFrecuencia),
                    }))
                  }
                  placeholder="Unidad de frecuencia"
                  placeholderStyle={{ color: "#666" }}
                  style={styles.dropdown}
                  zIndex={2000}
                  zIndexInverse={900}
                />
              </>
            )}

            <View style={styles.botonContainer}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardar}
                onPress={btnGuardar}
              >
                <Text style={styles.botonTexto}>Guardar</Text>
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
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  concepto: { fontSize: 16, fontWeight: "bold" },
  monto: { fontSize: 14, color: "#555" },
  metodo_pago: { fontSize: 14, color: "#555" },
  fecha: { fontSize: 14, color: "#555" },
  frecuencia: { fontSize: 14, color: "#555" },
  iconosContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginRight: 9,
  },
  botonFlotante: {
    position: "absolute",
    bottom: 16,
    right: 16,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
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
    marginVertical: 8,
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
    alignItems: "center",
    marginLeft: 8,
  },
  botonCancelar: {
    backgroundColor: "#d9534f",
    padding: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  botonTexto: { color: "white", fontSize: 18 },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
    marginRight: 8,
  },
  checkboxContainer: {
    marginVertical: 10, // Espacio vertical alrededor del contenedor
  },
  checkboxTouchable: {
    flexDirection: "row", // Alinear ícono y texto en la misma línea
    alignItems: "center", // Centrar verticalmente
  },
  iconTextContainer: {
    flexDirection: "row", // Alinear ícono y texto en la misma línea
    alignItems: "center", // Centrar verticalmente
  },
  checkboxText: {
    marginLeft: 8, // Espacio entre el ícono y el texto
    fontSize: 16, // Tamaño del texto
  },
});
