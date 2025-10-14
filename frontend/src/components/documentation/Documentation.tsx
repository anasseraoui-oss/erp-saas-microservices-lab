import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, ExternalLink, Search } from 'lucide-react';
import Modal from '../basec/Modal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDarkMode } from "../DarkModeProvider";

// Define the structure for a documented route
interface DocumentedRoute {
    path: string;
    nameKey: string;
    descriptionKey: string;
    detailsKey: string; // Add a key for the detailed description
}

// List of routes to document, using translation keys
const documentedRoutes: DocumentedRoute[] = [
    { path: '/stats-link', nameKey: 'doc.stats_link.name', descriptionKey: 'doc.stats_link.description', detailsKey: 'doc.stats_link.details' },
    { path: '/products', nameKey: 'doc.products.name', descriptionKey: 'doc.products.description', detailsKey: 'doc.products.details' },
    { path: '/add-products', nameKey: 'doc.add_products.name', descriptionKey: 'doc.add_products.description', detailsKey: 'doc.add_products.details' },
    { path: '/sales-invoices', nameKey: 'doc.sales_invoices.name', descriptionKey: 'doc.sales_invoices.description', detailsKey: 'doc.sales_invoices.details' },
    { path: '/purchase-invoices', nameKey: 'doc.purchase_invoices.name', descriptionKey: 'doc.purchase_invoices.description', detailsKey: 'doc.purchase_invoices.details' },
    { path: '/sales-orders', nameKey: 'doc.sales_orders.name', descriptionKey: 'doc.sales_orders.description', detailsKey: 'doc.sales_orders.details' },
    { path: '/purchase-orders', nameKey: 'doc.purchase_orders.name', descriptionKey: 'doc.purchase_orders.description', detailsKey: 'doc.purchase_orders.details' },
    { path: '/add-sales-invoice', nameKey: 'doc.add_sales_invoice.name', descriptionKey: 'doc.add_sales_invoice.description', detailsKey: 'doc.add_sales_invoice.details' },
    { path: '/add-purchase-invoice', nameKey: 'doc.add_purchase_invoice.name', descriptionKey: 'doc.add_purchase_invoice.description', detailsKey: 'doc.add_purchase_invoice.details' },
    { path: '/add-sales-order', nameKey: 'doc.add_sales_order.name', descriptionKey: 'doc.add_sales_order.description', detailsKey: 'doc.add_sales_order.details' },
    { path: '/add-purchase-order', nameKey: 'doc.add_purchase_order.name', descriptionKey: 'doc.add_purchase_order.description', detailsKey: 'doc.add_purchase_order.details' },
    { path: '/supplarclient-list', nameKey: 'doc.supplarclient_list.name', descriptionKey: 'doc.supplarclient_list.description', detailsKey: 'doc.supplarclient_list.details' },
    { path: '/accounts', nameKey: 'doc.accounts.name', descriptionKey: 'doc.accounts.description', detailsKey: 'doc.accounts.details' },
    { path: '/security', nameKey: 'doc.security.name', descriptionKey: 'doc.security.description', detailsKey: 'doc.security.details' },
    { path: '/settings', nameKey: 'doc.settings.name', descriptionKey: 'doc.settings.description', detailsKey: 'doc.settings.details' },
    { path: '/expired-products', nameKey: 'doc.expired_products.name', descriptionKey: 'doc.expired_products.description', detailsKey: 'doc.expired_products.details' },
    { path: '/notifications-link', nameKey: 'doc.notifications_link.name', descriptionKey: 'doc.notifications_link.description', detailsKey: 'doc.notifications_link.details' },
];

const DocumentationPage: React.FC = () => {
    const { t } = useTranslation();
    // @ts-ignore
    const { isDarkMode } = useDarkMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<DocumentedRoute | null>(null);

    const handleCardClick = (route: DocumentedRoute) => {
        setSelectedRoute(route);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRoute(null);
    };

    const filteredRoutes = documentedRoutes.filter(route => {
        const name = t(route.nameKey).toLowerCase();
        const description = t(route.descriptionKey).toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
    });

    return (
        <div className={`p-8 min-h-screen font-sans ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
            <header className="text-center mb-10">
                <h1 className={`text-5xl font-extrabold flex items-center justify-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    <Book className={`mr-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    {t('doc.title')}
                </h1>
                <p className={`text-lg mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('doc.subtitle')}
                </p>
            </header>

            {/* Search Bar */}
            <div className="mb-10 max-w-2xl mx-auto">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder={t('global.search_placeholder', 'Search documentation...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                                ? 'text-gray-200 bg-gray-800 border-gray-600'
                                : 'text-gray-700 bg-white border-gray-300'
                        }`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRoutes.length > 0 ? (
                    filteredRoutes.map((route, index) => (
                        <div
                            key={index}
                            className={`p-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-1 duration-300 border-l-4 cursor-pointer ${
                                isDarkMode
                                    ? 'bg-gray-800 hover:shadow-blue-500/20 border-blue-400'
                                    : 'bg-white hover:shadow-2xl border-blue-500'
                            }`}
                            onClick={() => handleCardClick(route)}
                        >
                            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                {t(route.nameKey)}
                            </h2>
                            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t(route.descriptionKey)}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center">
                        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {t('global.no_results', 'No documentation pages match your search.')}
                        </p>
                    </div>
                )}
            </div>

            {selectedRoute && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title={t(selectedRoute.nameKey)}
                    size="lg"
                >
                    <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {t(selectedRoute.detailsKey, t(selectedRoute.descriptionKey))}
                        </ReactMarkdown>

                        <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <Link
                                to={selectedRoute.path}
                                className={`inline-flex items-center font-semibold transition-colors duration-300 ${
                                    isDarkMode
                                        ? 'text-blue-400 hover:text-blue-300'
                                        : 'text-blue-600 hover:text-blue-800'
                                }`}
                                onClick={handleCloseModal}
                            >
                                {t('global.go_to_page', 'Go to Page')}
                                <ExternalLink className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </Modal>
            )}

            <footer className={`text-center mt-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DocumentationPage;