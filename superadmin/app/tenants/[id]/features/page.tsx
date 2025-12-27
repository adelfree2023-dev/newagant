'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Save, Check, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Define the absolute truth of available features
const FEATURE_REGISTRY = {
    modules: {
        pos: { label: 'نقطة البيع (POS)', default: false },
        orders: { label: 'إدارة الطلبات', default: true },
        products: { label: 'إدارة المنتجات', default: true },
        customers: { label: 'إدارة العملاء', default: true },
        coupons: { label: 'نظام الكوبونات', default: true },
        newsletter: { label: 'القائمة البريدية', default: true },
        analytics: { label: 'التقارير والتحليلات', default: false },
    },
    storefront: {
        search: { label: 'شريط البحث', default: true },
        user_account: { label: 'تسجيل دخول العملاء', default: true },
        pages: {
            about: { label: 'صفحة من نحن', default: true },
            contact: { label: 'صفحة اتصل بنا', default: true },
            track_order: { label: 'صفحة تتبع الطلبات', default: true },
        },
        footer: {
            payment_methods: { label: 'أيقونات الدفع', default: true },
            social_links: { label: 'روابط التواصل', default: true },
            copyright: { label: 'حقوق النشر', default: true },
        }
    },
    admin: {
        settings: {
            staff: { label: 'إدارة الموظفين', default: false },
            general: { label: 'الإعدادات العامة', default: true },
        }
    }
};

export default function TenantGovernancePage() {
    const params = useParams();
    const [features, setFeatures] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch Tenant Config/Features
        // Using direct fetch for Super Admin to avoid circular dependencies
        fetch(`http://localhost:8000/api/store/config`, {
            headers: { 'x-tenant-id': params.id as string } // Mocking tenant context
        }).then(res => res.json())
            .then(data => {
                // Merge with registry defaults
                setFeatures(data.features || {});
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    const handleToggle = (path: string, value: boolean) => {
        const parts = path.split('.');
        setFeatures((prev: any) => {
            const newState = JSON.parse(JSON.stringify(prev));
            let current = newState;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newState;
        });
    };

    const saveChanges = async () => {
        setSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/api/superadmin/tenants/${params.id}/features`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Auth token here if needed
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ features })
            });

            if (res.ok) {
                toast.success('تم تحديث صلاحيات المتجر بنجاح');
            } else {
                toast.error('حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            toast.error('فشل الاتصال بالخادم');
        } finally {
            setSaving(false);
        }
    };

    const renderTree = (node: any, path: string = '') => {
        return Object.entries(node).map(([key, value]: [string, any]) => {
            const currentPath = path ? `${path}.${key}` : key;
            const isLeaf = value.label !== undefined; // It's a feature definition

            if (isLeaf) {
                // Determine current value: explicit state -> default -> true
                const parts = currentPath.split('.');
                let currentVal = features;
                let val = value.default; // Start with default

                // Traverse to find actual value
                let found = true;
                let ptr = features;
                for (const p of parts) {
                    if (ptr[p] === undefined) { found = false; break; }
                    ptr = ptr[p];
                }
                if (found) val = ptr;

                return (
                    <div key={currentPath} className="flex items-center justify-between p-3 border-b border-gray-50 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${val ? 'bg-green-500' : 'bg-red-300'}`}></div>
                            <span className="text-sm font-medium text-gray-700">{value.label}</span>
                            <span className="text-xs text-gray-400 font-mono">({currentPath})</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={val}
                                onChange={(e) => handleToggle(currentPath, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                );
            } else {
                // It's a category
                return (
                    <div key={currentPath} className="mb-4 ml-4 border-l-2 border-gray-100 pl-4">
                        <h3 className="uppercase text-xs font-bold text-gray-400 mb-2 tracking-wider">{key}</h3>
                        <div className="bg-white rounded-lg border border-gray-100">
                            {renderTree(value, currentPath)}
                        </div>
                    </div>
                );
            }
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Toaster richColors position="top-center" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        حوكمة المتجر
                    </h1>
                    <p className="text-gray-500 mt-2">التحكم الكامل في الخصائص والميزات المتاحة لهذا المستأجر.</p>
                </div>
                <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                >
                    {saving ? <span className="animate-spin">⌛</span> : <Save className="w-5 h-5" />}
                    حفظ التغييرات
                </button>
            </div>

            {loading ? (
                <div className="text-center py-20">جاري تحميل السياسات...</div>
            ) : (
                <div className="space-y-8">
                    {renderTree(FEATURE_REGISTRY)}
                </div>
            )}
        </div>
    );
}
