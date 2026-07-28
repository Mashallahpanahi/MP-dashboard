import React from 'react';
import { useTranslation } from 'react-i18next';

const TeacherPayment = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.teacherPayment')}</h1>
      <p className="text-gray-600">Teacher payment management will appear here.</p>
    </div>
  );
};

export default TeacherPayment;