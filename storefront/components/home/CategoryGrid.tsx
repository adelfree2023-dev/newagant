import Link from 'next/link'

interface Category {
    id: string
    name: string
    name_ar: string
    slug: string
    icon: string
    color?: string
    products_count?: number
}

interface CategoryGridProps {
    categories?: Category[]
}

const defaultCategories: Category[] = [
    { id: '1', name: 'Electronics', name_ar: 'إلكترونيات', slug: 'electronics', icon: '📱', color: 'bg-blue-50 hover:bg-blue-100' },
    { id: '2', name: 'Fashion', name_ar: 'أزياء رجالي', slug: 'men-fashion', icon: '👔', color: 'bg-gray-50 hover:bg-gray-100' },
    { id: '3', name: 'Women Fashion', name_ar: 'أزياء نسائي', slug: 'women-fashion', icon: '👗', color: 'bg-pink-50 hover:bg-pink-100' },
    { id: '4', name: 'Home', name_ar: 'المنزل والمطبخ', slug: 'home-kitchen', icon: '🏠', color: 'bg-yellow-50 hover:bg-yellow-100' },
    { id: '5', name: 'Beauty', name_ar: 'الجمال والعناية', slug: 'beauty', icon: '💄', color: 'bg-purple-50 hover:bg-purple-100' },
    { id: '6', name: 'Sports', name_ar: 'الرياضة', slug: 'sports', icon: '⚽', color: 'bg-green-50 hover:bg-green-100' },
    { id: '7', name: 'Gaming', name_ar: 'الألعاب', slug: 'gaming', icon: '🎮', color: 'bg-red-50 hover:bg-red-100' },
    { id: '8', name: 'Kids', name_ar: 'الأطفال', slug: 'kids', icon: '👶', color: 'bg-orange-50 hover:bg-orange-100' },
]

const colorMap: { [key: string]: string } = {
    'bg-blue-50': 'bg-blue-50 hover:bg-blue-100',
    'bg-gray-50': 'bg-gray-50 hover:bg-gray-100',
    'bg-pink-50': 'bg-pink-50 hover:bg-pink-100',
    'bg-yellow-50': 'bg-yellow-50 hover:bg-yellow-100',
    'bg-purple-50': 'bg-purple-50 hover:bg-purple-100',
    'bg-green-50': 'bg-green-50 hover:bg-green-100',
    'bg-red-50': 'bg-red-50 hover:bg-red-100',
    'bg-orange-50': 'bg-orange-50 hover:bg-orange-100',
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
    const cats = categories && categories.length > 0 ? categories : defaultCategories

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تسوق حسب القسم</h2>
                <Link href="/categories" className="text-primary-500 hover:text-primary-600 font-medium">
                    عرض الكل ←
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {cats.map((cat, index) => {
                    const color = cat.color ? colorMap[cat.color] || cat.color : defaultCategories[index % 8]?.color || 'bg-gray-50'
                    return (
                        <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            className={`${color} rounded-xl p-4 text-center 
                         transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
                        >
                            <span className="text-4xl block mb-2">{cat.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{cat.name_ar}</span>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
