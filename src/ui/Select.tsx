import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { theme } from "./theme";

type Option<V extends number | string> = { label: string; value: V };

type Props<V extends number | string> = {
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (v: V) => void;
};

export default function Select<V extends number | string>({ label, value, options, onChange }: Props<V>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <Picker selectedValue={value} onValueChange={(v) => onChange(v as V)}>
          {options.map((o) => (
            <Picker.Item key={String(o.value)} label={o.label} value={o.value} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 12, color: theme.colors.muted },
  box: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.x2l,
    overflow: "hidden",
  },
});
