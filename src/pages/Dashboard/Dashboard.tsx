import React from 'react';
import { useTranslation } from 'react-i18next';
import StatsCard from '@components/dashboard/StatsCard';
import RecentActivity from '@components/dashboard/RecentActivity';

// Static data (will be replaced by API later)
const statsData = [
  { title: 'dashboard.stats.totalUsers', value: 1250, icon: '👥' },
  { title: 'dashboard.stats.revenue', value: '$34,200', icon: '💰' },
  { title: 'dashboard.stats.orders', value: 342, icon: '📦' },
];

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'Signed up', time: '2 min ago' },
  { id: 2, user: 'Jane Smith', action: 'Placed order', time: '15 min ago' },
  { id: 3, user: 'Bob Johnson', action: 'Updated profile', time: '1 hour ago' },
];

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={t(stat.title)}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} />
    </div>
  );
};

export default Dashboard;