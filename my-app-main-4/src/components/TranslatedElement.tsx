import React, { ReactNode } from 'react';
import { useAutoTranslate } from './AutoTranslateProvider';

// Elements that should not be translated
const SKIP_TRANSLATION_ELEMENTS = new Set([
    'input', 'textarea', 'select', 'img', 'svg', 'path', 'circle', 'rect', 'line',
    'polygon', 'polyline', 'ellipse', 'script', 'style', 'code', 'pre'
]);

// Class names that indicate content should not be translated
const SKIP_TRANSLATION_CLASSES = [
    'icon', 'fa-', 'bi-', 'material-icons', 'lucide', 'heroicon',
    'logo', 'barcode', 'qr-code', 'code-block'
];

// Attributes that contain translatable content
const TRANSLATABLE_ATTRIBUTES = ['title', 'alt', 'placeholder', 'aria-label'];

function shouldSkipElement(element: React.ReactElement): boolean {
    const elementType = typeof element.type === 'string' ? element.type : '';

    // Skip certain HTML elements
    if (SKIP_TRANSLATION_ELEMENTS.has(elementType)) {
        return true;
    }

    // Skip elements with certain class names
    const className = element.props?.className || '';
    if (typeof className === 'string' &&
        SKIP_TRANSLATION_CLASSES.some(skipClass => className.includes(skipClass))) {
        return true;
    }

    // Skip elements with data-no-translate attribute
    if (element.props?.['data-no-translate'] === true ||
        element.props?.['data-no-translate'] === 'true') {
        return true;
    }

    return false;
}

function shouldSkipText(text: string): boolean {
    const trimmed = text.trim();

    return (
        trimmed.length === 0 || // Empty text
        /^\d+$/.test(trimmed) || // Numbers only
        /^[^\w\s]*$/.test(trimmed) || // Special characters only
        /^https?:\/\//.test(trimmed) || // URLs
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed) || // Emails
        /^\d{4}-\d{2}-\d{2}/.test(trimmed) || // Dates
        /^\$?\d+(\.\d{2})?$/.test(trimmed) || // Prices/amounts
        trimmed.length < 2 // Very short text
    );
}

function translateAttributes(props: any, T: React.FC<{ children: ReactNode }>): any {
    if (!props) return props;

    const newProps = { ...props };

    TRANSLATABLE_ATTRIBUTES.forEach(attr => {
        if (newProps[attr] && typeof newProps[attr] === 'string' && !shouldSkipText(newProps[attr])) {
            // For attributes, we'll just return the original for now
            // In a real implementation, you might want to handle this differently
        }
    });

    return newProps;
}

function translateChildren(
    children: ReactNode,
    T: React.FC<{ children: ReactNode }>
): ReactNode {
    return React.Children.map(children, (child) => {
        // Handle string children
        if (typeof child === 'string') {
            if (shouldSkipText(child)) {
                return child;
            }
            return <T>{child}</T>;
        }

        // Handle number children
        if (typeof child === 'number') {
            return child;
        }

        // Handle React elements
        if (React.isValidElement(child)) {
            // Skip certain elements
            if (shouldSkipElement(child)) {
                return child;
            }

            // Recursively translate children
            const translatedProps = translateAttributes(child.props, T);
            const translatedChildren = child.props?.children
                ? translateChildren(child.props.children, T)
                : child.props?.children;

            return React.cloneElement(child, translatedProps, translatedChildren);
        }

        // Handle arrays and fragments
        if (Array.isArray(child)) {
            return translateChildren(child, T);
        }

        return child;
    });
}

interface TranslatedElementProps {
    element: React.ReactElement;
    skipTranslation?: boolean;
}

const TranslatedElement: React.FC<TranslatedElementProps> = ({
                                                                 element,
                                                                 skipTranslation = false
                                                             }) => {
    const { T } = useAutoTranslate();

    // If translation is disabled, return original element
    if (skipTranslation) {
        return element;
    }

    // If the element itself should be skipped, return as-is
    if (shouldSkipElement(element)) {
        return element;
    }

    // Translate the element and its children
    const translatedProps = translateAttributes(element.props, T);
    const translatedChildren = element.props?.children
        ? translateChildren(element.props.children, T)
        : element.props?.children;

    return React.cloneElement(element, translatedProps, translatedChildren);
};

export default TranslatedElement;