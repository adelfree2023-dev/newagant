'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

const products = [
    { id: '1', name: 'آيفون 15 برو ماكس', sku: 'IPH-15PM', price: 4999, stock: 50, status: 'active', category: 'إلكترونيات', image: 'https://via.placeholder.com/50' },
    { id: '2', name: 'سامسونج جالكسي S24', sku: 'SAM-S24', price: 4499, stock: 35, status: 'active', category: 'إلكترونيات', image: 'https://via.placeholder.com/50' },
    { id: '3', name: 'ماك بوك برو M3', sku: 'MAC-M3', price: 12999, stock: 15, status: 'active', category: 'إلكترونيات', image: 'https://via.placeholder.com/50' },
    { id: '4', name: 'ايربودز برو 2', sku: 'AIR-P2', price: 999, stock: 200, status: 'active', category: 'إلكترونيات', image: 'https://via.placeholder.com/50' },
    { id: '5', name: 'ساعة أبل الترا 2', sku: 'APW-U2', price: 3499, stock: 0, status: 'out_of_stock', category: 'إلكترونيات', image: 'https://via.placeholder.com/50' },
    { id: '6', name: 'نايك اير ماكس 90', sku: 'NIK-AM90', price: 599, stock: 80, status: 'active', category: 'أزياء', image: 'https://via.placeholder.com/50' },
]

export default function ProductsPage() {
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])

    const toggleSelect = (id: string) => {
        setSelectedProducts(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(products.map(p => p.id))
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
                    <p className="text-gray-500">{products.length} منتج</p>
                </div>
                <Link href="/products/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة منتج
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-grow max-w-md relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
                            className="input-field pr-10"
                        />
                    </div>
                    <select className="input-field w-auto">
                        <option value="">جميع الفئات</option>
                        <option value="electronics">إلكترونيات</option>
                        <option value="fashion">أزياء</option>
                    </select>
                    <select className="input-field w-auto">
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="out_of_stock">نفذ المخزون</option>
                    </select>
                    <button className="btn-secondary flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        فلاتر إضافية
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <table className="w-full">
                    <thead className="table-header">
                        <tr>
                            <th className="p-4 text-right">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.length === products.length}
                                    onChange={toggleSelectAll}
                                    className="rounded"
                                />
                            </th>
                            <th className="p-4 text-right">المنتج</th>
                            <th className="p-4 text-right">SKU</th>
                            <th className="p-4 text-right">السعر</th>
                            <th className="p-4 text-right">المخزون</th>
                            <th className="p-4 text-right">الفئة</th>
                            <th className="p-4 text-right">الحالة</th>
                            <th className="p-4 text-right">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="table-row">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleSelect(product.id)}
                                        className="rounded"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">{product.sku}</td>
                                <td className="p-4 font-medium">{product.price.toFixed(2)} ر.س</td>
                                <td className="p-4">
                                    <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-500">{product.category}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {product.status === 'active' ? 'نشط' : 'نفذ المخزون'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="عرض">
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="تعديل">
                                            <Edit className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg" title="حذف">
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-500">عرض 1-6 من 6 منتج</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
