import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCircle2, Info, X, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface NotificationDropdownProps {
    notifications: AppNotification[];
    onReadAll: () => void;
    onClose: () => void;
    onNotificationClick: (link?: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    notifications,
    onReadAll,
    onClose,
    onNotificationClick
}) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Bell size={16} className="text-brand-blue" />
                    Notifications
                    {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </h3>
                <button
                    onClick={onReadAll}
                    className="text-[11px] font-semibold text-brand-blue hover:underline"
                >
                    Mark all as read
                </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center" id="no-notifications-view">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell size={20} className="text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div
                                key={n._id}
                                onClick={() => onNotificationClick(n.link)}
                                className={cn(
                                    "p-4 cursor-pointer hover:bg-slate-50 transition-colors relative",
                                    !n.isRead && "bg-brand-blue-light/20"
                                )}
                            >
                                {!n.isRead && (
                                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-blue rounded-full" />
                                )}
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        n.title.includes('Resolved') ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        {n.title.includes('Resolved') ? <CheckCircle2 size={16} /> : <Info size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                            {formatDistanceToNow(new Date(n.createdAt))} ago
                                            {n.link && <ExternalLink size={8} />}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-100">
                <button
                    onClick={onClose}
                    className="w-full py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
