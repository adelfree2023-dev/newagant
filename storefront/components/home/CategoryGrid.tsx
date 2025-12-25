import Link from 'next/link'

interface Category {
    id: number
    name: string
    icon: string
    slug: string
    color: string
}

const categories: Category[] = [
    { id: 1, name: 'إلكترونيات', icon: '📱', slug: 'electronics', color: 'bg-blue-50 hover:bg-blue-100' },
    { id: 2, name: 'أزياء رجالي', icon: '👔', slug: 'men-fashion', color: 'bg-gray-50 hover:bg-gray-100' },
    { id: 3, name: 'أزياء نسائي', icon: '👗', slug: 'women-fashion', color: 'bg-pink-50 hover:bg-pink-100' },
    { id: 4, name: 'المنزل والمطبخ', icon: '🏠', slug: 'home-kitchen', color: 'bg-yellow-50 hover:bg-yellow-100' },
    { id: 5, name: 'الجمال والعناية', icon: '💄', slug: 'beauty', color: 'bg-purple-50 hover:bg-purple-100' },
    { id: 6, name: 'الرياضة', icon: '⚽', slug: 'sports', color: 'bg-green-50 hover:bg-green-100' },
    { id: 7, name: 'الألعاب', icon: '🎮', slug: 'gaming', color: 'bg-red-50 hover:bg-red-100' },
    { id: 8, name: 'الأطفال', icon: '👶', slug: 'kids', color: 'bg-orange-50 hover:bg-orange-100' },
]

export default function CategoryGrid() {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">تسوق حسب القسم</h2>
                <Link href="/categories" className="text-primary-500 hover:text-primary-600 font-medium">
                    عرض الكل ←
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className={`${cat.color} rounded-xl p-4 text-center 
                       transition-all duration-200 hover:shadow-md hover:-translate-y-1`}
                    >
                        <span className="text-4xl block mb-2">{cat.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
