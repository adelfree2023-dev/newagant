'use client'

import { useState } from 'react'
import { User, Mail, Phone, Calendar, Camera, Save } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'أحمد محمد',
    email: 'ahmed@email.com',
    phone: '+966500000000',
    birthdate: '1990-01-15',
    gender: 'male',
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    alert('تم حفظ التغييرات!')
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">الملف الشخصي</h1>

        <div className="bg-white rounded-2xl shadow-sm">
          {/* Avatar Section */}
          <div className="p-8 border-b text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-primary-600">{profile.name.charAt(0)}</span>
              </div>
              <button className="absolute bottom-0 left-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-4">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing}
                  className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">تاريخ الميلاد</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={profile.birthdate}
                    onChange={(e) => setProfile({...profile, birthdate: e.target.value})}
                    disabled={!isEditing}
                    className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">الجنس</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({...profile, gender: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-gray-50"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t bg-gray-50">
            {isEditing ? (
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
                  إلغاء
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition">
                تعديل البيانات
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
