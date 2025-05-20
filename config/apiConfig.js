// Use your computer's IP address instead of localhost
export const API_BASE_URL = "https://pngfs.com/api"; // Replace X with your IP's last digit

export const ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  DELIVERY_BOY_ITEMS: (id) => `/delivery-boys/${id}/items`,
  UPDATE_ITEM_STATUS: (id) => `/delivery-items/${id}/status`,
  PENDING_ITEMS: "/delivery-items/pending",
  ASSIGN_ITEM: (id) => `/delivery-items/${id}/assign`,
  ALL_ITEMS: "/delivery-items",
  CREATE_ITEM: "/delivery-items",
};
