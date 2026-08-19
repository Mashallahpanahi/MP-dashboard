// src/pages/Settings/SettingsPage.tsx
import PaymentMethodCard from "@/components/settings/SelectPaymentMethodCard";
import MonthlyFeeCard from "@/components/settings/MonthlyFeeCard";

const SettingsPage = () => {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your system settings and configurations
        </p>
      </div>

      {/* Settings Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Payment Method Card */}
        <PaymentMethodCard />

        {/* Monthly Fees Card */}
        <MonthlyFeeCard />

        {/* More cards will be added here later */}
      </div>
    </div>
  );
};

export default SettingsPage;