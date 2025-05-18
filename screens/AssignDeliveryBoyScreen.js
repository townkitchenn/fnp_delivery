import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { getDeliveryBoys, assignItem } from "../services/api";
import { globalStyles, COLORS } from "../styles/globalStyles";
import { FontAwesome } from "@expo/vector-icons";

const AssignDeliveryBoyScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

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

  const handleAssign = async (deliveryBoyId) => {
    try {
      await assignItem(item.id, deliveryBoyId);
      Alert.alert("Success", "Item assigned successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to assign item");
    }
  };

  const renderItem = ({ item: deliveryBoy }) => (
    <View style={[globalStyles.card, styles.itemCard]}>
      <View style={styles.itemHeader}>
        <FontAwesome name="user" size={24} color={COLORS.primary} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{deliveryBoy.username}</Text>
          <Text style={styles.phoneNumber}>{deliveryBoy.phone_number}</Text>
        </View>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => handleAssign(deliveryBoy.id)}
        >
          <Text style={styles.assignButtonText}>Assign</Text>
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
          <Text style={styles.headerText}>Assign Delivery Boy</Text>
        </View>
      </View>

      <FlatList
        data={deliveryBoys}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
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
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
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
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
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
  assignButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AssignDeliveryBoyScreen;
