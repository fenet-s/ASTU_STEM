import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { userService } from '../services/api';
import { Loader2, UserCog, Mail, Shield, Building2, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ role: '', department: '' });
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setEditingId(user.id);
        setEditForm({
            role: user.role,
            department: user.department || 'General'
        });
    };

    const handleSave = async (id: string) => {
        setUpdating(true);
        try {
            await userService.updateUser(id, editForm);
            setEditingId(null);
            fetchUsers();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading user database...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
                <p className="text-slate-500 mt-2">
                    Manage system roles and assign staff to specific departments.
                </p>
            </section>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <X size={16} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Mail size={10} /> {u.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === u.id ? (
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                className="text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                            >
                                                <option value="Student">Student</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1",
                                                u.role === 'Admin' ? "bg-purple-50 text-purple-700" :
                                                    u.role === 'Staff' ? "bg-blue-50 text-blue-700" :
                                                        "bg-slate-50 text-slate-600"
                                            )}>
                                                <Shield size={10} />
                                                {u.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === u.id ? (
                                            <select
                                                value={editForm.department}
                                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                className="text-sm bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                                                disabled={editForm.role === 'Student'}
                                            >
                                                <option value="General">General</option>
                                                <option value="Dormitory">Dormitory</option>
                                                <option value="Lab Equipment">Lab Equipment</option>
                                                <option value="Internet">Internet</option>
                                                <option value="Classroom">Classroom</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <span className="text-sm text-slate-600 flex items-center gap-1.5">
                                                <Building2 size={12} className="text-slate-400" />
                                                {u.department || 'General'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === u.id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSave(u.id)}
                                                    disabled={updating}
                                                    className="p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                                                    title="Save"
                                                >
                                                    {updating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(u)}
                                                className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue-light/30 rounded-lg transition-all"
                                                title="Edit User"
                                            >
                                                <UserCog size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
