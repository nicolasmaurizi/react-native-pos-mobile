import React from "react";
import { Pressable, Text, StyleSheet, type PressableProps } from "react-native";
import { theme } from "./theme";

type Variant = "primary" | "outline" | "danger";
type Props = PressableProps & { title: string; variant?: Variant };

export default function Button({ title, variant = "primary", style, ...rest }: Props) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && styles.pressed,
        style as any,
      ]}
    >
      <Text style={[styles.text, textVariant[variant]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.x2l,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pressed: { opacity: 0.9 },
  text: { fontSize: 15, fontWeight: "600" },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  outline: { backgroundColor: "transparent", borderColor: theme.colors.border },
  danger: { backgroundColor: theme.colors.danger, borderColor: theme.colors.danger },
});

const textVariant = StyleSheet.create({
  primary: { color: "#fff" },
  outline: { color: theme.colors.text },
  danger: { color: "#fff" },
});
