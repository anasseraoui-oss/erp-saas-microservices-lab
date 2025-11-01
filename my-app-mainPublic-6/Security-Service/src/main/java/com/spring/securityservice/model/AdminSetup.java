package com.spring.securityservice.model;

import com.spring.securityservice.repository.PermissionRepository;
import com.spring.securityservice.repository.RoleRepository;
import com.spring.securityservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class AdminSetup {

    private static final Logger logger = LoggerFactory.getLogger(AdminSetup.class);

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Autowired
    public AdminSetup(PasswordEncoder passwordEncoder, UserRepository userRepository, RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialData() {
        logger.info("Starting initial data setup...");

        Permission adminPermission = createPermissionIfNotFound("ADMIN", "Full administrative access");
        Permission searchPermission = createPermissionIfNotFound("SEARCH", "Permission to search various entities");
        Permission userManagementPermission = createPermissionIfNotFound("USER_MANAGEMENT", "Permission to manage users");
        Permission viewProductsPermission = createPermissionIfNotFound("VIEW_PRODUCTS", "Permission to view products");
        Permission createProductsPermission = createPermissionIfNotFound("CREATE_PRODUCTS", "Permission to create products");
        Permission updateProductsPermission = createPermissionIfNotFound("UPDATE_PRODUCTS", "Permission to update products");
        Permission deleteProductsPermission = createPermissionIfNotFound("DELETE_PRODUCTS", "Permission to delete products");
        Permission viewClientsSuppliersPermission = createPermissionIfNotFound("VIEW_CLIENTS_SUPPLIERS", "Permission to view clients and suppliers");
        Permission createClientsSuppliersPermission = createPermissionIfNotFound("CREATE_CLIENTS_SUPPLIERS", "Permission to create clients and suppliers");
        Permission updateClientsSuppliersPermission = createPermissionIfNotFound("UPDATE_CLIENTS_SUPPLIERS", "Permission to update clients and suppliers");
        Permission deleteClientsSuppliersPermission = createPermissionIfNotFound("DELETE_CLIENTS_SUPPLIERS", "Permission to delete clients and suppliers");
        Permission viewSalesInvoicesPermission = createPermissionIfNotFound("VIEW_SALES_INVOICES", "Permission to view sales invoices");
        Permission createSalesInvoicesPermission = createPermissionIfNotFound("CREATE_SALES_INVOICES", "Permission to create sales invoices");
        Permission updateSalesInvoicesPermission = createPermissionIfNotFound("UPDATE_SALES_INVOICES", "Permission to update sales invoices");
        Permission deleteSalesInvoicesPermission = createPermissionIfNotFound("DELETE_SALES_INVOICES", "Permission to delete sales invoices");
        Permission viewSalesOrdersPermission = createPermissionIfNotFound("VIEW_SALES_ORDERS", "Permission to view sales orders");
        Permission createSalesOrdersPermission = createPermissionIfNotFound("CREATE_SALES_ORDERS", "Permission to create sales orders");
        Permission updateSalesOrdersPermission = createPermissionIfNotFound("UPDATE_SALES_ORDERS", "Permission to update sales orders");
        Permission deleteSalesOrdersPermission = createPermissionIfNotFound("DELETE_SALES_ORDERS", "Permission to delete sales orders");
        Permission manageSalesLinesPermission = createPermissionIfNotFound("MANAGE_SALES_LINES", "Permission to manage sales invoice/order lines");
        Permission manageSalesReturnsPermission = createPermissionIfNotFound("MANAGE_SALES_RETURNS", "Permission to manage sales returns");
        Permission viewPurchaseInvoicesPermission = createPermissionIfNotFound("VIEW_PURCHASE_INVOICES", "Permission to view purchase invoices");
        Permission createPurchaseInvoicesPermission = createPermissionIfNotFound("CREATE_PURCHASE_INVOICES", "Permission to create purchase invoices");
        Permission updatePurchaseInvoicesPermission = createPermissionIfNotFound("UPDATE_PURCHASE_INVOICES", "Permission to update purchase invoices");
        Permission deletePurchaseInvoicesPermission = createPermissionIfNotFound("DELETE_PURCHASE_INVOICES", "Permission to delete purchase invoices");
        Permission viewPurchaseOrdersPermission = createPermissionIfNotFound("VIEW_PURCHASE_ORDERS", "Permission to view purchase orders");
        Permission createPurchaseOrdersPermission = createPermissionIfNotFound("CREATE_PURCHASE_ORDERS", "Permission to create purchase orders");
        Permission updatePurchaseOrdersPermission = createPermissionIfNotFound("UPDATE_PURCHASE_ORDERS", "Permission to update purchase orders");
        Permission deletePurchaseOrdersPermission = createPermissionIfNotFound("DELETE_PURCHASE_ORDERS", "Permission to delete purchase orders");
        Permission managePurchaseLinesPermission = createPermissionIfNotFound("MANAGE_PURCHASE_LINES", "Permission to manage purchase invoice/order lines");
        Permission managePurchaseReturnsPermission = createPermissionIfNotFound("MANAGE_PURCHASE_RETURNS", "Permission to manage purchase returns");
        Permission processSalesPaymentsPermission = createPermissionIfNotFound("PROCESS_SALES_PAYMENTS", "Permission to process payments for sales");
        Permission processPurchasePaymentsPermission = createPermissionIfNotFound("PROCESS_PURCHASE_PAYMENTS", "Permission to process payments for purchases");
        Permission viewPaymentHistoryPermission = createPermissionIfNotFound("VIEW_PAYMENT_HISTORY", "Permission to view payment history");
        Permission viewNotificationHistoryPermission = createPermissionIfNotFound("VIEW_NOTIFICATION_HISTORY", "Permission to view notification history");
        Permission saveNotificationHistoryPermission = createPermissionIfNotFound("SAVE_NOTIFICATION_HISTORY", "Permission to save notification history");


        Role adminRole = createRoleIfNotFound("ROLE_ADMIN", Set.of(
                adminPermission, userManagementPermission,
                viewProductsPermission, createProductsPermission, updateProductsPermission, deleteProductsPermission,
                viewClientsSuppliersPermission, createClientsSuppliersPermission, updateClientsSuppliersPermission, deleteClientsSuppliersPermission,
                viewSalesInvoicesPermission, createSalesInvoicesPermission, updateSalesInvoicesPermission, deleteSalesInvoicesPermission,
                viewSalesOrdersPermission, createSalesOrdersPermission, updateSalesOrdersPermission, deleteSalesOrdersPermission,
                manageSalesLinesPermission, manageSalesReturnsPermission,
                viewPurchaseInvoicesPermission, createPurchaseInvoicesPermission, updatePurchaseInvoicesPermission, deletePurchaseInvoicesPermission,
                viewPurchaseOrdersPermission, createPurchaseOrdersPermission, updatePurchaseOrdersPermission, deletePurchaseOrdersPermission,
                managePurchaseLinesPermission, managePurchaseReturnsPermission, processSalesPaymentsPermission,
                processPurchasePaymentsPermission, viewPaymentHistoryPermission,
                viewNotificationHistoryPermission, saveNotificationHistoryPermission
        ));

        Role accountantRole = createRoleIfNotFound("ROLE_ACCOUNTANT", Set.of(
                searchPermission, viewProductsPermission, viewClientsSuppliersPermission,
                viewSalesInvoicesPermission, updateSalesInvoicesPermission, viewSalesOrdersPermission, updateSalesOrdersPermission,
                viewPurchaseInvoicesPermission, updatePurchaseInvoicesPermission, viewPurchaseOrdersPermission, updatePurchaseOrdersPermission,
                processSalesPaymentsPermission, processPurchasePaymentsPermission, viewPaymentHistoryPermission,
                manageSalesReturnsPermission, managePurchaseReturnsPermission
        ));


        createOrUpdateAdminUser("admin@example.com", "Admin User", "admin123", adminRole);
        createDefaultUserIfNotFound("accountant@example.com", "Accountant User", "accountant123", accountantRole);

        logger.info("Initial data setup finished successfully.");
    }

    private Permission createPermissionIfNotFound(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> {
                    logger.info("Creating permission: {}", name);
                    Permission permission = new Permission(name, description);
                    return permissionRepository.save(permission);
                });
    }

    private Role createRoleIfNotFound(String name, Set<Permission> permissions) {
        return roleRepository.findByName(name)
                .map(role -> {
                    boolean needsUpdate = false;
                    for (Permission p : permissions) {
                        if (!role.getPermissions().contains(p)) {
                            role.addPermission(p);
                            needsUpdate = true;
                        }
                    }
                    if (needsUpdate) {
                        logger.info("Updating permissions for existing role: {}", name);
                        return roleRepository.save(role);
                    }
                    return role;
                })
                .orElseGet(() -> {
                    logger.info("Creating role: {}", name);
                    Role role = new Role(name);
                    role.setPermissions(permissions);
                    return roleRepository.save(role);
                });
    }

    private void createDefaultUserIfNotFound(String email, String fullName, String password, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            logger.info("Creating default user: {}", email);
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.getRoles().add(role);
            userRepository.save(user);
        }
    }

    private void createOrUpdateAdminUser(String email, String fullName, String password, Role adminRole) {
        User adminUser = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    logger.info("Creating new Admin user with email: {}", email);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(fullName);
                    // تعيين كلمة المرور فقط عند إنشاء المستخدم الجديد
                    newUser.setPassword(passwordEncoder.encode(password));
                    return newUser;
                });

        // التأكد من أن للمستخدم دور الأدمن
        if (!adminUser.getRoles().contains(adminRole)) {
            logger.info("Adding ADMIN role to user: {}", email);
            adminUser.getRoles().add(adminRole);
        }

        // حفظ المستخدم سواء كان جديداً أو تم تحديث أدواره
        userRepository.save(adminUser);
    }
}