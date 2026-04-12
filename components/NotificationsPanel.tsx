import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { Icon } from '@/components/Common';
import { useNotificationsStore } from '@/store/notificationsStore';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, markAllAsRead, markAsRead, unreadCount } = useNotificationsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update relative time periodically (optional, but good for UX)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const getRelativeTime = (timestamp: number) => {
    const diffInMinutes = Math.floor((now - timestamp) / 60000);
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 left-4 sm:left-8 w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 z-[110] overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Icon icon={Bell} className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">الإشعارات</h3>
                  <p className="text-xs text-slate-500 font-bold">
                    {unreadCount() > 0 ? `لديك ${unreadCount()} إشعارات جديدة` : 'لا توجد إشعارات جديدة'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <Icon icon={X} className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm font-bold">
                  لا توجد إشعارات حالياً
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 rounded-2xl mb-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer relative ${notification.unread ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}
                  >
                    {notification.unread && (
                      <div className="absolute top-4 left-4 w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.bgColor}`}>
                        <Icon icon={notification.icon} className={`w-5 h-5 ${notification.color}`} />
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${notification.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notification.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold mt-2 block">
                          {getRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <button 
                  onClick={markAllAsRead}
                  className="w-full py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon={CheckCircle2} className="w-4 h-4" />
                  تحديد الكل كمقروء
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
