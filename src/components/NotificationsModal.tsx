'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import NotificationCard from '@/components/ui/NotificationCard';

interface Notification {
  id: string;
  task_id: number;
  product_id: number;
  category: 'Oro Verde' | 'User' | 'Communication' | 'Gender';
  category_key: string;
  checkin_date: string;
  task_name: string;
  product_name: string;
  country_name: string;
  product_owner_name: string;
  responsable_name?: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = ['All', 'Oro Verde', 'User', 'Communication', 'Gender'] as const;
type Category = typeof categories[number];

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkin-notifications');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      } else {
        console.error('Error fetching notifications:', data.error);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Deshabilitar scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar notificaciones según la categoría activa
  const filteredNotifications = activeCategory === 'All' 
    ? notifications 
    : notifications.filter(n => n.category === activeCategory);

  // Contar notificaciones por categoría
  const getCategoryCount = (cat: Category) => {
    if (cat === 'All') return notifications.length;
    return notifications.filter(n => n.category === cat).length;
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).toLowerCase();
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    return { date: formattedDate, time: formattedTime };
  };

  return (
    <div 
      className="fixed inset-0  z-[200] flex items-start justify-end pt-[67px] py-4 pl-4 pr-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100vh-5rem)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2">
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-300" />
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No notifications in this category
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const { date, time } = formatDateTime(notification.checkin_date);
              return (
                <NotificationCard
                  key={notification.id}
                  category={notification.category}
                  date={date}
                  time={time}
                  country={notification.country_name || 'N/A'}
                  productOwner={notification.product_owner_name || 'N/A'}
                  taskTitle={notification.task_name}
                  productTitle={notification.product_name}
                  productId={notification.product_id}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
