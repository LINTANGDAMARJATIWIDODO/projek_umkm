const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("ruang_namu_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada permintaan.");
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  getMe: () => request("/auth/me"),

  // Products
  getProducts: (params = "") => request(`/products?${params}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  adjustStock: (id, data) => request(`/products/${id}/adjust-stock`, { method: "POST", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // Categories
  getCategories: () => request("/categories"),
  createCategory: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),

  // Tables
  getTables: () => request("/tables"),
  validateTable: (table, token) => request(`/tables/validate?table=${encodeURIComponent(table)}${token ? `&token=${encodeURIComponent(token)}` : ""}`),
  createTable: (data) => request("/tables", { method: "POST", body: JSON.stringify(data) }),
  updateTable: (id, data) => request(`/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getTableQr: (id) => request(`/tables/${id}/qr`),

  // Orders
  createOrder: (data) => request("/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrder: (id, token = "") => request(`/orders/${id}${token ? `?token=${encodeURIComponent(token)}` : ""}`),
  getOrders: (params = "") => request(`/orders?${params}`),
  updateOrderStatus: (id, data) => request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify(data) }),
  getCashierQueue: () => request("/orders/queue"),

  // Payments
  createPayment: (data) => request("/payments/create", { method: "POST", body: JSON.stringify(data) }),
  getPaymentStatus: (paymentId) => request(`/payments/${paymentId}/status`),
  processCashPayment: (data) => request("/payments/cash", { method: "POST", body: JSON.stringify(data) }),
  cancelPayment: (paymentId, data) => request(`/payments/${paymentId}/cancel`, { method: "POST", body: JSON.stringify(data) }),
  refundPayment: (paymentId, data) => request(`/payments/${paymentId}/refund`, { method: "POST", body: JSON.stringify(data) }),
  reconcilePayments: () => request("/payments/reconcile"),

  // Profile & Settings
  getPublicProfile: () => request("/profile"),
  updateProfileSettings: (data) => request("/profile", { method: "PUT", body: JSON.stringify(data) }),
  getPromotions: () => request("/profile/promotions"),
  createPromotion: (data) => request("/profile/promotions", { method: "POST", body: JSON.stringify(data) }),
  updatePromotion: (id, data) => request(`/profile/promotions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deletePromotion: (id) => request(`/profile/promotions/${id}`, { method: "DELETE" }),

  // Admin
  getDashboard: () => request("/admin/dashboard"),
  getStockMovements: () => request("/admin/stock-movements"),
  getAuditLogs: () => request("/admin/audit-logs"),
  getUsers: () => request("/admin/users"),
  createUser: (data) => request("/admin/users", { method: "POST", body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getPaymentConfig: () => request("/admin/settings/payment"),
  updatePaymentConfig: (data) => request("/admin/settings/payment", { method: "PUT", body: JSON.stringify(data) }),
  getExportCsvUrl: () => `${BASE_URL}/admin/orders/export-csv`
};
