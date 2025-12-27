'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Loader2, Users, Plus, Trash2, Shield, User, ShoppingBag } from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Staff {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'admin' | 'cashier';
    created_at: string;
}

export default function StaffPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'cashier', phone: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const res = await adminApi.staff.list();
            if (res.success) setStaff(res.data);
        } catch (error) {
            toast.error('فشل تحميل بيانات الموظفين');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await adminApi.staff.create(newStaff);
            if (res.success) {
                toast.success('تمت إضافة الموظف بنجاح');
                setIsAddModalOpen(false);
                setNewStaff({ name: '', email: '', password: '', role: 'cashier', phone: '' });
                loadStaff();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'فشل إضافة الموظف');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
        try {
            await adminApi.staff.delete(id);
            toast.success('تم حذف الموظف');
            setStaff(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <Toaster richColors position="top-center" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-8 h-8 text-indigo-600" /> إدارة فريق العمل
                    </h1>
                    <p className="text-gray-500 mt-1">إضافة وإدارة المدراء والكاشير</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-5 h-5" /> إضافة موظف
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-gray-300" /></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staff.map((member) => (
                        <div key={member.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${member.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                        {member.role === 'admin' ? <Shield className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                                    </div>
                                    <button onClick={() => handleDelete(member.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{member.first_name} {member.last_name}</h3>
                                <p className="text-gray-500 text-sm mb-2">{member.email}</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${member.role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-green-50 text-green-700'}`}>
                                    {member.role === 'admin' ? 'مدير نظام' : 'كاشير'}
                                </span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
                                تمت الإضافة: {new Date(member.created_at).toLocaleDateString('ar-EG')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-6">إضافة موظف جديد</h2>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                <input
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newStaff.name}
                                    onChange={e => setNewStaff({ ...newStaff, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                <input
                                    type="email" required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newStaff.email}
                                    onChange={e => setNewStaff({ ...newStaff, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                                <input
                                    type="password" required minLength={8}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newStaff.password}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف (اختياري)</label>
                                <input
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newStaff.phone}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الصلاحية</label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    value={newStaff.role}
                                    onChange={e => setNewStaff({ ...newStaff, role: e.target.value as any })}
                                >
                                    <option value="cashier">🛒 كاشير (نقطة بيع فقط)</option>
                                    <option value="admin">🛡️ مدير (تحكم كامل)</option>
                                </select>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {submitting ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
