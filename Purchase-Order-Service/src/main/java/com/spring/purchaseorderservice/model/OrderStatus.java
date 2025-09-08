package com.spring.purchaseorderservice.model;

public enum OrderStatus {
    PENDING,       // قيد الانتظار (تم الإنشاء لكن لم يتم التأكيد بعد)
    CONFIRMED,     // تم تأكيد الطلبية من قبل البائع
    SHIPPED,       // تم شحن الطلبية إلى العميل
    DELIVERED,     // تم تسليم الطلبية إلى العميل
    CANCELED,      // تم إلغاء الطلبية
    RETURNED,      // تم إرجاع الطلبية أو بعض المنتجات
}
