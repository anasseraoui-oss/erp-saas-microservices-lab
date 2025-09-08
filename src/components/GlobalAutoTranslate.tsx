// GlobalAutoTranslate.tsx - نسخة محسنة
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface GlobalAutoTranslateContextType {
    isEnabled: boolean;
    enableAutoTranslate: () => void;
    disableAutoTranslate: () => void;
}

const GlobalAutoTranslateContext = createContext<GlobalAutoTranslateContextType>({
    isEnabled: true,
    enableAutoTranslate: () => {},
    disableAutoTranslate: () => {}
});

export const useGlobalAutoTranslate = () => {
    return useContext(GlobalAutoTranslateContext);
};

// العناصر التي يجب تجاهل ترجمتها
const SKIP_ELEMENTS = new Set([
    'SCRIPT', 'STYLE', 'CODE', 'PRE', 'SVG', 'PATH', 'CIRCLE',
    'RECT', 'LINE', 'POLYGON', 'ELLIPSE'
    // إزالة INPUT, TEXTAREA, SELECT لترجمة placeholders
]);

// الكلاسات التي يجب تجاهل ترجمتها
const SKIP_CLASSES = [
    'no-translate', 'notranslate', 'code-block', 'barcode', 'qr-code'
    // تقليل القائمة للسماح بترجمة أكثر
];

