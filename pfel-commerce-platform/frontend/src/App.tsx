// Import your components
import ProductList from './components/product/ProductList';
// ... import all other components
import Home from "./components/Home";
import Login from "./components/basec/Login";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// --- THE FIX: IMPORT ICONS AND THE HELPER TYPES ---
import { DarkModeProvider } from './components/DarkModeProvider';
import Logout from './components/basec/Logout';
import { Navbar } from 'react-bootstrap';
import ProductForm from './components/product/ProductForme';
import SalesInvoiceList from './components/salesInvoice/SalesInvoiceList';
import PurchaseInvoiceList from './components/purchaseInvoice/PurchaseInvoiceList';
import SalesOrderList from './components/salesInvoice/SalesOrderList';
import SalesInvoiceLines from './components/salesInvoice/SalesInvoiceLines';
import SalesOrderLines from './components/salesInvoice/SalesOrderLines';
import SalesInvoiceForm from './components/salesInvoice/SalesInvoiceForm';
import PurchaseOrderForm from "./components/purchaseInvoice/PurchaseOrderForm";
import SupplierClientList from './components/supplierClient/SupplierClientList';
import AccountList from './components/Scrty/AccountList';
import CreateAccount from './components/Scrty/CreateAccount';
import PuchasesOrderLines from "./components/purchaseInvoice/PuchasesOrderLines";
import AppLayout from "./components/buildMenuHome/AppLayout";
// ========== ALL IMPORTS NOW AT THE TOP ==========
import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { type IconType } from 'react-icons';
import {allApplicationRoutes} from "./components/buildMenuHome/y";
import ManageRolesPage from "./components/Scrty/ManageRolesPage";
import SalesOrderForm from "./components/salesInvoice/SalesOrderForm";
import PurchaseInvoiceForm from "./components/purchaseInvoice/PurchaseInvoiceForm";
//import styles from './App.module.css';
import PuchasesInvoiceLines from "./components/purchaseInvoice/PuchasesInvoiceLines";
import HomeAccount from "./components/Scrty/HomeAccount";
import DashboardPage from "./components/Scrty/DashboardPage";
import StatisticsDashboard from "./components/statistics/StatisticsDashboard";
import PublicRoute from "./components/basec/PublicRoute";
import Settings from './components/Settings';
import TranslatedElement from "./components/TranslatedElement";
import {AutoTranslateProvider} from "./components/AutoTranslateProvider";
import NotificationToast from "./components/Notification/NotificationToast";
import {NotificationProvider} from "./components/Notification/NotificationContext";
import ExpiredProductsList from "./components/basec/invoice/ExpiredProduct/ExpiredProductsList";
import PurchaseOrderList from "./components/purchaseInvoice/PurchaseOrderList";
import NotificationCenter from "./components/Notification/NotificationCenter";
// Import your centralized route data
import './i18n';
import GlobalAutoTranslateProvider from "./components/GlobalAutoTranslate";

export interface RouteItem {
    name: string;
    icon: IconType;
    link: string;
}

export interface RouteCategory {
    category: string;
    items: RouteItem[];
}

function App() {
    return (
        // Apply the container class from our CSS module
        // <div className={styles.container}>
        <div>
            <DarkModeProvider>
            <GlobalAutoTranslateProvider>
            <AutoTranslateProvider>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <NotificationProvider>
                            <NotificationToast />
                            <Routes>
                                <Route element={<PublicRoute />}>
                                    <Route path="/login" element={<Login />} />
                                </Route>
                                <Route path="/logout" element={<Logout />} />
                                <Route path="/" element={<Home menuItems={allApplicationRoutes} />} />
                                <Route element={<TranslatedElement element={<AppLayout routes={allApplicationRoutes} />} />}>
                                    <Route path="/stats" element={<StatisticsDashboard/>}/>
                                    <Route path="/navbar" element={<Navbar/>}/>
                                    <Route path="/products" element={<ProductList />} />
                                    <Route path="/add-products" element={<ProductForm productId={undefined} isFromPurchaseInvoice={false} handleClose={undefined} />} />
                                    <Route path="/sales-invoices" element={<SalesInvoiceList />} />
                                    <Route path="/purchase-invoices" element={<PurchaseInvoiceList />} />
                                    <Route path="/sales-orders" element={<SalesOrderList />} />
                                    <Route path="/purchase-orders" element={<PurchaseOrderList />} />
                                    <Route path="/sales-lines-invoice" element={<SalesInvoiceLines />} />
                                    <Route path="/purchase-lines-invoice" element={<PuchasesInvoiceLines />} />
                                    <Route path="/sales-lines-order" element={<SalesOrderLines/>} />
                                    <Route path="/purchase-lines-order" element={<PuchasesOrderLines />} />
                                    <Route path="/add-sales-invoice" element={<SalesInvoiceForm />} />
                                    <Route path="/add-purchase-invoice" element={<PurchaseInvoiceForm />} />
                                    <Route path="/add-sales-order" element={<SalesOrderForm />} />
                                    <Route path="/add-purchase-order" element={<PurchaseOrderForm />} />
                                    <Route path="/supplarclient-list" element={<SupplierClientList />} />
                                    <Route path="/accounts" element={<AccountList />} />
                                    <Route
                                        path="/accounts/create"
                                        element={<AccountList showCreateButtonOnly={true} />}
                                    />
                                    <Route
                                        path="/CreateAccount"
                                        element={<CreateAccount
                                            userIdToEdit={null}
                                            onSuccess={() => console.log("Compte créé avec succès !")}
                                            onClose={() => console.log("Fermeture du formulaire.")}
                                        />}
                                    />
                                    <Route path="/edit-roles/:username" element={<ManageRolesPage />} />
                                    <Route path="/security" element={<HomeAccount/>}/>
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/settings" element={<Settings/>} />
                                    <Route path="/expired-products" element={<ExpiredProductsList/>}/>
                                    <Route path="/notifications" element={<NotificationCenter/>}/>
                                </Route>
                            </Routes>
                        </NotificationProvider>
                    </BrowserRouter>
                </AutoTranslateProvider>
            </GlobalAutoTranslateProvider>
            </DarkModeProvider>
        </div>
    );
}

// @ts-ignore
export default App;
