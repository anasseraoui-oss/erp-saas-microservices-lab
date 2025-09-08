package com.spring.salesorderservice.service.specifications;
import com.spring.salesorderservice.model.*;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class SalesOrderSpecifications {

    public static Specification<SalesOrder> findByCriteria(String query) {
        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // عمل JOIN مع الكيانات المرتبطة للبحث في حقولها
            Join<SalesOrder, Delivery> deliveryJoin = root.join("delivery", JoinType.LEFT);
            Join<SalesOrder, SalesInvoice> invoiceJoin = root.join("invoice", JoinType.LEFT);

            // 1. البحث النصي (وصف وموقع التسليم)
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(deliveryJoin.get("description")), "%" + query.toLowerCase() + "%"));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(deliveryJoin.get("location")), "%" + query.toLowerCase() + "%"));

            // 2. البحث الرقمي
            try {
                Long longQuery = Long.parseLong(query);
                predicates.add(criteriaBuilder.equal(root.get("id"), longQuery));
                predicates.add(criteriaBuilder.equal(root.get("customer"), longQuery));
                predicates.add(criteriaBuilder.equal(invoiceJoin.get("id"), longQuery)); // البحث بمعرف الفاتورة المرتبطة
            } catch (NumberFormatException e) { /* تجاهل */ }

            try {
                Double doubleQuery = Double.parseDouble(query);
                predicates.add(criteriaBuilder.equal(root.get("totalAmount"), doubleQuery));
                predicates.add(criteriaBuilder.equal(root.get("soldAmount"), doubleQuery));
            } catch (NumberFormatException e) { /* تجاهل */ }

            // 3. البحث بالحالة (Enums)
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), paymentStatus));
            } catch (IllegalArgumentException e) { /* تجاهل */ }

            try {
                OrderStatus orderStatus = OrderStatus.valueOf(query.toUpperCase());
                predicates.add(criteriaBuilder.equal(root.get("orderStatus"), orderStatus));
            } catch (IllegalArgumentException e) { /* تجاهل */ }

            // 4. البحث بالتاريخ
            try {
                Date dateQuery = new SimpleDateFormat("yyyy-MM-dd").parse(query);
                predicates.add(criteriaBuilder.equal(root.get("date"), dateQuery));
            } catch (ParseException e) { /* تجاهل */ }

            if (predicates.isEmpty()) {
                return criteriaBuilder.disjunction();
            }

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}