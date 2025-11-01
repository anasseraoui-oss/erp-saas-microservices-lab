// ====================================================================
// --- SUB-COMPONENT 1: Dashboard Sidebar ---
// ====================================================================
import {CSSProperties} from "react";
import {getActiveButton, styles, StyleSet} from "./basec";
import {BarChart3, Package, Users, TrendingUp} from "lucide-react";
import {useGlobalDarkMode} from "../hook/useGlobalDarkMode";

interface DashboardSidebarProps {
    selectedStatistic: string;
    onSelectStatistic: (stat: string) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ selectedStatistic, onSelectStatistic }) => {
    // Add this single line - no other changes needed
    useGlobalDarkMode();

    const sidebarStyles: StyleSet = {
        sidebar: {
            width: '280px',
            backgroundColor: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border-color)',
            padding: '24px',
            overflowY: 'auto',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        },
        sidebarHeader: { marginBottom: '32px' },
        h1: {
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 8px 0',
            color: 'var(--text-primary)',
            transition: 'color 0.3s ease'
        },
        pSubtle: {
            color: 'var(--text-secondary)',
            margin: '0',
            fontSize: '14px',
            transition: 'color 0.3s ease'
        },
        sidebarNav: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }
    };

    const getActiveSidebarItem = (isActive: boolean): CSSProperties => ({
        ...getActiveButton(isActive),
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        textAlign: 'left',
        marginBottom: '8px',
        transition: 'all 0.3s ease'
    });

    return (
        <div style={sidebarStyles.sidebar}>
            <div style={sidebarStyles.sidebarHeader}>
                <h1 style={sidebarStyles.h1}>Statistics</h1>
                <p style={sidebarStyles.pSubtle}>Business Intelligence Dashboard</p>
            </div>
            <div>
                <h3 style={styles.h3}>Available Statistics</h3>
                <div style={sidebarStyles.sidebarNav}>
                    <button
                        onClick={() => onSelectStatistic('invoices-orders')}
                        style={getActiveSidebarItem(selectedStatistic === 'invoices-orders')}
                    >
                        <BarChart3 size={20} />
                        <span>Invoices & Orders</span>
                    </button>
                    <button
                        onClick={() => onSelectStatistic('payment-invoices-orders')}
                        style={getActiveSidebarItem(selectedStatistic === 'payment-invoices-orders')}
                    >
                        <BarChart3 size={20} />
                        <span>Payment</span>
                    </button>
                    <button
                        onClick={() => onSelectStatistic('advanced-payment-stats')}
                        style={getActiveSidebarItem(selectedStatistic === 'advanced-payment-stats')}
                    >
                        <TrendingUp size={20} />
                        <span>Advanced Payment</span>
                    </button>
                    <button
                        onClick={() => onSelectStatistic('suppliers-clients')}
                        style={getActiveSidebarItem(selectedStatistic === 'suppliers-clients')}
                    >
                        <Users size={20} />
                        <span>Suppliers & Clients</span>
                    </button>
                    <button
                        onClick={() => onSelectStatistic('products')}
                        style={getActiveSidebarItem(selectedStatistic === 'products')}
                    >
                        <Package size={20} />
                        <span>Product Analysis</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;