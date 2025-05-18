import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#737530",
  primaryLight: "#8b8d44",
  white: "#FFFFFF",
  gray: "#F7F7F7",
  textDark: "#333333",
  textLight: "#666666",
  border: "#E1E1E1",
  success: "#4CAF50",
  pending: "#FFA000",
  error: "#f44336",
  warning: "#FFA500",
};

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
