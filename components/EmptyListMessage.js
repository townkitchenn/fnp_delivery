import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../config/colors";

const EmptyListMessage = ({ message, icon }) => (
  <View style={styles.container}>
    <FontAwesome name={icon} size={50} color={COLORS.textLight} />
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
  },
});

export default EmptyListMessage;
