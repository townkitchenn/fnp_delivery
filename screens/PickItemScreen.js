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
import { getPendingItems, assignItem } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { useFocusEffect } from "@react-navigation/native";

const PickItemScreen = ({ navigation }) => {
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPendingItems();
    }, [])
  );

  const fetchPendingItems = async () => {
    try {
      const items = await getPendingItems();
      setPendingItems(items);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch pending items");
    } finally {
      setLoading(false);
    }
  };

  const handlePickItem = async (item) => {
    Alert.alert("Confirm Pick", `Are you sure you want to pick ${item.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            const userId = await AsyncStorage.getItem("userId");
            await assignItem(item.id, userId);
            setPendingItems(pendingItems.filter((i) => i.id !== item.id));
            navigation.goBack();
          } catch (error) {
            Alert.alert("Error", "Failed to assign item");
          }
        },
      },
    ]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPendingItems().finally(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.itemCard]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Address:</Text>
        <Text style={styles.value}>{item.address}</Text>
      </View>

      {item.delivery_time && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Delivery Time:</Text>
          <Text style={styles.value}>
            {new Date(item.delivery_time).toLocaleString()}
          </Text>
        </View>
      )}

      {item.customer_number && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_number}</Text>
        </View>
      )}

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handlePickItem(item)}
        >
          <Text style={styles.actionButtonText}>Assign Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={globalStyles.screenContainer}>
      <View style={[globalStyles.header, styles.header]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>Item List</Text>
        </View>
      </View>

      <FlatList
        data={pendingItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]} // Android
            tintColor={COLORS.primary} // iOS
          />
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
    justifyContent: "center",
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default PickItemScreen;
