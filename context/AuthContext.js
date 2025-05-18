import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");
      const username = await AsyncStorage.getItem("username");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      const isAdminStr = await AsyncStorage.getItem("isAdmin");
      if (token) {
        setIsAuthenticated(true);
        setUserRole(role);
        setUserInfo({ username, phoneNumber });
        setIsAdmin(isAdminStr === "1");
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
      await AsyncStorage.setItem("role", userData.role);
      await AsyncStorage.setItem("username", userData.username);
      await AsyncStorage.setItem("phoneNumber", userData.phoneNumber);
      await AsyncStorage.setItem("isAdmin", userData.isAdmin.toString());

      setUserInfo({
        username: userData.username,
        phoneNumber: userData.phoneNumber,
      });
      setIsAuthenticated(true);
      setIsAdmin(userData.isAdmin === 1);
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
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo(null);
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
        isAdmin,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
