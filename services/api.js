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

    console.log("res", response);

    const responseData = await response.json();

    console.log("hhhhh", responseData);

    if (!response.ok) {
      throw new Error(responseData.error);
    }

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getDeliveryBoyItems = async (status) => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const response = await fetch(
      `${API_BASE_URL}/delivery-boys/${userId}/items/${status}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch items");
    }

    const data = await response.json();
    console.log("getDeliveryBoyItems data:", data);
    return data;
  } catch (error) {
    console.error("getDeliveryBoyItems error:", error);
    throw error;
  }
};

export const updateItemStatus = async (itemId, formData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/delivery-items/${itemId}/status`,
      {
        method: "PUT",
        body: formData,
      }
    );

    // Log the full response for debugging
    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Response text:", responseText);

    if (!response.ok) {
      throw new Error(responseText || "Failed to update status");
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error("API Error Details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const getPendingItems = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-items/pending`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch pending items");
    }

    const data = await response.json();
    console.log("getPendingItems data:", data);
    return data;
  } catch (error) {
    console.error("getPendingItems error:", error);
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

export const createItem = async (formData) => {
  try {
    console.log("--> API Call: Preparing to send data to backend.");

    // --- IMPORTANT: READ THIS FOR UNDERSTANDING FormData LOGGING ---
    // The console.log of `formData` as `{"_parts": [...]}` is the
    // INTERNAL REPRESENTATION of the FormData object in React Native's debugger.
    // It is NOT how the data looks over the network wire.
    // The fetch API correctly serializes this `FormData` object
    // into the 'multipart/form-data' format that your backend expects.
    // You WILL NOT see a clean JSON-like object in the console for FormData.
    // This is NORMAL and CORRECT behavior.
    console.log("FormData object content for debugging (internal _parts):");
    if (formData && formData._parts) {
      formData._parts.forEach((part) => {
        if (part[0] === "image") {
          // For file parts, log relevant details
          console.log(
            `  ${part[0]}: { name: '${part[1].name}', type: '${
              part[1].type
            }', uri: '${part[1].uri.substring(0, 50)}...' }`
          );
        } else {
          // For text parts
          console.log(`  ${part[0]}: '${part[1]}'`);
        }
      });
    } else {
      console.log("  (FormData object is empty or not fully initialized)");
    }
    // --- END IMPORTANT NOTE ---

    // This `Workspace` call will send the `formData` object as `multipart/form-data`.
    // The `Content-Type` header is automatically set by the browser/React Native
    // when you provide a `FormData` object as the `body`.
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CREATE_ITEM}`, {
      method: "POST",
      body: formData, // THIS IS THE CORRECT WAY TO SEND FormData
    });

    console.log("api create res", response);

    const responseData = await response.json();

    if (!response.ok) {
      // If the server responded with an error status (e.g., 400, 500)
      const errorMessage =
        responseData.error || "An unknown error occurred during item creation.";
      throw new Error(errorMessage);
    }

    console.log("<-- API Call: Item created successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("<-- API Call Error in createItem:", error.message);
    // Re-throw the error so it can be caught and displayed in AddItemScreen
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

export const unassignItem = async (itemId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.UNASSIGN_ITEM(itemId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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

export const updateItem = async (itemId, formData) => {
  try {
    console.log("--> API Call: Preparing to update item:", itemId);
    console.log("FormData object content for debugging:", formData._parts);

    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.UPDATE_ITEM(itemId)}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const text = await response.text();
    console.log("Server response:", text);

    if (!response.ok) {
      throw new Error(`Failed to update item: ${text}`);
    }

    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (e) {
      return { success: true };
    }
  } catch (error) {
    console.error("<-- API Call Error in updateItem:", error.message);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delivery-items/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || "Failed to delete item");
      } catch (e) {
        throw new Error("Failed to delete item");
      }
    }

    return true;
  } catch (error) {
    console.error("Delete item error:", error);
    throw error;
  }
};

export const getItemsByStatus = async (status) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/delivery-items/status/${status}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    console.log("getItemsByStatus response", response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch items");
    }

    const data = await response.json();
    console.log("getItemsByStatus data:", data);
    return data;
  } catch (error) {
    console.error("getItemsByStatus error:", error);
    throw error;
  }
};

export const getStatusCounts = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/delivery-items/counts/status`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch status counts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching status counts:", error);
    throw error;
  }
};

export const getDeliveryBoyStatusCounts = async (deliveryBoyId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/delivery-boys/${deliveryBoyId}/counts/status`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch status counts");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching delivery boy status counts:", error);
    throw error;
  }
};
