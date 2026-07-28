import React from 'react';
import { useTranslation } from 'react-i18next';

const TeacherRegister = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Register a Teacher</h1>
      <p className="text-gray-600">This is the teacher registration page.</p>
      {/* You'll add your form here later */}
    </div>
  );
};

export default TeacherRegister;