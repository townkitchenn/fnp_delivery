import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { registerUser } from "../services/api";
import styles from "../styles/styles";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (username.length < 1) {
      Alert.alert("Error", "Please enter a username");
      return;
    }
    if (!phone.match(/^[0-9]{10}$/)) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await registerUser({
        username,
        password,
        confirmPassword,
        phoneNumber: phone,
      });
      Alert.alert("Success", "Registration successful", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authCard}>
        <Image source={require("../assets/icon.png")} style={styles.logo} />
        <Text style={styles.authTitle}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="numeric"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        <TouchableOpacity
          style={[styles.authButton, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authSecondaryButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.secondaryButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;
