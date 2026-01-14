import React from "react";
import { View, StyleSheet, type ViewProps } from "react-native";
import { theme } from "./theme";

type Props = ViewProps & { children: React.ReactNode };

export default function Card({ style, children, ...rest }: Props) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.radius.x2l,
    padding: theme.space(2),
  },
});
