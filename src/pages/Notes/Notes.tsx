import React from 'react';
import { useTranslation } from 'react-i18next';

const Notes = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.notes')}</h1>
      <p className="text-gray-600">Your notes will appear here.</p>
    </div>
  );
};

export default Notes;