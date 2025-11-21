import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Initialize as boolean

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      const username = await AsyncStorage.getItem("username");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      // No need to get 'isAdminStr' directly from storage if we derive it from 'role'
      // const isAdminStr = await AsyncStorage.getItem("isAdmin"); // This line can be removed

      if (token) {
        setIsAuthenticated(true);
        setUserRole(role);
        setUserInfo({ username, phoneNumber });
        // Derive isAdmin directly from the stored role
        setIsAdmin(role === "admin"); // Set isAdmin based on role string
      }
    } catch (error) {
      console.log("Error checking auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (userData) => {
    try {
      await AsyncStorage.setItem("token", userData.token);
      await AsyncStorage.setItem("userId", userData.userId);
      await AsyncStorage.setItem("role", userData.role); // Store the role string
      await AsyncStorage.setItem("username", userData.username);
      await AsyncStorage.setItem("phoneNumber", userData.phoneNumber);

      // Derive isAdmin from userData.role and store as a string ("true" or "false")
      await AsyncStorage.setItem(
        "isAdmin",
        userData.role === "admin" ? "true" : "false" // Store "true" or "false" string
      );

      setUserInfo({
        username: userData.username,
        phoneNumber: userData.phoneNumber,
      });
      setIsAuthenticated(true);
      setUserRole(userData.role); // Update userRole state
      // Derive isAdmin state directly from userData.role (which is a string from backend)
      setIsAdmin(userData.role === "admin"); // Set isAdmin based on role string
    } catch (error) {
      console.log("Error storing user data:", error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("phoneNumber");
      await AsyncStorage.removeItem("isAdmin"); // Also remove isAdmin on sign out

      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo(null);
      setIsAdmin(false); // Reset isAdmin state
    } catch (error) {
      console.log("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userRole,
        userInfo,
        isAdmin, // isAdmin is now a boolean
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
