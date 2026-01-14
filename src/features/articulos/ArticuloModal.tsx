// src/features/articulos/ArticuloModal.tsx
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { theme } from "../../ui/theme";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Articulo, ArticuloDraft } from "./types";

type Props = {
  visible: boolean;
  initial?: Articulo | null;
  onClose: () => void;
  onSave: (draft: ArticuloDraft) => void;
};

function toNumberOrNull(v: string): number | null {
  const t = v.replace(",", ".").trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export default function ArticuloModal({ visible, initial, onClose, onSave }: Props) {
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [precio, setPrecio] = useState(initial ? String(initial.precio) : "");
  const [stock, setStock] = useState(initial?.stock != null ? String(initial.stock) : "");
  const [unidad, setUnidad] = useState(initial?.unidad ?? "u");
  const [activo, setActivo] = useState(initial?.activo === 0 ? false : true);

  const precioNum = useMemo(() => toNumberOrNull(precio), [precio]);
  const stockNum = useMemo(() => toNumberOrNull(stock), [stock]);

  const nombreError = useMemo(() => {
    const v = nombre.trim();
    if (!v) return "El nombre es obligatorio";
    if (v.length < 2) return "Muy corto";
    return "";
  }, [nombre]);

  const precioError = useMemo(() => {
    if (precioNum == null) return "Precio inválido";
    if (precioNum < 0) return "No puede ser negativo";
    return "";
  }, [precioNum]);

  const canSave = !nombreError && !precioError;

  const reset = () => {
    setCodigo(initial?.codigo ?? "");
    setNombre(initial?.nombre ?? "");
    setPrecio(initial ? String(initial.precio) : "");
    setStock(initial?.stock != null ? String(initial.stock) : "");
    setUnidad(initial?.unidad ?? "u");
    setActivo(initial?.activo === 0 ? false : true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={reset}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Card>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {initial ? "Editar artículo" : "Nuevo artículo"}
                </Text>
                <Text style={styles.subtitle}>Precio + stock (local)</Text>
              </View>

              <Pressable onPress={onClose} style={styles.iconBtn}>
                <X size={18} color={theme.colors.muted} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <Input label="Código (opcional)" value={codigo} onChangeText={setCodigo} />
              <Input
                label="Nombre *"
                value={nombre}
                onChangeText={setNombre}
                error={nombreError}
              />

              <Input
                label="Precio (ARS) *"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
                error={precioError}
              />

              <Input
                label="Stock (opcional)"
                value={stock}
                onChangeText={setStock}
                keyboardType="decimal-pad"
              />

              <Input label="Unidad (u/kg/lt)" value={unidad} onChangeText={setUnidad} />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Activo</Text>
                <Switch value={activo} onValueChange={setActivo} />
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title="Cancelar"
                variant="outline"
                onPress={onClose}
                style={{ flex: 1 }}
              />
              <Button
                title={initial ? "Guardar" : "Crear"}
                onPress={() => {
                  if (!canSave) return;
                  onSave({
                    codigo: codigo.trim(),
                    nombre: nombre.trim(),
                    precio: precioNum ?? 0,
                    stock: stockNum ?? undefined,
                    unidad: (unidad.trim() || "u") as string,
                    activo: activo ? 1 : 0,
                  });
                }}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.35)",
    padding: theme.space(2),
    justifyContent: "center",
  },
  sheet: { width: "100%" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space(1),
    marginBottom: theme.space(2),
  },
  title: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  subtitle: { marginTop: 2, fontSize: 12, color: theme.colors.muted },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.x2l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  form: { gap: theme.space(1.5) },
  actions: {
    marginTop: theme.space(2),
    flexDirection: "row",
    gap: theme.space(1),
  },
  switchRow: {
    marginTop: theme.space(1),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  switchLabel: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
});
