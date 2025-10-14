package com.spring.purchaseorderservice.service.specifications;
import com.spring.purchaseorderservice.model.Delivery; // استيراد ضروري للـ Join
import com.spring.purchaseorderservice.model.OrderStatus;
import com.spring.purchaseorderservice.model.PaymentStatus;
import com.spring.purchaseorderservice.model.PurchaseOrder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class PurchaseOrderSpecifications {

    public static Specification<PurchaseOrder> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<PurchaseOrder, Delivery> deliveryJoin = root.join("delivery", JoinType.LEFT); // نستخدم LEFT JOIN لضمان عدم استبعاد الطلبات التي لا تملك delivery


            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(deliveryJoin.get("description")), "%" + query.toLowerCase() + "%"));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(deliveryJoin.get("location")), "%" + query.toLowerCase() + "%"));
            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery)); // البحث بمعرف الطلب
                predicates.add(criteriaBuilder.equal(root.get("supplierId"), longQuery)); // البحث بمعرف المورد
            } catch (NumberFormatException e) {
                // ليس رقم Long، نتجاهل هذا البحث ونكمل
            }

            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("totalAmount"), doubleQuery)); // البحث بالمبلغ الإجمالي
                predicates.add(criteriaBuilder.equal(root.get("soldAmount"), doubleQuery)); // البحث بالمبلغ المباع
            } catch (NumberFormatException e) {
                // ليس رقم Double، نتجاهل هذا البحث ونكمل
            }

            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            } catch (IllegalArgumentException e) {
                // ليس حالة دفع صالحة، نتجاهل ونكمل
            }

            try {
                OrderStatus orderStatus = OrderStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("orderStatus"), orderStatus));
            } catch (IllegalArgumentException e) {
                // ليس حالة طلب صالحة، نتجاهل ونكمل
            }

            // --- 4.  (Date Search) ---
            try {
                // نحدد التنسيق المتوقع للتاريخ، مثلاً "yyyy-MM-dd"
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
                Date dateQuery = dateFormat.parse(query);
                predicates.add(criteriaBuilder.equal(root.get("date"), dateQuery));
            } catch (ParseException e) {
                //
            }

            if (predicates.isEmpty()) {
                // criteriaBuilder.disjunction() هو طريقة ذكية لإنشاء شرط "false" دائمًا (مثل WHERE 1=0)
                return criteriaBuilder.disjunction();
            }
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}