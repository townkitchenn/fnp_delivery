// AddItemScreen.js
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  Image, // Required for displaying selected image
} from "react-native";
import { createItem, updateItem } from "../services/api"; // Adjust import path as per your project structure
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "../config/colors"; // Adjust import path as per your project structure
import * as ImagePicker from "expo-image-picker"; // For image picking functionality
import { FontAwesome } from "@expo/vector-icons"; // For camera icon
import { compressImage } from "../utils/imageUtils";

const AddItemScreen = ({ route, navigation }) => {
  const editItem = route.params?.item;
  const isEditMode = route.params?.mode === "edit";

  const [formData, setFormData] = useState({
    name: editItem?.name || "",
    description: editItem?.description || "",
    address: editItem?.address || "",
    customer_number: editItem?.customer_number || "",
    alternative_number: editItem?.alternative_number || "",
    delivery_time: editItem?.delivery_time || null,
    location: editItem?.location || "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(editItem?.image_url || null); // Stores the URI of the selected image

  // Handlers for Date and Time Pickers
  const onDateChange = (event, selected) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "set" && selected) {
      setSelectedDate(selected);
      if (Platform.OS === "android") setShowFromTimePicker(true); // Auto-open from time picker on Android
    }
  };

  const onFromTimeChange = (event, selected) => {
    if (Platform.OS === "android") setShowFromTimePicker(false);
    if (event.type === "set" && selected) {
      setFromTime(selected);
      // Update the formData with the formatted delivery_time as soon as 'from' time is set
      const formatted = formatTimeRange(selectedDate, selected, toTime); // Pass toTime as well
      setFormData((prev) => ({ ...prev, delivery_time: formatted }));
    }
  };

  const onToTimeChange = (event, selected) => {
    if (Platform.OS === "android") setShowToTimePicker(false);
    if (event.type === "set" && selected) {
      setToTime(selected);
      // Update the formData with the formatted delivery_time including 'to' time
      const formatted = formatTimeRange(selectedDate, fromTime, selected);
      setFormData((prev) => ({ ...prev, delivery_time: formatted }));
    }
  };

  // Helper function to format the delivery time string
  const formatTimeRange = (date, fromTime, toTime = null) => {
    if (!date || !fromTime) return "";

    const formatTime = (timeDate) => {
      return timeDate.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true, // For AM/PM format
      });
    };

    const formattedDate = date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return toTime
      ? `${formattedDate}, ${formatTime(fromTime)} - ${formatTime(toTime)}`
      : `${formattedDate}, ${formatTime(fromTime)}`;
  };

  // Logic for opening date/time pickers
  const handleTimePress = () => {
    if (!selectedDate) {
      setShowDatePicker(true);
    } else if (!fromTime) {
      setShowFromTimePicker(true);
    } else {
      setShowToTimePicker(true);
    }
  };

  // Image picking functionality
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const compressed = await compressImage(result.assets[0].uri);
        setImageUri(compressed.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const trimmedName = formData.name.trim();
    const trimmedAddress = formData.address.trim();

    if (trimmedName.length === 0 || trimmedAddress.length === 0) {
      Alert.alert("Error", "Please fill name and address fields.");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Add all form fields except image first
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, String(formData[key]).trim());
        }
      });

      // Handle image separately
      if (imageUri && !imageUri.startsWith("http")) {
        const imageUriParts = imageUri.split(".");
        const fileType = imageUriParts[imageUriParts.length - 1];
        const fileName = `item_image_${Date.now()}.${fileType}`;

        formDataToSend.append("image", {
          uri: imageUri,
          type: `image/${fileType}`,
          name: fileName,
        });
      }

      console.log("Submitting form data:", formDataToSend._parts);

      if (isEditMode) {
        console.log("data", formDataToSend);
        await updateItem(editItem.id, formDataToSend);
        Alert.alert("Success", "Item updated successfully", [
          { text: "OK", onPress: () => navigation.pop(2) },
        ]);
      } else {
        console.log("data", formDataToSend);
        await createItem(formDataToSend);
        Alert.alert("Success", "Item added successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert(
        "Error",
        error.message || `Failed to ${isEditMode ? "update" : "add"} item`
      );
    } finally {
      setLoading(false);
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
        <Text style={styles.headerText}>
          {isEditMode ? "Edit Item" : "Add New Item"}
        </Text>
      </View>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            placeholderTextColor={COLORS.textLight}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter item description"
            placeholderTextColor={COLORS.textLight}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter delivery address"
            placeholderTextColor={COLORS.textLight}
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={2}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            placeholderTextColor={COLORS.textLight}
            value={formData.location}
            onChangeText={(text) =>
              setFormData({ ...formData, location: text })
            }
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Customer Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer number"
            placeholderTextColor={COLORS.textLight}
            value={formData.customer_number}
            onChangeText={(text) =>
              setFormData({ ...formData, customer_number: text })
            }
            keyboardType="numeric" // Ensure numeric keyboard
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Alternative Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter alternative number (optional)"
            placeholderTextColor={COLORS.textLight}
            value={formData.alternative_number}
            onChangeText={(text) =>
              setFormData({ ...formData, alternative_number: text })
            }
            keyboardType="numeric" // Ensure numeric keyboard
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Time</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={handleTimePress}
          >
            <Text
              style={[
                styles.dateText,
                !formData.delivery_time && styles.placeholderText,
              ]}
            >
              {formData.delivery_time || "Select delivery date and time"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date and Time Pickers */}
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={selectedDate || new Date()}
            mode="date"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()} // Prevent picking past dates
          />
        )}
        {showFromTimePicker && (
          <DateTimePicker
            testID="fromTimePicker"
            value={fromTime || new Date()}
            mode="time"
            is24Hour={false} // Use 12-hour format with AM/PM
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onFromTimeChange}
          />
        )}
        {showToTimePicker && (
          <DateTimePicker
            testID="toTimePicker"
            value={toTime || new Date()}
            mode="time"
            is24Hour={false} // Use 12-hour format with AM/PM
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onToTimeChange}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Item Image</Text>
          <TouchableOpacity
            style={styles.imageUploadButton}
            onPress={pickImage}
          >
            {imageUri ? (
              // Display selected image preview
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              // Placeholder for image upload
              <View style={styles.uploadPlaceholder}>
                <FontAwesome name="camera" size={24} color={COLORS.textLight} />
                <Text style={styles.uploadText}>Upload Image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
  headerText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: COLORS.textDark,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.white,
    padding: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
    height: 48,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top", // For Android multiline TextInput
  },
  datePickerButton: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    width: "40%",
    alignSelf: "center",
  },
  submitButtonText: {
    color: COLORS.white,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonDisabled: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  imageUploadButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "70%", // Make container smaller
    aspectRatio: 1, // Force square container
    alignSelf: "center", // Center the container
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // Ensure image fits within square
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
    color: COLORS.textLight,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: "auto",
  },
  saveButtonText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AddItemScreen;
