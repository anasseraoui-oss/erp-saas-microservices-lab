// components/layout/AppLayout.tsx
import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <TranslatedElement
                        element={<Outlet />}
                        skipTranslation={!isEnabled}
                    />
                </div>
            </main>
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