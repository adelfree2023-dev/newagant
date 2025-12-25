'use client';

/**
 * Admin 2FA Settings Page
 * إعدادات المصادقة الثنائية
 * 
 * يجب وضعه في: admin/app/settings/security/page.tsx
 */

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import Image from 'next/image';

interface SecuritySettings {
    twoFactorEnabled: boolean;
    lastPasswordChange?: string;
    activeSessions: number;
    loginHistory: Array<{
        id: string;
        ip: string;
        device: string;
        location?: string;
        timestamp: string;
        success: boolean;
    }>;
}

export default function SecuritySettingsPage() {
    const [settings, setSettings] = useState<SecuritySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const result = await adminApi.settings.getSecurity();
            if (result.data) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            // Mock data for development
            setSettings({
                twoFactorEnabled: false,
                lastPasswordChange: new Date().toISOString(),
                activeSessions: 2,
                loginHistory: [
                    { id: '1', ip: '192.168.1.1', device: 'Chrome on Windows', timestamp: new Date().toISOString(), success: true },
                    { id: '2', ip: '192.168.1.2', device: 'Safari on iPhone', timestamp: new Date(Date.now() - 3600000).toISOString(), success: true },
                ],
            });
        } finally {
            setLoading(false);
        }
    }

    async function enable2FA() {
        try {
            const result = await adminApi.settings.generate2FA();
            if (result.data) {
                setQrCode(result.data.qrCode);
                setSecret(result.data.secret);
                setShow2FASetup(true);
            }
        } catch (error) {
            console.error('Error generating 2FA:', error);
        }
    }

    async function verify2FA() {
        if (verifyCode.length !== 6) {
            alert('الرجاء إدخال رمز مكون من 6 أرقام');
            return;
        }

        try {
            const result = await adminApi.settings.verify2FA(verifyCode, secret);
            if (result.data?.success) {
                setBackupCodes(result.data.backupCodes);
                setSettings(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
            } else {
                alert('الرمز غير صحيح');
            }
        } catch (error) {
            console.error('Error verifying 2FA:', error);
        }
    }

    async function disable2FA() {
        if (!confirm('هل أنت متأكد من تعطيل المصادقة الثنائية؟')) return;

        const code = prompt('أدخل رمز المصادقة الحالي:');
        if (!code) return;

        try {
            const result = await adminApi.settings.disable2FA(code);
            if (result.data?.success) {
                setSettings(prev => prev ? { ...prev, twoFactorEnabled: false } : null);
                setShow2FASetup(false);
                setBackupCodes([]);
            }
        } catch (error) {
            console.error('Error disabling 2FA:', error);
        }
    }

    async function logoutAllSessions() {
        if (!confirm('سيتم تسجيل الخروج من جميع الأجهزة. هل تريد المتابعة؟')) return;

        try {
            await adminApi.settings.logoutAllSessions();
            loadSettings();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">الأمان والمصادقة</h1>

            {/* 2FA Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            🔐 المصادقة الثنائية (2FA)
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            أضف طبقة حماية إضافية لحسابك باستخدام تطبيق Google Authenticator
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${settings?.twoFactorEnabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {settings?.twoFactorEnabled ? '✓ مفعّل' : 'غير مفعّل'}
                    </span>
                </div>

                {settings?.twoFactorEnabled ? (
                    <div>
                        <p className="text-green-600 mb-4">✓ حسابك محمي بالمصادقة الثنائية</p>
                        <button
                            onClick={disable2FA}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                        >
                            تعطيل المصادقة الثنائية
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={enable2FA}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        تفعيل المصادقة الثنائية
                    </button>
                )}
            </div>

            {/* 2FA Setup Modal */}
            {show2FASetup && !settings?.twoFactorEnabled && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-primary-500">
                    <h3 className="font-bold text-lg mb-4">إعداد المصادقة الثنائية</h3>

                    {backupCodes.length > 0 ? (
                        <div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p className="text-green-800 font-medium">✓ تم تفعيل المصادقة الثنائية بنجاح!</p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-bold text-yellow-800 mb-2">⚠️ رموز الاسترداد</h4>
                                <p className="text-yellow-700 text-sm mb-3">
                                    احتفظ بهذه الرموز في مكان آمن. يمكنك استخدامها إذا فقدت الوصول لتطبيق المصادقة.
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {backupCodes.map((code, i) => (
                                        <code key={i} className="bg-white px-2 py-1 rounded text-sm">
                                            {code}
                                        </code>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => { setShow2FASetup(false); setBackupCodes([]); }}
                                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                            >
                                تم
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0">
                                    {qrCode && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <ol className="space-y-3 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">1</span>
                                            <span>حمّل تطبيق Google Authenticator أو أي تطبيق مصادقة مشابه</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">2</span>
                                            <span>امسح رمز QR بالتطبيق</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center flex-shrink-0">3</span>
                                            <span>أدخل الرمز المكون من 6 أرقام الظاهر في التطبيق</span>
                                        </li>
                                    </ol>

                                    {secret && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">أو أدخل هذا الكود يدوياً:</p>
                                            <code className="text-sm font-mono">{secret}</code>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">رمز التحقق</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        className="flex-1 px-4 py-2 border rounded-lg text-center text-xl tracking-widest font-mono"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={verify2FA}
                                        disabled={verifyCode.length !== 6}
                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg disabled:bg-gray-300"
                                    >
                                        تحقق
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setShow2FASetup(false)}
                                className="text-gray-500 hover:underline text-sm"
                            >
                                إلغاء
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Active Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">📱 الجلسات النشطة</h2>
                    <button
                        onClick={logoutAllSessions}
                        className="text-red-600 hover:underline text-sm"
                    >
                        تسجيل خروج من الكل
                    </button>
                </div>

                <p className="text-gray-500 text-sm mb-4">
                    عدد الأجهزة المتصلة حالياً: <strong>{settings?.activeSessions}</strong>
                </p>
            </div>

            {/* Login History */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">📋 سجل تسجيل الدخول</h2>

                <div className="space-y-3">
                    {settings?.loginHistory.map((login) => (
                        <div
                            key={login.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${login.success ? 'bg-gray-50' : 'bg-red-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={login.success ? 'text-green-600' : 'text-red-600'}>
                                    {login.success ? '✓' : '✗'}
                                </span>
                                <div>
                                    <p className="font-medium text-sm">{login.device}</p>
                                    <p className="text-xs text-gray-500">{login.ip}</p>
                                </div>
                            </div>
                            <div className="text-left text-sm text-gray-500">
                                {new Date(login.timestamp).toLocaleString('ar-SA')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
