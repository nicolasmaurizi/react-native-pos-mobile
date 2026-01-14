import React from "react";
import { Text, TextInput, View, StyleSheet, type TextInputProps } from "react-native";
import { theme } from "./theme";

type Props = TextInputProps & { label?: string; error?: string };

export default function Input({ label, error, style, ...rest }: Props) {
  return (
    <View>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...rest}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, !!error && styles.inputError, style]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, color: theme.colors.muted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.x2l,
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: theme.colors.text,
  },
  inputError: { borderColor: theme.colors.danger },
  error: { marginTop: 6, fontSize: 12, color: theme.colors.danger },
});
