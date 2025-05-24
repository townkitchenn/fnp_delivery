import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { getDeliveryBoyItems, getItemsByStatus } from "../services/api";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { useFocusEffect } from "@react-navigation/native";
import { formatStatus } from "../utils/formatters";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyListMessage from "../components/EmptyListMessage";

const AdminItemList = ({ route, navigation }) => {
  const { status, isDeliveryBoy } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      let data;
      if (isDeliveryBoy) {
        data = await getDeliveryBoyItems(status);
      } else {
        data = await getItemsByStatus(status);
      }
      setItems(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [status])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ItemDetail", { item })}
      activeOpacity={0.7}
    >
      <View style={[globalStyles.card, styles.itemCard]}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          {/* <View style={[styles.statusBadge, styles[item.status.toLowerCase()]]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View> */}
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

        {/* {item.customer_number && (
        <View style={styles.detailRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.customer_number}</Text>
        </View>
      )} */}

        {!isDeliveryBoy && item.delivery_boy_name && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Delivery Boy:</Text>
            <Text style={styles.value}>{item.delivery_boy_name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.screenContainer}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <View style={[globalStyles.header, styles.header]}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerText}>{formatStatus(status)}</Text>
            </View>
          </View>

          {items.length === 0 ? (
            <EmptyListMessage
              message={`No ${status.toLowerCase()} items available`}
              icon="list-alt"
            />
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={fetchItems}
                />
              }
            />
          )}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
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
});

export default AdminItemList;
