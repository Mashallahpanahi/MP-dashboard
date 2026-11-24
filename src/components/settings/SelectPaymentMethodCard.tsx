// src/components/settings/PaymentMethodCard.tsx
import { useState, useEffect } from "react";
import { usePaymentMethod, useCreatePaymentMethod } from "@/api/settingsApi";
import type { PaymentMethod } from "@/api/settingsApi";

interface PaymentMethodCardProps {
  onPaymentMethodChange?: () => void;
}

const PaymentMethodCard = ({
  onPaymentMethodChange,
}: PaymentMethodCardProps) => {
  // ✅ Read hook (replaces getPaymentMethod + local loading/error state)
  const {
    data: fetchedPaymentMethod,
    loading,
    error: fetchError,
    refetch: refetchPaymentMethod,
  } = usePaymentMethod();

  // ✅ Create hook (replaces createPaymentMethod + local saving state)
  const { create: createPaymentMethod, loading: saving } =
    useCreatePaymentMethod();

  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  // Combined error: local first, then fetch error
  const error = localError || fetchError || "";

  // Payment method options - Only two options
  const paymentOptions = [
    { value: "per_month", label: "Per Month" },
    { value: "per_book", label: "Per Book" },
  ];

  // ✅ Sync hook data → local state (mirrors original fetchPaymentMethod success/404 branches)
  useEffect(() => {
    if (loading) return;

    if (fetchedPaymentMethod) {
      setSelectedMethod(fetchedPaymentMethod.paymentMethod);
      setIsConfigured(true);
    } else if (fetchError && !fetchError.includes("404")) {
      // Non-404 failure — show error banner (matches original `else { setError(...) }`)
      setLocalError("Failed to load payment method");
    } else {
      // No data (or 404) — treat as "not configured"
      setSelectedMethod("");
      setIsConfigured(false);
    }
  }, [fetchedPaymentMethod, loading, fetchError]);

  const handleSave = async () => {
    if (!selectedMethod) {
      setLocalError("Please select a payment method");
      return;
    }

    setLocalError("");
    setSuccess("");

    const ok = await createPaymentMethod({
      paymentMethod: selectedMethod as any,
    });

    if (!ok) {
      setLocalError("Failed to save payment method");
      return;
    }

    setIsConfigured(true);
    setSuccess("Payment method configured successfully!");

    // Notify parent component about the change
    if (onPaymentMethodChange) {
      onPaymentMethodChange();
    }

    setTimeout(() => setSuccess(""), 3000);

    // Refresh to pick up server-canonical state
    refetchPaymentMethod();
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-sm text-gray-500">
              Loading payment method...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Select Payment Method
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {isConfigured
              ? "Payment method is configured and cannot be changed"
              : "Choose how you want to handle payments in the system"}
          </p>
        </div>
        {isConfigured ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
            Configured
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Not Configured
          </span>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-sm font-medium text-green-700">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {isConfigured ? (
        // ===== READ-ONLY VIEW =====
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Configured Payment Method
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {paymentOptions.find(
                    (opt) => opt.value === fetchedPaymentMethod?.paymentMethod,
                  )?.label || fetchedPaymentMethod?.paymentMethod}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-green-600">Locked</span>
              </div>
            </div>
            <div className="mt-2 rounded-lg bg-blue-50 p-2">
              <p className="text-sm text-blue-700">
                {fetchedPaymentMethod?.paymentMethod === "per_month" &&
                  "Payments will be calculated on a monthly basis."}
                {fetchedPaymentMethod?.paymentMethod === "per_book" &&
                  "Payments will be calculated per book."}
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Payment method can only be configured once. Contact administrator
              to change.
            </p>
          </div>
        </div>
      ) : (
        // ===== SELECTION VIEW (Only shown when not configured) =====
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {paymentOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center rounded-lg border-2 p-4 transition ${
                    selectedMethod === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.value}
                    checked={selectedMethod === option.value}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Description of selected method */}
          {selectedMethod && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">
                  {
                    paymentOptions.find((opt) => opt.value === selectedMethod)
                      ?.label
                  }
                  :
                </span>{" "}
                {selectedMethod === "per_month" &&
                  "Payments will be calculated on a monthly basis."}
                {selectedMethod === "per_book" &&
                  "Payments will be calculated per book."}
              </p>
            </div>
          )}

          {/* Info message */}
          <div className="rounded-lg bg-yellow-50 p-3">
            <p className="text-sm text-yellow-700">
              <svg
                className="mr-2 inline h-4 w-4"
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
              <span className="font-medium">Note:</span> This setting can only
              be configured once. After saving, you will not be able to change
              it from the frontend.
            </p>
          </div>

          {/* Actions - Only show Save button when not configured */}
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !selectedMethod}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                saving || !selectedMethod
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="mr-2 inline h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Configure Payment Method"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;