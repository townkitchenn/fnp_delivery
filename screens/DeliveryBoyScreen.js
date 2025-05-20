import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  getDeliveryBoyItems,
  updateItemStatus as updateItemStatusAPI,
} from "../services/api";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { useAuth } from "../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const DeliveryBoyScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [pickedItems, setPickedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [])
  );

  const fetchItems = async () => {
    try {
      const items = await getDeliveryBoyItems();
      setPickedItems(items);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "Assigned":
        return "Picked";
      case "Picked":
        return "Delivered";
      default:
        return currentStatus;
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case "Assigned":
        return "Mark Picked";
      case "Picked":
        return "Mark Delivered";
      default:
        return "Updated";
    }
  };

  const showConfirmation = (item) => {
    const nextStatus = getNextStatus(item.status);
    Alert.alert(
      "Confirm Status Update",
      `Are you sure you want to mark this item as ${nextStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => updateItemStatus(item.id, nextStatus),
        },
      ]
    );
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      await updateItemStatusAPI(itemId, newStatus);
      await fetchItems(); // Refresh the list after update
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchItems().finally(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.itemCard]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={[styles.statusBadge, styles[item.status.toLowerCase()]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Delivery Time:</Text>
        <Text style={styles.value}>{item.delivery_time}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Customer:</Text>
        <Text style={styles.value}>{item.customer_number}</Text>
      </View>

      {item.status !== "Delivered" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles[`${item.status.toLowerCase()}Button`],
            ]}
            onPress={() => showConfirmation(item)}
          >
            <Text style={styles.actionButtonText}>
              {getButtonText(item.status)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={globalStyles.screenContainer}>
      <View style={[globalStyles.header, styles.header]}>
        <Text style={globalStyles.headerText}>My Deliveries</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
        >
          <FontAwesome name="user-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pickedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  picked: {
    backgroundColor: COLORS.pending,
  },
  delivered: {
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: COLORS.white,
    fontWeight: "500",
    fontSize: 12,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center", // Changed to center
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
    backgroundColor: COLORS.primary, // Use primary color for all action buttons
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  logoutButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  logoutButtonText: {
    color: COLORS.white,
  },
});

export default DeliveryBoyScreen;
