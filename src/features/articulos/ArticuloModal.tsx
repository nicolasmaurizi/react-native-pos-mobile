import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { theme } from "../../ui/theme";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import type { Articulo, ArticuloDraft, IVAArticulo } from "./types";

type Props = {
	visible: boolean;
	initial?: Articulo | null;
	onClose: () => void;
	onSave: (draft: ArticuloDraft) => void;
};

const IVA_OPTIONS: { label: string; value: IVAArticulo }[] = [
	{ value: 10.5, label: "10,5%" },
	{ value: 21, label: "21%" },
];

function parsePrecio(input: string): number {
	// acepta "1234", "1234.56", "1234,56"
	const normalized = input.replace(/\./g, "").replace(",", ".").trim();
	const n = Number(normalized);
	return Number.isFinite(n) ? n : NaN;
}

export default function ArticuloModal({
	visible,
	initial,
	onClose,
	onSave,
}: Props) {
	const [descripcion, setDescripcion] = useState("");
	const [codigo, setCodigo] = useState("");
	const [precioText, setPrecioText] = useState("");
	const [iva, setIva] = useState<IVAArticulo>(21);

	const [submitted, setSubmitted] = useState(false);
	const [touchedDesc, setTouchedDesc] = useState(false);
	const [touchedCodigo, setTouchedCodigo] = useState(false);
	const [touchedPrecio, setTouchedPrecio] = useState(false);
	const [activo, setActivo] = useState<boolean>(true);

	const descripcionError = useMemo(() => {
		const v = descripcion.trim();
		if (!v) return "La descripción es obligatoria";
		if (v.length < 2) return "Mínimo 2 caracteres";
		return "";
	}, [descripcion]);

	const precioNumber = useMemo(() => parsePrecio(precioText), [precioText]);

	const precioError = useMemo(() => {
		if (!precioText.trim()) return "El precio es obligatorio";
		if (!Number.isFinite(precioNumber)) return "Precio inválido";
		if (precioNumber < 0) return "No puede ser negativo";
		return "";
	}, [precioText, precioNumber]);

	const visibleDescError = submitted || touchedDesc ? descripcionError : "";
	const visiblePrecioError = submitted || touchedPrecio ? precioError : "";
	const canSave = !descripcionError && !precioError;
	useEffect(() => {
		if (!visible) return;

		setSubmitted(false);
		setTouchedDesc(false);
		setTouchedCodigo(false);
		setTouchedPrecio(false);

		setCodigo(initial?.codigo ?? "");
		setDescripcion(initial?.descripcion ?? "");
		setPrecioText(initial ? String(initial.precio) : "");
		setIva((initial?.iva ?? 21) as IVAArticulo);
		setActivo(Boolean(initial?.activo ?? 1));
	}, [visible, initial]);

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
									{initial ? "Editar artículo" : "Nuevo artículo"}
								</Text>
								<Text style={styles.subtitle}>Se guarda local (SQLite)</Text>
							</View>

							<Pressable onPress={onClose} style={styles.iconBtn}>
								<X size={18} color={theme.colors.muted} />
							</Pressable>
						</View>

						<View style={styles.form}>
							<Input
								label="Código"
								value={codigo}
								onChangeText={setCodigo}
								placeholder="Ej: A-001"
								onBlur={() => setTouchedCodigo(true)} // si querés
							/>
							<Input
								label="Descripción *"
								value={descripcion}
								onChangeText={setDescripcion}
								onBlur={() => setTouchedDesc(true)}
								error={visibleDescError}
							/>

							<Input
								label="Precio *"
								value={precioText}
								onChangeText={setPrecioText}
								onBlur={() => setTouchedPrecio(true)}
								keyboardType="decimal-pad"
								error={visiblePrecioError}
								placeholder="Ej: 1500 o 1500,50"
							/>

							<Select
								label="IVA"
								value={iva}
								options={IVA_OPTIONS}
								onChange={setIva}
							/>
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
										codigo: codigo.trim(),
										descripcion: descripcion.trim(),
										precio: precioNumber,
										iva,
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
});
