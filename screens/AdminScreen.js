import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { globalStyles, COLORS } from "../styles/globalStyles";
import LoadingSpinner from "../components/LoadingSpinner";
import { getStatusCounts } from "../services/api";
import { API_BASE_URL } from "../config/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const AdminScreen = ({ navigation }) => {
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatusCounts = async () => {
    try {
      const data = await getStatusCounts();
      console.log("data", data);
      setStatusCounts(data);
    } catch (error) {
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStatusCounts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchStatusCounts();
    }, [])
  );

  const categories = [
    { id: 1, status: "Pending", icon: "clock-o", color: "#FFA500" },
    { id: 2, status: "Assigned", icon: "user", color: COLORS.primaryLight },
    { id: 3, status: "Picked", icon: "check", color: COLORS.primary },
    {
      id: 4,
      status: "Out_For_Delivery",
      icon: "truck",
      color: "#4CAF50",
      displayText: "Out for Delivery",
    },
    {
      id: 5,
      status: "Delivery_Attempted",
      icon: "repeat",
      color: "#FF5722",
      displayText: "Attempted Delivery",
    },
    { id: 6, status: "Delivered", icon: "check-circle", color: COLORS.success },
  ];

  return (
    <View style={globalStyles.screenContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <View style={[globalStyles.header, styles.header]}>
            <Text style={globalStyles.headerText}>Admin Dashboard</Text>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <FontAwesome name="user-circle" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.categoriesContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color },
                ]}
                onPress={() =>
                  navigation.navigate("AdminItemList", {
                    status: category.status,
                  })
                }
              >
                <FontAwesome name={category.icon} size={24} color="white" />
                <Text style={styles.categoryText}>
                  {category.displayText || category.status}
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {statusCounts[category.status] || 0}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoriesContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  categoryCard: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    color: "white",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  profileButton: {
    padding: 8,
    marginLeft: 8,
  },
  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default AdminScreen;
