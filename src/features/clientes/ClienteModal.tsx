import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { theme } from "../../ui/theme";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Cliente, ClienteDraft } from "./types";

type Props = {
  visible: boolean;
  initial?: Cliente | null;
  onClose: () => void;
  onSave: (draft: ClienteDraft) => void;
};

export default function ClienteModal({ visible, initial, onClose, onSave }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [cuit, setCuit] = useState(initial?.cuit ?? "");
  const [telefono, setTelefono] = useState(initial?.telefono ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [direccion, setDireccion] = useState(initial?.direccion ?? "");

  const nombreError = useMemo(() => {
    const v = nombre.trim();
    if (!v) return "El nombre es obligatorio";
    if (v.length < 3) return "Mínimo 3 caracteres";
    return "";
  }, [nombre]);

  const canSave = !nombreError;

  const reset = () => {
    setNombre(initial?.nombre ?? "");
    setCuit(initial?.cuit ?? "");
    setTelefono(initial?.telefono ?? "");
    setEmail(initial?.email ?? "");
    setDireccion(initial?.direccion ?? "");
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
                <Text style={styles.title}>{initial ? "Editar cliente" : "Nuevo cliente"}</Text>
                <Text style={styles.subtitle}>Se guarda local (SQLite)</Text>
              </View>

              <Pressable onPress={onClose} style={styles.iconBtn}>
                <X size={18} color={theme.colors.muted} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <Input label="Nombre *" value={nombre} onChangeText={setNombre} error={nombreError} />
              <Input label="CUIT" value={cuit} onChangeText={setCuit} />
              <Input label="Teléfono" value={telefono} onChangeText={setTelefono} />
              <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
              <Input label="Dirección" value={direccion} onChangeText={setDireccion} />
            </View>

            <View style={styles.actions}>
              <Button title="Cancelar" variant="outline" onPress={onClose} style={{ flex: 1 }} />
              <Button
                title={initial ? "Guardar" : "Crear"}
                onPress={() => {
                  if (!canSave) return;
                  onSave({
                    nombre: nombre.trim(),
                    cuit: cuit.trim(),
                    telefono: telefono.trim(),
                    email: email.trim(),
                    direccion: direccion.trim(),
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
  sheet: {
    width: "100%",
  },
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
});
