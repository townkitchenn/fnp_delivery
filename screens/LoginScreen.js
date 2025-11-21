import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Image,
} from "react-native";
import { loginUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/styles";

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (username.length < 1 || password.length < 6) {
      Alert.alert("Error", "Please enter valid credentials");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(username, password);
      console.log("respo", response);
      await signIn(response); // Pass entire response to signIn
      // Navigation will be handled by AuthContext
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
        <Text style={styles.authTitle}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={[styles.authButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.authSecondaryButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.secondaryButtonText}>New user? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
