// API Testing Dashboard - Service Configuration
// This file contains all microservice endpoints and configurations

const SERVICES_CONFIG = {
    eureka: {
        name: 'Eureka Server',
        baseUrl: 'http://localhost:8761',
        color: '#FF6B6B',
        endpoints: [
            { method: 'GET', path: '/eureka/apps', description: 'Get all registered services' }
        ]
    },
    gateway: {
        name: 'Gateway Service',
        baseUrl: 'http://localhost:9055',
        color: '#4ECDC4',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' }
        ]
    },
    notification: {
        name: 'Notification Service',
        baseUrl: 'http://localhost:9000',
        color: '#95E1D3',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/notifications', description: 'Get all notifications' },
            { method: 'POST', path: '/notifications', description: 'Create notification' }
        ]
    },
    product: {
        name: 'Product Service',
        baseUrl: 'http://localhost:8031',
        color: '#F38181',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/api/products', description: 'Get all products' },
            { method: 'GET', path: '/api/products/{id}', description: 'Get product by ID' },
            { method: 'POST', path: '/api/products', description: 'Create product' },
            { method: 'PUT', path: '/api/products/{id}', description: 'Update product' },
            { method: 'DELETE', path: '/api/products/{id}', description: 'Delete product' },
            { method: 'GET', path: '/api/products/expired', description: 'Get expired products' }
        ]
    },
    payment: {
        name: 'Payment Service',
        baseUrl: 'http://localhost:8035',
        color: '#AA96DA',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/payment', description: 'Get all payments' },
            { method: 'POST', path: '/payment', description: 'Create payment' },
            { method: 'GET', path: '/payment/{id}', description: 'Get payment by ID' }
        ],
        feignClients: ['Sales-Order-Service', 'Purchase-Order-Service', 'SupplierClient-Service']
    },
    purchaseOrder: {
        name: 'Purchase Order Service',
        baseUrl: 'http://localhost:8033',
        color: '#FCBAD3',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/purchases', description: 'Get all purchase orders' },
            { method: 'POST', path: '/purchases', description: 'Create purchase order' },
            { method: 'GET', path: '/purchases/{id}', description: 'Get purchase order by ID' },
            { method: 'GET', path: '/purchases/Invoice', description: 'Get purchase invoices' },
            { method: 'POST', path: '/purchases/Invoice', description: 'Create purchase invoice' }
        ],
        feignClients: ['Product-Service', 'Payment-Service', 'SupplierClient-Service']
    },
    salesOrder: {
        name: 'Sales Order Service',
        baseUrl: 'http://localhost:8032',
        color: '#FFFFD2',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/sales', description: 'Get all sales orders' },
            { method: 'POST', path: '/sales', description: 'Create sales order' },
            { method: 'GET', path: '/sales/{id}', description: 'Get sales order by ID' },
            { method: 'GET', path: '/sales/Invoice', description: 'Get sales invoices' },
            { method: 'POST', path: '/sales/Invoice', description: 'Create sales invoice' }
        ],
        feignClients: ['Product-Service', 'Payment-Service', 'SupplierClient-Service']
    },
    security: {
        name: 'Security Service',
        baseUrl: 'http://localhost:8081',
        color: '#A8D8EA',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'POST', path: '/auth/login', description: 'User login' },
            { method: 'POST', path: '/auth/register', description: 'User registration' },
            { method: 'GET', path: '/users', description: 'Get all users' },
            { method: 'GET', path: '/roles', description: 'Get all roles' },
            { method: 'GET', path: '/permissions', description: 'Get all permissions' }
        ]
    },
    supplier: {
        name: 'Supplier Client Service',
        baseUrl: 'http://localhost:8034',
        color: '#FFB6B9',
        endpoints: [
            { method: 'GET', path: '/actuator/health', description: 'Health check' },
            { method: 'GET', path: '/SupplierClients', description: 'Get all suppliers' },
            { method: 'POST', path: '/SupplierClients', description: 'Create supplier' },
            { method: 'GET', path: '/SupplierClients/{id}', description: 'Get supplier by ID' }
        ]
    }
};

// Feign Communication Map
const FEIGN_COMMUNICATIONS = {
    'Sales-Order-Service': {
        calls: [
            { target: 'Product-Service', path: '/api/products', purpose: 'Check stock availability' },
            { target: 'Payment-Service', path: '/payment', purpose: 'Process payment' },
            { target: 'SupplierClient-Service', path: '/SupplierClients', purpose: 'Get supplier info' }
        ]
    },
    'Purchase-Order-Service': {
        calls: [
            { target: 'Product-Service', path: '/api/products', purpose: 'Update stock' },
            { target: 'Payment-Service', path: '/payment', purpose: 'Record payment' },
            { target: 'SupplierClient-Service', path: '/SupplierClients', purpose: 'Link supplier' }
        ]
    },
    'Payment-Service': {
        calls: [
            { target: 'Sales-Order-Service', path: '/sales/Invoice', purpose: 'Update sales invoice' },
            { target: 'Purchase-Order-Service', path: '/purchases/Invoice', purpose: 'Update purchase invoice' },
            { target: 'SupplierClient-Service', path: '/SupplierClients', purpose: 'Supplier payment info' }
        ]
    }
};

// Test Scenarios
const TEST_SCENARIOS = {
    salesOrderFlow: {
        name: 'Complete Sales Order Flow',
        description: 'Create sales order with product check, payment, and supplier verification',
        steps: [
            { service: 'salesOrder', endpoint: 'POST /sales', description: 'Create sales order' },
            { service: 'product', endpoint: 'GET /api/products/{id}', description: 'Check product stock (Feign)' },
            { service: 'payment', endpoint: 'POST /payment', description: 'Process payment (Feign)' },
            { service: 'supplier', endpoint: 'GET /SupplierClients/{id}', description: 'Get supplier info (Feign)' }
        ]
    },
    purchaseOrderFlow: {
        name: 'Complete Purchase Order Flow',
        description: 'Create purchase order with product update, payment, and supplier link',
        steps: [
            { service: 'purchaseOrder', endpoint: 'POST /purchases', description: 'Create purchase order' },
            { service: 'product', endpoint: 'PUT /api/products/{id}', description: 'Update product stock (Feign)' },
            { service: 'payment', endpoint: 'POST /payment', description: 'Record payment (Feign)' },
            { service: 'supplier', endpoint: 'GET /SupplierClients/{id}', description: 'Link supplier (Feign)' }
        ]
    }
};
