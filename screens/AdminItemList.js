import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
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

  // console.log("status", status);

  // new: tabs and activeTab
  const tabs = [
    { key: "Today", label: "Today", color: COLORS.primary },
    { key: "Tomorrow", label: "Tomorrow", color: "#FFA500" },
    { key: "Future", label: "Future", color: "#4CAF50" },
    { key: "Expired", label: "Expired", color: "#FF5722" },
  ];
  const [activeTab, setActiveTab] = useState("Today");

  const fetchItems = async () => {
    try {
      let data;
      if (isDeliveryBoy) {
        data = await getDeliveryBoyItems(status);
      } else {
        data = await getItemsByStatus(status);
      }
      setItems(data || []);

      // Log delivery_time values only
      const deliveryTimes = (data || []).map((it) => it.delivery_time ?? null);
      console.log("Delivery times:", deliveryTimes);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [status])
  );

  // Robust parser for delivery_time strings like:
  // "Nov 21, 2025, 4:06 PM - 7:06 PM"  or "Jul 19, 2025, 3:49 PM"
  const parseDeliveryTime = (s) => {
    if (!s) return null;
    // Normalize NBSP / narrow no-break and other weird spaces, trim
    let normalized = s.replace(/[\u00A0\u202F\u2009]/g, " ").trim();
    // Keep only the first part before any dash/range (e.g. " - ")
    normalized = normalized.split(/\s*[-–—]\s*/)[0].trim();
    // Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, " ");

    // Regex to capture: MonthName Day, Year, H:MM [AM|PM] (AM/PM optional)
    const re =
      /^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?)?/;
    const m = normalized.match(re);
    if (m) {
      const monthStr = m[1];
      const day = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);
      let hour = m[4] ? parseInt(m[4], 10) : 0;
      const minute = m[5] ? parseInt(m[5], 10) : 0;
      const ampm = m[6] ? m[6].toLowerCase() : null;

      // map month abbreviation to month index
      const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const month =
        monthMap[monthStr.slice(0, 3)] !== undefined
          ? monthMap[monthStr.slice(0, 3)]
          : NaN;
      if (isNaN(month) || isNaN(day) || isNaN(year)) return null;

      if (ampm) {
        if (ampm === "pm" && hour < 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;
      }
      // Construct local Date
      const dt = new Date(year, month, day, hour, minute, 0, 0);
      if (!isNaN(dt.getTime())) return dt;
    }

    // fallback: try native Date parse on normalized string
    const fallback = new Date(normalized);
    if (!isNaN(fallback.getTime())) return fallback;

    return null;
  };

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  // compute today/tomorrow once
  const todayStart = startOfDay(new Date());
  const tomorrowStart = startOfDay(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );

  // Replace filteredItems so it only applies date filtering for Pending status;
  // otherwise return all items.
  const filteredItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];

    // If status is not Pending, show all fetched items (no date tabs/filtering)
    if (status !== "Pending") return items;

    // Existing date-based filtering when status === "Pending"
    return items.filter((it) => {
      const dt = parseDeliveryTime(it.delivery_time);
      if (!dt) {
        // treat missing/invalid delivery_time as Future
        return activeTab === "Future";
      }
      const dtStart = startOfDay(dt);

      if (activeTab === "Today") {
        return dtStart.getTime() === todayStart.getTime();
      }
      if (activeTab === "Tomorrow") {
        return dtStart.getTime() === tomorrowStart.getTime();
      }
      if (activeTab === "Future") {
        const dayAfterTomorrow = new Date(tomorrowStart);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        return dtStart.getTime() >= dayAfterTomorrow.getTime();
      }
      if (activeTab === "Expired") {
        return dtStart.getTime() < todayStart.getTime();
      }
      return false;
    });
  }, [items, activeTab, todayStart, tomorrowStart, status]);

  // Compute counts for each tab (only when status === "Pending")
  const getTabCounts = React.useMemo(() => {
    if (status !== "Pending" || !items || items.length === 0) {
      return { Today: 0, Tomorrow: 0, Future: 0, Expired: 0 };
    }

    const counts = { Today: 0, Tomorrow: 0, Future: 0, Expired: 0 };

    items.forEach((it) => {
      const dt = parseDeliveryTime(it.delivery_time);
      if (!dt) {
        counts.Future++;
        return;
      }
      const dtStart = startOfDay(dt);

      if (dtStart.getTime() === todayStart.getTime()) {
        counts.Today++;
      } else if (dtStart.getTime() === tomorrowStart.getTime()) {
        counts.Tomorrow++;
      } else if (dtStart.getTime() < todayStart.getTime()) {
        counts.Expired++;
      } else {
        counts.Future++;
      }
    });

    return counts;
  }, [items, status, todayStart, tomorrowStart]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchItems();
  }, [status]);

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

        {/* {item.image_url && (
          <View style={styles.imageContainer}>
            {console.log("AdminItemList - Image URL:", item.image_url)}
            <Image
              source={getImageSource(item.image_url)}
              style={styles.itemImage}
              resizeMode="cover"
            />
          </View>
        )} */}

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

  // compute empty message depending on status
  const emptyMessage =
    status === "Pending"
      ? `No ${activeTab.toLowerCase()} items`
      : `No ${status.toLowerCase()} items`;

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

          {/* Show tabs only when status is Pending */}
          {status === "Pending" && (
            <View style={styles.tabBar}>
              {tabs.map((t) => {
                const active = t.key === activeTab;
                const count = getTabCounts[t.key] || 0;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      styles.tabButton,
                      {
                        backgroundColor: active ? t.color : "transparent",
                        borderColor: active ? t.color : COLORS.border,
                      },
                    ]}
                    onPress={() => setActiveTab(t.key)}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: active ? "#fff" : COLORS.textDark },
                      ]}
                    >
                      {t.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: active
                              ? "rgba(255,255,255,0.4)"
                              : t.color,
                          },
                        ]}
                      >
                        <Text style={styles.badgeText}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {filteredItems.length === 0 ? (
            <EmptyListMessage message={emptyMessage} icon="list-alt" />
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
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
  // Add tab styles
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default AdminItemList;
