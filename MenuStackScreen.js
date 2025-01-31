import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MenuScreen from "./screens/MenuScreen";
import PresupuestosScreen from "./screens/PresupuestosScreen";
import CategoriasScreen from "./screens/CategoriasScreen";

const MenuStack = createStackNavigator();

export default function MenuStackScreen() {
  return (
    <MenuStack.Navigator>
      <MenuStack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <MenuStack.Screen
        name="PresupuestosScreen"
        component={PresupuestosScreen}
        options={{ title: "Presupuestos" }}
      />
      <MenuStack.Screen
        name="CategoriasScreen"
        component={CategoriasScreen}
        options={{ title: "Categorías" }}
      />
    </MenuStack.Navigator>
  );
}

