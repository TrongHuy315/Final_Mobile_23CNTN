import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CheckboxProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  size = 24,
  color = "#22c55e",
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onChange(!checked)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={checked ? "checkbox" : "checkbox-outline"}
        size={size}
        color={checked ? color : "#94a3b8"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
