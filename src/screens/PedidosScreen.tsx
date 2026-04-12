import React, { useEffect, useMemo, useState } from "react";
import {
	Alert,
	FlatList,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Search, Plus, Trash2, Pencil, X } from "lucide-react-native";
import * as Print from "expo-print";

import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";

import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { theme } from "../ui/theme";
import type { ItemFactura } from "../features/facturacion/types";

import { useFocusEffect } from "@react-navigation/native";

import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";

import type { FacturaPayload, FacturaResponseOk } from "../features/facturacion/types";
import { postFactura } from "../features/facturacion/facturacion.api";

type BuildFacturaHtmlParams = {
	emisor: Emisor;
	cliente: Cliente;
	items: FacturaItem[];
	totalImporte: number;
	factResp?: any | null;
	qrBase64?: string; // 👈 nuevo
};

function buildFacturaHtml({
	emisor,
	cliente,
	items,
	totalImporte,
	factResp,
	qrBase64,
}: BuildFacturaHtmlParams) {
	const rowsHtml = items
		.map(
			(it) => `
      <tr>
        <td>${it.descripcion}</td>
        <td style="text-align:right;">${it.cantidad}</td>
        <td style="text-align:right;">$ ${it.precio.toFixed(2)}</td>
        <td style="text-align:right;">$ ${(it.precio * it.cantidad).toFixed(
					2
				)}</td>
      </tr>
    `
		)
		.join("");

	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border-bottom: 1px solid #ddd; padding: 6px; }
    th { background: #f3f3f3; }
    .total { text-align: right; font-size: 14px; font-weight: bold; margin-top: 12px; }
    .qr { margin-top: 20px; text-align: center; }
  </style>
</head>
<body>

  <h2>${emisor.razonSocial}</h2>
  <div>CUIT: ${emisor.cuit}</div>

  <hr />

  <strong>Cliente:</strong> ${cliente.razonSocial}<br/>
  CUIT: ${cliente.cuit || "—"}

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Cant.</th>
        <th>Precio</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="total">Total: $ ${totalImporte.toFixed(2)}</div>

  ${
		qrBase64
			? `<div class="qr"><img src="${qrBase64}" width="160" /></div>`
			: ""
	}

</body>
</html>
`;
}

import { listClientes } from "../features/clientes/clientes.repo";
import { listArticulos } from "../features/articulos/articulos.repo";
import { getEmisor } from "../features/ajustes/emisor.repo";

type Cliente = {
	id: string;
	razonSocial: string;
	cuit: string;
	condicionIVAId?: number;
	domicilio?: string;
	direccion?: string;
	telefono?: string;
	email?: string;
};

type Articulo = {
	id: string;
	codigo?: string;
	descripcion: string;
	precio: number;
	iva?: number; // 10.5 / 21
};

type FacturaItem = {
	id: string; // line id
	articuloId: string;
	codigo?: string;
	descripcion: string;
	precio: number;
	iva: number;
	cantidad: number;
};

type Emisor = {
	cuit?: string | null;
	razonSocial?: string | null;
	puntoDeVenta?: string | null;
	idFEAPI?: string | null;
	domicilioComercial?: string | null;
};

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
		return `$ ${n.toFixed(2)}`;
	}
}

function safeNum(n: unknown, fallback = 0) {
	return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}


function buildQrStringFromResponse(resp: any) {
	// TODO: usar resp.datosQR real
	return String(resp?.datosQR ?? "");
}
// -----------------------------------------------------

function isEmisorOk(e: Emisor | null): boolean {
	if (!e) return false;
	const cuit = (e.cuit ?? "").trim();
	const razon = (e.razonSocial ?? "").trim();
	const ptoVta = (e.puntoDeVenta ?? "").trim();
	// idFEAPI puede ser requerido en tu caso (lo ajustamos cuando vea tu resumen.page.ts)
	return !!cuit && !!razon && !!ptoVta;
}

function lineSubtotal(it: FacturaItem) {
	return safeNum(it.precio) * safeNum(it.cantidad);
}

function totals(items: FacturaItem[]) {
	const cantidad = items.reduce((acc, it) => acc + safeNum(it.cantidad), 0);
	const total = items.reduce((acc, it) => acc + lineSubtotal(it), 0);
	return { cantidad, total };
}

type EditItemModalProps = {
	visible: boolean;
	item: FacturaItem | null;
	onClose: () => void;
	onSave: (next: FacturaItem) => void;
};

function EditItemModal({ visible, item, onClose, onSave }: EditItemModalProps) {
	const [qtyText, setQtyText] = useState("1");
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (!visible) return;
		setSubmitted(false);
		setQtyText(item ? String(item.cantidad) : "1");
	}, [visible, item]);

	const qty = useMemo(() => {
		const n = Number(qtyText.replace(",", "."));
		return Number.isFinite(n) ? n : NaN;
	}, [qtyText]);

	const qtyError = useMemo(() => {
		if (!qtyText.trim()) return "La cantidad es obligatoria";
		if (!Number.isFinite(qty)) return "Cantidad inválida";
		if (qty <= 0) return "Debe ser mayor a 0";
		return "";
	}, [qtyText, qty]);

	const visibleError = submitted ? qtyError : "";

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
								<Text style={styles.title}>Editar ítem</Text>
								<Text style={styles.subtitle}>{item?.descripcion ?? ""}</Text>
							</View>
							<Pressable onPress={onClose} style={styles.iconBtn}>
								<X size={18} color={theme.colors.muted} />
							</Pressable>
						</View>

						<Input
							label="Cantidad *"
							value={qtyText}
							onChangeText={setQtyText}
							keyboardType="decimal-pad"
							error={visibleError}
						/>

						<View style={styles.actions}>
							<Button
								title="Cancelar"
								variant="outline"
								onPress={onClose}
								style={{ flex: 1 }}
							/>
							<Button
								title="Guardar"
								onPress={() => {
									setSubmitted(true);
									if (!item) return;
									if (qtyError) return;
									onSave({ ...item, cantidad: qty });
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
// componente Principal -------------------------------------------------------------------------------------------------

export default function PedidosScreen() {
	// Estado de “cabecera”
	const [emisor, setEmisor] = useState<Emisor | null>(null);
	const [clienteSearch, setClienteSearch] = useState("");
	const [clienteSelected, setClienteSelected] = useState<Cliente | null>(null);
	const [cliente, setCliente] = useState<Cliente | null>(null);
	// Estado de artículos / items
	const [artSearch, setArtSearch] = useState("");
	const [items, setItems] = useState<FacturaItem[]>([]);
	const totalImporte = useMemo(
		() => items.reduce((acc, it) => acc + it.precio * it.cantidad, 0),
		[items]
	);
	const navigation = useNavigation();
function getQrBase64(): Promise<string> {
  return new Promise((resolve) => {
    if (!qrRef.current) return resolve("");
    qrRef.current.toDataURL((data: string) => {
      resolve(`data:image/png;base64,${data}`);
    });
  });
}

	const qrRef = useRef<any>(null);
	function enterFocusMode() {
		(navigation as any).setParams({ focus: true });
	}

	function exitFocusMode() {
		(navigation as any).setParams({ focus: false });
	}
	function resetOperacion() {
		setClienteSelected(null);
		setClienteSearch("");
		setArtSearch("");
		setItems([]);
		setFactResp(null);
		setQrValue("");
		setEditOpen(false);
		setEditingItem(null);
	}

	// UI resultados de búsqueda
	const clientesFound = useMemo(
		() => listClientes(clienteSearch),
		[clienteSearch]
	);
	const articulosFound = useMemo(() => listArticulos(artSearch), [artSearch]);

	// Modal editar ítem
	const [editOpen, setEditOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<FacturaItem | null>(null);

	// Resultado facturación
	const [factResp, setFactResp] = useState<any | null>(null);
	const [qrValue, setQrValue] = useState<string>("");

	useFocusEffect(
		React.useCallback(() => {
			setEmisor(getEmisor());
		}, [])
	);

	const { cantidad, total } = useMemo(() => totals(items), [items]);

	const canFacturar = useMemo(() => {
		return isEmisorOk(emisor) && !!clienteSelected && items.length > 0;
	}, [emisor, clienteSelected, items.length]);

	function addArticulo(a: Articulo) {
		setItems((prev) => {
			const existing = prev.find((x) => x.articuloId === a.id);
			if (existing) {
				return prev.map((x) =>
					x.articuloId === a.id ? { ...x, cantidad: x.cantidad + 1 } : x
				);
			}
			return [
				...prev,
				{
					id: uuid(),
					articuloId: a.id,
					codigo: a.codigo ?? "",
					descripcion: a.descripcion,
					precio: a.precio,
					iva: safeNum(a.iva, 21),
					cantidad: 1,
				},
			];
		});

		// UX: limpio búsqueda y cierro lista
		setArtSearch("");
	}

	function removeItem(lineId: string) {
		setItems((prev) => prev.filter((x) => x.id !== lineId));
	}

async function facturar() {
  if (!canFacturar || !emisor || !clienteSelected) return;

  const payload: FacturaPayload = {
    emisor: {
      cuit: String(emisor.cuit ?? ""),
      razonSocial: String(emisor.razonSocial ?? ""),
      puntoDeVenta: String(emisor.puntoDeVenta ?? ""),
      idFEAPI: emisor.idFEAPI ?? null,
      domicilioComercial: emisor.domicilioComercial ?? null,
    },
    cliente: {
      id: clienteSelected.id,
      razonSocial: clienteSelected.razonSocial,
      cuit: clienteSelected.cuit ?? "",
      condicionIVAId: clienteSelected.condicionIVAId,
      direccion: clienteSelected.direccion,
    },
    items: items.map((it) => ({
      articuloId: it.articuloId,
      codigo: it.codigo,
      descripcion: it.descripcion,
      cantidad: it.cantidad,
      precio: it.precio,
      iva: it.iva as any,
      subtotal: lineSubtotal(it),
    })),
    totales: { cantidad, total },
    createdAt: new Date().toISOString(),
  };

  const resp = await postFactura(payload);

  if (!resp.ok) {
    Alert.alert("Error", resp.message ?? "No se pudo facturar.");
    return;
  }

  setFactResp(resp); // ✅ guardo respuesta OK para luego armar PDF/QR
  Alert.alert("OK", `Factura generada: ${resp.numero}`);
}

async function generarPdfYCompartir() {
  if (!factResp || !emisor || !clienteSelected || items.length === 0) return;

  const qrBase64 = await getQrBase64();

  const html = buildFacturaHtml({
    emisor: emisor!,
    cliente: clienteSelected!,
    items,
    totalImporte: total, // o tu totalImporte
    factResp,
    qrBase64,
  });

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
}


	return (
		<View style={screen.container}>
			<Text style={screen.h1}>Facturación</Text>
			<Text style={screen.p}>Cliente + ítems + totalización + envío a API</Text>

			{/* Emisor status */}
			{!isEmisorOk(emisor) && (
				<Card style={{ marginTop: theme.space(2) }}>
					<Text style={screen.sectionTitle}>Emisor</Text>
					<Text style={screen.warn}>
						Falta completar datos del emisor en Ajustes (CUIT / Razón Social /
						Punto de venta).
					</Text>
				</Card>
			)}

			{/* Cliente */}
			<Card
				style={{
					marginTop: theme.space(2),
					paddingVertical: clienteSelected ? theme.space(1) : theme.space(1.5),
				}}
			>
				<Text style={screen.sectionTitle}>Cliente</Text>

				{clienteSelected ? (
					// ✅ COMPACTO
					<View style={screen.clienteCompactRow}>
						<View style={{ flex: 1 }}>
							<Text style={screen.name} numberOfLines={1}>
								{clienteSelected.razonSocial}
							</Text>

							<Text style={screen.meta} numberOfLines={1}>
								CUIT: {clienteSelected.cuit || "—"}
								{!!clienteSelected.direccion
									? ` · ${clienteSelected.direccion}`
									: ""}
							</Text>
						</View>

						<Button
							title="Cambiar"
							variant="outline"
							onPress={() => {
								setClienteSelected(null);
								// si activás modo foco/tabs ocultas:
								// exitFocusMode();
							}}
						/>
					</View>
				) : (
					// ✅ EXPANDIDO (igual a lo tuyo)
					<>
						<View style={screen.searchRow}>
							<View style={screen.searchIcon}>
								<Search size={18} color={theme.colors.muted} />
							</View>
							<View style={{ flex: 1 }}>
								<Input
									label={undefined}
									placeholder="Buscar por Razón Social / CUIT…"
									value={clienteSearch}
									onChangeText={setClienteSearch}
								/>
							</View>
						</View>

						{!!clienteSearch.trim() && (
							<View style={{ marginTop: theme.space(1) }}>
								{clientesFound.length === 0 ? (
									<Text style={screen.meta}>Sin resultados</Text>
								) : (
									<FlatList
										data={clientesFound.slice(0, 12)}
										keyExtractor={(it) => it.id}
										renderItem={({ item }) => (
											<Pressable
												onPress={() => {
													setClienteSelected(item);
													setClienteSearch("");
													// si activás modo foco/tabs ocultas:
													// enterFocusMode();
												}}
												style={screen.pickRow}
											>
												<Text style={screen.pickTitle}>{item.razonSocial}</Text>
												<Text style={screen.pickMeta}>CUIT: {item.cuit}</Text>
											</Pressable>
										)}
									/>
								)}
							</View>
						)}
					</>
				)}
			</Card>

			{/* Artículos + Items */}
			<Card style={{ marginTop: theme.space(2), flex: 1 }}>
				<Text style={screen.sectionTitle}>Ítems</Text>

				<View style={screen.searchRow}>
					<View style={screen.searchIcon}>
						<Search size={18} color={theme.colors.muted} />
					</View>
					<View style={{ flex: 1 }}>
						<Input
							label={undefined}
							placeholder="Buscar artículo por Código / Descripción…"
							value={artSearch}
							onChangeText={setArtSearch}
						/>
					</View>
				</View>

				{!!artSearch.trim() && (
					<View style={{ marginTop: theme.space(1) }}>
						{articulosFound.length === 0 ? (
							<Text style={screen.meta}>Sin resultados</Text>
						) : (
							<FlatList
								data={articulosFound.slice(0, 12)}
								keyExtractor={(it) => it.id}
								renderItem={({ item }) => (
									<Pressable
										onPress={() => addArticulo(item)}
										style={screen.pickRow}
									>
										<Text style={screen.pickTitle}>
											{item.descripcion} {item.codigo ? `(${item.codigo})` : ""}
										</Text>
										<Text style={screen.pickMeta}>
											{moneyARS(item.precio)} — IVA {safeNum(item.iva, 21)}%
										</Text>
									</Pressable>
								)}
							/>
						)}
					</View>
				)}

				<View style={{ marginTop: theme.space(2), flex: 1 }}>
					{items.length === 0 ? (
						<Text style={screen.meta}>Agregá artículos para empezar.</Text>
					) : (
						<FlatList
							data={items}
							keyExtractor={(it) => it.id}
							contentContainerStyle={{ paddingBottom: 16 }}
							renderItem={({ item }) => (
								<View style={screen.itemRow}>
									<View style={{ flex: 1, paddingRight: 10 }}>
										<Text style={screen.name}>
											{item.descripcion} {item.codigo ? `(${item.codigo})` : ""}
										</Text>
										<Text style={screen.meta}>
											{item.cantidad} x {moneyARS(item.precio)} ={" "}
											<Text style={screen.price}>
												{moneyARS(lineSubtotal(item))}
											</Text>
										</Text>
									</View>

									<Pressable
										onPress={() => {
											setEditingItem(item);
											setEditOpen(true);
										}}
										style={screen.iconBtn}
									>
										<Pencil size={18} color={theme.colors.text} />
									</Pressable>

									{/* ✅ sin confirmación */}
									<Pressable
										onPress={() => removeItem(item.id)}
										style={[screen.iconBtn, { borderColor: "#F3D0Dd0" }]}
									>
										<Trash2 size={18} color={theme.colors.danger} />
									</Pressable>
								</View>
							)}
						/>
					)}
				</View>

				<View style={screen.totals}>
					<Text style={screen.meta}>
						Ítems: {items.length} — Cantidad: {cantidad}
					</Text>
					<Text style={screen.total}>{moneyARS(total)}</Text>
				</View>
			</Card>

			{/* Acciones */}
			<View style={{ marginTop: theme.space(2), gap: theme.space(1) }}>
				<View style={{ flexDirection: "row", gap: theme.space(1) }}>
					<View style={{ flex: 1 }}>
						<Button title="Reset" variant="outline" onPress={resetOperacion} />
					</View>

					<View style={{ flex: 2 }}>
						<Button
							title="Facturar"
							disabled={!canFacturar}
							onPress={facturar}
						/>
					</View>
				</View>

				{!!factResp && (
					<View style={{ gap: theme.space(1) }}>
						<Button
							title="Compartir PDF"
							variant="outline"
							onPress={generarPdfYCompartir}
						/>
					</View>
				)}
			</View>

			<EditItemModal
				visible={editOpen}
				item={editingItem}
				onClose={() => setEditOpen(false)}
				onSave={(next) => {
					setItems((prev) => prev.map((x) => (x.id === next.id ? next : x)));
					setEditOpen(false);
				}}
			/>
{!!factResp && (
  <View style={{ position: "absolute", left: -9999, top: -9999, opacity: 0 }}>
    <QRCode
      value={buildQrStringFromResponse(factResp)} // o tu qrValue si ya lo guardás
      size={220}
      getRef={(c) => (qrRef.current = c)}
    />
  </View>
)}
		</View>
	);
}

const screen = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.colors.bg,
		paddingHorizontal: theme.space(2),
		paddingTop: theme.space(2),
	},
	clienteCompactRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},

	h1: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
	p: { marginTop: 4, fontSize: 13, color: theme.colors.muted },

	sectionTitle: {
		fontSize: 14,
		fontWeight: "800",
		color: theme.colors.text,
		marginBottom: 10,
	},
	ok: { color: "#059669", fontSize: 12 },
	warn: { color: theme.colors.danger, fontSize: 12 },

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

	selectedBox: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
	name: { fontSize: 15, fontWeight: "800", color: theme.colors.text },
	meta: { marginTop: 4, fontSize: 12, color: theme.colors.muted },
	price: { fontWeight: "900", color: theme.colors.primaryDark },

	pickRow: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},
	pickTitle: { fontSize: 13, fontWeight: "700", color: theme.colors.text },
	pickMeta: { marginTop: 4, fontSize: 12, color: theme.colors.muted },

	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.border,
	},

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

	totals: {
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	total: { fontSize: 18, fontWeight: "900", color: theme.colors.primaryDark },
});

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
	actions: {
		marginTop: theme.space(2),
		flexDirection: "row",
		gap: theme.space(1),
	},
});
