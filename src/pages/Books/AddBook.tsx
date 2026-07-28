import React from 'react';
import { useTranslation } from 'react-i18next';

const AddBook = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.addBook')}</h1>
      <p className="text-gray-600">Add a new book form will appear here.</p>
    </div>
  );
};

export default AddBook;