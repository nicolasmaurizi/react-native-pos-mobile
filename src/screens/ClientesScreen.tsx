import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Search, Trash2, Pencil } from "lucide-react-native";
import { theme } from "../ui/theme";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { initDb } from "../db/sqlite";
import type { Cliente } from "../features/clientes/types";
import { deleteCliente, listClientes, upsertCliente } from "../features/clientes/clientes.repo";
import ClienteModal from "../features/clientes/ClienteModal";

function nowIso() {
  return new Date().toISOString();
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ClientesScreen() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Cliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

  const refresh = () => setRows(listClientes(search));

  useEffect(() => {
    initDb();
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => refresh(), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function confirmDeleteCliente(cliente: { id: string; razonSocial: string; cuit?: string }) {
    const subtitle = cliente.cuit
      ? `${cliente.razonSocial}\nCUIT: ${cliente.cuit}`
      : cliente.razonSocial;

    Alert.alert(
      "Eliminar cliente",
      `¿Seguro que querés eliminar este cliente?\n\n${subtitle}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteCliente(cliente.id);
            refresh(); // ✅ refresca lista visible
          },
        },
      ]
    );
  }

  const empty = useMemo(() => rows.length === 0, [rows.length]);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Clientes</Text>
      <Text style={styles.p}>Gestión local y rápida (sin back)</Text>

      <Card style={{ marginTop: theme.space(2) }}>
        <View style={styles.searchRow}>
          <View style={styles.searchIcon}>
            <Search size={18} color={theme.colors.muted} />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={undefined}
              placeholder="Buscar por razón social o CUIT…"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </Card>

      <View style={{ marginTop: theme.space(2), flex: 1 }}>
        {empty ? (
          <Card>
            <Text style={styles.emptyTitle}>Sin clientes</Text>
            <Text style={styles.emptyText}>
              Tocá “+” para crear tu primer cliente y empezar a cargar pedidos.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(it) => it.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item }) => (
              <Card style={{ marginBottom: theme.space(1.5) }}>
                <View style={styles.row}>
                  <View style={{ flex: 1, paddingRight: theme.space(1) }}>
                    <Text style={styles.name}>{item.razonSocial}</Text>
                    {!!item.cuit && <Text style={styles.meta}>CUIT: {item.cuit}</Text>}
                    {!!item.telefono && <Text style={styles.meta}>Tel: {item.telefono}</Text>}
                  </View>

                  <Pressable
                    onPress={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                    style={styles.iconBtn}
                  >
                    <Pencil size={18} color={theme.colors.text} />
                  </Pressable>

                  <Pressable
                    onPress={() => confirmDeleteCliente(item)}
                    style={[styles.iconBtn, { borderColor: "#F3D0D0" }]}
                  >
                    <Trash2 size={18} color={theme.colors.danger} />
                  </Pressable>
                </View>
              </Card>
            )}
          />
        )}
      </View>

      <Pressable
        onPress={() => {
          setEditing(null);
          setModalOpen(true);
        }}
        style={styles.fab}
      >
        <Plus size={22} color="#fff" />
      </Pressable>

      <ClienteModal
        visible={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={(draft) => {
          const now = nowIso();
          const entity: Cliente = editing
            ? { ...editing, ...draft, updatedAt: now }
            : { id: uuid(), ...draft, createdAt: now, updatedAt: now };

          try {
            upsertCliente(entity);
            setModalOpen(false);
            refresh();
          } catch (e: any) {
            // Unique CUIT
            const msg = String(e?.message ?? e);
            if (msg.toLowerCase().includes("ux_clientes_cuit")) {
              Alert.alert("CUIT duplicado", "Ya existe un cliente con ese CUIT.");
              return;
            }
            Alert.alert("Error", msg);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: theme.space(2),
    paddingTop: theme.space(2),
  },
  h1: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  p: { marginTop: 4, fontSize: 13, color: theme.colors.muted },

  searchRow: { flexDirection: "row", alignItems: "center", gap: theme.space(1) },
  searchIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.x2l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },

  row: { flexDirection: "row", alignItems: "center", gap: theme.space(1) },
  name: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  meta: { marginTop: 4, fontSize: 12, color: theme.colors.muted },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.x2l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },

  emptyTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  emptyText: { marginTop: 8, fontSize: 13, color: theme.colors.muted },

  fab: {
    position: "absolute",
    right: theme.space(2),
    bottom: theme.space(3),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
