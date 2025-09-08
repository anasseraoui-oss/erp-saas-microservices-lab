import {
    FaShoppingCart,
    FaPlus,
    FaListAlt,
    FaClipboardList,
    FaBox,
    FaUsers,
    FaUserTie,
    FaHome,
    FaCog,
    FaChartBar,
    FaBell
} from 'react-icons/fa';
import {RouteCategory} from "../../App";
import {MdSecurity} from "react-icons/md";
export const allApplicationRoutes: RouteCategory[] = [
    {
        category: "General",
        items: [
            { name: "Dashboard", link: "/", icon: FaHome },
            { name: "Statistics", link: "/stats", icon: FaChartBar },
            { name: "Notification History", link: "/notifications", icon: FaBell}
        ]
    },
    {
        category: "Invoices",
        items: [
            { name: "Sales Invoices", icon: FaShoppingCart, link: "/sales-invoices" },
            { name: "Add Sales Invoice", icon: FaPlus, link: "/add-sales-invoice" },
            { name: "Sales Lines", icon: FaListAlt, link: "/sales-lines-invoice" },
            { name: "Purchase Invoices", icon: FaClipboardList, link: "/purchase-invoices" },
            { name: "Add Purchase Invoice", icon: FaPlus, link: "/add-purchase-invoice" },
            { name: "Purchase Lines", icon: FaListAlt, link: "/purchase-lines-invoice" },
        ],
    },
    {
        category: "Orders",
        items: [
            { name: "Sales Orders", icon: FaShoppingCart, link: "/sales-orders" },
            { name: "Add Sales Order", icon: FaPlus, link: "/add-sales-order" },
            { name: "Sales Lines Orders", icon: FaListAlt, link: "/sales-lines-order" },
            { name: "Purchase Orders", icon: FaClipboardList, link: "/purchase-orders" },
            { name: "Add Purchase Order", icon: FaPlus, link: "/add-purchase-order" },
            { name: "Purchase Lines Orders", icon: FaListAlt, link: "/purchase-lines-order" },
        ],
    },
    {
        category: "Management",
        items: [
            { name: "Products", icon: FaBox, link: "/products" },
            { name: "Add Products", icon: FaPlus, link: "/add-products" },
            { name: "Customers", icon: FaUsers, link: "/supplarclient-list?type=customer" },
            { name: "Suppliers", icon: FaUserTie, link: "/supplarclient-list?type=supplier" },
            { name: "Expired Products List", icon: FaClipboardList, link: "/expired-products"},
            { name: "Settings", link: "/settings", icon: FaCog },
        ],
    },
    {
        category: "Accounts",
        items: [
            { name: "Users", icon: FaUsers, link: "/accounts" },
            { name: "Add User", icon: FaPlus, link: "/accounts/create" },
            { name: "Security", link: "/security", icon: MdSecurity },
        ],
    },
];