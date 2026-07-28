import React from "react";
import { useTranslation } from "react-i18next";

const OtherExpenses = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t("sidebar.otherExpenses")}</h1>
      <p className="text-gray-600">
        Other expenses management will appear here.
      </p>
    </div>
  );
};

export default OtherExpenses;
