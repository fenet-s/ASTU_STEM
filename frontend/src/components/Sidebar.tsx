import React from 'react';
import { LayoutDashboard, FileText, ClipboardList, BarChart2, GraduationCap, LogOut, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
  onSubmitClick: () => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, onSubmitClick, currentView, onViewChange }) => {
  const isStudent = user.role === 'Student';

  const navItems = isStudent
    ? [
      { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
      { icon: ClipboardList, label: 'My Tickets', view: 'my-tickets' },
    ]
    : [
      { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
      { icon: BarChart2, label: 'Analytics', view: 'analytics' },
      { icon: ClipboardList, label: 'Ticket Management', view: 'ticket-management' },
      ...(user.role === 'Admin' ? [{ icon: GraduationCap, label: 'Users', view: 'user-management' }] : []),
    ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white">
          <GraduationCap size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">ASTU Tracker</h1>
      </div>

      {/* Submit CTA for students */}
      {isStudent && (
        <div className="px-4 pb-4">
          <button
            onClick={onSubmitClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-blue text-white hover:bg-brand-blue/90 transition-all shadow-sm shadow-brand-blue/30"
          >
            <Plus size={18} />
            Submit Complaint
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.view)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              currentView === item.view
                ? "bg-brand-blue-light text-brand-blue"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100 space-y-4">
        {user.role === 'Staff' && (
          <div className="bg-brand-blue-light/30 rounded-2xl p-4 border border-brand-blue/10">
            <p className="text-[10px] text-brand-blue font-bold uppercase tracking-wider mb-1">Assigned Unit</p>
            <p className="text-sm font-semibold text-slate-700">{user.department} Department</p>
          </div>
        )}

        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Support Hours</p>
          <p className="text-sm font-semibold text-slate-700">Mon - Fri, 8AM - 5PM</p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};
