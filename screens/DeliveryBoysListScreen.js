import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { getDeliveryBoys } from "../services/api";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { FontAwesome } from "@expo/vector-icons";

const DeliveryBoysListScreen = ({ navigation }) => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveryBoys = async () => {
    try {
      const data = await getDeliveryBoys();
      setDeliveryBoys(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch delivery boys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDeliveryBoys().finally(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={[globalStyles.card, styles.itemCard]}>
      <View style={styles.itemHeader}>
        <FontAwesome name="user" size={24} color={COLORS.primary} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.username}</Text>
          <Text style={styles.phoneNumber}>{item.phone_number}</Text>
        </View>
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
          <Text style={styles.headerText}>Delivery Boys</Text>
        </View>
      </View>

      <FlatList
        data={deliveryBoys}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  phoneNumber: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default DeliveryBoysListScreen;