// النصوص التي يجب تجاهل ترجمتها
const SKIP_PATTERNS = [
    /^\d+$/, // أرقام فقط
    /^[^\w\s]*$/, // رموز خاصة فقط
    /^https?:\/\//, // روابط
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // إيميلات
    /^\d{4}-\d{2}-\d{2}/, // تواريخ
    /^\$?\d+(\.\d{2})?$/, // أسعار
    /^[A-Z_]{3,}$/, // متغيرات برمجية
    /^rgb\(|^#[0-9a-fA-F]{3,6}$/, // ألوان CSS
    /^\d+px$|^\d+%$|^\d+em$|^\d+rem$/ // وحدات CSS
];

class AutoTranslateService {
    private translations: Map<string, string> = new Map();
    private observer: MutationObserver | null = null;
    private translationFunction: ((key: string, fallback?: string) => string) | null = null;
    private isEnabled = true;
    private processedNodes: WeakSet<Node> = new WeakSet();

    constructor() {
        this.setupMutationObserver();
    }

    setTranslationFunction(t: (key: string, options?: any) => string) {
        this.translationFunction = (key: string, fallback?: string) => {
            const result = t(key, { defaultValue: fallback || key });
            return result !== key ? result : (fallback || key);
        };
        this.retranslateAll();
    }

    enable() {
        this.isEnabled = true;
        this.observer?.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['placeholder', 'title', 'alt', 'aria-label']
        });
        this.retranslateAll();
    }

    disable() {
        this.isEnabled = false;
        this.observer?.disconnect();
        this.restoreOriginalTexts();
    }

    private setupMutationObserver() {
        this.observer = new MutationObserver((mutations) => {
            if (!this.isEnabled || !this.translationFunction) return;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && !this.processedNodes.has(node)) {
                            this.translateElement(node as Element);
                            this.processedNodes.add(node);
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    const parent = mutation.target.parentElement;
                    if (parent && this.shouldTranslateElement(parent)) {
                        this.translateTextNode(mutation.target as Text);
                    }
                } else if (mutation.type === 'attributes') {
                    const target = mutation.target as Element;
                    if (this.shouldTranslateElement(target) && mutation.attributeName) {
                        this.translateAttribute(target, mutation.attributeName);
                    }
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['placeholder', 'title', 'alt', 'aria-label', 'value']
        });
    }

    private shouldSkipText(text: string): boolean {
        const trimmed = text.trim();
        return (
            trimmed.length === 0 || // تغيير من < 2 إلى === 0
            SKIP_PATTERNS.some(pattern => pattern.test(trimmed))
        );
    }

    private shouldTranslateElement(element: Element): boolean {
        if (SKIP_ELEMENTS.has(element.tagName)) {
            return false;
        }

        // فحص أكثر دقة للكلاسات
        const className = element.className;
        if (typeof className === 'string') {
            const classes = className.toLowerCase().split(' ');
            if (SKIP_CLASSES.some(skipClass =>
                classes.some(cls => cls.includes(skipClass.toLowerCase())))) {
                return false;
            }
        }

        // فحص data attributes
        if (element.hasAttribute('data-no-translate') ||
            element.hasAttribute('data-skip-translate') ||
            element.hasAttribute('translate') && element.getAttribute('translate') === 'no') {
            return false;
        }

        // استثناءات خاصة للعناصر التفاعلية
        if (element.tagName === 'INPUT') {
            const type = element.getAttribute('type');
            if (['email', 'password', 'number', 'tel', 'url', 'date', 'time'].includes(type || '')) {
                return false; // لا نترجم هذه الأنواع
            }
        }

        return true;
    }

    private getTranslation(text: string): string {
        if (!this.translationFunction) return text;

        const trimmed = text.trim();

        // البحث في الترجمات المحفوظة أولاً
        if (this.translations.has(trimmed)) {
            return this.translations.get(trimmed)!;
        }

        // توسيع قائمة المفاتيح المحتملة
        const keys = [
            trimmed,
            trimmed.toLowerCase(),

            // مفاتيح عامة
            `common.${trimmed.toLowerCase()}`,
            `global.${trimmed.toLowerCase()}`,

            // مفاتيح مع استبدال المسافات
            trimmed.toLowerCase().replace(/\s+/g, '_'),
            `common.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,
            `global.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالنماذج
            `form.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالتنقل
            `navigation.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالإعدادات
            `settings.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالحسابات
            `account.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالمنتجات
            `product.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالموردين والعملاء
            `supplierClient.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالطلبات والفواتير
            `order_invoice.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,

            // مفاتيح خاصة بالإشعارات
            `notifications.${trimmed.toLowerCase().replace(/\s+/g, '_')}`,
            `notifications.subjects.${trimmed.toUpperCase().replace(/\s+/g, '_')}`,
            `notifications.messages.${trimmed.toUpperCase().replace(/\s+/g, '_')}_MESSAGE`,

            // مفاتيح بديلة
            `ar:${trimmed.toLowerCase()}`,
            `ar:common.${trimmed.toLowerCase()}`,
            `ar:global.${trimmed.toLowerCase()}`,

            // مفاتيح للكلمات المفردة الشائعة
            ...(trimmed.length <= 10 ? [
                trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase(),
                trimmed.toUpperCase()
            ] : [])
        ];

        // البحث عن الترجمة
        for (const key of keys) {
            const translation = this.translationFunction(key);
            if (translation !== key && translation !== trimmed && translation.trim() !== '') {
                this.translations.set(trimmed, translation);
                return translation;
            }
        }

        return text;
    }

    private translateTextNode(textNode: Text) {
        if (!textNode.textContent || this.shouldSkipText(textNode.textContent)) {
            return;
        }

        const originalText = textNode.textContent;
        const translatedText = this.getTranslation(originalText);

        if (translatedText !== originalText) {
            const parentElement = textNode.parentElement;
            if (parentElement && !parentElement.hasAttribute('data-original-text')) {
                parentElement.setAttribute('data-original-text', originalText);
            }
            textNode.textContent = translatedText;
        }
    }

    private translateElement(element: Element) {
        if (!this.shouldTranslateElement(element)) {
            return;
        }

        // ترجمة النصوص المباشرة
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    return parent && this.shouldTranslateElement(parent)
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                }
            }
        );

        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node as Text);
        }

        textNodes.forEach(textNode => this.translateTextNode(textNode));

        // ترجمة الخصائص
        this.translateAttributes(element);

        // ترجمة العناصر الفرعية
        Array.from(element.children).forEach(child => {
            this.translateElement(child);
        });
    }

    private translateAttribute(element: Element, attributeName: string) {
        const value = element.getAttribute(attributeName);
        if (value && !this.shouldSkipText(value)) {
            const translated = this.getTranslation(value);
            if (translated !== value) {
                element.setAttribute(`data-original-${attributeName}`, value);
                element.setAttribute(attributeName, translated);
            }
        }
    }

    private translateAttributes(element: Element) {
        const attributes = ['title', 'placeholder', 'alt', 'aria-label'];

        attributes.forEach(attr => {
            this.translateAttribute(element, attr);
        });

        // معالجة خاصة للـ input values إذا كانت نصوص ثابتة
        if (element.tagName === 'INPUT') {
            const input = element as HTMLInputElement;
            const type = input.type;

            if (['button', 'submit', 'reset'].includes(type)) {
                const value = input.value;
                if (value && !this.shouldSkipText(value)) {
                    const translated = this.getTranslation(value);
                    if (translated !== value) {
                        input.setAttribute('data-original-value', value);
                        input.value = translated;
                    }
                }
            }
        }
    }

    private retranslateAll() {
        if (!this.isEnabled || !this.translationFunction) return;

        // مسح الترجمات المحفوظة لإعادة تحميلها
        this.translations.clear();
        this.processedNodes = new WeakSet();

        // إضافة تأخير قصير لضمان اكتمال تحميل DOM
        setTimeout(() => {
            this.translateElement(document.body);
        }, 100);
    }

    private restoreOriginalTexts() {
        // استعادة النصوص الأصلية
        const elementsWithOriginal = document.querySelectorAll('[data-original-text]');
        elementsWithOriginal.forEach(element => {
            const originalText = element.getAttribute('data-original-text');
            if (originalText && element.firstChild && element.firstChild.nodeType === Node.TEXT_NODE) {
                element.firstChild.textContent = originalText;
                element.removeAttribute('data-original-text');
            }
        });

        // استعادة الخصائص الأصلية
        const attributes = ['title', 'placeholder', 'alt', 'aria-label', 'value'];
        attributes.forEach(attr => {
            const selector = `[data-original-${attr}]`;
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const originalValue = element.getAttribute(`data-original-${attr}`);
                if (originalValue) {
                    element.setAttribute(attr, originalValue);
                    element.removeAttribute(`data-original-${attr}`);
                }
            });
        });
    }
}

// إنشاء instance واحد للخدمة
const autoTranslateService = new AutoTranslateService();

// مكون الترجمة التلقائية العالمي
export const GlobalAutoTranslateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t, i18n } = useTranslation();
    const [isEnabled, setIsEnabled] = React.useState(true);

    useEffect(() => {
        // @ts-ignore
        autoTranslateService.setTranslationFunction(t);
    }, [t]);

    useEffect(() => {
        const handleLanguageChange = () => {
            // @ts-ignore
            autoTranslateService.setTranslationFunction(t);
        };

        i18n.on('languageChanged', handleLanguageChange);

        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n, t]);

    const enableAutoTranslate = () => {
        setIsEnabled(true);
        autoTranslateService.enable();
    };

    const disableAutoTranslate = () => {
        setIsEnabled(false);
        autoTranslateService.disable();
    };

    useEffect(() => {
        if (isEnabled) {
            autoTranslateService.enable();
        } else {
            autoTranslateService.disable();
        }
    }, [isEnabled]);

    const contextValue: GlobalAutoTranslateContextType = {
        isEnabled,
        enableAutoTranslate,
        disableAutoTranslate
    };

    return (
        <GlobalAutoTranslateContext.Provider value={contextValue}>
            {children}
        </GlobalAutoTranslateContext.Provider>
    );
};

export const withGlobalAutoTranslate = <P extends object>(
    Component: React.ComponentType<P>
): React.FC<P> => {
    return (props: P) => (
        <GlobalAutoTranslateProvider>
            <Component {...props} />
        </GlobalAutoTranslateProvider>
    );
};

export const AutoTranslateToggle: React.FC = () => {
    const { isEnabled, enableAutoTranslate, disableAutoTranslate } = useGlobalAutoTranslate();
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">
                {t('settings.auto_translate', 'Auto Translate')}
            </label>
            <button
                onClick={isEnabled ? disableAutoTranslate : enableAutoTranslate}
                className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                    ${isEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                `}
            >
                <span
                    className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                    `}
                />
            </button>
        </div>
    );
};

export default GlobalAutoTranslateProvider;