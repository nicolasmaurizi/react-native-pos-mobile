import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../ui/theme";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import {
	getEmisor,
	saveEmisor,
	type EmisorSettings,
} from "../features/ajustes/emisor.repo";
import { isValidCuit, normalizeCuit } from "../features/ajustes/cuit";
import DateTimePicker from "@react-native-community/datetimepicker";
import Select from "../ui/Select";
import type { CondicionIVAId } from "../features/ajustes/emisor.repo";
import { formatDDMMYYYY, toISOFromDate } from "../utils/date";

const IVA_OPTIONS: { label: string; value: CondicionIVAId }[] = [
	{ value: 1, label: "IVA Responsable Inscripto" },
	{ value: 4, label: "IVA Sujeto Exento" },
	{ value: 5, label: "Consumidor Final" },
	{ value: 6, label: "Responsable Monotributo" },
];

export default function AjustesScreen() {
	const [data, setData] = useState<EmisorSettings>(() => getEmisor());
	const [showDate, setShowDate] = useState(false);
	const cuitOk = useMemo(() => {
		const n = normalizeCuit(data.cuit);
		return n.length === 0 ? false : isValidCuit(n);
	}, [data.cuit]);

	const cuitError = useMemo(() => {
		if (!data.cuit) return "";
		const n = normalizeCuit(data.cuit);
		if (n.length !== 11) return "CUIT debe tener 11 dígitos";
		if (!isValidCuit(n)) return "CUIT inválido";
		return "";
	}, [data.cuit]);

	useEffect(() => {
		// por si querés recargar al entrar
		setData(getEmisor());
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.h1}>Ajustes</Text>
			<Text style={styles.p}>Datos del emisor (se guarda local)</Text>

			<ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
				<Card style={{ marginTop: theme.space(2) }}>
					<Text style={styles.cardTitle}>Datos fiscales</Text>

					<View style={styles.gap}>
						<Input
							label="CUIT *"
							value={data.cuit}
							onChangeText={(v) =>
								setData((s) => ({ ...s, cuit: normalizeCuit(v) }))
							}
							keyboardType="number-pad"
							error={cuitError}
						/>

						<Input
							label="Razón Social"
							value={data.razonSocial}
							onChangeText={(v) => setData((s) => ({ ...s, razonSocial: v }))}
						/>

						{/* Select simple: por ahora input + validación, luego lo cambiamos por Picker */}
						<Select
							label="Condición IVA"
							value={data.condicionIVAId}
							options={IVA_OPTIONS}
							onChange={(v) => setData((s) => ({ ...s, condicionIVAId: v }))}
						/>
						<Text style={styles.help}>Opciones: {IVA_OPTIONS.join(" / ")}</Text>
					</View>
				</Card>

				<Card style={{ marginTop: theme.space(2) }}>
					<Text style={styles.cardTitle}>Comercial</Text>

					<View style={styles.gap}>
						<Input
							label="Domicilio Comercial"
							value={data.domicilioComercial}
							onChangeText={(v) =>
								setData((s) => ({ ...s, domicilioComercial: v }))
							}
						/>

						<Input
							label="Punto de venta"
							value={data.puntoDeVenta}
							onChangeText={(v) =>
								setData((s) => ({ ...s, puntoDeVenta: v.replace(/\D/g, "") }))
							}
							keyboardType="number-pad"
						/>

						<Input
							label="Nombre de Fantasía"
							value={data.nombreFantasia}
							onChangeText={(v) =>
								setData((s) => ({ ...s, nombreFantasia: v }))
							}
						/>
					</View>
				</Card>

				<Card style={{ marginTop: theme.space(2) }}>
					<Text style={styles.cardTitle}>Inicio de actividades</Text>

					<View style={styles.gap}>
						<Input
							label="Inicio de actividades"
							value={formatDDMMYYYY(data.iniActividad)}
							editable={false}
							placeholder="Seleccioná una fecha"
						/>

						<Button
							title="Elegir fecha"
							variant="outline"
							onPress={() => setShowDate(true)}
						/>
					</View>
				</Card>

				<Card style={{ marginTop: theme.space(2) }}>
					<Text style={styles.cardTitle}>FEAPI</Text>

					<View style={styles.gap}>
						<Input
							label="ID FEAPI"
							value={data.idFEAPI}
							onChangeText={(v) => setData((s) => ({ ...s, idFEAPI: v }))}
						/>
					</View>
				</Card>

				{showDate && (
					<DateTimePicker
						value={data.iniActividad ? new Date(data.iniActividad) : new Date()}
						mode="date"
						onChange={(evt, selected) => {
							setShowDate(false);
							if (!selected) return;
							setData((s) => ({ ...s, iniActividad: toISOFromDate(selected) }));
						}}
					/>
				)}

				<View
					style={{
						marginTop: theme.space(2),
						flexDirection: "row",
						gap: theme.space(1),
					}}
				>
					<Button
						title="Restablecer"
						variant="outline"
						onPress={() => setData(getEmisor())}
						style={{ flex: 1 }}
					/>
					<Button
						title="Guardar"
						onPress={() => {
							if (!cuitOk) {
								Alert.alert("Error", "Revisá el CUIT antes de guardar.");
								return;
							}
							saveEmisor({ ...data, cuit: normalizeCuit(data.cuit) });
							Alert.alert("Listo", "Datos guardados.");
						}}
						// simula el [disabled]="!esCUITValido" del Ionic :contentReference[oaicite:2]{index=2}
						disabled={!cuitOk}
						style={{ flex: 1 }}
					/>
				</View>
			</ScrollView>
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
	cardTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: theme.colors.text,
		marginBottom: theme.space(1),
	},
	gap: { gap: theme.space(1.5) },
	help: { marginTop: 6, fontSize: 12, color: theme.colors.muted },
});
