import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Search, Trash2, Pencil, Tag } from "lucide-react-native";
import { theme } from "../ui/theme";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { initDb } from "../db/sqlite";
import type { Articulo } from "../features/articulos/types";
import {
	listArticulos,
	upsertArticulo,
	deleteArticulo,
} from "../features/articulos/articulos.repo";
import ArticuloModal from "../features/articulos/ArticuloModal";
import { Alert } from "react-native";

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

function moneyARS(n: number) {
	try {
		return new Intl.NumberFormat("es-AR", {
			style: "currency",
			currency: "ARS",
		}).format(n);
	} catch {
		return `$ ${n}`;
	}
}

export default function ArticulosScreen() {
	const [search, setSearch] = useState("");
	const [rows, setRows] = useState<Articulo[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editing, setEditing] = useState<Articulo | null>(null);

	const refresh = () => setRows(listArticulos(search));

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

	const empty = useMemo(() => rows.length === 0, [rows.length]);

	function confirmDeleteArticulo(a: {
		id: string;
		descripcion: string;
		codigo?: string;
	}) {
		const subtitle = a.codigo
			? `${a.descripcion}\nCódigo: ${a.codigo}`
			: a.descripcion;

		Alert.alert(
			"Eliminar artículo",
			`¿Seguro que querés eliminar este artículo?\n\n${subtitle}`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Eliminar",
					style: "destructive",
					onPress: () => {
						deleteArticulo(a.id);

						// UI inmediata (evita “se queda en pantalla”)
						setRows((prev) => prev.filter((x) => x.id !== a.id));

						// y además refresco desde DB
						refresh();
					},
				},
			]
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.h1}>Artículos</Text>
			<Text style={styles.p}>Catálogo local (precio/stock)</Text>

			<Card style={{ marginTop: theme.space(2) }}>
				<View style={styles.searchRow}>
					<View style={styles.searchIcon}>
						<Search size={18} color={theme.colors.muted} />
					</View>
					<View style={{ flex: 1 }}>
						<Input
							label={undefined}
							placeholder="Buscar por nombre o código…"
							value={search}
							onChangeText={setSearch}
						/>
					</View>
				</View>
			</Card>

			<View style={{ marginTop: theme.space(2), flex: 1 }}>
				{empty ? (
					<Card>
						<Text style={styles.emptyTitle}>Sin artículos</Text>
						<Text style={styles.emptyText}>
							Tocá “+” para crear tu primer artículo con precio y stock.
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
										<Text style={styles.name}>{item.descripcion}</Text>

										{!!item.codigo && (
											<View style={styles.codeRow}>
												<Tag size={14} color={theme.colors.muted} />
												<Text style={styles.meta}>Código: {item.codigo}</Text>
											</View>
										)}
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
										onPress={() => confirmDeleteArticulo(item)}
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

			<ArticuloModal
				visible={modalOpen}
				initial={editing}
				onClose={() => {
					setModalOpen(false);
					setEditing(null);
					refresh();
				}}
				onSave={(draft) => {
					const now = nowIso();
					const entity: Articulo = editing
						? { ...editing, ...draft, updatedAt: now }
						: {
								id: uuid(),
								...draft,
								activo: 1,
								createdAt: now,
								updatedAt: now,
						  };

					upsertArticulo(entity);
					setModalOpen(false);
					refresh();
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

	searchRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: theme.space(1),
	},
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

	metaRow: {
		marginTop: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flexWrap: "wrap",
	},
	price: { fontSize: 14, fontWeight: "700", color: theme.colors.primaryDark },
	meta: { fontSize: 12, color: theme.colors.muted },

	codeRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },

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
