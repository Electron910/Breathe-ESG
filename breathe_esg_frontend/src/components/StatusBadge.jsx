import clsx from 'clsx';
import { CheckCircle2, AlertCircle, Clock, XCircle, Lock } from 'lucide-react';

export default function StatusBadge({ status, reason }) {
  const styles = {
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    SUSPICIOUS: 'bg-orange-50 text-orange-700 border-orange-200',
    ERROR: 'bg-red-50 text-red-700 border-red-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    LOCKED: 'bg-gray-100 text-gray-200 border-gray-300',
  };

  const icons = {
    PENDING: Clock,
    SUSPICIOUS: AlertCircle,
    ERROR: XCircle,
    APPROVED: CheckCircle2,
    LOCKED: Lock,
  };

  const Icon = icons[status] || Clock;

  return (
    <div className="group relative inline-flex">
      <span className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[status] || styles.PENDING
      )}>
        <Icon className="w-3.5 h-3.5 mr-1" />
        {status}
      </span>
      {reason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-xl z-10">
          {reason}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}
