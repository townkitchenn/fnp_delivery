import { API_BASE_URL, ENDPOINTS } from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ...userData, isAdmin: false }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getDeliveryBoyItems = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.DELIVERY_BOY_ITEMS(userId)}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const updateItemStatus = async (itemId, status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.UPDATE_ITEM_STATUS(itemId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getPendingItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PENDING_ITEMS}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const assignItem = async (itemId, deliveryBoyId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.ASSIGN_ITEM(itemId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ deliveryBoyId }),
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getAllItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ALL_ITEMS}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_ITEM}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(itemData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error);
    }
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getDeliveryBoys = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-boys`, {
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error);
    }
    return data;
  } catch (error) {
    throw error;
  }
};
