import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import AdminScreen from "./screens/AdminScreen";
import AddItemScreen from "./screens/AddItemScreen";
import DeliveryBoyScreen from "./screens/DeliveryBoyScreen";
import PickItemScreen from "./screens/PickItemScreen";
import ProfileScreen from "./screens/ProfileScreen";
import DeliveryBoysListScreen from "./screens/DeliveryBoysListScreen";
import { COLORS } from "./styles/globalStyles";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {isAdmin ? (
              <Stack.Screen name="Admin" component={AdminScreen} />
            ) : (
              <Stack.Screen name="DeliveryBoy" component={DeliveryBoyScreen} />
            )}
            <Stack.Screen name="AddItem" component={AddItemScreen} />
            <Stack.Screen name="PickItem" component={PickItemScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="DeliveryBoysList"
              component={DeliveryBoysListScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
