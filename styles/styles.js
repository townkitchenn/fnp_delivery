import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const COLORS = {
  primary: "#737530",
  primaryLight: "#8b8d44",
  primaryDark: "#5c5e26",
  white: "#FFFFFF",
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#2D3436",
  textLight: "#636E72",
  border: "#DFE6E9",
  error: "#D63031",
  success: "#00B894",
  warning: "#FDCB6E",
};

export default StyleSheet.create({
  // Base Container Styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
  },

  // Header Styles
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // Input Styles
  input: {
    width: "100%",
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },

  // Button Styles
  button: {
    width: "100%",
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    marginTop: 16,
    height: 48,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Card Styles
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  itemDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },

  // Status Badge Styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 16,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Loading States
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Auth Screen Styles
  authContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  authCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 24,
  },
  authButton: {
    width: 200,
    height: 48,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  authSecondaryButton: {
    marginTop: 16,
    backgroundColor: "transparent",
    height: 40,
    width: "auto",
    alignSelf: "center",
  },

  // Logo Styles
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 40,
    alignSelf: "center",
    borderRadius: 60, // Makes it circular
    backgroundColor: COLORS.white,
  },
});
