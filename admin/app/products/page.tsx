'use client';

import { useEffect, useState } from 'react';
import { useProductStore, Product } from '@/store/useProductStore'; // Use global store
import Image from 'next/image';
import { Plus, Search, Filter, Loader2, Trash2, Edit2, Package, Tag, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Stats Card Component
const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-xl col-span-1 p-6 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className={cn("p-4 rounded-xl", color)}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

export default function ProductsPage() {
    const { products, isLoading, fetchProducts, deleteProduct, toggleActive, filters, setFilter } = useProductStore();
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [filters.status]); // Refetch when filter changes

    // Stats Calculations
    const activeCount = products.filter(p => p.is_active).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">إدارة المنتجات</h1>
                    <p className="text-gray-500 mt-2">تحكم في مخزونك، الأسعار، وحالة المنتجات من مكان واحد</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="إجمالي المنتجات" value={products.length} icon={Package} color="bg-blue-500" />
                <StatCard title="منتجات نشطة" value={activeCount} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="نفذت الكمية" value={outOfStockCount} icon={AlertCircle} color="bg-red-500" />
                <StatCard title="مخزون منخفض" value={lowStockCount} icon={Filter} color="bg-yellow-500" />
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 sticky top-20 z-10 backdrop-blur-xl bg-white/80">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="بحث باسم المنتج، SKU..."
                            value={filters.search}
                            onChange={(e) => setFilter('search', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                            className="w-full pr-10 pl-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        />
                    </div>
                    <div className="min-w-[200px]">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilter('status', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="active">🟢 نشط</option>
                            <option value="inactive">⚫ غير نشط</option>
                            <option value="out_of_stock">🔴 نفذت الكمية</option>
                            <option value="low_stock">🟡 مخزون منخفض</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="aspect-square bg-gray-100 rounded-xl mb-4 animate-pulse" />
                            <div className="h-6 bg-gray-100 rounded-lg w-3/4 mb-3 animate-pulse" />
                            <div className="h-4 bg-gray-100 rounded-lg w-1/2 animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة أول منتج لمتجرك.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all"
                    >
                        إضافة منتج الآن
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={() => { setEditingProduct(product); setShowForm(true); }}
                            onDelete={() => deleteProduct(product.id)}
                            onToggleActive={() => toggleActive(product.id, product.is_active)}
                        />
                    ))}
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <ProductForm
                    initialData={editingProduct}
                    onClose={() => { setShowForm(false); setEditingProduct(null); }}
                    onSuccess={() => { setShowForm(false); setEditingProduct(null); }}
                />
            )}
        </div>
    );
}

// Sub-component: Product Card
function ProductCard({ product, onEdit, onDelete, onToggleActive }: any) {
    const stockStatus = product.stock === 0 ? { label: 'نفذ', color: 'bg-red-100 text-red-700' }
        : product.stock <= 5 ? { label: 'منخفض', color: 'bg-yellow-100 text-yellow-800' }
            : { label: 'متوفر', color: 'bg-green-100 text-green-700' };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
            {/* Image Area */}
            <div className="aspect-[4/3] relative bg-gray-100 overflow-hidden">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-16 h-16" />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {!product.is_active && (
                        <span className="bg-gray-900/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-medium">مسودة</span>
                    )}
                    {product.is_featured && (
                        <span className="bg-yellow-400/90 backdrop-blur text-yellow-900 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            ★ مميز
                        </span>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button onClick={onEdit} className="p-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl">
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={onDelete} className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:scale-105 transition-all shadow-xl">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {product.category_name || 'عام'}
                    </p>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", stockStatus.color)}>
                        {stockStatus.label} ({product.stock})
                    </span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">
                    {product.name}
                </h3>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900">{product.price} ر.س</span>
                        {product.compare_price && (
                            <span className="text-xs text-gray-400 line-through">{product.compare_price} ر.س</span>
                        )}
                    </div>

                    <button
                        onClick={onToggleActive}
                        className={cn(
                            "w-12 h-6 rounded-full relative transition-colors duration-300",
                            product.is_active ? "bg-green-500" : "bg-gray-300"
                        )}
                    >
                        <div className={cn(
                            "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 shadow-sm",
                            product.is_active ? "right-1" : "right-7"
                        )} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper components
import { CheckCircle } from 'lucide-react';

// ... imports
import ProductAttributesEditor from '@/components/products/ProductAttributesEditor';

// ... (Rest of code until ProductForm)

function ProductForm({ initialData, onClose, onSuccess }: any) {
    const { createProduct, updateProduct } = useProductStore();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        price: initialData?.price || '',
        stock: initialData?.stock || '',
        category_id: '',
        is_active: initialData?.is_active ?? true,
        is_featured: initialData?.is_featured ?? false
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const data = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
        const result = initialData
            ? await updateProduct(initialData.id, data)
            : await createProduct(data);

        if (result) onSuccess();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-900">{initialData ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        {/* ... Basic Fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Attributes Section (Only showing when editing existing product for now) */}
                        {initialData?.id && (
                            <div className="border-t border-gray-100 pt-6">
                                <ProductAttributesEditor productId={initialData.id} />
                            </div>
                        )}

                        <div className="flex gap-6 pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl flex-1 hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="font-medium">منتج نشط</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl flex-1 hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 text-yellow-500 rounded"
                                />
                                <span className="font-medium">منتج مميز</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">إلغاء</button>
                        <button type="submit" disabled={loading} className="flex-1 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'حفظ التغييرات'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
