'use client';

interface NotificationCardProps {
  category: 'Oro Verde' | 'User' | 'Communication' | 'Gender';
  date: string;
  time: string;
  country: string;
  productOwner: string;
  taskTitle: string;
  productTitle: string;
  productId: number;
  taskId: number;
  onViewTask: (taskId: number) => void;
}

// Configuración de colores por categoría
const categoryColors = {
  'Oro Verde': {
    bg: 'bg-blue-50',
    badge: 'bg-blue-400 text-white',
    button: 'bg-blue-400 hover:bg-blue-500 text-white',
  },
  'User': {
    bg: 'bg-amber-50',
    badge: 'bg-amber-400 text-white',
    button: 'bg-amber-400 hover:bg-amber-500 text-white',
  },
  'Communication': {
    bg: 'bg-cyan-50',
    badge: 'bg-cyan-400 text-white',
    button: 'bg-cyan-400 hover:bg-cyan-500 text-white',
  },
  'Gender': {
    bg: 'bg-purple-50',
    badge: 'bg-purple-400 text-white',
    button: 'bg-purple-400 hover:bg-purple-500 text-white',
  },
};

export default function NotificationCard({
  category,
  date,
  time,
  country,
  productOwner,
  taskTitle,
  productTitle,
  productId,
  taskId,
  onViewTask,
}: NotificationCardProps) {
  const colors = categoryColors[category];

  const handleViewTask = () => {
    onViewTask(taskId);
  };

  return (
    <div className={`${colors.bg} rounded-3xl pb-4 shadow-sm border leading-tight border-gray-200 px-3 py-2 space-y-2.5`}>
      {/* Header: Title + Category Badge | Date/Time + Location */}
      <div className="flex items-start justify-between">
        {/* Left: Title + Badge */}
        <div className="">
          <h3 className="text-base font-semibold text-gray-900">Check-in</h3>
          <span className={`inline-block -ml-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
            {category.toLowerCase()}
          </span>
        </div>

        {/* Right: Date/Time + Location */}
        <div className="text-right text-xs leading-relaxed">
          <div className="text-gray-400">{date}, {time}</div>
          <div className="text-gray-400">{country} | {productOwner}</div>
        </div>
      </div>

      {/* Middle: Task Title */}
      <div className="pb-3">
        <p className="text-sm font-medium text-gray-900 leading-snug">
          {taskTitle}
        </p>
      </div>

      {/* Footer: Product Info + Button */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Product Info */}
        <div className="text-xs max-w-[50%]">
          <span className="text-gray-400 font-medium">PRODUCT </span>
          <span className="text-gray-400 break-words">{productTitle}</span>
        </div>

        {/* View Task Button */}
        <button
          onClick={handleViewTask}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${colors.button}`}
        >
          View Task
        </button>
      </div>
    </div>
  );
}
