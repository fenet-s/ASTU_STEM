import React, { useState } from 'react';
import { Ticket, User } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ClipboardX, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  user: User;
  onUpdateStatus?: (id: string, status: string, remarks: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets, user, onUpdateStatus }) => {
  const isStaff = user.role === 'Staff' || user.role === 'Admin';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">
            {isStaff ? 'All Student Tickets' : 'My Recent Tickets'}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardX size={32} className="text-slate-400" />
          </div>
          <h4 className="text-slate-700 font-semibold text-lg mb-1">No tickets yet</h4>
          <p className="text-slate-400 text-sm max-w-xs">
            {isStaff
              ? 'No student tickets have been submitted yet.'
              : 'You haven\'t submitted any complaints yet. Click "Submit Complaint" to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          {isStaff ? 'All Student Tickets' : 'My Recent Tickets'}
        </h3>
        <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
          {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
              {isStaff && <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {isStaff
                ? <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Update</th>
                : <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Remarks</th>
              }
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <React.Fragment key={ticket._id}>
                <tr
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === ticket._id ? null : ticket._id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{ticket.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ticket.description}</p>
                      </div>
                      {expandedId === ticket._id
                        ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
                        : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                    </div>
                  </td>
                  {isStaff && (
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {typeof ticket.student === 'object' ? ticket.student.name : 'Unknown'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium",
                      ticket.status === 'Resolved' ? "bg-emerald-50 text-emerald-700" :
                        ticket.status === 'Open' ? "bg-blue-50 text-blue-700" :
                          "bg-amber-50 text-amber-700"
                    )}>
                      {ticket.status}
                    </span>
                  </td>
                  {isStaff ? (
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ticket.status}
                        onChange={(e) => onUpdateStatus?.(ticket._id, e.target.value, ticket.remarks || '')}
                        className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  ) : (
                    <td className="px-6 py-4">
                      {ticket.remarks ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MessageSquare size={12} className="text-brand-blue shrink-0" />
                          <span className="line-clamp-1">{ticket.remarks}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 italic">No remarks yet</span>
                      )}
                    </td>
                  )}
                </tr>
                {/* Expanded description row */}
                {expandedId === ticket._id && (
                  <tr className="bg-slate-50/70">
                    <td colSpan={isStaff ? 6 : 5} className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Description</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
                        {ticket.remarks && (
                          <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl">
                            <p className="text-xs font-semibold text-brand-blue mb-1">Staff Remarks</p>
                            <p className="text-sm text-slate-600">{ticket.remarks}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
