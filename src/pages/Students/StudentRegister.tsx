import React from 'react';
import { useTranslation } from 'react-i18next';

const StudentRegister = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.studentRegister')}</h1>
      <p className="text-gray-600">Student registration form will appear here.</p>
    </div>
  );
};

export default StudentRegister;