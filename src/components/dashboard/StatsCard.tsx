import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4 rtl:space-x-reverse">
      {icon && <span className="text-3xl">{icon}</span>}
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;