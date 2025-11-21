import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Alert,
  Clipboard,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { COLORS } from "../config/colors";
import { API_BASE_URL } from "../config/apiConfig";
import { unassignItem, deleteItem, updateItemStatus } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatStatus } from "../utils/formatters";
import { compressImage } from "../utils/imageUtils";
import { ensureHttps } from "../utils/urlUtils";
import { getImageSource } from "../utils/imageUtils";

const ItemDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const { isAdmin } = useAuth();
  const [locationInfo, setLocationInfo] = useState(null);

  console.log("ItemDetailScreen - Item received:", item);

  useEffect(() => {
    if (item.location) {
      extractLocationInfo(item.location);
    }
  }, [item.location]);

  const extractLocationInfo = async (location) => {
    try {
      // Check if it's a Google Maps link
      if (
        location.includes("maps.app.goo.gl") ||
        location.includes("maps.google.com") ||
        location.includes("goo.gl/maps")
      ) {
        // For Google Maps links, we'll just display the full location
        setLocationInfo({
          name: "Google Maps Location",
          coordinates: "",
          originalUrl: location,
        });
      } else {
        // If it's already a place name or address, use it directly
        setLocationInfo({
          name: location,
          coordinates: "",
          originalUrl: location,
        });
      }
    } catch (error) {
      console.log("Error extracting location info:", error);
      setLocationInfo({
        name: location,
        coordinates: "",
        originalUrl: location,
      });
    }
  };

  const openMap = () => {
    if (!item.location) return;

    let mapUrl = "";

    if (
      item.location.includes("maps.app.goo.gl") ||
      item.location.includes("maps.google.com") ||
      item.location.includes("goo.gl/maps")
    ) {
      // If it's already a Google Maps link, open it directly
      mapUrl = item.location;
    } else {
      // If it's a place name or address, create a search query
      const query = encodeURIComponent(item.location);
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    }

    Linking.openURL(mapUrl).catch(() => {
      Alert.alert("Error", "Could not open maps application");
    });
  };

  const copyMapUrl = () => {
    if (locationInfo?.originalUrl) {
      Clipboard.setString(locationInfo.originalUrl);
      Alert.alert("Success", "Map URL copied to clipboard");
    }
  };

  const formatLocationDisplay = () => {
    if (locationInfo) {
      return locationInfo.name;
    }
    return item.location || "No location specified";
  };

  const handleUnassign = async () => {
    Alert.alert(
      "Confirm Unassign",
      "Are you sure you want to unassign this delivery boy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await unassignItem(item.id);
              Alert.alert("Success", "Delivery boy unassigned successfully", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to unassign delivery boy");
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteItem(item.id);
            Alert.alert("Success", "Item deleted successfully", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert(
              "Error",
              error.message || "Failed to delete item. Please try again."
            );
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate("AddItem", {
      mode: "edit",
      item: item,
    });
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case "Assigned":
        return "Picked";
      case "Picked":
        return "Out_For_Delivery";
      case "Out_For_Delivery":
        return null; // Handle in UI with two buttons
      case "Delivery_Attempted":
        return "Delivered";
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (newStatus, requireImage = false) => {
    try {
      let imageFile = null;

      if (requireImage) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (result.canceled) {
          return;
        }

        // Compress image before sending
        imageFile = await compressImage(result.assets[0].uri);
      }

      const formData = new FormData();
      formData.append("status", newStatus);

      if (imageFile) {
        formData.append("delivered_image", imageFile);
      }

      const response = await updateItemStatus(item.id, formData);

      if (response) {
        Alert.alert("Success", "Status updated successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Status update error:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert("Error", "Failed to update status. Please try again.");
    }
  };

  const showStatusConfirmation = (newStatus, requireImage = false) => {
    const statusText = formatStatus(newStatus);
    Alert.alert(
      `Confirm Status Update`,
      `Are you sure you want to mark this item as ${statusText}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            if (requireImage) {
              // Handle image pick and status update directly
              handleStatusUpdate(newStatus, true);
            } else {
              // Handle status update without image
              handleStatusUpdate(newStatus, false);
            }
          },
        },
      ]
    );
  };

  const renderDeliveryBoyActions = () => {
    if (isAdmin) return null; // Don't show for admin

    switch (item.status) {
      case "Assigned":
        return (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => showStatusConfirmation("Picked")}
          >
            <FontAwesome name="check" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Mark Picked</Text>
          </TouchableOpacity>
        );
      case "Picked":
        return (
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => showStatusConfirmation("Out_For_Delivery")}
          >
            <FontAwesome name="truck" size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Start Delivery</Text>
          </TouchableOpacity>
        );
      case "Out_For_Delivery":
        return (
          <View style={styles.deliveryActions}>
            <TouchableOpacity
              style={[styles.statusButton, styles.attemptedButton]}
              onPress={() => showStatusConfirmation("Delivery_Attempted")}
            >
              <FontAwesome name="repeat" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Mark Attempted</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusButton, styles.deliveredButton]}
              onPress={() => showStatusConfirmation("Delivered", true)}
            >
              <FontAwesome name="check-circle" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Mark Delivered</Text>
            </TouchableOpacity>
          </View>
        );
      case "Delivery_Attempted":
        return (
          <View style={styles.deliveryActions}>
            <TouchableOpacity
              style={[styles.statusButton, styles.deliveredButton]}
              onPress={() => showStatusConfirmation("Delivered", true)}
            >
              <FontAwesome name="check-circle" size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Mark Delivered</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  const canEdit = isAdmin && ["Pending", "Assigned"].includes(item.status);
  const canDelete =
    isAdmin && ["Pending", "Assigned", "Delivered"].includes(item.status);

  const handleDownloadImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to save images"
        );
        return;
      }

      if (item.delivered_image_url) {
        Alert.alert("Downloading...", "The image is being downloaded");

        let imageUri = item.delivered_image_url;

        // Check if it's a Base64 data URI
        if (imageUri.startsWith("data:image/")) {
          // Extract the Base64 data from the data URI
          const base64Data = imageUri.split(",")[1];
          const mimeType = imageUri.split(";")[0].split(":")[1];
          const fileExtension = mimeType.split("/")[1];

          // Create a temporary file path
          const filename = `delivery_proof_${Date.now()}.${fileExtension}`;
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          // Write the Base64 data to a temporary file
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Save to device's media library
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync("Delivery Proofs", asset, false);

          Alert.alert("Success", "Image saved to your photos!");
        } else {
          // Handle regular HTTP URLs (existing logic)
          const secureUrl = ensureHttps(item.delivered_image_url);
          const filename = secureUrl.split("/").pop();
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          const downloadResult = await FileSystem.downloadAsync(
            secureUrl,
            fileUri
          );

          if (downloadResult.status !== 200) {
            Alert.alert("Error", "Failed to download image");
            return;
          }

          // Save to device's media library
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          await MediaLibrary.createAlbumAsync("Delivery Proofs", asset, false);

          Alert.alert("Success", "Image saved to your photos!");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Could not save image");
    }
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
        <Text style={styles.headerTitle}>Item Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          {item.image_url && (
            <>
              {console.log("ItemDetailScreen - Image URL:", item.image_url)}
              <Image
                source={getImageSource(item.image_url)}
                style={styles.image}
                resizeMode="cover"
              />
            </>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {formatStatus(item.status)}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              {item.status === "Pending" && (
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() =>
                    navigation.navigate("AssignDeliveryBoy", { item: item })
                  }
                >
                  <FontAwesome
                    name="user-plus"
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.buttonText}>Assign</Text>
                </TouchableOpacity>
              )}
              {item.status === "Assigned" && (
                <TouchableOpacity
                  style={styles.unassignButton}
                  onPress={handleUnassign}
                >
                  <FontAwesome
                    name="user-times"
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.buttonText}>Unassign</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome name="map-marker" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            {item.location && (
              <TouchableOpacity style={styles.mapButton} onPress={openMap}>
                <FontAwesome name="map" size={16} color={COLORS.white} />
                <Text style={styles.mapButtonText}>Open Map</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.address && <Text style={styles.address}>{item.address}</Text>}

          {item.delivery_time && (
            <View style={styles.timeRow}>
              <FontAwesome name="clock-o" size={16} color={COLORS.textLight} />
              <Text style={styles.timeText}>{item.delivery_time}</Text>
            </View>
          )}

          {item.location && (
            <View style={styles.locationContainer}>
              <FontAwesome name="map-pin" size={14} color={COLORS.textLight} />
              <Text style={styles.locationText}>{formatLocationDisplay()}</Text>
              <TouchableOpacity
                style={styles.copyLinkButton}
                onPress={copyMapUrl}
              >
                <FontAwesome name="copy" size={14} color={COLORS.primary} />
                <Text style={styles.copyLinkText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {(item.customer_number || item.alternative_number) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            {item.customer_number && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${item.customer_number}`)}
              >
                <Text style={styles.contactLabel}>Customer:</Text>
                <Text style={styles.contactNumber}>{item.customer_number}</Text>
                <FontAwesome name="phone" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {item.alternative_number && (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() =>
                  Linking.openURL(`tel:${item.alternative_number}`)
                }
              >
                <Text style={styles.contactLabel}>Alternative:</Text>
                <Text style={styles.contactNumber}>
                  {item.alternative_number}
                </Text>
                <FontAwesome name="phone" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome
                name="file-text-o"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        {isAdmin && item.delivery_boy_name && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome name="user" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Assigned To</Text>
            </View>
            <Text style={styles.assigneeText}>{item.delivery_boy_name}</Text>
          </View>
        )}

        {/* Delivered Image */}
        {item.status === "Delivered" && item.delivered_image_url && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FontAwesome
                name="check-circle"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.sectionTitle}>Delivery Proof</Text>
              <TouchableOpacity
                onPress={handleDownloadImage}
                style={styles.downloadButton}
              >
                <FontAwesome name="download" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.deliveredImageContainer}>
              {console.log(
                "ItemDetailScreen - Delivered Image URL:",
                item.delivered_image_url
              )}
              <Image
                source={getImageSource(item.delivered_image_url)}
                style={styles.deliveredImage}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        {/* Delivery Boy Actions */}
        {!isAdmin && (
          <View style={styles.deliveryBoyActions}>
            {renderDeliveryBoyActions()}
          </View>
        )}

        {/* Admin Actions */}
        {isAdmin && (canEdit || canDelete) && (
          <View style={styles.adminActions}>
            {canEdit && (
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={() =>
                  navigation.navigate("AddItem", { mode: "edit", item })
                }
              >
                <FontAwesome name="edit" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Edit Item</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <FontAwesome name="trash" size={16} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Delete Item</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
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
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    margin: 16,
    width: "70%", // Make container smaller
    alignSelf: "center", // Center the container
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  placeholderContainer: {
    backgroundColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: COLORS.textLight,
    marginTop: 8,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
    flexShrink: 1,
  },
  statusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
    marginLeft: 10,
    flex: 1,
  },
  address: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 8,
    color: COLORS.textLight,
    fontSize: 14,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 6,
    flex: 1,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  contactLabel: {
    fontSize: 16,
    color: COLORS.textLight,
    marginRight: 8,
  },
  contactNumber: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  assigneeText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapButtonText: {
    color: COLORS.white,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginLeft: "auto",
  },
  copyLinkText: {
    color: COLORS.primary,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  buttonText: {
    color: COLORS.white,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  unassignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error || "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary || "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  adminActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    padding: 16,
    marginTop: 8,
  },
  editActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 130,
    justifyContent: "center",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error || "#ff4444",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 130,
    justifyContent: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  deliveryBoyActions: {
    padding: 16,
    marginTop: 8,
    alignItems: "center",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    marginBottom: 8,
    alignSelf: "center", // This makes button take content width
  },
  deliveryActions: {
    flexDirection: "column",
    gap: 12,
    alignItems: "center", // Center the buttons
  },
  attemptedButton: {
    backgroundColor: COLORS.warning || "#FFA000",
  },
  deliveredButton: {
    backgroundColor: COLORS.success,
  },
  deliveredImageContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  deliveredImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  downloadButton: {
    padding: 8,
    marginLeft: "auto",
  },
});

export default ItemDetailScreen;
