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
} from "react-native";
import { createItem } from "../services/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "../config/colors";

const AddItemScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    customer_number: "",
    delivery_time: null, // Changed to null initially
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const onDateChange = (event, selected) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selected) {
      setSelectedDate(selected);
      if (Platform.OS === "android") {
        setShowTimePicker(true);
      }
    }
  };

  const onTimeChange = (event, selected) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (event.type === "set" && selected) {
      const finalDateTime = new Date(selected);
      if (selectedDate) {
        finalDateTime.setFullYear(selectedDate.getFullYear());
        finalDateTime.setMonth(selectedDate.getMonth());
        finalDateTime.setDate(selectedDate.getDate());
      }
      setFormData({ ...formData, delivery_time: finalDateTime });
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.address) {
      Alert.alert("Error", "Please fill name and address fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        delivery_time: formatDateTime(formData.delivery_time),
      };

      console.log(payload);
      await createItem(payload);
      Alert.alert("Success", "Item added successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
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
        <Text style={styles.headerText}>Add New Item</Text>
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
          <Text style={styles.label}>Customer Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter customer number"
            placeholderTextColor={COLORS.textLight}
            value={formData.customer_number}
            onChangeText={(text) =>
              setFormData({ ...formData, customer_number: text })
            }
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Delivery Time</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={[
                styles.dateText,
                !formData.delivery_time && styles.placeholderText,
              ]}
            >
              {formData.delivery_time
                ? formatDateTime(formData.delivery_time)
                : "Select delivery date and time"}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={selectedDate || new Date()}
            mode="date"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            testID="timePicker"
            value={selectedDate || new Date()}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleAddItem}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Saving..." : "Save"}
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
    height: 48, // Increased from 42
  },
  textArea: {
    height: 90, // Increased from 80
    textAlignVertical: "top",
  },
  datePickerButton: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48, // Increased from 42
  },
  dateText: {
    fontSize: 14, // Reduced from 16
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
});

export default AddItemScreen;
