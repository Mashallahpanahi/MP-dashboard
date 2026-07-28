import React from "react";
import { useTranslation } from "react-i18next";

const AllTeachers = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">All Teachers</h1>
      <p className="text-gray-600">List of all teachers will appear here.</p>
      {/* You'll add your teacher table/list here later */}
    </div>
  );
};

export default AllTeachers;
