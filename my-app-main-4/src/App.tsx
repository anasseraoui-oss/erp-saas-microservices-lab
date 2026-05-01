import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import './App.css';
import './i18n';

// Providers and Contexts
import { DarkModeProvider, useDarkMode } from './components/DarkModeProvider';
import { NotificationProvider } from './components/Notification/NotificationContext';
import { AutoTranslateProvider } from './components/AutoTranslateProvider';
import GlobalAutoTranslateProvider from "./components/GlobalAutoTranslate";

// Core Components (Non-Lazy for immediate load)
import Header from './components/Header';
import NotificationToast from "./components/Notification/NotificationToast";
import PublicRoute from "./components/basec/PublicRoute";
import AppLayout from "./components/buildMenuHome/AppLayout";
import { allApplicationRoutes } from "./components/buildMenuHome/y";
import { IconType } from 'react-icons';

export interface RouteItem {
    name: string;
    icon: IconType;
    link: string;
}

export interface RouteCategory {
    category: string;
    items: RouteItem[];
}

// Lazy Loaded Components
const Home = lazy(() => import("./components/Home"));
const Login = lazy(() => import("./components/basec/Login"));
const Logout = lazy(() => import("./components/basec/Logout"));
const ProductList = lazy(() => import('./components/product/ProductList'));
const ProductForm = lazy(() => import('./components/product/ProductForme'));
const SalesInvoiceList = lazy(() => import('./components/salesInvoice/SalesInvoiceList'));
const PurchaseInvoiceList = lazy(() => import('./components/purchaseInvoice/PurchaseInvoiceList'));
const SalesOrderList = lazy(() => import('./components/salesInvoice/SalesOrderList'));
const PurchaseOrderList = lazy(() => import('./components/purchaseInvoice/PurchaseOrderList'));
const SalesInvoiceLines = lazy(() => import('./components/salesInvoice/SalesInvoiceLines'));
const PuchasesInvoiceLines = lazy(() => import('./components/purchaseInvoice/PuchasesInvoiceLines'));
const SalesOrderLines = lazy(() => import('./components/salesInvoice/SalesOrderLines'));
const PuchasesOrderLines = lazy(() => import('./components/purchaseInvoice/PuchasesOrderLines'));
const SalesInvoiceForm = lazy(() => import('./components/salesInvoice/SalesInvoiceForm'));
const PurchaseInvoiceForm = lazy(() => import('./components/purchaseInvoice/PurchaseInvoiceForm'));
const SalesOrderForm = lazy(() => import('./components/salesInvoice/SalesOrderForm'));
const PurchaseOrderForm = lazy(() => import('./components/purchaseInvoice/PurchaseOrderForm'));
const SupplierClientList = lazy(() => import('./components/supplierClient/SupplierClientList'));
const AccountList = lazy(() => import('./components/Scrty/AccountList'));
const CreateAccount = lazy(() => import('./components/Scrty/CreateAccount'));
const ManageRolesPage = lazy(() => import("./components/Scrty/ManageRolesPage"));
const HomeAccount = lazy(() => import("./components/Scrty/HomeAccount"));
const DashboardPage = lazy(() => import("./components/Scrty/DashboardPage"));
const StatisticsDashboard = lazy(() => import("./components/statistics/StatisticsDashboard"));
const Settings = lazy(() => import('./components/Settings'));
const ExpiredProductsList = lazy(() => import("./components/basec/invoice/ExpiredProduct/ExpiredProductsList"));
const NotificationCenter = lazy(() => import("./components/Notification/NotificationCenter"));
const DocumentationPage = lazy(() => import("./components/documentation/Documentation"));
const ProfitReportPage = lazy(() => import("./components/basec/invoice/invoiceOrOrderDetails/Rapports/ProfitReportPage"));

const PageLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--background))]">
        <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-indigo-500"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500"></span>
            </div>
        </div>
    </div>
);

const AppContent = () => {
    const { isDarkMode } = useDarkMode();

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <NotificationProvider>
                    <NotificationToast />
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route element={<PublicRoute />}>
                                <Route path="/login" element={<Login />} />
                            </Route>
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/" element={<Home menuItems={allApplicationRoutes} />} />
                            <Route element={<AppLayout routes={allApplicationRoutes} />}>
                                <Route path="/stats-link" element={<StatisticsDashboard />} />
                                <Route path="/products" element={<ProductList />} />
                                <Route path="/add-products" element={<ProductForm productId={undefined} isFromPurchaseInvoice={false} handleClose={undefined} />} />
                                <Route path="/sales-invoices" element={<SalesInvoiceList />} />
                                <Route path="/purchase-invoices" element={<PurchaseInvoiceList />} />
                                <Route path="/sales-orders" element={<SalesOrderList />} />
                                <Route path="/purchase-orders" element={<PurchaseOrderList />} />
                                <Route path="/sales-lines-invoice" element={<SalesInvoiceLines />} />
                                <Route path="/purchase-lines-invoice" element={<PuchasesInvoiceLines />} />
                                <Route path="/sales-lines-order" element={<SalesOrderLines />} />
                                <Route path="/purchase-lines-order" element={<PuchasesOrderLines />} />
                                <Route path="/add-sales-invoice" element={<SalesInvoiceForm />} />
                                <Route path="/add-purchase-invoice" element={<PurchaseInvoiceForm />} />
                                <Route path="/add-sales-order" element={<SalesOrderForm />} />
                                <Route path="/add-purchase-order" element={<PurchaseOrderForm />} />
                                <Route path="/supplarclient-list" element={<SupplierClientList />} />
                                <Route path="/accounts" element={<AccountList />} />
                                <Route path="/accounts/create" element={<AccountList showCreateButtonOnly={true} />} />
                                <Route
                                    path="/CreateAccount"
                                    element={<CreateAccount
                                        userIdToEdit={null}
                                        onSuccess={() => console.log("Compte créé avec succès !")}
                                        onClose={() => console.log("Fermeture du formulaire.")}
                                    />}
                                />
                                <Route path="/profit-report" element={<ProfitReportPage />} />
                                <Route path="/edit-roles/:username" element={<ManageRolesPage />} />
                                <Route path="/security" element={<HomeAccount />} />
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/settings" element={<Settings />} />
                                <Route path="/expired-products" element={<ExpiredProductsList />} />
                                <Route path="/notifications-link" element={<NotificationCenter />} />
                                <Route path="/documentation" element={<DocumentationPage />} />
                            </Route>
                        </Routes>
                    </Suspense>
                </NotificationProvider>
            </BrowserRouter>
        </div>
    );
};

function App() {
    return (
        <DarkModeProvider>
            <GlobalAutoTranslateProvider>
                <AutoTranslateProvider>
                    <AppContent />
                </AutoTranslateProvider>
            </GlobalAutoTranslateProvider>
        </DarkModeProvider>
    );
}

export default App;