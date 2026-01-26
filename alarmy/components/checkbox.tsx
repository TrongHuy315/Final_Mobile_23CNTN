import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

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
  const toggle = () => {
    onChange(!checked);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggle}
      activeOpacity={0.7}
    >
      <Ionicons
        name={checked ? "checkbox" : "square-outline"}
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
