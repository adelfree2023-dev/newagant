'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Facebook, X } from 'lucide-react';
import { storeApi } from '@/lib/api';

export default function FloatingContacts() {
    const [config, setConfig] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false); // Can be used for a main toggle button if needed, but requirements imply individual bubbles. 
    // Let's implement individual bubbles that are always visible if enabled, or a main FAB expanding to them.
    // "3 Icons moving with customer" implies they are visible. Stacking them is better UI.

    useEffect(() => {
        async function load() {
            try {
                const settings = await storeApi.store.config();
                if (settings.social_floating) {
                    setConfig(settings.social_floating);
                }
            } catch (e) { console.error(e); }
        }
        load();
    }, []);

    if (!config) return null;

    const { whatsapp, messenger, phone } = config;
    const hasAny = whatsapp?.enabled || messenger?.enabled || phone?.enabled;

    if (!hasAny) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
            <AnimatePresence>
                {/* Phone */}
                {phone?.enabled && phone.number && (
                    <motion.a
                        href={`tel:${phone.number}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors"
                        title="اتصل بنا"
                    >
                        <Phone className="w-5 h-5" />
                    </motion.a>
                )}

                {/* Messenger */}
                {messenger?.enabled && messenger.username && (
                    <motion.a
                        href={`https://m.me/${messenger.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-12 h-12 bg-[#0084FF] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#0074e0] transition-colors"
                        title="ماسنجر"
                    >
                        <Facebook className="w-5 h-5" />
                    </motion.a>
                )}

                {/* WhatsApp */}
                {whatsapp?.enabled && whatsapp.number && (
                    <motion.a
                        href={`https://wa.me/${whatsapp.number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#20bd5a] transition-colors"
                        title="واتساب"
                    >
                        <MessageCircle className="w-7 h-7" />
                    </motion.a>
                )}
            </AnimatePresence>
        </div>
    );
}
