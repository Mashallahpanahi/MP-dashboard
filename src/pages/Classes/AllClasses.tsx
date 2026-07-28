import React from 'react';
import { useTranslation } from 'react-i18next';

const AllClasses = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.allClasses')}</h1>
      <p className="text-gray-600">List of all classes will appear here.</p>
    </div>
  );
};

export default AllClasses;