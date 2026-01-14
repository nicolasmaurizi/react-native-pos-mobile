import React from "react";
import { Text, View } from "react-native";
import Card from "../ui/Card";
import Input from "../ui/Input";

export default function PedidosScreen() {
  return (
    <View className="flex-1 bg-bg px-4 pt-14">
      <Text className="text-2xl font-semibold text-text">Carga de pedidos</Text>
      <Text className="mt-1 text-sm text-muted">Flujo tipo POS</Text>

      <Card className="mt-5">
        <Input label="Buscar cliente" placeholder="Nombre / CUIT" />
        <View className="h-4" />
        <Input label="Buscar artículo" placeholder="Código / Descripción" />
      </Card>
    </View>
  );
}
