import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../config/colors";

const ProfileScreen = ({ navigation }) => {
  const { signOut, userInfo, isAdmin } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <FontAwesome name="user-circle" size={80} color={COLORS.primary} />
          <Text style={styles.userName}>{userInfo?.username}</Text>
          <Text style={styles.phoneNumber}>{userInfo?.phoneNumber}</Text>
        </View>

        {isAdmin ? (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("AddItem")}
            >
              <Text style={styles.actionButtonText}>+ Add New Item</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("DeliveryBoysList")}
            >
              <Text style={styles.actionButtonText}>Delivery Boys</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("PickItem")}
          >
            <Text style={styles.actionButtonText}>+ Assign New Item</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 30,
    marginBottom: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginTop: 16,
  },
  phoneNumber: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 16,
    width: "70%",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    width: "50%",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProfileScreen;
