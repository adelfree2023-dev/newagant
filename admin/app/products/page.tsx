'use client';

/**
 * Admin Products Management Page
 * صفحة إدارة المنتجات
 * 
 * يجب وضعه في: admin/app/products/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compare_price?: number;
    stock: number;
    images: string[];
    category_name?: string;
    is_active: boolean;
    is_featured: boolean;
    created_at: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [filter, setFilter] = useState({ search: '', status: '' });

    useEffect(() => {
        loadProducts();
    }, [filter.status]);

    async function loadProducts() {
        try {
            setLoading(true);
            const result = await adminApi.products.getAll({
                search: filter.search,
                status: filter.status,
            });
            if (result.data) {
                setProducts(result.data.products || result.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }

    async function deleteProduct(id: string) {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

        try {
            await adminApi.products.delete(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    }

    async function toggleActive(product: Product) {
        try {
            await adminApi.products.update(product.id, { is_active: !product.is_active });
            setProducts(products.map(p =>
                p.id === product.id ? { ...p, is_active: !p.is_active } : p
            ));
        } catch (error) {
            console.error('Error updating product:', error);
        }
    }

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'نفذ', color: 'bg-red-100 text-red-800' };
        if (stock <= 5) return { label: 'منخفض', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'متوفر', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h1>
                <button
                    onClick={() => { setEditingProduct(null); setShowForm(true); }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    ➕ إضافة منتج
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">نشط</p>
                    <p className="text-2xl font-bold text-green-600">
                        {products.filter(p => p.is_active).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">نفذت الكمية</p>
                    <p className="text-2xl font-bold text-red-600">
                        {products.filter(p => p.stock === 0).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500">مخزون منخفض</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {products.filter(p => p.stock > 0 && p.stock <= 5).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو SKU..."
                        value={filter.search}
                        onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                        className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <select
                        value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="out_of_stock">نفذت الكمية</option>
                        <option value="low_stock">مخزون منخفض</option>
                    </select>
                    <button
                        onClick={loadProducts}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        🔍 بحث
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                            <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                    <span className="text-6xl block mb-4">📦</span>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-500 mb-4">ابدأ بإضافة منتجك الأول</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg"
                    >
                        إضافة منتج
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => {
                        const stockStatus = getStockStatus(product.stock);
                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                                {/* Image */}
                                <div className="aspect-square relative bg-gray-100">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                                    )}

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => { setEditingProduct(product); setShowForm(true); }}
                                            className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm"
                                        >
                                            ✏️ تعديل
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(product.id)}
                                            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                                        >
                                            🗑️
                                        </button>
                                    </div>

                                    {/* Status Badge */}
                                    {!product.is_active && (
                                        <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
                                            غير نشط
                                        </div>
                                    )}
                                    {product.is_featured && (
                                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs">
                                            ⭐ مميز
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category_name || 'بدون فئة'}</p>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="font-bold text-primary-600">{product.price.toFixed(2)} ر.س</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${stockStatus.color}`}>
                                            {product.stock} - {stockStatus.label}
                                        </span>
                                    </div>

                                    {/* Quick Toggle */}
                                    <button
                                        onClick={() => toggleActive(product)}
                                        className={`w-full mt-3 py-2 rounded-lg text-sm font-medium ${product.is_active
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        {product.is_active ? 'إيقاف' : 'تفعيل'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Form Modal */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    onClose={() => { setShowForm(false); setEditingProduct(null); }}
                    onSave={() => { loadProducts(); setShowForm(false); setEditingProduct(null); }}
                />
            )}
        </div>
    );
}

// ==================== Product Form Component ====================

interface ProductFormProps {
    product: Product | null;
    onClose: () => void;
    onSave: () => void;
}

function ProductForm({ product, onClose, onSave }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        name_ar: '',
        description: '',
        price: product?.price?.toString() || '',
        compare_price: product?.compare_price?.toString() || '',
        stock: product?.stock?.toString() || '0',
        category_id: '',
        sku: '',
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
                stock: parseInt(formData.stock),
            };

            if (product) {
                await adminApi.products.update(product.id, data);
            } else {
                await adminApi.products.create(data);
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                        {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">الوصف</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">السعر *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">السعر قبل الخصم</label>
                            <input
                                type="number"
                                name="compare_price"
                                value={formData.compare_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">المخزون</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="rounded text-primary-600"
                            />
                            <span>نشط</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="rounded text-primary-600"
                            />
                            <span>مميز</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300"
                        >
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
