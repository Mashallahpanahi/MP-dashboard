// src/pages/Settings/SettingsPage.tsx
import PaymentMethodCard from "@/components/settings/SelectPaymentMethodCard";

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

        {/* More cards will be added here later */}
        {/* 
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Coming Soon</h3>
          <p className="mt-1 text-sm text-gray-500">More settings will be available soon.</p>
        </div>
        */}
      </div>
    </div>
  );
};

export default SettingsPage;