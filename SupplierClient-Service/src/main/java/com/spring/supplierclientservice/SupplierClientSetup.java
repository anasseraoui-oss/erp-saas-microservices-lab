package com.spring.supplierclientservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class SupplierClientSetup {

    private static final Logger logger = LoggerFactory.getLogger(SupplierClientSetup.class);

    private final SupplierClientRepository supplierClientRepository;

    @Autowired
    public SupplierClientSetup(SupplierClientRepository supplierClientRepository) {
        this.supplierClientRepository = supplierClientRepository;
    }

    // هذه الدالة ستعمل تلقائياً بعد أن يبدأ التطبيق
    @EventListener(ApplicationReadyEvent.class)
    @Transactional // مهم جداً لضمان أن العملية كلها تحدث كوحدة واحدة
    public void setupInitialSupplierClients() {
        logger.info("Starting initial setup for Supplier/Clients...");

        // إنشاء عميل/مورد افتراضي رقم 1
        createSupplierClientIfNotFound(
                "Default Supplier Inc.",
                "contact@defaultsupplier.com",
                "0511223344"
        );

        // إنشاء عميل/مورد افتراضي رقم 2
        createSupplierClientIfNotFound(
                "Main Customer Co.",
                "sales@maincustomer.com",
                "0655447788"
        );

        // إنشاء عميل/مورد افتراضي رقم 3
        createSupplierClientIfNotFound(
                "Local Services Provider",
                "support@localservices.net",
                "0700102030"
        );

        logger.info("Initial setup for Supplier/Clients finished.");
    }

    /**
     * دالة مساعدة تقوم بإنشاء عميل/مورد فقط إذا لم يكن موجوداً بنفس الاسم.
     * هذا يمنع تكرار البيانات عند إعادة تشغيل التطبيق.
     */private void createSupplierClientIfNotFound(String name, String email, String phoneNumber) {
        // 1. نبحث عن العميل بالاسم. هذه الدالة تُرجع Optional<SupplierClient>
        Optional<SupplierClient> existingClientOptional = Optional.ofNullable(supplierClientRepository.findByName(name));

        // 2. الآن نستخدم ifPresentOrElse على الـ Optional الذي حصلنا عليه
        existingClientOptional.ifPresentOrElse(
                // الجزء الأول: ماذا نفعل إذا كان العميل موجوداً (Optional is present)
                existingClient -> {
                    logger.info("Supplier/Client with name '{}' already exists. Skipping.", name);
                },
                // الجزء الثاني: ماذا نفعل إذا كان العميل غير موجود (Optional is empty)
                () -> {
                    logger.info("Creating new Supplier/Client: {}", name);
                    SupplierClient newClient = new SupplierClient();
                    newClient.setName(name);
                    newClient.setEmail(email);
                    newClient.setPhoneNumber(phoneNumber);
                    // تعيين القيم الافتراضية للحقول الرقمية
                    newClient.setTotalSales(0.0);
                    newClient.setTotalePurchase(0.0);
                    newClient.setBorrowingPriceSales(0.0);
                    newClient.setBorrowingPricePurchase(0.0);

                    // حفظ الكائن الجديد في قاعدة البيانات
                    supplierClientRepository.save(newClient);
                }
        );
    }
}