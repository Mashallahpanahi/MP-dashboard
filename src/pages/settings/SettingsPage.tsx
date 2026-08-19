// src/pages/Settings/SettingsPage.tsx
import { useState, useEffect } from "react";
import PaymentMethodCard from "@/components/settings/SelectPaymentMethodCard";
import MonthlyFeeCard from "@/components/settings/MonthlyFeeCard";
import BookFeeCard from "@/components/settings/BookFeeCard";
import { getPaymentMethod } from "@/api/settingsApi";
import type { PaymentMethod } from "@/types/settings";

const SettingsPage = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch payment method on mount
  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const fetchPaymentMethod = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPaymentMethod();
      setPaymentMethod(data);
    } catch (error) {
      console.error("Failed to fetch payment method:", error);
      // If 404, it means no payment method exists yet
      if (error instanceof Error && error.message.includes("404")) {
        setPaymentMethod(null);
      } else {
        setError("Failed to load payment method");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle payment method change from the card
  const handlePaymentMethodChange = () => {
    fetchPaymentMethod();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your system settings and configurations
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your system settings and configurations
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Payment Method Card - Always visible */}
        <PaymentMethodCard onPaymentMethodChange={handlePaymentMethodChange} />

        {/* Conditional Fee Cards based on payment method */}
        {paymentMethod && (
          <>
            {paymentMethod.paymentMethod === "per_month" && (
              <MonthlyFeeCard />
            )}
            
            {paymentMethod.paymentMethod === "per_book" && (
              <BookFeeCard />
            )}
          </>
        )}

        {/* Show message when no payment method is configured */}
        {!paymentMethod && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Payment Method Configured
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Please configure a payment method first. The fee configuration options will appear after you select and save a payment method.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;