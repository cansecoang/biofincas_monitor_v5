'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import NotificationCard from '@/components/ui/NotificationCard';

interface Notification {
  id: string;
  category: 'Oro Verde' | 'User' | 'Communication' | 'Gender';
  date: string;
  time: string;
  country: string;
  productOwner: string;
  taskTitle: string;
  productTitle: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Datos de ejemplo - reemplazar con datos reales
const mockNotifications: Notification[] = [
  {
    id: '1',
    category: 'Communication',
    date: 'fri, 31 oct',
    time: '18:00',
    country: 'Guatemala',
    productOwner: 'Oro Verde',
    taskTitle: 'Implementation in the field of the producers survey',
    productTitle: 'Survey of coffee producers in Guatemala',
  },
  {
    id: '2',
    category: 'User',
    date: 'fri, 31 oct',
    time: '18:00',
    country: 'Guatemala',
    productOwner: 'Oro Verde',
    taskTitle: 'Implementation in the field of the producers survey',
    productTitle: 'Survey of coffee producers in Guatemala',
  },
  {
    id: '3',
    category: 'Gender',
    date: 'fri, 31 oct',
    time: '18:00',
    country: 'Guatemala',
    productOwner: 'Oro Verde',
    taskTitle: 'Implementation in the field of the producers survey',
    productTitle: 'Survey of coffee producers in Guatemala',
  },
  {
    id: '4',
    category: 'Oro Verde',
    date: 'fri, 31 oct',
    time: '18:00',
    country: 'Guatemala',
    productOwner: 'Oro Verde',
    taskTitle: 'Implementation in the field of the producers survey',
    productTitle: 'Survey of coffee producers in Guatemala',
  },
  {
    id: '5',
    category: 'Communication',
    date: 'fri, 31 oct',
    time: '18:00',
    country: 'Guatemala',
    productOwner: 'Oro Verde',
    taskTitle: 'Implementation in the field of the producers survey',
    productTitle: 'Survey of coffee producers in Guatemala',
  },
];

const categories = ['All', 'Oro Verde', 'Gender', 'User'] as const;

type Category = typeof categories[number];

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  if (!isOpen) return null;

  // Filtrar notificaciones según la categoría activa
  const filteredNotifications = activeCategory === 'All' 
    ? mockNotifications 
    : mockNotifications.filter(n => n.category === activeCategory);

  // Contar notificaciones por categoría
  const getCategoryCount = (cat: Category) => {
    if (cat === 'All') return mockNotifications.length;
    return mockNotifications.filter(n => n.category === cat).length;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-4 px-6 border-b border-gray-200">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`pb-3 px-2 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeCategory === category
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category} ({getCategoryCount(category)})
              {activeCategory === category && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No notifications in this category
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                category={notification.category}
                date={notification.date}
                time={notification.time}
                country={notification.country}
                productOwner={notification.productOwner}
                taskTitle={notification.taskTitle}
                productTitle={notification.productTitle}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
