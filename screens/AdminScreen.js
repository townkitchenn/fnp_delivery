import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { getAllItems } from "../services/api";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const AdminScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
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
      const data = await getAllItems();
      setItems(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch items");
    } finally {
      setLoading(false);
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
        {item.status && (
          <View style={[styles.statusBadge, styles[item.status.toLowerCase()]]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address}</Text>
      </View>

      {item.delivery_time && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Time:</Text>
          <Text style={styles.value}>{item.delivery_time}</Text>
        </View>
      )}

      {item.customer_number && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_number}</Text>
        </View>
      )}

      {item.delivery_boy_name && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Boy:</Text>
          <Text style={styles.value}>{item.delivery_boy_name}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={globalStyles.screenContainer}>
      <View style={[globalStyles.header, styles.header]}>
        <Text style={globalStyles.headerText}>Admin View</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <FontAwesome name="user-circle" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={items}
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
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  pending: {
    backgroundColor: "#FFA500",
    borderRadius: 20,
  },
  assigned: {
    backgroundColor: COLORS.primaryLight,
  },
  picked: {
    backgroundColor: COLORS.primary,
  },
  delivered: {
    backgroundColor: COLORS.success,
  },
  Pending: {
    backgroundColor: "#FFA500",
    borderRadius: 20,
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
});

export default AdminScreen;
