import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const CafeContext = createContext(null);

export function CafeProvider({ children }) {
  const [data, setData] = useState({
    profile: {},
    facilities: [],
    operatingHours: [],
    isOpen: true,
    todaySchedule: "",
    promotions: [],
    featuredProducts: [],
    taxAndFees: { tax_percent: 10, enable_tax: true },
    orderingPolicy: { allow_table_change: true }
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.getPublicProfile();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load cafe profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    ...data,
    loading,
    refreshProfile: fetchProfile
  };

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export function useCafe() {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error("useCafe must be used within a CafeProvider");
  }
  return context;
}
