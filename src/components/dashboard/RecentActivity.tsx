import React from 'react';
import { useTranslation } from 'react-i18next';

interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">
        {t('dashboard.recentActivity', 'Recent Activity')}
      </h2>
      <ul className="divide-y divide-gray-200">
        {activities.map((item) => (
          <li key={item.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{item.user}</p>
              <p className="text-sm text-gray-600">{item.action}</p>
            </div>
            <span className="text-sm text-gray-500">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;