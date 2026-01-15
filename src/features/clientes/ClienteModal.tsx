import React, { useMemo, useState, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { theme } from "../../ui/theme";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import type { Cliente, ClienteDraft, CondicionIVAId } from "./types";
import { isValidCuit, normalizeCuit } from "../ajustes/cuit";

type Props = {
  visible: boolean;
  initial?: Cliente | null;
  onClose: () => void;
  onSave: (draft: ClienteDraft) => void;
};

const IVA_OPTIONS: { label: string; value: CondicionIVAId }[] = [
  { value: 1, label: "IVA Responsable Inscripto" },
  { value: 4, label: "IVA Sujeto Exento" },
  { value: 5, label: "Consumidor Final" },
  { value: 6, label: "Responsable Monotributo" },
];

export default function ClienteModal({ visible, initial, onClose, onSave }: Props) {
  const [cuit, setCuit] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [condicionIVAId, setCondicionIVAId] = useState<CondicionIVAId>(5 as CondicionIVAId);
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [touchedRazon, setTouchedRazon] = useState(false);

  useEffect(() => {
    if (!visible) {
      setSubmitted(false);
      setTouchedRazon(false);
      return;
    }

    setSubmitted(false);
    setTouchedRazon(false);

    setCuit(initial?.cuit ?? "");
    setRazonSocial(initial?.razonSocial ?? "");
    setCondicionIVAId((initial?.condicionIVAId ?? 5) as CondicionIVAId);
    setTelefono(initial?.telefono ?? "");
    setEmail(initial?.email ?? "");
    setDireccion(initial?.direccion ?? "");
  }, [visible, initial]);

  const cuitError = useMemo(() => {
    const n = normalizeCuit(cuit);
    if (!n) return ""; // opcional por ahora
    if (n.length !== 11) return "CUIT debe tener 11 dígitos";
    if (!isValidCuit(n)) return "CUIT inválido";
    return "";
  }, [cuit]);

  const razonSocialError = useMemo(() => {
    const v = razonSocial.trim();
    if (!v) return "La razón social es obligatoria";
    if (v.length < 3) return "Mínimo 3 caracteres";
    return "";
  }, [razonSocial]);

  const visibleRazonError = (submitted || touchedRazon) ? razonSocialError : "";
  const canSave = !razonSocialError && !cuitError;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Card>
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                  {initial ? "Editar cliente" : "Nuevo cliente"}
                </Text>
                <Text style={styles.subtitle}>Se guarda local (SQLite)</Text>
              </View>

              <Pressable onPress={onClose} style={styles.iconBtn}>
                <X size={18} color={theme.colors.muted} />
              </Pressable>
            </View>

            <View style={styles.form}>
              <Input
                label="CUIT"
                value={cuit}
                onChangeText={(v) => setCuit(normalizeCuit(v))}
                keyboardType="number-pad"
                error={cuitError}
                placeholder="11 dígitos"
              />

              <Input
                label="Razón social *"
                value={razonSocial}
                onChangeText={setRazonSocial}
                onBlur={() => setTouchedRazon(true)}
                error={visibleRazonError}
              />

              <Select
                label="Condición IVA"
                value={condicionIVAId}
                options={IVA_OPTIONS}
                onChange={setCondicionIVAId}
              />

              <Input label="Teléfono" value={telefono} onChangeText={setTelefono} />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input label="Dirección" value={direccion} onChangeText={setDireccion} />
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
                  setSubmitted(true);
                  if (!canSave) return;

                  onSave({
                    cuit: normalizeCuit(cuit),
                    razonSocial: razonSocial.trim(),
                    condicionIVAId,
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
});
