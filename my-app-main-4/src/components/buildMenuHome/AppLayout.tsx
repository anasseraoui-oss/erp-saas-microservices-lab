// components/layout/AppLayout.tsx
import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppHeader from "../Header";
import { RouteCategory } from "../../App";
import TranslatedElement from '../TranslatedElement';
import { GlobalAutoTranslateProvider, useGlobalAutoTranslate } from '../GlobalAutoTranslate';

// مكون داخلي للتحكم في الترجمة
const LayoutContent: React.FC<{ routes: RouteCategory[] }> = ({ routes }) => {
    const { i18n } = useTranslation();
    const { isEnabled } = useGlobalAutoTranslate();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [isRTL, i18n.language]);

    return (
        <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <TranslatedElement
                element={<AppHeader allRoutes={routes} />}
                skipTranslation={!isEnabled}
            />

            {/* المحتوى الرئيسي */}
            <main className="p-4 transition-all duration-200">
                {/* محتوى الصفحات مع ترجمة تلقائية */}
                <div className="premium-card overflow-hidden">
                    <TranslatedElement
                        element={<Outlet />}
                        skipTranslation={!isEnabled}
                    />
                </div>
            </main>

            {/* Documentation Floating Button */}
            <Link
                to="/documentation"
                className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Documentation"
            >
                <HelpCircle size={24} />
            </Link>
        </div>
    );
};

// المكون الأساسي مع Provider
const AppLayout: React.FC<{ routes: RouteCategory[] }> = ({ routes }) => {
    return (
        <GlobalAutoTranslateProvider>
            <LayoutContent routes={routes} />
        </GlobalAutoTranslateProvider>
    );
};

export default AppLayout;